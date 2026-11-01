// ==========================================
// CLOCK ENGINE & MATCH TIMERS
// ==========================================

function startClockLoop() {
  stopClockLoop();
  if (!gameState || !gameState.showClocks) return;
  clockTimerId = setInterval(tickClocks, 100);
  tickClocks();
}

function stopClockLoop() {
  if (clockTimerId) { clearInterval(clockTimerId); clockTimerId = null; }
}

function tickClocks() {
  updateClocks();
  updateStartHint();
}

function updateClocks() {
  if (!gameState || !gameState.showClocks || !clockModel) return;
  const now = performance.now();
  let w = clockModel.whiteBase;
  let b = clockModel.blackBase;
  if (clockModel.running) {
    const elapsed = (now - clockModel.receivedAt) / 1000;
    if (clockModel.turn === 'white') w -= elapsed; else b -= elapsed;
  }
  w = Math.max(0, w);
  b = Math.max(0, b);
  const activeTurn = clockModel.running ? clockModel.turn : null;
  paintClock('clock-white', w, activeTurn === 'white');
  paintClock('clock-black', b, activeTurn === 'black');
}

function paintClock(id, seconds, active) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = fmtClock(seconds);
  el.classList.toggle('active', !!active);
  el.classList.toggle('inactive', !active);
  el.classList.toggle('low', seconds < 20);
  el.classList.toggle('critical', seconds < 10);
}

function fmtClock(sec) {
  sec = Math.max(0, sec);
  const m = Math.floor(sec / 60);
  if (sec < 10) {
    const s = sec - m * 60;
    const whole = Math.floor(s);
    const tenth = Math.floor((s - whole) * 10);
    return `${m}:${String(whole).padStart(2, '0')}.${tenth}`;
  }
  const s = Math.floor(sec - m * 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function updateStartHint() {
  const el = document.getElementById('start-hint');
  if (!el) return;
  if (!gameState || !gameState.showClocks || gameState.gameOver || !clockModel) {
    el.hidden = true; return;
  }
  if (clockModel.running) { el.hidden = true; return; }
  const now = performance.now();
  const baseTime = (gameState.moveHistory.length >= 1 && firstMoveAt) ? firstMoveAt : matchStartAt;
  if (!baseTime) { el.hidden = true; return; }
  const elapsed = (now - baseTime) / 1000;
  const remaining = Math.max(0, 30 - elapsed);
  const span = document.getElementById('start-hint-count');
  if (span) span.textContent = Math.ceil(remaining);
  el.hidden = false;
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && clockTimerId) updateClocks();
});
