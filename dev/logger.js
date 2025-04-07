/**
 * Update current progress line
 * @param {string} text
 */
function updateProgress(text) {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(text);
}

/**
 * Write a progress line
 * @param {string} text
 */
function writeProgress(text) {
  process.stdout.write(text);
}

/**
 * Write a log
 * @param {...string} text
 */
function log(...text) {
  [...text].forEach((t) => process.stdout.write(`${t}'\n`));
}

export {
  writeProgress,
  updateProgress,
  log,
};
