import fs from 'fs';

const MaxPhasePoints = (1500 * 1000 * 1000);
const MaxFinalPoints = (2500 * 1000 * 1000);
const MaxUPFinalPoints = (5 * 1000 * 1000 * 1000);

const hasUP = true;

const rawMKPointData =
`1447997560	1983227282	688303560	1209937540	642344270	257322484	403362280	364624420	387420496
1246075610	1926745514	596316340	913109050	551324080	242793302	382249280	322432460	369633540
743513620	604451220	492243760	728672190	384067620	236404560	331413490	316428190	295319130
150954600	211852820	154478020	135829580	70110480	91656020	112046830	82386040	49372047
473500000	464594500	446606000	353420500	236015500	227669000	166629000	161293500	
405164500	446003000	349529500	281831500	227942500	110130000	139151500	129988000	
300674000	271605500	254101000	268744000	220378000	83961500	132299000	117262500	
195983000	263302000	230000000	194530500	123166500	74028500	127412000	111937500	
162662000	89609102	44624000	60473500	13789000	12679000	19246150	19249500	10925846
33123526	67150554	29481250	59268500	11203500	11719900	18085500	18670500	9998500
32494000	44569300	22323000	49628000	10503000	8460000	17062500	18498150	9126000
29355750	38172000	19862500	24800500	10072204	7839000	13049800	14754000	6155500
132368640	93178960	74101160	77800950	69846440	92252060	59895930	44881920	30030580
99195560	80277440	58292640	55737800	58648280	37423820	50395820	35378460	33502020
41322400	51163040	57707160	52239040	23895300	27657160	26551430	33229040	28442730
36621940	39426000	46349100	49717000	23738220	18660080	21676820	29051620	24981920
55680244	82648500	10534400	122242264	29135700	30062500	24895500	58138244	16910744
50681200	60715500	9552000	37572500	16629244	8245154	12054000	18645000	1482500
36382700	30101700	8504000	30826500	10625628	4515000	8403000	10529728	13343500
20055500	26624000	7022500	16152244	9253000	4073500	6776500	8270000	10040200
91017000	183569000	44624000	128355326	33368100	39319500	39550326	68634826	67209326
64781000	126469000	40865000	55113500	25664500	18279000	32160000	30027500	35195500
27127000	64754500	31908000	48938500	25147500	14640170	31223500	22554500	21251500
19665000	57056030	26651000	37803000	22124000	12599000	25343500	19317500	18337000
744400300	1123467500	237294200	657293500	311106100	126845900	97332100	195048100	161920100
460386200	1035604000	204917700	425578600	278959800	114426300	195767100	139053500	144993500
308183000	328387400	179920400	364344300	258217500	111076700	187447400	119210000	113054900
251184900	319353700	174421100	355671800	216250600	110126000	172450300	118645700	59329400`;

const rawUPPointData =
`2663289380	3115106494	801633280	919482230	719510770	3172246710	525999990	410785490	565988180
600659520	1019363070	797760200	784966060	584950080	488641110	503793500	387231960	529359996
520013810	1001071660	754614760	756560720	436681120	398693000	483777320	304061760	507267630
111877180	89029800	189101200	83016480	140154800	189436560	103745820	59751570	86023760`;

const rawServerData =
`S1111	S417	S1028	S1041	S699	S449	S915	S770	S468
S660	S1020	S666	S863	S459	S886	S410	S751	S643`

function splitData(data) {
  return data.split('\n').map((row) => row.split('\t'));
}

function parseNum(n) {
  const p = parseInt(n);
  if (Number.isNaN(p)) return null;
  return p;
}

const compiledData = [];

const [servers, servers2] = splitData(rawServerData);

const mkPointData = splitData(rawMKPointData);
const upPointData = splitData(rawUPPointData);

for (let serverIdx = 0; serverIdx < servers.length; serverIdx++) {
  const data = {
    server: servers[serverIdx],
    server2: servers2[serverIdx],
    mk: {
      final: {
        '1':  parseNum(mkPointData[0][serverIdx]),
        '2':  parseNum(mkPointData[1][serverIdx]),
        '3':  parseNum(mkPointData[2][serverIdx]),
        '20': parseNum(mkPointData[3][serverIdx]),
      },
      phase1: {
        '1':  parseNum(mkPointData[4][serverIdx]),
        '2':  parseNum(mkPointData[5][serverIdx]),
        '3':  parseNum(mkPointData[6][serverIdx]),
        '4':  parseNum(mkPointData[7][serverIdx]),
      },
      phase2: {
        '1':  parseNum(mkPointData[8][serverIdx]),
        '2':  parseNum(mkPointData[9][serverIdx]),
        '3':  parseNum(mkPointData[10][serverIdx]),
        '4':  parseNum(mkPointData[11][serverIdx]),
      },
      phase3: {
        '1':  parseNum(mkPointData[12][serverIdx]),
        '2':  parseNum(mkPointData[13][serverIdx]),
        '3':  parseNum(mkPointData[14][serverIdx]),
        '4':  parseNum(mkPointData[15][serverIdx]),
      },
      phase4: {
        '1':  parseNum(mkPointData[16][serverIdx]),
        '2':  parseNum(mkPointData[17][serverIdx]),
        '3':  parseNum(mkPointData[18][serverIdx]),
        '4':  parseNum(mkPointData[19][serverIdx]),
      },
      phase5: {
        '1':  parseNum(mkPointData[20][serverIdx]),
        '2':  parseNum(mkPointData[21][serverIdx]),
        '3':  parseNum(mkPointData[22][serverIdx]),
        '4':  parseNum(mkPointData[23][serverIdx]),
      },
      phase6: {
        '1':  parseNum(mkPointData[24][serverIdx]),
        '2':  parseNum(mkPointData[25][serverIdx]),
        '3':  parseNum(mkPointData[26][serverIdx]),
        '4':  parseNum(mkPointData[27][serverIdx]),
      }
    },
    
  };

  if (hasUP) {
    data.up = {
      '1':  parseNum(upPointData[0][serverIdx]),
      '2':  parseNum(upPointData[1][serverIdx]),
      '3':  parseNum(upPointData[2][serverIdx]),
      '20': parseNum(upPointData[3][serverIdx]),
    };
  }

  compiledData.push(data)
}

const exportedJSON = JSON.stringify(compiledData, null, '  ');
fs.writeFileSync('./exported.json', exportedJSON);

const mkTableLines = [
  '<table class="mk-result-table display-final" id="mk-result-table">',
  '<thead>',
  '<tr>',
  '<th>Server</th>',
  (hasUP?'<th class="up-final-col">Ultimate Power</th>':''),
  '<th class="mk-final-col">Mightiest Kingdom Final</th>',
  '<th class="mk-phase-1-col">1. Unit</th>',
  '<th class="mk-phase-2-col">2. Witch</th>',
  '<th class="mk-phase-3-col">3. Dragon</th>',
  '<th class="mk-phase-4-col">4. Summon</th>',
  '<th class="mk-phase-5-col">5. Gear</th>',
  '<th class="mk-phase-6-col">6. Heroes</th>',
  '<th>&nbsp;</th>',
  '</tr>',
  '</thead>',
  '<tbody>'
];

const serverCount = compiledData.length;

function getMKFinalPointHTML(rank, points) {
  if (points === null) {
    return (
      '<td class="mk-final-col">' + 
      `<span class="event-rank-${rank}">${rank}</span>` +
      '<span class="final-point">N/A</span>' +
      '</td>'
    )
  }

  let pointsDisplay;
  let barWidth;

  pointsDisplay = 
    (points > 10 * 1000 * 1000)?
    (points/(1000*1000)).toFixed(0) + 'M':
    (points/(1000*1000)).toFixed(1) + 'M';

  barWidth = (16 * points / MaxFinalPoints).toFixed(1);

  let html =
    '<td class="mk-final-col">' + 
    `<span class="event-rank-${rank}">${rank}</span>`;

  if (barWidth >= 8) {
    html += `<div class="final-point-bar" style="width: ${barWidth}rem"><span class="final-point">${pointsDisplay}</span></div>`;
  } else {
    html += `<div class="final-point-bar" style="width: ${barWidth}rem">&nbsp;</div><span class="final-point">${pointsDisplay}</span></td>`;
  }

  html += '</td>';
  return html;
}

function getMKPhasePointHTML(phase, rank, points) {
  if (points === null) {
    return (
      `<td class="mk-phase-${phase}-col">` + 
      `<span class="event-rank-${rank}">${rank}</span>` +
      '<span class="final-point">N/A</span>' +
      '</td>'
    )
  }

  let pointsDisplay;
  let barWidth;

  pointsDisplay = 
    (points > 10 * 1000 * 1000)?
    (points/(1000*1000)).toFixed(0) + 'M':
    (points/(1000*1000)).toFixed(1) + 'M';

  barWidth = (6 * points / MaxPhasePoints).toFixed(1);

  let html =
    `<td class="mk-phase-${phase}-col">` + 
    `<span class="event-rank-${rank}">${rank}</span>`;

  if (barWidth >= 3) {
    html += `<div class="phase-point-bar" style="width: ${barWidth}rem"><span class="phase-point">${pointsDisplay}</span></div>`;
  } else {
    html += `<div class="phase-point-bar" style="width: ${barWidth}rem">&nbsp;</div><span class="phase-point">${pointsDisplay}</span></td>`;
  }

  html += '</td>';
  return html;
}

function getUPFinalPointHTML(rank, points) {
  if (points === null) {
    return (
      '<td class="up-final-col">' + 
      `<span class="event-rank-${rank}">${rank}</span>` +
      '<span class="final-point">N/A</span>' +
      '</td>'
    )
  }

  let pointsDisplay;
  let barWidth;

  pointsDisplay =
    (points > 10 * 1000 * 1000)?
    (points/(1000*1000)).toFixed(0) + 'M':
    (points/(1000*1000)).toFixed(1) + 'M';

  barWidth = (16 * points / MaxUPFinalPoints).toFixed(1);

  let html =
    '<td class="up-final-col">' + 
    `<span class="event-rank-${rank}">${rank}</span>`;

  if (barWidth >= 8) {
    html += `<div class="final-point-bar" style="width: ${barWidth}rem"><span class="final-point">${pointsDisplay}</span></div>`;
  } else {
    html += `<div class="final-point-bar" style="width: ${barWidth}rem">&nbsp;</div><span class="final-point">${pointsDisplay}</span></td>`;
  }

  html += '</td>';
  return html;
}

for (let serverIdx = 0; serverIdx < serverCount; serverIdx++) {
  const serverData = compiledData[serverIdx];
  mkTableLines.push('<tr class="new-section">');
  mkTableLines.push(`<td rowspan="4" class="server-data">${serverData.server}<span class="vs-server"> vs ${serverData.server2}</span>`);

  if (hasUP) mkTableLines.push(getUPFinalPointHTML(1, serverData.up['1']) );

  mkTableLines.push(getMKFinalPointHTML(   1, serverData.mk.final['1']) );
  mkTableLines.push(getMKPhasePointHTML(1, 1, serverData.mk.phase1['1']) );
  mkTableLines.push(getMKPhasePointHTML(2, 1, serverData.mk.phase2['1']) );
  mkTableLines.push(getMKPhasePointHTML(3, 1, serverData.mk.phase3['1']) );
  mkTableLines.push(getMKPhasePointHTML(4, 1, serverData.mk.phase4['1']) );
  mkTableLines.push(getMKPhasePointHTML(5, 1, serverData.mk.phase5['1']) );
  mkTableLines.push(getMKPhasePointHTML(6, 1, serverData.mk.phase6['1']) );
  mkTableLines.push('<td>&nbsp;</td>');
  mkTableLines.push('</tr>');

  
  ['2', '3', '4'].forEach((rank) => {
    const fRank = rank === '4'?'20':rank;
    mkTableLines.push('<tr>');

    if (hasUP) mkTableLines.push(getUPFinalPointHTML(fRank, serverData.up[fRank]) );

    mkTableLines.push(getMKFinalPointHTML(   fRank, serverData.mk.final[fRank]) );

    mkTableLines.push(getMKPhasePointHTML(1, rank, serverData.mk.phase1[rank]) );
    mkTableLines.push(getMKPhasePointHTML(2, rank, serverData.mk.phase2[rank]) );
    mkTableLines.push(getMKPhasePointHTML(3, rank, serverData.mk.phase3[rank]) );
    mkTableLines.push(getMKPhasePointHTML(4, rank, serverData.mk.phase4[rank]) );
    mkTableLines.push(getMKPhasePointHTML(5, rank, serverData.mk.phase5[rank]) );
    mkTableLines.push(getMKPhasePointHTML(6, rank, serverData.mk.phase6[rank]) );
    mkTableLines.push('<td>&nbsp;</td>');
    mkTableLines.push('</tr>')
  })
}

mkTableLines.push('</tbody>');
mkTableLines.push('</table>');

fs.writeFileSync('./_mk-table.html', mkTableLines.join('\n'));
