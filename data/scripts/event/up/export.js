import fs from 'fs';
import {getDateFormatStrings, getUTCDate} from '../../utils/date-utils.js';
import {formatPoint} from '../../utils/number-utils.js';

const eventStartDate = getUTCDate(2023, 11, 6);
const eventName = 'Ultimate Power';
const eventDuration = 6; // 6-days
const eventPrefix = 'up-';

const MaxFinalPoints = (6 * 1000 * 1000 * 1000);

const eventEndDate = new Date()
eventEndDate.setDate(eventStartDate.getDate() + eventDuration - 1);

const fmtEventStart = getDateFormatStrings(eventStartDate);
const fmtEventEnd   = getDateFormatStrings(eventEndDate);

const exportDirectory = '../../../../docs/events';
const dateFragment = `${fmtEventStart.YYYY}${fmtEventStart.MM}${fmtEventStart.DD}`;
const exportFileFragment = `${exportDirectory}/${eventPrefix}${dateFragment}`;

const rawServerDataRows =
  fs
    .readFileSync(`${eventPrefix}${dateFragment}.tsv`, 'utf-8')
    .replaceAll('\r','')
    .replaceAll(',','')
    .split('\n');

const rawGlobalDataRows =
  fs
    .readFileSync(`${eventPrefix}${dateFragment}-g.tsv`, 'utf-8')
    .replaceAll('\r','')
    .replaceAll(',','')
    .split('\n');

const servers = [];
const globalData = {
  server: 'global',
  final: {},
}

rawGlobalDataRows.shift(); // remove first row
rawGlobalDataRows.forEach((row, rowIdx) => {
  let [p, s] = row.split('\t');
  const rank = (rowIdx + 1).toString();

  if (servers.indexOf(s) === -1) servers.push(s);

  p = parseInt(p);
  if (Number.isNaN(p)) p = null;

  globalData.final[rank] = ({points: p, server: s});
});

const compiledData = {
  'event': eventName,
  'start-date': `${fmtEventStart.YYYY}-${fmtEventStart.MM}-${fmtEventStart.DD}`,
  'data': [],
};

function getPoint(row, svsIdx) {
  let p = parseInt(row[svsIdx]);
  if (Number.isNaN(p)) p = null;
  return p;
}

const pointData = rawServerDataRows.map((row) => row.split('\t'));
const svrCount = pointData[0].length;

for (let svsIdx = 0; svsIdx < svrCount; svsIdx++) {
  const s = pointData[0][svsIdx];
  if (servers.indexOf(s) === -1) servers.push(s);

  const data = {
    server:  s,
    final: {
      '1':  {points: getPoint(pointData[1], svsIdx), server: s},
      '2':  {points: getPoint(pointData[2], svsIdx), server: s},
      '3':  {points: getPoint(pointData[3], svsIdx), server: s},
      '20': {points: getPoint(pointData[4], svsIdx), server: s},
    }
  };

  compiledData.data.push(data)
}

compiledData.data.push(globalData);

const exportedJSON = JSON.stringify(compiledData, null, '  ');

fs.writeFileSync(`${exportFileFragment}.json`, exportedJSON);

const bodyContent = [];

function getFinalPointHTML(rank, finalData, servers) {
  const MaxPoints = MaxFinalPoints;
  const points = finalData?.[rank]?.points || null

  const rankClass = ((rank ==='1')||(rank ==='2')||(rank === '3'))?'rank-' + rank:'rank';
  const server = finalData[rank].server;
  const serverClass = 'server' + (servers.indexOf(server) + 1);

  if (points === null) {
    return (
      `<td class="final-col">` + 
      `<span class="event-${rankClass}">${rank}</span>` +
      '<div class="bar-container"></div>' +
      `<span class="bar-text">N/A</span>` +
      `<div class="server-tag right ${serverClass}">${server}</div>` +
      '</td>'
    )
  }

  const pointsDisplay = formatPoint(points);
  const barStyle = `width: ${(100 * points / MaxPoints).toFixed(1)}%`;

  return (
    `<td class="final-col">` + 
    `<span class="event-${rankClass}">${rank}</span>` +
    '<div class="bar-container">' +
    `<span class="bar ${serverClass}" style="${barStyle}">&thinsp;</span>` +
    '</div>' +
    `<span class="bar-text">${pointsDisplay}</span>` +
    `<div class="server-tag right ${serverClass}">${server}</div>` +
    '</td>'
  );
}

// generate server data html
for (let svrIdx = 0; svrIdx < svrCount-1; svrIdx++) {
  const svrData = compiledData.data[svrIdx];
  const serverClass = 'server' + (servers.indexOf(svrData.server) + 1);
  bodyContent.push('<tr class="new-section server-row">');
  bodyContent.push(
    '<td rowspan="4" class="server-col">' +
    `<span class="server-tag ${serverClass}">${svrData.server}</span>` + 
    '</td>',
  );

  bodyContent.push(getFinalPointHTML( '1', svrData.final, servers));
  bodyContent.push('</tr>');
  bodyContent.push('<tr class="server-row">');
  bodyContent.push(getFinalPointHTML( '2', svrData.final, servers));
  bodyContent.push('</tr>');
  bodyContent.push('<tr class="server-row">');
  bodyContent.push(getFinalPointHTML( '3', svrData.final, servers));
  bodyContent.push('</tr>');
  bodyContent.push('<tr class="server-row sub-section">');
  bodyContent.push(getFinalPointHTML( '20', svrData.final, servers));
  bodyContent.push('</tr>');
}

// generate global data html
{
  bodyContent.push('<tr class="new-section global-row">');
  bodyContent.push(
    '<td rowspan="20" class="server-col">' +
    `<span class="server-tag global">Global</span>` + 
    '</td>',
  );

  bodyContent.push(getFinalPointHTML( '1', globalData.final, servers));
  bodyContent.push('</tr>');

  for (let r = 2; r < 20; r++) {
    bodyContent.push('<tr class="global-row">');
    bodyContent.push(getFinalPointHTML( r.toString(), globalData.final, servers));
    bodyContent.push('</tr>');
  }
}

const htmlTemplate =  fs.readFileSync('template.html', 'utf-8');
const exportedHtml = htmlTemplate
  .replace('{{TABLE BODY}}', bodyContent.join('\n'))
  .replaceAll('{{EVENT START YEAR}}' , fmtEventStart.YYYY)
  .replaceAll('{{EVENT START MONTH}}', fmtEventStart.MM)
  .replaceAll('{{EVENT START DAY}}'  , fmtEventStart.DD)
  .replaceAll('{{EVENT END YEAR}}' , fmtEventEnd.YYYY)
  .replaceAll('{{EVENT END MONTH}}', fmtEventEnd.MM)
  .replaceAll('{{EVENT END DAY}}'  , fmtEventEnd.DD);

fs.writeFileSync(`${exportFileFragment}.html`, exportedHtml);
