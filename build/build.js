// Build Mightiest Kingdom data
// import './event/mk/build.js';
// import './server-info/build.js';

import {copyDirectory} from './__file/copy-directory.js';

copyDirectory('./', 0);

copyDirectory('assets/');
copyDirectory('marches/');

import './heroes/build.js';
copyDirectory('heroes/');

copyDirectory('bounty-hall/');
copyDirectory('features/');
copyDirectory('territories/');

// Build ESI files
import './esi/build-esi-tables.js'; // generate template files
copyDirectory('esi/');

copyDirectory('beginner/');
copyDirectory('skins/');

copyDirectory('maps/');

copyDirectory('mail/');
copyDirectory('guides/');
copyDirectory('resources/');
copyDirectory('tower-defense/');
copyDirectory('servers/');
copyDirectory('lava-cave/');
copyDirectory('events/');

import './calendars/build.js';
copyDirectory('calendars/');

copyDirectory('tools/');
copyDirectory('stacking/');

import './p2p/build.js'; // Build VIP tables
copyDirectory('p2p/');

copyDirectory('voices/');
copyDirectory('ccc/');

copyDirectory('wars/');
