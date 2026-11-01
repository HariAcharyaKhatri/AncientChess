let lbData = { chaturanga: [], standard: [] };
let lbTab = 'chaturanga';

function loadLeaderboard() {
  // Simulate fetch
  setTimeout(() => {
    lbData = {
      chaturanga: [
        { rank: 1, username: 'GrandMaster', elo: 2450 },
        { rank: 2, username: 'RajaKing', elo: 2100 },
        { rank: 3, username: 'ElephantRider', elo: 1950 },
        { rank: 4, username: 'ChariotMaster', elo: 1820 },
        { rank: 5, username: 'Guest1039', elo: 1600 }
      ],
      standard: [
        { rank: 1, username: 'Magnus', elo: 2850 },
        { rank: 2, username: 'Hikaru', elo: 2790 },
        { rank: 3, username: 'Fabi', elo: 2780 },
        { rank: 4, username: 'GrandMaster', elo: 2500 },
        { rank: 5, username: 'ChessFan', elo: 1750 }
      ]
    };
    renderLB();
  }, 400);
}

function setLBTab(tab) {
  lbTab = tab;
  document.querySelectorAll('.lb-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  renderLB();
}

function renderLB() {
  const list = document.getElementById('lb-list');
  if (!list) return;
  list.innerHTML = '';
  const data = lbData[lbTab] || [];
  
  if (!data.length) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-dim);">Loading...</div>';
    return;
  }
  
  data.forEach(p => {
    const row = document.createElement('div');
    row.className = 'lb-row';
    const isMe = authUser && authUser.username === p.username;
    if (isMe) row.classList.add('me');
    
    row.innerHTML = `
      <div class="lb-rank">#${p.rank}</div>
      <div class="lb-name">${escapeHtml(p.username)}</div>
      <div class="lb-elo">${p.elo}</div>
    `;
    list.appendChild(row);
  });
}
