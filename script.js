function setup() {
    scale = wWidth / sWidth;
    wWidth = gameWindow.width = window.innerWidth;
    wHeight = gameWindow.height = window.innerHeight; 
    cellSize = Math.floor(wHeight * 0.95 / ROWS);
    gameHeight = cellSize * ROWS;
    gameWidth = cellSize * COLS;
    pentomino = new Pentomino(Math.floor(wWidth / 2 - gameWidth / 2), Math.floor((wHeight - gameHeight) / 2));
    createGrid();
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
        ongoingPlay = false;
        let w = title.width;
        let h = title.height;

        //Title
        ctx.save();
        ctx.transform(1, 0, 0, 1, (wWidth - w * scale) / 6 * Math.sin(elapsedTime / 3000) , wHeight * 0.02 * Math.cos(elapsedTime/750));
        ctx.drawImage(title, 0, 322 * (Math.floor(tick / 60) % 3), w, 322, (wWidth - w * scale) / 2, wHeight / 10 * scale, 
                       w * scale, 322 * scale);
        ctx.restore();

        //Start Game Button Animation
        if (isClicked((wWidth - 476 * scale) / 2, (wWidth + 476 * scale) / 2, 
                       wHeight * 0.7, wHeight * 0.7 + 90 * scale)) {
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
        if (isClicked(wWidth / 2 - 285 * scale - wWidth / 8, wWidth / 2 - wWidth / 8,
                      wHeight * 0.75, wHeight * 0.75 + 55 * scale)) {
            scale += 0.05 * Math.sin(elapsedTime/150);
            normalHover = true; 
        }

        ctx.drawImage(textSheet, 0, 420, 285, 55, wWidth / 2 - 285 * scale - wWidth / 8, 
                      wHeight * 0.75, 285 * scale, 55 * scale);
        
        scale = wWidth / sWidth;  
        
        if (isClicked(wWidth / 2 + wWidth / 8, wWidth / 2 + wWidth / 8 + 366 * scale,
                      wHeight * 0.75, wHeight * 0.75 + 55 * scale)) {
            scale += 0.05 * Math.sin(elapsedTime/150);
            hardCoreHover = true;
        }
           
           ctx.drawImage(textSheet, 300, 420, 366, 55, wWidth / 2 + wWidth / 8, 
                         wHeight * 0.75, 366 * scale, 55 * scale);

           scale = wWidth / sWidth;

        //Mode explanation
        if (normalHover) {
            ctx.drawImage(textSheet, 350, 100, 225, 55, wWidth / 2 - 285 * scale - wWidth / 8,
                          wHeight * 0.75 + 80 * scale, 225 * scale, 55 * scale);
        }
        if (hardCoreHover) {
            ctx.drawImage(textSheet, 600, 100, 285, 55, wWidth / 2 + wWidth / 8, 
                          wHeight * 0.75 + 80 * scale, 285 * scale, 55 * scale);
        }

        ctx.drawImage(cursor, mouseX - 32, mouseY - 32);
    }

    if (ongoingPlay) {

        drawGrid();
        drawInfo();
        checkKeyInput()

        pentomino.draw();

        if(hints) {
            pentomino.dropShadow();
            pentomino.drawShadow();
        }     
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
        ctx.drawImage(textSheet, 0, 160, 875, 105, wWidth / 2 - 437 * scale, 
                      wHeight / 2 - 52 * scale, 875 * scale, 105 * scale);
        if (hardCoreMode && score > hHighScore) {
            hHighScore = score;
        }

        if(!hardCoreMode && score > nHighScore) {
            nHighScore = score;
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
            bonus = 0;
            nextState = 'playing';
        }

    }
    
    if (gameState === 'randomRow') {
 
        for (let px = 1; px < COLS -1; px ++) {                       
                grid[highestRow * COLS + px] = Math.random() < 0.33 ? null : Math.floor(Math.random() * 18);
        }

        if (tick - lastTick > 10) {
            nextState = 'playing';
        }
        
    }



    if (gameState === 'playing') {

        if (pentomino.currentPiece === null) {
            pentomino.selectNewPiece();
        }

        if (!pentomino.fits(pentomino.currentX, pentomino.currentY, pentomino.rotation)) {
            lastTick = tick;
            nextState = 'gameOver';
        } 

        if (elapsedTime > speed) {
            elapsedTime = 0;
            
            if (pentomino.fits(pentomino.currentX, pentomino.currentY + 1, pentomino.rotation)) {
               pentomino.currentY++;        
            }
            
            else {
                score +=10 * (1+bonus);
                score = Math.floor(score);
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
                         bonus += fullLines.length * 0.25;
                         if (fullLines.length === 5) bonus *= 1.5;
                         score += fullLines.length * 50 * (1+bonus);
                         score = Math.floor(score);
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
                    bonus = 0;
                    pentomino.selectNewPiece();
                
                    if (hardCoreMode && Math.random() < 0.05) {
                        highestRow = calculateHighestRow();
                     highestRow += Math.floor(Math.random() * (ROWS - highestRow - 2));
                         if (highestRow < ROWS - 2 && highestRow === calculateHighestRow()) {
                             highestRow++;
                         }
     
                         lastTick = tick;
                         gameTick = false;
                         nextState = 'randomRow'
                     }
                }

                }      
        }
        pentomino.shadowY = pentomino.currentY;
    }

    gameState = nextState;
    window.requestAnimationFrame(gameLoop);
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
                ctx.drawImage(blocks, grid[y * COLS + x] * 32, 0, 32, 32, 
                              pentomino.originX + x * cellSize, pentomino.originY + y * cellSize, cellSize, cellSize);
            }
           
        }
        
    }
}

function restartGame() {
    score = 0;
    linesCount = 0;
    level = 1;
    bonus = 0;
    speed = 1000;
    keys = [];
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


function drawInfo() {
    ctx.drawImage(textSheet, 675, 400, 233, 35, 30 * scale, 20 * scale, 233 * scale, 35 * scale);
    let s = hardCoreMode ? hHighScore.toString() : nHighScore.toString();
    let count = 0;
    for (char of s) {
        ctx.drawImage(textSheet, +char * 32, 122, 31, 28, 275 * scale + count * 32 * scale, 22 * scale, 32 * scale, 27 * scale);
        count++;
    }


    ctx.drawImage(textSheet, 0, 0, 127, 27, 30 * scale, 70 * scale, 127 * scale, 27 * scale);
        s = score.toString();
        count = 0;
        for (char of s) {
            ctx.drawImage(textSheet, +char * 32, 122, 31, 28, 175 * scale + count * 32 * scale, 70 * scale, 32 * scale, 27 * scale);
            count++;
        }

        s = linesCount.toString();
        count = 0;
        ctx.drawImage(textSheet, 0, 30, 122, 27, 30 * scale, 120 * scale, 122 * scale, 27 * scale);
        for (char of s) {
            ctx.drawImage(textSheet, +char * 32, 122, 31, 28, 165 * scale + count * 32 * scale, 120 * scale, 32 * scale, 27 * scale);
            count++;
        }

        s = level.toString();
        count = 0;
        ctx.drawImage(textSheet, 0, 60, 127, 27, 30 * scale, 170 * scale, 127 * scale, 27 * scale);
        for (char of s) {
            ctx.drawImage(textSheet, +char * 32, 122, 31, 28, 175 * scale + count * 32 * scale, 170 * scale, 32 * scale, 27 * scale);
            count++;
        }

        ctx.drawImage(textSheet, 0, 90, 122, 27, wWidth - 6 * fontSize * scale, 10 * scale, 122 * scale, 27 * scale)

}

window.addEventListener('keydown', (e) => keys[e.keyCode] = true);
window.addEventListener('keyup', () => keyHold = false);
window.addEventListener('click', handleClick);
window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => { mouseX = e.pageX; mouseY = e.pageY})
