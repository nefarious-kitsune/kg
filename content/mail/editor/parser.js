const Hexadecimal = '0123456789abcdefABCDEF';
const NamedColors = [
  'aqua', 'black', 'blue', 'brown', 'cyan', 'darkblue', 'fuchsia',
  'green', 'grey', 'lightblue', 'lime', 'magenta', 'maroon', 'navy',
  'olive', 'orange', 'purple', 'red', 'silver', 'teal', 'white',
  'yellow',
];

/**
 * Convert a parsed element to HTML
 * @param {RTToken} element
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
 * @param {RTToken[]} elements
 * @return {string}
 */
function arrayToHtml(elements) {
  return elements.map((c) => elementToHtml(c)).join('');
}

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
  peak(len=1) {
    const p = this.currentPos;
    return this.source.substring(p, p + len);
  },

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
  },

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
  },

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
      )
      if (!isValid) _value = null;
    } else {
      if (NamedColors.indexOf(_value()) === -1) _value = null;
    }

    this.currentPos = _end;
    return _value;
  },

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
  },

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
  },

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
  },

  render() {
    return this.root.map((c) => elementToHtml(c)).join('');
  },
};
