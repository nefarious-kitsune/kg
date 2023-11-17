import fs from 'fs';
import {getDateFormatStrings, getUTCDate} from '../../utils/date-utils.js';
import {formatPoint} from '../../utils/number-utils.js';

const eventStartDate = getUTCDate(2023, 10, 23);
const eventName = 'Mightiest Kingdom';
const eventDuration = 6; // 6-days
const eventPrefix = 'mk-';

const MaxPhasePoints = (350 * 1000 * 1000); // non UP week
const MaxFinalPoints = (600 * 1000 * 1000); // non UP week
// const MaxPhasePoints = (1.5 * 1000 * 1000 * 1000); // Up week
// const MaxFinalPoints = (2.2 * 1000 * 1000 * 1000); // Up week

const eventEndDate = new Date()
eventEndDate.setDate(eventStartDate.getDate() + eventDuration - 1);

const fmtEventStart = getDateFormatStrings(eventStartDate);
const fmtEventEnd   = getDateFormatStrings(eventEndDate);

const exportDirectory = '../../../../docs/events';
const dateFragment = `${fmtEventStart.YYYY}${fmtEventStart.MM}${fmtEventStart.DD}`;
const exportFileFragment = `${exportDirectory}/${eventPrefix}${dateFragment}`;

const rawDataRows = fs
  .readFileSync(`${eventPrefix}${dateFragment}.tsv`, 'utf-8')
  .replaceAll('\r','')
  .replaceAll(',','')
  .split('\n');

function getPointData(row, svsIdx) {
  // const dataCol = svsIdx * 2;
  // const serverCol = dataCol + 1;

  let p = parseInt(row[svsIdx]);
  if (Number.isNaN(p)) p = null;

  return ({points: p, server: null})
}

const compiledData = {
  'event': eventName,
  'start-date': `${fmtEventStart.YYYY}-${fmtEventStart.MM}-${fmtEventStart.DD}`,
  'data': [],
};

const servers1 = rawDataRows[0].split('\t').filter((txt) => txt.length > 0);
const servers2 = rawDataRows[1].split('\t').filter((txt) => txt.length > 0);
const pointData = rawDataRows.slice(2).map((row) => row.split('\t'));

for (let svsIdx = 0; svsIdx < servers1.length; svsIdx++) {
  const data = {
    server:  servers1[svsIdx],
    server2: servers2[svsIdx],
    final: {
      '1':  getPointData(pointData[0], svsIdx),
      '2':  getPointData(pointData[1], svsIdx),
      '3':  getPointData(pointData[2], svsIdx),
      '20': getPointData(pointData[3], svsIdx),
    },
    phase1: {
      '1':  getPointData(pointData[4], svsIdx),
      '2':  getPointData(pointData[5], svsIdx),
      '3':  getPointData(pointData[6], svsIdx),
      '4':  getPointData(pointData[7], svsIdx),
    },
    phase2: {
      '1':  getPointData(pointData[8], svsIdx),
      '2':  getPointData(pointData[9], svsIdx),
      '3':  getPointData(pointData[10], svsIdx),
      '4':  getPointData(pointData[11], svsIdx),
    },
    phase3: {
      '1':  getPointData(pointData[12], svsIdx),
      '2':  getPointData(pointData[13], svsIdx),
      '3':  getPointData(pointData[14], svsIdx),
      '4':  getPointData(pointData[15], svsIdx),
    },
    phase4: {
      '1':  getPointData(pointData[16], svsIdx),
      '2':  getPointData(pointData[17], svsIdx),
      '3':  getPointData(pointData[18], svsIdx),
      '4':  getPointData(pointData[19], svsIdx),
    },
    phase5: {
      '1':  getPointData(pointData[20], svsIdx),
      '2':  getPointData(pointData[21], svsIdx),
      '3':  getPointData(pointData[22], svsIdx),
      '4':  getPointData(pointData[23], svsIdx),
    },
    phase6: {
      '1':  getPointData(pointData[24], svsIdx),
      '2':  getPointData(pointData[25], svsIdx),
      '3':  getPointData(pointData[26], svsIdx),
      '4':  getPointData(pointData[27], svsIdx),
    },
  };

  compiledData.data.push(data)
}

const exportedJSON = JSON.stringify(compiledData, null, '  ');

fs.writeFileSync(`${exportFileFragment}.json`, exportedJSON);

const bodyContent = [];
const svsHTML = [];

function getPhasePointHTML(phase, rank, phaseData, servers) {
  const MaxPoints = MaxPhasePoints;
  const points = phaseData?.[rank]?.points || null
  
  const rankClass = ((rank ==='1')||(rank ==='2')||(rank === '3'))?'rank-' + rank:'rank';

  if (points === null) {
    return (
      `<td class="phase-col phase-${phase}-col">` + 
      `<span class="event-${rankClass}">${rank}</span>` +
      '<div class="bar-container"></div>' +
      `<span class="bar-text">N/A</span>` +
      '</td>'
    )
  }

  const pointsDisplay = formatPoint(points);
  const barStyle = `width: ${(100 * points / MaxPoints).toFixed(1)}%`;

  return (
    `<td class="phase-col phase-${phase}-col">` + 
    `<span class="event-${rankClass}">${rank}</span>` +
    '<div class="bar-container">' +
    `<span class="bar server2" style="${barStyle}">&thinsp;</span>` +
    '</div>' +
    `<span class="bar-text">${pointsDisplay}</span>` +
    '</td>'
  );
}

function getFinalPointHTML(rank, finalData, servers) {
  const MaxPoints = MaxFinalPoints;
  const points = finalData?.[rank]?.points || null

  const rankClass = ((rank ==='1')||(rank ==='2')||(rank === '3'))?'rank-' + rank:'rank';

  if (points === null) {
    return (
      `<td class="final-col">` + 
      `<span class="event-${rankClass}">${rank}</span>` +
      '<div class="bar-container">&thinsp;</div>' +
      `<span class="bar-text">N/A</span>` +
      '</td>'
    )
  }

  const pointsDisplay = formatPoint(points);
  const barStyle = `width: ${(100 * points / MaxPoints).toFixed(1)}%`;

  return (
    `<td class="final-col">` + 
    `<span class="event-${rankClass}">${rank}</span>` +
    '<div class="bar-container">' +
    `<span class="bar server1" style="${barStyle}">&thinsp;</span>` +
    '</div>' +
    `<span class="bar-text">${pointsDisplay}</span>` +
    '</td>'
  );
}

for (let svsIdx = 0; svsIdx < servers1.length; svsIdx++) {
  const servers = [servers1 [svsIdx], servers2[svsIdx]];
  const svsData = compiledData.data[svsIdx];
  const html = {
    final: {
      row1:  getFinalPointHTML( '1', svsData.final, servers),
      row2:  getFinalPointHTML( '2', svsData.final, servers),
      row3:  getFinalPointHTML( '3', svsData.final, servers),
      row4:  getFinalPointHTML('20', svsData.final, servers),
    },
    phase1: {
      row1:  getPhasePointHTML(1, '1', svsData.phase1, servers),
      row2:  getPhasePointHTML(1, '2', svsData.phase1, servers),
      row3:  getPhasePointHTML(1, '3', svsData.phase1, servers),
      row4:  getPhasePointHTML(1, '4', svsData.phase1, servers),
    },
    phase2: {
      row1:  getPhasePointHTML(2, '1', svsData.phase2, servers),
      row2:  getPhasePointHTML(2, '2', svsData.phase2, servers),
      row3:  getPhasePointHTML(2, '3', svsData.phase2, servers),
      row4:  getPhasePointHTML(2, '4', svsData.phase2, servers),
    },
    phase3: {
      row1:  getPhasePointHTML(3, '1', svsData.phase3, servers),
      row2:  getPhasePointHTML(3, '2', svsData.phase3, servers),
      row3:  getPhasePointHTML(3, '3', svsData.phase3, servers),
      row4:  getPhasePointHTML(3, '4', svsData.phase3, servers),
    },
    phase4: {
      row1:  getPhasePointHTML(4, '1', svsData.phase4, servers),
      row2:  getPhasePointHTML(4, '2', svsData.phase4, servers),
      row3:  getPhasePointHTML(4, '3', svsData.phase4, servers),
      row4:  getPhasePointHTML(4, '4', svsData.phase4, servers),
    },
    phase5: {
      row1:  getPhasePointHTML(5, '1', svsData.phase5, servers),
      row2:  getPhasePointHTML(5, '2', svsData.phase5, servers),
      row3:  getPhasePointHTML(5, '3', svsData.phase5, servers),
      row4:  getPhasePointHTML(5, '4', svsData.phase5, servers),
    },
    phase6: {
      row1:  getPhasePointHTML(6, '1', svsData.phase6, servers),
      row2:  getPhasePointHTML(6, '2', svsData.phase6, servers),
      row3:  getPhasePointHTML(6, '3', svsData.phase6, servers),
      row4:  getPhasePointHTML(6, '4', svsData.phase6, servers),
    },
  };
  svsHTML.push(html);
}

for (let svsIdx = 0; svsIdx < servers1.length; svsIdx++) {
  const svsData = compiledData.data[svsIdx];
  bodyContent.push('<tr class="new-section">');
  bodyContent.push(
    '<td rowspan="4" class="server-col">' +
    '<span class="server-tag server1">' + svsData.server + '</span>' + 
    '<span class="svs-vs">vs</span>' + 
    '<span class="server-tag server2">' + svsData.server2 + '</span>' + 
    '</td>',
  );

  // First row
  bodyContent.push(svsHTML[svsIdx].final.row1);
  
  bodyContent.push(svsHTML[svsIdx].phase1.row1);
  bodyContent.push(svsHTML[svsIdx].phase2.row1);
  bodyContent.push(svsHTML[svsIdx].phase3.row1);
  bodyContent.push(svsHTML[svsIdx].phase4.row1);
  bodyContent.push(svsHTML[svsIdx].phase5.row1);
  bodyContent.push(svsHTML[svsIdx].phase6.row1);

  bodyContent.push('</tr>');
 
  ['2', '3', '4'].forEach((rowIdx) => {
    bodyContent.push('<tr>');
    bodyContent.push(svsHTML[svsIdx].final['row' + rowIdx]);
    bodyContent.push(svsHTML[svsIdx].phase1['row' + rowIdx]);
    bodyContent.push(svsHTML[svsIdx].phase2['row' + rowIdx]);
    bodyContent.push(svsHTML[svsIdx].phase3['row' + rowIdx]);
    bodyContent.push(svsHTML[svsIdx].phase4['row' + rowIdx]);
    bodyContent.push(svsHTML[svsIdx].phase5['row' + rowIdx]);
    bodyContent.push(svsHTML[svsIdx].phase6['row' + rowIdx]);
    bodyContent.push('</tr>')
  })
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
