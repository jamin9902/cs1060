const Tetris = require('../static/js/tetris.js');

// Mock canvas and context
class CanvasRenderingContext2D {
    scale() {}
    clearRect() {}
    fillRect() {}
    fillText() {}
    beginPath() {}
    rect() {}
    fill() {}
    strokeRect() {}
    strokeStyle = 'black';
    fillStyle = 'black';
}

// Mock canvas element
class Canvas {
    constructor() {
        this.width = 250;
        this.height = 500;
    }
    getContext() {
        return new CanvasRenderingContext2D();
    }
}

// Mock the DOM elements that Tetris expects
document.body.innerHTML = `
    <canvas id="tetris"></canvas>
    <canvas id="nextPiece"></canvas>
    <canvas id="holdPiece"></canvas>
    <button id="startBtn">Start</button>
    <button id="pauseBtn">Pause</button>
    <div id="score">0</div>
    <div id="level">1</div>
    <div id="lines">0</div>
`;

// Replace canvas elements with mocked versions
const canvasElements = document.querySelectorAll('canvas');
canvasElements.forEach(canvas => {
    Object.setPrototypeOf(canvas, Canvas.prototype);
});

describe('Tetris Game Tests', () => {
    let game;

    beforeEach(() => {
        game = new Tetris();
        // Reset game state
        game.startGame();
    });

    describe('Line Clearing Tests', () => {
        test('should clear a single complete line', () => {
            // Fill the bottom row completely
            game.board[game.BOARD_HEIGHT - 1] = Array(game.BOARD_WIDTH).fill(1);
            
            game.clearLines();
            
            // Check if bottom row is cleared
            expect(game.board[game.BOARD_HEIGHT - 1].every(cell => cell === 0)).toBe(true);
            expect(game.score).toBe(40); // Single line score (40 points at level 1)
            expect(game.lines).toBe(1);
        });

        test('should clear multiple complete lines', () => {
            // Fill bottom two rows
            game.board[game.BOARD_HEIGHT - 1] = Array(game.BOARD_WIDTH).fill(1);
            game.board[game.BOARD_HEIGHT - 2] = Array(game.BOARD_WIDTH).fill(1);
            
            game.clearLines();
            
            expect(game.board[game.BOARD_HEIGHT - 1].every(cell => cell === 0)).toBe(true);
            expect(game.board[game.BOARD_HEIGHT - 2].every(cell => cell === 0)).toBe(true);
            expect(game.score).toBe(100); // Double line score (100 points at level 1)
            expect(game.lines).toBe(2);
        });

        test('should not clear incomplete lines', () => {
            // Fill bottom row partially
            game.board[game.BOARD_HEIGHT - 1] = Array(game.BOARD_WIDTH - 1).fill(1).concat([0]);
            
            game.clearLines();
            
            expect(game.board[game.BOARD_HEIGHT - 1].some(cell => cell === 1)).toBe(true);
            expect(game.score).toBe(0);
            expect(game.lines).toBe(0);
        });
    });

    describe('Collision Detection Tests', () => {
        test('should detect wall collision', () => {
            // Place piece at left edge
            game.currentPiece = {
                shape: [[1, 1], [1, 1]], // O piece
                x: 0,
                y: 0
            };
            
            // Test left wall collision
            expect(game.checkCollision(game.currentPiece.shape, -1, 0)).toBe(true);
            
            // Place piece at right edge
            game.currentPiece.x = game.BOARD_WIDTH - 2;
            
            // Test right wall collision
            expect(game.checkCollision(game.currentPiece.shape, game.BOARD_WIDTH - 1, 0)).toBe(true);
        });

        test('should detect floor collision', () => {
            game.currentPiece = {
                shape: [[1, 1], [1, 1]], // O piece
                x: 4,
                y: game.BOARD_HEIGHT - 2
            };
            
            // Test floor collision
            expect(game.checkCollision(game.currentPiece.shape, 4, game.BOARD_HEIGHT - 1)).toBe(true);
        });

        test('should detect piece collision', () => {
            // Place a block in the board
            game.board[5][5] = 1;
            
            game.currentPiece = {
                shape: [[1, 1], [1, 1]], // O piece
                x: 4,
                y: 4
            };
            
            // Test collision with placed block
            expect(game.checkCollision(game.currentPiece.shape, 4, 5)).toBe(true);
        });
    });

    describe('Game Over Detection Tests', () => {
        test('should detect game over when piece spawns in occupied space', () => {
            // Fill top row where pieces spawn
            game.board[0] = Array(game.BOARD_WIDTH).fill(1);
            
            // Try to spawn a new piece
            game.generateNewPiece();
            
            expect(game.gameOver).toBe(true);
        });

        test('should detect game over when piece cannot move down', () => {
            // Fill second row
            game.board[1] = Array(game.BOARD_WIDTH).fill(1);
            
            // Spawn piece and try to move down
            game.generateNewPiece();
            game.moveDown();
            
            expect(game.gameOver).toBe(true);
        });
    });

    describe('Hold Piece Tests', () => {
        test('should allow holding a piece', () => {
            const originalPiece = game.currentPiece;
            
            game.holdCurrentPiece();
            
            expect(game.holdPiece).not.toBeNull();
            expect(game.holdPiece).toBe(originalPiece.type);
            expect(game.currentPiece).not.toBe(originalPiece);
        });

        test('should not allow holding twice in a row', () => {
            const originalPiece = game.currentPiece;
            
            game.holdCurrentPiece(); // First hold
            const heldPiece = game.holdPiece;
            
            game.holdCurrentPiece(); // Try to hold again
            
            expect(game.holdPiece).toBe(heldPiece); // Hold piece shouldn't change
            expect(game.hasHeldThisTurn).toBe(true);
        });

        test('should reset hold flag after piece placement', () => {
            game.holdCurrentPiece();
            expect(game.hasHeldThisTurn).toBe(true);
            
            game.freezePiece();
            expect(game.hasHeldThisTurn).toBe(false);
        });
    });

    describe('Piece Movement Tests', () => {
        test('should move piece left', () => {
            const originalX = game.currentPiece.x;
            game.moveLeft();
            expect(game.currentPiece.x).toBe(originalX - 1);
        });

        test('should move piece right', () => {
            const originalX = game.currentPiece.x;
            game.moveRight();
            expect(game.currentPiece.x).toBe(originalX + 1);
        });

        test('should rotate piece', () => {
            // Use I piece for predictable rotation
            game.currentPiece = {
                shape: [[1, 1, 1, 1]],
                x: 4,
                y: 4,
                type: 'I'
            };
            
            const originalShape = game.currentPiece.shape.map(row => [...row]);
            game.rotate();
            
            // Check if shape changed (rotated)
            expect(JSON.stringify(game.currentPiece.shape)).not.toBe(JSON.stringify(originalShape));
        });
    });

    describe('Score and Level Tests', () => {
        test('should increase level after clearing 10 lines', () => {
            const initialLevel = game.level;
            
            // Clear 10 lines
            for (let i = 0; i < 10; i++) {
                game.board[game.BOARD_HEIGHT - 1] = Array(game.BOARD_WIDTH).fill(1);
                game.clearLines();
            }
            
            expect(game.level).toBe(initialLevel + 1);
        });

        test('should award bonus points for multiple lines', () => {
            // Fill four rows
            for (let i = 0; i < 4; i++) {
                game.board[game.BOARD_HEIGHT - 1 - i] = Array(game.BOARD_WIDTH).fill(1);
            }
            
            game.clearLines();
            
            // Tetris bonus should be higher than 4 single line clears
            expect(game.score).toBeGreaterThan(400);
        });
    });
});
