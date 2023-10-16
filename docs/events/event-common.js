/* eslint-env browser */

function toggleCollapsible(id) {
  document.getElementById(id).classList.toggle('collapsed');
}

function openPhase(selected, hasUP) {
  const d = document;
  const tableElement = d.getElementById('mk-result-table');
  if (selected === 0) {
    d.getElementById('mk-tab-0').classList.add('focused');
    d.getElementById('mk-tab-1').classList.remove('focused');
    d.getElementById('mk-tab-2').classList.remove('focused');
    if (hasUP) d.getElementById('up-tab').classList.remove('focused');
    tableElement.classList.add('display-final');
    tableElement.classList.remove('display-phase-1-3', 'display-phase-4-6', 'display-up');
  } else if (selected === 1) {
    d.getElementById('mk-tab-0').classList.remove('focused');
    d.getElementById('mk-tab-1').classList.add('focused');
    d.getElementById('mk-tab-2').classList.remove('focused');
    if (hasUP) d.getElementById('up-tab').classList.remove('focused');
    tableElement.classList.remove('display-final', 'display-phase-4-6', 'display-up');
    tableElement.classList.add('display-phase-1-3');
  } else if (selected === 2) {
    d.getElementById('mk-tab-0').classList.remove('focused');
    d.getElementById('mk-tab-1').classList.remove('focused');
    d.getElementById('mk-tab-2').classList.add('focused');
    if (hasUP) d.getElementById('up-tab').classList.remove('focused');
    tableElement.classList.remove('display-final', 'display-phase-1-3', 'display-up');
    tableElement.classList.add('display-phase-4-6');
  } else {
    d.getElementById('mk-tab-0').classList.remove('focused');
    d.getElementById('mk-tab-1').classList.remove('focused');
    d.getElementById('mk-tab-2').classList.remove('focused');
    d.getElementById('up-tab').classList.add('focused');
    tableElement.classList.remove('display-final', 'display-phase-1-3', 'display-phase-4-6');
    tableElement.classList.add('display-up');
  }
}
