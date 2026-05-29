let images = [];

// Load the JSON file
fetch("images.json")
  .then(response => response.json())
  .then(data => {
    images = data;
  });

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
  const maxRolls = 10;      // number of rapid images
  const rollInterval = 100; // ms between each roll

  // Hide spinner during rolling so we can see the images
  spinner.style.display = "none";
  img.style.display = "block";

  const roller = setInterval(() => {
    rollCount++;

    // Pick a random image for the rolling preview
    const randomIndex = Math.floor(Math.random() * images.length);
    img.src = images[randomIndex];

    // Keep it blurred during rolling
    img.style.opacity = "1";
    img.style.filter = "blur(12px)";

    if (rollCount >= maxRolls) {
      clearInterval(roller);
      showFinalImage();
    }
  }, rollInterval);

  // --- After rolling, show the final image with blur reveal ---
  function showFinalImage() {
    const finalIndex = Math.floor(Math.random() * images.length);
    const finalImage = images[finalIndex];

    const tempImg = new Image();
    tempImg.onload = function () {

      const delay = 800; // anticipation delay

      setTimeout(() => {
        // Show spinner briefly during anticipation
        spinner.style.display = "block";

        // Set final image
        img.src = finalImage;
        img.style.display = "block";
        img.style.opacity = "0";
        img.style.filter = "blur(12px)";

        // Force browser to register blurred state
        img.getBoundingClientRect();

        // Hide spinner and reveal image
        spinner.style.display = "none";
        img.style.opacity = "1";
        img.style.filter = "blur(0px)";

      }, delay);
    };

    tempImg.src = finalImage;
  }
}
