// ==========================================
// GAME STATE MANAGEMENT CLASS
// ==========================================

class GameState {
  constructor(opponent, difficulty, playerColor, tutorialMode, assistMode) {
    this.opponent = opponent;
    this.difficulty = difficulty;
    this.playerColor = playerColor;
    this.botColor = playerColor === 'white' ? 'black' : 'white';
    this.tutorialMode = !!tutorialMode;
    this.assistMode = assistMode !== undefined ? assistMode : false;
    this.isAnalysis = false;
    this.mode = gameMode;
    this.board = makeBoard(this.mode);
    this.turn = 'white';
    this.check = false;
    this.checkmate = false;
    this.stalemate = false;
    this.gameOver = false;
    this.winner = null;
    this.resigned = false;
    this.moveHistory = [];
    this.moveNotation = [];
    this.capturedWhite = [];
    this.capturedBlack = [];
    this.lastMove = null;
    this.selectedSquare = null;
    this.validMoves = [];
    this.timerWhite = timeControl.base;
    this.timerBlack = timeControl.base;
    this.timeInc = timeControl.inc;
    this.showClocks = (opponent === 'online_human');
    this.totalPlayTimeMs = 0;
    this.epSquare = null;
    this.castlingRights = { whiteK: true, whiteQ: true, blackK: true, blackQ: true };
    this.halfMoveClock = 0;
    this.posHistory = {};
    this.promotions = 0;
    this.viewIndex = -1;
    this.isMultiplayer = false;
    this.flipAfterMove = false;
    this.onlineOpponent = null;
    this.opponentElo = null;
    this.roomCode = null;
    this.snapshots = [];
    this.hintSquare = null;
  }

  getPiece(r, c) {
    return (r >= 0 && r < 8 && c >= 0 && c < 8) ? this.board[r][c] : null;
  }

  getValidMoves(r, c) {
    return getValidMoves(this.board, r, c, this.mode, this.epSquare, this.castlingRights);
  }

  getAllMoves(col) {
    return getAllMoves(this.board, col, this.mode, this.epSquare, this.castlingRights);
  }

  isInCheck(col) {
    return isInCheck(this.board, col, this.mode);
  }

  makeMove(fr, fc, tr, tc, promoteTo) {
    if (this.gameOver || this.viewIndex !== -1) return false;
    const piece = this.board[fr][fc];
    if (!piece || piece.color !== this.turn) return false;
    const valid = this.getValidMoves(fr, fc);
    if (!valid.some(([nr, nc]) => nr === tr && nc === tc)) return false;

    const promoRow = piece.color === 'white' ? 0 : 7;
    const isPawn = (piece.type === 'padati' || piece.type === 'pawn');
    const isLocalHuman = (this.playerColor === this.turn || this.playerColor === 'both') && this.opponent !== 'online_human';

    if (isPawn && tr === promoRow && this.mode === 'standard' && !promoteTo && !prefs.autoPromote && isLocalHuman) {
      pendingPromotion = { fr, fc, tr, tc };
      showPromotionDialog(this.turn);
      return false;
    }
    if (isPawn && tr === promoRow && !promoteTo && this.mode === 'standard' && prefs.autoPromote) {
      promoteTo = 'queen';
    }

    // Save snapshot for undo before mutating
    this.snapshots.push(snapshotState(this));
    this.hintSquare = null;

    if (this.isMultiplayer && this.playerColor === this.turn && wsConnected && wsClient) {
      pendingOptimisticSnapshot = snapshotState(this);
      const sentPromote = promoteTo || (this.mode === 'standard' ? 'queen' : 'mantri');
      pendingOptimisticMove = { fr, fc, tr, tc, promoteTo: sentPromote };
      wsClient.send(JSON.stringify({ type: 'make_move', fr, fc, tr, tc, promoteTo: sentPromote }));
    }

    const cap = this.board[tr][tc];
    let castled = false, epCaptured = null;

    if (this.mode === 'standard' && isPawn && this.epSquare && tr === this.epSquare[0] && tc === this.epSquare[1]) {
      const capRow = this.turn === 'white' ? tr + 1 : tr - 1;
      epCaptured = this.board[capRow][tc];
      this.board[capRow][tc] = null;
    }

    if (this.mode === 'standard' && piece.type === 'king' && Math.abs(tc - fc) === 2) {
      const kingSide = tc === 6;
      const rCol = kingSide ? 7 : 0;
      const rTarget = kingSide ? 5 : 3;
      const rook = this.board[fr][rCol];
      if (rook) {
        this.board[fr][rTarget] = rook;
        this.board[fr][rCol] = null;
        rook.hasMoved = true;
        castled = true;
      }
    }

    this.board[tr][tc] = piece;
    this.board[fr][fc] = null;
    piece.hasMoved = true;

    // Update FIDE castling rights
    if (this.mode === 'standard') {
      if (piece.type === 'king') {
        if (piece.color === 'white') { this.castlingRights.whiteK = false; this.castlingRights.whiteQ = false; }
        else { this.castlingRights.blackK = false; this.castlingRights.blackQ = false; }
      } else if (piece.type === 'rook') {
        if (fr === 7 && fc === 0) this.castlingRights.whiteQ = false;
        if (fr === 7 && fc === 7) this.castlingRights.whiteK = false;
        if (fr === 0 && fc === 0) this.castlingRights.blackQ = false;
        if (fr === 0 && fc === 7) this.castlingRights.blackK = false;
      }
      if (tr === 7 && tc === 0) this.castlingRights.whiteQ = false;
      if (tr === 7 && tc === 7) this.castlingRights.whiteK = false;
      if (tr === 0 && tc === 0) this.castlingRights.blackQ = false;
      if (tr === 0 && tc === 7) this.castlingRights.blackK = false;
    }

    let promoted = false;
    if (isPawn && tr === promoRow) {
      piece.type = promoteTo || (this.mode === 'standard' ? 'queen' : 'mantri');
      promoted = true;
      this.promotions++;
    }

    this.epSquare = null;
    if (this.mode === 'standard' && isPawn && Math.abs(tr - fr) === 2) {
      this.epSquare = [(fr + tr) / 2, fc];
    }

    const isOpponent = (this.turn !== this.playerColor && this.opponent === 'bot');
    if (promoted) {
      playPromote();
    } else if (castled) {
      playCastle();
    } else if (cap || epCaptured) {
      const taken = cap || epCaptured;
      if (taken.color === 'white') this.capturedWhite.push(taken);
      else this.capturedBlack.push(taken);
      playCapture();
    } else {
      playMove(isOpponent);
    }

    this.lastMove = { from: [fr, fc], to: [tr, tc], promoted };
    this.moveHistory.push({ fr, fc, tr, tc, cap: cap || epCaptured, castled, promoted });
    this.moveNotation.push(this.getNotation(fr, fc, tr, tc, cap || epCaptured, promoted, castled));

    const prevTurn = this.turn;
    this.turn = this.turn === 'white' ? 'black' : 'white';
    this.check = this.isInCheck(this.turn);

    const nextMoves = this.getAllMoves(this.turn);
    if (!nextMoves.length) {
      if (this.check) {
        this.checkmate = true;
        this.gameOver = true;
        this.winner = prevTurn === 'white' ? 'White' : 'Black';
        const didWin = this.winner.toLowerCase() === this.playerColor;
        playCheckmate(didWin);
        this.recordLocalResult(didWin ? 'win' : 'loss');
      } else {
        this.stalemate = true;
        this.gameOver = true;
        this.winner = 'Draw';
        playCheckmate(null);
        this.recordLocalResult('draw');
      }
    } else if (this.check) {
      playCheck();
    }

    if (this.flipAfterMove && this.opponent === 'human' && !this.gameOver) {
      boardFlipped = !boardFlipped;
    }

    this.selectedSquare = null;
    this.validMoves = [];
    if (this.gameOver && !silentReplay) {
      setTimeout(() => showGameOverOverlay(), 400);
    }
    return true;
  }

  getNotation(fr, fc, tr, tc, cap, promoted, castled) {
    const piece = this.board[tr][tc] || (this.board[fr] ? this.board[fr][fc] : null);
    if (!piece) return '';
    const files = 'abcdefgh', ranks = '87654321';
    const sym = this.mode === 'standard'
      ? { king:'K', queen:'Q', rook:'R', bishop:'B', knight:'N', pawn:'' }
      : { raja:'R', mantri:'M', ratha:'T', gaja:'G', ashva:'A', padati:'' };
    const pSym = sym[piece.type] || '';
    const to = files[tc] + ranks[tr];
    if (castled) return tc > fc ? 'O-O' : 'O-O-O';
    if (piece.type === 'pawn' || piece.type === 'padati') return cap ? files[fc] + 'x' + to : to;
    let nota = pSym + (cap ? 'x' : '') + to;
    if (promoted) nota += '=' + (this.mode === 'standard' ? 'Q' : 'M');
    if (this.checkmate) nota += '#'; else if (this.check) nota += '+';
    return nota;
  }

  recordLocalResult(res) {
    if (silentReplay || !res || this.isMultiplayer) return;
    if (res === 'win') persistedStats.wins++;
    else if (res === 'loss') persistedStats.losses++;
    else persistedStats.draws++;
    persistedStats.gamesPlayed++;

    const oppElo = BOT_CONFIGS[this.difficulty]?.elo || 1200;
    if (res === 'win') {
      persistedStats.elo += Math.max(1, Math.floor((oppElo - persistedStats.elo) / 100) + 10);
    } else if (res === 'loss') {
      persistedStats.elo = Math.max(100, persistedStats.elo - Math.max(1, Math.floor((persistedStats.elo - oppElo) / 100) + 5));
    }
    saveStats(persistedStats);
  }

  getBoardAtView() {
    if (this.viewIndex === -1 || this.viewIndex >= this.moveHistory.length - 1) return this.board;
    const b = makeBoard(this.mode);
    for (let i = 0; i <= this.viewIndex; i++) {
      const m = this.moveHistory[i];
      const p = b[m.fr][m.fc];
      b[m.tr][m.tc] = p;
      b[m.fr][m.fc] = null;
      if (p) {
        p.hasMoved = true;
        if (m.promoted) {
          p.type = this.mode === 'standard' ? 'queen' : 'mantri';
        }
      }
      if (m.castled) {
        const kingSide = m.tc === 6;
        const rCol = kingSide ? 7 : 0;
        const rTarget = kingSide ? 5 : 3;
        const rook = b[m.fr][rCol];
        if (rook) {
          b[m.fr][rTarget] = rook;
          b[m.fr][rCol] = null;
          rook.hasMoved = true;
        }
      }
      if (m.cap && p && (p.type === 'pawn' || p.type === 'padati') && m.fc !== m.tc) {
        if (!b[m.tr][m.tc] && b[m.fr][m.tc]) {
          b[m.fr][m.tc] = null;
        }
      }
    }
    return b;
  }
}

function pickOfflineBotMove(gs) {
  const moves = gs.getAllMoves(gs.botColor);
  if (!moves.length) return null;
  const isWhite = gs.botColor === 'white';
  const diff = gs.difficulty || 'intermediate';

  const scoredMoves = moves.map(m => {
    const fr = m.from[0], fc = m.from[1], tr = m.to[0], tc = m.to[1];
    const piece = gs.board[fr][fc];
    const cap = gs.board[tr][tc];
    let score = 0;

    const vals = { pawn: 100, padati: 100, knight: 320, ashva: 320, bishop: 330, gaja: 330, rook: 500, ratha: 500, mantri: 350, queen: 900, king: 20000, raja: 20000 };

    if (cap) {
      score += (vals[cap.type] || 100) * 1.5 - (vals[piece ? piece.type : 'pawn'] || 100) * 0.1;
    }
    if ((tr === 3 || tr === 4) && (tc === 3 || tc === 4)) score += 30;
    else if (tr >= 2 && tr <= 5 && tc >= 2 && tc <= 5) score += 15;

    if (piece && (piece.type === 'pawn' || piece.type === 'padati')) {
      const advance = isWhite ? (6 - tr) : (tr - 1);
      score += advance * 8;
    }

    const noiseLevels = { beginner: 250, intermediate: 100, advanced: 35, expert: 10, champion: 0, legend: 0 };
    const noise = (Math.random() - 0.5) * (noiseLevels[diff] ?? 80);
    return { move: m, totalScore: score + noise };
  });

  scoredMoves.sort((a, b) => b.totalScore - a.totalScore);
  return scoredMoves[0].move;
}

function requestAIMove() {
  if (!gameState || gameState.gameOver || aiThinking || gameState.viewIndex !== -1) return;
  if (gameState.opponent !== 'bot' || gameState.turn !== gameState.botColor) return;
  aiThinking = true;
  updateUI();

  if (wsConnected && wsClient) {
    const depth = BOT_CONFIGS[gameState.difficulty]?.depth || 3;
    wsClient.send(JSON.stringify({
      type: 'request_ai_move', board: gameState.board, color: gameState.botColor, depth, mode: gameState.mode
    }));
    return;
  }

  setTimeout(() => {
    const m = pickOfflineBotMove(gameState);
    if (m) {
      gameState.makeMove(m.from[0], m.from[1], m.to[0], m.to[1]);
    }
    aiThinking = false;
    updateUI();
    drawBoard();
  }, 350);
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

