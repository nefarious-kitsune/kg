/* eslint-disable no-unused-vars */
/* eslint-env browser */

const BLDays = {
  startDays: [23, 24, 25, 26, 27],
  eventDays: [
    1, 2, 3, 4, 5, 6, 7,
    8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20,
  ],
  endDays: [],
  throneDay: 21,
};

/**
 * @typedef {Object} EventDays
 * @property {number[]} startDays - Days to mark as 'event start'
 * @property {number[]} eventDays - Days to mark as 'event day'
 * @property {number[]} endDays - Days to mark as 'event end'
 * @property {number} throneDay - Day to mark as 'throne day'
 */

const MonthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// 2024-11-4 ~ 2024-12-1
const seasonStart = new Date(Date.UTC(2024, 11-1, 4, 0, 0, 0));
const seasonEnd = new Date(Date.UTC(2024, 12-1, 1, 23, 59, 59));
const currentTime = new Date();
currentTime.setUTCHours(0, 0, 0, 0);
const currentTS = currentTime.getTime();
let seasonEndTS = seasonEnd.getTime();

while (true) {
  if (currentTS > seasonEndTS) {
    seasonStart.setDate(seasonStart.getDate() + 28);
    seasonEnd.setDate(seasonEnd.getDate() + 28);
    seasonEndTS = seasonEnd.getTime();
  } else {
    break;
  }
}

/**
 * Generate a season calendar
 * @param {string} templateId - Id of the HTML template
 * @param {number[]|string} calStartDate - Start day of the calendar
 * @param {EventDays} evtDays - Event days
 * @param {number[]} startDays - Days to mark as 'event start'
 * @param {number[]} eventDays - Days to mark as 'event day'
 * @param {number[]} endDays - Days to mark as 'event end'
 * @param {number[]} throneDay - Days to mark as 'throne day'
 * @return {DocumentFragment}
 */
function makeSeasonCal(templateId, calStartDate, evtDays) {
  const template = document.getElementById(templateId);
  const clone = template.content.cloneNode(true);

  const calDate = new Date(Date.UTC(2024, 10, 4, 0, 0, 0));
  if (Array.isArray(calStartDate)) {
    calDate.setUTCFullYear(calStartDate[0]);
    calDate.setUTCMonth(calStartDate[1]-1);
    calDate.setUTCDate(calStartDate[2]);
  } else if (calStartDate === 'next-season') {
    calDate.setDate(seasonStart.getDate() + 28);
  } else {
    calDate.setDate(seasonStart.getDate());
  }

  for (let day=1; day <= 28; day++) {
    const mm = calDate.getUTCMonth();
    const dd = calDate.getUTCDate();

    const dayCell = clone.querySelector(`.day-${day}`);
    const daySpan = dayCell.querySelector('span');
    if ((mm % 2) === 0) dayCell.classList.add('mo2');

    if (dd === 1) {
      daySpan.innerText = MonthNames[mm];
    } else {
      daySpan.innerText = dd;
    }

    if (evtDays.startDays.includes(day)) {
      daySpan.classList.add('event-start');
    } else if (evtDays.eventDays.includes(day)) {
      daySpan.classList.add('event-day');
    } else if (evtDays.endDays.includes(day)) {
      daySpan.classList.add('event-end');
    } else if (evtDays.throneDay === day) {
      daySpan.classList.add('throne-day');
    }

    if (calDate.getTime() === currentTS) {
      daySpan.classList.add('today');
    }

    calDate.setDate(calDate.getDate() + 1);
  }

  return clone;
}
