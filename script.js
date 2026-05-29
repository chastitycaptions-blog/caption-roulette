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
  spinner.style.display = "block";

  // Pick a random image
  const randomIndex = Math.floor(Math.random() * images.length);
  const selectedImage = images[randomIndex];

  // Preload the image
  const tempImg = new Image();
  tempImg.onload = function () {
    // When loaded, hide spinner and show image
    spinner.style.display = "none";
    img.src = selectedImage;
    img.style.display = "block";
  };

  tempImg.src = selectedImage;
}
