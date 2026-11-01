// ==========================================
// PREFERENCES, AUTH, BOT GRID, SETTINGS, PLAY WIRING
// ==========================================

function loadPrefs() {
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
    prefs = Object.assign({}, DEFAULT_PREFS, raw);
    prefs.timeControl = Object.assign({}, DEFAULT_PREFS.timeControl, raw.timeControl || {});
  } catch (e) { prefs = JSON.parse(JSON.stringify(DEFAULT_PREFS)); }
}
function savePrefs() {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {}
}

async function checkExistingAuth() {
  const token = localStorage.getItem('chaturanga_token');
  if (!token) { renderAuthArea(); return; }
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      authUser = data.user;
      updateUserHeader();
    } else { renderAuthArea(); }
  } catch { renderAuthArea(); }
}
function updateUserHeader() {
  if (!authUser) { renderAuthArea(); return; }
  persistedStats.elo = authUser.elo ?? persistedStats.elo;
  persistedStats.wins = authUser.wins ?? persistedStats.wins;
  persistedStats.losses = authUser.losses ?? persistedStats.losses;
  persistedStats.draws = authUser.draws ?? persistedStats.draws;
  persistedStats.gamesPlayed = authUser.games_played ?? persistedStats.gamesPlayed;
  updateStatsDisplay();
  renderAuthArea();
}
function renderAuthArea() {
  const el = document.getElementById('auth-area');
  if (!el) return;
  if (authUser) {
    const initial = escapeHtml((authUser.username || '?').charAt(0).toUpperCase());
    el.innerHTML = `
      <button class="profile-chip" id="profile-chip" aria-haspopup="true" aria-expanded="false"
              style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);border:none;color:#fff;padding:6px 12px 6px 6px;border-radius:20px;cursor:pointer;font-family:inherit;">
        <span class="avatar" style="width:32px;height:32px;background:var(--green);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;">${initial}</span>
        <span class="profile-meta" style="display:flex;flex-direction:column;line-height:1.2;text-align:left;">
          <strong style="font-size:13px;">${escapeHtml(authUser.username)}</strong>
          <small style="font-size:11px;color:var(--text-dim);">ELO ${authUser.elo}</small>
        </span>
      </button>
      <div class="profile-menu" id="profile-menu" hidden
           style="position:absolute;top:100%;right:0;background:var(--bg-elev);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:6px;box-shadow:var(--shadow-lg);min-width:200px;z-index:60;margin-top:6px;">
        <button class="menu-item" onclick="showAnalyticsModal()"
                style="display:flex;gap:8px;width:100%;padding:8px 10px;background:none;border:none;color:#fff;font-family:inherit;font-size:13px;text-align:left;cursor:pointer;border-radius:6px;">Telemetry &amp; Analytics</button>
        <button class="menu-item" onclick="showScreen('profile')"
                style="display:flex;gap:8px;width:100%;padding:8px 10px;background:none;border:none;color:#fff;font-family:inherit;font-size:13px;text-align:left;cursor:pointer;border-radius:6px;">View Profile</button>
        <button class="menu-item" onclick="openEditProfile()"
                style="display:flex;gap:8px;width:100%;padding:8px 10px;background:none;border:none;color:#fff;font-family:inherit;font-size:13px;text-align:left;cursor:pointer;border-radius:6px;">Edit Profile</button>
        <button class="menu-item" onclick="executeLogout()"
                style="display:flex;gap:8px;width:100%;padding:8px 10px;background:none;border:none;color:#fff;font-family:inherit;font-size:13px;text-align:left;cursor:pointer;border-radius:6px;">Log out</button>
      </div>`;
  } else {
    el.innerHTML = `
      <button class="btn secondary small" onclick="showAuthModal()">Log In</button>
      <button class="btn primary small" onclick="showAuthModal()">Sign Up</button>`;
  }
}

function showAuthModal() {
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation()">
      <h3>${authUser ? 'Profile' : 'Account'}</h3>
      ${authUser ? `
        <div style="text-align:center;margin-bottom:16px;">
          <div style="font-size:22px;font-weight:800;color:#fff;">${escapeHtml(authUser.username)}</div>
          <div style="color:var(--green);font-size:18px;font-weight:800;margin-top:4px;">ELO ${authUser.elo}</div>
          <div style="color:var(--text-dim);font-size:14px;margin-top:6px;">${authUser.wins}W · ${authUser.losses}L · ${authUser.draws}D</div>
        </div>
        <button class="btn secondary w-full" onclick="executeLogout()">Log out</button>
      ` : `
        <div style="display:flex;flex-direction:column;gap:10px;">
          <input id="auth-user" type="text" placeholder="Username" autocomplete="username" />
          <input id="auth-pass" type="password" placeholder="Password" autocomplete="current-password" />
          <div class="flex-row" style="justify-content:stretch;">
            <button class="btn primary" style="flex:1;" onclick="executeAuth('login')">Log In</button>
            <button class="btn secondary" style="flex:1;" onclick="executeAuth('register')">Register</button>
          </div>
          <button class="btn ghost small" onclick="executeGuestAuth()">Play as Guest</button>
        </div>
      `}
      <button class="btn secondary small w-full mt-12" onclick="closeOverlay()">Close</button>
    </div>`);
}

async function executeAuth(mode) {
  const u = document.getElementById('auth-user')?.value.trim();
  const p = document.getElementById('auth-pass')?.value;
  if (!u || !p) { toast('Please fill both fields'); return; }
  try {
    const res = await fetch(`${API_BASE}/api/auth/${mode}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if (!res.ok) { toast(`⚠️ ${data.error || 'Auth failed'}`); return; }
    authUser = data.user;
    localStorage.setItem('chaturanga_token', authUser.token);
    if (wsClient && wsConnected) wsClient.send(JSON.stringify({ type: 'auth', token: authUser.token }));
    updateUserHeader(); closeOverlay();
    toast(`Welcome, ${authUser.username}!`);
  } catch { toast('Network error connecting to backend'); }
}

async function executeGuestAuth() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/guest`, { method: 'POST' });
    const data = await res.json();
    authUser = data.user;
    localStorage.setItem('chaturanga_token', authUser.token);
    if (wsClient && wsConnected) wsClient.send(JSON.stringify({ type: 'auth', token: authUser.token }));
    updateUserHeader(); closeOverlay();
    toast(`Logged in as ${authUser.username}`);
  } catch { toast('Guest login unavailable'); }
}

function executeLogout() {
  authUser = null;
  localStorage.removeItem('chaturanga_token');
  closeOverlay();
  renderAuthArea();
  toast('Logged out');
}

function renderBotGrid() {
  const grid = document.getElementById('bot-grid');
  if (!grid) return;
  grid.innerHTML = Object.entries(BOT_CONFIGS).map(([key, cfg]) => `
    <button class="bot-card" data-bot="${key}" aria-pressed="false">
      <span class="bot-avatar">${BOT_ICON}</span>
      <span class="bot-meta"><strong>${escapeHtml(cfg.name)}</strong><small>ELO ${cfg.elo}</small></span>
    </button>`).join('');
  grid.querySelectorAll('.bot-card').forEach(card => {
    card.addEventListener('click', () => selectBot(card.dataset.bot));
  });
}
function selectBot(key) {
  selectedBot = key;
  document.querySelectorAll('.bot-card').forEach(c => {
    const on = c.dataset.bot === key;
    c.classList.toggle('active', on);
    c.setAttribute('aria-pressed', String(on));
  });
  const setup = document.getElementById('bot-setup');
  if (setup) setup.hidden = false;
  const hint = document.getElementById('bot-hint');
  if (hint) hint.textContent = `Playing ${BOT_CONFIGS[key].name} — ${BOT_CONFIGS[key].desc}. No clock.`;
}

function applyTheme(name) {
  const t = THEMES[name] || THEMES.green;
  prefs.boardTheme = name;
  document.documentElement.style.setProperty('--board-light', t.light);
  document.documentElement.style.setProperty('--board-dark', t.dark);
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === name));
  drawPreview();
  if (gameState) drawBoard();
}
function applyGameMode(mode) {
  gameMode = mode; prefs.variant = mode; savePrefs();
  document.querySelectorAll('.variant-btn').forEach(b => {
    const on = b.dataset.variant === mode;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
  });
  const tag = document.getElementById('game-mode-tag');
  if (tag) tag.textContent = mode === 'standard' ? 'Standard Chess' : 'Ancient Chaturanga';
  drawPreview();
}

function renderSettings() {
  const tb = document.getElementById('theme-buttons');
  if (tb) {
    tb.innerHTML = '';
    Object.entries(THEMES).forEach(([k, v]) => {
      const b = document.createElement('button');
      b.className = 'theme-btn' + (k === prefs.boardTheme ? ' active' : '');
      b.dataset.theme = k;
      b.innerHTML = `<span class="theme-swatch" style="background:${v.light};border:1px solid ${v.dark};"></span>${v.name}`;
      b.addEventListener('click', () => applyTheme(k));
      tb.appendChild(b);
    });
  }
  const pb = document.getElementById('piece-theme-buttons');
  if (pb) {
    pb.innerHTML = '';
    const pieceSets = [
      { id: 'cburnett', name: 'Neo (Cburnett)' },
      { id: 'staunty',  name: 'Staunty' },
      { id: 'kosal',    name: 'Kosal Classic' }
    ];
    pieceSets.forEach(set => {
      const b = document.createElement('button');
      b.className = 'theme-btn' + (set.id === (prefs.pieceTheme || 'cburnett') ? ' active' : '');
      b.dataset.pieceTheme = set.id;
      b.innerHTML = `<img src="assets/images/pieces-${set.id}/wN.svg" style="width:22px;height:22px;object-fit:contain;" /> ${set.name}`;
      b.addEventListener('click', () => {
        prefs.pieceTheme = set.id; savePrefs();
        document.querySelectorAll('#piece-theme-buttons .theme-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.pieceTheme === set.id);
        });
        if (typeof preloadPieceImages === 'function') preloadPieceImages();
        if (gameState) drawBoard();
        drawPreview();
        toast(`Piece style: ${set.name}`);
      });
      pb.appendChild(b);
    });
  }
  const bind = (id, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.checked = !!prefs[key];
    el.onchange = () => {
      prefs[key] = el.checked;
      if (key === 'sound') soundEnabled = el.checked;
      savePrefs();
      if (gameState) drawBoard();
    };
  };
  bind('pref-sound', 'sound'); bind('pref-legal', 'highlightLegal');
  bind('pref-last', 'highlightLast'); bind('pref-coords', 'showCoords');
  bind('pref-autopromo', 'autoPromote'); bind('pref-confirmresign', 'confirmResign');
}
function resetLocalStats() {
  if (!confirm('Reset all local stats?')) return;
  localStorage.removeItem('chaturanga_stats');
  persistedStats = { wins: 0, losses: 0, draws: 0, elo: 1200, gamesPlayed: 0, achievements: {} };
  toast('Local stats reset');
}

function setModeTab(mode) {
  document.querySelectorAll('.mode-tab').forEach(t => {
    const on = t.dataset.mode === mode;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', String(on));
  });
  document.querySelectorAll('.panel-section').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + mode);
  if (panel) panel.classList.add('active');
}
function setFriendColor(color) {
  friendColor = color;
  document.querySelectorAll('#friend-color button').forEach(b => b.classList.toggle('active', b.dataset.color === color));
}

function startSearch() {
  const ov = document.getElementById('search-overlay');
  const sub = document.getElementById('search-sub');
  if (sub) sub.textContent = tcDescription();
  if (ov) ov.hidden = false;
  searchStart = Date.now();
  const el = document.getElementById('search-elapsed');
  clearInterval(searchInterval);
  searchInterval = setInterval(() => {
    const s = Math.floor((Date.now() - searchStart) / 1000);
    if (el) el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }, 250);
}
function hideSearch() {
  clearInterval(searchInterval); searchInterval = null;
  const ov = document.getElementById('search-overlay');
  if (ov) ov.hidden = true;
}
function cancelSearch() {
  hideSearch();
  if (wsConnected && wsClient) wsClient.send(JSON.stringify({ type: 'cancel_matchmaking' }));
  toast('Search cancelled');
}
function showRoomWaiting(code) {
  const panel = document.getElementById('friend-panel');
  const waiting = document.getElementById('friend-waiting');
  const codeEl = document.getElementById('room-code');
  if (panel) panel.hidden = true;
  if (waiting) waiting.hidden = false;
  if (codeEl) codeEl.textContent = code;
}
function hideRoomWaiting() {
  const panel = document.getElementById('friend-panel');
  const waiting = document.getElementById('friend-waiting');
  if (waiting) waiting.hidden = true;
  if (panel) panel.hidden = true;
}
function quickMatch() {
  if (!wsConnected) { toast('Connecting to server… please wait'); return; }
  startSearch();
  wsClient.send(JSON.stringify({
    type: 'matchmaking_queue', mode: gameMode,
    timeControl: { base: timeControl.base, inc: timeControl.inc }
  }));
}
function createFriendRoom() {
  if (!wsConnected) { toast('Connecting to server… please wait'); return; }
  const code = 'room' + Math.random().toString(36).slice(2, 7);
  wsClient.send(JSON.stringify({
    type: 'create_room', roomCode: code, mode: gameMode,
    timeControl: { base: timeControl.base, inc: timeControl.inc }, color: friendColor
  }));
}
function joinFriendRoom() {
  if (!wsConnected) { toast('Connecting to server… please wait'); return; }
  const input = document.getElementById('join-code');
  const code = (input?.value || '').trim();
  if (!code) { toast('Enter a room code'); return; }
  wsClient.send(JSON.stringify({ type: 'join_room', roomCode: code }));
}
function cancelRoom() {
  hideRoomWaiting();
  if (wsConnected && wsClient) wsClient.send(JSON.stringify({ type: 'cancel_room' }));
  toast('Room closed');
}
function copyRoomCode() {
  const code = document.getElementById('room-code')?.textContent || '';
  if (!code || code === '—') return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(code).then(
      () => toast('Room code copied'),
      () => toast('Copy failed')
    );
  } else toast('Copy not supported');
}

function buildTimeControlDropdown() {
  const dd = document.getElementById('tc-dropdown');
  if (!dd) return;
  let html = '';
  Object.entries(TIME_GROUPS).forEach(([group, items]) => {
    html += `<div class="tc-group-title">${group}</div><div class="tc-chips">`;
    items.forEach(([label, base, inc]) => {
      const active = timeControl.base === base && timeControl.inc === inc;
      html += `<button class="tc-chip${active ? ' active' : ''}" data-base="${base}" data-inc="${inc}" role="option" aria-selected="${active}">${label}</button>`;
    });
    html += `</div>`;
  });
  html += `
    <div class="tc-group-title">Custom</div>
    <div class="tc-custom">
      <label>Minutes<input type="number" id="tc-min" min="1" max="180" value="${Math.round(timeControl.base / 60)}" /></label>
      <label>Increment<input type="number" id="tc-inc" min="0" max="60" value="${timeControl.inc}" /></label>
      <button class="btn small primary" id="tc-apply">Set</button>
    </div>`;
  dd.innerHTML = html;
  dd.querySelectorAll('.tc-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeControl(Number(btn.dataset.base), Number(btn.dataset.inc));
      closeTCDropdown();
    });
  });
  const apply = document.getElementById('tc-apply');
  if (apply) apply.addEventListener('click', () => {
    const m = Math.max(1, Math.min(180, Number(document.getElementById('tc-min').value) || 10));
    const i = Math.max(0, Math.min(60, Number(document.getElementById('tc-inc').value) || 0));
    setTimeControl(m * 60, i);
    closeTCDropdown();
  });
}
function setTimeControl(base, inc) {
  timeControl = { base, inc };
  prefs.timeControl = { base, inc };
  savePrefs();
  syncTCLabels();
  buildTimeControlDropdown();
}
function syncTCLabels() {
  const label = document.getElementById('tc-label');
  if (label) label.textContent = tcLabel(timeControl.base, timeControl.inc);
  const fLabel = document.getElementById('friend-tc-label');
  if (fLabel) fLabel.textContent = tcLabel(timeControl.base, timeControl.inc);
}
function openTCDropdown() {
  const btn = document.getElementById('tc-button');
  const dd = document.getElementById('tc-dropdown');
  if (!btn || !dd) return;
  buildTimeControlDropdown();
  dd.hidden = false;
  btn.setAttribute('aria-expanded', 'true');
}
function closeTCDropdown() {
  const btn = document.getElementById('tc-button');
  const dd = document.getElementById('tc-dropdown');
  if (!btn || !dd) return;
  dd.hidden = true;
  btn.setAttribute('aria-expanded', 'false');
}
