import fs from 'fs';

const eventDate = '20231106';

// // Non UP week
// const MaxPhasePoints = (350 * 1000 * 1000);
// const MaxFinalPoints = (600 * 1000 * 1000);

// UP week
const MaxPhasePoints = (1.5 * 1000 * 1000 * 1000);
const MaxFinalPoints = (2.2 * 1000 * 1000 * 1000);

const evtStartY = parseInt(eventDate.slice(0,4));
let evtStartM = parseInt(eventDate.slice(4,6));
let evtStartD = parseInt(eventDate.slice(6  ));

const exportDirectory = '../../../../docs/events';
const eventStartDate = new Date(Date.UTC(evtStartY, evtStartM - 1, evtStartD));
const eventEndDate = new Date()
eventEndDate.setDate(eventStartDate.getDate() + 5);

if (evtStartM < 10) evtStartM = '0' + evtStartM;
if (evtStartD < 10) evtStartD = '0' + evtStartD;

const evtEndY = eventEndDate.getUTCFullYear();

let evtEndM = eventEndDate.getUTCMonth() + 1;
let evtEndD = eventEndDate.getUTCDate();
if (evtEndM < 10) evtEndM = '0' + evtEndM;
if (evtEndD < 10) evtEndD = '0' + evtEndD;

const rawDataRows =  fs.readFileSync(`_${eventDate}.tsv`, 'utf-8').split('\n');

function getPointData(row, svsIdx) {
  const dataCol = svsIdx * 2;
  const serverCol = dataCol + 1;

  let p = parseInt(row[dataCol]);
  if (Number.isNaN(p)) p = null;

  return ({points: p, server: row[serverCol]})
}

const compiledData = {
  'event': 'Mightiest Kingdom',
  'event-date': `${evtStartY}-${evtStartM}-${evtStartD}`,
  'data': [],
};

const servers1 = rawDataRows[0].split('\t').filter((txt) => txt.length > 0);
const servers2 = rawDataRows[1].split('\t').filter((txt) => txt.length > 0);
const pointData = rawDataRows.slice(2).map((row) => row.split('\t'));

for (let svsIdx = 0; svsIdx < servers1.length; svsIdx++) {
  const data = {
    server:  servers1 [svsIdx],
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

fs.writeFileSync(`${exportDirectory}/mk-${eventDate}.json`, exportedJSON);

const bodyContent = [];
const svsHTML = [];

function getPhasePointHTML(phase, rank, phaseData, server1) {
  const MaxPoints = MaxPhasePoints;
  const MaxBarWidth = 6;
  const points = phaseData?.[rank]?.points || null
  if (points === null) {
    return (
      `<td class="mk-phase-${phase}-col">` + 
      `<span class="event-rank-${rank}">${rank}</span>` +
      '<span class="phase-point">N/A</span>' +
      '</td>'
    )
  }

  let pointsDisplay;
  let barWidth;
  const server = phaseData[rank].server;

  if (points > 1 * 1000 * 1000 * 1000) {
    pointsDisplay = (points/(1000*1000*1000)).toFixed(1) + 'B';
  } else {
    pointsDisplay = 
    (points > 10 * 1000 * 1000)?
    (points/(1000*1000)).toFixed(0) + 'M':
    (points/(1000*1000)).toFixed(1) + 'M';
  }  

  barWidth = (MaxBarWidth * points / MaxPoints);

  let html =
    `<td class="mk-phase-${phase}-col">` + 
    `<span class="event-rank-${rank}">${rank}</span>`;

  const barClass = `phase-point-bar server${(server === server1)?'1':'2'}`;
  const barStyle = `width: ${barWidth.toFixed(1)}rem`;

  if (barWidth >= (MaxBarWidth/2)) {
    html += `<div class="${barClass}" style="${barStyle}"><span class="phase-point">${pointsDisplay}</span></div>`;
  } else {
    html += `<div class="${barClass}" style="${barStyle}">&nbsp;</div><span class="phase-point">${pointsDisplay}</span></td>`;
  }

  html += '</td>';
  return html;
}

function getFinalPointHTML(rank, finalData, server1) {
  const MaxPoints = MaxFinalPoints;
  const MaxBarWidth = 16;
  const points = finalData?.[rank]?.points || null

  if (points === null) {
    return (
      `<td class="mk-final--col">` + 
      `<span class="event-rank-${rank}">${rank}</span>` +
      '<span class="final-point">N/A</span>' +
      '</td>'
    )
  }

  let pointsDisplay;
  let barWidth;
  const server = finalData[rank].server;

  if (points > 1 * 1000 * 1000 * 1000) {
    pointsDisplay = (points/(1000*1000*1000)).toFixed(1) + 'B';
  } else {
    pointsDisplay = 
    (points > 10 * 1000 * 1000)?
    (points/(1000*1000)).toFixed(0) + 'M':
    (points/(1000*1000)).toFixed(1) + 'M';
  }

  barWidth = (MaxBarWidth * points / MaxPoints);

  let html =
    `<td class="mk-final-col">` + 
    `<span class="event-rank-${rank}">${rank}</span>`;

  const barClass = `final-point-bar server${(server === server1)?'1':'2'}`;
  const barStyle = `width: ${barWidth.toFixed(1)}rem`;

  if (barWidth >= (MaxBarWidth/2)) {
    html += `<div class="${barClass}" style="${barStyle}"><span class="final-point">${pointsDisplay}</span></div>`;
  } else {
    html += `<div class="${barClass}" style="${barStyle}">&nbsp;</div><span class="final-point">${pointsDisplay}</span></td>`;
  }

  html += '</td>';
  return html;
}

for (let svsIdx = 0; svsIdx < servers1.length; svsIdx++) {
  const server1  = servers1 [svsIdx];
  // const server2 = servers2[svsIdx];
  const svsData = compiledData.data[svsIdx];
  const html = {
    final: {
      row1:  getFinalPointHTML( '1', svsData.final, server1),
      row2:  getFinalPointHTML( '2', svsData.final, server1),
      row3:  getFinalPointHTML( '3', svsData.final, server1),
      row4:  getFinalPointHTML('20', svsData.final, server1),
    },
    phase1: {
      row1:  getPhasePointHTML(1, '1', svsData.phase1, server1),
      row2:  getPhasePointHTML(1, '2', svsData.phase1, server1),
      row3:  getPhasePointHTML(1, '3', svsData.phase1, server1),
      row4:  getPhasePointHTML(1, '4', svsData.phase1, server1),
    },
    phase2: {
      row1:  getPhasePointHTML(2, '1', svsData.phase2, server1),
      row2:  getPhasePointHTML(2, '2', svsData.phase2, server1),
      row3:  getPhasePointHTML(2, '3', svsData.phase2, server1),
      row4:  getPhasePointHTML(2, '4', svsData.phase2, server1),
    },
    phase3: {
      row1:  getPhasePointHTML(3, '1', svsData.phase3, server1),
      row2:  getPhasePointHTML(3, '2', svsData.phase3, server1),
      row3:  getPhasePointHTML(3, '3', svsData.phase3, server1),
      row4:  getPhasePointHTML(3, '4', svsData.phase3, server1),
    },
    phase4: {
      row1:  getPhasePointHTML(4, '1', svsData.phase4, server1),
      row2:  getPhasePointHTML(4, '2', svsData.phase4, server1),
      row3:  getPhasePointHTML(4, '3', svsData.phase4, server1),
      row4:  getPhasePointHTML(4, '4', svsData.phase4, server1),
    },
    phase5: {
      row1:  getPhasePointHTML(5, '1', svsData.phase5, server1),
      row2:  getPhasePointHTML(5, '2', svsData.phase5, server1),
      row3:  getPhasePointHTML(5, '3', svsData.phase5, server1),
      row4:  getPhasePointHTML(5, '4', svsData.phase5, server1),
    },
    phase6: {
      row1:  getPhasePointHTML(6, '1', svsData.phase6, server1),
      row2:  getPhasePointHTML(6, '2', svsData.phase6, server1),
      row3:  getPhasePointHTML(6, '3', svsData.phase6, server1),
      row4:  getPhasePointHTML(6, '4', svsData.phase6, server1),
    },
  };
  svsHTML.push(html);
}

for (let svsIdx = 0; svsIdx < servers1.length; svsIdx++) {
  const svsData = compiledData.data[svsIdx];
  bodyContent.push('<tr class="new-section">');
  bodyContent.push(
    '<td rowspan="4" class="server-col">' +
    '<span class="svs-server1">' + svsData.server + '</span>' + 
    '<span class="svs-vs">vs</span>' + 
    '<span class="svs-server2">' + svsData.server2 + '</span>' + 
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
  .replaceAll('{{EVENT START YEAR}}', evtStartY)
  .replaceAll('{{EVENT START MONTH}}', evtStartM)
  .replaceAll('{{EVENT START DAY}}', evtStartD)
  .replaceAll('{{EVENT END YEAR}}', evtEndY)
  .replaceAll('{{EVENT END MONTH}}', evtEndM)
  .replaceAll('{{EVENT END DAY}}', evtEndD);

fs.writeFileSync(`${exportDirectory}/mk-${eventDate}.html`, exportedHtml);
