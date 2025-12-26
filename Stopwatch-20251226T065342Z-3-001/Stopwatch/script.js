const display = document.getElementById('display');
const startStopBtn = document.getElementById('startStop');
const resetBtn = document.getElementById('reset');
const lapBtn = document.getElementById('lap');
const lapsList = document.getElementById('laps');
const themeToggle = document.getElementById('themeToggle');

let startTime = 0;
let elapsed = 0;
let timerInterval = null;
let running = false;
let laps = [];

function formatTime(ms) {
  const centiseconds = Math.floor((ms % 1000) / 10);
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 60000) % 60);
  const hours = Math.floor(ms / 3600000);
  return (
    (hours > 0 ? String(hours).padStart(2, '0') + ':' : '') +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0') + '.' +
    String(centiseconds).padStart(2, '0')
  );
}

function updateDisplay() {
  display.textContent = formatTime(elapsed);
}

function startStop() {
  if (!running) {
    startTime = Date.now() - elapsed;
    timerInterval = setInterval(() => {
      elapsed = Date.now() - startTime;
      updateDisplay();
    }, 10);
    startStopBtn.textContent = 'Stop';
    running = true;
  } else {
    clearInterval(timerInterval);
    startStopBtn.textContent = 'Start';
    running = false;
  }
}

function reset() {
  clearInterval(timerInterval);
  elapsed = 0;
  updateDisplay();
  startStopBtn.textContent = 'Start';
  running = false;
  laps = [];
  lapsList.innerHTML = '';
}

function lap() {
  if (!running) return;
  let prevTotal = laps.reduce((a, b) => a + b, 0);
  const lapTime = elapsed - prevTotal;
  laps.push(lapTime);
  renderLaps();
  // Play a short beep
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = 880;
    o.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.08);
    o.onended = () => ctx.close();
  } catch {}
}

function renderLaps() {
  lapsList.innerHTML = '';
  if (laps.length === 0) return;
  let total = 0;
  let best = Math.min(...laps);
  let worst = Math.max(...laps);
  laps.forEach((lap, i) => {
    total += lap;
    const li = document.createElement('li');
    li.textContent = `Lap ${i + 1}: ${formatTime(lap)} (Total: ${formatTime(total)})`;
    if (lap === best && laps.length > 1) li.style.color = '#43d17a';
    if (lap === worst && laps.length > 1) li.style.color = '#ff6b6b';
    lapsList.appendChild(li);
  });
}
// Keyboard shortcuts: Space=start/stop, R=reset, L=lap
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.code === 'Space') {
    e.preventDefault();
    startStop();
  } else if (e.key.toLowerCase() === 'r') {
    reset();
  } else if (e.key.toLowerCase() === 'l') {
    lap();
  }
});

startStopBtn.addEventListener('click', startStop);
resetBtn.addEventListener('click', reset);
lapBtn.addEventListener('click', lap);

// Theme toggle logic
let darkMode = true;
function setTheme(dark) {
  document.body.classList.toggle('dark-mode', dark);
  document.body.classList.toggle('light-mode', !dark);
  themeToggle.classList.toggle('dark', dark);
}
themeToggle.addEventListener('click', () => {
  darkMode = !darkMode;
  setTheme(darkMode);
});
setTheme(true);
