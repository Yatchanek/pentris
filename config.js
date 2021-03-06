const COLS = 14;
const ROWS = 24;
const BORDER_WIDTH = 10;
const gameWindow = document.querySelector('.game-window');
const ctx = gameWindow.getContext('2d');
const gap = 1;
let pentomino;
let cellSize;
let bonus = 0;
let wWidth;
let wHeight;
let gameWidth;
let gameHeight;
let nHighScore = 0;
let hHighScore = 0;
let run;
let delta = 0;
let lastFrame = 0;
let elapsedTime = 0;
let tickElapsedTime = 0;
let grid = [];
let fullLines = [];
let keys = [];
let tick = 0;
let lastTick = 0;
let speed = 1000;
let frameCount = 0;
let linesCount = 0;
let fontSize;
let score = 0;
let level = 1;
let highestRow = undefined;
let scale;
let gameState = 'loading';
let nextState = 'loading';
let keyHold = false;
let gameTick = true;
let hints = true;
let hintsAllowed = false;
let hardCoreMode = false;
let advanceLevel = false;
let ongoingPlay = false;
let resCount = 0;
let blocks = new Image();
let title = new Image();
let cursor = new Image();
let startButton = new Image();
let textSheet = new Image();
let mouseX;
let mouseY;
let phase = 0;
let sWidth = window.screen.width;

blocks.src = './res/blocks.png';
blocks.onload = assetLoader();
title.src = './res/title.png';
title.onload = assetLoader();
cursor.src = './res/cursor.png';
cursor.onload = assetLoader();
startButton.src = './res/startbutton.png';
startButton.onload = assetLoader();
textSheet.src = './res/text.png';
textSheet.onload = assetLoader();

function assetLoader() {
    resCount++;
    if (resCount === 5) {
        setup();
        window.requestAnimationFrame(gameLoop);
    }
}