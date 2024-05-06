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

// Build ESI files
import './esi/build-esi-tables.js'; // generate template files
copyStatic('esi/');

copyStatic('mail/');
copyStatic('guides/');
copyStatic('tower-defense/');
copyStatic('servers/');
copyStatic('lava-cave/');
copyStatic('events/');
copyStatic('timelines/');
copyStatic('tools/');
copyStatic('stacking/');

import './p2p/build.js'; // Build VIP tables
copyStatic('p2p/');

const elements = ['archer', 'fire', 'ice', 'goblin'];

// import {buildElementData} from './heroes/build-data.js';
// elements.forEach((el) => buildElementData(el));
