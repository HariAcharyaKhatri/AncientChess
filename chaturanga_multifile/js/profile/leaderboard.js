// ==========================================
// LEADERBOARD, ANALYTICS, STATS & SCREEN NAV
// ==========================================


async function loadLeaderboard() {
  const list = document.getElementById('lb-list');
  const you = document.getElementById('lb-you');
  if (!list) return;
  list.innerHTML = '<div style="color:var(--text-dim);padding:20px;text-align:center;">Loading leaderboard…</div>';
  try {
    if (window.location.protocol === 'file:' || !window.location.host) {
      throw new Error('Local offline');
    }
    const res = await fetch(`${API_BASE}/api/leaderboard?tab=${lbTab}&limit=25`);
    const json = await res.json();
    lbData = json.leaderboard || [];
    if (you) {
      you.textContent = authUser
        ? `Signed in as ${authUser.username} (ELO ${authUser.elo})`
        : 'Log in to record a persistent ELO.';
    }
    renderLB();
  } catch {
    if (you) {
      you.textContent = authUser
        ? `Signed in as ${authUser.username} (ELO ${authUser.elo})`
        : `Local Player (ELO ${persistedStats.elo}) · ${persistedStats.wins}W / ${persistedStats.losses}L`;
    }
    const userRow = {
      id: 'you',
      username: authUser ? authUser.username : 'You (Local)',
      elo: persistedStats.elo,
      wins: persistedStats.wins,
      losses: persistedStats.losses,
      win_rate: persistedStats.gamesPlayed ? Math.round((persistedStats.wins / persistedStats.gamesPlayed) * 100) : 50,
      games_played: persistedStats.gamesPlayed
    };
    lbData = [
      { id: 1, username: 'Grandmaster Bot', elo: 2600, wins: 450, losses: 12, win_rate: 97, games_played: 462 },
      { id: 2, username: 'Fidemaster Bot', elo: 2200, wins: 380, losses: 40, win_rate: 90, games_played: 420 },
      { id: 3, username: 'Master Bot', elo: 1800, wins: 290, losses: 85, win_rate: 77, games_played: 375 },
      { id: 4, username: 'Skilled Bot', elo: 1400, wins: 210, losses: 140, win_rate: 60, games_played: 350 },
      userRow
    ];
    const sortKey = lbTab === 'wins' ? 'wins' : lbTab === 'games' ? 'games_played' : 'elo';
    lbData.sort((a, b) => b[sortKey] - a[sortKey]);
    renderLB();
  }
}

function setLBTab(tab) {
  lbTab = tab;
  ['elo', 'wins', 'games'].forEach(t => {
    const b = document.getElementById('lb-tab-' + t);
    if (b) b.className = 'btn small' + (t === tab ? '' : ' secondary');
  });
  loadLeaderboard();
}

function renderLB() {
  const list = document.getElementById('lb-list');
  if (!list) return;
  if (!lbData.length) {
    list.innerHTML = '<div style="color:var(--text-dim);padding:20px;text-align:center;">No match data recorded yet.</div>';
    return;
  }
  const medals = ['🥇', '🥈', '🥉'];
  list.innerHTML = lbData.map((p, i) => {
    const rank = medals[i] || `#${i + 1}`;
    const isYou = authUser && authUser.id === p.id;
    const stat = lbTab === 'elo'
      ? `ELO ${p.elo} · ${p.wins}W-${p.losses}L (${p.win_rate}%)`
      : lbTab === 'wins'
        ? `${p.wins} wins · ELO ${p.elo}`
        : `${p.games_played} games · ELO ${p.elo}`;
    return `<div class="lb-row${isYou ? ' you' : ''}">
      <span style="display:flex;gap:10px;align-items:center;min-width:0;">
        <span style="min-width:30px;font-weight:800;">${rank}</span>
        <strong style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(p.username)}</strong>
        ${isYou ? '<span class="lb-badge">YOU</span>' : ''}
      </span>
      <span style="color:var(--text-dim);font-size:13px;white-space:nowrap;">${stat}</span>
    </div>`;
  }).join('');
}

async function showAnalyticsModal() {
  const menu = document.getElementById('profile-menu');
  if (menu) menu.hidden = true;
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation()">
      <h3>Telemetry &amp; Analytics</h3>
      <div id="analytics-content" style="color:var(--text-dim);text-align:center;padding:20px;">Fetching metrics…</div>
      <button class="btn secondary w-full mt-12" onclick="closeOverlay()">Close</button>
    </div>`);
  try {
    const res = await fetch(`${API_BASE}/api/analytics/summary`);
    const d = await res.json();
    const ac = document.getElementById('analytics-content');
    if (!ac) return;
    const openings = (d.topOpenings || [])
      .map(o => `<li>${escapeHtml(o.opening_name)}: <b>${o.count}</b></li>`).join('')
      || '<li>None yet</li>';
    ac.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;text-align:left;">
        <div style="background:rgba(0,0,0,.25);padding:10px;border-radius:6px;">
          <div style="font-size:12px;color:var(--text-dim);">Total matches</div>
          <div style="font-size:22px;font-weight:800;color:#fff;">${d.totalMatches || 0}</div>
        </div>
        <div style="background:rgba(0,0,0,.25);padding:10px;border-radius:6px;">
          <div style="font-size:12px;color:var(--text-dim);">Avg duration</div>
          <div style="font-size:22px;font-weight:800;color:var(--green);">${d.avgDurationSeconds || 0}s</div>
        </div>
      </div>
      <div style="text-align:left;">
        <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:4px;">Openings &amp; finishes</div>
        <ul style="padding-left:18px;font-size:13px;line-height:1.6;">${openings}</ul>
      </div>`;
  } catch {
    const ac = document.getElementById('analytics-content');
    if (ac) ac.textContent = 'Failed to load telemetry summary';
  }
}

function loadStats() {
  try {
    const d = JSON.parse(localStorage.getItem('chaturanga_stats') || '{}');
    persistedStats = {
      wins: d.wins || 0, losses: d.losses || 0, draws: d.draws || 0,
      elo: d.elo || 1200, gamesPlayed: d.gamesPlayed || 0,
      achievements: d.achievements || {}
    };
  } catch (e) {}
  updateStatsDisplay();
}
function saveStats(s) {
  try { localStorage.setItem('chaturanga_stats', JSON.stringify(s)); } catch (e) {}
  updateStatsDisplay();
}
function updateStatsDisplay() {
  const rapidEl = document.querySelector('.stat-card:nth-child(1) .stat-value');
  if (rapidEl) rapidEl.textContent = persistedStats.elo;
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + name);
  if (el) el.classList.add('active');
  currentScreen = name;
  document.querySelectorAll('[data-nav]').forEach(b => {
    const on = b.dataset.nav === name;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  const title = document.getElementById('topbar-title');
  if (title) title.textContent = SCREEN_TITLES[name] || '';
  if (name === 'game' && gameState && gameState.showClocks && !gameState.gameOver) startClockLoop();
  else stopClockLoop();
  if (name === 'play') drawPreview();
  if (name === 'leaderboard') loadLeaderboard();
  if (name === 'settings') renderSettings();
  if (name === 'game' && gameState) { updateUI(); resizeBoard(); drawBoard(); }
  closeOverlay();
  setTimeout(() => { try { wireFeatureLayer(); } catch (e) {} }, 30);
}

function showProfileTab(tabName) {
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  document.querySelectorAll('.profile-tab-content').forEach(c => {
    c.classList.remove('active'); c.style.display = 'none';
  });
  const activeTab = document.getElementById('tab-' + tabName);
  if (activeTab) { activeTab.classList.add('active'); activeTab.style.display = 'block'; }
}

