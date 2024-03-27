// eslint-env browser
/* eslint-disable no-unused-vars */

let inputElement;
let previewElement;

document.addEventListener('DOMContentLoaded', (e) => {
  inputElement = document.getElementById('input');
  previewElement = document.getElementById('output');
  validateInput();
});

/**
 * Validate input and generate a preview
 */
function validateInput() {
  const inputText = inputElement.value;
  try {
    const previewText = parser.parse(inputText);
    previewElement.classList.remove('error');
    previewElement.innerHTML = previewText;
  } catch (e) {
    previewElement.innerHTML = 'Your message contains an error!';
    previewElement.classList.add('error');
  }
}

/**
 * Copy input text to the clipboard
 */
function copyInput() {
  // from https://stackoverflow.com/questions/1173194/
  if (document.selection) { // IE
    const range = document.body.createTextRange();
    range.moveToElementText(inputElement);
    range.select();
  } else if (window.getSelection) {
    const range = document.createRange();
    range.selectNode(inputElement);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }

  navigator.clipboard.writeText(inputElement.innerText);
}
