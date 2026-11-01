
function getRawMoves(b, r, c, mode) {
  const p = b[r][c];
  if (!p) return [];
  const moves = [];
  const col = p.color;
  const add = (nr, nc) => {
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const t = b[nr][nc];
      if (!t || t.color !== col) moves.push([nr, nc]);
    }
  };
  const addSlide = (dirs) => {
    dirs.forEach(([dr, dc]) => {
      for (let i = 1; i < 8; i++) {
        const nr = r + dr * i, nc = c + dc * i;
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
        const t = b[nr][nc];
        if (!t) moves.push([nr, nc]);
        else { if (t.color !== col) moves.push([nr, nc]); break; }
      }
    });
  };
  if (mode === 'standard') {
    switch (p.type) {
      case 'king':
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++)
            if (dr || dc) add(r + dr, c + dc);
        break;
      case 'queen':
        addSlide([[-1,-1],[-1,1],[1,-1],[1,1],[0,1],[1,0],[0,-1],[-1,0]]);
        break;
      case 'rook': addSlide([[0,1],[1,0],[0,-1],[-1,0]]); break;
      case 'bishop': addSlide([[-1,-1],[-1,1],[1,-1],[1,1]]); break;
      case 'knight':
        [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]
          .forEach(([dr, dc]) => add(r + dr, c + dc));
        break;
      case 'pawn': {
        const dir = col === 'white' ? -1 : 1;
        const nr = r + dir;
        if (nr >= 0 && nr < 8 && !b[nr][c]) moves.push([nr, c]);
        if ((col === 'white' && r === 6) || (col === 'black' && r === 1)) {
          const nr2 = r + 2 * dir;
          if (!b[r + dir][c] && !b[nr2][c]) moves.push([nr2, c]);
        }
        [-1, 1].forEach(dc => {
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const t = b[nr][nc];
            if (t && t.color !== col) moves.push([nr, nc]);
          }
        });
        break;
      }
    }
  } else {
    switch (p.type) {
      case 'raja':
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++)
            if (dr || dc) add(r + dr, c + dc);
        break;
      case 'mantri':
        [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr, dc]) => add(r + dr, c + dc));
        break;
      case 'ratha': addSlide([[0,1],[1,0],[0,-1],[-1,0]]); break;
      case 'gaja':
        [[-2,-2],[-2,2],[2,-2],[2,2]].forEach(([dr, dc]) => add(r + dr, c + dc));
        break;
      case 'ashva':
        [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]
          .forEach(([dr, dc]) => add(r + dr, c + dc));
        break;
      case 'padati': {
        const d = col === 'white' ? -1 : 1;
        const nr2 = r + d;
        if (nr2 >= 0 && nr2 < 8 && !b[nr2][c]) moves.push([nr2, c]);
        [-1, 1].forEach(dc => {
          const nc = c + dc;
          if (nr2 >= 0 && nr2 < 8 && nc >= 0 && nc < 8) {
            const t = b[nr2][nc];
            if (t && t.color !== col) moves.push([nr2, nc]);
          }
        });
        break;
      }
    }
  }
  return moves;
}

function getValidMoves(b, r, c, mode, epSquare, castlingRights) {
  const p = b[r][c];
  if (!p) return [];
  const col = p.color;
  const raw = getRawMoves(b, r, c, mode);
  const result = [];
  for (const [nr, nc] of raw) {
    const cap = b[nr][nc];
    const ot = p.type, oh = p.hasMoved;
    b[nr][nc] = p; b[r][c] = null;
    if ((p.type === 'padati' || p.type === 'pawn') && (nr === 0 || nr === 7)) {
      p.type = mode === 'standard' ? 'queen' : 'mantri';
    }
    p.hasMoved = true;
    const inCheck = isInCheck(b, col, mode);
    b[r][c] = p; b[nr][nc] = cap;
    p.type = ot; p.hasMoved = oh;
    if (!inCheck) result.push([nr, nc]);
  }
  if (mode === 'standard' && p.type === 'pawn' && epSquare) {
    const pawnRow = col === 'white' ? 3 : 4;
    const targetRow = col === 'white' ? 2 : 5;
    if (r === pawnRow && epSquare[0] === targetRow && Math.abs(epSquare[1] - c) === 1) {
      const targetCol = epSquare[1];
      const opp = col === 'white' ? 'black' : 'white';
      const enemyPawn = b[r][targetCol];
      if (enemyPawn && enemyPawn.type === 'pawn' && enemyPawn.color === opp) {
        b[targetRow][targetCol] = p;
        b[r][c] = null;
        b[r][targetCol] = null;
        const check = isInCheck(b, col, mode);
        b[r][c] = p;
        b[targetRow][targetCol] = null;
        b[r][targetCol] = enemyPawn;
        if (!check) result.push([targetRow, targetCol]);
      }
    }
  }
  if (mode === 'standard' && p.type === 'king' && !p.hasMoved && castlingRights && !isInCheck(b, col, mode)) {
    const kRow = col === 'white' ? 7 : 0;
    if (r === kRow && c === 4) {
      const canK = col === 'white' ? castlingRights.whiteK : castlingRights.blackK;
      if (canK && b[kRow][7] && !b[kRow][7].hasMoved && !b[kRow][5] && !b[kRow][6]) {
        b[kRow][5] = p; b[kRow][4] = null;
        const c1 = isInCheck(b, col, mode);
        b[kRow][6] = p; b[kRow][5] = null;
        const c2 = isInCheck(b, col, mode);
        b[kRow][4] = p; b[kRow][6] = null;
        if (!c1 && !c2) result.push([kRow, 6]);
      }
      const canQ = col === 'white' ? castlingRights.whiteQ : castlingRights.blackQ;
      if (canQ && b[kRow][0] && !b[kRow][0].hasMoved && !b[kRow][1] && !b[kRow][2] && !b[kRow][3]) {
        b[kRow][3] = p; b[kRow][4] = null;
        const c1 = isInCheck(b, col, mode);
        b[kRow][2] = p; b[kRow][3] = null;
        const c2 = isInCheck(b, col, mode);
        b[kRow][4] = p; b[kRow][2] = null;
        if (!c1 && !c2) result.push([kRow, 2]);
      }
    }
  }
  return result;
}

function getAllMoves(b, col, mode, epSquare, castlingRights) {
  const moves = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (p && p.color === col) {
        getValidMoves(b, r, c, mode, epSquare, castlingRights)
          .forEach(([nr, nc]) => moves.push({ from: [r, c], to: [nr, nc] }));
      }
    }
  return moves;
}
