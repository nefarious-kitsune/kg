/* eslint-env browser */

const elViewTabs = [];
let tabbedTable;

document.addEventListener('DOMContentLoaded', (e) => {
  const viewTabs = [
    ...document.querySelectorAll('#Tabbed-Table-Tab-List .table-tab'),
  ];

  const viewCount = viewTabs.length;

  if (viewCount > 0) {
    tabbedTable = document.getElementById('Tabbed-Table');

    for (let tabIdx = 0; tabIdx < viewCount; tabIdx++) {
      const tab = viewTabs[tabIdx];
      tab.setAttribute('view-index', tabIdx);
      elViewTabs.push(tab);
    }

    if (window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove the # character
      const idx = parseInt(hash);
      switchView(isNaN(idx)?0:idx);
    } else {
      switchView(0); // No hash found
    }
  }
});

/**
 * Switch table view
 * @param {HTMLAnchorElement|number} tab
 */
function switchView(tab) {
  let selectedIdx = 0;
  if (typeof tab === 'number') {
    selectedIdx = tab;
  } else {
    selectedIdx = parseInt(tab.getAttribute('view-index'));
  }

  const tabCount = elViewTabs.length;
  const hiddenViews = [];
  for (let idx = 0; idx < tabCount; idx++) {
    if (idx === selectedIdx) {
      elViewTabs[idx].classList.add('selected');
    } else {
      elViewTabs[idx].classList.remove('selected');
      hiddenViews.push('view-' + (idx+1));
    }
  }
  console.log(hiddenViews);
  tabbedTable.classList.remove(...hiddenViews);
  tabbedTable.classList.add('view-' + (selectedIdx+1));
}
