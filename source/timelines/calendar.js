/* eslint-env browser */

function switchMKTableView(viewIdx) {
  const d = document;
  const elTable = d.getElementById('mk-result-table');
  const elTab0 = d.getElementById('mk-tab-0'); // final
  const elTab1 = d.getElementById('mk-tab-1'); // phase 1-2
  const elTab2 = d.getElementById('mk-tab-2'); // phase 3-4
  const elTab3 = d.getElementById('mk-tab-3'); // phase 5-6

  switch (viewIdx) {
    case 0:
      elTab0.classList.add('focused');
      elTab1.classList.remove('focused');
      elTab2.classList.remove('focused');
      elTab3.classList.remove('focused');
      elTable.classList.add('view-final');
      elTable.classList.remove(
        // 'view-final',
        'view-phase-1-2',
        'view-phase-3-4',
        'view-phase-5-6'
      );
      break;
    case 1:
      elTab0.classList.remove('focused');
      elTab1.classList.add('focused');
      elTab2.classList.remove('focused');
      elTab3.classList.remove('focused');
      elTable.classList.add('view-phase-1-2');
      elTable.classList.remove(
        'view-final',
        // 'view-phase-1-2'
        'view-phase-3-4',
        'view-phase-5-6'
      );
      break;
    case 2:
      elTab0.classList.remove('focused');
      elTab1.classList.remove('focused');
      elTab2.classList.add('focused');
      elTab3.classList.remove('focused');
      elTable.classList.add('view-phase-3-4');
      elTable.classList.remove(
        'view-final',
        'view-phase-1-2',
        // 'view-phase-3-4'
        'view-phase-5-6'
      );
      break;
    case 3:
      elTab0.classList.remove('focused');
      elTab1.classList.remove('focused');
      elTab2.classList.remove('focused');
      elTab3.classList.add('focused');
      elTable.classList.add('view-phase-5-6');
      elTable.classList.remove(
        'view-final',
        'view-phase-1-2',
        'view-phase-3-4'
        // 'view-phase-5-6'
      );
      break;
  }
}

function switchUPTableView(viewIdx) {
  const d = document;
  const elTable = d.getElementById('up-result-table');
  const elTab0 = d.getElementById('up-tab-0'); // global
  const elTab1 = d.getElementById('up-tab-1'); // server

  switch (viewIdx) {
    case 0:
      elTab0.classList.add('focused');
      elTab1.classList.remove('focused');
      elTable.classList.add('view-global');
      elTable.classList.remove('view-server');
      break;
    case 1:
      elTab0.classList.remove('focused');
      elTab1.classList.add('focused');
      elTable.classList.remove('view-global');
      elTable.classList.add('view-server');
      break;
  }
}
