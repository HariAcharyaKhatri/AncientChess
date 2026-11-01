// ==========================================
// MOVE HISTORY & GAME UI DISPLAY
// ==========================================

function updateUI() {
  if (!gameState) return;
  const hintBtn = document.getElementById('btn-hint');
  const undoBtn = document.getElementById('btn-undo');
  const evalWrap = document.getElementById('eval-wrapper');
  const showTools = gameState.assistMode || gameState.isAnalysis;

  if (hintBtn) hintBtn.style.display = showTools ? 'inline-flex' : 'none';
  if (undoBtn) undoBtn.style.display = showTools ? 'inline-flex' : 'none';
  if (evalWrap) evalWrap.style.display = showTools ? 'flex' : 'none';

  const drawBtn = document.getElementById('btn-draw');
  if (drawBtn) drawBtn.style.display = gameState.isMultiplayer ? 'inline-flex' : 'none';
  const gameDrawBtn = document.getElementById('btn-game-draw');
  if (gameDrawBtn) gameDrawBtn.style.display = gameState.isMultiplayer ? 'inline-flex' : 'none';

  const isBot = gameState.opponent === 'bot';
  const isOnline = gameState.isMultiplayer;
  const botName = BOT_CONFIGS[gameState.difficulty]?.name || 'Bot';
  const wName = isOnline ? (onlinePlayerColor === 'white' ? 'You' : gameState.onlineOpponent)
              : (isBot && gameState.playerColor !== 'white' ? botName : (isBot ? 'You' : 'Player 1'));
  const bName = isOnline ? (onlinePlayerColor === 'black' ? 'You' : gameState.onlineOpponent)
              : (isBot && gameState.playerColor !== 'black' ? botName : (isBot ? 'You' : 'Player 2'));

  const top = boardFlipped ? 'white' : 'black';
  const btm = boardFlipped ? 'black' : 'white';

  const barHTML = (col) => {
    const name = col === 'white' ? wName : bName;
    let clockHtml = '';
    if (gameState.showClocks) clockHtml = `<div class="player-timer" id="clock-${col}">0:00</div>`;
    const avatarIcon = col === 'white' ? '\u2654' : '\u265A';
    const caps = col === 'white' ? gameState.capturedBlack : gameState.capturedWhite;
    const pieceSyms = { pawn:'♟', padati:'♟', knight:'♞', ashva:'♞', bishop:'♝', gaja:'♝', rook:'♜', ratha:'♜', queen:'♛', mantri:'♛' };
    const capHtml = caps && caps.length ? `<span class="captured-pieces" style="margin-left:8px;font-size:12px;opacity:0.75;letter-spacing:1px;">${caps.map(p => pieceSyms[p.type] || '♟').join('')}</span>` : '';
    return `
      <div class="player-info-left">
        <div class="player-avatar">${avatarIcon}</div>
        <div class="player-name">${escapeHtml(name || 'Opponent')}${capHtml}</div>
      </div>
      ${clockHtml}`;
  };

  const oppBar = document.getElementById('opponent-bar');
  const playerBar = document.getElementById('player-bar');
  if (oppBar) oppBar.innerHTML = barHTML(top);
  if (playerBar) playerBar.innerHTML = barHTML(btm);

  const moveCount = document.getElementById('move-count');
  if (moveCount) moveCount.textContent = gameState.moveNotation.length;

  const moveList = document.getElementById('move-list');
  if (moveList) {
    let html = '';
    for (let i = 0; i < gameState.moveNotation.length; i += 2) {
      const active1 = gameState.viewIndex === i ? ' active' : '';
      const active2 = gameState.viewIndex === i + 1 ? ' active' : '';
      html += `<div class="num">${Math.floor(i / 2) + 1}.</div>
               <div class="move${active1}" onclick="viewMoveHistory(${i})">${escapeHtml(gameState.moveNotation[i] || '')}</div>
               <div class="move${active2}" ${gameState.moveNotation[i + 1] ? `onclick="viewMoveHistory(${i + 1})"` : ''}>${escapeHtml(gameState.moveNotation[i + 1] || '')}</div>`;
    }
    moveList.innerHTML = html;
  }

  const tag = document.getElementById('game-mode-tag');
  if (tag) tag.textContent = gameState.mode === 'standard' ? 'Standard Chess' : 'Ancient Chaturanga';

  if (gameState.showClocks) updateClocks();
  updateStartHint();
}

function viewMoveHistory(idx) {
  if (!gameState) return;
  if (gameState.viewIndex === idx) {
    gameState.viewIndex = -1;
  } else {
    gameState.viewIndex = idx;
  }
  updateUI();
  drawBoard();
}
