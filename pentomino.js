class Pentomino {
    constructor(originX, originY) {
        this.pentominos = [
            '..X....X....X....X....X..',
            '......XXX...X....X.......',
            '......XXX..X.X...........',
            '.......X...XXX...X.......',
            '......X....XXX....X......',
            '........X..XXX..X........',
            '.......X...XX...XX.......',
            '.......X....XX...XX......',
            '..X....X....X...XX.......',
            '..X....X....X....XX......',
            '..X....XX...X....X.......',
            '..X...XX....X....X.......',
            '........X...XX..XX.......',
            '.......XX..XX....X.......',
            '......XX....XX...X.......',
            '..X....X...XX...X........',
            '..X....X....XX....X......',
            '......XXX..X....X........'
        ]

        this.originX = originX;
        this.originY = originY;
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropped = false;
    }

    rotate(px, py, r) {
        let pIndex = 0;
        switch(r % 4) {
            case 0:
            pIndex = py * 5 + px;
            break;
            case 1:
            pIndex = 20 + py - (px * 5);
            break;
            case 2:
            pIndex = 24 - (py * 5) - px;
            break;
            case 3:
            pIndex = 4 - py + (px * 5);
            break;
        }
        return pIndex;
    }

    draw() {
        if (this.currentPiece != null) {
            for (let px = 0; px < 5; px ++) {
                for (let py = 0; py < 5; py ++) {
                    if (this.pentominos[this.currentPiece][this.rotate(px, py, this.rotation)] === 'X') {
                        
                        ctx.drawImage(blocks, this.currentPiece * 32, 0, 32, 32, this.originX + (this.currentX + px) * cellSize, 
                                      this.originY + (this.currentY + py)* cellSize, cellSize, cellSize);
                      
                    }
                }
            }
        }
       
        for (let px = 0; px < 5; px ++) {
            for (let py = 0; py < 5; py ++) {

                if (this.pentominos[this.nextPiece][this.rotate(px, py, 0)] === 'X') {
                    ctx.drawImage(blocks, this.nextPiece * 32, 0, 32, 32, wWidth - 7 * cellSize * scale +  px * cellSize * scale, 
                                   cellSize * scale * 2 + py * cellSize * scale, cellSize * scale, cellSize * scale)
                }
            }
        }         
    }

    drawShadow() {
        if (this.currentPiece != null && !this.dropped) {
            for (let px = 0; px < 5; px ++) {
                for (let py = 0; py < 5; py ++) {
                    if (this.pentominos[this.currentPiece][this.rotate(px, py, this.rotation)] === 'X') {
                        ctx.save();
                        ctx.strokeStyle = 'rgba(150, 150, 150, .5)'; //this.colors[this.currentPiece];
                        ctx.lineWidth = 1;
                        ctx.strokeRect(this.originX + (this.currentX + px) * cellSize, this.originY + (this.shadowY + py)* cellSize, cellSize - 4, cellSize - 4);
                        ctx.restore();
                    }
                }
            
            }
        } 
    }
    

    fits(x, y, r) {
        if (this.currentPiece !=null) {
            for (let px = 0; px < 5; px ++) {
                for (let py = 0; py < 5; py ++) {
                    let pIndex = this.rotate(px, py, r);
                    let gIndex = (y + py) * COLS + (x + px);
         
                    if (x + px >= 0 && x + px < COLS) {
                        if (y + py >=0 && y + py < ROWS) {
        
                            if (this.pentominos[this.currentPiece][pIndex] === 'X' && grid [gIndex] != null) {
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        }
    }

    selectNewPiece() {

        if (this.nextPiece === null) {
            this.nextPiece = this.currentPiece = Math.floor(Math.random() * 18); 
        }

        this.currentPiece = this.nextPiece;
        this.nextPiece = Math.floor(Math.random() * 18);

        this.shadowX = this.currentX = COLS / 2 - 1;
        this.shadowY = this.currentY = 0;
        this.rotation = 0;
        this.dropped = false;
    }

    dropSelf() {
        while(this.fits(this.currentX, this.currentY + 1, this.rotation)) {
            this.currentY++;
        }
        this.droped = true;      
    }

    dropShadow() {
        while(this.currentPiece !=null &&! this.dropped && this.fits(this.currentX, this.shadowY + 1, this.rotation)) {
            this.shadowY++;
        }
    }
}