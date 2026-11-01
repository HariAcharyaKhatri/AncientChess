function handleMatchStart(msg) {
  closeOverlay();
  showScreen('game');
  
  onlinePlayerColor = msg.color;
  
  gameState = new GameState();
  gameState.isMultiplayer = true;
  gameState.mode = msg.mode || 'standard';
  gameState.playerColor = 'both'; // We handle input for our color only
  gameState.onlineOpponent = msg.opponent;
  gameState.botColor = null;
  gameState.opponent = 'human';
  gameState.showClocks = true;
  gameState.assistMode = false;
  gameState.timeControl = msg.timeControl;
  
  boardFlipped = (onlinePlayerColor === 'black');
  
  clocks = msg.clocks || { white: 0, black: 0 };
  lastClockSync = Date.now();
  
  const pBar = document.getElementById('player-bar');
  const oBar = document.getElementById('opponent-bar');
  if (pBar) pBar.classList.add('online-match');
  if (oBar) oBar.classList.add('online-match');
  
  updateUI();
  drawBoard();
  startClockLoop();
  playStart();
  toast('Match started! You play as ' + msg.color);
}

function handleServerMoveMade(msg) {
  if (!gameState) return;
  
  if (msg.clocks) {
    clocks = msg.clocks;
    lastClockSync = Date.now();
  }
  
  if (msg.color !== onlinePlayerColor) {
    const moved = gameState.makeMove(msg.from[0], msg.from[1], msg.to[0], msg.to[1], msg.promotion);
    if (moved) {
      updateUI();
      drawBoard();
    }
  }
}

function handleClockSync(msg) {
  if (msg.clocks) {
    clocks = msg.clocks;
    lastClockSync = Date.now();
    updateClocks();
  }
}

function handleGameOver(msg) {
  if (!gameState) return;
  
  gameState.gameOver = true;
  gameState.winner = msg.winner;
  
  lastGameOverInfo = {
    winner: msg.winner,
    reason: msg.reason,
    eloChange: msg.eloChange
  };
  
  stopClockLoop();
  updateUI();
  
  if (msg.winner && msg.winner.toLowerCase() === onlinePlayerColor) {
    playCheckmate(); // Temp win sound
  } else if (msg.winner === 'Draw') {
    // Temp draw sound
  } else {
    // Temp loss sound
  }
  
  // Save stats if we have changes
  if (msg.eloChange && authUser) {
    const myChange = onlinePlayerColor === 'white' ? msg.eloChange.white : msg.eloChange.black;
    if (typeof myChange === 'number') {
      persistedStats.elo += myChange;
      if (msg.winner === 'Draw') persistedStats.draws++;
      else if (msg.winner.toLowerCase() === onlinePlayerColor) persistedStats.wins++;
      else persistedStats.losses++;
      persistedStats.gamesPlayed++;
      saveStats(persistedStats);
      updateStatsDisplay();
    }
  }
  
  setTimeout(() => showGameOverOverlay(), 500);
}

function handleServerError(msg) {
  toast('Error: ' + msg.message);
}
