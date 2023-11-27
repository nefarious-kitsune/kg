import fs from 'fs';

const MaxPhasePoints = (350 * 1000 * 1000);
const MaxFinalPoints = (600 * 1000 * 1000);
const MaxUPFinalPoints = (5 * 1000 * 1000 * 1000);

const hasUP = false;

const rawMKPointData =
`243944834	448122500	520419280	404105840	369253500	367298200	285515000	406798870	406729700	184238460	111606296
176717700	430330600	386466980	364043300	353862680	328571560	281357048	218009090	181510960	144563302	106671600
146721040	128851120	309596320	208148500	296977700	310627820	239984870	205835940	173463140	105760800	80380330
52347700	43389630	75094326	28289840	75094326	49202540	48638980	34942440	37504870	28568200	38277650
96294000	148517500	273775000	137302000	249437500	290958000	272242500	213042000	198830000	54794500	61583500
61313500	119424500	248469500	102585500	221967500	288392500	236036000	196415000	86390000	53790000	50768000
49163500	112507500	221287000	94296500	175015000	185565000	102343500	104123500	57720000	37842000	41270500
43331500	66429500	115950000	65375000	91063500	149135500	96196500	64516500	56619000	27324500	30014000
18450500	8757800	24642500			9333500	11997500	15425500			34754796
14158500	7544000	20452000			8250000	9859500	10851000			6854500
10281950	6688500	17239000			7333000	8235500	10273000			6381500
9044900	6558850	15122500			6968500	7389000	9027250			5996500
25977070		61909320	28494920	71790500	51491800	38116960	40001490	99040700	12863580	14926740
21965240		38205960	22330340	41717300	19541520	14113420	30385390	45578960	12721320	12195400
17571340		37359160	16645100	34964520	17548340	13697260	15379860	28837940	11235220	10981370
16571410		36118920	11102470	22282180	14123060	13669780	13138880	23804470	9864860	9200050
11465564		17227400		14604000	9928200	18676900	58896744	15076000		4937000
6346154		14805700		10449654	6428000	5093500	16882400	9296500		4002900
4174000		7187500		9404154	5170600	4953800	10994200	4974500		3760000
4030500		6303500		6961500	4465000	3714500	5316500	4203700		2632000
13648000	18928500	74845326	24999500	23327500	16290000	15837000	15253326	23050000	13874000	26328000
13369357	15798500	41273000	15590500	21101500	14525500	12668000	9645500	21518500	13261122	21016500
10433000	14372500	28409000	15377500	13752500	10839500	10774000	9608000	10434000	9086500	18724500
9775000	14000000	23157500	14535000	10588000	10323500	9616500	6702500	6990000	8231500	13100500
122240200	321023200	143738800	230167500	172320500	182662100	170293300	104444800	115674400	130582100	49897900
108985500	269830100	111120000	192305300	71797100	116052800	91137800	57978900	56195000	92942400	45700700
95164500	71944900	105035100	160256900	68733900	81745800	70146900	57667500	55547000	53946200	44594400
72406400	52937000	94549600	41787500	66726700	75610800	57929800	56199300	43097900	40139500	42455100`;

const rawUPPointData =
``;
/*
`2663289380	3115106494	801633280	919482230	719510770	3172246710	525999990	410785490	565988180
600659520	1019363070	797760200	784966060	584950080	488641110	503793500	387231960	529359996
520013810	1001071660	754614760	756560720	436681120	398693000	483777320	304061760	507267630
111877180	89029800	189101200	83016480	140154800	189436560	103745820	59751570	86023760`;
*/

const rawServerData =
`S468	S1032	S1129	S1041	S1111	S449	S417	S699	S770	S898	S626
S1091	S915	S1028	S461	S401	S1081	S865	S415	S424	S1159	S604`

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
fs.writeFileSync('./_exported.json', exportedJSON);

const mkTableLines = [
  '<table class="mk-result-table display-final" id="mk-result-table">',
  '<thead>',
  '<tr>',
  '<th>Server</th>',
  (hasUP?'<th class="up-final-col">Ultimate Power</th>':''),
  '<th class="mk-final-col">Mightiest Kingdom Final</th>',
  '<th class="mk-phase-1-col">1. Unit</th>',
  '<th class="mk-phase-2-col">2. Summon</th>',
  '<th class="mk-phase-3-col">3. Witch</th>',
  '<th class="mk-phase-4-col">4. Gear</th>',
  '<th class="mk-phase-5-col">5. Dragon</th>',
  '<th class="mk-phase-6-col">6. Heroes</th>',
  '',
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
      '<span class="final-pt">N/A</span>' +
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
    html += `<div class="final-pt-bar" style="width: ${barWidth}rem"><span class="final-pt">${pointsDisplay}</span></div>`;
  } else {
    html += `<div class="final-pt-bar" style="width: ${barWidth}rem">&nbsp;</div><span class="final-pt">${pointsDisplay}</span></td>`;
  }

  html += '</td>';
  return html;
}

function getMKPhasePointHTML(phase, rank, points) {
  if (points === null) {
    return (
      `<td class="mk-phase-${phase}-col">` + 
      `<span class="event-rank-${rank}">${rank}</span>` +
      '<span class="final-pt">N/A</span>' +
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
    html += `<div class="phase-pt-bar" style="width: ${barWidth}rem"><span class="phase-pt">${pointsDisplay}</span></div>`;
  } else {
    html += `<div class="phase-pt-bar" style="width: ${barWidth}rem">&nbsp;</div><span class="phase-pt">${pointsDisplay}</span></td>`;
  }

  html += '</td>';
  return html;
}

function getUPFinalPointHTML(rank, points) {
  if (points === null) {
    return (
      '<td class="up-final-col">' + 
      `<span class="event-rank-${rank}">${rank}</span>` +
      '<span class="final-pt">N/A</span>' +
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
    html += `<div class="final-pt-bar" style="width: ${barWidth}rem"><span class="final-pt">${pointsDisplay}</span></div>`;
  } else {
    html += `<div class="final-pt-bar" style="width: ${barWidth}rem">&nbsp;</div><span class="final-pt">${pointsDisplay}</span></td>`;
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
