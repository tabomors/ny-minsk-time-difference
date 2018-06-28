/*
 * --- Constants ---
*/

const DATE_FORMAT = 'DD MMM HH:mm:ss';
const TIME_FORMAT = 'HH:mm';
// FIXME: API_KEY should pass via webpack or something similar
const API_KEY = 'FKLI2EI7MK83';
const OFFSET_API = `https://api.timezonedb.com/v2/convert-time-zone?key=${API_KEY}&format=json&from=Europe/Minsk&to=America/New_York`;
const MINSK_TIME_API = `https://api.timezonedb.com/v2/get-time-zone?key=${API_KEY}&format=json&by=zone&zone=Europe/Minsk`;
const IS_TIME_FORMAT = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
/*
 * --- State ---
*/

let minskTime;
let nyTime;
let minskNyOffsetH;

/*
 * --- DOM nodes ---
*/

const nyInput = document.getElementById('nyInput');
const minskInput = document.getElementById('minskInput');

const nyCurrentTimeNode = document.getElementById('nyCurrentTimeNode');
const minskCurrentTimeNode = document.getElementById('minskCurrentTimeNode');

/*
 * --- Events handling ---
*/

nyInput.addEventListener('change', (e) => {
  const val = e.target.value;
  if (isTimeValid(val)) {
    const time = getTimeWithOffset(val, Math.abs(minskNyOffsetH));
    setTimeToDom(time, minskInput);
  }
});

minskInput.addEventListener('change', (e) => {
  const val = e.target.value;
  if (isTimeValid(val)) {
    const time = getTimeWithOffset(val, minskNyOffsetH);
    setTimeToDom(time, nyInput);
  }
});

/*
 * --- work with API ---
*/

// TODO: Add possibility to have these values offline?
fetch(OFFSET_API)
  .then(response => response.json(), 
        _ => ({ offset: -25200 }))
  .then(({offset}) => {
    minskNyOffsetH = offset / 3600;

    return fetch(MINSK_TIME_API)
      .then(response => response.json())
      .then(data => {
        minskTime = dayjs(data.formatted);
        nyTime = minskTime.add(minskNyOffsetH, 'hour');

        let timerId = setTimeout(function tick() {
          minskTime = minskTime.add(1, 'second');
          minskCurrentTimeNode.innerHTML = minskTime.format(DATE_FORMAT); 
          nyTime = nyTime.add(1, 'second');
          nyCurrentTimeNode.innerHTML = nyTime.format(DATE_FORMAT);
          timerId = setTimeout(tick, 1000);
        }, 1000);
      });
  });

  /*
  * --- Helpers ---
  */

  function isTimeValid(timeVal) {
    return timeVal && IS_TIME_FORMAT.test(timeVal);
  }

  function getTimeWithOffset(timeVal, offset) {
    const [h, m] = timeVal.split(':');
    const time = dayjs().set('hour', h).set('minutes', m);
    const timeWithOffset = time.add(offset, 'hour').format(TIME_FORMAT);
    return timeWithOffset;
  }

  function setTimeToDom(timeValue, timeNode) {
    timeNode.value = timeValue;
  }