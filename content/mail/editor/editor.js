// eslint-env browser
/* ---eslint-disable no-unused-vars */

// Undo/redo stack code is partly based on
// https://github.com/shikatan0/textarea-undo-redo/blob/master/src/index.ts


/**
 * Helper function for encoding title as
 * filename without conflict with OS File system
 * @param {string} title
 * @return {string}
 */
const encodeTitle = (title) => (title
    .replace(
        // Escape % ! * " < > ? : \ / | + , . ; = * [ ]
        /[%!*"<>?:\\/|+,.;=*\[\]]/g,
        (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
    ));

/**
 * Helper function for decoding filename
 * @param {encoded} encoded
 * @return {string}
 */
const decodeTitle = (encoded) => (encoded
    .replace(
        /%[0-9A-Z]{2}/g,
        (c) => String.fromCharCode(parseInt(c.slice(1), 16)),
    ));

const Hexadecimal = '0123456789abcdefABCDEF';
const NamedColors = [
  'aqua', 'black', 'blue', 'brown', 'cyan', 'darkblue', 'fuchsia',
  'green', 'grey', 'lightblue', 'lime', 'magenta', 'maroon', 'navy',
  'olive', 'orange', 'purple', 'red', 'silver', 'teal', 'white',
  'yellow',
];

/** // Rich Text Tokens
 *
 * @typedef {Object} RTOpenTag - Token for an open tag
 * @property {'open-tag'} type - Tag type
 * @property {number} position - Start position of the token within the source
 * @property {number} length - Length of the token code within the source
 * @property {'b'|'i'|'color'|'size'} tagName - Tag name
 * @property {string|number} [tagValue] - Tag value
 *
 * @typedef {Object} RTCloseTag - Token for a close tag
 * @property {'close-tag'} type - Tag type
 * @property {number} position - Start position of the token within the source
 * @property {number} length - Length of the token code within the source
 * @property {'b'|'i'|'color'|'size'} tagName - Tag name
 *
 * @typedef {Object} RTLineFeed - Token for a line feed
 * @property {'line-feed'} type - Token type
 * @property {number} position - Start position of the token within the source
 * @property {number} length - Length of the token code within the source
 * @property {string} text - Text
 *
 * @typedef {Object} RTText - Token for a plain text
 * @property {'text'} type - Token type
 * @property {number} position - Start position of the token within the source
 * @property {number} length - Length of the text within the source
 * @property {string} text - Text
 *
 * @typedef {Object} RTFormattedText - Token for a formatted text
 * @property {'formatted'} type - Token type
 * @property {number} position - Start position of the token within the source
 * @property {number} length - Length of the code within the source
 * @property {'b'|'i'|'color'|'size'} format - Formatting type
 * @property {string|number} [value] - Formatting value
 * @property {RTOpenTag} openTag - Open tag
 * @property {RTCloseTag} closeTag - Close tag
 * @property {RTToken[]} children - Child tokens
 * @property {string} text - Text
 *
 * @typedef {RTLineFeed|RTText|RTFormattedText} RTToken
 * Node of a Rich Text AST
 */

/** Parser for formatted text in Unity RichText widget */
class URTParser {
  /**
   * @type {number}
   * Current parser position
   */
  currentPos = 0;

  /**
   * @type {string}
   * Source
   */
  source = '';

  /**
   * @type {RTToken[]}
   * Document root
   */
  root = [];

  /** Constructor */
  constructor() {
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
  };

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
  };

  /**
   * Advance cursor position and get next character
   * @return {string}
   */
  nextChar() {
    return this.source.charAt(++this.currentPos);
  };

  /**
   * Get character at current cursor position
   * @return {string}
   */
  thisChar() {
    return this.source.charAt(this.currentPos);
  };

  /**
   * Get a string fragment of certain length from current position
   * @param {number} len - length
   * @return {string}
   */
  peak(len=1) {
    const p = this.currentPos;
    return this.source.substring(p, p + len);
  };

  /**
   * Parse a text token
   * @return {RTText}
   */
  parseText() {
    const savedPos = this.currentPos;
    while (this.currentPos < this.source.length) {
      const char = this.nextChar();
      if ((char === '\\') && (this.peak(2)=== '\\n')) break;
      if (char === '<') break;
    }

    /** @type {RTText} */
    const token = {
      type: 'text',
      location: savedPos,
      length: this.currentPos - savedPos,
      text: this.source.substring(savedPos, this.currentPos),
    };
    return token;
  };

  /**
   * Parse an integer value
   * @return {string}
   */
  parseIntegerValue() {
    const savedPos = this.currentPos;
    const _start = savedPos;
    const _end = this.source.indexOf('>', _start);

    if (_end < 0) throw this.error('Syntax error', savedPos);

    let _value = this.source.slice(_start, _end);

    if (_value.startsWith('"') && _value.endsWith('"')) {
      _value = _value.slice(1, -1);
    }

    const value = parseInt(_value);
    if (Number.isNaN(value)) return null;
    this.currentPos = _end;
    return value;
  };

  /**
   * Parse a color value
   * @return {null|string}
   */
  parseColorValue() {
    const savedPos = this.currentPos;
    const _start = savedPos;
    const _end = this.source.indexOf('>', _start);

    if (_end < 0) throw this.error('Syntax error', savedPos);

    let _value = this.source.slice(_start, _end).toLowerCase();

    if (_value.startsWith('#')) {
      const isValid = [..._value.slice(1)].reduce(
          (valid, char) => valid && (Hexadecimal.indexOf(char) >= 0),
          true,
      );
      if (!isValid) _value = null;
    } else {
      if (NamedColors.indexOf(_value) === -1) _value = null;
    }

    this.currentPos = _end;
    return _value;
  };

  /**
   * Parse a size node
   * @return {RTToken}
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
      sizeValue = this.parseIntegerValue();
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

    /** @type {RTToken} */
    const token = {
      location: savedPos,
      type: 'size',
      value: sizeValue,
      inner: innerContent,
      text: innerText,
    };
    return token;
  };

  /**
   * Parse a formatted text node marked by <color> tag
   * @return {RTFormattedText}
   */
  parseColor() {
    const savedPos = this.currentPos;

    /** @type {RTFormattedText} */
    const node = {
      type: 'formatted',
      position: savedPos,
      length: 0,
      format: 'color',
      value: null,
      openTag: undefined,
      closeTag: undefined,
      children: [],
      text: '',
    };

    this.currentPos = this.currentPos + '<color'.length;

    const char = this.thisChar();
    if (char === '=') {
      this.nextChar();
      const colorValue = this.parseColorValue();
      node.value = colorValue;
      node.openTag = {
        type: 'open-tag',
        position: savedPos,
        length: this.currentPos - savedPos,
        tagName: 'color',
        tagValue: colorValue,
      };
      this.nextChar();
    } else if (char === '>') {
      node.openTag = {
        type: 'open-tag',
        position: savedPos,
        length: this.currentPos - savedPos,
        tagName: 'color',
        tagValue: null,
      };
      this.nextChar();
    } else {
      throw this.error('Syntax error', savedPos, '<color'.length);
    }

    while (true) {
      const childToken = this.parseNext();

      if (childToken.type === 'eof') {
        throw this.error('Missing </color> tag', savedPos, '<color'.length);
      }

      if (childToken.type === 'end-tag') {
        if (childToken.tagName === 'color') {
          node.closeTag = childToken;
          break;
        } else {
          // const text = this.source.slice(
          //     childToken.position,
          //     childToken.position + childToken.length);
          // childToken.text = text;
          // childToken.type = 'text';
          // children.push(childToken);
          throw this.error('Missing </color> tag', savedPos, '<color'.length);
        }
      } else {
        node.text += childToken.text;
        node.children.push(childToken);
      }
    }

    return node;
  };

  /**
   * Parse a bold text
   * @return {RTFormattedText}
   */
  parseBold() {
    const savedPos = this.currentPos;

    /** @type {RTFormattedText} */
    const node = {
      type: 'formatted',
      position: savedPos,
      length: 0,
      format: 'b',
      openTag: undefined,
      closeTag: undefined,
      children: [],
      text: '',
    };

    this.currentPos = this.currentPos + '<b>'.length;

    while (true) {
      const childToken = this.parseNext();

      if (childToken.type === 'eof') {
        throw this.error('Missing </b> tag', savedPos, 3);
      }

      if (childToken.type === 'end-tag') {
        if (childToken.tagName === 'b') {
          node.closeTag = childToken;
          break;
        } else {
          throw this.error('Missing </b> tag', savedPos, '<b>'.length);
        }
      } else {
        node.text += childToken.text;
        node.children.push(childToken);
      }
    }

    return node;
  };

  /**
   * Parse a italic text
   * @return {RTFormattedText}
   */
  parseItalic() {
    const savedPos = this.currentPos;

    /** @type {RTFormattedText} */
    const node = {
      type: 'formatted',
      position: savedPos,
      length: 0,
      format: 'b',
      openTag: undefined,
      closeTag: undefined,
      children: [],
      text: '',
    };

    this.currentPos = this.currentPos + '<i>'.length;

    while (true) {
      const childToken = this.parseNext();

      if (childToken.type === 'eof') {
        throw this.error('Missing </i> tag', savedPos, 3);
      }

      if (childToken.type === 'end-tag') {
        if (childToken.tagName === 'i') {
          node.closeTag = childToken;
          break;
        } else {
          throw this.error('Missing </i> tag', savedPos, '<i>'.length);
        }
      } else {
        node.text += childToken.text;
        node.children.push(childToken);
      }
    }

    return node;
  };

  /**
   * "</" found. Attempt to parse a close tag
   * @return {RTCloseTag|RTText}
   */
  parseEndTag() {
    const savedPos = this.currentPos;

    let tagLen = '</b>'.length;
    let tag = this.peak(tagLen).toLowerCase();


    if (tag === '</b>') {
      this.currentPos = savedPos + tagLen;
      return {
        position: savedPos,
        type: 'end-tag',
        length: tagLen,
        tagName: 'b',
      };
    }

    if (tag === '</i>') {
      this.currentPos = savedPos + tagLen;
      return {
        position: savedPos,
        type: 'end-tag',
        length: tagLen,
        tagName: 'i',
      };
    }

    tagLen = '</color>'.length;
    tag = this.peak(tagLen).toLowerCase();
    if (tag === '</color>') {
      this.currentPos = savedPos + tagLen;
      return {
        position: savedPos,
        type: 'end-tag',
        length: tagLen,
        tagName: 'color',
      };
    }

    tagLen = '</size>'.length;
    tag = this.peak(tagLen).toLowerCase();
    if (tag === '</size>') {
      this.currentPos = savedPos + tagLen;
      return {
        position: savedPos,
        type: 'end-tag',
        length: tagLen,
        tagName: 'size',
      };
    }

    this.currentPos = savedPos + 2;

    /** @type {RTText} */
    const token = {
      type: 'text',
      position: savedPos,
      length: 2,
      text: '</',
    };

    return token;
  };

  /**
   * Parse next token
   * @return {RTToken}
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

    if (char === '<') {
      const peaked = this.peak(3).toLowerCase();
      switch (peaked) {
        // case '<b=': // Quirk. Ignore
        case '<b>': return this.parseBold();
        // case '<i=': // Quirk. Ignore
        case '<i>': return this.parseItalic();
      }
      if (this.peak(5).toLowerCase() === '<size' ) return this.parseSize();
      if (this.peak(6).toLowerCase() === '<color') return this.parseColor();
      if (this.peak(2) == '</') return this.parseEndTag();

      if (this.peak(4).toLowerCase() == '<br>') {
        /** @type {RTLineFeed} */
        const res = {
          type: 'line-feed',
          position: this.currentPos,
          length: 4,
          text: '\n',
        };
        this.currentPos += 3;
        return res;
      }
    };

    if (this.peak(2) === '\\n') {
      /** @type {RTLineFeed} */
      const token = {
        type: 'line-feed',
        position: this.currentPos,
        length: 3,
        text: '\n',
      };
      this.currentPos += 2;
      return token;
    }

    return this.parseText();
  };

  /**
   * Parse
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
  };


  /**
   * Render source as HTML
   * @return {string}
   */
  render() {
    return this.tokenArrayToHTML(this.root);
  }

  /**
   * Collapse an element array to HTML
   * @param {RTToken[]} tokens
   * @return {string}
  */
  tokenArrayToHTML(tokens) {
    if (Array.isArray(tokens)) return this.tokenToHTML(c);
    else return tokens.map((t) => this.tokenToHTML(t)).join('');
  }

  /**
   * Convert a parsed element to HTML
   * @param {RTToken} node
   * @return {string}
   */
  tokenToHTML(node) {
    let inner;
    if (node.type === 'formatted') {
      switch (node.format) {
        case 'b': return '<b>' + this.tokenArrayToHTML(node.children) + '</b>';
        case 'i': return '<i>' + this.tokenArrayToHTML(node.children) + '</i>';
        case 'color':
          inner = this.tokenArrayToHTML(node.children);
          if (node.value === null) {
            return `<span class="color-reset">` + inner + '</span>';
          }
          return `<span style="color:${node.value}">` + inner + '</span>';
        case 'size':
          inner = this.tokenArrayToHTML(node.children);
          if ((node.value === null) || (node.value <= 0)) {
            return `<span class="size-reset">` + inner + '</span>';
          }
          const size = Math.floor(node.value * 4 / 10);
          return `<span style="font-size:${size}px">` + inner + '</span>';
      }
    }

    if (node.type === 'line-feed') {
      return '<br>';
    }

    return this.escape(node.text)
        .replaceAll('\t', ' ')
        .replaceAll('  ', ' &nbsp;')
    ;
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

/** Editor for Unity RichText widget */
export class URTEditorElement extends HTMLDivElement {
  /** @type {URTParser} */ parser = new URTParser();
  /** @type {ShadowRoot} - Shadow DOM */ shadow;

  /** Constructor */
  constructor() {
    super();

    const shadow = this.attachShadow({mode: 'open'});
    const template = document.getElementById('urt-editor-template');
    shadow.appendChild(template.content);
    this.shadow = shadow;
  }

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

  /** Called when added to DOM */
  // connectedCallback() { }

  /** Called when removed from DOM */
  // disconnectedCallback() { }

  /** Called when moved within DOM */
  // connectedMoveCallback() { }

  /**
   * Called when observed attributes are changed
   * @param {*} name Attribute name
   * @param {*} oldValue Old attribute value
   * @param {*} newValue New attribute value
   */
  attributeChangedCallback(name, oldValue, newValue) { }

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
   * Format the selected text with a tag
   * @param {string} tagName - name of the tag
   * @param {number|string} [value] - value of the tag, if applicable
   */
  formatSelectedText(tagName, value) {
    tagName = tagName.toLowerCase();
    const startTag = value?`<${tagName}=${value}>`:`<${tagName}>`;

    const input = this.bodyInput;
    const selStart = input.selectionStart;
    const selEnd = input.selectionEnd;
    const replaced = input.getSelectionText();
    const endTag = `</${tagName}>`;
    const inserted = startTag + replaced + endTag;
    this.bodyInput.edit(inserted, selStart, selEnd);
  }

  /**
   * Wrap selected text with color tag
   * @param {PointerEvent} e
   */
  setTextColor(e) {
    e.stopPropagation();
    const value = e.target.dataset.value;
    this.formatSelectedText('color', value);
  }

  /**
   * Wrap selected text with size tag
   * @param {PointerEvent} e
   */
  setTextSize(e) {
    e.stopPropagation();
    const value = e.target.dataset.value;
    this.formatSelectedText('size', value);
  }

  /**
   * Wrap selected text with bold tag
   * @param {PointerEvent} e
   */
  setBold(e) {
    e.stopPropagation();
    this.formatSelectedText('b');
  }

  /**
   * Wrap selected text with italic tag
   * @param {PointerEvent} e
   */
  setItalic(e) {
    e.stopPropagation();
    this.formatSelectedText('i');
  }

  /**
   * Read file from FilePicker
   * @param {Event} e
   */
  readFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.bodyInput.clearUpdateDelay();
      this.bodyInput.clearHistory();
      this.bodyInput.value = e.target.result;
      this.render();
    };
    reader.readAsText(file);
  }

  /**
   * Save text to file
   */
  saveFile() {
    const blob = new Blob(
        [this.bodyInput.value],
        {type: 'text/plain;charset=utf-8'},
    );

    const title = this.titleInput.value;
    const filename = encodeTitle(title);

    const blobURL = URL.createObjectURL(blob);
    this.saveFileLink.href = blobURL;
    this.saveFileLink.download = filename + '.txt';
    this.saveFileLink.click();
    setTimeout(() => URL.revokeObjectURL(blobURL), 1000);
  }

  /**
   * Handle file drop event
   * @param {DragEvent} e
   */
  dropFile(e) {
    e.preventDefault();
    const item = [...e.dataTransfer.items][0];
    if (item.kind === 'file') {
      let filename = item.getAsFile().name;
      if (filename.endsWith('.txt')) filename = filename.slice(0, -4);
      this.titleInput.value = decodeTitle(filename);
      item.getAsString((s) => {
        this.bodyInput.value = s;
        this.bodyInput.clearHistory();
        this.render();
      });
    }
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
    const shadow = this.shadow;

    this.bodyInput = shadow.getElementById('message-body-input');
    this.titleInput = shadow.getElementById('message-title-input');
    this.toolbar = shadow.getElementById('toolbar');
    this.statusbar = shadow.getElementById('statusbar');

    shadow
        .getElementById('undo-history-button')
        .addEventListener('click', (e) => this.bodyInput.undoHistory());
    shadow
        .getElementById('redo-history-button')
        .addEventListener('click', (e) => this.bodyInput.redoHistory());

    /** @type {HTMLInputElement} - Hidden element */
    const fileSelector = shadow.getElementById('open-file-selector');
    fileSelector.addEventListener('change', (e) => this.readFile(e));
    shadow
        .getElementById('open-file-button')
        .addEventListener('click', (e) => fileSelector.click());

    this.addEventListener('drop', (e) => this.dropFile());

    shadow
        .getElementById('format-bold-button')
        .addEventListener('click', (e) => this.setBold());
    shadow
        .getElementById('format-italic-button')
        .addEventListener('click', (e) => this.setItalic());

    shadow
        .getElementById('save-file-button')
        .addEventListener('click', (e) => this.saveFile());
    this.saveFileLink = shadow.getElementById('save-file-link');

    if (options.maxLength > 0) {
      this.bodyInput.setAttribute('maxLength', options.maxLength);
    }

    // Initialize text size options
    /** @type {HTMLDivElement} */
    const textSizeList = shadow.getElementById('size-list');
    const textSizeOptions =
      (options?.textSizeOptions?.length)?
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

window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => e.preventDefault());

// const flashNoticeElement = document.getElementById('flash-notice');
// let flashNoticeDelay = null;

// const urtEditor = new URTEditorElement();
// const urtPreview = document.getElementById('preview');
// urtEditor.initialize();
// urtEditor.linkPreview(urtPreview);
// urtEditor.render();
