function getPos(e) {
  const canvas = getCanvas();
  const rect = canvas.getBoundingClientRect();
  let cx = e.clientX, cy = e.clientY;
  if (e.touches && e.touches.length) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
  return [cx - rect.left, cy - rect.top];
}

function squareFromPos(px, py) {
  const col = Math.floor(px / sqSize), row = Math.floor(py / sqSize);
  const r = boardFlipped ? 7 - row : row;
  const c = boardFlipped ? 7 - col : col;
  return (r >= 0 && r < 8 && c >= 0 && c < 8) ? [r, c] : null;
}

function handlePointerDown(e) {
  if (!gameState || gameState.gameOver || aiThinking || pendingPromotion) return;
  if (gameState.isMultiplayer && gameState.turn !== onlinePlayerColor) return;
  if (!gameState.isMultiplayer && gameState.playerColor !== 'both'
      && gameState.turn !== gameState.playerColor) return;

  const [px, py] = getPos(e);
  const sq = squareFromPos(px, py);
  if (!sq) return;
  const [r, c] = sq;

  if (gameState.selectedSquare) {
    const [sr, sc] = gameState.selectedSquare;
    if (gameState.validMoves.some(([nr, nc]) => nr === r && nc === c)) {
      const moved = gameState.makeMove(sr, sc, r, c);
      if (moved) {
        updateUI(); drawBoard();
        if (gameState.opponent === 'bot' && !gameState.gameOver && gameState.turn === gameState.botColor) {
          setTimeout(() => requestAIMove(), 150);
        }
      }
      return;
    }
  }

  const piece = gameState.getPiece(r, c);
  if (piece && piece.color === gameState.turn) {
    gameState.selectedSquare = [r, c];
    gameState.validMoves = gameState.getValidMoves(r, c);
  } else {
    gameState.selectedSquare = null;
    gameState.validMoves = [];
  }
  drawBoard();
}

function resizeBoard() {
  const isMobile = window.innerWidth < 700;
  const maxW = Math.min(window.innerWidth - (isMobile ? 24 : 400), 640);
  const maxH = Math.min(window.innerHeight - (isMobile ? 230 : 210), 640);
  boardSize = Math.max(240, Math.min(maxW, maxH));
  sqSize = boardSize / 8;
  const canvas = getCanvas();
  if (canvas) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(boardSize * dpr);
    canvas.height = Math.round(boardSize * dpr);
    canvas.style.width = boardSize + 'px';
    canvas.style.height = boardSize + 'px';
  }
  if (gameState) drawBoard();
}

function onResize() {
  resizeBoard();
  drawPreview();
  if (gameState) drawBoard();
}
