/* eslint-env browser */

const elTabs = [];
const elContents = [];

document.addEventListener("DOMContentLoaded", (e) => {
  const allTabs = document.querySelectorAll('.tabbed.tab');
  const allContents = document.querySelectorAll('.tabbed.tab-content');
  const tabCount = allTabs.length;
  if (tabCount > 0) {
    for (let tabIdx = 0; tabIdx < tabCount; tabIdx++) {
      const tab = allTabs[tabIdx];
      const content = allContents[tabIdx];
      tab.setAttribute('tab-index', tabIdx);
      content.setAttribute('tab-index', tabIdx);
      elTabs.push(tab);
      elContents.push(content);
    }

    if (window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove the # character
      const idx = parseInt(hash);
      console.log('hashed: ', idx);
      switchTab(isNaN(idx)?0:idx);
    } else {
      switchTab(0); // No hash found
    }
  }
})

function switchTab(tab) {
  let selectedIdx = 0;
  if (typeof tab === 'number') {
    selectedIdx = tab;
  } else {
    selectedIdx = parseInt(tab.getAttribute('tab-index'));
  }
  console.log('selected: ', selectedIdx);

  const tabCount = elTabs.length;
  for (let idx = 0; idx < tabCount; idx++) {
    if (idx === selectedIdx) {
      elTabs[idx].classList.add('selected');
      elContents[idx].classList.remove('hidden');
    } else {
      elTabs[idx].classList.remove('selected');
      elContents[idx].classList.add('hidden');
    }
  }
}
