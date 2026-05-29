// GLOBAL STATE
let images = [];
let imageToSource = {};
let history = [];
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let currentImage = null;
let shuffleMode = false;
let soundEnabled = true;

// LOAD JSON (MATCHES YOUR images.json FORMAT)
fetch("images.json")
  .then(r => r.json())
  .then(data => {
    images = data;
    images.forEach(item => {
      imageToSource[item.image] = item.post;
    });
  });

// NSFW DISMISS
function dismissNSFW() {
  const overlay = document.getElementById("nsfw-overlay");
  overlay.style.opacity = "0";
  setTimeout(() => overlay.style.display = "none", 500);
}

function playSound(id) {
  if (!soundEnabled) return;
  const el = document.getElementById(id);
  el.currentTime = 0;
  el.play();
}

// SHUFFLE MODE
function toggleShuffle() {
  shuffleMode = document.getElementById("shuffle-toggle").checked;
}

// SPIN with smooth roller animation (fixed visibility)
function spin() {
  const spinner = document.getElementById("spinner");
  const img = document.getElementById("image");
  const sourceLink = document.getElementById("source-link");

  spinner.style.display = "block";

  // IMPORTANT FIX — make image visible for roller frames
  img.style.display = "block";
  img.style.opacity = "0";
  img.style.filter = "blur(12px)";

  sourceLink.style.display = "none";

  playSound("sfx-tick");

  // Number of roller frames
  const totalFrames = 22;
  let frame = 0;

  // Animation speed easing (fast → slow)
  function frameDelay(n) {
    return 20 + Math.pow(n, 1.8);
  }

  function rollerStep() {
    if (frame < totalFrames) {
      // Pick a random image for the roller
      const random = images[Math.floor(Math.random() * images.length)];
      img.src = random.image;

      img.style.opacity = "0.4";
      img.style.filter = "blur(6px)";

      const tick = document.getElementById("sfx-tick");
      tick.currentTime = 0;
      tick.play();

      frame++;
      setTimeout(rollerStep, frameDelay(frame));
    } else {
      // Final image selection
      let choice;

      if (shuffleMode) {
        const unused = images.filter(i => !history.includes(i.image));
        if (unused.length === 0) history = [];
        choice = unused[Math.floor(Math.random() * unused.length)];
      } else {
        choice = images[Math.floor(Math.random() * images.length)];
      }

      currentImage = choice.image;
      history.push(choice.image);

      // Show final image cleanly
      showImage(choice.image);
      renderHistory();

      playSound("sfx-ding");
      spinner.style.display = "none";
    }
  }

  rollerStep();
}



// SHOW IMAGE
function showImage(url) {
  const img = document.getElementById("image");
  const sourceLink = document.getElementById("source-link");
  const anchor = document.getElementById("source-link-anchor");

  img.style.opacity = "0";
  img.style.filter = "blur(12px)";
  img.src = url;

  img.onload = () => {
    img.style.display = "block";
    setTimeout(() => {
      img.style.opacity = "1";
      img.style.filter = "blur(0)";
    }, 50);
  };

  anchor.href = imageToSource[url] || "#";
  anchor.textContent = imageToSource[url] ? "Tumblr Post" : "Unknown Source";
  sourceLink.style.display = "block";

  updateFavoriteButton();
}

// FAVORITES
function toggleFavorite(urlOverride = null) {
  const url = urlOverride || currentImage;
  if (!url) return;

  if (favorites.includes(url)) {
    favorites = favorites.filter(f => f !== url);
  } else {
    favorites.push(url);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));

  updateFavoriteButton();
  renderHistory();
  renderFavorites();
}

function updateFavoriteButton() {
  const btn = document.getElementById("favorite-btn");
  if (!currentImage) return;

  btn.textContent = favorites.includes(currentImage)
    ? "❤️ Favorited"
    : "♡ Favorite (F)";
}

// HISTORY PANEL
function toggleHistory() {
  document.getElementById("history-container").classList.toggle("open");
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("history-list");
  list.innerHTML = "";

  history.forEach(url => {
    const item = document.createElement("div");
    item.className = "history-item";

    const source = imageToSource[url] || "#";

    item.innerHTML = `
      <img class="history-thumb" src="${url}" onclick="jumpToImage('${url}')">
      <div class="history-meta">
        <a href="${source}" target="_blank">Source</a>
        <span class="history-fav" onclick="toggleFavorite('${url}')">
          ${favorites.includes(url) ? "❤️" : "♡"}
        </span>
      </div>
    `;

    list.appendChild(item);
  });
}

// FAVORITES PANEL
function toggleFavorites() {
  document.getElementById("favorites-container").classList.toggle("open");
  renderFavorites();
}

function renderFavorites() {
  const list = document.getElementById("favorites-list");
  list.innerHTML = "";

  favorites.forEach(url => {
    const item = document.createElement("div");
    item.className = "history-item";

    const source = imageToSource[url] || "#";

    item.innerHTML = `
      <img class="history-thumb" src="${url}" onclick="jumpToImage('${url}')">
      <div class="history-meta">
        <a href="${source}" target="_blank">Source</a>
        <span class="history-fav" onclick="toggleFavorite('${url}')">❤️</span>
      </div>
    `;

    list.appendChild(item);
  });
}

// JUMP TO IMAGE
function jumpToImage(url) {
  currentImage = url;
  showImage(url);
}

// KEYBOARD SHORTCUTS
document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    spin();
  }
  if (e.key.toLowerCase() === "f") {
    toggleFavorite();
  }
  if (e.key.toLowerCase() === "h") {
    toggleHistory();
  }
});

document.getElementById("sound-toggle").addEventListener("change", e => {
  soundEnabled = e.target.checked;
});

