import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import {writeFileSync} from 'fs';

const ModulePath = dirname(fileURLToPath(import.meta.url));
const ProjectPath = resolve(ModulePath, '../../');

const normalSpeed = 19;
const eliteSpeed = 11;
const bossSpeed = 5;

// let tableBody = [];

/**
 * Calculate arrival times of evil spirits
 * @param {number} distance - distance in KM
 * @return {object[]}
 */
function calculateArrivals(distance) {
  const arrivals = [];

  for (let wave = 1; wave <= 20; wave ++) {
    let esSpeed;
    let esClass;
    let es;
    if ((wave === 7) || (wave === 14) || (wave === 17)) {
      esSpeed = eliteSpeed;
      esClass = 'elite-spirit';
      es = `Lv. ${wave} Elite`;
    } else if ((wave === 10) || (wave === 20)) {
      esSpeed = bossSpeed;
      esClass = 'boss-spirit';
      es = `Lv. ${wave} Boss`;
    } else {
      esSpeed = normalSpeed;
      esClass = 'normal-spirit';
      es = `Lv. ${wave} Normal`;
    }
    const departureTime = (wave - 1) * 2;
    const marchingTime = Math.round(distance / esSpeed);
    const arrivalTime = departureTime + marchingTime;
    arrivals.push({
      spiritName: es,
      spiritClass: esClass,
      arrival: arrivalTime,
    });
  }
  return arrivals.sort((a, b) => b.arrival - a.arrival);
}

/**
 * Build arrival time table and save it to a file
 * @param {number} distance - distance in KM
 */
function buildTemplate(distance) {
  const arrivals = calculateArrivals(distance);

  // const buildRow = (rowData) => {
  //   const lines = [];
  //   lines.push(`<tr class="${rowData.spiritClass}">`);

  //   let arrivalText = `${rowData.arrival} min`;
  //   if (rowData.arrival > 60) {
  //     const hr = Math.floor(rowData.arrival / 60);
  //     const min = rowData.arrival - (hr * 60);
  //     arrivalText =
  //       `<span text-hint="${hr}h ${min}min">` + arrivalText + '</span>';
  //   };

  //   lines.push(`  <td>${arrivalText}</td>`);
  //   lines.push(`  <td>${rowData.spiritName}</td>`);
  //   lines.push('</tr>');
  //   return lines.join('\n');
  // };

  // const tableBody = [];
  // tableBody.push(buildRow(arrivals[19]));
  // tableBody.push(`<tr><td>&vellip;</td><td>&vellip;</td></tr>`);
  // tableBody.push(buildRow(arrivals[6]));
  // tableBody.push(buildRow(arrivals[5]));
  // tableBody.push(buildRow(arrivals[4]));
  // tableBody.push(buildRow(arrivals[3]));
  // tableBody.push(buildRow(arrivals[2]));
  // tableBody.push(buildRow(arrivals[1]));
  // tableBody.push(buildRow(arrivals[0]));

  // Build <th> element
  const buildTH = (data) => {
    let text = `${data.arrival} min`;
    if (data.arrival > 60) {
      const hr = Math.floor(data.arrival / 60);
      const min = data.arrival - (hr * 60);
      text = `<span text-hint="${hr}h ${min}min">` + text + '</span>';
    };
    return `<th class="${data.spiritClass}">` + text + '</th>';
  };

  // Build <td> element
  const buildTD = (data) => {
    const text = data.spiritName;
    return `<td class="${data.spiritClass}">` + text + '</td>';
  };

  const table = [];
  table.push('<thead><tr>');
  table.push('  ' + buildTH(arrivals[19]));
  table.push('  ' + `<th>&hellip;</th>`);
  // table.push('  ' + buildTH(arrivals[6]));
  table.push('  ' + buildTH(arrivals[5]));
  table.push('  ' + buildTH(arrivals[4]));
  table.push('  ' + buildTH(arrivals[3]));
  table.push('  ' + buildTH(arrivals[2]));
  table.push('  ' + buildTH(arrivals[1]));
  table.push('  ' + buildTH(arrivals[0]));
  table.push('</tr></thead>');
  table.push('<body><tr>');
  table.push('  ' + buildTD(arrivals[19]));
  table.push('  ' + `<td>&hellip;</td>`);
  // table.push('  ' + buildTD(arrivals[6]));
  table.push('  ' + buildTD(arrivals[5]));
  table.push('  ' + buildTD(arrivals[4]));
  table.push('  ' + buildTD(arrivals[3]));
  table.push('  ' + buildTD(arrivals[2]));
  table.push('  ' + buildTD(arrivals[1]));
  table.push('  ' + buildTD(arrivals[0]));
  table.push('</tr></tbody>');

  writeFileSync(
      resolve(ProjectPath, './source/esi/__templates/--' + distance + '.html'),
      table.join('\n'),
  );
}

buildTemplate(70);
buildTemplate(100);

buildTemplate(300);
buildTemplate(400);

buildTemplate(700);
buildTemplate(800);
