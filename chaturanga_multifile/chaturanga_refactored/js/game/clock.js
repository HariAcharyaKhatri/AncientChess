function startClockLoop() {
  stopClockLoop();
  lastClockSync = Date.now();
  clockInterval = setInterval(tickClocks, 100);
}

function stopClockLoop() {
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }
}

function tickClocks() {
  if (!gameState || gameState.gameOver || !gameState.showClocks) {
    stopClockLoop();
    return;
  }
  if (gameState.moveHistory.length < 2 && !gameState.isMultiplayer) return;
  
  const now = Date.now();
  const delta = now - lastClockSync;
  lastClockSync = now;
  
  if (clocks[gameState.turn] !== undefined) {
    clocks[gameState.turn] = Math.max(0, clocks[gameState.turn] - delta);
    if (clocks[gameState.turn] <= 0) {
      clocks[gameState.turn] = 0;
      stopClockLoop();
      if (!gameState.isMultiplayer) {
        gameState.gameOver = true;
        gameState.winner = gameState.turn === 'white' ? 'Black' : 'White';
        lastGameOverInfo = { winner: gameState.winner, reason: 'time', eloChange: null };
        playCheckmate();
        updateUI();
        showGameOverOverlay();
      }
    }
  }
  updateClocks();
}

function updateClocks() {
  paintClock('white', clocks.white);
  paintClock('black', clocks.black);
}

function paintClock(color, ms) {
  const el = document.getElementById('clock-' + color);
  if (!el) return;
  if (ms === undefined) ms = 0;
  el.textContent = fmtClock(ms);
  if (gameState && !gameState.gameOver && gameState.turn === color && gameState.moveHistory.length >= (gameState.isMultiplayer ? 0 : 2)) {
    el.classList.add('running');
  } else {
    el.classList.remove('running');
  }
  if (ms < 10000 && ms > 0) el.style.color = '#e74c3c';
  else el.style.color = '';
}

function fmtClock(ms) {
  if (ms <= 0) return '0:00';
  const totalSecs = Math.ceil(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  const mm = m.toString();
  const ss = s < 10 ? '0' + s : s;
  return mm + ':' + ss;
}

function updateStartHint() {
  const hint = document.getElementById('start-hint');
  if (!hint || !gameState) return;
  if (!gameState.isMultiplayer && gameState.moveHistory.length < 2 && !gameState.gameOver && gameState.showClocks) {
    hint.textContent = 'Clocks start after each player moves once';
    hint.hidden = false;
  } else {
    hint.hidden = true;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && gameState && gameState.showClocks && !gameState.gameOver) {
    lastClockSync = Date.now();
  }
});
