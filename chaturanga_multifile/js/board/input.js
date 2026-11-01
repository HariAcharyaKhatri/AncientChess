// ==========================================
// USER INPUT & BOARD INTERACTION
// ==========================================

function handlePointerDown(e) {
  if (!gameState || gameState.gameOver || aiThinking || pendingPromotion) return;
  if (gameState.isMultiplayer && gameState.turn !== onlinePlayerColor) return;
  if (!gameState.isMultiplayer && gameState.playerColor !== 'both' && gameState.turn !== gameState.playerColor) return;

  const canvas = getCanvas();
  if (!canvas) return;
  const pos = getPos(e, canvas);
  const sq = squareFromPos(pos.x, pos.y);
  if (!sq) return;
  const [r, c] = sq;

  if (gameState.selectedSquare) {
    const [sr, sc] = gameState.selectedSquare;
    if (gameState.validMoves.some(([nr, nc]) => nr === r && nc === c)) {
      const moved = gameState.makeMove(sr, sc, r, c);
      if (moved) {
        updateUI();
        drawBoard();
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

function flipBoard() {
  boardFlipped = !boardFlipped;
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
