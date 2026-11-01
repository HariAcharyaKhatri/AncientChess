
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
  }

  getPiece(r, c) { return (r >= 0 && r < 8 && c >= 0 && c < 8) ? this.board[r][c] : null; }
  getValidMoves(r, c) { return getValidMoves(this.board, r, c, this.mode, this.epSquare, this.castlingRights); }
  getAllMoves(col) { return getAllMoves(this.board, col, this.mode, this.epSquare, this.castlingRights); }
  isInCheck(col) { return isInCheck(this.board, col, this.mode); }

  makeMove(fr, fc, tr, tc, promoteTo) {
    if (this.gameOver || this.viewIndex !== -1) return false;
    const piece = this.board[fr][fc];
    if (!piece || piece.color !== this.turn) return false;

    const valid = this.getValidMoves(fr, fc);
    if (!valid.some(([nr, nc]) => nr === tr && nc === tc)) return false;

    const promoRow = piece.color === 'white' ? 0 : 7;
    const isPawn = (piece.type === 'padati' || piece.type === 'pawn');

    if (isPawn && tr === promoRow && this.mode === 'standard' && !promoteTo
        && !prefs.autoPromote && this.playerColor === this.turn
        && this.opponent !== 'online_human') {
      pendingPromotion = { fr, fc, tr, tc };
      showPromotionDialog(this.turn);
      return false;
    }
    if (isPawn && tr === promoRow && !promoteTo && this.mode === 'standard' && prefs.autoPromote) {
      promoteTo = 'queen';
    }

    if (this.isMultiplayer && this.playerColor === this.turn && wsConnected && wsClient) {
      pendingOptimisticSnapshot = snapshotState(this);
      const sentPromote = promoteTo || (this.mode === 'standard' ? 'queen' : 'mantri');
      pendingOptimisticMove = { fr, fc, tr, tc, promoteTo: sentPromote };
      wsClient.send(JSON.stringify({
        type: 'make_move', fr, fc, tr, tc, promoteTo: sentPromote
      }));
    }

    const cap = this.board[tr][tc];
    let castled = false;
    let epCaptured = null;

    if (this.mode === 'standard' && isPawn && this.epSquare
        && tr === this.epSquare[0] && tc === this.epSquare[1]) {
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

    if (cap || epCaptured) {
      const taken = cap || epCaptured;
      if (taken.color === 'white') this.capturedWhite.push(taken);
      else this.capturedBlack.push(taken);
      playCapture();
    } else {
      playMove();
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
        playCheckmate();
        this.recordLocalResult(this.winner.toLowerCase() === this.playerColor ? 'win' : 'loss');
      } else {
        this.stalemate = true;
        this.gameOver = true;
        this.winner = 'Draw';
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
    if (this.gameOver && !silentReplay) setTimeout(() => showGameOverOverlay(), 400);
    return true;
  }

  getNotation(fr, fc, tr, tc, cap, promoted, castled) {
    const piece = this.board[tr][tc];
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
    if (this.checkmate) nota += '#';
    else if (this.check) nota += '+';
    return nota;
  }

  recordLocalResult(res) {
    if (silentReplay) return;
    if (!res || this.isMultiplayer) return;
    if (res === 'win') persistedStats.wins++;
    else if (res === 'loss') persistedStats.losses++;
    else persistedStats.draws++;
    persistedStats.gamesPlayed++;
    const oppElo = BOT_CONFIGS[this.difficulty]?.elo || 1200;
    if (res === 'win') persistedStats.elo += Math.max(1, Math.floor((oppElo - persistedStats.elo) / 100) + 10);
    else if (res === 'loss') persistedStats.elo = Math.max(100, persistedStats.elo - Math.max(1, Math.floor((persistedStats.elo - oppElo) / 100) + 5));
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
      if (p) p.hasMoved = true;
    }
    return b;
  }
}
