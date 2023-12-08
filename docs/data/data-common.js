/* eslint-env browser */

const elTabs = [];
const elContents = [];

function getDom(viewCount) {
  const d = document;
  for (let idx = 0; idx < viewCount; idx++) {
    elTabs.push(d.getElementById(`data-tab-${idx}`));
    elContents.push(d.getElementById(`data-content-${idx}`));
  }
  console.log(elTabs);
  console.log(elContents);
}

function switchTab(viewIdx) {
  const viewCount = elTabs.length;
  for (let idx = 0; idx < viewCount; idx++) {
    if (idx === viewIdx) {
      elTabs[idx].classList.add('focused');
      elContents[idx].classList.remove('hidden');
    } else {
      elTabs[idx].classList.remove('focused');
      elContents[idx].classList.add('hidden');
    }
  }
}
