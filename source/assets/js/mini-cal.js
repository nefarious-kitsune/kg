/* eslint-disable no-unused-vars */
/* eslint-env browser */

const MonthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Generate a season calendar
 * @param {string} templateId - Id of the HTML template
 * @param {number[]} startDays - Days to mark as 'event start'
 * @param {number[]} eventDays - Days to mark as 'event day'
 * @param {number[]} endDays - Days to mark as 'event end'
 * @param {number[]} throneDay - Days to mark as 'throne day'
 */
function makeSeasonCal(templateId, startDays, eventDays, endDays, throneDay) {
  // 2024-10-7 ~ 2024-11-3
  const seasonStart = new Date(Date.UTC(2024, 10-1, 7, 0, 0, 0));
  const seasonEnd = new Date(Date.UTC(2024, 11-1, 3, 23, 59, 59));
  // 2024-11-4 ~ 2024-12-1
  // const seasonStart = new Date(Date.UTC(2024, 11-1, 4, 0, 0, 0));
  // const seasonEnd = new Date(Date.UTC(2024, 12-1, 1, 23, 59, 59));
  const currentTime = new Date();

  while (true) {
    if (currentTime > seasonEnd) {
      seasonStart.setDate(seasonStart.getDate() + 28);
      seasonEnd.setDate(seasonEnd.getDate() + 28);
    } else {
      console.log(seasonStart);
      break;
    }
  }

  const startMonth = seasonStart.getUTCMonth();
  const endMonth = seasonEnd.getUTCMonth();
  let month2 = startMonth + 1;
  if (startMonth !== endMonth) {
    if (seasonStart.getUTCDate() > 15) month2 = startMonth;
  }

  const template = document.getElementById(templateId);
  // const clone = template.content.cloneNode(true);
  const clone = template;

  const calDate = seasonStart;
  for (let day=1; day <= 28; day++) {
    const mm = calDate.getUTCMonth();
    const dd = calDate.getUTCDate();

    const dayCell = clone.querySelector(`.day-${day}`);
    const daySpan = dayCell.querySelector('span');
    if (mm === month2) dayCell.classList.add('mo2');

    if (dd === 1) {
      daySpan.innerText = MonthNames[mm];
    } else {
      daySpan.innerText = dd;
    }

    if (startDays.includes(day)) daySpan.classList.add('event-start');
    else if (eventDays.includes(day)) daySpan.classList.add('event-day');
    else if (endDays.includes(day)) daySpan.classList.add('event-end');
    else if (throneDay === day) daySpan.classList.add('throne-day');
    calDate.setDate(calDate.getDate() + 1);
  }
}
