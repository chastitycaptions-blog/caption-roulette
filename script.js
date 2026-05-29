let images = [];          // [{ image, post }]
let currentIndex = null;  // index into images
let historyList = [];     // [{ index }]
let historyPos = -1;      // pointer into historyList
let favorites = new Set(); // store image URLs
let shuffleMode = false;
let shufflePool = [];     // remaining indices for shuffle

// Load JSON
fetch("images.json")
  .then(r => r.json())
  .then(data => {
    images = data;
    initShufflePool();
    loadFavorites();
  });

// NSFW overlay
function dismissNSFW() {
  const overlay = document.getElementById("nsfw-overlay");
  overlay.style.opacity = "0";
  setTimeout(() => {
    overlay.style.display = "none";
  }, 500);
}

// Shuffle helpers
function initShufflePool() {
  if (!images || images.length === 0) return;
  shufflePool = Array.from(images.keys());
  for (let i = shufflePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shufflePool[i], shufflePool[j]] = [shufflePool[j], shufflePool[i]];
  }
}

function getNextIndex() {
  if (!images || images.length === 0) return null;
  if (shuffleMode) {
    if (shufflePool.length === 0) {
      initShufflePool();
    }
    return shufflePool.pop();
  } else {
    return Math.floor(Math.random() * images.length);
  }
}

// Sounds
function playSound(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {});
}

// Favorites
function loadFavorites() {
  try {
    const raw = localStorage.getItem("captionRouletteFavorites");
    if (raw) {
      const arr = JSON.parse(raw);
      favorites = new Set(arr);
    }
  } catch (e) {
    favorites = new Set();
  }
  updateFavoriteButton();
}

function saveFavorites() {
  localStorage.setItem("captionRouletteFavorites", JSON.stringify(Array.from(favorites)));
}

function isCurrentFavorite() {
  if (currentIndex === null) return false;
  const url = images[currentIndex].image;
  return favorites.has(url);
}

function toggleFavorite() {
  if (currentIndex === null) return;
  const url = images[currentIndex].image;
  if (favorites.has(url)) {
    favorites.delete(url);
  } else {
    favorites.add(url);
  }
  saveFavorites();
  updateFavoriteButton();
  renderHistory();
}

function updateFavoriteButton() {
  const btn = document.getElementById("favorite-btn");
  if (!btn) return;
  if (isCurrentFavorite()) {
    btn.textContent = "♥ Favorited (F)";
  } else {
    btn.textContent = "♡ Favorite (F)";
  }
}

// History
function addToHistory(index) {
  historyList.push({ index });
  if (historyList.length > 10) {
    historyList.shift();
  }
  historyPos = historyList.length - 1;
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById("history-list");
  if (!container) return;
  container.innerHTML = "";
  historyList.forEach((entry, i) => {
    const imgObj = images[entry.index];
    if (!imgObj) return;

    const item = document.createElement("div");
    item.className = "history-item";

    const thumb = document.createElement("img");
    thumb.className = "history-thumb";
    thumb.src = imgObj.image;
    thumb.onclick = () => showImageByIndex(entry.index, false);

    item.appendChild(thumb);

    const meta = document.createElement("div");
    meta.className = "history-meta";

    const linkSpan = document.createElement("span");
    if (imgObj.post) {
      const a = document.createElement("a");
      a.href = imgObj.post;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Source";
      linkSpan.appendChild(a);
    }

    const favSpan = document.createElement("span");
    favSpan.className = "history-fav";
    const url = imgObj.image;
    favSpan.textContent = favorites.has(url) ? "♥" : "♡";
    favSpan.title = "Toggle favorite";
    favSpan.onclick = () => {
      if (favorites.has(url)) {
        favorites.delete(url);
      } else {
        favorites.add(url);
      }
      saveFavorites();
      updateFavoriteButton();
      renderHistory();
    };

    meta.appendChild(linkSpan);
    meta.appendChild(favSpan);
    item.appendChild(meta);

    container.appendChild(item);
  });
}

// Show image
function showImageByIndex(index, fromSpin) {
  if (!images[index]) return;
  currentIndex = index;

  const img = document.getElementById("image");
  const spinner = document.getElementById("spinner");
  const sourceDiv = document.getElementById("source-link");
  const sourceAnchor = document.getElementById("source-link-anchor");

  const obj = images[index];

  spinner.style.display = "none";
  img.style.display = "block";
  img.style.opacity = "1";
  img.style.filter = "blur(0px)";
  img.src = obj.image;

  if (obj.post) {
    sourceDiv.style.display = "block";
    sourceAnchor.href = obj.post;
    sourceAnchor.textContent = obj.post.replace(/^https?:\/\//, "");
  } else {
    sourceDiv.style.display = "none";
  }

  updateFavoriteButton();

  if (fromSpin) {
    addToHistory(index);
    playSound("sfx-ding");
  }
}

// Spin
function spin() {
  if (!images || images.length === 0) return;

  playSound("sfx-spin");

  const img = document.getElementById("image");
  const spinner = document.getElementById("spinner");

  img.style.opacity = "0";
  img.style.filter = "blur(12px)";
  img.style.display = "none";
  spinner.style.display = "block";

  const finalIndex = getNextIndex();
  if (finalIndex === null) return;

  // Rolling effect
  let rollCount = 0;
  const maxRolls = 10;
  const rollInterval = 100;

  const roller = setInterval(() => {
    rollCount++;
    const randomIndex = Math.floor(Math.random() * images.length);
    const tempObj = images[randomIndex];

    img.style.display = "block";
    img.src = tempObj.image;
    img.style.opacity = "1";
    img.style.filter = "blur(12px)";

    if (rollCount % 2 === 0) {
      playSound("sfx-tick");
    }

    if (rollCount >= maxRolls) {
      clearInterval(roller);
      showFinal(finalIndex);
    }
  }, rollInterval);

  function showFinal(idx) {
    const finalObj = images[idx];
    const tempImg = new Image();
    tempImg.onload = function () {
      const delay = 800;
      setTimeout(() => {
        spinner.style.display = "block";

        img.src = finalObj.image;
        img.style.display = "block";
        img.style.opacity = "0";
        img.style.filter = "blur(12px)";

        img.getBoundingClientRect();

        spinner.style.display = "none";
        img.style.opacity = "1";
        img.style.filter = "blur(0px)";

        showImageByIndex(idx, true);
      }, delay);
    };
    tempImg.src = finalObj.image;
  }
}

// History panel toggle
function toggleHistory() {
  const container = document.getElementById("history-container");
  if (!container) return;
  container.classList.toggle("open");
}

// Shuffle toggle
function toggleShuffle() {
  const cb = document.getElementById("shuffle-toggle");
  shuffleMode = cb.checked;
  if (shuffleMode) {
    initShufflePool();
  }
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  const tag =
