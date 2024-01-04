import fs from 'fs';
const season = 27;
const exportDirectory = `../../docs/servers/S${season}`;

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
      fs.readFileSync(`${exportDirectory}/direct.txt`, 'utf-8'),
    ),
  application:
    getServerNumbers(
      fs.readFileSync(`${exportDirectory}/application.txt`, 'utf-8'),
    ),
  locked:
    getServerNumbers(
      fs.readFileSync(`${exportDirectory}/locked.txt`, 'utf-8'),
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

for (let serverId = 401; serverId < 1150; serverId++) {
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

fs.writeFileSync(`./_s${season}/_missing.txt`, missingServers.join('\n'));
fs.writeFileSync(`./_s${season}/_duplicate.txt`, duplicatedServers.join('\n'));
fs.writeFileSync(`./_s${season}/_all.txt`, compiledData.all.join('\n'));

const Template = fs.readFileSync('./template.html', 'utf-8');

const DirectTransferTagList = compiledData.direct
  .map((serverId) => '<span class="server-tag server3">S' + serverId + '</span>')
  .join('\n');

const AppOnlyTagList = compiledData.application
  .map((serverId) => '<span class="server-tag server4">S' + serverId + '</span>')
  .join('\n');

const LockedTagList = compiledData.locked
  .map((serverId) => '<span class="server-tag server1">S' + serverId + '</span>')
  .join('\n');

fs.writeFileSync(
  `${exportDirectory}/server-status.html`,
  Template
    .replaceAll('{{SEASON}}', season)
    .replace('{{DIRECT-COUNT}}', compiledData.direct.length)
    .replace('{{APPLICATION-COUNT}}', compiledData.application.length)
    .replace('{{LOCKED-COUNT}}', compiledData.locked.length)
    .replace('{{CLOSED-COUNT}}', missingServers.length)
    .replace('{{DIRECT-TRANSFER SERVERS}}', DirectTransferTagList)
    .replace('{{APPLICATION-ONLY SERVERS}}', AppOnlyTagList)
    .replace('{{LOCKED SERVERS}}', LockedTagList)
);
