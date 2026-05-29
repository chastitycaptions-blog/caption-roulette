let images = [];

fetch("images.json")
  .then(response => response.json())
  .then(data => {
    images = data;
  });

function spin() {
  if (images.length === 0) return;

  const randomIndex = Math.floor(Math.random() * images.length);
  const img = document.getElementById("image");
  img.src = images[randomIndex];
  img.style.display = "block";
}

