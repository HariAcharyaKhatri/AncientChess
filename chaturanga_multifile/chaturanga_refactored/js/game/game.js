function showDrawOfferBanner() {
  const banner = document.getElementById('draw-offer-banner');
  if (banner) banner.hidden = false;
}
function hideDrawOfferBanner() {
  const banner = document.getElementById('draw-offer-banner');
  if (banner) banner.hidden = true;
}
function acceptDrawOffer() {
  hideDrawOfferBanner();
  if (wsConnected) wsClient.send(JSON.stringify({ type: 'accept_draw' }));
}
function declineDrawOffer() {
  hideDrawOfferBanner();
  if (wsConnected) wsClient.send(JSON.stringify({ type: 'decline_draw' }));
}

function showDisconnectBanner() {
  const banner = document.getElementById('disconnect-banner');
  if (banner) banner.hidden = false;
}
function hideDisconnectBanner() {
  const banner = document.getElementById('disconnect-banner');
  if (banner) banner.hidden = true;
}

function attemptResumeGame() {
  if (wsConnected && wsClient.readyState === WebSocket.OPEN) {
    wsClient.send(JSON.stringify({ type: 'resume_game' }));
    hideDisconnectBanner();
  } else {
    toast('Not connected to server');
  }
}

function startLocal2Player() {
  gameState = new GameState();
  gameState.mode = gameMode;
  gameState.playerColor = 'both';
  gameState.botColor = null;
  gameState.opponent = 'human';
  gameState.showClocks = true;
  gameState.assistMode = prefs.assistMode;
  gameState.timeControl = { ...timeControl };
  
  boardFlipped = false;
  
  clocks = {
    white: timeControl.base * 1000,
    black: timeControl.base * 1000
  };
  
  const pBar = document.getElementById('player-bar');
  const oBar = document.getElementById('opponent-bar');
  if (pBar) pBar.classList.remove('online-match');
  if (oBar) oBar.classList.remove('online-match');
  
  updateUI();
  drawBoard();
  showScreen('game');
  playStart();
}

function startVsBot(botConfig, pColor) {
  gameState = new GameState();
  gameState.mode = gameMode;
  gameState.playerColor = pColor;
  gameState.botColor = pColor === 'white' ? 'black' : 'white';
  gameState.opponent = 'bot';
  gameState.difficulty = botConfig.id;
  gameState.showClocks = false;
  gameState.assistMode = prefs.assistMode;
  
  boardFlipped = (pColor === 'black');
  
  const pBar = document.getElementById('player-bar');
  const oBar = document.getElementById('opponent-bar');
  if (pBar) pBar.classList.remove('online-match');
  if (oBar) oBar.classList.remove('online-match');
  
  updateUI();
  drawBoard();
  showScreen('game');
  playStart();
  
  if (gameState.turn === gameState.botColor) {
    setTimeout(requestAIMove, 500);
  }
}

function newGame() {
  if (!gameState) return;
  if (gameState.opponent === 'bot') {
    const config = Object.values(BOT_CONFIGS).find(b => b.id === gameState.difficulty) || BOT_CONFIGS.bot1;
    startVsBot(config, gameState.playerColor);
  } else if (!gameState.isMultiplayer) {
    startLocal2Player();
  }
}

function requestRematch() {
  if (gameState && gameState.isMultiplayer && wsConnected) {
    wsClient.send(JSON.stringify({ type: 'rematch_request' }));
    toast('Rematch requested');
  }
}

// Additional Actions from end of file
function flipBoard() { boardFlipped = !boardFlipped; drawBoard(); }

function exportPGN() {
  if (!gameState || !gameState.moveNotation.length) { toast('No moves to export'); return; }
  let pgn = `[Event "${gameState.mode === 'chaturanga' ? 'Chaturanga' : 'Chess'}"]\n\n`;
  for (let i = 0; i < gameState.moveNotation.length; i += 2) {
    pgn += `${Math.floor(i / 2) + 1}. ${gameState.moveNotation[i] || ''} ${gameState.moveNotation[i + 1] || ''} `;
  }
  const blob = new Blob([pgn], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `game_${Date.now()}.pgn`;
  a.click();
  URL.revokeObjectURL(url);
  toast('PGN exported');
}

function requestHint() {
  if (!gameState || gameState.gameOver || aiThinking) return;
  const moves = gameState.getAllMoves(gameState.turn);
  if (moves.length) {
    const m = moves[0];
    toast(`Hint: ${gameState.getNotation(m.from[0], m.from[1], m.to[0], m.to[1], null, false, false)}`);
  }
}

function undoMove() { toast('Undo arrives in Phase 4'); }

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
    if (gameState.isMultiplayer && wsConnected) {
      wsClient.send(JSON.stringify({ type: 'resign' }));
    }
    gameState.gameOver = true;
    gameState.winner = gameState.turn === 'white' ? 'Black' : 'White';
    lastGameOverInfo = {
      winner: gameState.winner,
      reason: 'resignation',
      eloChange: null
    };
    toast(`${gameState.turn} resigned`);
    stopClockLoop();
    showGameOverOverlay();
  };
  if (prefs.confirmResign) {
    if (confirm('Resign this game?')) doIt();
  } else doIt();
}

function showPromotionDialog(color) {
  const std = { queen:'♕', rook:'♖', bishop:'♗', knight:'♘' };
  const cha = { mantri:'♕', ratha:'♖', gaja:'♗', ashva:'♘' };
  const set = gameState && gameState.mode === 'standard' ? std : cha;
  const btns = Object.entries(set)
    .map(([t, s]) => `<button class="promo-btn" onclick="executePromotion('${t}')">${s}</button>`).join('');
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
  updateUI(); drawBoard();
  if (gameState.opponent === 'bot' && !gameState.gameOver && gameState.turn === gameState.botColor) {
    setTimeout(() => requestAIMove(), 150);
  }
}

function startAnalysis() {
  if (gameState) {
    gameState.isAnalysis = true;
    updateUI();
    toast('Analysis mode on');
  }
}

function showHelp() {
  const standardRules = `
    <li><b>King</b> — one square any direction, plus castling</li>
    <li><b>Queen</b> — any direction, any distance</li>
    <li><b>Rook</b> — orthogonal, any distance</li>
    <li><b>Bishop</b> — diagonal, any distance</li>
    <li><b>Knight</b> — L-shaped jump</li>
    <li><b>Pawn</b> — forward one (two on first move), captures diagonally, en passant</li>`;
  const chaturangaRules = `
    <li><b>Raja</b> — one square any direction</li>
    <li><b>Mantri</b> — exactly one square diagonally</li>
    <li><b>Ratha</b> — orthogonal sliding</li>
    <li><b>Gaja</b> — exactly two squares diagonally, jumps over pieces</li>
    <li><b>Ashva</b> — L-shaped jump</li>
    <li><b>Padati</b> — forward one, captures diagonally, promotes to Mantri</li>`;
  const rules = gameState && gameState.mode === 'standard' ? standardRules : chaturangaRules;
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation()">
      <h3>${gameState && gameState.mode === 'standard' ? 'Standard Chess' : 'Ancient Chaturanga'}</h3>
      <ul style="padding-left:20px;line-height:1.9;color:var(--text);">${rules}</ul>
      <button class="btn secondary w-full mt-12" onclick="closeOverlay()">Close</button>
    </div>`);
}

function formatReason(r) {
  const map = {
    checkmate: 'Checkmate',
    time: 'Time out',
    timeout: 'Time out',
    resignation: 'Resignation',
    resign: 'Resignation',
    'draw agreed': 'Draw agreed',
    agreement: 'Draw agreed',
    stalemate: 'Stalemate',
    insufficient: 'Insufficient material',
    'insufficient material': 'Insufficient material',
    aborted: 'Game aborted',
    disconnect: 'Opponent disconnected'
  };
  return map[r] || r;
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
        ${isOnline
          ? `<button class="btn primary" onclick="requestRematch()">Rematch</button>`
          : `<button class="btn primary" onclick="closeOverlay();newGame()">Rematch</button>`}
        <button class="btn secondary" onclick="closeOverlay();showScreen('play')">New Opponent</button>
        <button class="btn secondary" onclick="closeOverlay();showScreen('play')">Back to Play</button>
      </div>
      <div id="rematch-waiting" hidden style="text-align:center;color:var(--text-dim);font-size:13px;margin-top:10px;">Waiting for opponent…</div>
    </div>`);
}
