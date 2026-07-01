#!/usr/bin/env python3
"""
Bilder automatisch von Open Food Facts laden.

Open Food Facts = kostenlose Datenbank mit Supermarkt-Produktfotos.
https://de.openfoodfacts.org

Installation (einmalig):
    pip install pillow requests

Standard (20 Produkte aus produkte-quelle.json):
    python scripts/bilder-laden.py

Viele Produkte auf einmal (z.B. 100 vegane aus Deutschland):
    python scripts/bilder-laden.py --bulk 100

Hilfe:
    python scripts/bilder-laden.py --help
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from io import BytesIO
from pathlib import Path

import requests
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGES_DIR = ROOT / "images"
SOURCE_FILE = Path(__file__).resolve().parent / "produkte-quelle.json"
BULK_OUTPUT = ROOT / "scripts" / "bulk-produkte.json"

USER_AGENT = "SubstitutleGame/1.0 (https://github.com/leonardwolf23-bot/Guesser-Game)"
SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl"
PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
MAX_RETRIES = 4


def api_get(url: str, params: dict | None = None) -> requests.Response:
    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(
                url,
                params=params,
                headers={"User-Agent": USER_AGENT},
                timeout=30,
            )
            if response.status_code in (429, 503):
                wait = 2 ** attempt
                print(f"  … Server beschäftigt, warte {wait}s")
                time.sleep(wait)
                continue
            response.raise_for_status()
            return response
        except requests.RequestException as error:
            last_error = error
            time.sleep(2 ** attempt)
    raise last_error  # type: ignore[misc]


def fetch_by_barcode(barcode: str) -> dict | None:
    response = api_get(PRODUCT_URL.format(barcode=barcode))
    data = response.json()
    product = data.get("product")
    if not product:
        return None
    product["code"] = barcode
    return product


def search_product(query: str, country: str = "germany") -> dict | None:
    def run_search(use_country: bool) -> list[dict]:
        params = {
            "search_terms": query,
            "search_simple": 1,
            "action": "process",
            "json": 1,
            "page_size": 10,
            "fields": "product_name,brands,code,image_front_url,image_url",
        }
        if use_country:
            params.update(
                {
                    "tagtype_0": "countries",
                    "tag_contains_0": "contains",
                    "tag_0": country,
                }
            )
        response = api_get(SEARCH_URL, params=params)
        return response.json().get("products", [])

    for product in run_search(use_country=True):
        if product.get("image_front_url") or product.get("image_url"):
            return product

    for product in run_search(use_country=False):
        if product.get("image_front_url") or product.get("image_url"):
            return product

    return None


def slugify(text: str) -> str:
    text = text.lower()
    text = text.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:60] or "produkt"


def get_image_url(product: dict) -> str | None:
    url = product.get("image_front_url") or product.get("image_url")
    if not url:
        return None
    # Höhere Auflösung anfordern
    url = re.sub(r"\.(\d+)\.jpg$", r".full.jpg", url)
    if not url.endswith(".jpg"):
        url = url + ".full.jpg"
    return url


def download_and_resize(url: str, output_path: Path, size: int = 300) -> None:
    response = api_get(url)
    response.raise_for_status()

    image = Image.open(BytesIO(response.content)).convert("RGB")
    width, height = image.size
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    image = image.crop((left, top, left + side, top + side))
    image = image.resize((size, size), Image.LANCZOS)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, quality=90, optimize=True)


def load_source_list() -> list[dict]:
    with open(SOURCE_FILE, encoding="utf-8") as f:
        return json.load(f)


def download_from_source_list(delay: float = 1.0) -> list[dict]:
    items = load_source_list()
    results = []

    print(f"Lade {len(items)} Produkte von Open Food Facts …\n")

    for index, item in enumerate(items, start=1):
        query = item["suche"]
        filename = item["datei"]
        output = IMAGES_DIR / f"{filename}.jpg"

        print(f"[{index}/{len(items)}] {item['marke']} – {item['produkt']}")
        print(f"  Suche: {query}")

        try:
            if item.get("barcode"):
                product = fetch_by_barcode(str(item["barcode"]))
            else:
                product = search_product(query)
            if not product:
                print("  ✗ Kein Bild gefunden – Platzhalter bleibt aktiv\n")
                results.append({**item, "status": "not_found"})
                time.sleep(delay)
                continue

            image_url = get_image_url(product)
            if not image_url:
                print("  ✗ Produkt gefunden, aber ohne Bild\n")
                results.append({**item, "status": "no_image"})
                time.sleep(delay)
                continue

            download_and_resize(image_url, output)
            found_name = product.get("product_name", "?")
            print(f"  ✓ Gespeichert: {output.name}")
            print(f"    Gefunden: {found_name}\n")
            results.append(
                {
                    **item,
                    "status": "ok",
                    "image": f"images/{filename}.jpg",
                    "off_name": found_name,
                    "barcode": product.get("code"),
                }
            )
        except Exception as error:
            print(f"  ✗ Fehler: {error}\n")
            results.append({**item, "status": "error", "error": str(error)})

        time.sleep(delay)

    return results


def bulk_download(count: int, delay: float = 1.0) -> list[dict]:
    """Lädt viele vegane Produkte aus Deutschland."""
    print(f"Suche {count} vegane Produkte aus Deutschland …\n")

    collected: list[dict] = []
    page = 1
    page_size = min(50, count)

    while len(collected) < count:
        params = {
            "action": "process",
            "json": 1,
            "page": page,
            "page_size": page_size,
            "tagtype_0": "labels",
            "tag_contains_0": "contains",
            "tag_0": "vegan",
            "tagtype_1": "countries",
            "tag_contains_1": "contains",
            "tag_1": "germany",
            "fields": "product_name,brands,code,image_front_url,image_url,categories_tags",
        }

        response = api_get(SEARCH_URL, params=params)
        data = response.json()
        products = data.get("products", [])

        if not products:
            break

        for product in products:
            if len(collected) >= count:
                break

            image_url = get_image_url(product)
            brand = (product.get("brands") or "Unbekannt").split(",")[0].strip()
            name = (product.get("product_name") or "Unbekannt").strip()
            barcode = product.get("code")

            if not image_url or not barcode:
                continue

            # Fleischersatz & Milchalternativen bevorzugen
            categories = " ".join(product.get("categories_tags") or [])
            keywords = (
                "meat", "burger", "hack", "wurst", "chicken", "cheese", "milk",
                "drink", "oat", "tofu", "plant", "vegan", "nugget", "patty",
            )
            if not any(k in categories for k in keywords):
                continue

            file_slug = slugify(f"{brand}-{name}")
            output = IMAGES_DIR / f"bulk-{file_slug}.jpg"

            if output.exists():
                continue

            try:
                download_and_resize(image_url, output)
                entry = {
                    "brand": brand,
                    "product": name,
                    "image": f"images/{output.name}",
                    "barcode": barcode,
                    "aliases": {"brand": [brand.lower()], "product": [name.lower()]},
                }
                collected.append(entry)
                print(f"[{len(collected)}/{count}] {brand} – {name}")
            except Exception as error:
                print(f"  Übersprungen ({error})")

            time.sleep(delay)

        page += 1

    with open(BULK_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(collected, f, ensure_ascii=False, indent=2)

    print(f"\nFertig! {len(collected)} Bilder in images/")
    print(f"Produktliste: {BULK_OUTPUT}")
    print("Tipp: Einträge aus bulk-produkte.json in js/products.js kopieren.")
    return collected


def print_products_js_snippet(results: list[dict]) -> None:
    ok = [r for r in results if r.get("status") == "ok"]
    if not ok:
        return
    print("\n--- Kopieren für js/products.js (image-Zeilen) ---")
    for item in ok:
        print(f'{item["marke"]} / {item["produkt"]}: image: "{item["image"]}",')


def main() -> int:
    parser = argparse.ArgumentParser(description="Produktbilder von Open Food Facts laden")
    parser.add_argument(
        "--bulk",
        type=int,
        metavar="N",
        help="N vegane Produkte aus Deutschland automatisch laden (z.B. 100)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=1.0,
        help="Pause zwischen Anfragen in Sekunden (Standard: 1)",
    )
    args = parser.parse_args()

    try:
        if args.bulk:
            bulk_download(args.bulk, delay=args.delay)
        else:
            results = download_from_source_list(delay=args.delay)
            ok_count = sum(1 for r in results if r.get("status") == "ok")
            print(f"\nFertig: {ok_count}/{len(results)} Bilder geladen.")
            print_products_js_snippet(results)
            print("\nVergiss nicht: In js/products.js .svg durch .jpg ersetzen!")
    except requests.RequestException as error:
        print(f"\nNetzwerkfehler: {error}")
        print("Tipp: Später nochmal versuchen oder --delay 2 setzen.")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
