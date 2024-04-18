// Build Mightiest Kingdom data
// import './event/mk/build.js';
// import './server-info/build.js';

import {copyStatic} from './base/copy-static.js';

copyStatic('assets/');
copyStatic('marches/');
copyStatic('heroes/');
copyStatic('bounty-hall/');
copyStatic('features/');
copyStatic('territories/');

copyStatic('mail/');
copyStatic('guides/');
copyStatic('tower-defense/');
copyStatic('lava-cave/');
copyStatic('events/');
copyStatic('timelines/');
copyStatic('tools/');
copyStatic('stacking/');

const elements = ['archer', 'fire', 'ice', 'goblin'];

// import {buildElementData} from './heroes/build-data.js';
// elements.forEach((el) => buildElementData(el));
