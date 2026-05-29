let images = [];

// Load the JSON file
fetch("images.json")
  .then(response => response.json())
  .then(data => {
    images = data;
  });

// --- FEATURE 4: Dismiss NSFW overlay ---
function dismissNSFW() {
  const overlay = document.getElementById("nsfw-overlay");
  overlay.style.opacity = "0";

  setTimeout(() => {
    overlay.style.display = "none";
  }, 500); // matches CSS fade-out
}

function spin() {
  if (images.length === 0) return;

  const img = document.getElementById("image");
  const spinner = document.getElementById("spinner");

  // Reset image state
  img.style.opacity = "0";
  img.style.filter = "blur(12px)";
  img.style.display = "none";

  // Show spinner at the start
  spinner.style.display = "block";

  // --- FEATURE 3: Rolling effect ---
  let rollCount = 0;
  const maxRolls = 10;
  const rollInterval = 100;

  spinner.style.display = "none";
  img.style.display = "block";

  const roller = setInterval(() => {
    rollCount++;

    const randomIndex = Math.floor(Math.random() * images.length);
    img.src = images[randomIndex];

    img.style.opacity = "1";
    img.style.filter = "blur(12px)";

    if (rollCount >= maxRolls) {
      clearInterval(roller);
      showFinalImage();
    }
  }, rollInterval);

  // --- Final image reveal ---
  function showFinalImage() {
    const finalIndex = Math.floor(Math.random() * images.length);
    const finalImage = images[finalIndex];

    const tempImg = new Image();
    tempImg.onload = function () {

      const delay = 800;

      setTimeout(() => {
        spinner.style.display = "block";

        img.src = finalImage;
        img.style.display = "block";
        img.style.opacity = "0";
        img.style.filter = "blur(12px)";

        img.getBoundingClientRect();

        spinner.style.display = "none";
        img.style.opacity = "1";
        img.style.filter = "blur(0px)";

      }, delay);
    };

    tempImg.src = finalImage;
  }
}
