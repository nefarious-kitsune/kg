import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'

import { sanitizeMaxPoint, formatPoint } from '../../utils/number-utils.js';
import { buildBase } from '../../base/build.js';

const ModulePath = dirname(fileURLToPath(import.meta.url));

const EventData = JSON.parse(readFileSync(
  resolve(ModulePath, './data/data.json'),
  'utf-8'));

const contentTemplate = readFileSync(
  resolve(ModulePath, './templates/result-content.html'),
  'utf-8');

const indexTemplate = readFileSync(
  resolve(ModulePath, './templates/result-index.html'),
  'utf-8');

const indexList = [];
const eventCount = EventData.length;

for (let eventIdx = 0; eventIdx < eventCount; eventIdx++) {
  const currEventData = EventData[eventIdx];

  if (currEventData['sheet-url'] === '') {
    indexList.unshift(`  <li>${currEventData.date}</li>`);
    continue;
  }

  currEventData['svs-results'] = [];
  let maxPhasePoints = [0, 0, 0, 0, 0, 0];
  let maxFinalPoints = 0;

  const yyyy = currEventData.date.substring(0, 4);
  const mm = currEventData.date.substring(5, 7);
  const dd = currEventData.date.substring(8, 10);
  const dataFileName = `./data/mk-${yyyy}${mm}${dd}.tsv`;

  const rawDataRows = readFileSync(dataFileName, 'utf-8')
    .replaceAll('\r','')
    .replaceAll(',','')
    .split('\n');

  const servers1 = rawDataRows[0].split('\t').filter((txt) => txt.length > 0);
  const servers2 = rawDataRows[1].split('\t').filter((txt) => txt.length > 0);
  const serverList = servers1.concat(servers2).sort().join(', ');
  // Remove first 2 rows, then split into a table
  const pointData = rawDataRows.slice(2).map((row) => row.split('\t'));

  function getPointData(row, svsIdx) {
    const dataCol = svsIdx * 2;
    const serverCol = dataCol + 1;
    let p = parseInt(row[dataCol]);
    if (Number.isNaN(p)) p = null;
    return ({points: p, server: row[serverCol]})
  }

  for (let svsIdx = 0; svsIdx < servers1.length; svsIdx++) {
    const svsData = {
      server:  servers1[svsIdx],
      server2: servers2[svsIdx],
    };

    currEventData['svs-results'].push(svsData);

    const finalData =  {
      '1':  getPointData(pointData[0], svsIdx),
      '2':  getPointData(pointData[1], svsIdx),
      '3':  getPointData(pointData[2], svsIdx),
      '20': getPointData(pointData[3], svsIdx),
    };
    const topPoints = finalData['1'].points;
    if ((topPoints !== null) && (topPoints > maxFinalPoints)) {
      maxFinalPoints = topPoints;
    }
    svsData.final = finalData;

    // if (!currEventData['phase-data']) continue;

    for (let phaseIdx = 0; phaseIdx < 6; phaseIdx++ ) {
      const phaseData = {
        '1':  getPointData(pointData[phaseIdx * 4 + 4], svsIdx),
        '2':  getPointData(pointData[phaseIdx * 4 + 5], svsIdx),
        '3':  getPointData(pointData[phaseIdx * 4 + 6], svsIdx),
        '4':  getPointData(pointData[phaseIdx * 4 + 7], svsIdx),
      };
      const maxPoints = maxPhasePoints[phaseIdx];
      const topPoints = phaseData['1'].points;
      if ((topPoints !== null) && (topPoints > maxPoints)) {
        maxPhasePoints[phaseIdx] = topPoints;
      }
      svsData['phase' + (phaseIdx+1)] = phaseData;
    }
  }  

  currEventData['servers'] = [servers1, servers2];
  currEventData['server-list'] = serverList;
  currEventData['max-phase-point'] = maxPhasePoints;
  currEventData['max-final-point'] = maxFinalPoints;
  
  const htmlOutputSnippets = [];
  const MaxDisplayFinalPoint = sanitizeMaxPoint(maxFinalPoints);
  const MaxDisplayPhasePoint = sanitizeMaxPoint(Math.max(...maxPhasePoints));
  for (let svsIdx = 0; svsIdx < servers1.length; svsIdx++) {
    const svsData = currEventData['svs-results'][svsIdx];

    function generateFinalSnippet(rank, finalData, servers) {
      const MaxPoints = MaxDisplayFinalPoint;
      const points = finalData?.[rank]?.points || null;
      const rankClass = ((rank ==='1')||(rank ==='2')||(rank === '3'))?'rank-' + rank:'rank';
      const server = finalData[rank].server;
      const serverClass = 'server' + (servers.indexOf(server) + 1);
      if (points === null) {
        return (
          `<td class="final-col">` + 
          `<span class="event-${rankClass}">${rank}</span>` +
          '<div class="bar-container"></div>' +
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
        `<span class="bar ${serverClass}" style="${barStyle}">&thinsp;</span>` +
        '</div>' +
        `<span class="bar-text">${pointsDisplay}</span>` +
        `<div class="server-tag right ${serverClass}">${server}</div>` +
        '</td>'
      );
    }
    function generatePhaseSnippet(phase, rank, phaseData, servers) {
      const MaxPoints = MaxDisplayPhasePoint;
      const points = phaseData?.[rank]?.points || null;
      const rankClass = 'rank-' + rank;
      const server = phaseData[rank].server;
      const serverClass = 'server' + (servers.indexOf(server) + 1);
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
        `<span class="bar ${serverClass}" style="${barStyle}">&thinsp;</span>` +
        '</div>' +
        `<span class="bar-text">${pointsDisplay}</span>` +
        '</td>'
      );
    }
    const svsServes = [servers1[svsIdx], servers2[svsIdx]];  
    const snippets = {
      final: {
        row1:  generateFinalSnippet( '1', svsData.final, svsServes),
        row2:  generateFinalSnippet( '2', svsData.final, svsServes),
        row3:  generateFinalSnippet( '3', svsData.final, svsServes),
        row4:  generateFinalSnippet('20', svsData.final, svsServes),
      },
      phase1: {
        row1:  generatePhaseSnippet(1, '1', svsData.phase1, svsServes),
        row2:  generatePhaseSnippet(1, '2', svsData.phase1, svsServes),
        row3:  generatePhaseSnippet(1, '3', svsData.phase1, svsServes),
        row4:  generatePhaseSnippet(1, '4', svsData.phase1, svsServes),
      },
      phase2: {
        row1:  generatePhaseSnippet(2, '1', svsData.phase2, svsServes),
        row2:  generatePhaseSnippet(2, '2', svsData.phase2, svsServes),
        row3:  generatePhaseSnippet(2, '3', svsData.phase2, svsServes),
        row4:  generatePhaseSnippet(2, '4', svsData.phase2, svsServes),
      },
      phase3: {
        row1:  generatePhaseSnippet(3, '1', svsData.phase3, svsServes),
        row2:  generatePhaseSnippet(3, '2', svsData.phase3, svsServes),
        row3:  generatePhaseSnippet(3, '3', svsData.phase3, svsServes),
        row4:  generatePhaseSnippet(3, '4', svsData.phase3, svsServes),
      },
      phase4: {
        row1:  generatePhaseSnippet(4, '1', svsData.phase4, svsServes),
        row2:  generatePhaseSnippet(4, '2', svsData.phase4, svsServes),
        row3:  generatePhaseSnippet(4, '3', svsData.phase4, svsServes),
        row4:  generatePhaseSnippet(4, '4', svsData.phase4, svsServes),
      },
      phase5: {
        row1:  generatePhaseSnippet(5, '1', svsData.phase5, svsServes),
        row2:  generatePhaseSnippet(5, '2', svsData.phase5, svsServes),
        row3:  generatePhaseSnippet(5, '3', svsData.phase5, svsServes),
        row4:  generatePhaseSnippet(5, '4', svsData.phase5, svsServes),
      },
      phase6: {
        row1:  generatePhaseSnippet(6, '1', svsData.phase6, svsServes),
        row2:  generatePhaseSnippet(6, '2', svsData.phase6, svsServes),
        row3:  generatePhaseSnippet(6, '3', svsData.phase6, svsServes),
        row4:  generatePhaseSnippet(6, '4', svsData.phase6, svsServes),
      },
    };
    htmlOutputSnippets.push(snippets);
  }

  const tableBody = [];

  for (let svsIdx = 0; svsIdx < servers1.length; svsIdx++) {
    const svsData = currEventData['svs-results'][svsIdx];

    tableBody.push('<tr class="new-section">');
    tableBody.push(
      '<td rowspan="4" class="server-col">' +
      '<span class="server-tag server1">' + svsData.server + '</span>' + 
      '<span class="svs-vs">vs</span>' + 
      '<span class="server-tag server2">' + svsData.server2 + '</span>' + 
      '</td>',
    );
    // Generate data for rank #1
    tableBody.push(htmlOutputSnippets[svsIdx].final.row1);

    if (currEventData['phase-data']) {
      tableBody.push(htmlOutputSnippets[svsIdx].phase1.row1);
      tableBody.push(htmlOutputSnippets[svsIdx].phase2.row1);
      tableBody.push(htmlOutputSnippets[svsIdx].phase3.row1);
      tableBody.push(htmlOutputSnippets[svsIdx].phase4.row1);
      tableBody.push(htmlOutputSnippets[svsIdx].phase5.row1);
      tableBody.push(htmlOutputSnippets[svsIdx].phase6.row1);
    }

    tableBody.push('</tr>');

    // Generate data for rank #2, #3, and #4/#20
    ['2', '3', '4'].forEach((rowIdx) => {
      tableBody.push('<tr>');
      tableBody.push(htmlOutputSnippets[svsIdx].final['row' + rowIdx]);
      if (currEventData['phase-data']) {
        tableBody.push(htmlOutputSnippets[svsIdx].phase1['row' + rowIdx]);
        tableBody.push(htmlOutputSnippets[svsIdx].phase2['row' + rowIdx]);
        tableBody.push(htmlOutputSnippets[svsIdx].phase3['row' + rowIdx]);
        tableBody.push(htmlOutputSnippets[svsIdx].phase4['row' + rowIdx]);
        tableBody.push(htmlOutputSnippets[svsIdx].phase5['row' + rowIdx]);
        tableBody.push(htmlOutputSnippets[svsIdx].phase6['row' + rowIdx]);
      }
      
      tableBody.push('</tr>')
    })
  }

  const tabButtons = [];
  if (currEventData['phase-data']) {
    tabButtons.push(
      '<button onclick="switchMKTableView(0)" id="mk-tab-0" class="tab focused">Final</button>'
    );

    if ((maxPhasePoints[0] > 0) || (maxPhasePoints[1] > 0)) {
      tabButtons.push('<button onclick="switchMKTableView(1)" id="mk-tab-1" class="tab">Phase 1~2</button>');
    } else {
      tabButtons.push('<button id="mk-tab-1" class="tab" disabled="disabled">Phase 1~2</button>');
    }

    if ((maxPhasePoints[2] > 0) || (maxPhasePoints[3] > 0)) {
      tabButtons.push('<button onclick="switchMKTableView(2)" id="mk-tab-2" class="tab">Phase 3~4</button>');
    } else {
      tabButtons.push('<button id="mk-tab-2" class="tab" disabled="disabled">Phase 3~4</button>');
    }

    if ((maxPhasePoints[4] > 0) || (maxPhasePoints[5] > 0)) {
      tabButtons.push('<button onclick="switchMKTableView(3)" id="mk-tab-3" class="tab">Phase 5~6</button>');
    } else {
      tabButtons.push('<button id="mk-tab-3" class="tab" disabled="disabled">Phase 5~6</button>');
    }
  } else {
    tabButtons.push('<button id="mk-tab-0" class="tab focused">Final</button>');
  }

  const contentHtml = contentTemplate
    .replace('{{TABLE BODY}}', tableBody.join('\n'))
    .replaceAll('{{SERVER LIST}}' , serverList)
    .replaceAll('{{SHEET LINK}}'  , currEventData['sheet-url'])
    .replaceAll('{{EVENT START YEAR}}' , yyyy)
    .replaceAll('{{EVENT START MONTH}}', mm)
    .replaceAll('{{EVENT START DAY}}'  , dd)
    .replaceAll('{{TABS}}'  , tabButtons.join('\n'))
  ;

  const resultOutputName = `mk-${yyyy}${mm}${dd}`;
  const resultOutputOptions = {
    type: 'chart',
    path: {
      base: `/events/${resultOutputName}`,
      icon: '/images/logo_mini.png',
    },
    css: {
      links: [
        '/css/common.css',
        '/events/event-data.css',
      ],
    },
    js: {
      links: [
        '/events/event-common.js',
      ],
    },
    breadcrumb: [
      {path: '/content', title: 'Home'},
      {path: '/events/', title: 'Events'},
      {path: '/events/mk', title: 'Mightiest Kingdom'},
      {path: '/events/mk-results', title: 'Results'},
    ],
    content: contentHtml,
    shortTitle: `${yyyy}-${mm}-${dd}`,
    title: `${yyyy}-${mm}-${dd} Mightiest Kingdom Results`,
    description: `Mightiest Kingdom results for the week of ${yyyy}-${mm}-${dd} (${serverList})`,
  };
  const output = buildBase(resultOutputOptions);
  writeFileSync(`../../../docs/events/${resultOutputName}.html`, output);

  const tempArray = servers1.concat(servers2).sort();
  const chunkedList = [];
  const chunkSize = 9;
  for (let i = 0; i < tempArray.length; i += chunkSize) {
    const chunk = tempArray.slice(i, i + chunkSize);
    chunkedList.push(chunk.join(', '));
  }

  let indexLink = `<a href="./${resultOutputName}">${currEventData.date}</a>`;
  if (currEventData['up-week']) indexLink = '<strong>'+indexLink+'</strong>';
  indexList.unshift(
    `  <li>${indexLink}\n (` + chunkedList.join(',\n  ') + ')</li>'
  );
}

const indexContentHtml = indexTemplate
  .replaceAll('{{ENTRY LIST}}' , indexList.join('\n'));

const indexOutputName = `mk-results`;
const indexOutputOptions = {
  type: 'chart',
  path: {
    base: `/events/${indexOutputName}`,
    icon: '/images/logo_mini.png',
  },
  css: {
    links: [
      '/css/common.css',
      '/events/event-data.css',
    ],
  },
  js: {
    links: [
      '/events/event-common.js',
    ],
  },
  breadcrumb: [
    {path: '/content', title: 'Home'},
    {path: '/events/', title: 'Events'},
    {path: '/events/mk', title: 'Mightiest Kingdom'},
  ],
  content: indexContentHtml,
  shortTitle: 'Results',
  title: `Past Mightiest Kingdom Results`,
  description: `Past results of the Mightiest Kingdom event`,
};
const indexOutput = buildBase(indexOutputOptions);
writeFileSync(`../../../docs/events/${indexOutputName}.html`, indexOutput);

let exportedJSON = JSON.stringify(EventData, null, '  ');
writeFileSync(`../../../docs/events/${indexOutputName}.json`, exportedJSON);

// console.log(EventData);
