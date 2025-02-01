# Tetris Game

A classic implementation of Tetris using Python and Pygame.

## Installation

1. Make sure you have Python installed on your system
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## How to Play

Run the game:
```
python tetris.py
```

### Controls

- Left Arrow: Move piece left
- Right Arrow: Move piece right
- Up Arrow: Rotate piece
- Down Arrow: Move piece down faster
- Space: Drop piece instantly
- R: Restart game (when game is over)

### Scoring

- 1 line cleared: 100 points
- 2 lines cleared: 300 points
- 3 lines cleared: 500 points
- 4 lines cleared: 800 points

The game speeds up as you clear more lines and advance through levels. Each level is reached after clearing 10 lines.
