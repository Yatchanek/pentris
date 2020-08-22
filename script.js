const COLS = 14;
const ROWS = 24;
const BORDER_WIDTH = 10;
const gameWindow = document.querySelector('.game-window');
const ctx = gameWindow.getContext('2d');
const gap = 1;
let pentomino;
let cellSize = 38;
let wWidth;
let wHeight;
let gameWidth;
let gameHeight;
let run;
let delta = 0;
let lastFrame = 0;
let elapsedTime = 0;
let tickElapsedTime = 0;
let grid = [];
let fullLines = [];
let tick = 0;
let lastTick = 0;
let speed = 1000;
let frameCount = 0;
let linesCount = 0;
let fontSize;
let score = 0;
let level = 1;
let gameState = 'loading';
let nextState = 'loading';
let keyHold = false;
let gameTick = true;
let hints = true;
let advanceLevel = false;
let blocks = new Image();
blocks.src = './res/blocks.png';
let resCount = 0;
blocks.onload = () => {
    resCount++;
    if (resCount === 1) {
        nextState = 'playing';
    }
}

setup();
pentomino.selectNewPiece();
run = requestAnimationFrame(gameLoop)


function setup() {
    wWidth = gameWindow.width = window.innerWidth;
    wHeight = gameWindow.height = window.innerHeight; 
    cellSize = Math.floor(wHeight * 0.95 / ROWS);
    fontSize = cellSize;
    gameHeight = cellSize * ROWS;
    gameWidth = cellSize * COLS;
    pentomino = new Pentomino(cellSize, Math.floor(wWidth / 2 - gameWidth / 2), Math.floor((wHeight - gameHeight) / 2));
    createGrid();
    ctx.font = `bold ${fontSize}px "Arial Bold"`;
}


function gameLoop(timestamp) {
    delta = timestamp - lastFrame;
    elapsedTime +=delta;
    tickElapsedTime +=delta;
    lastFrame = timestamp;

    if (tickElapsedTime > 50) {
        gameTick = true;
        tickElapsedTime = 0;
        tick++;
    }

    cls();
    drawGrid();
    pentomino.draw();
    if(hints) {
        pentomino.dropShadow();
        pentomino.drawShadow();
    }
     
    ctx.fillStyle = 'rgb(20, 20, 20)';     
    ctx.fillText(`SCORE: ${score}`, 30, fontSize)     
    ctx.fillText(`LINES: ${linesCount}`, 30, 2 * fontSize)
    ctx.fillText(`LEVEL: ${level}`, 30, 3 * fontSize)
    ctx.fillText('NEXT: ', wWidth - 6* fontSize, fontSize)
    

    if (gameState === 'paused') {
        ctx.save();
        ctx.font = 'bold 100px "Arial Bold"';
        ctx.fillStyle = 'rgba(0, 0, 0, .5)'
        ctx.fillRect(wWidth / 2 - wWidth / 6, wHeight / 2 - wHeight / 6, wWidth / 3, wHeight / 3)
        let w = ctx.measureText('PAUSED').width;
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillText('PAUSED', wWidth / 2 - w / 2, wHeight / 2 + 25);
        ctx.restore();
    }

    if (gameState === 'gameOver') {
        ctx.save();
        ctx.font = 'bold 100px "Arial Bold"';
        ctx.fillStyle = 'rgba(0, 0, 0, .5)'
        ctx.fillRect(wWidth / 2 - wWidth / 4, wHeight / 2 - wHeight / 6, wWidth / 2, wHeight / 3)
        let w = ctx.measureText('GAME  OVER').width;
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillText('GAME OVER', wWidth / 2 - w / 2, wHeight / 2 + 25);
        ctx.restore();
    }
    

    if (gameState === 'restart') {
        if (tick - lastTick === 10) {
            nextState = 'playing';
        }
    }

    if (gameState === 'removing') {
        fullLines.forEach(line => {
            for (let px = 1; px < COLS - 1; px++) {
                grid[line * COLS + px] = tick % 10;
            }
        });


        if(tick - lastTick === 10) {
            fullLines.forEach(line => {
                for (let px = 1; px < COLS -1; px ++) {                     
                        grid[line * COLS + px] = grid[(line - 1) * COLS + px];
                        grid[px] = null;    
                }
            });
            
            fullLines = [];
            pentomino.selectNewPiece();
            nextState = 'playing';
        }

    }

    if (gameState === 'playing') {
        if (pentomino.currentPiece === null) {
            pentomino.selectNewPiece();
        }

        if (!pentomino.fits(pentomino.currentX, pentomino.currentY, pentomino.rotation)) {
            nextState = 'gameOver';
        } 
     
    
        if (elapsedTime > speed) {
            elapsedTime = 0;
            
            if (pentomino.fits(pentomino.currentX, pentomino.currentY + 1, pentomino.rotation)) {
               pentomino.currentY++;
               
            }
            
            else {
                score +=10;
                for (let px = 0; px < 5; px ++) {
                    for (let py = 0; py < 5; py ++) {
                        if (pentomino.pentominos[pentomino.currentPiece][pentomino.rotate(px, py, pentomino.rotation)] === 'X') {
                            grid[(pentomino.currentY + py) * COLS + (pentomino.currentX + px)] = pentomino.currentPiece;
                        }
                    }
                }
                
                for (let py = 0; py < 5; py++) {
                        if (pentomino.currentY + py < ROWS - 1) {
                            let isLine = true;
                            for (let px = 1; px < COLS - 1; px++) {
                                isLine &= grid[(pentomino.currentY + py) * COLS + px] !=null;
                            }
                            if(isLine) {
                                fullLines.push(pentomino.currentY + py);
                                linesCount++;
                                if (linesCount % 10 === 0) advanceLevel = true;
                            }
                        }
                        
                    }
        
                    if (fullLines.length) {
                         let bonus = 0.2 * fullLines.length;
                         if (fullLines.length === 5) bonus *= 1.5;
                         score += fullLines.length * 50 * (1+bonus);
                         nextState = 'removing';
                         pentomino.currentPiece = null;
                         lastTick = tick;
                    }
                
                if (advanceLevel) {
                    speed -= 100;
                    level++;
                    advanceLevel = false;
                }
    
                if (nextState != 'removing') {
                pentomino.selectNewPiece();
                }    
             }
           
        }
        pentomino.shadowY = pentomino.currentY;
    }
    gameState = nextState;
    requestAnimationFrame(gameLoop);
}

function cls() {
    ctx.save();
    ctx.fillStyle = 'rgba(215, 215, 215, .7)';
    ctx.fillRect(0,0, wWidth, wHeight);
    ctx.restore();
}


function createGrid() { 
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            grid[y * COLS + x] = (x === 0 || x === COLS - 1 || y === ROWS - 1) ? 20 : null;      
        }
    }
}

function drawGrid() {
 
    for (let x = 0; x < COLS; x++) {
  
         for (let y = 0; y < ROWS; y++) {
     
            if ((grid[y * COLS + x]) != null) {

                ctx.drawImage(blocks, grid[y * COLS + x] * 32, 0, 32, 32, pentomino.originX + x * cellSize, pentomino.originY + y * cellSize, cellSize, cellSize);
                // ctx.save();
                // ctx.fillStyle = pentomino.colors[grid[y * COLS + x]];
                // ctx.fillRect(pentomino.originX + x * cellSize, pentomino.originY + y * cellSize, cellSize - 1, cellSize - 1);
                // ctx.restore();
            }
           
        }
        
    }
}

function restartGame() {
    score = 0;
    level = 1;
    for (let x = 1; x < COLS - 1; x++) {
  
        for (let y = 0; y < ROWS - 1; y++) {
    
           grid[y * COLS + x] = null;
      
          
       }
       
   }

        pentomino.currentPiece = null;
        lastTick = tick;
        nextState = 'restart';
    
}

function keyPressed(e) {
    let code = e.keyCode;
    switch(code) {
        case 37: //Left Arrow
            if (gameTick && pentomino.fits(pentomino.currentX-1, pentomino.currentY, pentomino.rotation)) {
                pentomino.currentX--;
                pentomino.shadowX--;
                gameTick = false;
            }
        break;
        case 39: //Right Arrow    
        if (gameTick && pentomino.fits(pentomino.currentX+1, pentomino.currentY, pentomino.rotation)) {
            pentomino.currentX++;
            pentomino.shadowX++;
            gameTick = false;
            }
        break;
        case 38: //Up Arrow
            if (!keyHold && pentomino.fits(pentomino.currentX, pentomino.currentY, pentomino.rotation+1)) {
            pentomino.rotation++;
            keyHold = true;
            }
        break;
        case 40: //Down Arrow
            if (gameTick && pentomino.fits(pentomino.currentX, pentomino.currentY+1, pentomino.rotation)) {
            pentomino.currentY++;
            gameTick = false;
            }
        break;
        case 80: //P
            if (gameState === 'playing') {
                nextState = 'paused';
            } else if (gameState === 'paused')
            {
               nextState = 'playing'
               
            }
        break;
        case 72: //H
            hints = !hints;
        break;
        case 32: //SPACE
            pentomino.dropSelf();
        break;
    }
}

function resize() {
    wWidth = gameWindow.width = window.innerWidth;
    wHeight = gameWindow.height = window.innerHeight;
    cellSize = Math.floor(wHeight * 0.95 / ROWS);
    gameHeight = cellSize * ROWS;
    gameWidth = cellSize * COLS;
    pentomino.originX = Math.floor(wWidth / 2 - gameWidth / 2); 
    pentomino.originY = Math.floor((wHeight - gameHeight) / 2);
    fontSize = cellSize;
    ctx.font = `${fontSize}px "Arial Bold"`;
}

window.addEventListener('keydown', keyPressed);
window.addEventListener('keyup', () => keyHold = false);
window.addEventListener('click', () => { lastTick = tick; restartGame() } );
window.addEventListener('resize', resize);
