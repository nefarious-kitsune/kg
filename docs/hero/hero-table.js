/* eslint-env browser */

function switchHeroTableView(viewIdx) {
  const d = document;
  const elTable = d.getElementById('hero-table');
  const elTab0 = d.getElementById('hero-tab-0'); // skills
  const elTab1 = d.getElementById('hero-tab-1'); // total combat
  const elTab2 = d.getElementById('hero-tab-2'); // total utility
  const elTab3 = d.getElementById('hero-tab-3'); // phase acquisition
  const elTab4 = d.getElementById('hero-tab-4'); // role

  switch (viewIdx) {
    case 0:
      elTab0.classList.add('focused');
      elTab1.classList.remove('focused');
      elTab2.classList.remove('focused');
      elTab3.classList.remove('focused');
      elTab4.classList.remove('focused');
      elTable.classList.add('view-skills');
      elTable.classList.remove(
        // 'view-skills',
        'view-total-combat',
        'view-total-utility',
        'view-acquisition',
        'view-role',
      );
      break;
    case 1:
      elTab0.classList.remove('focused');
      elTab1.classList.add('focused');
      elTab2.classList.remove('focused');
      elTab3.classList.remove('focused');
      elTab4.classList.remove('focused');
      elTable.classList.add('view-total-combat');
      elTable.classList.remove(
        'view-skills',
        // 'view-total-combat'
        'view-total-utility',
        'view-acquisition',
        'view-role',
      );
      break;
    case 2:
      elTab0.classList.remove('focused');
      elTab1.classList.remove('focused');
      elTab2.classList.add('focused');
      elTab3.classList.remove('focused');
      elTab4.classList.remove('focused');
      elTable.classList.add('view-total-utility');
      elTable.classList.remove(
        'view-skills',
        'view-total-combat',
        // 'view-total-utility',
        'view-acquisition',
        'view-role',
      );
      break;
    case 3:
      elTab0.classList.remove('focused');
      elTab1.classList.remove('focused');
      elTab2.classList.remove('focused');
      elTab3.classList.add('focused');
      elTab4.classList.remove('focused');
      elTable.classList.add('view-acquisition');
      elTable.classList.remove(
        'view-skills',
        'view-total-combat',
        'view-total-utility',
        // 'view-acquisition',
        'view-role',
      );
      break;
    case 4:
      elTab0.classList.remove('focused');
      elTab1.classList.remove('focused');
      elTab2.classList.remove('focused');
      elTab3.classList.remove('focused');
      elTab4.classList.add('focused');
      elTable.classList.add('view-role');
      elTable.classList.remove(
        'view-skills',
        'view-total-combat',
        'view-total-utility',
        'view-acquisition',
        // 'view-role',
      );
      break;
  }
}
