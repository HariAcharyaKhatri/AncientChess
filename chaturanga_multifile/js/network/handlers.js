// ==========================================
// NETWORK HANDLERS — draw / rematch / disconnect / snapshot
// ==========================================

function snapshotState(gs) {
  return {
    board: gs.board.map(row => row.map(p => p ? Object.assign({}, p) : null)),
    turn: gs.turn, castlingRights: Object.assign({}, gs.castlingRights),
    epSquare: gs.epSquare ? gs.epSquare.slice() : null, halfMoveClock: gs.halfMoveClock,
    capturedWhite: gs.capturedWhite.slice(), capturedBlack: gs.capturedBlack.slice(),
    moveHistory: gs.moveHistory.slice(), moveNotation: gs.moveNotation.slice(),
    lastMove: gs.lastMove ? Object.assign({}, gs.lastMove) : null,
    check: gs.check, checkmate: gs.checkmate, stalemate: gs.stalemate,
    gameOver: gs.gameOver, winner: gs.winner, promotions: gs.promotions
  };
}

function restoreState(gs, snap) {
  gs.board = snap.board.map(row => row.map(p => p ? Object.assign({}, p) : null));
  gs.turn = snap.turn; gs.castlingRights = Object.assign({}, snap.castlingRights);
  gs.epSquare = snap.epSquare ? snap.epSquare.slice() : null; gs.halfMoveClock = snap.halfMoveClock;
  gs.capturedWhite = snap.capturedWhite.slice(); gs.capturedBlack = snap.capturedBlack.slice();
  gs.moveHistory = snap.moveHistory.slice(); gs.moveNotation = snap.moveNotation.slice();
  gs.lastMove = snap.lastMove ? Object.assign({}, snap.lastMove) : null;
  gs.check = snap.check; gs.checkmate = snap.checkmate; gs.stalemate = snap.stalemate;
  gs.gameOver = snap.gameOver; gs.winner = snap.winner; gs.promotions = snap.promotions;
}

function showDrawOfferBanner() {
  const el = document.getElementById('draw-offer-banner');
  if (el) { drawOfferBannerActive = true; el.hidden = false; }
}
function hideDrawOfferBanner() {
  const el = document.getElementById('draw-offer-banner');
  if (el) { drawOfferBannerActive = false; el.hidden = true; }
}
function respondDraw(accept) {
  if (!wsConnected || !wsClient) return;
  wsClient.send(JSON.stringify({ type: 'draw_response', accept: !!accept }));
  hideDrawOfferBanner();
}

function showRematchBanner() {
  const el = document.getElementById('rematch-banner');
  if (el) { rematchBannerActive = true; el.hidden = false; }
}
function hideRematchBanner() {
  const el = document.getElementById('rematch-banner');
  if (el) { rematchBannerActive = false; el.hidden = true; }
}
function respondRematch(accept) {
  if (!wsConnected || !wsClient) return;
  wsClient.send(JSON.stringify({ type: 'respond_rematch', accept: !!accept }));
  hideRematchBanner();
}
function requestRematch() {
  if (!wsConnected || !wsClient) { toast('Not connected'); return; }
  wsClient.send(JSON.stringify({ type: 'request_rematch' }));
  toast('Rematch requested');
  const el = document.getElementById('rematch-waiting');
  if (el) el.hidden = false;
}

function showDisconnectBanner(graceSeconds) {
  const el = document.getElementById('disconnect-banner');
  if (!el) return;
  clearInterval(disconnectTimerId);
  let remaining = Math.max(1, graceSeconds);
  const render = () => {
    const span = document.getElementById('disconnect-countdown');
    if (span) span.textContent = remaining;
  };
  render(); el.hidden = false;
  disconnectTimerId = setInterval(() => {
    remaining -= 1; render();
    if (remaining <= 0) { clearInterval(disconnectTimerId); disconnectTimerId = null; }
  }, 1000);
}
function hideDisconnectBanner() {
  clearInterval(disconnectTimerId); disconnectTimerId = null;
  const el = document.getElementById('disconnect-banner');
  if (el) el.hidden = true;
}

function attemptResumeGame() {
  if (!wsConnected || !wsClient) return;
  const roomCode = sessionStorage.getItem('chaturanga_room');
  if (!roomCode) return;
  if (gameState && gameState.isMultiplayer && !gameState.gameOver) return;
  try { wsClient.send(JSON.stringify({ type: 'resume_game', roomCode })); } catch (e) {}
}

function sendChat() {
  const input = document.getElementById('chat-input');
  const text = (input && typeof input.value === 'string') ? input.value.trim() : '';
  if (!text) return;
  if (gameState && gameState.isMultiplayer && wsConnected && wsClient) {
    wsClient.send(JSON.stringify({ type: 'chat', text }));
  }
  receiveChatMessage('You', text);
  if (input) input.value = '';

  if (gameState && gameState.opponent === 'bot' && !gameState.isMultiplayer) {
    setTimeout(() => {
      const botName = BOT_CONFIGS[gameState.difficulty]?.name || 'Bot';
      const replies = [
        'Good game! Focus on your piece development.',
        'An intriguing move! Let us see how it unfolds.',
        'Ancient Chess requires deep tactical foresight!',
        'Well played. Watch your pieces!'
      ];
      const botReply = replies[Math.floor(Math.random() * replies.length)];
      receiveChatMessage(botName, botReply);
    }, 700);
  }
}

function receiveChatMessage(sender, text) {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  const d = document.createElement('div');
  d.className = 'chat-msg';
  d.innerHTML = `<span class="chat-sender">${escapeHtml(sender)}:</span> ${escapeHtml(text)}`;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}
