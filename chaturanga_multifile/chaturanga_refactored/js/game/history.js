// Removed full snapshotState and restoreState if not fully used, 
// but keeping them to match extracted JS if they existed:

function snapshotState() {
  if (!gameState) return null;
  return {
    board: gameState.board.map(r => r.map(p => p ? { ...p } : null)),
    turn: gameState.turn,
    castlingRights: { ...gameState.castlingRights },
    epSquare: gameState.epSquare ? [...gameState.epSquare] : null,
    halfMoves: gameState.halfMoves,
    fullMoves: gameState.fullMoves,
    moveHistory: JSON.parse(JSON.stringify(gameState.moveHistory)),
    moveNotation: JSON.parse(JSON.stringify(gameState.moveNotation))
  };
}

function restoreState(snap) {
  if (!snap || !gameState) return;
  gameState.board = snap.board.map(r => r.map(p => p ? { ...p } : null));
  gameState.turn = snap.turn;
  gameState.castlingRights = { ...snap.castlingRights };
  gameState.epSquare = snap.epSquare ? [...snap.epSquare] : null;
  gameState.halfMoves = snap.halfMoves;
  gameState.fullMoves = snap.fullMoves;
  gameState.moveHistory = JSON.parse(JSON.stringify(snap.moveHistory));
  gameState.moveNotation = JSON.parse(JSON.stringify(snap.moveNotation));
  gameState.check = gameState.isInCheck(gameState.turn);
  gameState.validMoves = [];
  gameState.selectedSquare = null;
}
