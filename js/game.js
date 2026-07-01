const MAX_ATTEMPTS = 6;
const CANVAS_SIZE = 300;

// Jeder Versuch: weniger Pixel (schärfer) + mehr Farbe
const STAGES = [
  { pixels: 12,  saturation: 0.12, hint: "Start: kaum Farbe, sehr verpixelt" },
  { pixels: 20,  saturation: 0.28, hint: "Ein bisschen mehr Farbe …" },
  { pixels: 36,  saturation: 0.45, hint: "Man erkennt schon etwas …" },
  { pixels: 60,  saturation: 0.62, hint: "Farben werden klarer …" },
  { pixels: 100, saturation: 0.80, hint: "Fast scharf!" },
  { pixels: 180, saturation: 0.93, hint: "Noch ein Detail fehlt …" },
  { pixels: 300, saturation: 1.00, hint: "Volles Bild!" }
];

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const brandInput = document.getElementById("brand-input");
const productInput = document.getElementById("product-input");
const guessForm = document.getElementById("guess-form");
const guessBtn = document.getElementById("guess-btn");
const attemptsEl = document.getElementById("attempts");
const messageEl = document.getElementById("message");
const stageHintEl = document.getElementById("stage-hint");
const puzzleNumberEl = document.getElementById("puzzle-number");
const attemptsLeftEl = document.getElementById("attempts-left");
const shareBox = document.getElementById("share-box");
const shareBtn = document.getElementById("share-btn");

let productImage = new Image();
let todaysProduct = null;
let puzzleNumber = 0;
let attemptCount = 0;
let gameOver = false;
let guessHistory = [];

function normalize(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ");
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getTodaysProduct() {
  const day = getDayOfYear(new Date());
  puzzleNumber = day;
  return PRODUCTS[day % PRODUCTS.length];
}

function storageKey() {
  return `substitutle-${puzzleNumber}`;
}

function saveState() {
  localStorage.setItem(
    storageKey(),
    JSON.stringify({ attemptCount, gameOver, guessHistory })
  );
}

function loadState() {
  const raw = localStorage.getItem(storageKey());
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    attemptCount = data.attemptCount || 0;
    gameOver = data.gameOver || false;
    guessHistory = data.guessHistory || [];
  } catch {
    // Alte/kaputte Daten ignorieren
  }
}

function matchesBrand(guess, product) {
  const g = normalize(guess);
  const options = [product.brand, ...(product.aliases?.brand || [])].map(normalize);
  return options.some((opt) => g === opt || g.includes(opt) || opt.includes(g));
}

function matchesProduct(guess, product) {
  const g = normalize(guess);
  const options = [product.product, ...(product.aliases?.product || [])].map(normalize);
  return options.some((opt) => g === opt || g.includes(opt) || opt.includes(g));
}

function applySaturation(imageData, amount) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i] = gray + (r - gray) * amount;
    data[i + 1] = gray + (g - gray) * amount;
    data[i + 2] = gray + (b - gray) * amount;
  }
  return imageData;
}

function drawStage(stageIndex) {
  if (!productImage.complete || !productImage.naturalWidth) return;

  const stage = STAGES[Math.min(stageIndex, STAGES.length - 1)];
  stageHintEl.textContent = stage.hint;

  const temp = document.createElement("canvas");
  const tempCtx = temp.getContext("2d");
  const pixelSize = stage.pixels;

  temp.width = pixelSize;
  temp.height = pixelSize;
  tempCtx.drawImage(productImage, 0, 0, pixelSize, pixelSize);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.drawImage(temp, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.putImageData(applySaturation(imageData, stage.saturation), 0, 0);
}

function fillDatalists() {
  const brands = [...new Set(PRODUCTS.map((p) => p.brand))];
  const products = PRODUCTS.map((p) => p.product);

  document.getElementById("brand-list").innerHTML = brands
    .map((b) => `<option value="${b}">`)
    .join("");
  document.getElementById("product-list").innerHTML = products
    .map((p) => `<option value="${p}">`)
    .join("");
}

function renderAttempts() {
  attemptsEl.innerHTML = guessHistory
    .map(
      (g) => `
    <div class="attempt-row">
      <div class="attempt-cell ${g.brandResult}">${escapeHtml(g.brand)}</div>
      <div class="attempt-cell ${g.productResult}">${escapeHtml(g.product)}</div>
    </div>`
    )
    .join("");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function updateAttemptsLeft() {
  const left = MAX_ATTEMPTS - attemptCount;
  attemptsLeftEl.textContent = gameOver
    ? "Morgen gibt es ein neues Rätsel"
    : `${left} Versuch${left === 1 ? "" : "e"} übrig`;
}

function endGame(won) {
  gameOver = true;
  guessBtn.disabled = true;
  brandInput.disabled = true;
  productInput.disabled = true;
  drawStage(STAGES.length - 1);

  if (won) {
    messageEl.textContent = `Richtig! 🎉 ${todaysProduct.brand} – ${todaysProduct.product}`;
    messageEl.className = "message win";
  } else {
    messageEl.textContent = `Leider nein. Es war: ${todaysProduct.brand} – ${todaysProduct.product}`;
    messageEl.className = "message lose";
  }

  shareBox.classList.remove("hidden");
  saveState();
  updateAttemptsLeft();
}

function buildShareText() {
  const won = guessHistory.some((g) => g.brandResult === "correct" && g.productResult === "correct");
  const lines = guessHistory.map((g) => {
    const brandIcon = g.brandResult === "correct" ? "🟩" : g.brandResult === "partial" ? "🟨" : "⬜️";
    const productIcon = g.productResult === "correct" ? "🟩" : g.productResult === "partial" ? "🟨" : "⬜️";
    return brandIcon + productIcon;
  });

  return [
    `Substitutle #${puzzleNumber} 🌱`,
    ...lines,
    won ? `Gewonnen in ${guessHistory.length}/${MAX_ATTEMPTS}!` : "Nicht geschafft 😢",
    "substitutle.de"
  ].join("\n");
}

function handleGuess(event) {
  event.preventDefault();
  if (gameOver) return;

  const brand = brandInput.value.trim();
  const product = productInput.value.trim();

  if (!brand || !product) {
    messageEl.textContent = "Bitte Marke und Produkt ausfüllen.";
    messageEl.className = "message";
    return;
  }

  const brandOk = matchesBrand(brand, todaysProduct);
  const productOk = matchesProduct(product, todaysProduct);

  guessHistory.push({
    brand,
    product,
    brandResult: brandOk ? "correct" : "wrong",
    productResult: productOk ? "correct" : "wrong"
  });

  attemptCount++;
  renderAttempts();
  drawStage(attemptCount);
  saveState();

  brandInput.value = "";
  productInput.value = "";
  brandInput.focus();

  if (brandOk && productOk) {
    endGame(true);
    return;
  }

  messageEl.textContent = brandOk
    ? "Marke stimmt! Produkt noch nicht."
    : productOk
      ? "Produkt stimmt! Marke noch nicht."
      : "Noch nicht richtig – weiter raten!";

  messageEl.className = "message";

  if (attemptCount >= MAX_ATTEMPTS) {
    endGame(false);
  } else {
    updateAttemptsLeft();
  }
}

function init() {
  if (!PRODUCTS || PRODUCTS.length === 0) {
    messageEl.textContent = "Keine Produkte gefunden. Bitte js/products.js ausfüllen.";
    return;
  }

  todaysProduct = getTodaysProduct();
  puzzleNumberEl.textContent = `Rätsel #${puzzleNumber}`;
  fillDatalists();
  loadState();
  renderAttempts();
  updateAttemptsLeft();

  productImage.onload = () => {
    drawStage(attemptCount);
    if (gameOver) {
      guessBtn.disabled = true;
      brandInput.disabled = true;
      productInput.disabled = true;
      shareBox.classList.remove("hidden");
      const won = guessHistory.some(
        (g) => g.brandResult === "correct" && g.productResult === "correct"
      );
      if (won) {
        messageEl.textContent = `Richtig! 🎉 ${todaysProduct.brand} – ${todaysProduct.product}`;
        messageEl.className = "message win";
      } else if (guessHistory.length > 0) {
        messageEl.textContent = `Es war: ${todaysProduct.brand} – ${todaysProduct.product}`;
        messageEl.className = "message lose";
      }
    }
  };

  productImage.onerror = () => {
    messageEl.textContent = `Bild nicht gefunden: ${todaysProduct.image}`;
    messageEl.className = "message lose";
  };

  productImage.src = todaysProduct.image;

  guessForm.addEventListener("submit", handleGuess);

  shareBtn.addEventListener("click", async () => {
    const text = buildShareText();
    try {
      await navigator.clipboard.writeText(text);
      shareBtn.textContent = "Kopiert! ✓";
      setTimeout(() => {
        shareBtn.textContent = "Ergebnis kopieren";
      }, 2000);
    } catch {
      prompt("Kopiere dein Ergebnis:", text);
    }
  });
}

init();
