// ==========================================
// AUDIO SYSTEM & PROCEDURAL SOUND SYNTHESIS
// ==========================================

const AUDIO_FILES = {
  moveSelf:     'assets/sounds/move-self.mp3',
  moveOpponent: 'assets/sounds/move-opponent.mp3',
  capture:      'assets/sounds/capture.mp3',
  castle:       'assets/sounds/castle.mp3',
  check:        'assets/sounds/move-check.mp3',
  promote:      'assets/sounds/promote.mp3',
  start:        'assets/sounds/game-start.mp3',
  end:          'assets/sounds/game-end.mp3',
  win:          'assets/sounds/game-win-long.mp3',
  lose:         'assets/sounds/game-lose-long.mp3',
  draw:         'assets/sounds/game-draw.mp3',
  illegal:      'assets/sounds/illegal.mp3',
  tenseconds:   'assets/sounds/tenseconds.mp3',
  puzzleWin:    'assets/sounds/puzzle-correct.mp3',
  puzzleFail:   'assets/sounds/puzzle-wrong.mp3'
};

const audioPool = {};

// Preload audio elements
Object.entries(AUDIO_FILES).forEach(([key, src]) => {
  try {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audioPool[key] = audio;
  } catch (e) {}
});

const audioSystem = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  },
  play(type) {
    if (!soundEnabled) return;
    
    // 1. Try playing audio track with clone for overlapping polyphony
    const soundEl = audioPool[type];
    if (soundEl) {
      try {
        const clone = soundEl.cloneNode();
        clone.volume = 0.85;
        const p = clone.play();
        if (p && p.catch) {
          p.catch(() => this.synthFallback(type));
        }
        return;
      } catch (e) {
        this.synthFallback(type);
        return;
      }
    }

    // 2. Procedural Web Audio API synthesizer fallback
    this.synthFallback(type);
  },

  synthFallback(type) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      switch (type) {
        case 'moveSelf':
        case 'moveOpponent':
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        case 'capture':
          osc.frequency.setValueAtTime(450, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
          gain.gain.setValueAtTime(0.28, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        case 'check':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.setValueAtTime(680, now + 0.09);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.22);
          break;
        case 'win':
        case 'end':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.linearRampToValueAtTime(520, now + 0.25);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        case 'start':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
      }
    } catch (e) {}
  }
};

function playMove(isOpponent) {
  if (silentReplay) return;
  audioSystem.play(isOpponent ? 'moveOpponent' : 'moveSelf');
}

function playCapture() {
  if (silentReplay) return;
  audioSystem.play('capture');
}

function playCastle() {
  if (silentReplay) return;
  audioSystem.play('castle');
}

function playPromote() {
  if (silentReplay) return;
  audioSystem.play('promote');
}

function playCheck() {
  if (silentReplay) return;
  audioSystem.play('check');
}

function playIllegal() {
  audioSystem.play('illegal');
}

function playCheckmate(won) {
  if (silentReplay) return;
  if (won === true) audioSystem.play('win');
  else if (won === false) audioSystem.play('lose');
  else audioSystem.play('end');
}

function playStart() {
  if (silentReplay) return;
  audioSystem.play('start');
}

function playPuzzleCorrect() {
  audioSystem.play('puzzleWin');
}

function playPuzzleWrong() {
  audioSystem.play('puzzleFail');
}
