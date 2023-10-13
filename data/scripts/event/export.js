import fs from 'fs';

const MaxPhasePoints = (     600 * 1000 * 1000);
const MaxFinalPoints = (2 * 1000 * 1000 * 1000);

const dataServers =
`S1111	S417	S1028	S1041	S699	S449
S660	S1020	S666	S863	S459	S886`

const dataFinal =
`					
					
					
					`;

const dataPhase1 =
`473500000	464594500	446606000	353420500	236015500	227669000
405164500	446003000	349529500	281831500	227942500	110130000
300674000	271605500	254101000	268744000	220378000	83961500
195983000	263302000	230000000	194530500	123166500	74028500`;

const dataPhase2 =
`162662000	89609102	44624000	60473500	13789000	12679000
33123526	67150554	29481250	59268500	11203500	11719900
32494000	44569300	22323000	49628000	10503000	8460000
29355750	38172000	19862500	24800500	10072204	7839000`;

const dataPhase3 =
`132368640	93178960	74101160	77800950	69846440	92252060
99195560	80277440	58292640	55737800	58648280	37423820
41322400	51163040	57707160	52239040	23895300	27657160
36621940	39426000	46349100	49717000	23738220	18660080`;

const dataPhase4 =
`55680244	82648500	10534400	122242264	29135700	30062500
50681200	60715500	9552000	37572500	16629244	8245154
36382700	30101700	8504000	30826500	10625628	4515000
20055500	26624000	7022500	16152244	9253000	4073500`;

const dataPhase5 =
`					
					
					
					`;

const dataPhase6 =
`					
					
					
					`;

// Prepare data

function splitData(data) {
  return data .split('\n').map((row) => row.split('\t'));
}

const [servers, servers2] = splitData(dataServers);
// const finalPoints = splitData(dataFinal);

const finalPoints = splitData(dataFinal);

const phasePoints = [
  splitData(dataPhase1),
  splitData(dataPhase2),
  splitData(dataPhase3),
  splitData(dataPhase4),
  splitData(dataPhase5),
  splitData(dataPhase6),
];

const lines = [
 '<table class="result-table">',
 '<thead>',
 '<tr>',
 '<th></th>',
 '<th>Rank</th>',
];

servers.forEach((s, idx) => lines.push(`<th>${s} vs ${servers2[idx]}</th>`));

lines.push('</tr>');
lines.push('</thead>');
lines.push('<tbody>');

function writeFinalPoints(cells) {
  cells.forEach((cell) => {
    if (cell.length) {
      const points = parseInt(cell);
      const pointsDisplay = (points/(1000*1000)).toFixed(1) + 'M';
      const barWidth = (8 * points / MaxFinalPoints);
      if (barWidth > 4) {
        lines.push(`<td class="final-points"><div class="bar" style="width: ${barWidth.toFixed(1)}rem">${pointsDisplay}</div></td>`);
      } else {
        lines.push(`<td class="final-points"><div class="bar" style="width: ${barWidth.toFixed(1)}rem">&nbsp;</div>${pointsDisplay}</td>`);
      }
    } else {
      lines.push(`<td class="final-points">N/A</td>`);
    }
  });
}

function writePhasePoints(cells) {
  cells.forEach((cell) => {
    if (cell.length) {
      const points = parseInt(cell);
      const pointsDisplay = (points/(1000*1000)).toFixed(1) + 'M';
      const barWidth = (8 * points / MaxPhasePoints);
      if (barWidth > 4) {
        lines.push(`<td class="phase-points"><div class="bar" style="width: ${barWidth.toFixed(1)}rem">${pointsDisplay}</div></td>`);
      } else {
        lines.push(`<td class="phase-points"><div class="bar" style="width: ${barWidth.toFixed(1)}rem">&nbsp;</div>${pointsDisplay}</td>`);
      }
    } else {
      lines.push(`<td class="phase-points">N/A</td>`);
    }
  });
}

lines.push('<tr class="new-section">');
lines.push('<td rowspan="5">Final</th>');
lines.push('<td>#1</td>');
writeFinalPoints(finalPoints[0]);
lines.push('</tr>');

lines.push('<tr>');
lines.push('<td>#2</td>');
writeFinalPoints(finalPoints[1]);
lines.push('</tr>');

lines.push('<tr>');
lines.push('<td>#3</td>');
writeFinalPoints(finalPoints[2]);
lines.push('</tr>');

lines.push('<tr>')
lines.push('<td>&nbsp;</td>')
for (let i=0; i < servers.length; i++) lines.push('<td>⋮</td>');
lines.push('</tr>')

lines.push('<tr>')
lines.push('<td>#20</td>');
writeFinalPoints(finalPoints[3]);
lines.push('</tr>');

phasePoints.forEach((phaseData, phaseIdx) => {
  phaseData.forEach((rankedPoints, rankIdx) => {
    if (rankIdx === 0) {
      lines.push('<tr class="new-section">');
      lines.push(`<td rowspan="4">Phase ${phaseIdx+1}</th>`);
    } else {
      lines.push('<tr>')
    }

    lines.push(`<td>#${(rankIdx + 1)}</td>`);
    writePhasePoints(rankedPoints);
    lines.push('</tr>');
  })
  
});

lines.push('</tbody>');
lines.push('</table>');

fs.writeFileSync('./table.html', lines.join('\n'));
