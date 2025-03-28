let modalContainer;
let modalImage;
let modalCaption;

document.addEventListener('DOMContentLoaded', (e) => {
  modalContainer = document.getElementById('modal-container');
  modalImage = document.getElementById('modal-image');
  modalCaption = document.getElementById('modal-caption');
  const modalLinks = [...document.querySelectorAll('a.modal-link')];
  modalLinks.forEach((el) => el.addEventListener('click', openModal));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  modalContainer.addEventListener('click', closeModal);
});

/**
 * Open a Modal from a click event.
 * @param {PointerEvent} event
 */
function openModal(event) {
  const el = event.currentTarget;
  modalContainer.style.display = 'block';
  modalImage.src = el.href;
  modalCaption.innerText = el.getAttribute('data-caption');
  event.preventDefault();
}

/**
 * Close an opened Modal
 */
function closeModal() {
  modalContainer.style.display = 'none';
}
