import fs from 'fs';

const SeasonNumber = 28;

const exportDirectory = `../../docs/servers/S${SeasonNumber}`;
const exportFileFragment = `${exportDirectory}/server-info`;

const dataRows = fs.readFileSync(`S${SeasonNumber}.tsv`, 'utf-8').split('\n');
const table = [];

for  (let rowIndex = 1; rowIndex < dataRows.length; rowIndex++) {
  const [
    colorCode,
    server,
    serverStatus,
    crossServerSummon,
    allianceTag,
    allianceName,
    sisterTag,
    sisterName,
    screening,
    power,
    powerUnit,
    starCount,
    memberCount,
    memberMax,
    techLevel,
  ] = dataRows[rowIndex].split('\t');

  table.push('<tr>');

  table.push(`<td><span class="server-tag">${server}</span></td>`);

  if (serverStatus.trim() !== '') {
    // let statusClass = 'unknown';
    // if (colorCode.toLowerCase() === 'green') statusClass = 'green';
    // else if (colorCode.toLowerCase() === 'red') statusClass = 'red';
    // else if (colorCode.toLowerCase() === 'yellow') statusClass = 'yellow';
    table.push(`<td><span class="status-line ${colorCode}">${serverStatus}</span></td>`);
  } else {
    table.push(`<td></td>`);
  }

  if (crossServerSummon === 'TRUE') {
    table.push(`<td>YES</td>`);
  } else {
    table.push(`<td></td>`);
  }

  if (allianceTag.trim() !== '') {
    table.push(`<td><span class="alliance-tag">${allianceTag}</span>${allianceName}</td>`);
  } else {
    table.push(`<td></td>`);
  }

  if (sisterTag.trim() !== '') {
    table.push(`<td><span class="alliance-tag">${sisterTag}</span>${sisterName}</td>`);
  } else {
    table.push(`<td></td>`);
  }

  table.push(`<td>${screening}</td>`);

  let aPower = parseInt(power);
  if (!isNaN(aPower)) {
    table.push(`<td class="power-col">${parseInt(power)}T</td>`);
  } else {
    table.push(`<td></td>`);
  }

  table.push(`<td>${starCount}</td>`);

  const mCount = parseInt(memberCount);
  const mMax = parseInt(memberMax);

  if (!isNaN(mCount)) {
    const spaceAvailable = mMax - mCount;
    let statusClass = '';
    if (spaceAvailable > 15) statusClass = 'green';
    else if (spaceAvailable > 8) statusClass = 'yellow';
    else statusClass = 'red';

    table.push(
      `<td><span class="status-line ${statusClass}">` +
      mCount + '/' + mMax +
      '</span></td>'
    );
  } else {
    table.push(`<td></td>`);
  }

  table.push(`<td>${techLevel}</td>`);

  table.push(`</tr>`);
}

const htmlTemplate = fs.readFileSync('template.html', 'utf-8');
const htmlOutput = htmlTemplate
  .replaceAll('{{SEASON NUMBER}}', SeasonNumber)
  .replace('{{CONTENT}}', table.join('\n'));

fs.writeFileSync(`${exportFileFragment}.html`, htmlOutput, {encoding:'utf8',flag:'w'});
