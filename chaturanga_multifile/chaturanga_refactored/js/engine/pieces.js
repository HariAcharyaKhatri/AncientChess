
function makeBoard(mode) {
  const b = Array(8).fill().map(() => Array(8).fill(null));
  if (mode === 'standard') {
    const back = ['rook','knight','bishop','queen','king','bishop','knight','rook'];
    for (let c = 0; c < 8; c++) {
      b[1][c] = { type:'pawn', color:'black', hasMoved:false };
      b[6][c] = { type:'pawn', color:'white', hasMoved:false };
      b[0][c] = { type: back[c], color:'black', hasMoved:false };
      b[7][c] = { type: back[c], color:'white', hasMoved:false };
    }
  } else {
    const back = ['ratha','ashva','gaja','mantri','raja','gaja','ashva','ratha'];
    for (let c = 0; c < 8; c++) {
      b[1][c] = { type:'padati', color:'black', hasMoved:false };
      b[6][c] = { type:'padati', color:'white', hasMoved:false };
      b[0][c] = { type: back[c], color:'black', hasMoved:false };
      b[7][c] = { type: back[c], color:'white', hasMoved:false };
    }
  }
  return b;
}
