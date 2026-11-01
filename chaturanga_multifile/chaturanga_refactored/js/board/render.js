function getCanvas() { return document.getElementById('board'); }

function drawBoard() {
  const canvas = getCanvas();
  if (!canvas || !gameState) return;
  const dpr = window.devicePixelRatio || 1;
  const target = Math.round(boardSize * dpr);
  if (canvas.width !== target) { canvas.width = target; canvas.height = target; }
  canvas.style.width = boardSize + 'px';
  canvas.style.height = boardSize + 'px';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, boardSize, boardSize);
  sqSize = boardSize / 8;

  const renderBoard = gameState.getBoardAtView();
  const bLight = getComputedStyle(document.documentElement).getPropertyValue('--board-light').trim() || '#EBECD0';
  const bDark  = getComputedStyle(document.documentElement).getPropertyValue('--board-dark').trim() || '#739552';

  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const dr = boardFlipped ? 7 - r : r;
      const dc = boardFlipped ? 7 - c : c;
      ctx.fillStyle = (r + c) % 2 === 0 ? bLight : bDark;
      ctx.fillRect(dc * sqSize, dr * sqSize, sqSize, sqSize);
    }

  if (prefs.highlightLast && gameState.lastMove) {
    [gameState.lastMove.from, gameState.lastMove.to].forEach(([r, c]) => {
      const dr = boardFlipped ? 7 - r : r, dc = boardFlipped ? 7 - c : c;
      ctx.fillStyle = 'rgba(255,255,51,.35)';
      ctx.fillRect(dc * sqSize, dr * sqSize, sqSize, sqSize);
    });
  }

  if (gameState.selectedSquare) {
    const [r, c] = gameState.selectedSquare;
    const dr = boardFlipped ? 7 - r : r, dc = boardFlipped ? 7 - c : c;
    ctx.fillStyle = 'rgba(255,255,51,.45)';
    ctx.fillRect(dc * sqSize, dr * sqSize, sqSize, sqSize);
    if (prefs.highlightLegal) {
      for (const [vr, vc] of gameState.validMoves) {
        const vdr = boardFlipped ? 7 - vr : vr, vdc = boardFlipped ? 7 - vc : vc;
        const p = renderBoard[vr][vc];
        ctx.fillStyle = p ? 'rgba(0,0,0,.25)' : 'rgba(0,0,0,.13)';
        ctx.beginPath();
        ctx.arc(vdc * sqSize + sqSize / 2, vdr * sqSize + sqSize / 2,
                p ? sqSize / 2.2 : sqSize / 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (gameState.check && !gameState.checkmate) {
    const kingType = gameState.mode === 'standard' ? 'king' : 'raja';
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const p = renderBoard[r][c];
        if (p && p.type === kingType && p.color === gameState.turn) {
          const dr = boardFlipped ? 7 - r : r, dc = boardFlipped ? 7 - c : c;
          const grad = ctx.createRadialGradient(
            dc * sqSize + sqSize / 2, dr * sqSize + sqSize / 2, 0,
            dc * sqSize + sqSize / 2, dr * sqSize + sqSize / 2, sqSize / 2);
          grad.addColorStop(0, 'rgba(255,0,0,.7)');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fillRect(dc * sqSize, dr * sqSize, sqSize, sqSize);
        }
      }
  }

  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const piece = renderBoard[r][c];
      if (piece) {
        const dr = boardFlipped ? 7 - r : r, dc = boardFlipped ? 7 - c : c;
        drawPiece(ctx, piece, dc * sqSize, dr * sqSize, sqSize, gameState.mode);
      }
    }

  if (prefs.showCoords) {
    ctx.font = '11px ' + getComputedStyle(document.body).fontFamily;
    ctx.textBaseline = 'top';
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const dr = boardFlipped ? 7 - r : r, dc = boardFlipped ? 7 - c : c;
        const isLight = (r + c) % 2 === 0;
        if (c === 0) {
          ctx.fillStyle = isLight ? bDark : bLight;
          ctx.fillText(boardFlipped ? r + 1 : 8 - r, dc * sqSize + 4, dr * sqSize + 4);
        }
        if (r === 7) {
          ctx.fillStyle = isLight ? bDark : bLight;
          const file = String.fromCharCode(97 + (boardFlipped ? 7 - c : c));
          ctx.fillText(file, dc * sqSize + sqSize - 14, dr * sqSize + sqSize - 16);
        }
      }
  }
}

function drawPiece(ctx, piece, x, y, size, mode) {
  const isStd = mode === 'standard';
  let symMap;
  if (isStd) {
    symMap = piece.color === 'white'
      ? { king:'♔', queen:'♕', rook:'♖', bishop:'♗', knight:'♘', pawn:'♙' }
      : { king:'♚', queen:'♛', rook:'♜', bishop:'♝', knight:'♞', pawn:'♟' };
  } else {
    symMap = piece.color === 'white' ? SYM : SYM_B;
  }
  const symbol = symMap[piece.type] || '?';
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  const grad = ctx.createRadialGradient(30, 30, 10, 50, 50, 60);
  if (piece.color === 'white') {
    grad.addColorStop(0, '#ffffff'); grad.addColorStop(.7, '#f0f0f0'); grad.addColorStop(1, '#d0d0d0');
  } else {
    grad.addColorStop(0, '#555555'); grad.addColorStop(.7, '#333333'); grad.addColorStop(1, '#111111');
  }
  ctx.font = 'bold 72px "Segoe UI Symbol","Arial Unicode MS",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = grad;
  ctx.fillText(symbol, 50, 52);
  ctx.lineWidth = 2;
  ctx.strokeStyle = piece.color === 'white' ? 'rgba(0,0,0,.3)' : 'rgba(255,255,255,.15)';
  ctx.strokeText(symbol, 50, 52);
  ctx.restore();
}

function drawPreview() {
  const canvas = document.getElementById('preview-board');
  if (!canvas) return;
  const col = canvas.parentElement;
  const avail = Math.max(240, Math.min(col ? col.clientWidth : 440, 460));
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(avail * dpr);
  canvas.height = Math.round(avail * dpr);
  canvas.style.width = avail + 'px';
  canvas.style.height = avail + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bLight = getComputedStyle(document.documentElement).getPropertyValue('--board-light').trim() || '#EBECD0';
  const bDark  = getComputedStyle(document.documentElement).getPropertyValue('--board-dark').trim() || '#739552';
  const sq = avail / 8;
  const board = makeBoard(gameMode);
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? bLight : bDark;
      ctx.fillRect(c * sq, r * sq, sq, sq);
    }
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) drawPiece(ctx, p, c * sq, r * sq, sq, gameMode);
    }
}
