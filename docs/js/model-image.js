let modalContainer;
let modalImage;
let modalCaption;
let modalLinks;

document.addEventListener("DOMContentLoaded", (e) => {
  modalContainer = document.getElementById("modal-container");
  modalImage = document.getElementById("modal-image");
  modalCaption = document.getElementById("modal-caption");
  modalLinks = [...document.querySelectorAll('a.modal-link')];
  modalLinks.forEach((el) => el.addEventListener("click", handleClick))
})

function handleClick(event) {
  const el = event.currentTarget;
  modalContainer.style.display = "block";
  modalImage.src = el.href;
  modalCaption.innerHTML = el.getAttribute('data-caption')
  event.preventDefault();
}

function closeModal() {
  modalContainer.style.display = "none";
}
