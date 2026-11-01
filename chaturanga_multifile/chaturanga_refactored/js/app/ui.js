function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + id);
  if (target) target.classList.add('active');
  
  const titleEl = document.getElementById('header-title');
  if (titleEl) titleEl.textContent = SCREEN_TITLES[id] || 'Chaturanga';
  
  currentScreen = id;
  
  if (id === 'play') {
    applyGameMode(prefs.variant);
  } else if (id === 'leaderboard') {
    loadLeaderboard();
  }
}

function showProfileTab(tabId) {
  document.querySelectorAll('.profile-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabId);
  });
  document.querySelectorAll('.profile-content-pane').forEach(p => {
    p.classList.toggle('active', p.id === 'profile-pane-' + tabId);
  });
}

function toast(msg) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

function closeOverlay() {
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => { overlay.innerHTML = ''; }, 300);
  }
}

function showOverlay(html) {
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.innerHTML = html;
    overlay.classList.add('active');
  }
}

function renderBotGrid() {
  const grid = document.getElementById('bot-grid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.values(BOT_CONFIGS).forEach(bot => {
    const el = document.createElement('div');
    el.className = 'bot-card';
    el.innerHTML = `
      <div class="bot-icon">${BOT_ICON}</div>
      <div class="bot-name">${escapeHtml(bot.name)}</div>
      <div class="bot-elo">Rating: ${bot.elo}</div>
      <div class="bot-desc">${escapeHtml(bot.desc)}</div>
    `;
    el.onclick = () => selectBot(bot.id, el);
    grid.appendChild(el);
  });
}

function selectBot(id, el) {
  document.querySelectorAll('.bot-card').forEach(c => c.classList.remove('selected'));
  if (el) el.classList.add('selected');
  selectedBot = BOT_CONFIGS[id];
  const b = document.getElementById('btn-start-bot');
  if (b) {
    b.disabled = false;
    b.classList.remove('secondary');
    b.classList.add('primary');
  }
}

function setModeTab(mode) {
  document.querySelectorAll('.mode-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  document.querySelectorAll('.play-panel').forEach(p => {
    p.hidden = (p.id !== 'panel-' + mode);
  });
}

function setFriendColor(color) {
  document.querySelectorAll('#friend-color button').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`#friend-color button[data-color="${color}"]`);
  if (btn) btn.classList.add('active');
  prefs.friendColor = color;
}

function startSearch() {
  if (!wsConnected) { toast('Connecting to server...'); return; }
  const btn = document.getElementById('btn-quick-match');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Searching...';
  }
  wsClient.send(JSON.stringify({
    type: 'search_match',
    mode: gameMode,
    timeControl: timeControl
  }));
}

function cancelSearch() {
  if (wsConnected) wsClient.send(JSON.stringify({ type: 'cancel_search' }));
  const btn = document.getElementById('btn-quick-match');
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = 'Find Opponent';
  }
}

function quickMatch() {
  const btn = document.getElementById('btn-quick-match');
  if (btn && btn.textContent.includes('Searching')) cancelSearch();
  else startSearch();
}

function createFriendRoom() {
  if (!wsConnected) { toast('Connecting to server...'); return; }
  wsClient.send(JSON.stringify({
    type: 'create_room',
    mode: gameMode,
    timeControl: timeControl,
    color: prefs.friendColor || 'random'
  }));
}

function joinFriendRoom() {
  if (!wsConnected) { toast('Connecting to server...'); return; }
  const code = document.getElementById('join-code').value.trim().toUpperCase();
  if (!code) { toast('Enter a room code'); return; }
  wsClient.send(JSON.stringify({ type: 'join_room', code: code }));
}

function copyRoomCode() {
  const code = document.getElementById('room-code-display').textContent;
  if (code && code !== '----') {
    navigator.clipboard.writeText(code).then(() => toast('Copied!'));
  }
}

function cancelRoom() {
  if (wsConnected) wsClient.send(JSON.stringify({ type: 'cancel_room' }));
  document.getElementById('room-created-view').hidden = true;
  document.getElementById('friend-options-view').hidden = false;
}

function toggleChat() {
  const wrap = document.getElementById('chat-wrapper');
  if (wrap) {
    wrap.classList.toggle('open');
    if (wrap.classList.contains('open')) {
      document.getElementById('chat-input')?.focus();
    }
  }
}

function sendChat() {
  const input = document.getElementById('chat-input');
  const text = input ? input.value.trim() : '';
  if (!text) return;
  if (gameState && gameState.isMultiplayer && wsConnected) {
    wsClient.send(JSON.stringify({ type: 'chat', text: text }));
  }
  receiveChatMessage('You', text);
  if (input) input.value = '';
}

function receiveChatMessage(sender, text) {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  const d = document.createElement('div');
  d.className = 'chat-msg';
  d.innerHTML = `<span class="chat-sender">${escapeHtml(sender)}:</span> ${escapeHtml(text)}`;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
  
  if (sender !== 'You') {
    const wrap = document.getElementById('chat-wrapper');
    if (wrap && !wrap.classList.contains('open')) {
      const btn = document.getElementById('btn-chat');
      if (btn) {
        btn.style.animation = 'pulse 1s infinite';
        setTimeout(() => btn.style.animation = '', 5000);
      }
      toast(`Message from ${sender}`);
    }
  }
}


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

  const wName = isOnline
    ? (onlinePlayerColor === 'white' ? 'You' : gameState.onlineOpponent)
    : (isBot && gameState.playerColor !== 'white' ? botName : (isBot ? 'You' : 'Player 1'));
  const bName = isOnline
    ? (onlinePlayerColor === 'black' ? 'You' : gameState.onlineOpponent)
    : (isBot && gameState.playerColor !== 'black' ? botName : (isBot ? 'You' : 'Player 2'));

  const top = boardFlipped ? 'black' : 'white';
  const btm = boardFlipped ? 'white' : 'black';

  const barHTML = (col) => {
    const name = col === 'white' ? wName : bName;
    let clockHtml = '';
    if (gameState.showClocks) {
      clockHtml = `<div class="player-timer" id="clock-${col}">0:00</div>`;
    }
    return `
      <div class="player-info-left">
        <div class="player-avatar">${col === 'white' ? '♔' : '♚'}</div>
        <div class="player-name">${escapeHtml(name || 'Opponent')}</div>
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
      html += `<div class="num">${Math.floor(i / 2) + 1}.</div>
               <div class="move">${escapeHtml(gameState.moveNotation[i] || '')}</div>
               <div class="move">${escapeHtml(gameState.moveNotation[i + 1] || '')}</div>`;
    }
    moveList.innerHTML = html;
  }

  const tag = document.getElementById('game-mode-tag');
  if (tag) tag.textContent = gameState.mode === 'standard' ? 'Standard Chess' : 'Ancient Chaturanga';

  if (gameState.showClocks) updateClocks();
  updateStartHint();
}
