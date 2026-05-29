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

  // Show spinner
  spinner.style.display = "block";

  // Pick a random image
  const randomIndex = Math.floor(Math.random() * images.length);
  const selectedImage = images[randomIndex];

  // Preload the image
  const tempImg = new Image();
  tempImg.onload = function () {

    const delay = 800; // adjust later

    setTimeout(() => {
      spinner.style.display = "none";

      // Set the image source
      img.src = selectedImage;

      // Make the image visible *while still blurred*
      img.style.display = "block";

      // FORCE the browser to register the blurred state
      img.getBoundingClientRect();  // <-- this is the reliable version

      // Now animate to clear blur + fade in
      img.style.opacity = "1";
      img.style.filter = "blur(0px)";

    }, delay);
  };

  tempImg.src = selectedImage;
}
