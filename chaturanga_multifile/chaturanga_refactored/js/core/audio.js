
const audioSystem = {
  sounds: {}, initialized: false,
  init() {
    if (this.initialized) return;
    const urls = {
      move: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/click.mp3',
      capture: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3',
      check: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/event-warning.mp3',
      start: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-start.mp3',
      end: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/notification.mp3'
    };
    for (const k in urls) this.sounds[k] = new Audio(urls[k]);
    this.initialized = true;
  },
  play(key) {
    if (!soundEnabled) return;
    this.init();
    const s = this.sounds[key];
    if (s) { try { s.currentTime = 0; s.play().catch(() => {}); } catch (e) {} }
  }
};
function playMove() { if (silentReplay) return; audioSystem.play('move'); }
function playCapture() { if (silentReplay) return; audioSystem.play('capture'); }
function playCheck() { if (silentReplay) return; audioSystem.play('check'); }
function playCheckmate() { if (silentReplay) return; audioSystem.play('end'); }
function playStart() { if (silentReplay) return; audioSystem.play('start'); }
