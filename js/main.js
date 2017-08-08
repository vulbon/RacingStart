const lights = Array.prototype.slice.call(document.querySelectorAll('.light-strip'));
const time = document.querySelector('.time');
const best = document.querySelector('.best span');
const jumpStart = document.querySelector('.jumpStart span');
const average = document.querySelector('.average span');
const historyTimeList = document.querySelector('.history ol');
let bestTime = Number(localStorage.getItem('best')) || Infinity;
let timeList = [];
let jumpStartCount = 0;
let clickCount = 0;
let started = false;
let lightsOutTime = 0;
let raf;
let timeout;


function formatTime(time) {
  time = Math.round(time);
  let outputTime = time / 1000;
  if (time < 10000) {
    outputTime = '0' + outputTime;
  }
  while (outputTime.length < 6) {
    outputTime += '0';
  }
  return outputTime;
}

if (bestTime != Infinity) {
  best.textContent = formatTime(bestTime);
}

function start() {
  for (const light of lights) {
    light.classList.remove('on');
  }

  time.textContent = '00.000';
  time.classList.remove('anim');

  lightsOutTime = 0;
  let lightsOn = 0;
  const lightsStart = performance.now();

  function frame(now) {
    const toLight = Math.floor((now - lightsStart) / 1000) + 1;

    if (toLight > lightsOn) {
      for (const light of lights.slice(0, toLight)) {
        light.classList.add('on');
      }
    }

    if (toLight < 5) {
      raf = requestAnimationFrame(frame);
    }
    else {
      const delay = Math.random() * 4000 + 1000;
      timeout = setTimeout(() => {
        for (const light of lights) {
          light.classList.remove('on');
        }
        lightsOutTime = performance.now();
      }, delay);
    }
  }

  raf = requestAnimationFrame(frame);
}

function end(timeStamp) {
  cancelAnimationFrame(raf);
  clearTimeout(timeout);

  if (!lightsOutTime) {
    time.textContent = "Jump start!";
    time.classList.add('anim');
    jumpStartCount++;
  }
  else {
    const thisTime = timeStamp - lightsOutTime;
    time.textContent = formatTime(thisTime);

    if (thisTime < bestTime) {
      bestTime = thisTime;
      best.textContent = time.textContent;
      localStorage.setItem('best', thisTime);
    }

    timeList.push(parseFloat(thisTime));
    let li = document.createElement("li");
    li.textContent = formatTime(thisTime);
    historyTimeList.appendChild(li);

    average.textContent = formatTime(getAverage(timeList));

    time.classList.add('anim');
  }
  clickCount++;
  jumpStart.textContent = jumpStartCount + "/" + clickCount + " Ratio:" + parseFloat(jumpStartCount / clickCount).toFixed(2);
}

function tap(event) {
  if (!started && event.target && event.target.closest && event.target.closest('a')) return;
  event.preventDefault();

  let timeStamp = performance.now();

  if (started) {
    end(timeStamp);
    started = false;
  }
  else {
    start();
    started = true;
  }
}

function getAverage(a) {
  let sum = 0;
  for (let i = 0, ii = a.length; i < ii; i++) {
    sum += a[i];
  }
  return sum / a.length;
}

addEventListener('touchstart', tap, { passive: false });
addEventListener('mousedown', tap, { passive: false });
addEventListener('keydown', event => {
  if (event.key == ' ') tap(event);
}, { passive: false });