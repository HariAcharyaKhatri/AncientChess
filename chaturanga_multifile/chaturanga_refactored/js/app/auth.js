function checkExistingAuth() {
  const stored = localStorage.getItem('chatToken');
  if (stored) {
    authToken = stored;
    try {
      const parts = stored.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        authUser = { username: payload.username };
      }
    } catch(e) {}
  }
  updateUserHeader();
}

function updateUserHeader() {
  const pArea = document.getElementById('profile-area');
  const aArea = document.getElementById('auth-area');
  const unEl = document.getElementById('header-username');
  
  if (authUser) {
    if (aArea) aArea.style.display = 'none';
    if (pArea) pArea.style.display = 'flex';
    if (unEl) unEl.textContent = authUser.username;
  } else {
    if (pArea) pArea.style.display = 'none';
    if (aArea) aArea.style.display = 'block';
  }
}

function renderAuthArea() {
  // Can expand to handle auth screens if needed
}

function showAuthModal() {
  showOverlay(`
    <div class="overlay-content" style="max-width:320px;" onclick="event.stopPropagation()">
      <h3>Login / Register</h3>
      <p style="color:var(--text-dim);font-size:13px;margin-bottom:15px;">Create an account to track stats and appear on the leaderboard.</p>
      
      <div style="display:flex;flex-direction:column;gap:10px;">
        <input type="text" id="auth-user" class="input-field" placeholder="Username" maxlength="15">
        <input type="password" id="auth-pass" class="input-field" placeholder="Password">
      </div>
      
      <div class="flex-row mt-12">
        <button class="btn primary" style="flex:1" onclick="executeAuth('login')">Log In</button>
        <button class="btn secondary" style="flex:1" onclick="executeAuth('register')">Register</button>
      </div>
      
      <div style="margin:20px 0;text-align:center;color:var(--text-dim);font-size:12px;">OR</div>
      
      <button class="btn secondary w-full" onclick="executeGuestAuth()">Play as Guest</button>
      
      <div id="auth-error" style="color:var(--danger);font-size:13px;margin-top:10px;text-align:center;min-height:18px;"></div>
    </div>
  `);
}

function executeAuth(mode) {
  const u = document.getElementById('auth-user').value.trim();
  const p = document.getElementById('auth-pass').value.trim();
  const err = document.getElementById('auth-error');
  
  if (!u || !p) {
    err.textContent = 'Enter username and password';
    return;
  }
  
  fetch('/api/auth/' + mode, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: u, password: p })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem('chatToken', data.token);
      authToken = data.token;
      authUser = { username: u };
      updateUserHeader();
      closeOverlay();
      toast('Welcome, ' + u);
      if (wsConnected) wsClient.send(JSON.stringify({ type: 'auth', token: authToken }));
      loadStats();
    } else {
      err.textContent = data.error || 'Authentication failed';
    }
  })
  .catch(() => {
    err.textContent = 'Network error';
  });
}

function executeGuestAuth() {
  closeOverlay();
  toast('Playing as Guest');
}

function executeLogout() {
  localStorage.removeItem('chatToken');
  authToken = null;
  authUser = null;
  updateUserHeader();
  document.getElementById('profile-menu').hidden = true;
  document.getElementById('profile-chip').setAttribute('aria-expanded', 'false');
  toast('Logged out');
  if (wsConnected) {
    wsClient.close();
    setTimeout(initWebSocket, 500);
  }
}
