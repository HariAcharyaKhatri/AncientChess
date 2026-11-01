// ==========================================
// GAME ORCHESTRATION & CONTROL
// ==========================================

function startLocal2Player() {
  const flip = !!document.getElementById('flip-toggle')?.checked;
  prefs.flipLocal = flip;
  savePrefs();
  gameState = new GameState('human', 'intermediate', 'both', false, false);
  gameState.flipAfterMove = flip;
  gameState.showClocks = false;
  boardFlipped = false;
  showScreen('game');
  updateUI();
  resizeBoard();
  drawBoard();
  toast('Pass & Play started');
  playStart();
}

function startVsBot(diff, color) {
  if (color === 'random') color = Math.random() < 0.5 ? 'white' : 'black';
  const assist = !!document.getElementById('assist-toggle')?.checked;
  prefs.assist = assist;
  prefs.botColor = color;
  savePrefs();
  gameState = new GameState('bot', diff, color, false, assist);
  gameState.showClocks = false;
  boardFlipped = (color === 'black');
  showScreen('game');
  updateUI();
  resizeBoard();
  drawBoard();
  toast(`Playing as ${color} vs ${BOT_CONFIGS[diff].name}`);
  playStart();
  if (color === 'black') setTimeout(() => requestAIMove(), 350);
}

function newGame() {
  const opp = gameState ? gameState.opponent : 'bot';
  if (opp === 'online_human') {
    showScreen('play');
    return;
  }
  const diff = gameState ? gameState.difficulty : 'intermediate';
  const color = gameState ? gameState.playerColor : 'white';
  const assist = gameState ? gameState.assistMode : false;
  gameState = new GameState(opp, diff, color, false, assist);
  gameState.showClocks = false;
  if (opp === 'human') gameState.flipAfterMove = prefs.flipLocal;
  showScreen('game');
  updateUI();
  resizeBoard();
  drawBoard();
  toast('New game started');
  playStart();
  if (color === 'black' && opp === 'bot') setTimeout(() => requestAIMove(), 350);
}

function exportPGN() {
  if (!gameState || !gameState.moveNotation.length) {
    toast('No moves to export');
    return;
  }
  let pgn = `[Event "${gameState.mode === 'chaturanga' ? 'Ancient Chaturanga' : 'Standard Chess'}"]\n[Site "Ancient Chess Web"]\n[Date "${new Date().toISOString().slice(0, 10)}"]\n\n`;
  for (let i = 0; i < gameState.moveNotation.length; i += 2) {
    pgn += `${Math.floor(i / 2) + 1}. ${gameState.moveNotation[i] || ''} ${gameState.moveNotation[i + 1] || ''} `;
  }
  const blob = new Blob([pgn], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ancient_chess_${Date.now()}.pgn`;
  a.click();
  URL.revokeObjectURL(url);
  toast('PGN exported');
}

function requestHint() {
  if (!gameState || gameState.gameOver || aiThinking) return;
  const moves = gameState.getAllMoves(gameState.turn);
  if (!moves.length) return;

  // Pick tactical move: capture > center move > first move
  let best = moves[0];
  for (const m of moves) {
    const target = gameState.board[m.to[0]][m.to[1]];
    if (target) { best = m; break; }
    if ((m.to[0] === 3 || m.to[0] === 4) && (m.to[1] === 3 || m.to[1] === 4)) best = m;
  }

  const notation = gameState.getNotation(best.from[0], best.from[1], best.to[0], best.to[1], !!gameState.board[best.to[0]][best.to[1]], false, false);
  gameState.hintSquare = { from: best.from, to: best.to };
  drawBoard();
  toast(`Hint: ${notation || 'Make a move'}`);
}

function undoMove() {
  if (!gameState || gameState.isMultiplayer || gameState.gameOver) {
    toast('Cannot undo in this mode');
    return;
  }
  if (!gameState.snapshots || !gameState.snapshots.length) {
    toast('No moves to undo');
    return;
  }

  // If playing against a bot and at least 2 snapshots exist, undo both to return to user's turn
  const count = (gameState.opponent === 'bot' && gameState.snapshots.length >= 2) ? 2 : 1;
  for (let i = 0; i < count; i++) {
    if (gameState.snapshots.length) {
      const snap = gameState.snapshots.pop();
      restoreState(gameState, snap);
    }
  }

  gameState.selectedSquare = null;
  gameState.validMoves = [];
  gameState.hintSquare = null;
  gameState.viewIndex = -1;
  updateUI();
  drawBoard();
  toast('Move undone');
}

function startAnalysis() {
  if (!gameState) {
    gameState = new GameState('human', 'intermediate', 'both', false, true);
    gameState.showClocks = false;
  }
  gameState.isAnalysis = true;
  gameState.assistMode = true;
  showScreen('game');
  updateUI();
  resizeBoard();
  drawBoard();
  toast('Analysis mode activated');
}

function offerDraw() {
  if (!gameState || gameState.gameOver) return;
  if (gameState.isMultiplayer && wsConnected) {
    const now = Date.now();
    if (now < drawOfferCooldownUntil) {
      toast('Please wait before offering again');
      return;
    }
    wsClient.send(JSON.stringify({ type: 'offer_draw' }));
    drawOfferCooldownUntil = now + 10000;
    toast('Draw offer sent');
  } else if (gameState.opponent === 'bot') {
    toast('The bot declined your draw offer');
  } else {
    if (confirm('Player 2, do you accept the draw?')) {
      gameState.gameOver = true;
      gameState.winner = 'Draw';
      lastGameOverInfo = { winner: 'Draw', reason: 'draw agreed', eloChange: null };
      toast('Game drawn by agreement');
      showGameOverOverlay();
    }
  }
}

function confirmResign() {
  if (!gameState || gameState.gameOver) return;
  const doIt = () => {
    if (gameState.isMultiplayer && wsConnected) wsClient.send(JSON.stringify({ type: 'resign' }));
    gameState.gameOver = true;
    gameState.winner = gameState.turn === 'white' ? 'Black' : 'White';
    lastGameOverInfo = { winner: gameState.winner, reason: 'resignation', eloChange: null };
    toast(`${gameState.turn} resigned`);
    stopClockLoop();
    showGameOverOverlay();
  };
  if (prefs.confirmResign) {
    if (confirm('Resign this game?')) doIt();
  } else doIt();
}

function showPromotionDialog(color) {
  const isBlack = color === 'black';
  const std = isBlack
    ? { queen:'\u265B', rook:'\u265C', bishop:'\u265D', knight:'\u265E' }
    : { queen:'\u2655', rook:'\u2656', bishop:'\u2657', knight:'\u2658' };
  const cha = isBlack
    ? { mantri:'\u265B', ratha:'\u265C', gaja:'\u265D', ashva:'\u265E' }
    : { mantri:'\u2655', ratha:'\u2656', gaja:'\u2657', ashva:'\u2658' };
  const set = gameState && gameState.mode === 'standard' ? std : cha;
  const btns = Object.entries(set).map(([t, s]) => `<button class="promo-btn" onclick="executePromotion('${t}')">${s}</button>`).join('');
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation()">
      <h3>Promote pawn</h3>
      <div class="promo-grid">${btns}</div>
    </div>`);
}

function executePromotion(type) {
  closeOverlay();
  if (!pendingPromotion || !gameState) return;
  const { fr, fc, tr, tc } = pendingPromotion;
  pendingPromotion = null;
  gameState.makeMove(fr, fc, tr, tc, type);
  updateUI();
  drawBoard();
  if (gameState.opponent === 'bot' && !gameState.gameOver && gameState.turn === gameState.botColor) {
    setTimeout(() => requestAIMove(), 150);
  }
}

function showGameOverOverlay() {
  if (!gameState) return;
  const info = lastGameOverInfo || {};
  const isDraw = gameState.winner === 'Draw';
  const title = isDraw ? 'Draw' : `${escapeHtml(gameState.winner)} wins`;
  const reason = info.reason ? formatReason(info.reason) : '';
  let eloHtml = '';
  if (info.eloChange && onlinePlayerColor) {
    const mine = onlinePlayerColor === 'white' ? info.eloChange.white : info.eloChange.black;
    if (typeof mine === 'number') {
      const sign = mine >= 0 ? '+' : '';
      const cls = mine >= 0 ? 'elo-up' : 'elo-down';
      eloHtml = `<div class="elo-change ${cls}">${sign}${mine}</div>`;
    }
  }
  const isOnline = gameState.isMultiplayer;
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation()">
      <h3>${title}</h3>
      ${reason ? `<p class="game-over-reason">${escapeHtml(reason)}</p>` : ''}
      ${eloHtml}
      <div class="flex-row mt-12">
        ${isOnline ? `<button class="btn primary" onclick="requestRematch()">Rematch</button>`
                   : `<button class="btn primary" onclick="closeOverlay();newGame()">Rematch</button>`}
        <button class="btn secondary" onclick="closeOverlay();startAnalysis()">Analyze</button>
        <button class="btn secondary" onclick="closeOverlay();showScreen('play')">Back to Play</button>
      </div>
      <div id="rematch-waiting" hidden style="text-align:center;color:var(--text-dim);font-size:13px;margin-top:10px;">Waiting for opponent…</div>
    </div>`);
}

function showHelp() {
  const standardRules = `
    <li><b>King</b> - one square any direction, plus castling</li>
    <li><b>Queen</b> - any direction, any distance</li>
    <li><b>Rook</b> - orthogonal, any distance</li>
    <li><b>Bishop</b> - diagonal, any distance</li>
    <li><b>Knight</b> - L-shaped jump</li>
    <li><b>Pawn</b> - forward one (two on first move), captures diagonally, en passant</li>`;
  const chaturangaRules = `
    <li><b>Raja</b> - one square any direction</li>
    <li><b>Mantri</b> - exactly one square diagonally</li>
    <li><b>Ratha</b> - orthogonal sliding</li>
    <li><b>Gaja</b> - exactly two squares diagonally, jumps over pieces</li>
    <li><b>Ashva</b> - L-shaped jump</li>
    <li><b>Padati</b> - forward one, captures diagonally, promotes to Mantri</li>`;
  const rules = gameState && gameState.mode === 'standard' ? standardRules : chaturangaRules;
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation()">
      <h3>${gameState && gameState.mode === 'standard' ? 'Standard Chess' : 'Ancient Chaturanga'}</h3>
      <ul style="padding-left:20px;line-height:1.9;color:var(--text);">${rules}</ul>
      <button class="btn secondary w-full mt-12" onclick="closeOverlay()">Close</button>
    </div>`);
}
