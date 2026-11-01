// ==========================================
// CORE STATE & GLOBALS
// ==========================================
const API_BASE = window.location.origin;

let wsClient = null;
let wsConnected = false;
let authUser = null;
let currentOnlineRoom = null;
let onlinePlayerColor = null;

let clockModel = null;
let clockTimerId = null;

let pendingOptimisticSnapshot = null;
let pendingOptimisticMove = null;
let drawOfferCooldownUntil = 0;
let drawOfferBannerActive = false;
let rematchBannerActive = false;
let disconnectTimerId = null;
let lastGameOverInfo = null;
let matchStartAt = 0;
let firstMoveAt = 0;
let silentReplay = false;

let gameMode = 'standard';
let soundEnabled = true;
let timeControl = { base: 600, inc: 0 };
let currentScreen = 'profile';
let friendColor = 'random';
let searchInterval = null;
let searchStart = 0;
let selectedBot = null;

let gameState = null;
let boardSize = 560;
let sqSize = 70;
let boardFlipped = false;
let aiThinking = false;
let pendingPromotion = null;
let toastTimeout = null;

let lbData = [];
let lbTab = 'elo';
let persistedStats = { wins: 0, losses: 0, draws: 0, elo: 1200, gamesPlayed: 0, achievements: {} };

let currentPuzzle = null;
let puzzleBoard = null;
let puzzleSelected = null;
let puzzleSolved = false;
