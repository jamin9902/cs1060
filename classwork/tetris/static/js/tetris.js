class Tetris {
    constructor() {
        this.canvas = document.getElementById('tetris');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.holdCanvas = document.getElementById('holdPiece');
        this.holdCtx = this.holdCanvas.getContext('2d');
        
        // Fixed dimensions
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 25; // Each block is 25px
        
        // Fixed canvas size (250x500)
        const actualWidth = 250;
        const actualHeight = 500;
        
        // Scale for retina displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = actualWidth * dpr;
        this.canvas.height = actualHeight * dpr;
        this.ctx.scale(dpr, dpr);
        
        // Canvas size is already set in HTML
        
        // Game state
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPaused = false;
        this.gameLoopId = null;
        
        // Tetromino shapes and colors
        this.SHAPES = {
            I: [[1, 1, 1, 1]],
            O: [[1, 1], [1, 1]],
            T: [[0, 1, 0], [1, 1, 1]],
            S: [[0, 1, 1], [1, 1, 0]],
            Z: [[1, 1, 0], [0, 1, 1]],
            J: [[1, 0, 0], [1, 1, 1]],
            L: [[0, 0, 1], [1, 1, 1]]
        };
        
        this.COLORS = {
            I: '#00f0f0',
            O: '#f0f000',
            T: '#a000f0',
            S: '#00f000',
            Z: '#f00000',
            J: '#0000f0',
            L: '#f0a000'
        };
        
        // Current piece
        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.hasHeldThisTurn = false;
        
        // Bind event handlers
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('startBtn').addEventListener('click', this.startGame.bind(this));
        document.getElementById('pauseBtn').addEventListener('click', this.togglePause.bind(this));
    }
    
    startGame() {
        // Clear any existing game loop
        if (this.gameLoopId !== null) {
            clearTimeout(this.gameLoopId);
            this.gameLoopId = null;
        }

        // Always reset the game state, not just when game over
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPaused = false;
        this.currentPiece = null;
        this.nextPiece = null;
        
        // Reset pause button text
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = 'Pause';
        
        // Update the score display
        this.updateScore();
        
        // Clear the board
        this.draw();
        
        // Start new game
        this.generateNewPiece();
        this.gameLoop();
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        // Update pause button text
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isPaused ? 'Play' : 'Pause';
        
        if (this.isPaused && this.gameLoopId !== null) {
            clearTimeout(this.gameLoopId);
            this.gameLoopId = null;
            this.draw(); // Draw the pause overlay
        } else if (!this.isPaused) {
            this.gameLoop();
        }
    }
    
    generateNewPiece() {
        const shapes = Object.keys(this.SHAPES);
        if (!this.nextPiece) {
            this.nextPiece = shapes[Math.floor(Math.random() * shapes.length)];
        }
        
        // Create a deep copy of the shape array to ensure independence
        const shapeArray = this.SHAPES[this.nextPiece].map(row => [...row]);
        
        this.currentPiece = {
            shape: shapeArray,
            color: this.COLORS[this.nextPiece],
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(shapeArray[0].length / 2),
            y: 0,
            type: this.nextPiece  // Store the piece type directly
        };
        
        this.nextPiece = shapes[Math.floor(Math.random() * shapes.length)];
        this.drawNextPiece();
        
        if (this.checkCollision()) {
            this.gameOver = true;
        }
    }
    
    drawHoldPiece() {
        const canvas = this.holdCanvas;
        const ctx = this.holdCtx;
        const blockSize = 20;  // Smaller block size for hold piece

        // Clear the hold piece canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!this.holdPiece) return;
        
        const shape = this.SHAPES[this.holdPiece];
        const width = shape[0].length * blockSize;
        const height = shape.length * blockSize;
        const offsetX = (canvas.width - width) / 2;
        const offsetY = (canvas.height - height) / 2;
        
        // Draw the held piece
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillStyle = this.COLORS[this.holdPiece];
                    ctx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                }
            });
        });
    }

    holdCurrentPiece() {
        console.log('Hold piece function called');
        console.log('Current state:', {
            hasHeldThisTurn: this.hasHeldThisTurn,
            currentPiece: this.currentPiece,
            holdPiece: this.holdPiece
        });

        if (this.hasHeldThisTurn || !this.currentPiece) {
            console.log('Cannot hold piece - already held this turn or no current piece');
            return;
        }

        // Use the stored piece type directly
        const currentType = this.currentPiece.type;
        console.log('Current piece type:', currentType);

        if (!currentType) {
            console.log('Could not determine piece type');
            return;
        }

        const oldHoldPiece = this.holdPiece;
        this.holdPiece = currentType;

        if (oldHoldPiece === null) {
            // If no piece was being held, generate a new piece
            this.generateNewPiece();
        } else {
            // If a piece was being held, make it the current piece
            const shapeArray = this.SHAPES[oldHoldPiece].map(row => [...row]);
            this.currentPiece = {
                shape: shapeArray,
                color: this.COLORS[oldHoldPiece],
                x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(shapeArray[0].length / 2),
                y: 0,
                type: oldHoldPiece
            };
        }

        this.hasHeldThisTurn = true;
        this.drawHoldPiece();
        this.draw();
    }

    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        const shape = this.SHAPES[this.nextPiece];
        const blockSize = 25;
        const offsetX = (this.nextCanvas.width - shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - shape.length * blockSize) / 2;
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.nextCtx.fillStyle = this.COLORS[this.nextPiece];
                    this.nextCtx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                    this.nextCtx.strokeStyle = 'black';
                    this.nextCtx.strokeRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                }
            });
        });
    }
    
    checkCollision(shape = null, x = null, y = null) {
        const pieceShape = shape || this.currentPiece.shape;
        const pieceX = x !== null ? x : this.currentPiece.x;
        const pieceY = y !== null ? y : this.currentPiece.y;

        return pieceShape.some((row, dy) => {
            return row.some((value, dx) => {
                if (!value) return false;
                const newX = pieceX + dx;
                const newY = pieceY + dy;
                return newX < 0 || newX >= this.BOARD_WIDTH ||
                       newY >= this.BOARD_HEIGHT ||
                       (newY >= 0 && this.board[newY][newX]);
            });
        });
    }
    
    rotate() {
        const newShape = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        const oldShape = this.currentPiece.shape;
        this.currentPiece.shape = newShape;
        
        if (this.checkCollision()) {
            this.currentPiece.shape = oldShape;
        }
    }
    
    moveDown() {
        this.currentPiece.y++;
        if (this.checkCollision()) {
            this.currentPiece.y--;
            this.freezePiece();
            this.clearLines();
            this.hasHeldThisTurn = false;  // Reset before generating new piece
            this.generateNewPiece();
            return false;
        }
        return true;
    }
    
    moveLeft() {
        this.currentPiece.x--;
        if (this.checkCollision()) {
            this.currentPiece.x++;
        }
    }
    
    moveRight() {
        this.currentPiece.x++;
        if (this.checkCollision()) {
            this.currentPiece.x--;
        }
    }
    
    hardDrop() {
        while (this.moveDown()) {}
        this.hasHeldThisTurn = false;  // Also reset after hard drop
    }
    
    freezePiece() {
        this.currentPiece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const y = this.currentPiece.y + dy;
                    const x = this.currentPiece.x + dx;
                    if (y >= 0) {
                        this.board[y][x] = this.currentPiece.color;
                    }
                }
            });
        });
        this.hasHeldThisTurn = false;  // Reset the hold flag when piece is placed
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += [0, 40, 100, 300, 1200][linesCleared] * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.updateScore();
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    getGhostPosition() {
        if (!this.currentPiece) return null;
        
        let ghostY = this.currentPiece.y;
        while (!this.checkCollision(this.currentPiece.shape, this.currentPiece.x, ghostY + 1)) {
            ghostY++;
        }
        return { x: this.currentPiece.x, y: ghostY };
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        this.board.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color) {
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
                    this.ctx.strokeStyle = 'black';
                    this.ctx.strokeRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
                }
            });
        });
        
        // Draw ghost piece
        if (this.currentPiece) {
            const ghostPos = this.getGhostPosition();
            this.currentPiece.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        const x = (ghostPos.x + dx) * this.BLOCK_SIZE;
                        const y = (ghostPos.y + dy) * this.BLOCK_SIZE;
                        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                        this.ctx.lineWidth = 2;
                        this.ctx.strokeRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
                    }
                });
            });
        }
        
        // Draw current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            this.currentPiece.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        const x = (this.currentPiece.x + dx) * this.BLOCK_SIZE;
                        const y = (this.currentPiece.y + dy) * this.BLOCK_SIZE;
                        this.ctx.fillRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
                        this.ctx.strokeStyle = 'black';
                        this.ctx.strokeRect(x, y, this.BLOCK_SIZE, this.BLOCK_SIZE);
                    }
                });
            });
        }
        
        // Draw overlay (game over or pause)
        if (this.gameOver || this.isPaused) {
            const dpr = window.devicePixelRatio || 1;
            const displayWidth = this.canvas.width / dpr;
            const displayHeight = this.canvas.height / dpr;

            // Darken the background more
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Set up text rendering
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Calculate positions based on block size for better alignment
            const centerX = (this.BOARD_WIDTH * this.BLOCK_SIZE) / 2;
            const centerY = (this.BOARD_HEIGHT * this.BLOCK_SIZE) / 4; // Position at 1/4 height
            
            // Main text setup
            this.ctx.font = `bold ${14 * dpr}px Arial`;
            const mainText = this.gameOver ? 'GAME OVER' : 'PAUSED';
            
            // Shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillText(mainText, centerX + 1, centerY + 1);
            
            // Main text
            this.ctx.fillStyle = '#4facfe';
            this.ctx.fillText(mainText, centerX, centerY);

            // Score text (only for game over)
            if (this.gameOver) {
                this.ctx.font = `bold ${10 * dpr}px Arial`;
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(`Score: ${this.score}`, centerX, centerY + 30);
            }
        }
    }
    
    handleKeyPress(event) {
        console.log('Key pressed:', event.key, 'Key code:', event.keyCode);
        // Prevent default behavior for game control keys
        if ([32, 37, 38, 39, 40, 67, 80, 99].includes(event.keyCode)) {
            event.preventDefault();
        }
        
        // Handle pause key even when paused
        if (event.keyCode === 80) { // 'P' key
            this.togglePause();
            return;
        }
        
        if (this.gameOver || this.isPaused) return;
        
        switch (event.keyCode) {
            case 37: // Left arrow
                this.moveLeft();
                break;
            case 39: // Right arrow
                this.moveRight();
                break;
            case 40: // Down arrow
                this.moveDown();
                break;
            case 38: // Up arrow
                this.rotate();
                break;
            case 32: // Space
                this.hardDrop();
                break;
            case 67: // 'C' key (uppercase)
            case 99: // 'c' key (lowercase)
                console.log('Hold piece triggered');
                this.holdCurrentPiece();
                break;
        }
        
        this.draw();
    }
    
    gameLoop() {
        if (!this.gameOver && !this.isPaused) {
            this.moveDown();
            this.draw();
            this.gameLoopId = setTimeout(() => this.gameLoop(), Math.max(50, 1000 - (this.level - 1) * 50));
        }
    }
}

// Start the game when the page loads
if (typeof window !== 'undefined') {
    window.onload = () => {
        const game = new Tetris();
    };
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tetris;
}
