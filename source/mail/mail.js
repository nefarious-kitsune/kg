// eslint-env browser
/* eslint-disable no-unused-vars */

/**
 * @typedef {Object} InputData - Input history
 * @property {string} value - Input value
 * @property {number} start - Start position of the input value
 * @property {number} end - End position of the input value
 * @property {string} before - String value before the change
 * @property {'select'|'start'|'end'} mode - Selection mode when the change was made
 * @property {boolean} doMore - Continue to do next Undo?
 * @property {InputData} [undo] - Previous undo
 */

// Undo/Redo
/** @type InputData[] */ const undoStack = [];
/** @type InputData[] */ const redoStack = [];


let inputElement;
let previewElement;

/** @type {string} previous selection */
let selectionText;

let lastInputValue = '';

// IME
/** @type {string} */ let imeBefore;
/** @type {number} */ let imeTextStart;
/** @type {number} */ let imeTextEnd;

let previewDelay;
let previewPending = false;

document.addEventListener('DOMContentLoaded', (e) => {
  // Undo/redo stack. Based on
  // https://github.com/shikatan0/textarea-undo-redo/blob/master/src/index.ts

  const bodyElement = document.body;
  inputElement = document.getElementById('input');
  previewElement = document.getElementById('output');

  // For MacOS
  if (navigator.userAgent.toLowerCase().indexOf('mac os') !== -1) {
    // Silent Mac Undo/Redo commands
    bodyElement.addEventListener('keydown', (e) => {
      if ((e.metaKey) && (e.key == 'z')) e.preventDefault();
    });

    // Process undo/redo shortcuts
    inputElement.addEventListener('keydown', (e) => {
      if (!e.metaKey) return;
      if (e.key == 'z') {
        if (!e.shiftKey) undoAction();
        else redoAction();
      }
    });
  } else {
    // Silent Undo/Redo commands
    bodyElement.addEventListener('keydown', (e) => {
      if ((e.ctrlKey) && ((e.key == 'z')||(e.key == 'y'))) e.preventDefault();
    });

    // Process undo/redo shortcuts
    inputElement.addEventListener('keydown', (e) => {
      if (!e.ctrlKey) return;
      if (e.key == 'z') {
        if (!e.shiftKey) undoAction();
        else redoAction();
      } else if (e.key == 'y') {
        redoAction();
      }
    });
  }

  inputElement.addEventListener('compositionstart', () => {
    imeBefore = selectionText;
  });

  inputElement.addEventListener('compositionupdate', () => {
    imeTextStart = inputElement.selectionStart;
    imeTextEnd = inputElement.selectionEnd;
  });

  inputElement.addEventListener('compositionend', () => {
    // If all input were deleted
    if (imeTextStart === inputElement.selectionEnd) return;

    undoStack.push({
      value: inputElement.value.slice(imeTextStart, imeTextEnd),
      start: imeTextStart,
      end: imeTextEnd,
      before: imeBefore,
      mode: 'end',
      doMore: false,
    });
    redoStack.length = 0;
  });

  // Update selection
  document.addEventListener('selectionchange', () => {
    selectionText = getSelectionText();
  });

  inputElement.addEventListener('cut', processCutEvent);
  inputElement.addEventListener('paste', processPasteEvent);

  inputElement.addEventListener('input', processHistoryEvent);
  inputElement.addEventListener('input', processInsertEvent);

  inputElement.addEventListener('beforeinput', beforeInputChange);
  inputElement.addEventListener('input', processDeletionEvent);

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

  navigator.clipboard.writeText(inputElement.value);
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

/** Add a size tag
 * @param {number} size
 */
function setSize(size) {
  setFormatting(`<size=${size}>`, '</size>');
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

  const replaced = value.substring(selStart, selEnd);
  const inserted = startTag + replaced + endTag;

  inputElement.focus();
  inputElement.value =
      value.substring(0, selStart)+ inserted + value.substring(selEnd);
  inputElement.setSelectionRange(
      selStart + startTag.length,
      selEnd + startTag.length,
  );

  undoStack.push({
    value: inserted,
    start: selStart,
    end: selStart + inserted.length,
    before: replaced,
    mode: 'end',
    doMore: false,
  });
  redoStack.length = 0;

  inputChange();
}

/**
 * Undo change
 * @param {*} redoDoMore - Continue to do next Undo?
 */
function undoAction(redoDoMore) {
  if (undoStack.length === 0) return;

  const data = undoStack.pop();
  inputElement.setRangeText(data.before, data.start, data.end, data.mode);

  inputElement.focus();
  inputElement.setSelectionRange(
      data.start,
      data.start + data.before.length,
  );

  redoStack.push({
    value: data.before,
    start: data.start,
    end: data.start + data.before.length,
    before: data.value,
    mode: data.mode,
    doMore: redoDoMore,
    undo: data,
  });

  if (data.doMore) undoAction(true);
}

/**
 * Redo change
 */
function redoAction() {
  if (redoStack.length === 0) return;
  const data = redoStack.pop();
  inputElement.setRangeText(data.before, data.start, data.end, data.mode);

  inputElement.focus();
  inputElement.setSelectionRange(
      data.start,
      data.start + data.before.length,
  );

  undoStack.push(data.undo);

  if (data.doMore) redoAction();
}

/**
 * Get selection text
 * @return {string}
 */
function getSelectionText() {
  return inputElement.value.slice(
      inputElement.selectionStart,
      inputElement.selectionEnd,
  );
}

/**
 * Tracking undo/redo history change
 * @param {InputEvent} e
 */
function processHistoryEvent(e) {
  switch (e.inputType) {
    case 'historyUndo':
    case 'historyRedo':
      inputElement.value = lastInputValue;
      return;
    default:
      lastInputValue = inputElement.value;
      return;
  };
}

/**
 * Process input event related to text insertion
 * @param {InputEvent} e
 */
function processInsertEvent(e) {
  switch (e.inputType) {
    // IME: replace the current composition string
    case 'insertCompositionText': return;

    // Line break
    case 'insertLineBreak': {
      undoStack.push({
        value: '\n',
        start: inputElement.selectionEnd - 1,
        end: inputElement.selectionEnd,
        before: selectionText,
        mode: 'end',
        doMore: false,
      });
      redoStack.length = 0;
      return;
    }

    case 'insertFromDrop': {
      undoStack.push({
        value: getSelectionText(),
        start: inputElement.selectionStart,
        end: inputElement.selectionEnd,
        before: '',
        mode: 'select',
        doMore: true,
      });
      redoStack.length = 0;
      return;
    }
  };

  // Keyboard input
  if (e.data !== null) {
    undoStack.push({
      value: e.data,
      start: inputElement.selectionEnd - e.data.length,
      end: inputElement.selectionEnd,
      before: selectionText,
      mode: 'end',
      doMore: false,
    });
    redoStack.length = 0;
    return;
  };
}


/**
 * Process input event related to text deletion
 * @param {InputEvent} e
 */
function processDeletionEvent(e) {
  switch (e.inputType) {
    case 'deleteContentBackward':
      undoStack.push({
        value: '',
        start: inputElement.selectionEnd,
        end: inputElement.selectionEnd,
        before: selectionText,
        mode: 'end',
        doMore: false,
      });
      redoStack.length = 0;
      return;
    case 'deleteContentForward':
      undoStack.push({
        value: '',
        start: inputElement.selectionEnd,
        end: inputElement.selectionEnd,
        before: selectionText,
        mode: 'start',
        doMore: false,
      });
      redoStack.length = 0;
      return;
    case 'deleteByDrag':
      undoStack.push({
        value: '',
        start: inputElement.selectionEnd,
        end: inputElement.selectionEnd,
        before: selectionText,
        mode: 'select',
        doMore: false,
      });
      redoStack.length = 0;
      return;
  }
}

/**
 * Cache content deleted by BackSpace/Delete
 * @param {InputEvent} e
 */
function beforeInputChange(e) {
  if (inputElement.selectionStart === inputElement.selectionEnd) {
    switch (e.inputType) {
      case 'deleteContentBackward':
        selectionText = inputElement.value.slice(
            inputElement.selectionStart - 1,
            inputElement.selectionEnd,
        );
        return;
      case 'deleteContentForward':
        selectionText = inputElement.value.slice(
            inputElement.selectionStart,
            inputElement.selectionEnd + 1,
        );
        return;
    }
  }
}

/**
 * Process paste command
 * @param {InputEvent} e
 */
function processPasteEvent(e) {
  const value = e.clipboardData.getData('text');
  undoStack.push({
    value: value,
    start: inputElement.selectionEnd,
    end: inputElement.selectionEnd + value.length,
    before: selectionText,
    mode: 'end',
    doMore: false,
  });
  redoStack.length = 0;
}

/**
 * Process cut command
 * @param {InputEvent} e
 */
function processCutEvent(e) {
  undoStack.push({
    value: '',
    start: inputElement.selectionStart,
    end: inputElement.selectionStart,
    before: selectionText,
    mode: 'select',
    doMore: false,
  });
  redoStack.length = 0;
}
