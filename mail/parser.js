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
        throw new Error(`Syntax error at ${savedPos}`);
      }
      if (char === '>') break;
      if ('0123456789'.indexOf(char)===-1) {
        this.currentPos = savedPos;
        throw new Error(`Syntax error at ${savedPos}`);
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
    let sizeValue;
    const innerContent = [];
    let innerText = '';

    this.currentPos = this.currentPos + '<size'.length;
    const char = this.thisChar();

    if (char === '=') {
      this.nextChar();
      sizeValue = this.parseSizeValue();
      this.nextChar();
    } else if (char === '>') {
      sizeValue = null;
      this.nextChar();
    } else {
      throw new Error(`Syntax error at ${savedPos}`);
    }

    while (true) {
      const c = this.parseNext();

      if (c.type === 'eof') {
        throw new Error(`<size> at ${savedPos} not properly closed`);
      }

      if (c.type === 'end-tag') {
        if (c.for === 'size') break;
        throw new Error(`<size> at ${savedPos} not properly closed`);
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
          throw new Error(`Syntax error at ${savedPos}`);
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
          throw new Error(`Syntax error at ${savedPos}`);
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
    let color;
    const innerContent = [];
    let innerText = '';

    this.currentPos = this.currentPos + '<color'.length;
    const char = this.thisChar();

    if (char === '=') {
      this.nextChar();
      color = this.parseColorValue();
      this.nextChar();
    } else if (char === '>') {
      color = null;
      this.nextChar();
    } else {
      throw new Error(`Syntax error at ${savedPos}`);
    }

    while (true) {
      const c = this.parseNext();

      if (c.type === 'eof') {
        throw new Error(`<color> at ${savedPos} not properly closed`);
      }

      if (c.type === 'end-tag') {
        if (c.for === 'color') break;
        throw new Error(`<color> at ${savedPos} not properly closed`);
      }

      innerText += c.text;
      innerContent.push(c);
    }

    const res = {
      location: savedPos,
      type: 'color',
      value: color,
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
        throw new Error(`<b> at ${savedPos} not properly closed`);
      }

      if (c.type === 'end-tag') {
        if (c.for === 'b') break;
        throw new Error(`<b> at ${savedPos} not properly closed`);
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
        throw new Error(`<i> at ${savedPos} not properly closed`);
      }

      if (c.type === 'end-tag') {
        if (c.for === 'i') break;
        throw new Error(`<i> at ${savedPos} not properly closed`);
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
};
