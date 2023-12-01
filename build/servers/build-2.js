import fs from 'fs';
const season = 26;
const exportDirectory = `../../docs/servers/S${season}`;
const start = 1200;
const end = 1400;

/**
 * Get server numbers
 * @param {string} input
 * @returns {string[]}
 */
function getServerNumbers(input) {
  return input
    .replaceAll('\r','')
    .split('\n')
    .map((n) => parseInt(n));
}

const rawData = {
  direct:
    getServerNumbers(
      fs.readFileSync(`${exportDirectory}/direct-2.txt`, 'utf-8'),
    ),
  application:
    getServerNumbers(
      fs.readFileSync(`${exportDirectory}/application-2.txt`, 'utf-8'),
    ),
  locked:
    getServerNumbers(
      fs.readFileSync(`${exportDirectory}/locked-2.txt`, 'utf-8'),
    ),
};

const compiledData = {
  direct: [],
  application: [],
  locked: [],
  all: [],
}

const duplicatedServers = [];
const missingServers = [];

for (let serverId = start; serverId < end; serverId++) {
  const isDirect = (rawData.direct.indexOf(serverId) != -1)?1:0;
  const isAppOnly = (rawData.application.indexOf(serverId) != -1)?1:0;
  const isLocked = (rawData.locked.indexOf(serverId) != -1)?1:0;
  const found = (isDirect + isAppOnly + isLocked);
  if (found > 1) {
    duplicatedServers.push(serverId);
  } else if (found === 0) {
    missingServers.push(serverId);
  } else {
    compiledData.all.push(serverId);
    if (isDirect === 1) compiledData.direct.push(serverId);
    else if (isAppOnly === 1) compiledData.application.push(serverId);
    else if (isLocked === 1) compiledData.locked.push(serverId);
  }
}

fs.writeFileSync('./_missing-2.txt', missingServers.join('\n'));
fs.writeFileSync('./_duplicate-2.txt', duplicatedServers.join('\n'));
fs.writeFileSync('./_all-2.txt', compiledData.all.join('\n'));

const Template = fs.readFileSync('./template-2.html', 'utf-8');

const DirectTransferTagList = compiledData.direct
  .map((serverId) => '<span class="server-tag server3">S' + serverId + '</span>')
  .join('\n');

const AppOnlyTagList = compiledData.application
  .map((serverId) => '<span class="server-tag server2">S' + serverId + '</span>')
  .join('\n');

const LockedTagList = compiledData.application
  .map((serverId) => '<span class="server-tag server1">S' + serverId + '</span>')
  .join('\n');

fs.writeFileSync(
  `${exportDirectory}/server-status-2.html`,
  Template
    .replaceAll('{{SEASON}}', season)
    .replace('{{DIRECT-TRANSFER SERVERS}}', DirectTransferTagList)
    .replace('{{APPLICATION-ONLy SERVERS}}', AppOnlyTagList)
    .replace('{{LOCKED SERVERS}}', LockedTagList)
);
