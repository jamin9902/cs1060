# Tetris Web Application

A modern, responsive web-based Tetris game built with Python Flask and HTML5 Canvas.

![Tetris Game Screenshot](screenshots/tetris.png) _(Screenshot will be added when available)_

## Features

- Classic Tetris gameplay, including hold piece functionality
- Score tracking system
- Next piece preview
- Pause/play functionality

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.6 or higher
- pip (Python package installer)
- Node.js and npm (for running tests)

## Installation

1. Clone the repository or download the source code:

   ```bash
   git clone <repository-url>
   cd tetris
   ```

2. Create a virtual environment (recommended):

   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. Make sure your virtual environment is activated (if you created one)

2. Start the Flask server:

   ```bash
   python app.py
   ```

3. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

## How to Play

- Use the **Left** and **Right** arrow keys to move the piece horizontally
- Use the **Up** arrow key to rotate the piece
- Use the **Down** arrow key for soft drop (faster descent)
- Press the **Spacebar** for hard drop (immediate placement)
- Press **C** or **Shift** to hold a piece
- Click the **New Game** button to start a new game
- Click the **Pause** button to pause/resume the game

## Game Rules

- Lines are cleared when they are completely filled with blocks
- Score points by clearing lines and placing pieces:
  - Single line: 40 × level points
  - Double lines: 100 × level points
  - Triple lines: 300 × level points
  - Tetris (4 lines): 1200 × level points
- The game speeds up as you progress through levels (every 10 lines)
- Game ends when pieces reach the top of the board
- Hold piece rules:
  - You can hold one piece at a time
  - You can't hold the same piece twice in a row
  - The hold slot resets when you place a piece

## Project Structure

```
tetris/
├── app.py              # Flask application server
├── requirements.txt    # Python dependencies
├── package.json        # Node.js dependencies
├── README.md          # This file
├── static/
│   ├── css/
│   │   └── style.css  # Game styling
│   └── js/
│       └── tetris.js  # Game logic
├── templates/
│   └── index.html     # Game interface
└── tests/
    └── tetris.test.js # Game unit tests
```

## Technical Details

- Frontend: HTML5, CSS3, JavaScript
- Backend: Python Flask
- Rendering: HTML5 Canvas
- Styling: Modern CSS with Flexbox and CSS Grid
- Dependencies: Flask, Flask-CORS
- Testing: Jest

## Running Tests

1. Install Node.js dependencies:

   ```bash
   npm install
   ```

2. Run the test suite:
   ```bash
   npm test
   ```

The test suite covers:

- Line clearing and scoring
- Collision detection
- Game over conditions
- Hold piece mechanics
- Piece movement and rotation
- Level progression

## Contributing

Feel free to fork the repository and submit pull requests for any improvements you'd like to make.
