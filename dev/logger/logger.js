/**
 * Update current progress line on the terminal
 * @param {string} text
 */
function updateProgress(text) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(text);
}

/**
 * Output a progress line to the terminal
 * @param {string} text
 */
function printProgress(text) {
  process.stdout.write(text);
}

const stringify = (obj) => JSON.stringify(obj, null, '  ');

/**
 * Output text to the terminal
 * @param {...string} args
 */
function print(...args) {
  let output = '\n';
  switch (arguments.length) {
    case 0: break;
    case 1:
      if (typeof args[0] === 'string') output = args[0] + '\n';
      else output = stringify(args[0]) + '\n';
      break;
    default:
      output = [...args].map((arg) => stringify(arg)).join('\n') + '\n';
  }
  process.stdout.write(output);
}

export default {
  print: print,
  printProgress: printProgress,
  updateProgress: updateProgress,
  log: print,
  error: print,
  warn: print,
};
