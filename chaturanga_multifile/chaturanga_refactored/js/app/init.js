function init() {
  loadPrefs();
  soundEnabled = prefs.sound;
  timeControl = { base: prefs.timeControl.base, inc: prefs.timeControl.inc };
  gameMode = prefs.variant === 'chaturanga' ? 'chaturanga' : 'standard';

  // Setup Profile Tabs
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => showProfileTab(tab.dataset.tab));
  });

  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nav = btn.dataset.nav;
      if (nav) showScreen(nav);
    });
  });
  document.querySelectorAll('.variant-btn').forEach(btn => {
    btn.addEventListener('click', () => applyGameMode(btn.dataset.variant));
  });
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => setModeTab(btn.dataset.mode));
  });

  const tcBtn = document.getElementById('tc-button');
  if (tcBtn) tcBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const dd = document.getElementById('tc-dropdown');
    if (dd && dd.hidden) openTCDropdown(); else closeTCDropdown();
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tc-wrap')) closeTCDropdown();
  });

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

  document.getElementById('btn-settings-auth')?.addEventListener('click', showAuthModal);
  document.getElementById('btn-reset-stats')?.addEventListener('click', resetLocalStats);

  document.getElementById('btn-game-draw')?.addEventListener('click', offerDraw);
  document.getElementById('btn-game-resign')?.addEventListener('click', confirmResign);

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

  const canvas = getCanvas();
  if (canvas) {
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('touchstart', e => { e.preventDefault(); handlePointerDown(e); }, { passive: false });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }
  
  window.addEventListener('resize', onResize);
  onResize();
  
  checkExistingAuth();
  loadStats();
  syncTCLabels();
  updateUserHeader();
  
  showScreen('play');
  
  // initWebSocket() is probably supposed to be called here or conditionally? 
  // Wait, let's look back to see if initWebSocket was called on load
  initWebSocket();
}

window.addEventListener('DOMContentLoaded', init);
