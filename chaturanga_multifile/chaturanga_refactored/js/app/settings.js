function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY));
    if (p) Object.assign(prefs, p);
  } catch (e) {}
  if (!prefs.botColor) prefs.botColor = 'white';
}

function savePrefs() {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  applyTheme();
  renderSettings();
}

function applyTheme() {
  const root = document.documentElement;
  const t = THEMES[prefs.theme] || THEMES.classic;
  root.style.setProperty('--board-light', t.light);
  root.style.setProperty('--board-dark', t.dark);
  drawPreview();
  if (gameState) drawBoard();
}

function applyGameMode(m) {
  gameMode = m;
  prefs.variant = m;
  savePrefs();
  document.querySelectorAll('.variant-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.variant === m);
  });
  
  const rules = document.getElementById('variant-rules');
  if (rules) {
    if (m === 'chaturanga') {
      rules.innerHTML = `
        <div style="font-weight:600;margin-bottom:5px;">Chaturanga Rules:</div>
        <ul style="padding-left:20px;font-size:13px;color:var(--text-dim);">
          <li>Mantri (Queen) moves exactly 1 square diagonally.</li>
          <li>Gaja (Bishop) jumps exactly 2 squares diagonally.</li>
          <li>No castling, no initial double pawn move.</li>
          <li>Pawns promote only to Mantri.</li>
        </ul>`;
    } else {
      rules.innerHTML = `
        <div style="font-weight:600;margin-bottom:5px;">Standard Chess:</div>
        <ul style="padding-left:20px;font-size:13px;color:var(--text-dim);">
          <li>Standard FIDE rules.</li>
          <li>Castling, en passant, double pawn move allowed.</li>
          <li>Pawns can promote to Queen, Rook, Bishop, or Knight.</li>
        </ul>`;
    }
  }
  drawPreview();
}

function renderSettings() {
  document.querySelectorAll('[data-pref]').forEach(el => {
    if (el.type === 'checkbox') {
      el.checked = !!prefs[el.dataset.pref];
      el.onchange = (e) => {
        prefs[e.target.dataset.pref] = e.target.checked;
        if (e.target.dataset.pref === 'sound') soundEnabled = e.target.checked;
        savePrefs();
      };
    } else if (el.tagName === 'SELECT') {
      el.value = prefs[el.dataset.pref];
      el.onchange = (e) => {
        prefs[e.target.dataset.pref] = e.target.value;
        savePrefs();
      };
    }
  });
}

// Time control picker
function tcLabel(tc) {
  if (tc.base === 0 && tc.inc === 0) return 'Unlimited';
  const m = Math.floor(tc.base / 60);
  const s = tc.base % 60;
  let lbl = '';
  if (m > 0) lbl += m + ' min';
  if (s > 0) lbl += (lbl ? ' ' : '') + s + ' sec';
  if (tc.inc > 0) lbl += ' | ' + tc.inc + ' sec inc';
  return lbl || '0 min';
}

function tcDescription(tc) {
  if (tc.base === 0 && tc.inc === 0) return 'No clocks, play at your own pace';
  if (tc.base <= 180) return 'Bullet / Fast Blitz';
  if (tc.base <= 600) return 'Blitz / Rapid';
  return 'Classical / Slow game';
}

function buildTimeControlDropdown() {
  const list = document.getElementById('tc-list');
  if (!list) return;
  list.innerHTML = '';
  const opts = [
    { base: 60, inc: 0 }, { base: 180, inc: 2 },
    { base: 300, inc: 0 }, { base: 300, inc: 5 },
    { base: 600, inc: 0 }, { base: 900, inc: 10 },
    { base: 1800, inc: 0 }, { base: 0, inc: 0 }
  ];
  opts.forEach(tc => {
    const div = document.createElement('div');
    div.className = 'tc-option';
    const isSel = (tc.base === timeControl.base && tc.inc === timeControl.inc);
    if (isSel) div.classList.add('selected');
    div.innerHTML = `
      <div class="tc-name">${tcLabel(tc)}</div>
      <div class="tc-desc">${tcDescription(tc)}</div>
    `;
    div.onclick = () => {
      setTimeControl(tc);
      closeTCDropdown();
    };
    list.appendChild(div);
  });
}

function setTimeControl(tc) {
  timeControl = tc;
  prefs.timeControl = tc;
  savePrefs();
  syncTCLabels();
  buildTimeControlDropdown();
}

function syncTCLabels() {
  document.querySelectorAll('.tc-selected-label').forEach(el => {
    el.textContent = tcLabel(timeControl);
  });
}

function openTCDropdown() {
  buildTimeControlDropdown();
  const dd = document.getElementById('tc-dropdown');
  const btn = document.getElementById('tc-button');
  if (dd) dd.hidden = false;
  if (btn) btn.classList.add('open');
}

function closeTCDropdown() {
  const dd = document.getElementById('tc-dropdown');
  const btn = document.getElementById('tc-button');
  if (dd) dd.hidden = true;
  if (btn) btn.classList.remove('open');
}
