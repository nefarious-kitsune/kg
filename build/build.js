// Build Mightiest Kingdom data
// import './event/mk/build.js';
// import './server-info/build.js';

import {copyStatic} from './base/copy-static.js';

copyStatic('assets/');
copyStatic('marches/');
copyStatic('features/');
copyStatic('territories/');

const elements = ['archer', 'fire', 'ice', 'goblin'];

import {buildElementData} from './heroes/build-data.js';
elements.forEach((el) => buildElementData(el));
