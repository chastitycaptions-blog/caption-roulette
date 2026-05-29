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

  // Hide the image, show the spinner
  img.style.display = "none";
  img.style.opacity = "0";
  img.style.filter = "blur(12px)";
  spinner.style.display = "block";

  // Pick a random image
  const randomIndex = Math.floor(Math.random() * images.length);
  const selectedImage = images[randomIndex];

  // Preload the image
  const tempImg = new Image();
  tempImg.onload = function () {

    // Artificial anticipation delay (adjust here)
    const delay = 800; // milliseconds — change to 1500 or 2000 later

    setTimeout(() => {
      spinner.style.display = "none";

      img.src = selectedImage;
      img.style.display = "block";

      // Fade in + unblur
      requestAnimationFrame(() => {
        img.style.opacity = "1";
        img.style.filter = "blur(0px)";
      });

    }, delay);
  };

  tempImg.src = selectedImage;
}
