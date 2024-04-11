/**
 * Syntax: "<" TagName (Whitespace* Attribute Whitespace* ("=" Whitespace* Value)? )* "/"? ">"
 * @param {string} source - source content
 * @param {number} startPos - start position
 * @return {object} - parsed element
 */
export function extractHtmlElement(source, startPos) {
  let head;
  let sourceChars;

  if (startPos) {
    head = source.slice(0, startPos);
    sourceChars = [...source.slice(startPos)];
    startPos = 0;
  } else {
    head = '';
    sourceChars = [...source];
    startPos = 0;
  }

  let currPos = startPos;

  const nextChar = () => sourceChars[++currPos];
  const thisChar = () => sourceChars[currPos];

  const parseIdentifier = () => {
    const savedPos = currPos;

    let char = thisChar();
    while (
      (currPos < sourceChars.length) &&
      (' \n\r\'"=/>'.indexOf(char) === -1)
    ) {
      char = nextChar();
    }

    if (currPos > savedPos) {
      return sourceChars.slice(savedPos, currPos).join('');
    } else {
      currPos = savedPos;
      return null;
    }
  };

  const parseWhitespace = () => {
    const savedPos = currPos;
    let char = thisChar();
    while (
      (currPos < sourceChars.length) &&
      (' \n\r'.indexOf(char) !== -1)
    ) {
      char = nextChar();
    }
    if (currPos > savedPos) {
      return sourceChars.slice(savedPos, currPos);
    } else {
      currPos = savedPos;
      return null;
    }
  };

  const parseValue = () => {
    const savedPos = currPos;

    let char = thisChar();
    if (char !== '"') {
      // currentPos = savedPos;
      return null;
    }

    char = nextChar();
    while (
      (currPos < sourceChars.length) &&
      (sourceChars[currPos] !== '"')
    ) {
      char = nextChar();
    }

    if (char !== '"') {
      currPos = savedPos;
      return null;
    } else {
      currPos++;
    }

    if (currPos > savedPos) {
      return sourceChars.slice(savedPos + 1, currPos - 1).join('');
    } else {
      currPos = savedPos;
      return null;
    }
  };

  const parseAttribute = () => {
    let savedPos = currPos;

    const leadingSpace = parseWhitespace();
    if (leadingSpace === null) {
      currPos = savedPos;
      return null;
    };

    const name = parseIdentifier();
    if (name === null) {
      currPos = savedPos;
      return null;
    };

    savedPos = currPos;
    parseWhitespace();

    if (sourceChars[currPos] !== '=') {
      currPos = savedPos;
      return [name, true];
    } else {
      currPos++;
      parseWhitespace();
      const value = parseValue();
      if (value !== null) {
        return [name, value];
      } else {
        currPos = savedPos;
        return [name, true];
      }
    }
  };

  const result = {
    element: {name: ''},
    innerContent: null,
    head: head,
    tail: '',
  };

  if (sourceChars[currPos] === '<') {
    currPos++;
  } else {
    return null;
  }

  const tagName = parseIdentifier();
  if (tagName === null) return null;
  result.element.name = tagName;

  let attribute = parseAttribute();
  while (attribute !== null) {
    const [attrNam, attrValue] = attribute;
    result.element[attrNam] = attrValue;
    attribute = parseAttribute();
  };

  parseWhitespace();

  if (
    (sourceChars[currPos] === '/') &&
    (sourceChars[currPos+1] === '>')
  ) {
    result.tail = sourceChars.slice(currPos + 2).join('');
    return result;
  }

  if (sourceChars[currPos] === '>') {
    currPos++;

    const tail = sourceChars.slice(currPos).join('');
    const endTag = `</${tagName}>`;
    const endTagPos = tail.indexOf(endTag);

    if (endTagPos === -1) return null;

    result.innerContent = tail.slice(0, endTagPos);
    result.tail = tail.slice(endTagPos + endTag.length);

    // result.endPos = currPos + 1;
    return result;
  }
  return null;
};

// console.log(extractHtmlElement('texas<a href="somewhere">hold</a> \'em', 5));
