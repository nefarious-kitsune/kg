const Hexadecimal = '0123456789abcdefABCDEF';
const NamedColors = [
  'aqua', 'black', 'blue', 'brown', 'cyan', 'darkblue', 'fuchsia',
  'green', 'grey', 'lightblue', 'lime', 'magenta', 'maroon', 'navy',
  'olive', 'orange', 'purple', 'red', 'silver', 'teal', 'white',
  'yellow',
];

/**
 * Convert a parsed element to HTML
 * @param {RTNode} element
 * @return {string}
 */
function elementToHtml(element) {
  if (element.type === 'bold') {
    return '<b>' + arrayToHtml(element.inner) + '</b>';
  };
  if (element.type === 'italic') {
    return '<i>' + arrayToHtml(element.inner) + '</i>';
  };
  if (element.type === 'color') {
    const inner = arrayToHtml(element.inner);
    if (element.value === null) return inner;
    return `<span style="color:${element.value}">` + inner + '</span>';
  };
  if (element.type === 'size') {
    const inner = arrayToHtml(element.inner);
    if (element.value === null) return inner;
    const size = Math.floor(element.value * 4 / 10);
    return `<span style="font-size:${size}px">` + inner + '</span>';
  }
  if (element.type === 'line-break') {
    return '<br>';
  }
  return element.text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
}

/**
 * Collapse an element array to HTML
 * @param {RTNode[]} elements
 * @return {string}
 */
function arrayToHtml(elements) {
  return elements.map((c) => elementToHtml(c)).join('');
}

/** // Rich Text Tokens
 *
 * @typedef {Object} RTTag - Rich Text token for a tag
 * @property {'open-tag', 'close-tag', 'void-tag'} type - Tag type
 * @property {number} position - Start position of the token within the source
 * @property {number} length - Length of the token code within the source
 * @property {string} name - Tag name
 * @property {string|number} [value] - Tag value
 *
 * @typedef {Object} RTText - Token for plain text
 * @property {'text'} type - Token type
 * @property {number} position - Start position of the token within the source
 * @property {number} length - Length of the text within the source
 * @property {string} text - Text
 *
 * @typedef {Object} RTWhiteSpace - Token for white space text
 * @property {'white-space'} type - Token type
 * @property {number} position - Start position of the token within the source
 * @property {number} length - Length of the text within the source
 * @property {string} text - Text
 */

/**
 * @typedef {Object} RTNode - Node of a Rich Text AST
 * @property {number} location - Start location of the token
 * @property {string} type - Token type
 * @property {string|number} [value] - Token value
 * @property {string} [for] - Tag name (for End-Tag token)
 * @property {RTNode[]} inner - Nested child tokens
 * @property {string} text - Inner text
 */

// eslint-disable-next-line no-unused-vars
const parser = {
  /**
   * @type {number}
   * Current parser position
   */
  currentPos: 0,

  /**
   * @type {string}
   * Source
   */
  source: '',

  /** Document root */
  root: [],

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
  },

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
  },

  /**
   * Get next character (without advancing cursor position)
   * @return {string}
   */
  peek() {
    return this.source.charAt(this.currentPos+1);
  },

  /**
   * Advance cursor position and get next character
   * @return {string}
   */
  nextChar() {
    return this.source.charAt(++this.currentPos);
  },

  /**
   * Get character at current cursor position
   * @return {string}
   */
  thisChar() {
    return this.source.charAt(this.currentPos);
  },

  /**
   * Get a string fragment of certain length from current position
   * @param {number} len - length
   * @return {string}
   */
  peak(len=1) {
    const p = this.currentPos;
    return this.source.substring(p, p + len);
  },

  /**
   * Parse a text node
   * @return {RTNode}
   */
  parseText() {
    const savedPos = this.currentPos;
    while (this.currentPos < this.source.length) {
      const char = this.nextChar();
      if ((char === '\n') || (char === '<') || (char === '\\')) break;
    }
    /** @type {RTNode} */
    const node = {
      location: savedPos,
      type: 'text',
      text: this.source.substring(savedPos, this.currentPos),
    };
    return node;
  },

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
    return parseInt(this.source.substring(savedPos, this.currentPos));
  },

  /**
   * Parse a size node
   * @return {RTNode}
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

    /** @type {RTNode} */
    const token = {
      location: savedPos,
      type: 'size',
      value: sizeValue,
      inner: innerContent,
      text: innerText,
    };
    return token;
  },

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
  },

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
  },

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
  },

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
  },

  /**
   * "</" found. Attempt to parse a close tag
   * @return {object}
   */
  parseEndTag() {
    const savedPos = this.currentPos;

    let tag = this.peak('</b>'.length).toLowerCase();

    if (tag === '</b>') {
      this.currentPos = savedPos + '</b>'.length;
      return {location: savedPos, type: 'end-tag', for: 'b', text: ''};
    }

    if (tag === '</i>') {
      this.currentPos = savedPos + '</i>'.length;
      return {location: savedPos, type: 'end-tag', for: 'i', text: ''};
    }

    tag = this.peak('</color>'.length).toLowerCase();
    if (tag === '</color>') {
      this.currentPos = savedPos + '</color>'.length;
      return {location: savedPos, type: 'end-tag', for: 'color', text: ''};
    }

    tag = this.peak('</size>'.length).toLowerCase();
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
  },

  /**
   * Parse next token
   * @return {RTNode}
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
      const peaked = this.peak(4).toLowerCase();
      switch (peaked) {
        case '<b>':
        case '<b=': return this.parseBold();
        case '<i>':
        case '<i=': return this.parseItalic();
      }
      if (this.peak(5).toLowerCase() === '<size' ) return this.parseSize();
      if (this.peak(6).toLowerCase() === '<color') return this.parseColor();
      if (this.peak(2) == '</') return this.parseEndTag();
    };

    if (char === '\n') {
      /** @type {RTNode} */
      const res = {
        location: this.currentPos,
        type: 'line-break',
        text: '\n',
      };
      this.currentPos++;
      return res;
    };

    if (this.peak(2) === '\\n') {
      /** @type {RTNode} */
      const res = {
        location: this.currentPos,
        type: 'line-break',
        text: '\\n',
      };
      this.currentPos += 2;
      return res;
    }

    return this.parseText();
  },

  parse(source) {
    this.currentPos = 0;
    this.source = source;
    this.root.length = 0;
    while (true) {
      const next = this.parseNext();
      if (next.type === 'eof') break;
      this.root.push(next);
    }
    return arrayToHtml(this.root);
  },

  render() {
    return this.root.map((c) => elementToHtml(c)).join('');
  },
};
