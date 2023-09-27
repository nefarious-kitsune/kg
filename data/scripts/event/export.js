import fs from 'fs';

const data =
`					
					
					
					
146632500	53449500	50349500	60957500	150365000	161621500
115162000	45644500	31194000	59775500	116008500	80331000
79440500	44497500	26612500	51918000	92350500	72312500
68194000	44076000	26399000	50327000	80344000	60789500
15863000	7798000	4662000	13936500	9749500	8705000
15539000	7210500	4452000	10554950	8282500	5671500
22966805	6437500	3858850	10444350	7906000	4581600
10336000	4709000	3664500	8438050	7724500	4223500
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					
					`;

const table = data.split('\n').map((row) => row.split('\t'));

const lines = [];

table.forEach((row, index) => {
  const max = (index < 4)?(500 * 1000 * 1000):(250 * 1000 * 1000);

  const newSection = index % 4 === 0;

  if (newSection) {
    const phase = index / 4;
    lines.push('<tr class="new-section">');
    lines.push(`  <td rowspan="4">${phase==0?'Final':'Phase ' + phase}</th>`);
  } else {
    lines.push('<tr>');
  }

  lines.push(`  <td>#${(index === 3)?'20':(index % 4 + 1)}</td>`);

  row.forEach((cell) => {
    if (cell.length) {
      const n = parseInt(cell);
      const percent = Math.round(n * 100 / max);
      lines.push(`  <td class="${index<4?'final':'phase'}-points" style="background-size: ${percent}% 0.9rem;">${n.toLocaleString('en-US')}</td>`);
    } else {
      lines.push(`  <td>N/A</td>`);
    }
  });

  lines.push('</tr>');
})

fs.writeFileSync('./table.html', lines.join('\n'));
