// Build Mightiest Kingdom data
// import './event/mk/build.js';
// import './server-info/build.js';

import {copyDirectory} from './__file/copy-directory.js';
import './heroes/build.js';

copyDirectory('./', 0);

copyDirectory('assets/');
copyDirectory('features/');
copyDirectory('marches/');
copyDirectory('units/');

copyDirectory('heroes/');

// import './blacksmith/build.js';

copyDirectory('city/');
copyDirectory('features/');
copyDirectory('territories/');

copyDirectory('basics/');

import './skins/build.js';
copyDirectory('skins/');

copyDirectory('maps/');

copyDirectory('mail/');
copyDirectory('guides/');
copyDirectory('resources/');
copyDirectory('lava-cave/');

copyDirectory('calendars/');
import './events/build.js';
copyDirectory('events/');

copyDirectory('seasons/');
copyDirectory('servers/');
copyDirectory('alliances/');

copyDirectory('tools/');
copyDirectory('stacking/');

import './p2p/build.js'; // Build VIP tables
copyDirectory('p2p/');

copyDirectory('voices/');
copyDirectory('ccc/');

copyDirectory('wars/');

copyDirectory('community/');
