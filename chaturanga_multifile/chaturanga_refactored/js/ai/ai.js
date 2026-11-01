
function requestAIMove() {
  if (!gameState || gameState.gameOver || aiThinking || gameState.viewIndex !== -1) return;
  if (gameState.opponent !== 'bot' || gameState.turn !== gameState.botColor) return;
  aiThinking = true;
  updateUI();

  if (wsConnected && wsClient) {
    const depth = BOT_CONFIGS[gameState.difficulty]?.depth || 3;
    wsClient.send(JSON.stringify({
      type: 'request_ai_move',
      board: gameState.board,
      color: gameState.botColor,
      depth,
      mode: gameState.mode
    }));
    return;
  }
  setTimeout(() => {
    const moves = gameState.getAllMoves(gameState.botColor);
    if (moves.length) {
      const m = moves[Math.floor(Math.random() * moves.length)];
      gameState.makeMove(m.from[0], m.from[1], m.to[0], m.to[1]);
    }
    aiThinking = false;
    updateUI(); drawBoard();
  }, 300);
}

function updateEvalBar(score) {
  const fill = document.getElementById('eval-fill');
  const label = document.getElementById('eval-label');
  if (!fill) return;
  const clamped = Math.max(-10, Math.min(10, score / 100));
  const pct = Math.max(2, Math.min(98, 50 + clamped * 4.5));
  fill.style.height = pct + '%';
  fill.classList.toggle('negative', pct < 50);
  if (label) label.textContent = (score / 100).toFixed(1);
}
