const Hexadecimal = '0123456789abcdefABCDEF';
const NamedColors = [
  'aqua', 'black', 'blue', 'brown', 'cyan', 'darkblue', 'fuchsia',
  'green', 'grey', 'lightblue', 'lime', 'magenta', 'maroon', 'navy',
  'olive', 'orange', 'purple', 'red', 'silver', 'teal', 'white',
  'yellow',
];

/**
 * Convert a parsed element to HTML
 * @param {*} element
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
 * @param {object[]} elements
 * @return {string}
 */
function arrayToHtml(elements) {
  return elements.map((c) => elementToHtml(c)).join('');
}

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
  subString(len) {
    const p = this.currentPos;
    return this.source.substring(p, p + len);
  },

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
  },

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
  }
};
