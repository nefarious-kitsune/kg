let inputElement;

function copyInput() {
  if (!inputElement) inputElement = document.getElementById('message-input');

  // stackoverflow.com/questions/1173194/select-all-div-text-with-single-mouse-click
  if (document.selection) { // IE
      var range = document.body.createTextRange();
      range.moveToElementText(inputElement);
      range.select();
  } else if (window.getSelection) {
      var range = document.createRange();
      range.selectNode(inputElement);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
  }

  navigator.clipboard.writeText(inputElement.innerText);
}
