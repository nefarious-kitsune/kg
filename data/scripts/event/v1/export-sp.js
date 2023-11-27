import fs from 'fs';

const MaxSpFinalPoints = 4000000;

const rawSpPointData =
`#1	3422200	#1	604000	#1	1022000	#1	1067800	#1	452200	#1	368400	#1	348000	#1	347200	#1	322800	#1	252400	#1	161700	#1	147000	#1	2034100
#2	2652300	#2	598200	#2	875600	#2	750100	#2	309700	#2	280000	#2	300200	#2	260300	#2	254800	#2	228500	#2	134700	#2	80800	#2	95600
#3	2339600	#3	577600	#3	804200	#3	650000	#3	295400	#3	256300	#3	219700	#3	269000	#3	224900	#3	186500	#3	113800	#3	67000	#3	68900
#10	1936000	#10	349000	#10	403500	#10	260500	#10	114800	#10	100000	#10	165800	#10	152500	#10	164000	#10	79500	#10	70300	#8	53200	#6	51200`;

const rawServerData =
`Global		S449		S1028		S699		S468		S417		S915		S1141		S1111		S770		S551		S898		S626`

function splitData(data) {
  return data.split('\n').map((row) => row.split('\t'));
}

function parseNum(n) {
  const p = parseInt(n);
  if (Number.isNaN(p)) return null;
  return p;
}

function formatNumber(value) {
  let str = value.toFixed(0);
  if (str.length >= 5) {
    str = str.replace(/(\d)(?=(\d{3})+$)/g, '$1\u2009');
  }
  return str;
}

const compiledData = [];

const servers = rawServerData.split('\t\t');

const spPointData = splitData(rawSpPointData);

for (let serverIdx = 0; serverIdx < servers.length; serverIdx++) {
  const data = {
    server: servers[serverIdx],
    points: [
      {
        rank: parseNum(spPointData[0][serverIdx * 2].substring(1)),
        points: parseNum(spPointData[0][serverIdx * 2 + 1]),
      },
      {
        rank: parseNum(spPointData[1][serverIdx * 2].substring(1)),
        points: parseNum(spPointData[1][serverIdx * 2 + 1]),
      },
      {
        rank: parseNum(spPointData[2][serverIdx * 2].substring(1)),
        points: parseNum(spPointData[2][serverIdx * 2 + 1]),
      },
      {
        rank: parseNum(spPointData[3][serverIdx * 2].substring(1)),
        points: parseNum(spPointData[3][serverIdx * 2 + 1]),
      }
    ],
  };
  compiledData.push(data)
}

const exportedJSON = JSON.stringify(compiledData, null, '  ');
fs.writeFileSync('./_exported-sp.json', exportedJSON);

const spTableLines = [
  '<table class="sp-result-table">',
  '<thead>',
  '<tr>',
  '<th>Server</th>',
  '<th class="up-final-col">Special Event</th>',
  '',
  '</tr>',
  '</thead>',
  '<tbody>'
];

const serverCount = compiledData.length;

function getSpFinalPointHTML(rank, points) {
  const eventRankClass = ((rank > 0) && (rank <= 3))?('event-rank-' + rank):'event-rank';

  if (points === null) {
    return (
      '<td class="up-final-col">' + 
      `<span class="${eventRankClass}">${rank}</span>` +
      '<span class="final-pt">N/A</span>' +
      '</td>'
    )
  }

  const pointsDisplay = formatNumber(points);
  const barWidth = (16 * points / MaxSpFinalPoints).toFixed(1);

  let html =
    '<td class="sp-final-col">' + 
    `<span class="${eventRankClass}">${rank}</span>`;

  if (barWidth >= 7) {
    html += `<div class="final-pt-bar" style="width: ${barWidth}rem"><span class="final-pt">${pointsDisplay}</span></div>`;
  } else {
    html += `<div class="final-pt-bar" style="width: ${barWidth}rem">&nbsp;</div><span class="final-pt">${pointsDisplay}</span></td>`;
  }

  html += '</td>';
  return html;
}

for (let serverIdx = 0; serverIdx < serverCount; serverIdx++) {
  const serverData = compiledData[serverIdx];
  spTableLines.push('<tr class="new-section">');
  spTableLines.push(`<td rowspan="4" class="server-data">${serverData.server}`);
  spTableLines.push(getSpFinalPointHTML(serverData.points[0].rank, serverData.points[0].points));
  spTableLines.push('<td>&nbsp;</td>');
  spTableLines.push('</tr>');

  [1, 2, 3].forEach((rankIdx) => {
    spTableLines.push('<tr>');
    spTableLines.push(getSpFinalPointHTML(serverData.points[rankIdx].rank, serverData.points[rankIdx].points));
    spTableLines.push('<td>&nbsp;</td>');
    spTableLines.push('</tr>')
  })
}

spTableLines.push('</tbody>');
spTableLines.push('</table>');

fs.writeFileSync('./_sp-table.html', spTableLines.join('\n'));
