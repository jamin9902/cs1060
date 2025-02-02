class Tetris {
    constructor() {
        this.canvas = document.getElementById('tetris');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // Get container dimensions
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Set ideal dimensions while maintaining aspect ratio
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        const idealRatio = this.BOARD_HEIGHT / this.BOARD_WIDTH;
        
        // Add margins to ensure we don't touch the edges
        const availableWidth = containerRect.width - 20;
        const availableHeight = containerRect.height - 20;
        
        // Calculate the maximum possible block size that fits in the container
        const maxBlockByWidth = Math.floor(availableWidth / this.BOARD_WIDTH);
        const maxBlockByHeight = Math.floor(availableHeight / this.BOARD_HEIGHT);
        this.BLOCK_SIZE = Math.min(maxBlockByWidth, maxBlockByHeight, 25);
        
        // Calculate actual dimensions
        const actualWidth = this.BLOCK_SIZE * this.BOARD_WIDTH;
        const actualHeight = this.BLOCK_SIZE * this.BOARD_HEIGHT;
        
        // Scale for retina displays
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = actualWidth * dpr;
        this.canvas.height = actualHeight * dpr;
        this.ctx.scale(dpr, dpr);
        
        // Set display size
        this.canvas.style.width = `${actualWidth}px`;
        this.canvas.style.height = `${actualHeight}px`;
        
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
        if (this.isPaused && this.gameLoopId !== null) {
            clearTimeout(this.gameLoopId);
            this.gameLoopId = null;
        } else if (!this.isPaused) {
            this.gameLoop();
        }
    }
    
    generateNewPiece() {
        const shapes = Object.keys(this.SHAPES);
        if (!this.nextPiece) {
            this.nextPiece = shapes[Math.floor(Math.random() * shapes.length)];
        }
        
        this.currentPiece = {
            shape: this.SHAPES[this.nextPiece],
            color: this.COLORS[this.nextPiece],
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.SHAPES[this.nextPiece][0].length / 2),
            y: 0
        };
        
        this.nextPiece = shapes[Math.floor(Math.random() * shapes.length)];
        this.drawNextPiece();
        
        if (this.checkCollision()) {
            this.gameOver = true;
        }
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
    
    checkCollision() {
        return this.currentPiece.shape.some((row, dy) => {
            return row.some((value, dx) => {
                if (!value) return false;
                const newX = this.currentPiece.x + dx;
                const newY = this.currentPiece.y + dy;
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
        
        // Draw game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    handleKeyPress(event) {
        // Prevent default behavior for game control keys
        if ([32, 37, 38, 39, 40].includes(event.keyCode)) {
            event.preventDefault();
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
window.onload = () => {
    const game = new Tetris();
};
