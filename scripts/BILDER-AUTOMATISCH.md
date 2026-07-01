# Bilder automatisch laden (einfach!)

Statt 1000 Produkte selbst zu fotografieren, kannst du Bilder **automatisch** aus **Open Food Facts** laden.

Das ist eine **kostenlose** Datenbank mit Fotos von Supermarkt-Produkten (von Nutzer:innen hochgeladen). Perfekt für dein Ratespiel.

Website: https://de.openfoodfacts.org

---

## Einmalige Installation (Windows)

1. **Python installieren** (falls noch nicht da): https://www.python.org/downloads/  
   → Haken bei **„Add Python to PATH“** setzen!

2. Terminal im Projektordner öffnen (`cmd` in die Adresszeile des Ordners tippen)

3. Pakete installieren:

```powershell
pip install -r requirements.txt
```

---

## Variante 1: Die 20 Standard-Produkte laden

```powershell
python scripts/bilder-laden.py
```

Das Skript:
- sucht jedes Produkt auf Open Food Facts
- lädt das Packungsfoto runter
- schneidet es auf **300×300** zu
- speichert es als `images/oatly-barista.jpg` usw.

Danach in `js/products.js` bei jedem Produkt `.svg` durch `.jpg` ersetzen:

```javascript
image: "images/oatly-barista.jpg",
```

---

## Variante 2: Viele Produkte auf einmal (z.B. 100)

```powershell
python scripts/bilder-laden.py --bulk 100
```

- Lädt **100 vegane Produkte** aus Deutschland
- Speichert Bilder als `images/bulk-....jpg`
- Erstellt `scripts/bulk-produkte.json` mit allen Einträgen
- Diese Einträge kannst du in `js/products.js` kopieren

Für **1000 Produkte**:

```powershell
python scripts/bilder-laden.py --bulk 1000
```

Das dauert eine Weile (ca. 15–30 Min.), weil zwischen Anfragen pausiert wird.

---

## Wenn ein Bild falsch oder fehlt

1. In `scripts/produkte-quelle.json` den **Suchbegriff** anpassen
2. Skript nochmal starten

Beispiel – genauerer Suchbegriff:

```json
{
  "datei": "oatly-barista",
  "suche": "oatly barista edition 1l",
  "marke": "Oatly",
  "produkt": "Haferdrink Barista Edition"
}
```

---

## Barcode direkt nutzen (100 % treffsicher)

Wenn du den **Strichcode** (EAN) vom Produkt hast:

1. Auf https://de.openfoodfacts.org suchen
2. Barcode in `produkte-quelle.json` eintragen (optional, falls wir das erweitern)

Oder Produkt im Supermarkt mit einer Barcode-App scannen.

---

## Rechtliches (kurz)

Open Food Facts Bilder sind unter **Creative Commons** (frei nutzbar mit Namensnennung).

Auf deiner Website unten einfügen:

> Produktbilder © Open Food Facts contributors, lizenziert unter CC BY-SA

---

## Übersicht: Welche Methode wann?

| Anzahl Produkte | Methode |
|-----------------|---------|
| 20 (Start) | `python scripts/bilder-laden.py` |
| 50–200 | `--bulk 100` |
| 500–1000+ | `--bulk 1000` + `bulk-produkte.json` in products.js |

**Du musst nie 1000 Fotos selbst machen.** 🎉
