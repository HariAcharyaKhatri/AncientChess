// ==========================================
// PUZZLE SYSTEM & TACTICS TRAINER
// ==========================================

const PUZZLE_DB = [
  {
    name: 'Back-Rank Decapitation',
    rating: 1200,
    turn: 'white',
    pieces: [
      ['black','king',0,6],['black','rook',0,3],['black','pawn',1,5],['black','pawn',1,6],['black','pawn',1,7],
      ['white','king',7,6],['white','pawn',6,5],['white','pawn',6,6],['white','pawn',6,7],['white','rook',7,3]
    ],
    solution: [[7,3,0,3]]
  },
  {
    name: 'Royal Fork',
    rating: 1350,
    turn: 'white',
    pieces: [
      ['black','king',0,4],['black','queen',0,3],['black','rook',0,0],['black','pawn',1,2],['black','pawn',1,4],
      ['white','king',7,4],['white','knight',3,4],['white','pawn',6,3],['white','pawn',6,4]
    ],
    solution: [[3,4,1,2]]
  },
  {
    name: 'Queen Penetration',
    rating: 1450,
    turn: 'white',
    pieces: [
      ['black','king',0,6],['black','rook',0,5],['black','pawn',1,6],['black','pawn',1,7],
      ['white','king',7,6],['white','queen',2,4],['white','bishop',4,2]
    ],
    solution: [[2,4,0,6]]
  },
  {
    name: 'Knight Deflection',
    rating: 1520,
    turn: 'white',
    pieces: [
      ['black','king',0,7],['black','rook',0,0],['black','queen',2,3],
      ['white','king',7,7],['white','knight',4,4]
    ],
    solution: [[4,4,2,3]]
  },
  {
    name: 'Chaturanga Gaja Ambush',
    rating: 1600,
    turn: 'white',
    pieces: [
      ['black','raja',0,4],['black','mantri',2,2],['black','padati',1,2],
      ['white','raja',7,4],['white','gaja',4,4]
    ],
    solution: [[4,4,2,2]]
  }
];

function openPuzzleTrainer(mode) {
  mode = mode || 'daily';
  if (mode !== 'daily') {
    const title = mode === 'rush' ? 'Puzzle Rush' : mode === 'battle' ? 'Puzzle Battle' : 'Custom Puzzles';
    const desc = mode === 'rush' ? 'Solve as many puzzles as you can in 3 minutes.' : mode === 'battle' ? 'Race an opponent to solve the same puzzle first.' : 'Create and share your own puzzles.';
    showOverlay(`
      <div class="overlay-content" onclick="event.stopPropagation()">
        <h3>${escapeHtml(title)}</h3>
        <p style="color:var(--text-dim);line-height:1.6;margin:12px 0;text-align:center;">
          ${escapeHtml(desc)}
        </p>
        <button class="btn primary w-full" onclick="closeOverlay();openPuzzleTrainer('daily')">Try Daily Puzzle Instead</button>
        <button class="btn secondary w-full mt-8" onclick="closeOverlay()">Close</button>
      </div>`);
    return;
  }
  currentPuzzle = PUZZLE_DB[Math.floor(Math.random() * PUZZLE_DB.length)];
  puzzleBoard = Array(8).fill().map(() => Array(8).fill(null));
  currentPuzzle.pieces.forEach(([color, type, r, c]) => {
    puzzleBoard[r][c] = { type, color, hasMoved: false };
  });
  puzzleSelected = null;
  puzzleSolved = false;
  showScreen('puzzles');
  drawPuzzleBoard();

  const info = document.getElementById('puzzle-info');
  if (info) {
    info.innerHTML = `<b>${escapeHtml(currentPuzzle.name)}</b> · Rating ${currentPuzzle.rating} · ${currentPuzzle.turn === 'white' ? 'White' : 'Black'} to move`;
  }
  const fb = document.getElementById('puzzle-feedback');
  if (fb) { fb.textContent = ''; fb.style.color = ''; }
  const nextBtn = document.getElementById('btn-puzzle-next');
  if (nextBtn) nextBtn.style.display = 'none';
}

function drawPuzzleBoard() {
  const canvas = document.getElementById('puzzle-board');
  if (!canvas || !puzzleBoard) return;
  const size = Math.min(400, window.innerWidth - 80);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const sq = size / 8;
  const bLight = getComputedStyle(document.documentElement).getPropertyValue('--board-light').trim() || '#EBECD0';
  const bDark  = getComputedStyle(document.documentElement).getPropertyValue('--board-dark').trim() || '#739552';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? bLight : bDark;
      ctx.fillRect(c * sq, r * sq, sq, sq);
    }
  }

  if (puzzleSelected) {
    const [sr, sc] = puzzleSelected;
    ctx.fillStyle = 'rgba(129,182,76,.5)';
    ctx.fillRect(sc * sq, sr * sq, sq, sq);
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = puzzleBoard[r][c];
      if (p) drawPiece(ctx, p, c * sq, r * sq, sq, 'standard');
    }
  }
}

function puzzleClick(e) {
  if (!puzzleBoard || !currentPuzzle || puzzleSolved) return;
  const canvas = document.getElementById('puzzle-board');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const sq = rect.width / 8;
  let cx = e.clientX, cy = e.clientY;
  if (e.touches && e.touches.length) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
  const c = Math.floor((cx - rect.left) / sq);
  const r = Math.floor((cy - rect.top) / sq);
  if (r < 0 || r > 7 || c < 0 || c > 7) return;

  const p = puzzleBoard[r][c];

  if (puzzleSelected) {
    // If clicking another piece of the player's color, switch selection
    if (p && p.color === currentPuzzle.turn) {
      puzzleSelected = [r, c];
      drawPuzzleBoard();
      return;
    }

    const [sr, sc] = puzzleSelected;
    const sol = currentPuzzle.solution[0];
    if (sol[0] === sr && sol[1] === sc && sol[2] === r && sol[3] === c) {
      const piece = puzzleBoard[sr][sc];
      puzzleBoard[r][c] = piece;
      puzzleBoard[sr][sc] = null;
      puzzleSolved = true;
      puzzleSelected = null;
      drawPuzzleBoard();
      const fb = document.getElementById('puzzle-feedback');
      if (fb) { fb.textContent = '✓ Correct! Puzzle solved.'; fb.style.color = 'var(--green)'; }
      const nextBtn = document.getElementById('btn-puzzle-next');
      if (nextBtn) nextBtn.style.display = 'inline-flex';
      playPuzzleCorrect();
      return;
    } else {
      const fb = document.getElementById('puzzle-feedback');
      if (fb) { fb.textContent = '✗ Not quite. Try again.'; fb.style.color = 'var(--danger)'; }
      playPuzzleWrong();
      puzzleSelected = null;
      drawPuzzleBoard();
      return;
    }
  }

  if (p && p.color === currentPuzzle.turn) puzzleSelected = [r, c];
  else puzzleSelected = null;
  drawPuzzleBoard();
}

function nextPuzzle() {
  openPuzzleTrainer('daily');
}

