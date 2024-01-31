import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { buildBase } from '../../base/build.js';
const ModulePath = dirname(fileURLToPath(import.meta.url));

const Year = 2023;
const Quarter = 4;

const DisplayStartDate = [2023, 9, 4];
const OneDay = 24 * 60 * 60 * 1000;

function parseDate(str) {
  const yyyy = parseInt(str.substring(0, 4));
  const mm = parseInt(str.substring(5, 7));
  const dd = parseInt(str.substring(8, 10));
  return new Date(Date.UTC(yyyy, mm-1, dd, 0, 0, 0));
}

function readTsvFile(fName) {
  return readFileSync(resolve(ModulePath, fName), 'utf-8')
    .replaceAll('\r','')
    .split('\n');
}

const events = [];
readTsvFile('./data/events.tsv').forEach((row) => {
  let [start, end, title] = row.split('\t');
  start = parseDate(start);
  end = parseDate(end);
  const duration = 1 + (end.valueOf() - start.valueOf()) / OneDay;
  let eventType = 2;
  if (duration >= 9) eventType = 3;
  else if (duration <= 5) eventType = 1;
  events.push({
    start: start,
    end: end,
    type: eventType,
    title: title,
  });
})

const currentDate = new Date(Date.UTC(
  DisplayStartDate[0],
  DisplayStartDate[1]-1,
  DisplayStartDate[2],
  0,
  0,
  0)
);

const MonthColumn = [
  { title:'Sep', rowSpan:4, evenMonth: false},
  null,
  null,
  null,
  { title:'Oct', rowSpan:5, evenMonth: true},
  null,
  null,
  null,
  null,
  { title:'Nov', rowSpan:4, evenMonth: false},
  null,
  null,
  null,
  { title:'Dec', rowSpan:4, evenMonth: true},
  null,
  null,
  null,
  { title:'Jan', rowSpan:5, evenMonth: false},
  null,
  null,
  null,
  null,
  { title:'Feb', rowSpan:4, evenMonth: true},
  null,
  null,
  null,
  { title:'Mar', rowSpan:2, evenMonth: false},
]

const TableBody = [];

MonthColumn.forEach((firstCol) => {
  TableBody.push('<tr>')
  if (firstCol !== null) {
    TableBody.push(
      '<th' +
      ` class="month-col"` +
      // ` class="month-col${firstCol.evenMonth?' even-month':''}"` +
      ` rowspan="${firstCol.rowSpan}">`+
      firstCol.title + `</th>`
    )
  }

  let mainEventTitle = '';
  let mainEventType = null;

  for (let day = 1; day < 7+1; day++) {
    const D = currentDate.getDate();
    const M = currentDate.getMonth();
    let evenMonthClass = '';
    if (M % 2 === 1) evenMonthClass = ' even-month';

    let marker = '';
    events.forEach((evt) => {
      if ((currentDate >= evt.start) && (currentDate <= evt.end)) {
        switch (evt.type) {
          case 3: marker += '<span class="marker3">★</span>'; break;
          case 2: marker += '<span class="marker2">✱</span>'; break;
          default: marker += '<span class="marker1">●</span>';
        }
        if (currentDate.valueOf() === evt.start.valueOf()) {
          mainEventTitle = evt.title;
          mainEventType = evt.type;
        }
      }
    })
    TableBody.push(
      `<td class="date-col${evenMonthClass}">` +
      `<div class="date">${D}</div>` + 
      `<div class="marker-container">${marker}</div>` +
      '</td>'
      )
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (mainEventType !== null) {
    let marker = '';
    switch (mainEventType) {
      case 3: marker += '<span class="marker3">★</span>'; break;
      case 2: marker += '<span class="marker2">✱</span>'; break;
      default: marker += '<span class="marker1">●</span>';
    }
    TableBody.push(
      '<td class="detail-col">' +
      marker + mainEventTitle +
      '</td>'
    );
  } else {
    TableBody.push('<td class="detail-col"></td>');
  }

  TableBody.push('</tr>')
})

const Template = readFileSync(resolve(ModulePath, './templates/event-cal.html'), 'utf-8');

writeFileSync(
  resolve(ModulePath, '../../../docs/events/event-cal.html'),
  Template.replace('{{TABLE BODY}}', TableBody.join('\n')),
)




