// ==========================================
// FEATURE LAYER — modal wiring for every card/button
// ==========================================

const FEATURE_MAP = {
  'Courses': { icon:'📚', body:'Structured courses taught by top grandmasters and coaches.', items:['Beginner Foundations','Tactical Patterns','Endgame Mastery','Opening Repertoire'] },
  'Analysis': { icon:'🔍', body:'Analyze any position with our engine.', items:['Open analysis board','Import PGN','Engine depth: 20','Cloud evaluation: ON'] },
  'Insights': { icon:'💡', body:'Personalized analytics based on your game history.', items:['Openings performance','Tactical blunders','Time management','Endgame technique'] },
  'Classroom': { icon:'🏫', body:'Collaborative board for teachers and students.', items:['Create classroom','Join with code','Share board','Live chat'] },
  'Endgames': { icon:'♟', body:'Practice key endgame positions.', items:['Basic mates','Pawn endgames','Rook endings','Queen endings'] },
  'Practice': { icon:'🎯', body:'Drill tactical patterns from real games.', items:['Knight forks','Pin drills','Discovered attacks','Back-rank mates'] },
  'Aimchess': { icon:'🎯', body:'AI-powered personalized training plan.', items:['Weakness detection','Weekly plan','Adaptive drills','Progress tracking'] },
  'Tactics Lab': { icon:'🎯', body:'AI-powered personalized training plan and tactical analysis.', items:['Weakness detection','Weekly plan','Adaptive drills','Progress tracking'] },
  'Friends': { icon:'👥', body:'Find, follow and challenge your friends.', items:['Online friends','Friend requests','Suggested friends','Block list'] },
  'Clubs': { icon:'🛡️', body:'Join clubs, play team matches and vote chess.', items:['My Clubs','Find Clubs','Team matches','Vote chess'] },
  'Members': { icon:'🌍', body:'Search 100M+ players worldwide.', items:['Search by name','Filter by rating','Filter by country','Sort by activity'] },
  'Coaches': { icon:'🧑‍🏫', body:'Book one-on-one lessons with titled coaches.', items:['Top coaches','Book a lesson','Trial sessions','Group classes'] },
  'Top Players': { icon:'👑', body:'World champions, elite GMs and rising stars.', items:['Magnus Carlsen','Hikaru Nakamura','Fabiano Caruana','Alireza Firouzja'] },
  'Chess Ratings': { icon:'📊', body:'FIDE and Ancient Chess rating lists.', items:['FIDE Standard','FIDE Rapid','FIDE Blitz','Live ratings'] },
  'Leaderboards': { icon:'🏆', body:'Daily, weekly, and monthly leaderboards.', items:['Daily Blitz','Weekly Rapid','Monthly Bullet','Puzzle leaderboard'] },
  'Chess Today': { icon:'📰', body:'Latest chess news and events.', items:['Top stories','Tournaments','Interviews','Reviews'] },
  'News': { icon:'📰', body:'Recent tournament results and player transfers.', items:['Tata Steel 2026','Wijk aan Zee','Candidates 2026','World Championship'] },
  'Articles': { icon:'📝', body:'In-depth chess articles from our editorial team.', items:['Opening theory','Endgame studies','Player profiles','Coaching tips'] },
  'Blogs': { icon:'✍️', body:'Player-written blogs from the community.', items:['Latest posts','Trending','My drafts','Followed authors'] },
  'Forums': { icon:'💬', body:'Join the community and discuss openings.', items:['General','Openings','Analysis','Off-topic'] },
  'Lessons': { icon:'📚', body:'Interactive lessons from basic to advanced.', items:['Piece movement','Basic tactics','Opening principles','Checkmate patterns'] },
  'Openings': { icon:'📖', body:'Opening explorer with win rates.', items:["Italian Game","Sicilian Defense","Queen's Gambit","King's Indian"] },
  'Play Coach': { icon:'🧑‍🏫', body:'Play against a friendly AI coach.', items:['Undo unlimited','Get explanations','Tips after every move','No clock'] },
  'Puzzles': { icon:'🧩', body:'Daily tactical puzzles to sharpen your vision.', items:["Solve today's puzzle",'View leaderboard','History','Stats'] },
  'Daily Puzzle': { icon:'📅', body:"Solve today's puzzle — the same one everyone is solving.", items:['Difficulty: Medium','Rating: 1450','Solved by 725,660 players'] },
  'Puzzle Rush': { icon:'⚡', body:'Solve as many puzzles as you can in 3 minutes.', items:['Best score','Leaderboard','Global ranking','Streak tracking'] },
  'Puzzle Battle': { icon:'⚔️', body:'Race an opponent to solve the same puzzle.', items:['Find opponent','Arena mode','Ranked ELO','Weekly tournaments'] },
  'Custom Puzzles': { icon:'🎨', body:'Create and share your own puzzles.', items:['Create puzzle','Import FEN','Save to collection','Share link'] },
  'Titled Tuesday 2026': { icon:'🏆', body:'Weekly online elite tournament.', items:['Live round 1','Live round 2','Final standings','Highlights'] },
  'Ancient Arena 2026': { icon:'🏆', body:'Weekly online elite tournament.', items:['Live round 1','Live round 2','Final standings','Highlights'] },
  'Events': { icon:'📅', body:'Upcoming tournaments and matches.', items:['Tata Steel 2026','Candidates 2026','Grand Chess Tour','Norway Chess'] },
  'ChessTV': { icon:'📺', body:'Non-stop live chess broadcasts.', items:['Live now','Schedule','Archive','Commentators'] },
  'Streamers': { icon:'📡', body:'Watch the best chess streamers live.', items:['Witty_Alien','Sham211','Jessejames88TX','DianaMirza'] },
  'Playing Now': { icon:'🎮', body:'Live games currently in progress.', items:['Top games','Rated blitz','Bullet arena','Variants'] },
  'Collections': { icon:'📁', body:'Save games in collections for further study.', items:['My collection','Create new','Import PGN','Share collection'] },
  'Games Database': { icon:'🗄️', body:'Explore millions of master chess games.', items:['Search players','Filter by opening','Sort by year','Random game'] },
  'Chess Terms': { icon:'📖', body:'Complete glossary of chess terminology.', items:['Fork','Pin','Skewer','Zugzwang','En passant','Castling'] },
  'Rules': { icon:'📜', body:'Learn the rules — from basic moves to en passant.', items:['How pieces move','Special moves','Checkmate','Draw rules'] },
  'Explorer': { icon:'🧭', body:'Explore opening moves and see win rates.', items:['Starting position','Popular moves','Master games','Novelty stats'] },
  'Vote Chess': { icon:'🗳️', body:'Play team chess — the majority vote makes the move.', items:['Daily matches','Live vote','Team chat','Current games'] },
  'Solo Chess': { icon:'👤', body:'Clear the board by capturing every piece in the correct order.', items:['Level 1','Level 2','Level 3','Random puzzle'] },
  'Computer Championship': { icon:'🤖', body:'Watch chess engines battle for the title.', items:['Stockfish','Leela','Houdini','AlphaZero'] },
  'ChessKid': { icon:'👑', body:'Chess for kids with parental controls.', items:['Kid mode','Parental controls','Adventure mode','Play puzzles'] },
  'Junior Academy': { icon:'👑', body:'Chess for young learners with guided lessons.', items:['Junior mode','Parental controls','Adventure mode','Play puzzles'] },
  'Tools': { icon:'🛠️', body:'FEN/PGN converters, position editor and more.', items:['FEN viewer','PGN converter','Position editor','Time calculator'] },
  'Vision': { icon:'👁️', body:'Train board vision — spot knights, diagonals, ranks.', items:['Knight vision','Rank & file','Diagonal','Color of squares'] },
  'Shop / Merch': { icon:'🛍️', body:'Buy chess sets, books and merch.', items:['Chess sets','Boards','Merch','Gift cards'] },
  'Gift': { icon:'🎁', body:'Gift a membership to a friend.', items:['1 month','6 months','1 year','Custom amount'] },
  'My Clubs': { icon:'📌', body:'Your clubs — manage memberships and chat with club mates.' },
  'Find Clubs': { icon:'🔍', body:'Discover clubs by name, rating level, or theme.' },
  'Daily Matches': { icon:'⚔️', body:"Your club's ongoing daily matches." },
  'Live Matches': { icon:'🔴', body:'Live club matches happening now.' },
  'Club Vote Chess': { icon:'🗳️', body:'Participate in team vote chess.' },
  'Create a Club': { icon:'➕', body:'Start your own club.' },
  'Leagues': { icon:'🏆', body:'Club leagues with promotion and relegation.' },
  'Federations': { icon:'🌍', body:'National federations and their events.' },
  'Achievements': { icon:'🏆', body:'Your unlocked achievements and progress towards more.' },
  'Medals': { icon:'🏅', body:'Special medals earned from events and tournaments.' },
  'Badges': { icon:'🎖️', body:'Profile badges from community participation.' },
  'Cheers': { icon:'👏', body:'Cheers received from other players for good sportsmanship.' },
  'Books': { icon:'📚', body:'Your chess book collection. Read, review and share.' },
  'Passports': { icon:'📜', body:'Passports are earned by playing in different countries.' },
  'Friend Link': { icon:'🔗', body:'Share a link that adds you as a friend automatically.' },
  'Find Friends': { icon:'🔍', body:'Search by username or email to add friends.' },
  'Email Invite': { icon:'✉️', body:'Invite friends by email to join Ancient Chess.' },
  'Challenge Link': { icon:'⚔️', body:'Generate a challenge link to play anyone.' }
};
function openFeature(title, overrideIcon) {
  const info = FEATURE_MAP[title] || {};
  const icon = overrideIcon || info.icon || '✨';
  const body = info.body || `${title} — this feature is on our roadmap.`;
  const items = info.items || [];
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation()">
      <h3>${icon} ${escapeHtml(title)}</h3>
      <p style="color:var(--text-dim);line-height:1.6;margin:12px 0;">${escapeHtml(body)}</p>
      ${items.length ? `<div style="display:flex;flex-direction:column;gap:6px;">${items.map(it => `<div class="lb-row" style="cursor:default;font-size:13.5px;">${escapeHtml(it)}</div>`).join('')}</div>` : ''}
      <button class="btn primary w-full mt-12" onclick="closeOverlay()">Got it</button>
    </div>`);
}

function openStatDetail(label, value) {
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation()">
      <h3>${escapeHtml(label.replace('⏱️','').replace('⚡','').replace('🚀','').replace('🧩','').trim())} Stats</h3>
      <div style="text-align:center;margin:16px 0;">
        <div style="font-size:44px;font-weight:800;color:#fff;">${escapeHtml(value)}</div>
        <div style="color:var(--text-dim);font-size:13px;">Current rating</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div class="lb-row" style="cursor:default;"><span>Peak rating</span><strong>${parseInt(value) + 150}</strong></div>
        <div class="lb-row" style="cursor:default;"><span>Games played</span><strong>127</strong></div>
        <div class="lb-row" style="cursor:default;"><span>Win rate</span><strong style="color:var(--green);">54%</strong></div>
        <div class="lb-row" style="cursor:default;"><span>Last 7 days</span><strong>+22</strong></div>
      </div>
      <button class="btn secondary w-full mt-12" onclick="closeOverlay()">Close</button>
    </div>`);
}

function openAwardDetail(name) {
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation();" style="text-align:center;">
      <div style="font-size:56px;margin-bottom:8px;">🏆</div>
      <h3>${escapeHtml(name)}</h3>
      <p style="color:var(--text-dim);margin:12px 0;line-height:1.6;">Awarded for exceptional achievement in this category. Keep playing to unlock more!</p>
      <button class="btn secondary w-full mt-12" onclick="closeOverlay()">Close</button>
    </div>`);
}
function openBookDetail(name) {
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation();" style="text-align:center;">
      <div style="font-size:56px;margin-bottom:8px;">📖</div>
      <h3>${escapeHtml(name)}</h3>
      <p style="color:var(--text-dim);margin:12px 0;line-height:1.6;">A classic chess book, available in your library. Start reading to improve your game.</p>
      <button class="btn primary w-full" onclick="closeOverlay();toast('Opening reader…')">Open Book</button>
      <button class="btn secondary w-full mt-8" onclick="closeOverlay()">Close</button>
    </div>`);
}
function openCreateClubModal() {
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation()">
      <h3>Create a Club</h3>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">
        <div class="field-label">Club name</div>
        <input id="club-name" type="text" placeholder="e.g. Chaturanga Warriors" maxlength="40" />
        <div class="field-label">Description</div>
        <input id="club-desc" type="text" placeholder="What is your club about?" maxlength="200" />
        <button class="btn primary w-full mt-8" onclick="createClub()">Create Club</button>
        <button class="btn secondary w-full" onclick="closeOverlay()">Cancel</button>
      </div>
    </div>`);
}
function createClub() {
  const name = document.getElementById('club-name')?.value.trim();
  if (!name) { toast('Enter a club name'); return; }
  closeOverlay();
  toast(`Club "${name}" created!`);
}
function openStreamer(name, viewers) {
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation();" style="text-align:center;">
      <div style="font-size:56px;">📺</div>
      <h3>${escapeHtml(name)}</h3>
      <p style="color:var(--text-dim);margin:8px 0;">${escapeHtml(viewers)} watching now</p>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:12px;">
        <button class="btn primary" onclick="closeOverlay();toast('Opening stream…')">Watch Live</button>
        <button class="btn secondary" onclick="closeOverlay()">Close</button>
      </div>
    </div>`);
}
function openGambit() {
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation();" style="text-align:center;">
      <div style="font-size:56px;">🎮</div>
      <h3>Gambit</h3>
      <p style="color:var(--text-dim);margin:12px 0;">All the poker. None of the gambling.</p>
      <button class="btn primary w-full" onclick="closeOverlay();toast('Opening Gambit…')">Play Now</button>
      <button class="btn secondary w-full mt-8" onclick="closeOverlay()">Close</button>
    </div>`);
}
function filterGames(filter) {
  document.querySelectorAll('#tab-games .btn.small').forEach(b => {
    b.className = 'btn small ' + (b.textContent.trim() === filter ? 'primary' : 'secondary');
  });
  toast(`Filter: ${filter}`);
}
function openChallengeModal(oppName) {
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation()">
      <h3>⚔️ Challenge ${escapeHtml(oppName || 'Opponent')}</h3>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">
        <div class="field-label">Time control</div>
        <div class="seg" id="challenge-tc">
          <button data-base="60" data-inc="0">1 min</button>
          <button data-base="300" data-inc="0" class="active">5 min</button>
          <button data-base="600" data-inc="0">10 min</button>
          <button data-base="900" data-inc="10">15|10</button>
        </div>
        <button class="btn primary w-full" onclick="sendChallenge()">Send Challenge</button>
        <button class="btn secondary w-full" onclick="closeOverlay()">Cancel</button>
      </div>
    </div>`);
  const seg = document.getElementById('challenge-tc');
  if (seg) seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    seg.querySelectorAll('button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
  }));
}
function sendChallenge() {
  const active = document.querySelector('#challenge-tc button.active');
  if (active) setTimeControl(Number(active.dataset.base), Number(active.dataset.inc));
  closeOverlay();
  toast('Challenge sent');
}
function openEditProfile() {
  const currentName = document.querySelector('.profile-info h2')?.childNodes[0]?.nodeValue?.trim() || authUser?.username || 'HariAcharyakhatri';
  const currentStatus = document.querySelector('.profile-info .status-text')?.textContent || 'Enter a status here';
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation()">
      <h3>Edit Profile</h3>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div class="field-label">Display name</div>
        <input id="edit-name" type="text" value="${escapeHtml(currentName)}" />
        <div class="field-label">Status</div>
        <input id="edit-status" type="text" value="${escapeHtml(currentStatus)}" maxlength="60" />
        <div class="field-label">Country</div>
        <input id="edit-country" type="text" value="India" />
        <div class="flex-row" style="justify-content:stretch;margin-top:8px;">
          <button class="btn primary" style="flex:1;" onclick="saveEditProfile()">Save</button>
          <button class="btn secondary" style="flex:1;" onclick="closeOverlay()">Cancel</button>
        </div>
      </div>
    </div>`);
}
function saveEditProfile() {
  const name = document.getElementById('edit-name')?.value.trim();
  const status = document.getElementById('edit-status')?.value.trim();
  if (name) {
    const h2 = document.querySelector('.profile-info h2');
    if (h2 && h2.childNodes[0]) h2.childNodes[0].nodeValue = name + ' ';
  }
  if (status) {
    const statusEl = document.querySelector('.profile-info .status-text');
    if (statusEl) statusEl.textContent = status;
  }
  closeOverlay();
  toast('Profile saved');
}
function openStatusEditor() {
  const current = document.querySelector('.profile-info .status-text')?.textContent || '';
  const val = prompt('Set your status:', current);
  if (val !== null) {
    const el = document.querySelector('.profile-info .status-text');
    if (el) el.textContent = val || 'Enter a status here ✎';
    toast('Status updated');
  }
}
function openUpgradeModal() {
  showOverlay(`
    <div class="overlay-content" onclick="event.stopPropagation()">
      <h3>⭐ Upgrade to Premium</h3>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">
        <div class="lb-row" style="cursor:default;">♾️ Unlimited Puzzles</div>
        <div class="lb-row" style="cursor:default;">🎯 Advanced Insights</div>
        <div class="lb-row" style="cursor:default;">📊 Game Analysis for every game</div>
        <div class="lb-row" style="cursor:default;">🚫 No Ads</div>
        <div class="lb-row" style="cursor:default;">🏆 Premium Tournaments</div>
      </div>
      <button class="btn primary w-full mt-12" onclick="closeOverlay();toast('Premium — coming soon!')">Start Free Trial</button>
      <button class="btn ghost small w-full mt-8" onclick="closeOverlay()">Maybe Later</button>
    </div>`);
}
// ==========================================
// WIRE EVERY CLICKABLE ELEMENT ON THE PAGE
// ==========================================
function wireFeatureLayer() {
  // 1. Feature cards
  document.querySelectorAll('.feature-card').forEach(card => {
    if (card.dataset.bound) return;
    card.dataset.bound = '1';
    card.addEventListener('click', () => {
      const title = card.querySelector('h4')?.textContent?.trim() || 'Feature';
      openFeature(title);
    });
  });

  // 2. Sidebar list items
  document.querySelectorAll('.sidebar-list-item').forEach(item => {
    if (item.dataset.bound) return;
    item.dataset.bound = '1';
    item.addEventListener('click', () => {
      const raw = item.textContent.replace(/›/g, '').replace(/\s*\(\d+\)/g, '').trim();
      const key = raw.split('\n')[0].trim();
      if (key === 'Vote Chess' && item.querySelector('span')?.textContent === '🗳️') return openFeature('Club Vote Chess');
      openFeature(key);
    });
  });

  // 3. Stat cards
  document.querySelectorAll('.stat-card').forEach(card => {
    if (card.dataset.bound) return;
    card.dataset.bound = '1';
    card.addEventListener('click', () => {
      const label = card.querySelector('.stat-header span')?.textContent || 'Rating';
      const value = card.querySelector('.stat-value')?.textContent || '—';
      openStatDetail(label, value);
    });
  });

  // 4. Award cards
  document.querySelectorAll('.award-card').forEach(card => {
    if (card.dataset.bound) return;
    card.dataset.bound = '1';
    card.addEventListener('click', () => {
      const name = card.querySelector('.award-name')?.textContent?.trim() || 'Award';
      const isBook = card.querySelector('div[style*="aspect-ratio"]');
      if (isBook) openBookDetail(name);
      else openAwardDetail(name);
    });
  });

  // 5. Edit profile button
  const editBtn = Array.from(document.querySelectorAll('.profile-header-card button'))
    .find(b => b.textContent.includes('Edit Profile'));
  if (editBtn && !editBtn.dataset.bound) {
    editBtn.dataset.bound = '1';
    editBtn.addEventListener('click', openEditProfile);
  }

  // 6. Status text
  const statusEl = document.querySelector('.profile-info .status-text');
  if (statusEl && !statusEl.dataset.bound) {
    statusEl.dataset.bound = '1';
    statusEl.addEventListener('click', openStatusEditor);
  }

  // 7. Buttons by text content
  document.querySelectorAll('.btn').forEach(btn => {
    if (btn.dataset.bound) return;
    const t = btn.textContent.trim();
    if (t === 'Solve Daily Puzzle') { btn.dataset.bound = '1'; btn.addEventListener('click', () => openPuzzleTrainer('daily')); }
    else if (t === 'Challenge') { btn.dataset.bound = '1'; btn.addEventListener('click', () => openChallengeModal()); }
    else if (t === 'Play Now!') { btn.dataset.bound = '1'; btn.addEventListener('click', openGambit); }
    else if (t === 'Create a Club' || t === 'Create Club') { btn.dataset.bound = '1'; btn.addEventListener('click', openCreateClubModal); }
    else if (t.includes('Upgrade for Advanced Stats')) { btn.dataset.bound = '1'; btn.addEventListener('click', openUpgradeModal); }
    else if (t === 'See All →') {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        const sibling = btn.previousElementSibling;
        const label = sibling?.textContent?.trim() || '';
        openFeature(label.includes('Books') ? 'Books' : 'Achievements');
      });
    }
  });

  // 8. Upgrade nav button
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.textContent.includes('Upgrade') && !item.dataset.bound) {
      item.dataset.bound = '1';
      item.addEventListener('click', (e) => { e.stopPropagation(); openUpgradeModal(); });
    }
  });

  // 9. Game filters
  document.querySelectorAll('#tab-games .btn.small').forEach(btn => {
    if (btn.dataset.bound) return;
    if (['All','Favorites','Live','Daily','Bot','Coach'].includes(btn.textContent.trim())) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => filterGames(btn.textContent.trim()));
    }
  });

  // 10. View All
  document.querySelectorAll('.card button').forEach(btn => {
    if (btn.textContent.trim() === 'View All' && !btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => { showScreen('profile'); showProfileTab('games'); });
    }
  });

  // 11. Home time control chips
  document.querySelectorAll('.card button.btn.small').forEach(btn => {
    const t = btn.textContent.trim();
    if (['10 min','2 + 1','5 min','3 min'].includes(t) && !btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        let base = 600, inc = 0;
        if (t === '10 min') { base = 600; inc = 0; }
        if (t === '5 min') { base = 300; inc = 0; }
        if (t === '3 min') { base = 180; inc = 0; }
        if (t === '2 + 1') { base = 120; inc = 1; }
        setTimeControl(base, inc);
        document.querySelectorAll('.card button.btn.small').forEach(b => {
          if (['10 min','2 + 1','5 min','3 min'].includes(b.textContent.trim())) b.className = 'btn small secondary';
        });
        btn.className = 'btn small primary';
        toast(`Time control: ${t}`);
      });
    }
  });

  // 12. Daily-games Play
  document.querySelectorAll('#tab-overview .btn.primary.small').forEach(btn => {
    if (btn.textContent.trim() === 'Play' && !btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => showScreen('play'));
    }
  });

  // 13. Game history items
  document.querySelectorAll('.game-list-item').forEach(item => {
    if (item.dataset.bound) return;
    item.dataset.bound = '1';
    item.addEventListener('click', () => {
      showOverlay(`
        <div class="overlay-content" onclick="event.stopPropagation();">
          <h3>Game Review</h3>
          <div class="lb-row" style="cursor:default;"><span>Lozzarov (539)</span><strong>⚡ -7</strong></div>
          <div class="lb-row" style="cursor:default;"><span>HariAcharyakhatri (691)</span><strong>⚡ +7</strong></div>
          <div class="lb-row" style="cursor:default;"><span>Result</span><strong style="color:var(--danger);">0 - 1</strong></div>
          <div class="lb-row" style="cursor:default;"><span>Opening</span><strong>Scandinavian</strong></div>
          <div class="lb-row" style="cursor:default;"><span>Accuracy</span><strong>72.6%</strong></div>
          <div class="lb-row" style="cursor:default;"><span>Moves</span><strong>37</strong></div>
          <button class="btn primary w-full mt-12" onclick="closeOverlay();toast('Opening analysis…')">Analyze Game</button>
          <button class="btn secondary w-full mt-8" onclick="closeOverlay()">Close</button>
        </div>`);
    });
  });

  // 14. Streamers
  document.querySelectorAll('.streamer-item').forEach(item => {
    if (item.dataset.bound) return;
    item.dataset.bound = '1';
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      const name = item.querySelector('div[style*="font-weight:700"]')?.textContent || 'Streamer';
      const viewers = item.querySelector('div[style*="font-size:12px"]')?.textContent || '';
      openStreamer(name, viewers);
    });
  });

  // 15. Live events
  document.querySelectorAll('[style*="min-width:200px"]').forEach(el => {
    if (el.dataset.bound) return;
    el.dataset.bound = '1';
    el.addEventListener('click', () => openFeature(el.querySelector('div')?.textContent || 'Event'));
  });

  // 16. Puzzle board
  const pb = document.getElementById('puzzle-board');
  if (pb && !pb.dataset.bound) {
    pb.dataset.bound = '1';
    pb.addEventListener('click', puzzleClick);
    pb.addEventListener('touchstart', (e) => { e.preventDefault(); puzzleClick(e); }, { passive: false });
  }

  // 17. Search inputs
  const gamesSearch = document.getElementById('games-search');
  if (gamesSearch && !gamesSearch.dataset.bound) {
    gamesSearch.dataset.bound = '1';
    gamesSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.game-list-item').forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }
  ['friends-search','clubs-search'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.bound) {
      el.dataset.bound = '1';
      el.addEventListener('input', () => toast(`Searching ${id.startsWith('friends') ? 'friends' : 'clubs'}…`));
    }
  });

  // 18. Leaderboard rows
  document.querySelectorAll('.lb-row').forEach(row => {
    if (row.dataset.bound) return;
    row.dataset.bound = '1';
    row.addEventListener('click', () => {
      const name = row.querySelector('strong')?.textContent || '';
      if (!name) return;
      showOverlay(`
        <div class="overlay-content" onclick="event.stopPropagation();">
          <h3>${escapeHtml(name)}</h3>
          <button class="btn primary w-full mt-12" onclick="closeOverlay();openChallengeModal('${escapeHtml(name)}')">Challenge</button>
          <button class="btn secondary w-full mt-8" onclick="closeOverlay()">Close</button>
        </div>`);
    });
  });

  // 19. Lesson nodes
  document.querySelectorAll('.lesson-node').forEach((node, i) => {
    if (node.dataset.bound) return;
    node.dataset.bound = '1';
    node.addEventListener('click', () => {
      const piece = node.textContent.trim();
      showOverlay(`
        <div class="overlay-content" onclick="event.stopPropagation();" style="text-align:center;">
          <div style="font-size:56px;margin-bottom:8px;">${escapeHtml(piece)}</div>
          <h3>Lesson ${i + 1}</h3>
          <p style="color:var(--text-dim);margin:12px 0;">Learn the ${piece === '♟' ? 'pawn' : piece === '♞' ? 'knight' : piece === '♝' ? 'bishop' : piece === '♜' ? 'rook' : 'queen'} — movement, captures, and key tactical ideas.</p>
          <button class="btn primary w-full" onclick="closeOverlay();toast('Starting lesson…')">Start Lesson</button>
          <button class="btn secondary w-full mt-8" onclick="closeOverlay()">Close</button>
        </div>`);
    });
  });

  // 20. Explore Courses
  document.querySelectorAll('.btn.primary.w-full').forEach(btn => {
    if (btn.textContent.trim() === 'Explore Courses' && !btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => openFeature('Courses'));
    }
  });
}
// ==========================================
// FULL INIT — this is the single entry point
// ==========================================
function init() {
  loadPrefs();
  soundEnabled = prefs.sound;
  timeControl = { base: prefs.timeControl.base, inc: prefs.timeControl.inc };
  gameMode = prefs.variant === 'chaturanga' ? 'chaturanga' : 'standard';

  // ── Profile tabs
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => showProfileTab(tab.dataset.tab));
  });

  // ── Nav
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nav = btn.dataset.nav;
      if (nav) showScreen(nav);
    });
  });

  // ── Variant buttons
  document.querySelectorAll('.variant-btn').forEach(btn => {
    btn.addEventListener('click', () => applyGameMode(btn.dataset.variant));
  });

  // ── Mode tabs
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => setModeTab(btn.dataset.mode));
  });

  // ── TC dropdown toggle
  const tcBtn = document.getElementById('tc-button');
  if (tcBtn) tcBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const dd = document.getElementById('tc-dropdown');
    if (dd && dd.hidden) openTCDropdown(); else closeTCDropdown();
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tc-wrap')) closeTCDropdown();
  });

  // ── Play wiring
  document.getElementById('btn-quick-match')?.addEventListener('click', quickMatch);
  document.getElementById('btn-play-friend')?.addEventListener('click', () => {
    const panel = document.getElementById('friend-panel');
    const btn = document.getElementById('btn-play-friend');
    if (!panel) return;
    const open = panel.hidden;
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('#friend-color button').forEach(b => {
    b.addEventListener('click', () => setFriendColor(b.dataset.color));
  });
  document.getElementById('btn-create-room')?.addEventListener('click', createFriendRoom);
  document.getElementById('btn-join-code')?.addEventListener('click', joinFriendRoom);
  document.getElementById('join-code')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') joinFriendRoom();
  });
  document.getElementById('btn-copy-room')?.addEventListener('click', copyRoomCode);
  document.getElementById('btn-cancel-room')?.addEventListener('click', cancelRoom);

  // ── Bot grid & color
  renderBotGrid();
  document.querySelectorAll('#bot-color button').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#bot-color button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      prefs.botColor = b.dataset.color;
      savePrefs();
    });
  });
  document.getElementById('btn-start-bot')?.addEventListener('click', () => {
    if (!selectedBot) { toast('Pick an opponent first'); return; }
    const colorBtn = document.querySelector('#bot-color button.active');
    startVsBot(selectedBot, colorBtn ? colorBtn.dataset.color : 'white');
  });
  document.getElementById('btn-start-local')?.addEventListener('click', startLocal2Player);

  // ── Settings
  document.getElementById('btn-settings-auth')?.addEventListener('click', showAuthModal);
  document.getElementById('btn-reset-stats')?.addEventListener('click', resetLocalStats);

  // ── In-game actions
  document.getElementById('btn-game-draw')?.addEventListener('click', offerDraw);
  document.getElementById('btn-game-resign')?.addEventListener('click', confirmResign);

  // ── Profile chip dropdown
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('#profile-chip');
    const menu = document.getElementById('profile-menu');
    if (chip && menu) {
      menu.hidden = !menu.hidden;
      chip.setAttribute('aria-expanded', String(!menu.hidden));
      return;
    }
    if (menu && !menu.hidden && !e.target.closest('#profile-menu')) menu.hidden = true;
  });

  // ── Board canvas events
  const canvas = getCanvas();
  if (canvas) {
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('touchstart', e => { e.preventDefault(); handlePointerDown(e); }, { passive: false });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  // ── Visual / state init
  applyGameMode(gameMode);
  applyTheme(prefs.boardTheme);
  syncTCLabels();
  buildTimeControlDropdown();
  renderSettings();

  const assist = document.getElementById('assist-toggle');
  if (assist) assist.checked = !!prefs.assist;
  const flip = document.getElementById('flip-toggle');
  if (flip) flip.checked = !!prefs.flipLocal;

  const colorBtn = document.querySelector(`#bot-color button[data-color="${prefs.botColor}"]`);
  if (colorBtn) {
    document.querySelectorAll('#bot-color button').forEach(x => x.classList.remove('active'));
    colorBtn.classList.add('active');
  }

  loadStats();
  renderAuthArea();
  resizeBoard();
  drawPreview();
  showScreen('profile');

  // ── Preload SVG pieces AFTER prefs are loaded
  try { preloadPieceImages(); } catch (e) {}

  // ── Network
  initWebSocket();
  checkExistingAuth();

  // ── Feature layer
  try { wireFeatureLayer(); } catch (e) { console.warn('Feature wiring error:', e); }

  // ── Announcement
  setTimeout(() => toast('Welcome to Ancient Chess'), 400);
}
