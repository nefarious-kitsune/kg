import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import { buildBase } from '../../base/build.js';
import {
  parseUTCDateString,
  getUTCDate,
} from '../../utils/date-utils.js'

const ModulePath = dirname(fileURLToPath(import.meta.url));

const StartOfCalendar = getUTCDate(2023, 6, 12); // Monday
let EndOfCalendar = new Date(StartOfCalendar);

const OneDay = 24 * 60 * 60 * 1000;

function readTsvFile(fName) {
  return readFileSync(resolve(ModulePath, fName), 'utf-8')
    .replaceAll('\r','')
    .split('\n');
}

const events = [];
readTsvFile('./data/events.tsv').forEach((row) => {
  const [
    startDateString,
    endDateString,
    title
  ] = row.split('\t');
  const startDate = parseUTCDateString(startDateString);
  const endDate = parseUTCDateString(endDateString);
  const duration = 1 + (endDate.valueOf() - startDate.valueOf()) / OneDay;

  if (endDate.valueOf() > EndOfCalendar.valueOf()) EndOfCalendar = endDate;

  events.push({
    start: startDate,
    end: endDate,
    duration: duration,
    title: title,
  });
});

const calendarGrid = [];
let StartOfWeek = new Date(StartOfCalendar);

while (StartOfWeek.valueOf() < EndOfCalendar.valueOf()) {
  const currentDate = new Date(StartOfWeek);
  const calenderRow =  {
    month: currentDate.getUTCMonth() + 1,
    year: currentDate.getUTCFullYear(),
    days: [],
    mainEventIdx: -1, // event index of the main event
  };

  const eventsThisWeek = [];

  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    const D = currentDate.getUTCDate();
    const M = currentDate.getUTCMonth() + 1;

    const calendarDay = {
      month: M,
      day: D,
      eventIdx: [],
    };

    events.forEach((evt, eventIdx) => {
      if ((currentDate.valueOf() >= evt.start.valueOf()) && (currentDate.valueOf() <= evt.end.valueOf())) {
        calendarDay.eventIdx.push(eventIdx);
        const evt = eventsThisWeek.find((evt) => evt.eventIdx = eventIdx);
        if (evt !== undefined) evt.count ++;
        else eventsThisWeek.push({eventIdx: eventIdx, count: 1});
      }
    });

    calenderRow.days.push(calendarDay);

    currentDate.setDate(currentDate.getDate() + 1);
  } // for (dayOfWeek)

  if (eventsThisWeek.length > 0) {
    eventsThisWeek.sort((a,b) => a.count < b.count);
    calenderRow.mainEventIdx = eventsThisWeek[0].eventIdx;
  }
  
  calendarGrid.push(calenderRow);
  StartOfWeek = currentDate;
} // while

const TableBody = [];
let previousRow;

const monthNames = [
  'Jan', 'Feb', 'Mar',
  'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep',
  'Oct', 'Nov', 'Dec',
];

calendarGrid.forEach((thisWeek, rowIdx) => {
  TableBody.push('<tr>');

  // Month cell
  if ((rowIdx === 0) || (thisWeek.month !== previousRow.month)) {
    const lastRowIdx = calendarGrid.findLastIndex((lastRow) => lastRow.month === thisWeek.month);
    TableBody.push(
      '<th' +
      ` class="month-col ${(thisWeek.month % 2 === 0)?'even':'odd'}-month"` +
      ` rowspan="${lastRowIdx - rowIdx + 1}">`+
      monthNames[thisWeek.month-1].toUpperCase() + ' ' + thisWeek.year +
      '</th>'
    )
  }

  // Day cells
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    const thisDay = thisWeek.days[dayOfWeek];

    let marker = '';
    thisDay.eventIdx.forEach((eventIdx) => {
      const duration = events[eventIdx].duration;
      if (duration >= 9) {
        marker += '<span class="marker3">★</span>';
      } else if (duration > 5) {
        marker += '<span class="marker2">●</span>'; // was ✱ before
      } else {
        marker += '<span class="marker1">●</span>';
      }
    });

    TableBody.push(
      `<td class="date-col ${(thisDay.month % 2 === 0)?'even':'odd'}-month">` +
      `<div class="date">${thisDay.day}</div>` + 
      `<div class="marker-container">${marker}</div>` +
      '</td>'
    );
  } // for (dayOfWeek)

  // Detail cell
  if ((rowIdx === 0) || (thisWeek.mainEventIdx !== previousRow.mainEventIdx)) {
    if (thisWeek.mainEventIdx === -1) {
      TableBody.push('<td class="detail-col"></td>')
    } else {
      const lastRowIdx = calendarGrid.findLastIndex(
        (lastRow) => lastRow.mainEventIdx === thisWeek.mainEventIdx
      );
      let marker;
      const mainEvent = events[thisWeek.mainEventIdx];
      const duration = mainEvent.duration;
      if (duration >= 9) {
        marker = '<span class="marker3">★</span>';
      } else if (duration > 5) {
        marker = '<span class="marker2">●</span>';
      } else {
        marker = '<span class="marker1">●</span>';
      }
      
      TableBody.push(
        `<td class="detail-col" rowspan="${lastRowIdx - rowIdx + 1}">` +
        marker + ' ' + mainEvent.title + '</td>'
      );
    }
  }

  TableBody.push('</tr>');
  previousRow = thisWeek;
});

// const dayOfWeek = [
//   {title: 'Saturday', abbr: 'S'},
//   {title: 'Sunday', abbr: 'S'},
//   {title: 'Monday', abbr: 'M'},
//   {title: 'Tuesday', abbr: 'Tu'},
//   {title: 'Wednesday', abbr: 'W'},
//   {title: 'Thursday', abbr: 'Th'},
//   {title: 'Friday', abbr: 'F'},
// ];

const contentTemplate = readFileSync(
  resolve(ModulePath, './templates/event-cal.html'),
  'utf-8',
);

const content = contentTemplate
  .replace('{{TABLE BODY}}', TableBody.join('\n'))
  ;

const outputOptions = {
  type: 'page',
  path: {
    base: `/events/event-cal`,
    icon: '/images/logo_mini.png',
  },
  css: {
    links: [
      '/css/common.css',
      '/events/event-data.css',
    ],
  },
  breadcrumb: [
    {path: '/content', title: 'Home'},
    {path: '/events/', title: 'Events'},
  ],
  content: content,
  shortTitle: 'Event Calendar',
  title: `Event Calendar`,
  description: `Calender of special events`,
};

const output = buildBase(outputOptions);

writeFileSync(
  resolve(ModulePath, '../../../docs/events/event-cal.html'),
  output,
)
