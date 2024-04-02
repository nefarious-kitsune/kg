// eslint-env browser
/* eslint-disable no-unused-vars */

let inputElement;
let previewElement;

let previewDelay;
let previewPending = false;

document.addEventListener('DOMContentLoaded', (e) => {
  inputElement = document.getElementById('input');
  previewElement = document.getElementById('output');
  inputElement.addEventListener('input', inputChange);
  updatePreview();
});

/**
 * Validate input and generate a preview
 */
function updatePreview() {
  if (previewPending) clearTimeout(previewDelay);
  inputElement.classList.remove('preview-pending');
  previewPending = false;

  const inputText = inputElement.value;
  try {
    const previewText = parser.parse(inputText);
    previewElement.classList.remove('error');
    previewElement.innerHTML = previewText;
  } catch (e) {
    // previewElement.innerHTML = 'Your message contains an error!';
    previewElement.classList.add('error');
  }
}

/**
 * Watch for input change
 */
function inputChange() {
  if (previewPending) {
    clearTimeout(previewDelay);
  } else {
    previewPending = true;
    inputElement.classList.add('preview-pending');
  };
  previewDelay = setTimeout(updatePreview, 800);
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
  const startTag = '<color=' + colorName + '>';
  const endTag = '</color>';
  setFormatting(startTag, endTag);
}

/** Add a bold tag */
function setBold() {
  setFormatting('<b>', '</b>');
}

/** Add an italic tag */
function setItalic() {
  setFormatting('<i>', '</i>');
}

/** Add a size tag */
function setBig() {
  setFormatting('<size=60>', '</size>');
}

/**
 * Format the selected text
 * @param {*} startTag 
 * @param {*} endTag 
 */
function setFormatting(startTag, endTag) {
  const selStart = inputElement.selectionStart;
  const selEnd = inputElement.selectionEnd;
  const value = inputElement.value;

  const inserted = startTag + value.substring(selStart, selEnd) + endTag;

  inputElement.focus();
  inputElement.value =
      value.substring(0, selStart)+ inserted + value.substring(selEnd);
  inputElement.setSelectionRange(
      selStart + startTag.length,
      selEnd + startTag.length,
  );
  inputChange();
}
