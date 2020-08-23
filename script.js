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
let keys = [];
let tick = 0;
let lastTick = 0;
let speed = 1000;
let frameCount = 0;
let linesCount = 0;
let fontSize;
let score = 0;
let level = 1;
let scale;
let gameState = 'loading';
let nextState = 'loading';
let keyHold = false;
let gameTick = true;
let hints = true;
let hintsAllowed = false;
let hardCoreMode = false;
let advanceLevel = false;
let playing = false;
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

function setup() {
    scale = wWidth / sWidth;
    wWidth = gameWindow.width = window.innerWidth;
    wHeight = gameWindow.height = window.innerHeight; 
    cellSize = Math.floor(wHeight * 0.95 / ROWS);
    fontSize = cellSize;
    gameHeight = cellSize * ROWS;
    gameWidth = cellSize * COLS;
    pentomino = new Pentomino(Math.floor(wWidth / 2 - gameWidth / 2), Math.floor((wHeight - gameHeight) / 2));
    createGrid();
    ctx.font = `bold ${fontSize}px "Arial Bold"`;
    nextState = 'titleScreen'
}


function gameLoop(timestamp) {
    scale = wWidth / sWidth;
    frameCount++;
    delta = timestamp - lastFrame;
    elapsedTime +=delta;
    tickElapsedTime +=delta;
    lastFrame = timestamp;

    if (tickElapsedTime > 50) {
        tickElapsedTime = 0;
        tick++;
        gameTick = true;
    }
    cls();

    if (gameState === 'titleScreen') {
        playing = false;
        let w = title.width;``
        let h = title.height;
        //Title
        ctx.save();
        ctx.transform(1, 0, 0, 1, (wWidth - w * scale) / 6 * Math.sin(elapsedTime / 3000) , wHeight * 0.02 * Math.cos(elapsedTime/750));
        ctx.drawImage(title, 0, 322 * (Math.floor(tick / 60) % 3), w, 322, (wWidth - w * scale) / 2, wHeight / 10 * scale, 
                       w * scale, 322 * scale);
        ctx.restore();

        //Start Game Button Animation
        if (mouseX > (wWidth - 476 * scale) / 2 && mouseX < (wWidth + 476 * scale) / 2 
            && mouseY > wHeight * 0.7 && mouseY < wHeight * 0.7 + 90 * scale) {
                scale += 0.05 * Math.sin(elapsedTime/150)
            }
        ctx.drawImage(textSheet, 300, 0, 476, 95, (wWidth - 476 * scale) / 2, wHeight * 0.7, 476 * scale, 90 * scale);
                
        ctx.drawImage(cursor, mouseX - 32, mouseY - 32);
    }

    if (gameState === 'modeSelect') {
        let w = title.width;
        let h = title.height;
        let normalHover;
        let hardCoreHover;
        ctx.save();
        //Title
        ctx.transform(1, 0, 0, 1, (wWidth - w * scale) / 6 * Math.sin(elapsedTime / 3000) , wHeight * 0.02 * Math.cos(elapsedTime/750));
        ctx.drawImage(title, 0, 322 * (Math.floor(tick / 60) % 3), w, 322, (wWidth - w * scale) / 2, wHeight / 10 * scale, 
                       w * scale, 322 * scale);
        ctx.restore();

        //Select game mode
        ctx.drawImage(textSheet, 0, 300, 935, 100, (wWidth - 935 * scale) / 2, wHeight * 0.55, 935 * scale, 100 * scale);
      
        //Hover animations
        if ((mouseY > wHeight * 0.75 && mouseY < wHeight * 0.75 + 55 * scale) && 
            (mouseX > wWidth / 2 - 285 * scale - wWidth / 8 && mouseX < wWidth / 2 - wWidth / 8)) {
                scale += 0.05 * Math.sin(elapsedTime/150);
                normalHover = true; 
            }
        ctx.drawImage(textSheet, 0, 420, 285, 55, wWidth / 2 - 285 * scale - wWidth / 8, wHeight * 0.75, 285 * scale, 55 * scale);
        
        scale = wWidth / sWidth;  
        
        if ((mouseY > wHeight * 0.75 && mouseY < wHeight * 0.75 + 55 * scale) &&
           (mouseX > wWidth / 2 + wWidth / 8 && mouseX < wWidth / 2 + wWidth / 8 + 366 * scale)) {
                scale += 0.05 * Math.sin(elapsedTime/150);
                hardCoreHover = true;
           }
           
           ctx.drawImage(textSheet, 300, 420, 366, 55, wWidth / 2 + wWidth / 8, wHeight * 0.75, 366 * scale, 55 * scale);

           scale = wWidth / sWidth;

        //Mode explanation
        if (normalHover) {
            ctx.drawImage(textSheet, 350, 100, 225, 55, wWidth / 2 - 285 * scale - wWidth / 8, wHeight * 0.75 + 80 * scale, 225 * scale, 55 * scale);
        }
        if (hardCoreHover) {
            ctx.drawImage(textSheet, 600, 100, 285, 55, wWidth / 2 + wWidth / 8, wHeight * 0.75 + 80 * scale, 285 * scale, 55 * scale);
        }

        ctx.drawImage(cursor, mouseX - 32, mouseY - 32);
    }

    if (playing) {
        drawGrid();
        checkKeyInput();
        pentomino.draw();
        if(hints) {
            pentomino.dropShadow();
            pentomino.drawShadow();
        }
        
        ctx.drawImage(textSheet, 0, 0, 127, 27, 30 * scale, 20 * scale, 127 * scale, 27 * scale);
        let s = score.toString();
        let count = 0;
        for (char of s) {
            ctx.drawImage(textSheet, +char * 32, 122, 31, 28, 175 * scale + count * 32 * scale, 20 * scale, 32 * scale, 27 * scale);
            count++;
        }

        s = linesCount.toString();
        count = 0;
        ctx.drawImage(textSheet, 0, 30, 122, 27, 30 * scale, 70 * scale, 122 * scale, 27 * scale);
        for (char of s) {
            ctx.drawImage(textSheet, +char * 32, 122, 31, 28, 165 * scale + count * 32 * scale, 70 * scale, 32 * scale, 27 * scale);
            count++;
        }

        s = level.toString();
        count = 0;
        ctx.drawImage(textSheet, 0, 60, 127, 27, 30 * scale, 120 * scale, 127 * scale, 27 * scale);
        for (char of s) {
            ctx.drawImage(textSheet, +char * 32, 122, 31, 28, 175 * scale + count * 32 * scale, 120 * scale, 32 * scale, 27 * scale);
            count++;
        }

        ctx.drawImage(textSheet, 0, 90, 122, 27, wWidth - 6 * fontSize * scale, 10 * scale, 122 * scale, 27 * scale)

    }

    
    

    if (gameState === 'paused') {
        ctx.save();
        ctx.fillStyle = `rgba(16, 25, 41, 1)`;
        ctx.fillRect(pentomino.originX + cellSize, pentomino.originY, cellSize * (COLS - 2), cellSize * (ROWS - 1));
        ctx.font = 'bold 100px "Arial Bold"';
        ctx.fillStyle = 'rgba(0, 0, 0, .5)'
        ctx.fillRect(wWidth / 2 - wWidth / 6, wHeight / 2 - wHeight / 6, wWidth / 3, wHeight / 3)
        let w = ctx.measureText('PAUSED').width;
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillText('PAUSED', wWidth / 2 - w / 2, wHeight / 2 + 25);
        
        ctx.restore();
    }


    if (gameState === 'gameOver') {
        ctx.drawImage(textSheet, 0, 160, 875, 105, wWidth / 2 - 437 * scale, wHeight / 2 - 52 * scale, 875 * scale, 105 * scale);
        
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
                    for (let py = line; py > 0; py--) {
                        grid[py * COLS + px] = grid[(py - 1) * COLS + px];
                        grid[px] = null; 
                    }                     
   
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
                pentomino.dropped = true;
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
                            if(!emptyPieceLine(py)) {
                            for (let px = 1; px < COLS - 1; px++) {
                                
                                    isLine &= grid[(pentomino.currentY + py) * COLS + px] !=null;
                                }
                            }
                            else {
                                isLine = false;
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

        if (hardCoreMode && gameTick && tick % 750 === 0 && Math.random() < 0.3) {
            for (py = 0; py < ROWS - 1; py++) {
                for (px = 1; px < COLS - 1; px++) {
                    grid[py * COLS + px] = grid[(py + 1) * COLS + px]
                }
            }
    
            for (let px = 1; px < COLS -1; px ++) {                       
                grid[(ROWS - 2) * COLS + px] = Math.random() < 0.33 ? null : Math.floor(Math.random() * 18);
            }
            gameTick = false;
        }
    }

    gameState = nextState;
    window.requestAnimationFrame(gameLoop);
}

function cls() {
    ctx.save();
    switch (gameState) {
        case 'titleScreen':
            ctx.fillStyle = `rgba(${80 + 20 * Math.sin(frameCount / 60)}, 0, 0)`; 
        break;
        default:
            ctx.fillStyle = `rgba(16, 25, 41, 1)`;
    }
       
    ctx.fillRect(0,0, wWidth, wHeight);
    ctx.restore();
}

function emptyPieceLine(py) {
    let count = 0;
    for(px = 0; px < 5; px++) {
        if (pentomino.pentominos[pentomino.currentPiece][pentomino.rotate(px, py, pentomino.rotation)] === '.') {
            count++;
        }
    }
    return (count === 5);
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
            }
           
        }
        
    }
}

function restartGame() {
    score = 0;
    linesCount = 0;
    level = 1;
    for (let x = 1; x < COLS - 1; x++) {
  
        for (let y = 0; y < ROWS - 1; y++) {
    
           grid[y * COLS + x] = null;
      
          
       }
       
   }

        pentomino.currentPiece = null;
        pentomino.nextPiece = null;
        hardCoreMode = false;
        hintsAllowed = false;
        hints = true;
        pentomino.selectNewPiece();
        lastTick = tick;
        nextState = 'titleScreen';
    
}


function checkKeyInput() {

    if (gameState != 'paused' && gameState != 'titleScreen') {
        //Left Arrow
        if (keys[37] && !pentomino.dropped && pentomino.fits(pentomino.currentX-1, pentomino.currentY, pentomino.rotation)) {
            pentomino.currentX--;
    }
    
    //Right Arrow    
    if (keys[39] && !pentomino.dropped && pentomino.fits(pentomino.currentX+1, pentomino.currentY, pentomino.rotation)) {
        pentomino.currentX++;
        }
     //Up Arrow
        if (keys[38] && !pentomino.dropped && !keyHold && pentomino.fits(pentomino.currentX, pentomino.currentY, pentomino.rotation+1)) {
        pentomino.rotation++;
        keyHold = true;
        }
    //Down Arrow
        if (keys[40] && pentomino.fits(pentomino.currentX, pentomino.currentY+1, pentomino.rotation)) {
        pentomino.currentY++;
        }
    //P
    if(keys[80]) {
        if (gameState === 'playing') {
            nextState = 'paused';
        } else if (gameState === 'paused')
        {
           nextState = 'playing'
           
        }
    }

    //H
    if (keys[72] && hintsAllowed) hints = !hints;
    
   //SPACE
    if (keys[32]) {
        pentomino.dropSelf();
    }
 
    
    }

    if(keys[80]) {
        if (gameState === 'playing') {
            nextState = 'paused';
        } else if (gameState === 'paused')
        {
           nextState = 'playing'
           
        }
    }
    
    if (gameState === 'gameOver' && keys.length) {
        restartGame();
    }

    keys = [];
}

function handleClick() {

    if (gameState === 'gameOver') {
        restartGame();
    }

    if (gameState === 'titleScreen') {
        if ((mouseX > wWidth / 2 - startButton.width / 2) && (mouseX < wWidth / 2 + startButton.width / 2) 
            && (mouseY > wHeight * 0.7) / 2 && (mouseY < wHeight * 0.7 + startButton.height)) {
                
                nextState = 'modeSelect';
        }
    }

    if (gameState === 'modeSelect') {

        if ((mouseY > wHeight * 0.75 && mouseY < wHeight * 0.75 + 55 * scale) && 
            (mouseX > wWidth / 2 - 285 * scale - wWidth / 8 && mouseX < wWidth / 2 - wWidth / 8)) {
                hardCoreMode = false;
                hintsAllowed = true;
            }
            if ((mouseY > wHeight * 0.75 && mouseY < wHeight * 0.75 + 55 * scale) &&
            (mouseX > wWidth / 2 + wWidth / 8 && mouseX < wWidth / 2 + wWidth / 8 + 366 * scale)) {
                hardCoreMode = true;
                hints = false;
                hintsAllowed = false;
            }
        pentomino.selectNewPiece();
        playing = true;
        nextState = 'playing';
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
    scale = wWidth / sWidth;
}

function assetLoader() {
    resCount++;
    if (resCount === 5) {
        setup();
        window.requestAnimationFrame(gameLoop);
    }
}

window.addEventListener('keydown', (e) => keys[e.keyCode] = true);
window.addEventListener('keyup', () => keyHold = false);
window.addEventListener('click', handleClick);
window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => { mouseX = e.pageX; mouseY = e.pageY})
