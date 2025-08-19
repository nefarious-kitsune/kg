// eslint-env browser
/* ---eslint-disable no-unused-vars */

// Undo/redo stack code is partly based on
// https://github.com/shikatan0/textarea-undo-redo/blob/master/src/index.ts

const Hexadecimal = '0123456789abcdefABCDEF';
const NamedColors = [
  'aqua', 'black', 'blue', 'brown', 'cyan', 'darkblue', 'fuchsia',
  'green', 'grey', 'lightblue', 'lime', 'magenta', 'maroon', 'navy',
  'olive', 'orange', 'purple', 'red', 'silver', 'teal', 'white',
  'yellow',
];

/**
 * @typedef {'size'|'bold'|'italic'|'color'|'line-break'|'eof'} URTTokenType
 * Type of URT Token
 *
 * @typedef {Object} URTToken - Token inside a URT syntax tree
 * @property {URTTokenType} type - Type of the token
 * @property {string|number|null} [value] - Value of a size or color token
 * @property {URTToken[]} inner - Child tokens of the inner content
 * @property {string} text - Text of the inner content
 * @property {number} location - Start location within the source
 */

/** Parser for formatted text in Unity RichText widget */
class URTParser {
  /** Constructor */
  constructor() {
    /**
     * @type {number}
     * Current parser position
     */
    this.currentPos = 0;

    /**
     * @type {string}
     * Source
     */
    this.source = '',

    /**
     * @type {URTToken[]}
     * Document root
     */
    this.root = [];
  }

  /**
   * Return an error message
   * @param {string} msg - Error message
   * @param {number} pos - Location of the error
   * @param {number} len - Length of the error (for highlighting)
   * @return {Error}
   */
  error(msg, pos, len = 1) {
    const e = new Error('Parser error');

    const lines = this.source.split('\n');
    let lineNo;
    let colNo;

    let runningLen = 0;
    let lineStartPos = 0;
    let currentLine = '';

    for (lineNo = 0; lineNo < lines.length; lineNo++) {
      currentLine = lines[lineNo];
      runningLen += currentLine.length + 1; // Add back '\n' that was removed
      if (pos < runningLen) {
        lineNo = lineNo + 1;
        colNo = pos - lineStartPos;
        break;
      }
      lineStartPos = runningLen;
    }

    msg = this.escape(msg);
    e.formattedError =
      `<div class="message">${msg} [Ln ${lineNo}, Col ${colNo}]</div>` +
      '<div class="details">' +
      this.escape(currentLine.substring(0, colNo)) +
      `<span class="highlighted-error">` +
      this.escape(currentLine.substring(colNo, colNo + len)) +
      `</span>` +
      this.escape(currentLine.substring(colNo + len)) +
      '</div>';

    return e;
  }

  /**
   * Escape text
   * @param {string} text
   * @return {string}
   */
  escape(text) {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
  }

  /**
   * Advance cursor position and get next character
   * @return {string}
   */
  nextChar() {
    return this.source.charAt(++this.currentPos);
  }

  /**
   * Get character at current cursor position
   * @return {string}
   */
  thisChar() {
    return this.source.charAt(this.currentPos);
  }

  /**
   * Get a string fragment of certain length from current position
   * @param {number} len - length
   * @return {string}
   */
  subString(len) {
    const p = this.currentPos;
    return this.source.substring(p, p + len);
  }

  /**
   * Get a sub-string
   * @param {number} start
   * @param {number} stop
   * @return {string}
   */
  slice(start, stop) {
    return this.source.slice(start, stop);
  }

  /**
   * Parse a text fragment
   * @return {object}
   */
  parseText() {
    const savedPos = this.currentPos;
    while (this.currentPos < this.source.length) {
      const char = this.nextChar();
      if ((char === '\n') || (char === '<') || (char === '\\')) break;
    }
    const res = {
      location: savedPos,
      type: 'text',
      text: this.source.substring(savedPos, this.currentPos),
    };
    return res;
  }

  /**
   * Parse a size value
   * @return {null|number}
   */
  parseSizeValue() {
    const savedPos = this.currentPos;
    let char = this.thisChar();
    while (true) {
      if ((char === '') || (char === '\n')) { // EOF or EOL
        this.currentPos = savedPos;
        throw this.error('Syntax error', savedPos);
      }
      if (char === '>') break;
      if ('0123456789'.indexOf(char)===-1) {
        this.currentPos = savedPos;
        throw this.error('Syntax error', savedPos);
      }
      char = this.nextChar();
    }
    return parseInt(this.slice(savedPos, this.currentPos));
  }

  /**
   * Parse a color text
   * @return {object}
   */
  parseSize() {
    const savedPos = this.currentPos;
    let startTag = '<size';
    let sizeValue;
    const innerContent = [];
    let innerText = '';

    this.currentPos = this.currentPos + startTag.length;
    const char = this.thisChar();

    if (char === '=') {
      this.nextChar();
      sizeValue = this.parseSizeValue();
      startTag = this.source.substring(savedPos, this.currentPos + 1);
      this.nextChar();
    } else if (char === '>') {
      sizeValue = null;
      startTag = this.source.substring(savedPos, this.currentPos + 1);
      this.nextChar();
    } else {
      throw this.error('Syntax error', savedPos, startTag.length);
    }

    while (true) {
      const c = this.parseNext();

      if (c.type === 'eof') {
        throw this.error('Missing </size> tag', savedPos, startTag.length);
      }

      if (c.type === 'end-tag') {
        if (c.for === 'size') break;
        throw this.error('Missing </size> tag', savedPos, startTag.length);
      }

      innerText += c.text;
      innerContent.push(c);
    }

    const res = {
      location: savedPos,
      type: 'size',
      value: sizeValue,
      inner: innerContent,
      text: innerText,
    };
    return res;
  }

  /**
   * Parse a color value
   * @return {null|string}
   */
  parseColorValue() {
    const savedPos = this.currentPos;

    let value = '';
    let valid = true;

    let char = this.thisChar();
    if (char === '#') {
      value = '#';
      while (true) {
        char = this.nextChar();
        if ((char === '') || (char === '\n')) { // EOF or EOL
          this.currentPos = savedPos;
          throw this.error('Syntax error', savedPos);
        }
        if (char === '>') break;
        if (Hexadecimal.indexOf(char)===-1) valid = false;
        if (valid) value += char;
      }
      if (value.length === 1) valid = false;
      if (value.length > 9) valid = false;
    } else {
      while (true) {
        if ((char === '') || (char === '\n')) { // EOF or EOL
          this.currentPos = savedPos;
          throw this.error('Syntax error', savedPos);
        }
        if (char === '>') break;
        value = value + char;
        char = this.nextChar();
      }
      value = value.toLowerCase();
      if (NamedColors.indexOf(value.toLowerCase()) === -1) {
        valid = false;
      };
    }
    return valid?value:'white';
  }

  /**
   * Parse a color text
   * @return {object}
   */
  parseColor() {
    const savedPos = this.currentPos;
    let startTag = '<color';
    let colorValue;
    const innerContent = [];
    let innerText = '';

    this.currentPos = this.currentPos + startTag.length;
    const char = this.thisChar();

    if (char === '=') {
      this.nextChar();
      colorValue = this.parseColorValue();
      startTag = this.source.substring(savedPos, this.currentPos + 1);
      this.nextChar();
    } else if (char === '>') {
      colorValue = null;
      startTag = this.source.substring(savedPos, this.currentPos + 1);
      this.nextChar();
    } else {
      throw this.error('Syntax error', savedPos, startTag.length);
    }

    while (true) {
      const c = this.parseNext();

      if (c.type === 'eof') {
        throw this.error('Missing </color> tag', savedPos, startTag.length);
      }

      if (c.type === 'end-tag') {
        if (c.for === 'color') break;
        throw this.error('Missing </color> tag', savedPos, startTag.length);
      }

      innerText += c.text;
      innerContent.push(c);
    }

    const res = {
      location: savedPos,
      type: 'color',
      value: colorValue,
      inner: innerContent,
      text: innerText,
    };
    return res;
  }

  /**
   * Parse a bold text
   * @return {object}
   */
  parseBold() {
    const savedPos = this.currentPos;
    const innerContent = [];
    let innerText = '';

    this.currentPos = this.currentPos + '<b>'.length;

    while (true) {
      const c = this.parseNext();

      if (c.type === 'eof') {
        throw this.error('Missing </b> tag', savedPos, 3);
      }

      if (c.type === 'end-tag') {
        if (c.for === 'b') break;
        throw this.error('Missing </b> tag', savedPos, 3);
      }

      innerText += c.text;
      innerContent.push(c);
    }

    const res = {
      location: savedPos,
      type: 'bold',
      inner: innerContent,
      text: innerText,
    };
    return res;
  }

  /**
   * Parse a italic text
   * @return {object}
   */
  parseItalic() {
    const savedPos = this.currentPos;
    const innerContent = [];
    let innerText = '';

    this.currentPos = this.currentPos + '<b>'.length;

    while (true) {
      const c = this.parseNext();

      if (c.type === 'eof') {
        throw this.error('Missing </i> tag', savedPos, 3);
      }

      if (c.type === 'end-tag') {
        if (c.for === 'i') break;
        throw this.error('Missing </i> tag', savedPos, 3);
      }

      innerText += c.text;
      innerContent.push(c);
    }

    const res = {
      location: savedPos,
      type: 'italic',
      inner: innerContent,
      text: innerText,
    };
    return res;
  }

  /**
   * "</" found. Attempt to parse a close tag
   * @return {object}
   */
  parseEndTag() {
    const savedPos = this.currentPos;

    let tag = this.subString('</b>'.length).toLowerCase();

    if (tag === '</b>') {
      this.currentPos = savedPos + '</b>'.length;
      return {location: savedPos, type: 'end-tag', for: 'b', text: ''};
    }

    if (tag === '</i>') {
      this.currentPos = savedPos + '</i>'.length;
      return {location: savedPos, type: 'end-tag', for: 'i', text: ''};
    }

    tag = this.subString('</color>'.length).toLowerCase();
    if (tag === '</color>') {
      this.currentPos = savedPos + '</color>'.length;
      return {location: savedPos, type: 'end-tag', for: 'color', text: ''};
    }

    tag = this.subString('</size>'.length).toLowerCase();
    if (tag === '</size>') {
      this.currentPos = savedPos + '</size>'.length;
      return {location: savedPos, type: 'end-tag', for: 'size', text: ''};
    }

    this.currentPos = savedPos + 2;
    const res = {
      location: savedPos,
      type: 'text',
      text: '</',
    };
    return res;
  }

  /**
   * Parse next token
   * @return {URTToken}
   */
  parseNext() {
    if (!(this.currentPos < this.source.length)) {
      return {
        location: this.currentPos,
        type: 'eof',
        text: '',
      };
    };

    const char = this.thisChar();
    const nextChar = this.source.charAt(this.currentPos+1);

    if (char === '<') {
      let tag = this.subString('<b>'.length).toLowerCase();
      if (tag === '<b>') return this.parseBold();
      if (tag === '<i>') return this.parseItalic();
      tag = this.subString('<color'.length).toLowerCase();
      if (tag === '<color') return this.parseColor();
      tag = this.subString('<size'.length).toLowerCase();
      if (tag === '<size') return this.parseSize();
      if (nextChar == '/') return this.parseEndTag();
    };

    if (char === '\n') {
      const res = {
        location: this.currentPos,
        type: 'line-break',
        text: '\n',
      };
      this.currentPos++;
      return res;
    };

    if (char === '\\' && (nextChar === 'n')) {
      const res = {
        location: this.currentPos,
        type: 'line-break',
        text: '\\n',
      };
      this.currentPos += 2;
      return res;
    }
    return this.parseText();
  }

  /**
   * Parse Unity RichText text
   * @param {string} source
   */
  parse(source) {
    this.currentPos = 0;
    this.source = source;
    this.root.length = 0;
    while (true) {
      const next = this.parseNext();
      if (next.type === 'eof') break;
      this.root.push(next);
    }
  }

  /**
   * Render formatted text
   * @return {string} - Formatted text (in HTML code)
   */
  render() {
    return this.renderTokens(this.root);
  }

  /**
   * Serialize an element array to HTML
   * @param {object[]} tokens
   * @return {string}
   */
  renderTokens(tokens) {
    return tokens.map((c) => this.renderToken(c)).join('');
  }

  /**
   * Convert a parsed token to HTML
   * @param {object} token
   * @return {string}
   */
  renderToken(token) {
    let inner;
    switch (token.type) {
      case 'bold':
        return '<b>' + this.renderTokens(token.inner) + '</b>';
      case 'italic':
        return '<i>' + this.renderTokens(token.inner) + '</i>';
      case 'color':
        inner = this.renderTokens(token.inner);
        if (token.value === null) return inner;
        return `<span style="color:${token.value}">` + inner + '</span>';
      case 'size':
        inner = this.renderTokens(token.inner);
        if (token.value === null) return inner;
        const size = Math.floor(token.value * 4 / 10);
        return `<span style="font-size:${size}px">` + inner + '</span>';
      case 'line-break':
        return '<br>';
      default:
        return token.text
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;');
    }
  }
};

/**
 * @typedef {Object} EditAction - Input action (in Undo/Redo history)
 * @property {string} inputType - Input type of the event
 * @property {string} insertedText - Text added to the input
 * @property {string} replacedText - Text that was replaced
 * @property {number} startPos - Start position of inserted text
 * @property {number} endPos - Start position of inserted text
 * @property {'select'|'start'|'end'} selectionMode - Selection mode after undo/redo
 * @property {boolean} chained - Is this a chained event?
 * @property {EditAction} [undo] - Previous undo
 */

/**
 * Unity Rich Text editor
 */
class URTEditor {
  /**
   * Create a new editor
   * @param {HTMLTextAreaElement} input - HTML element for text input
   * @param {HTMLDivElement} output - HTML element for preview rendering
   */
  constructor(input, output) {
    /** @type {HTMLTextAreaElement} */
    this.element = input;

    /** @type {HTMLDivElement} */
    this.preview = output;

    /** @type {string} - IME input text */
    this.imeBefore = '';
    /** @type {number} - IME selection start position */
    this.imeTextStart = 0;
    /** @type {number} - IME selection end position*/
    this.imeTextEnd = 0;

    /** @type {string} selected text */
    this.selectedText = '';

    /** @type EditAction[] */
    this.undoStack = [];
    /** @type EditAction[] */
    this.redoStack = [];

    /** @type {URTParser} */
    this.parser = new URTParser();

    /** @type {number} Timer ID for preview cooldown */
    this.previewDelay = 0;

    /** @type {boolean} Is the editor under preview cooldown? */
    this.previewPending = false;
  }

  /**
   * Validate input and generate a preview
   */
  render() {
    if (this.previewPending) clearTimeout(this.previewDelay);
    this.element.classList.remove('preview-pending');
    this.previewPending = false;

    const inputText = this.element.value;
    try {
      this.parser.parse(inputText);
      const renderedHTML = this.parser.render();
      this.preview.classList.remove('error');
      this.preview.innerHTML = renderedHTML;
    } catch (e) {
      this.preview.classList.add('error');
      this.preview.innerHTML = e.formattedError;
    }
  }

  /**
   * Watch for input change
   */
  startPreviewCooldown() {
    if (previewPending) {
      clearTimeout(this.previewDelay);
    } else {
      previewPending = true;
      bodyInputElement.classList.add('preview-pending');
    };
    this.previewDelay = setTimeout(updatePreview, 800);
  }

  /**
   * Get selection text
   * @return {string}
   */
  getSelectionText() {
    return this.element.value.slice(
        this.element.selectionStart,
        this.element.selectionEnd,
    );
  }

  /**
   * Event handler for selection change
   * @param {InputEvent} e
   */
  selectionChange(e) {
    this.selectedText = this.getSelectionText();
  }


  /**
   * Add an action to undo history
   * @param {EditAction} action
   */
  pushUndo(action) {
    this.undoStack.push(action);
    this.redoStack.length = 0; // Clear redo history
  }

  /**
   * Undo change
   * @param {*} chained - Continue to do next Undo?
   */
  undo(chained) {
    const {element, undoStack, redoStack} = this;
    if (undoStack.length === 0) return;

    const action = this.undoStack.pop();
    element.setRangeText(
        action.replacedText,
        action.startPos,
        action.endPos,
        action.selectionMode);

    this.element.focus();

    this.redoStack.push({
      inputType: action.inputType,
      insertedText: action.replacedText,
      replacedText: action.insertedText,
      startPos: action.startPos,
      endPos: action.startPos + action.replacedText.length,
      selectionMode: action.selectionMode,
      chained: chained,
      undo: action,
    });

    if (action.chained) this.undo(true);
    else this.startPreviewCooldown();
  }

  /**
   * Redo change
   */
  redo() {
    if (this.redoStack.length === 0) return;
    const data = this.redoStack.pop();
    this.element.setRangeText(
        data.replacedText,
        data.startPos,
        data.endPos,
        data.selectionMode,
    );

    this.element.focus();

    this.undoStack.push(data.undo);

    if (data.chained) this.redo();
    else this.startPreviewCooldown();
  }


  /**
  * Event handler for IME input change
  * @param {InputEvent} e
  */
  imgChange(e) {
    const {element, imeBefore, imeTextStart, imeTextEnd} = this;

    // If all input were deleted
    if (imeTextStart === element.selectionEnd) return;

    const imeAfter =
      element.value.slice(imeTextStart, imeTextEnd);

    this.pushUndo({
      inputType: 'insertCompositionText',
      insertedText: imeAfter,
      replacedText: imeBefore,
      startPos: imeTextStart,
      endPos: imeTextEnd,
      selectionMode: 'end',
    });
  }

  /**
   * Event handler for IME composition start
   * @param {InputEvent} e
   */
  imeStart(e) {
    this.imeBefore = this.selectedText;
  }

  /**
   * Event handler for IME composition update
   * @param {InputEvent} e
   */
  imeUpdate(e) {
    this.imeTextStart = this.element.selectionStart;
    this.imeTextEnd = this.element.selectionEnd;
  }

  /**
   * Chained addEventListener
   * @param {string} type
   * @param {function} handler
   * @return {URTEditor}
   */
  on(type, handler) {
    this.element.addEventListener(type, handler);
    return this;
  }

  /** Initialize the editor object */
  initialize() {
    this
        .on('selectionchange', (e) => this.selectionChange(e))
        .on('compositionstart', (e) => this.imeStart(e))
        .on('compositionupdate', (e) => this.imeUpdate(e))
        .on('compositionend', (e) => this.imgChange(e));
  }
}

// Undo/Redo
/** @type EditAction[] */ const undoStack = [];
/** @type EditAction[] */ const redoStack = [];

/** @type {string} selected text */
let selectedText = '';

const bodyInputElement = document.getElementById('message-body-input');
const titleInputElement = document.getElementById('message-title-input');

const downloadLinkElement = document.getElementById('download-link');
const fileSelectorElement = document.getElementById('file-selector');

let previewDelay;
let previewPending = false;
const previewElement = document.getElementById('output');

const flashNoticeElement = document.getElementById('flash-notice');
let flashNoticeDelay = null;

const editor = new URTEditor(bodyInputElement, previewElement);
editor.initialize();

// IME
/** @type {string} */ let imeBefore;
/** @type {number} */ let imeTextStart;
/** @type {number} */ let imeTextEnd;

// Override command keystrokes
(function(input) {
  const macOS = (navigator.userAgent.toLowerCase().indexOf('mac os') !== -1);
  if (macOS) {
    document.body.addEventListener('keydown', (e) => {
      if ((e.metaKey) && (e.key === 'z')) e.preventDefault();
    });
    input.addEventListener('keydown', (e) => {
      if (!e.metaKey) return;
      if (e.key === 'z') {
        if (!e.shiftKey) undoAction();
        else redoAction();
      }
    });
  } else {
    document.body.addEventListener('keydown', (e) => {
      if (e.ctrlKey) {
        if ((e.key === 'z') || (e.key === 'y')) e.preventDefault();
      }
    });
    input.addEventListener('keydown', (e) => {
      if (!e.ctrlKey) return;
      if (e.key === 'z') {
        if (!e.shiftKey) undoAction();
        else redoAction();
      } else if (e.key === 'y') {
        redoAction();
      }
    });
  }
})(bodyInputElement);

/**
 * Initialize editor user interface
 */
function initializeEditorUi() {
  // Initialize text size options
  const sizeListElement = document.getElementById('size-list');
  const _sizeOptions = textSizeOptions || [30, 35, 40, 50];
  const _defaultSize = defaultTextSize || 30;
  _sizeOptions.forEach((value) => {
    const anchor = document.createElement('a');
    anchor.innerText = `${value}px`;
    anchor.style.setProperty('font-size', `${value/2.5}px`);
    if (value !== _defaultSize) {
      anchor.setAttribute('href', '#');
      anchor.setAttribute('data-value', value);
      anchor.addEventListener('click', setTextSize);
    }
    sizeListElement.appendChild(anchor);
  });

  // Initialize text color options
  const colorListElement = document.getElementById('color-list');
  const _colorOptions = textColorOptions || [
    '#B8F', '#D9F', '#F33', '#F99', '#F80', '#FB0',
    '#6D0', '#3F2', '#1BF', '#3EF', '#8DF',
  ];
  _colorOptions.forEach((value) => {
    const anchor = document.createElement('a');
    anchor.classList.add('color-chip');
    anchor.style.setProperty('background-color', value);
    anchor.setAttribute('href', '#');
    anchor.setAttribute('data-value', value);
    anchor.addEventListener('click', setTextColor);
    colorListElement.appendChild(anchor);
  });
}

/**
 * Validate input and generate a preview
 */
function updatePreview() {
  if (previewPending) clearTimeout(previewDelay);
  bodyInputElement.classList.remove('preview-pending');
  previewPending = false;

  const inputText = bodyInputElement.value;
  try {
    parser.parse(inputText);
    const previewText = parser.render();
    previewElement.classList.remove('error');
    previewElement.innerHTML = previewText;
  } catch (e) {
    previewElement.classList.add('error');
    previewElement.innerHTML = e.formattedError;
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
    bodyInputElement.classList.add('preview-pending');
  };
  previewDelay = setTimeout(updatePreview, 800);
}

/**
 * Save text to file
 * @param {string} suggestedName
 */
function saveFile(suggestedName) {
  const blob = new Blob(
      [bodyInputElement.value],
      {type: 'text/plain;charset=utf-8'},
  );
  const blobURL = URL.createObjectURL(blob);
  downloadLinkElement.href = blobURL;
  downloadLinkElement.download = suggestedName;
  downloadLinkElement.click();
  setTimeout(() => URL.revokeObjectURL(blobURL), 1000);
}

/**
 * Open a text file
 * @param {string} suggestedName
 */
function openFile() {
  fileSelectorElement.click();
}

/**
 * Read file from FilePicker
 * @param {Event} e
 */
function readFile(e) {
  const file = e.target.files[0];

  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    bodyInputElement.value = e.target.result;
    updatePreview();
  };
  reader.readAsText(file);
}

/**
 * Copy text to the clipboard
 * @param {'title'|'body'} content - content to copy
 */
function copyInput(content) {
  if (content==='title') {
    navigator.clipboard.writeText(bodyInputElement.value);
  } else {
    // from https://stackoverflow.com/questions/1173194/
    if (document.selection) { // IE
      const range = document.body.createTextRange();
      range.moveToElementText(bodyInputElement);
      range.select();
    } else if (window.getSelection) {
      const range = document.createRange();
      range.selectNode(bodyInputElement);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }

    navigator.clipboard.writeText(bodyInputElement.value);
  }


  if (flashNoticeDelay) clearTimeout(flashNoticeDelay);
  flashNoticeElement.classList.add('show');
  flashNoticeDelay = setTimeout(() => {
    flashNoticeElement.classList.remove('show');
    flashNoticeDelay = null;
  }, 3000);
}

/**
 * Add a color tag
 * @param {Event} event
 */
function setTextColor(event) {
  event.stopPropagation();
  const value = event.target.dataset.value;
  setFormatting(`<color=${value}>`, '</color>');
}

/** Add a bold tag */
function setBold() {
  setFormatting('<b>', '</b>');
}

/** Add an italic tag */
function setItalic() {
  setFormatting('<i>', '</i>');
}

/**
 * Add a size tag
 * @param {Event} event
 */
function setTextSize(event) {
  event.stopPropagation();
  const value = event.target.dataset.value;
  setFormatting(`<size=${value}>`, '</size>');
}


/**
 * Format the selected text
 * @param {*} startTag
 * @param {*} endTag
 */
function setFormatting(startTag, endTag) {
  const selStart = bodyInputElement.selectionStart;
  const selEnd = bodyInputElement.selectionEnd;

  const inserted = startTag + selectedText + endTag;

  bodyInputElement.focus();

  bodyInputElement.setRangeText(inserted, selStart, selEnd, 'select');

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
  bodyInputElement.setRangeText(
      data.replacedText,
      data.startPos,
      data.endPos,
      data.selectionMode);

  bodyInputElement.focus();

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
  bodyInputElement.setRangeText(
      data.replacedText,
      data.startPos,
      data.endPos,
      data.selectionMode,
  );

  bodyInputElement.focus();

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
  return bodyInputElement.value.slice(
      bodyInputElement.selectionStart,
      bodyInputElement.selectionEnd,
  );
}

/**
 * Handle IME input change event
 * @param {InputEvent} e
 */
function handleIMEChange(e) {
  // If all input were deleted
  if (imeTextStart === bodyInputElement.selectionEnd) return;

  undoStack.push({
    inputType: 'insertCompositionText',
    insertedText: bodyInputElement.value.slice(imeTextStart, imeTextEnd),
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
        startPos: bodyInputElement.selectionEnd,
        endPos: bodyInputElement.selectionEnd,
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
        startPos: bodyInputElement.selectionEnd,
        endPos: bodyInputElement.selectionEnd,
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
        startPos: bodyInputElement.selectionEnd,
        endPos: bodyInputElement.selectionEnd,
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
        startPos: bodyInputElement.selectionStart,
        endPos: bodyInputElement.selectionEnd,
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
        startPos: bodyInputElement.selectionEnd - 1,
        endPos: bodyInputElement.selectionEnd,
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
          startPos: bodyInputElement.selectionEnd - e.data.length,
          endPos: bodyInputElement.selectionEnd,
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
 * Cache content deleted by BackSpace/Delete
 * @param {InputEvent} e
 */
function beforeInputChange(e) {
  if (
    bodyInputElement.selectionStart ===
    bodyInputElement.selectionEnd
  ) {
    switch (e.inputType) {
      case 'deleteContentBackward':
        selectedText = bodyInputElement.value.slice(
            bodyInputElement.selectionStart - 1,
            bodyInputElement.selectionEnd,
        );
        return;
      case 'deleteContentForward':
        selectedText = bodyInputElement.value.slice(
            bodyInputElement.selectionStart,
            bodyInputElement.selectionEnd + 1,
        );
        return;
    }
  }
}

/**
 * Process paste command
 * @param {InputEvent} e
 */
function handlePaste(e) {
  const value = e.clipboardData.getData('text');
  undoStack.push({
    inputType: 'paste',
    insertedText: value,
    replacedText: selectedText,
    startPos: bodyInputElement.selectionEnd,
    endPos: bodyInputElement.selectionEnd + value.length,
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
    startPos: bodyInputElement.selectionStart,
    endPos: bodyInputElement.selectionStart,
    selectionMode: 'select',
    chained: false,
  });
  redoStack.length = 0;
}

// bodyInputElement.addEventListener('compositionstart', compositionStart);
// bodyInputElement.addEventListener('compositionupdate', compositionUpdate);
// bodyInputElement.addEventListener('compositionend', handleIMEChange);
bodyInputElement.addEventListener('cut', handleCutEvent);
bodyInputElement.addEventListener('paste', handlePaste);
bodyInputElement.addEventListener('beforeinput', beforeInputChange);
bodyInputElement.addEventListener('input', handleChangeEvent);
bodyInputElement.addEventListener('input', startPreviewCooldown);

// // Update selection
// document.addEventListener('selectionchange', handleSectionChange);

updatePreview();
