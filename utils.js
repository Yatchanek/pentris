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
		pentomino.dropped = true;
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
    
    if (gameState === 'gameOver' && keys.length && tick - lastTick > 10) {
        restartGame();
    }

    keys = [];
}

function handleClick() {

    if (gameState === 'gameOver') {
        restartGame();
    }

    if (gameState === 'titleScreen') {
        if (isClicked( wWidth / 2 - startButton.width / 2, wWidth / 2 + startButton.width / 2, 
                       wHeight * 0.7, wHeight * 0.7 + startButton.height)) {
                
                nextState = 'modeSelect';
        }
    }

    if (gameState === 'modeSelect') {
        if (isClicked(wWidth / 2 - 285 * scale - wWidth / 8, wWidth / 2 - wWidth / 8,
                      wHeight * 0.75, wHeight * 0.75 + 55 * scale)) {
                hardCoreMode = false;
                hintsAllowed = true;
                hints = true;

                pentomino.selectNewPiece();
                ongoingPlay = true;
                nextState = 'playing';
        }

        else if (isClicked(wWidth / 2 + wWidth / 8, wWidth / 2 + wWidth / 8 + 366 * scale,
                           wHeight * 0.75, wHeight * 0.75 + 55 * scale)) {
                hardCoreMode = true;
                hints = false;
                hintsAllowed = false;

                pentomino.selectNewPiece();
                ongoingPlay = true;
                nextState = 'playing';
        }
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

function isClicked(x1, x2, y1, y2) {
    return (mouseX > x1 && mouseX < x2 && mouseY > y1 && mouseY < y2);
}

function calculateHighestRow() {
    let check = 0;
    for (py = ROWS - 2; py >=0; py--) {       
        for (px = 1; px < COLS - 1; px++) {
            check |= grid[py * COLS + px];
        }
        if (check === 0) return py + 1;
        check = 0;
    }
    return 0;
}