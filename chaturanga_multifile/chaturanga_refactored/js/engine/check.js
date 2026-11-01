
function isInCheck(b, col, mode) {
  let king = null;
  const kingType = mode === 'standard' ? 'king' : 'raja';
  for (let r = 0; r < 8 && !king; r++)
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (p && p.type === kingType && p.color === col) { king = [r, c]; break; }
    }
  if (!king) return false;
  const opp = col === 'white' ? 'black' : 'white';
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (p && p.color === opp) {
        if (getRawMoves(b, r, c, mode).some(([mr, mc]) => mr === king[0] && mc === king[1])) return true;
      }
    }
  return false;
}
