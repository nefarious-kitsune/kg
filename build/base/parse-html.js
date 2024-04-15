export const htmlParser = {
  currentPos: 0,
  sourceChars: [],
  parse(source, path, processors) {
    this.currentPos = 0;
    this.sourceChars = [...source];
    const rootElement = this.parseElement();
  },
};
