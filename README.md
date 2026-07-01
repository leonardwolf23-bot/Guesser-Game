# Substitutle 🌱

Ein einfaches Ratespiel: Errate die **Marke** und das **vegane Ersatzprodukt** am verpixelten Bild.

- Kein npm, kein Build, keine Anmeldung
- Funktioniert als normale Website (auch am Handy)
- Mit jedem Versuch wird das Bild **schärfer** und **bunter**

---

## Schnellstart (lokal testen)

### Option A: Mit Python (empfohlen)

Öffne ein Terminal im Projektordner und starte:

```bash
python3 -m http.server 8000
```

Dann im Browser öffnen: **http://localhost:8000**

### Option B: Mit Node.js

```bash
npx serve .
```

Dann die angezeigte Adresse im Browser öffnen.

> **Warum ein kleiner Server?** Browser blockieren manchmal Dateien bei `file://`. Ein lokaler Server vermeidet das.

---

## Ordnerstruktur

```
Substitutle/
├── index.html          ← Hauptseite (nicht anfassen, außer Titel ändern)
├── css/style.css       ← Farben & Design
├── js/
│   ├── products.js     ← ★ HIER Produkte eintragen
│   └── game.js         ← Spiel-Logik (normalerweise nicht ändern)
└── images/             ← ★ HIER Produktbilder ablegen (300×300 px)
```

---

## Bilder einfügen

**Vollständige Liste aller 20 Produkte:** siehe [`images/BILDER-LISTE.md`](images/BILDER-LISTE.md)

Kurzversion:
1. Foto (300×300 px) in `images/` speichern
2. In `js/products.js` den `image`-Pfad anpassen
3. Browser neu laden

Enthalten sind u.a. Rügenwalder, Billie Green (REWE), Vemondo (Lidl), MyVay (Aldi), Oatly, Beyond Meat, Like Meat, Garden Gourmet, Planted, Simply V und mehr.

---

## Neues Produkt hinzufügen (3 Schritte)

### 1. Bild besorgen

- Größe: **300 × 300 Pixel** (PNG oder JPG)
- Am besten: Packshot von vorne, einheitlicher Hintergrund
- Datei in den Ordner `images/` legen, z. B. `images/meine-marke.png`

### 2. Eintrag in `js/products.js`

Öffne `js/products.js` und füge einen neuen Block in die Liste ein:

```javascript
{
  brand: "Meine Marke",
  product: "Produktname Genau So",
  image: "images/meine-marke.png",
  aliases: {
    brand: ["meine marke", "alternative schreibweise"],
    product: ["kurzname", "wie leute es nennen"]
  }
},
```

**aliases** = alternative Schreibweisen, die auch als richtig gelten (z. B. „Hafermilch“ statt „Haferdrink“).

### 3. Seite neu laden

Fertig. Das neue Produkt ist automatisch im Pool für die täglichen Rätsel.

---

## Wie das tägliche Rätsel funktioniert

- Jeden Tag gibt es **ein** Produkt aus der Liste
- Welches Produkt kommt, hängt vom **Datum** ab (alle spielen dasselbe)
- Fortschritt wird im Browser gespeichert (`localStorage`) – kein Account nötig

---

## Online stellen (kostenlos)

### GitHub Pages

1. Projekt auf GitHub hochladen
2. Repository → **Settings** → **Pages**
3. Source: Branch `main`, Ordner `/ (root)`
4. Nach 1–2 Minuten ist die Seite unter `https://deinname.github.io/reponame` erreichbar

### Netlify (noch einfacher)

1. Auf [netlify.com](https://netlify.com) anmelden
2. Ordner per Drag & Drop hochziehen
3. Fertig – du bekommst sofort eine URL

---

## Nochmal spielen

Nach dem Spielen gibt es zwei Buttons:

- **Nochmal spielen** — startet das heutige Tagesrätsel von vorne
- **Zufälliges Übungsrätsel** — neues Produkt, so oft du willst (zum Üben)

---

## Anpassungen

| Was ändern? | Wo? |
|-------------|-----|
| Farben / Schrift | `css/style.css` |
| Produkte | `js/products.js` |
| Anzahl Versuche (Standard: 6) | `js/game.js` → `MAX_ATTEMPTS` |
| Wie schnell das Bild schärfer wird | `js/game.js` → `STAGES` |

---

## Tipps für gute Rätsel

- Starte mit **bekannten Marken** (Oatly, Violife, Alpro …)
- Vermeide zu ähnliche Verpackungen am Anfang
- Schreib in `aliases` alle Namen, die Spieler tippen könnten
- Echte Packshots wirken besser als Screenshots

---

## Lizenz

Frei nutzbar – viel Spaß beim Bauen! 🌱
