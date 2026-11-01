// ==========================================
// CORE UTILITIES
// ==========================================

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = String(str == null ? '' : str);
  return d.innerHTML;
}

function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = 'toastIn .3s ease, toastOut .3s ease 2.6s forwards';
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { el.style.display = 'none'; }, 3000);
}

function closeOverlay() {
  const c = document.getElementById('overlay-container');
  if (c) c.innerHTML = '';
  pendingPromotion = null;
}

function showOverlay(html) {
  const c = document.getElementById('overlay-container');
  if (!c) return;
  c.innerHTML = `<div class="overlay" onclick="if(event.target===this)closeOverlay()">${html}</div>`;
}

function getCanvas() {
  return document.getElementById('board');
}

function getPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
  const scaleX = boardSize / rect.width;
  const scaleY = boardSize / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function squareFromPos(x, y) {
  let c = Math.floor(x / sqSize);
  let r = Math.floor(y / sqSize);
  if (boardFlipped) { r = 7 - r; c = 7 - c; }
  if (r >= 0 && r < 8 && c >= 0 && c < 8) return [r, c];
  return null;
}

function snapshotState(gs) {
  return {
    board: gs.board.map(row => row.map(p => p ? Object.assign({}, p) : null)),
    turn: gs.turn, castlingRights: Object.assign({}, gs.castlingRights),
    epSquare: gs.epSquare ? gs.epSquare.slice() : null, halfMoveClock: gs.halfMoveClock,
    capturedWhite: gs.capturedWhite.slice(), capturedBlack: gs.capturedBlack.slice(),
    moveHistory: gs.moveHistory.slice(), moveNotation: gs.moveNotation.slice(),
    lastMove: gs.lastMove ? Object.assign({}, gs.lastMove) : null,
    check: gs.check, checkmate: gs.checkmate, stalemate: gs.stalemate,
    gameOver: gs.gameOver, winner: gs.winner, promotions: gs.promotions
  };
}

function restoreState(gs, snap) {
  gs.board = snap.board.map(row => row.map(p => p ? Object.assign({}, p) : null));
  gs.turn = snap.turn; gs.castlingRights = Object.assign({}, snap.castlingRights);
  gs.epSquare = snap.epSquare ? snap.epSquare.slice() : null; gs.halfMoveClock = snap.halfMoveClock;
  gs.capturedWhite = snap.capturedWhite.slice(); gs.capturedBlack = snap.capturedBlack.slice();
  gs.moveHistory = snap.moveHistory.slice(); gs.moveNotation = snap.moveNotation.slice();
  gs.lastMove = snap.lastMove ? Object.assign({}, snap.lastMove) : null;
  gs.check = snap.check; gs.checkmate = snap.checkmate; gs.stalemate = snap.stalemate;
  gs.gameOver = snap.gameOver; gs.winner = snap.winner; gs.promotions = snap.promotions;
}

function formatReason(r) {
  const map = {
    checkmate: 'Checkmate', time: 'Time out', timeout: 'Time out',
    resignation: 'Resignation', resign: 'Resignation',
    'draw agreed': 'Draw agreed', agreement: 'Draw agreed',
    stalemate: 'Stalemate', insufficient: 'Insufficient material',
    'insufficient material': 'Insufficient material',
    aborted: 'Game aborted', disconnect: 'Opponent disconnected'
  };
  return map[r] || r;
}
