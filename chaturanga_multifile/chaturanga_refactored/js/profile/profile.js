function showAnalyticsModal() {
  const isOnline = !!authUser;
  const s = persistedStats;
  const wr = s.gamesPlayed ? Math.round((s.wins / s.gamesPlayed) * 100) : 0;
  
  showOverlay(`
    <div class="overlay-content" style="max-width:380px;" onclick="event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h3>My Analytics</h3>
        ${!isOnline ? '<span class="badge" style="background:#555">Local Mode</span>' : ''}
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-val">${s.elo}</div>
          <div class="stat-label">Rating</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${s.gamesPlayed}</div>
          <div class="stat-label">Games</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${wr}%</div>
          <div class="stat-label">Win Rate</div>
        </div>
      </div>
      
      <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;margin-top:20px;background:var(--surface);">
        <div style="width:${s.gamesPlayed ? (s.wins/s.gamesPlayed)*100 : 0}%;background:#739552;" title="Wins: ${s.wins}"></div>
        <div style="width:${s.gamesPlayed ? (s.draws/s.gamesPlayed)*100 : 0}%;background:#999;" title="Draws: ${s.draws}"></div>
        <div style="width:${s.gamesPlayed ? (s.losses/s.gamesPlayed)*100 : 0}%;background:#e74c3c;" title="Losses: ${s.losses}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-dim);margin-top:6px;">
        <span>${s.wins} W</span>
        <span>${s.draws} D</span>
        <span>${s.losses} L</span>
      </div>
      
      <button class="btn secondary w-full mt-12" onclick="closeOverlay()">Close</button>
    </div>
  `);
}

function loadStats() {
  if (authUser) {
    // Fetch from server
    fetch('/api/stats', { headers: { 'Authorization': 'Bearer ' + authToken } })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (data) {
        persistedStats = data;
        updateStatsDisplay();
      }
    })
    .catch(() => loadLocalStats());
  } else {
    loadLocalStats();
  }
}

function loadLocalStats() {
  try {
    const s = JSON.parse(localStorage.getItem('chatStats'));
    if (s) Object.assign(persistedStats, s);
  } catch (e) {}
  updateStatsDisplay();
}

function saveStats(statsObj) {
  if (authUser) {
    // In a real app we'd push to server. Here we just assume server sent it down.
  } else {
    localStorage.setItem('chatStats', JSON.stringify(statsObj));
  }
  updateStatsDisplay();
}

function updateStatsDisplay() {
  const eloSpan = document.getElementById('header-elo');
  if (eloSpan) eloSpan.textContent = persistedStats.elo;
}

function resetLocalStats() {
  if (confirm('Reset your local game statistics? (Online stats are unaffected)')) {
    persistedStats = { elo: 1200, gamesPlayed: 0, wins: 0, losses: 0, draws: 0 };
    localStorage.removeItem('chatStats');
    updateStatsDisplay();
    toast('Local stats reset');
  }
}
