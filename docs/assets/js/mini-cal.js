/* eslint-disable no-unused-vars */
/* eslint-env browser */


/** Burning Expedition calendar */
const BECalendar = {
  'event-1': [
    1, 2, 3, 4, 5, 6, 7,
    8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21,
  ],
  'event-2': [23, 24, 25, 26, 27], // Registration
};

/** Ultimate Hunting calendar */
const UHCalendar = {
  'event-1': [
    8, 9, 10, 11, 12, 13,
    22, 23, 24, 25, 26, 27,
  ],
};

/** ES-Battlefield calendar */
const ESBCalendar = {
  'event-0': [2, 4, 9, 11, 16, 18, 23, 25],
  'event-1': [3, 10, 17, 24],
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
    calDate.setTime(seasonStart.getTime() + (28 * 24 * 3600 * 1000));
  } else {
    calDate.setTime(seasonStart.getTime());
  }

  for (let day=1; day <= 28; day++) {
    const mm = calDate.getUTCMonth();
    const dd = calDate.getUTCDate();

    const dayCell = clone.querySelector(`.day-${day}`);
    const daySpan = dayCell.querySelector('span');

    if ((mm % 2) === 0) {
      dayCell.classList.add('mo2');
      if (day === 1) {
        const weekNum = clone.querySelector('.week-1 .week-num');
        if (weekNum) weekNum.classList.add('mo2');
      } else if (day === 8) {
        const weekNum = clone.querySelector('.week-2 .week-num');
        if (weekNum) weekNum.classList.add('mo2');
      } else if (day === 15) {
        const weekNum = clone.querySelector('.week-3 .week-num');
        if (weekNum) weekNum.classList.add('mo2');
      } else if (day === 22) {
        const weekNum = clone.querySelector('.week-4 .week-num');
        if (weekNum) weekNum.classList.add('mo2');
      }
    }

    if (dd === 1) {
      daySpan.innerText = MonthNames[mm];
    } else {
      daySpan.innerText = dd;
    }

    if (evtDays['event-0'] && evtDays['event-0'].includes(day)) {
      daySpan.classList.add('event-0');
    } else if (evtDays['event-1'] && evtDays['event-1'].includes(day)) {
      daySpan.classList.add('event-1');
    } else if (evtDays['event-2'] && evtDays['event-2'].includes(day)) {
      daySpan.classList.add('event-2');
    } else if (evtDays['event-3'] && evtDays['event-3'].includes(day)) {
      daySpan.classList.add('event-3');
    }

    if (calDate.getTime() === currentTS) {
      daySpan.classList.add('today');
    }

    calDate.setDate(calDate.getDate() + 1);
  }

  return clone;
}


/**
 * Generate a pre-season calendar
 * @param {string} templateId - Id of the HTML template
 * @param {EventDays} evtDays - Event days
 * @return {DocumentFragment}
 */
function makePreSeasonCal(templateId, evtDays) {
  const template = document.getElementById(templateId);
  const clone = template.content.cloneNode(true);

  for (let day=1; day <= 32; day++) {
    const dayCell = clone.querySelector(`[data-day="${day}"]`);
    const daySpan = dayCell.querySelector('span');

    if (evtDays['event-0'] && evtDays['event-0'].includes(day)) {
      daySpan.classList.add('event-0');
    } else if (evtDays['event-1'] && evtDays['event-1'].includes(day)) {
      daySpan.classList.add('event-1');
    } else if (evtDays['event-2'] && evtDays['event-2'].includes(day)) {
      daySpan.classList.add('event-2');
    } else if (evtDays['event-3'] && evtDays['event-3'].includes(day)) {
      daySpan.classList.add('event-3');
    }
  }

  return clone;
}
