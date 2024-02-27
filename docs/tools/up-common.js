/* eslint-env browser */

function formatNumber(value) {
  let str = value.toFixed(0);
  if (str.length >= 5) {
    str = str.replace(/(\d)(?=(\d{3})+$)/g, '$1\u2009');
  }
  return str;
}

function openTab(selected, tabNames) {
  const d = document;
  tabNames.forEach((tabName, i) => {
    if (i === selected) {
      d.getElementById(tabName + '-tab')?.classList?.add('focused');
      d.getElementById(tabName + '-content')?.classList?.remove('hidden');
    } else {
      d.getElementById(tabName + '-tab')?.classList?.remove('focused');
      d.getElementById(tabName + '-content')?.classList?.add('hidden');
    }
  })
}
