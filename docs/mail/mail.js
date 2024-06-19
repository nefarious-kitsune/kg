// eslint-env browser
/* eslint-disable no-unused-vars */

// Undo/redo stack code is partly based on
// https://github.com/shikatan0/textarea-undo-redo/blob/master/src/index.ts

/**
 * @typedef {Object} InputHistory - Input history
 * @property {string} inputType - Input type of the event
 * @property {string} insertedText - Text added to the input
 * @property {string} replacedText - Text that was replaced
 * @property {number} startPos - Start position of inserted text
 * @property {number} endPos - Start position of inserted text
 * @property {'select'|'start'|'end'} selectionMode - Selection mode after undo/redo
 * @property {boolean} chained - Is this a chained event?
 * @property {InputHistory} [undo] - Previous undo
 */

// Undo/Redo
/** @type InputHistory[] */ const undoStack = [];
/** @type InputHistory[] */ const redoStack = [];

/** @type {string} selected text */
let selectedText = '';

let inputElement;
let previewElement;

// IME
/** @type {string} */ let imeBefore;
/** @type {number} */ let imeTextStart;
/** @type {number} */ let imeTextEnd;

let previewDelay;
let previewPending = false;

document.addEventListener('DOMContentLoaded', (e) => {
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
    imeBefore = selectedText;
  });

  inputElement.addEventListener('compositionupdate', () => {
    imeTextStart = inputElement.selectionStart;
    imeTextEnd = inputElement.selectionEnd;
  });

  inputElement.addEventListener('compositionend', handleIMEChangeEvent);

  inputElement.addEventListener('cut', handleCutEvent);
  inputElement.addEventListener('paste', processPasteEvent);

  inputElement.addEventListener('beforeinput', beforeInputChange);

  inputElement.addEventListener('input', handleChangeEvent);
  inputElement.addEventListener('input', startPreviewCooldown);

  // Update selection
  document.addEventListener('selectionchange', handleSectionChange);

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
function startPreviewCooldown() {
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

  const inserted = startTag + selectedText + endTag;

  inputElement.focus();

  inputElement.setRangeText(inserted, selStart, selEnd, 'select');

  // inputElement.setSelectionRange(
  //     selStart + startTag.length,
  //     selEnd + startTag.length,
  // );

  undoStack.push({
    insertedText: inserted,
    replacedText: selectedText,
    startPos: selStart,
    endPos: selStart + inserted.length,
    selectionMode: 'select',
    chained: false,
  });
  redoStack.length = 0;

  startPreviewCooldown();
}

/**
 * Undo change
 * @param {*} chainedUndo - Continue to do next Undo?
 */
function undoAction(chainedUndo) {
  if (undoStack.length === 0) return;

  const data = undoStack.pop();
  inputElement.setRangeText(
      data.replacedText,
      data.startPos,
      data.endPos,
      data.selectionMode);

  inputElement.focus();

  redoStack.push({
    inputType: data.inputType,
    insertedText: data.replacedText,
    replacedText: data.insertedText,
    startPos: data.startPos,
    endPos: data.startPos + data.replacedText.length,
    selectionMode: data.selectionMode,
    chained: chainedUndo,
    undo: data,
  });

  if (data.chained) undoAction(true);
  else startPreviewCooldown();
}

/**
 * Redo change
 */
function redoAction() {
  if (redoStack.length === 0) return;
  const data = redoStack.pop();
  inputElement.setRangeText(
      data.replacedText,
      data.startPos,
      data.endPos,
      data.selectionMode,
  );

  inputElement.focus();

  undoStack.push(data.undo);

  if (data.chained) redoAction();
  else startPreviewCooldown();
}

/**
 * Handle selection change
 * @param {InputEvent} e
 */
function handleSectionChange(e) {
  selectedText = getSelectionText();
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
 * Handle IME input change event
 * @param {InputEvent} e
 */
function handleIMEChangeEvent(e) {
  // If all input were deleted
  if (imeTextStart === inputElement.selectionEnd) return;

  undoStack.push({
    inputType: 'insertCompositionText',
    insertedText: inputElement.value.slice(imeTextStart, imeTextEnd),
    replacedText: imeBefore,
    startPos: imeTextStart,
    endPos: imeTextEnd,
    selectionMode: 'end',
  });
  redoStack.length = 0;
}

/**
 * Process input event related to text insertion
 * @param {InputEvent} e
 */
function handleChangeEvent(e) {
  switch (e.inputType) {
    case 'historyUndo':
    case 'historyRedo': {
      e.preventDefault();
      return;
    }

    case 'insertCompositionText': {
      // ignore. Already handled by handleIMEChangeEvent
      return;
    }

    case 'deleteContentBackward': {
      undoStack.push({
        inputType: e.inputType,
        insertedText: '',
        replacedText: selectedText,
        startPos: inputElement.selectionEnd,
        endPos: inputElement.selectionEnd,
        selectionMode: 'end',
        chained: false,
      });
      redoStack.length = 0;
      return;
    }

    case 'deleteContentForward':
      undoStack.push({
        inputType: e.inputType,
        insertedText: '',
        replacedText: selectedText,
        startPos: inputElement.selectionEnd,
        endPos: inputElement.selectionEnd,
        selectionMode: 'start',
        chained: false,
      });
      redoStack.length = 0;
      return;

    case 'deleteByDrag': {
      undoStack.push({
        inputType: e.inputType,
        insertedText: '',
        replacedText: selectedText,
        startPos: inputElement.selectionEnd,
        endPos: inputElement.selectionEnd,
        selectionMode: 'select',
        chained: false,
      });
      redoStack.length = 0;
      return;
    }

    case 'insertFromDrop': {
      let chained = false;
      const inserted = getSelectionText();

      if (undoStack.length) {
        const prevUndo = undoStack[undoStack.length - 1];
        if (
          (prevUndo.inputType === 'deleteByDrag') &&
          (prevUndo.replacedText === inserted)
        ) {
          chained = true;
        }
      }

      undoStack.push({
        inputType: e.inputType,
        insertedText: inserted,
        replacedText: '',
        startPos: inputElement.selectionStart,
        endPos: inputElement.selectionEnd,
        selectionMode: 'select',
        chained: chained,
      });
      // 'deleteByDrag'
      redoStack.length = 0;
      return;
    }

    // Line break
    case 'insertLineBreak': {
      undoStack.push({
        inputType: e.inputType,
        insertedText: '\n',
        replacedText: selectedText,
        startPos: inputElement.selectionEnd - 1,
        endPos: inputElement.selectionEnd,
        selectionMode: 'end',
        chained: false,
      });
      redoStack.length = 0;
      return;
    }

    case 'insertText':
    default: {
      if (e.data !== null) {
        undoStack.push({
          inputType: e.inputType,
          insertedText: e.data,
          replacedText: selectedText,
          startPos: inputElement.selectionEnd - e.data.length,
          endPos: inputElement.selectionEnd,
          selectionMode: 'end',
          chained: false,
        });
        redoStack.length = 0;
        return;
      };
    }
  };
}

/**
 * Process input event related to text deletion
 * @param {InputEvent} e
 */
function processDeletionEvent(e) {
}

/**
 * Cache content deleted by BackSpace/Delete
 * @param {InputEvent} e
 */
function beforeInputChange(e) {
  if (inputElement.selectionStart === inputElement.selectionEnd) {
    switch (e.inputType) {
      case 'deleteContentBackward':
        selectedText = inputElement.value.slice(
            inputElement.selectionStart - 1,
            inputElement.selectionEnd,
        );
        return;
      case 'deleteContentForward':
        selectedText = inputElement.value.slice(
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
    inputType: 'paste',
    insertedText: value,
    replacedText: selectedText,
    startPos: inputElement.selectionEnd,
    endPos: inputElement.selectionEnd + value.length,
    selectionMode: 'end',
    chained: false,
  });
  redoStack.length = 0;
}

/**
 * Process cut command
 * @param {InputEvent} e
 */
function handleCutEvent(e) {
  undoStack.push({
    inputType: 'cut',
    insertedText: '',
    replacedText: selectedText,
    startPos: inputElement.selectionStart,
    endPos: inputElement.selectionStart,
    selectionMode: 'select',
    chained: false,
  });
  redoStack.length = 0;
}
