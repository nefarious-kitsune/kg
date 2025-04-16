/** Synchronized git command */

import {resolve} from 'path';
import {exec} from 'child_process';

const SitePath = resolve(process.cwd(), 'site/'); // <GitHub>/kg/site
const SourcePath = resolve(process.cwd(), 'source/'); // <GitHub>/kg/source

/** Current path (cwd of the command line that runs the script) */
const sourceCwd = process.env.INIT_CWD;

/** Mirrored path */
const siteCwd = SitePath + sourceCwd.slice(SourcePath.length);

const gitCmd = process.argv[2];
const gitArgs = process.argv.slice(3);
const command =`git ${gitCmd} ${gitArgs.join(' ')}`;

// Execute local command
exec(command, {cwd: sourceCwd}, (error) => {
  if (error) {
    console.error(`Local command error: ${error}`);
    process.exit();
  }
  console.log('Local command successful');

  // Execute mirrored command
  exec(command, {cwd: siteCwd}, (error) => {
    if (error) console.error(`Mirrored command error: ${error}`);
    else console.log('Mirrored command successful');
    process.exit();
  });
});
