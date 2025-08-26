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

/** @typedef {import('./textarea.js').URTTextAreaElement} URTTextAreaElement */

/**
 * @typedef {Object} URTOptions - Initialization options for URTEditor
 * @property {number} maxLength - Character limit (-1 if it's unlimited)
 * @property {number[]} textSizeOptions - Text size options
 * @property {string[]} textColorOptions - Text color options
 * @property {number} defaultTextSize - Default text size
 * @property {string} defaultTextColor - Default text color
 * @property {string} defaultBackgroundColor - Default background color
 */

/** Custom TextArea element with undo/redo stack */
export class URTEditorElement extends HTMLDivElement {
  // static observedAttributes = ['max'+'length'];
  /** Constructor */
  constructor() {
    super(); // Always call super first in constructor

    const shadow = this.attachShadow({mode: 'open'});
    const template = document.getElementById('urt-editor-template');
    shadow.appendChild(template.content);
  }

  /** @type {URTParser} */
  parser = new URTParser();

  /** @type {URTTextAreaElement} - Input element for message body */
  bodyInput;

  /** @type {HTMLInputElement} - Input element for message title */
  titleInput;

  /** @type {HTMLDivElement} - Element for preview rendering */
  preview;

  /** @type {HTMLDivElement} - Toolbar element   */ toolbar;
  /** @type {HTMLDivElement} - Statusbar element */ statusbar;
  /** @type {HTMLDivElement} - Title bar element */ titlebar;

  /** @type {HTMLAnchorElement} - Hidden element (a#file-download) */
  saveFileLink;
  /** @type {HTMLButtonElement} - Toolbar button for saving a file */
  saveFileButton;

  /** Called when added to DOM */
  connectedCallback() {
  }

  /** Called when removed to DOM */
  disconnectedCallback() {
  }

  /** Called when moved within DOM */
  connectedMoveCallback() {
  }

  /**
   * Called when observed attributes are changed
   * @param {*} name Attribute name
   * @param {*} oldValue Old attribute value
   * @param {*} newValue New attribute value
   */
  attributeChangedCallback(name, oldValue, newValue) {
  }

  /**
   * Validate input and generate a preview
   */
  render() {
    const inputText = this.bodyInput.value;
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
   * Format the selected text
   * @param {string} startTag
   * @param {string} endTag
   */
  formatText(startTag, endTag) {
    const input = this.bodyInput;
    const selStart = input.selectionStart;
    const selEnd = input.selectionEnd;
    const replaced = input.getSelectionText();
    const inserted = startTag + replaced + endTag;
    this.bodyInput.edit(inserted, selStart, selEnd)
  }

  /**
   * Wrap selected text with color tag
   * @param {PointerEvent} e
   */
  setTextColor(e) {
    e.stopPropagation();
    const value = e.target.dataset.value;
    this.formatText(`<color=${value}>`, '</color>');
  }

  /**
   * Wrap selected text with size tag
   * @param {PointerEvent} e
   */
  setTextSize(e) {
    e.stopPropagation();
    const value = e.target.dataset.value;
    this.formatText(`<size=${value}>`, '</size>');
  }

  /**
   * Wrap selected text with bold tag
   * @param {PointerEvent} e
   */
  setBold(e) {
    e.stopPropagation();
    this.formatText('<b>', '</b>');
  }

  /**
   * Wrap selected text with italic tag
   * @param {PointerEvent} e
   */
  setItalic(e) {
    e.stopPropagation();
    this.formatText('<i>', '</i>');
  }


  /**
   * Read file from FilePicker
   * @param {Event} e
   */
  readFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const editor = this;
    const reader = new FileReader();
    reader.onload = (e) => {
      editor.bodyInput.clearUpdateDelay();
      editor.bodyInput.clearHistory();
      editor.bodyInput.value = e.target.result;
      editor.render();
    };
    reader.readAsText(file);
  }

  /**
   * Save text to file
   * @param {string} suggestedName
   */
  saveFile(suggestedName) {
    const blob = new Blob(
        [this.bodyInput.value],
        {type: 'text/plain;charset=utf-8'},
    );
    const blobURL = URL.createObjectURL(blob);
    this.saveFileLink.href = blobURL;
    this.saveFileLink.download = suggestedName;
    this.saveFileLink.click();
    setTimeout(() => URL.revokeObjectURL(blobURL), 1000);
  }

  /**
   * Copy text to the clipboard
   * @param {'title'|'body'} content - content to copy
   */
  copyBodyToClipboard() {
    // from https://stackoverflow.com/questions/1173194/
    const range = document.createRange();
    range.selectNode(this.bodyInput);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);

    navigator.clipboard.writeText(this.bodyInput.value);

    // if (flashNoticeDelay) clearTimeout(flashNoticeDelay);
    // flashNoticeElement.classList.add('show');
    // flashNoticeDelay = setTimeout(() => {
    //   flashNoticeElement.classList.remove('show');
    //   flashNoticeDelay = null;
    // }, 3000);
  }

  /**
   * Link a preview element
   * @param {HTMLDivElement} element
   */
  linkPreview(element) {
    this.preview = element;
  }

  /**
   * Initialize the editor UI
   * @param {URTOptions} options
   */
  initialize(options) {
    const shadow = this.attachShadow({mode: 'open'});
    const template = document.getElementById('urt-editor-template');
    shadow.appendChild(template.content);

    /** @type {HTMLInputElement} - Hidden element (input#file-selector) */
    const fileSelector = shadow.getElementById('open-file-selector');
    fileSelector.addEventListener('change', (e) => this.readFile(e));
    /** @type {HTMLButtonElement} - Toolbar button for opening a file */
    const openFileButton = shadow.getElementById('open-file-button');
    openFileButton.addEventListener('click', (e) => fileSelector.click());

    this.saveFileButton = shadow.getElementById('save-file-button');
    this.saveFileButton.addEventListener('click', (e) => this.saveFile());
    this.saveFileLink = shadow.getElementById('save-file-link');

    this.bodyInput = shadow.getElementById('message-body-input');
    this.titleInput = shadow.getElementById('message-title-input');
    this.toolbar = shadow.getElementById('toolbar');
    this.statusbar = shadow.getElementById('statusbar');

    if (options.maxLength > 0) {
      this.bodyInput.setAttribute('maxLength', options.maxLength);
    }

    // Initialize text size options
    /** @type {HTMLDivElement} */
    const textSizeList = shadow.getElementById('size-list');
    const textSizeOptions =
      (
        Array.isArray(options.textSizeOptions) &&
        (options.textSizeOptions.length)
      )?
      options.textSizeOptions:
      [30, 35, 40, 50];
    const defaultTextSize = options.defaultTextSize || textSizeOptions[0];
    textSizeOptions.forEach((value) => {
      const anchor = shadow.createElement('a');
      anchor.innerText = `${value}px`;
      anchor.style.setProperty('font-size', `${value/2.5}px`);
      if (value !== defaultTextSize) {
        anchor.setAttribute('href', '#');
        anchor.setAttribute('data-value', value);
        anchor.addEventListener('click', (e) => this.setTextSize(e));
      }
      textSizeList.appendChild(anchor);
    });

    // Initialize text color options
    const textColorList = shadow.getElementById('color-list');
    const colorOptions =
      (
        Array.isArray(options.textColorOptions) &&
        (options.textColorOptions.length)
      )?
      options.textColorOptions:
      [
        '#B8F', '#D9F', '#F33', '#F99', '#F80', '#FB0',
        '#6D0', '#3F2', '#1BF', '#3EF', '#8DF',
      ];

    colorOptions.forEach((value) => {
      const anchor = shadow.createElement('a');
      anchor.classList.add('color-chip');
      anchor.style.setProperty('background-color', value);
      anchor.setAttribute('href', '#');
      anchor.setAttribute('data-value', value);
      anchor.addEventListener('click', (e) => this.setTextColor(e));
      textColorList.appendChild(anchor);
    });
  }

  /**
   * Activate the editor
   */
  activate() {}
}

const macOS = (navigator.userAgent.toLowerCase().indexOf('mac os') !== -1);
if (macOS) {
  document.body.addEventListener('keydown', (e) => {
    if ((e.metaKey) && (e.key === 'z')) e.preventDefault();
  });
} else {
  document.body.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
      if ((e.key === 'z') || (e.key === 'y')) e.preventDefault();
    }
  });
}

// const flashNoticeElement = document.getElementById('flash-notice');
// let flashNoticeDelay = null;

// const urtEditor = new URTEditorElement();
// const urtPreview = document.getElementById('preview');
// urtEditor.initialize();
// urtEditor.linkPreview(urtPreview);
// urtEditor.render();
