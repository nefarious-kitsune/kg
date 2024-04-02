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

/**
 * Add a color tag
 * @param {*} colorName
 */
function setColor(colorName) {
  const selStart = inputElement.selectionStart;
  const selEnd = inputElement.selectionEnd;
  const value = inputElement.value;
  const startTag = '<color=' + colorName + '>';
  const endTag = '</color>';

  const inserted = startTag + value.substring(selStart, selEnd) + endTag;

  inputElement.focus();
  inputElement.value =
      value.substring(0, selStart)+ inserted + value.substring(selEnd);
  inputElement.setSelectionRange(
      selStart + startTag.length,
      selEnd + startTag.length,
  );
}

/** Add a bold tag */
function setBold() {
  const selStart = inputElement.selectionStart;
  const selEnd = inputElement.selectionEnd;
  const value = inputElement.value;
  const startTag = '<b>';
  const endTag = '</b>';

  const inserted = startTag + value.substring(selStart, selEnd) + endTag;

  inputElement.focus();
  inputElement.value =
      value.substring(0, selStart)+ inserted + value.substring(selEnd);
  inputElement.setSelectionRange(
      selStart + startTag.length,
      selEnd + startTag.length,
  );
}
