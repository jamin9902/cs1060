// Simple Tetris Algorithm that makes decisions about piece placement

class TetrisAlgorithm {
    constructor(game) {
        this.game = game;
        this.debug = true; // Enable debug logging
    }

    // Calculate a basic score for a potential move
    evaluateBoard(board) {
        let score = 0;
        const height = board.length;
        const width = board[0].length;
        
        // Penalize for height differences between adjacent columns
        for (let x = 0; x < width - 1; x++) {
            let heightDiff = this.getColumnHeight(board, x) - this.getColumnHeight(board, x + 1);
            score -= Math.abs(heightDiff) * 2;
        }
        
        // Penalize for holes (empty spaces with blocks above them)
        score -= this.countHoles(board) * 10;
        
        // Penalize for height
        score -= this.getMaxHeight(board) * 1.5;
        
        return score;
    }

    // Get the height of a specific column
    getColumnHeight(board, x) {
        for (let y = 0; y < board.length; y++) {
            if (board[y][x]) {
                return board.length - y;
            }
        }
        return 0;
    }

    // Get the maximum height of the board
    getMaxHeight(board) {
        let maxHeight = 0;
        for (let x = 0; x < board[0].length; x++) {
            maxHeight = Math.max(maxHeight, this.getColumnHeight(board, x));
        }
        return maxHeight;
    }

    // Count the number of holes in the board
    countHoles(board) {
        let holes = 0;
        for (let x = 0; x < board[0].length; x++) {
            let blockFound = false;
            for (let y = 0; y < board.length; y++) {
                if (board[y][x]) {
                    blockFound = true;
                } else if (blockFound) {
                    holes++;
                }
            }
        }
        return holes;
    }

    // Get rotated shape for a piece
    getRotatedShape(shape, rotations) {
        let rotatedShape = shape.map(row => [...row]);
        for (let i = 0; i < rotations; i++) {
            rotatedShape = rotatedShape[0].map((_, i) =>
                rotatedShape.map(row => row[i]).reverse()
            );
        }
        return rotatedShape;
    }

    // Find the best move for the current piece
    findBestMove() {
        try {
            let bestScore = -Infinity;
            let bestMove = null;

            if (!this.game.currentPiece || !this.game.currentPiece.shape) {
                console.error('Invalid piece state');
                return null;
            }

            const currentShape = this.game.currentPiece.shape;
            if (this.debug) {
                console.log('Finding best move for shape:', currentShape);
            }

            // Try each possible rotation (max 4 rotations)
            for (let rotation = 0; rotation < 4; rotation++) {
                const rotatedShape = this.getRotatedShape(currentShape, rotation);
                
                // Try each possible x position
                const maxX = this.game.BOARD_WIDTH - rotatedShape[0].length + 1;
                for (let x = 0; x < maxX; x++) {
                    // Create a copy of the board
                    let boardCopy = this.game.board.map(row => [...row]);
                    
                    // Simulate dropping the piece at this position
                    if (this.canPlacePiece(boardCopy, rotatedShape, x)) {
                        let finalBoard = this.simulateMove(boardCopy, rotatedShape, x);
                        let score = this.evaluateBoard(finalBoard);
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = { rotation, x };
                        }
                    }
                }
            }

            if (this.debug) {
                console.log('Best move found:', bestMove, 'with score:', bestScore);
            }

            return bestMove || { rotation: 0, x: Math.floor(this.game.BOARD_WIDTH / 2) };
        } catch (error) {
            console.error('Error in findBestMove:', error);
            return { rotation: 0, x: Math.floor(this.game.BOARD_WIDTH / 2) };
        }
    }

    // Check if a piece can be placed at the given position
    canPlacePiece(board, shape, x) {
        let y = 0;
        
        while (y < board.length) {
            if (this.wouldCollide(board, shape, x, y)) {
                return y > 0;
            }
            y++;
        }
        return true;
    }

    // Check if the piece would collide at the given position
    wouldCollide(board, shape, x, y) {
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j]) {
                    if (y + i >= board.length || 
                        x + j < 0 || 
                        x + j >= board[0].length || 
                        board[y + i][x + j]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Simulate placing a piece on the board
    simulateMove(board, shape, x) {
        let y = 0;
        
        // Find the lowest possible position
        while (y < board.length && !this.wouldCollide(board, shape, x, y)) {
            y++;
        }
        y--;
        
        // Place the piece
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j] && y + i >= 0) {
                    board[y + i][x + j] = 1;
                }
            }
        }
        
        return board;
    }

    // Make the best move
    makeMove() {
        try {
            if (!this.game.currentPiece) {
                console.log('No current piece to move');
                return;
            }

            const bestMove = this.findBestMove();
            if (!bestMove) {
                console.log('Could not find a valid move');
                return;
            }

            if (this.debug) {
                console.log('Current piece:', this.game.currentPiece);
                console.log('Best move found:', bestMove);
            }

            // Rotate to desired orientation
            let rotationCount = bestMove.rotation;
            while (rotationCount > 0) {
                this.game.rotate();
                rotationCount--;
            }

            // Move to desired x position
            const currentX = this.game.currentPiece.x;
            if (this.debug) {
                console.log('Moving from x:', currentX, 'to x:', bestMove.x);
            }

            if (bestMove.x > currentX) {
                for (let i = 0; i < bestMove.x - currentX; i++) {
                    this.game.moveRight();
                }
            } else {
                for (let i = 0; i < currentX - bestMove.x; i++) {
                    this.game.moveLeft();
                }
            }

            // Drop the piece
            this.game.hardDrop();
        } catch (error) {
            console.error('Error in Algorithm makeMove:', error);
        }
    }
}
