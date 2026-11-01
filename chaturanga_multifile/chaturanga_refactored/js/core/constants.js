
const PREFS_KEY = 'chaturanga_prefs';
const DEFAULT_PREFS = {
  boardTheme: 'green',
  sound: true,
  highlightLegal: true,
  highlightLast: true,
  showCoords: true,
  autoPromote: false,
  confirmResign: true,
  variant: 'standard',
  timeControl: { base: 600, inc: 0 },
  botColor: 'white',
  assist: false,
  flipLocal: false
};

const SCREEN_TITLES = {
  profile: 'Profile', home: 'Home', play: 'Play', puzzles: 'Puzzles', learn: 'Learn', train: 'Train',
  watch: 'Watch', community: 'Community', other: 'Other',
  leaderboard: 'Leaderboard', settings: 'Settings', game: 'Game'
};

const TIME_GROUPS = {
  Bullet: [['1 min', 60, 0], ['1|1', 60, 1], ['2|1', 120, 1]],
  Blitz:  [['3 min', 180, 0], ['3|2', 180, 2], ['5 min', 300, 0]],
  Rapid:  [['10 min', 600, 0], ['15|10', 900, 10], ['30 min', 1800, 0]]
};

const BOT_CONFIGS = {
  beginner:     { depth: 1, elo: 600,  name: 'Novice',      desc: 'Learns as it goes' },
  intermediate: { depth: 3, elo: 1000, name: 'Average',     desc: 'Solid club beginner' },
  advanced:     { depth: 4, elo: 1400, name: 'Skilled',     desc: 'Punishes loose pieces' },
  expert:       { depth: 5, elo: 1800, name: 'Master',      desc: 'Deep tactical vision' },
  champion:     { depth: 6, elo: 2200, name: 'Fidemaster',  desc: 'Rarely blunders' },
  legend:       { depth: 7, elo: 2600, name: 'Grandmaster', desc: 'Cloud Alpha-Beta' }
};
const BOT_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a1 1 0 0 1 1 1v2h3a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h3V3a1 1 0 0 1 1-1zM9.2 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm5.6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM3 10.5h2v5H3zm16 0h2v5h-2z"/></svg>';

const THEMES = {
  green: { light: '#EBECD0', dark: '#739552', name: 'Green' },
  brown: { light: '#F0D9B5', dark: '#B58863', name: 'Brown' },
  dark:  { light: '#779952', dark: '#446633', name: 'Forest' },
  blue:  { light: '#C9D9E6', dark: '#6B8FA3', name: 'Ocean' }
};

const SYM   = { raja:'♔', mantri:'♕', ratha:'♖', gaja:'♗', ashva:'♘', padati:'♙' };
const SYM_B = { raja:'♚', mantri:'♛', ratha:'♜', gaja:'♝', ashva:'♞', padati:'♟' };
