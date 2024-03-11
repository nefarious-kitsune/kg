/* eslint-env browser */

const elTabs = [];
const elContents = [];

function initTabs(tabCount) {
  for (let tabIdx = 0; tabIdx < tabCount; tabIdx++) {
    elTabs.push(document.getElementById(`data-tab-${tabIdx}`));
    elContents.push(document.getElementById(`data-content-${tabIdx}`));
  }
  switchTab(0);
}

function switchTab(tabIdx) {
  const tabCount = elTabs.length;
  for (let idx = 0; idx < tabCount; idx++) {
    if (idx === tabIdx) {
      elTabs[idx].classList.add('focused');
      elContents[idx].classList.remove('hidden');
    } else {
      elTabs[idx].classList.remove('focused');
      elContents[idx].classList.add('hidden');
    }
  }
}
