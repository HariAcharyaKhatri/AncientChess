function initWebSocket() {
  if (window.location.protocol === 'file:' || !window.location.host) {
    setServerStatus(false);
    return;
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${proto}//${window.location.host}`;
  try { wsClient = new WebSocket(wsUrl); }
  catch (e) { setServerStatus(false); return; }

  wsClient.onopen = () => {
    wsConnected = true;
    setServerStatus(true);
    updateConnectionIndicator();
    const token = localStorage.getItem('chaturanga_token');
    if (token) wsClient.send(JSON.stringify({ type: 'auth', token }));
    else attemptResumeGame();
  };
  wsClient.onclose = () => {
    wsConnected = false;
    setServerStatus(false);
    updateConnectionIndicator();
    stopClockLoop();
    setTimeout(initWebSocket, 3000);
  };
  wsClient.onerror = () => { wsConnected = false; setServerStatus(false); updateConnectionIndicator(); };
  wsClient.onmessage = (event) => {
    try { handleServerMessage(JSON.parse(event.data)); }
    catch (e) { console.error('Bad WS message', e); }
  };
}

function setServerStatus(online) {
  const dot = document.getElementById('server-status-dot');
  const text = document.getElementById('server-status-text');
  if (!dot || !text) return;
  dot.className = online ? 'status-dot online' : 'status-dot';
  text.textContent = online ? 'Server connected' : 'Offline — local fallback';
}

function updateConnectionIndicator() {
  const el = document.getElementById('reconnect-indicator');
  if (!el) return;
  const show = gameState && gameState.isMultiplayer && !wsConnected && !gameState.gameOver;
  el.hidden = !show;
}

function handleServerMessage(data) {
  switch (data.type) {
    case 'auth_ack':
      if (data.user) { authUser = data.user; updateUserHeader(); }
      attemptResumeGame();
      break;
    case 'room_created':
      currentOnlineRoom = data.roomCode;
      onlinePlayerColor = data.color;
      showRoomWaiting(data.roomCode);
      break;
    case 'room_joined':
      currentOnlineRoom = data.roomCode;
      onlinePlayerColor = data.color;
      toast(`Joined room ${data.roomCode}`);
      break;
    case 'match_start': handleMatchStart(data); break;
    case 'move_made': handleServerMoveMade(data); break;
    case 'clock_sync': handleClockSync(data); break;
    case 'ai_move_response':
      if (gameState && aiThinking) {
        aiThinking = false;
        if (data.score !== undefined && (gameState.assistMode || gameState.isAnalysis)) {
          const evalScore = gameState.botColor === 'white' ? data.score : -data.score;
          updateEvalBar(evalScore);
        }
        if (data.move && !gameState.gameOver && gameState.turn === gameState.botColor) {
          gameState.makeMove(data.move.from[0], data.move.from[1], data.move.to[0], data.move.to[1]);
          updateUI(); drawBoard();
        }
      }
      break;
    case 'chat_broadcast': receiveChatMessage(data.sender, data.message); break;
    case 'draw_offered': showDrawOfferBanner(); break;
    case 'draw_declined': hideDrawOfferBanner(); toast('Draw offer declined'); break;
    case 'rematch_offered': showRematchBanner(); break;
    case 'opponent_disconnected': showDisconnectBanner(data.graceSeconds || 30); break;
    case 'opponent_reconnected': hideDisconnectBanner(); toast('Opponent reconnected'); break;
    case 'game_over': handleGameOver(data); break;
    case 'error': handleServerError(data); break;
  }
}

function handleMatchStart(data) {
  const roomCode = data.roomCode || currentOnlineRoom || sessionStorage.getItem('chaturanga_room');
  if (roomCode) { currentOnlineRoom = roomCode; try { sessionStorage.setItem('chaturanga_room', roomCode); } catch (e) {} }
  hideSearch(); hideRoomWaiting(); hideDrawOfferBanner(); hideRematchBanner(); hideDisconnectBanner();
  if (data.color) onlinePlayerColor = data.color;
  const opp = data.opponent || {};
  const oppName = opp.name || (onlinePlayerColor === 'white' ? data.black : data.white) || 'Opponent';
  if (data.timeControl) {
    timeControl = { base: data.timeControl.base, inc: data.timeControl.inc || 0 };
    prefs.timeControl = { base: timeControl.base, inc: timeControl.inc };
    savePrefs(); syncTCLabels();
  }
  if (data.mode) applyGameMode(data.mode);
  gameState = new GameState('online_human', 'intermediate', onlinePlayerColor, false, false);
  gameState.isMultiplayer = true;
  gameState.roomCode = roomCode;
  gameState.onlineOpponent = oppName;
  gameState.opponentElo = opp.elo || null;
  gameState.showClocks = true;
  boardFlipped = (onlinePlayerColor === 'black');
  if (Array.isArray(data.moves) && data.moves.length) {
    silentReplay = true;
    gameState.isMultiplayer = false;
    for (const m of data.moves) { try { gameState.makeMove(m.fr, m.fc, m.tr, m.tc, m.promoteTo); } catch (e) {} }
    gameState.isMultiplayer = true;
    silentReplay = false;
    gameState.gameOver = false; gameState.winner = null; gameState.checkmate = false; gameState.stalemate = false;
  }
  if (data.turn) gameState.turn = data.turn;
  const clocks = data.clocks || {};
  const base = timeControl.base;
  clockModel = {
    whiteBase: typeof clocks.timerWhite === 'number' ? clocks.timerWhite : base,
    blackBase: typeof clocks.timerBlack === 'number' ? clocks.timerBlack : base,
    turn: data.turn || 'white', running: false, receivedAt: performance.now()
  };
  matchStartAt = performance.now();
  firstMoveAt = 0;
  pendingOptimisticSnapshot = null;
  pendingOptimisticMove = null;
  showScreen('game'); updateUI(); resizeBoard(); drawBoard(); updateClocks(); startClockLoop();
  toast(`Match: you are ${onlinePlayerColor.toUpperCase()} vs ${oppName}`);
  playStart();
}

function handleServerMoveMade(data) {
  if (!gameState || !gameState.isMultiplayer) return;
  const isOwnEcho =
    (data.color && data.color === onlinePlayerColor) ||
    (pendingOptimisticMove && pendingOptimisticMove.fr === data.from[0] &&
     pendingOptimisticMove.fc === data.from[1] && pendingOptimisticMove.tr === data.to[0] &&
     pendingOptimisticMove.tc === data.to[1]);
  if (isOwnEcho) {
    pendingOptimisticMove = null; pendingOptimisticSnapshot = null; hideDrawOfferBanner(); return;
  }
  hideDrawOfferBanner();
  if (firstMoveAt === 0) firstMoveAt = performance.now();
  const [fr, fc] = data.from; const [tr, tc] = data.to;
  gameState.makeMove(fr, fc, tr, tc, data.promotedType);
  updateUI(); drawBoard(); updateClocks();
}

function handleClockSync(data) {
  if (!clockModel) return;
  clockModel.whiteBase = data.timerWhite;
  clockModel.blackBase = data.timerBlack;
  clockModel.turn = data.turn;
  clockModel.running = !!data.running;
  clockModel.receivedAt = performance.now();
  updateClocks();
}

function handleGameOver(data) {
  if (!gameState) return;
  stopClockLoop();
  hideDrawOfferBanner(); hideRematchBanner(); hideDisconnectBanner();
  gameState.gameOver = true;
  gameState.winner = data.winner;
  lastGameOverInfo = { winner: data.winner, reason: data.resultType || data.reason || '', eloChange: data.eloChange || null };
  try { sessionStorage.removeItem('chaturanga_room'); } catch (e) {}
  currentOnlineRoom = null;
  updateUI(); drawBoard(); updateStartHint(); showGameOverOverlay();
  if (data.eloChange) loadStats();
}

function handleServerError(data) {
  if (pendingOptimisticSnapshot && gameState) {
    restoreState(gameState, pendingOptimisticSnapshot);
    pendingOptimisticSnapshot = null;
    pendingOptimisticMove = null;
    gameState.selectedSquare = null;
    gameState.validMoves = [];
    updateUI();
    drawBoard();
    toast('Illegal move rejected — board restored');
  } else {
    toast('⚠️ ' + (data.message || 'Server error'));
  }
  hideSearch();
}
