import pygame
import random
from typing import List, Tuple

# Initialize Pygame
pygame.init()

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
CYAN = (0, 255, 255)
YELLOW = (255, 255, 0)
MAGENTA = (255, 0, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
ORANGE = (255, 165, 0)

# Game dimensions
BLOCK_SIZE = 30
GRID_WIDTH = 10
GRID_HEIGHT = 20
SCREEN_WIDTH = BLOCK_SIZE * (GRID_WIDTH + 8)  # Extra space for next piece and score
SCREEN_HEIGHT = BLOCK_SIZE * GRID_HEIGHT

# Tetromino shapes
SHAPES = [
    [[1, 1, 1, 1]],  # I
    [[1, 1], [1, 1]],  # O
    [[1, 1, 1], [0, 1, 0]],  # T
    [[1, 1, 1], [1, 0, 0]],  # L
    [[1, 1, 1], [0, 0, 1]],  # J
    [[1, 1, 0], [0, 1, 1]],  # S
    [[0, 1, 1], [1, 1, 0]]   # Z
]

COLORS = [CYAN, YELLOW, MAGENTA, ORANGE, BLUE, GREEN, RED]

class Tetris:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption('Tetris')
        self.clock = pygame.time.Clock()
        self.reset_game()

    def reset_game(self):
        self.grid = [[0 for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.current_piece = self.new_piece()
        self.game_over = False
        self.score = 0
        self.level = 1
        self.lines_cleared = 0
        self.fall_speed = 1000  # Start with 1 second per fall
        self.last_fall_time = pygame.time.get_ticks()

    def new_piece(self) -> dict:
        shape_idx = random.randint(0, len(SHAPES) - 1)
        return {
            'shape': SHAPES[shape_idx],
            'color': COLORS[shape_idx],
            'x': GRID_WIDTH // 2 - len(SHAPES[shape_idx][0]) // 2,
            'y': 0
        }

    def valid_move(self, piece: dict, x_offset: int = 0, y_offset: int = 0) -> bool:
        for y, row in enumerate(piece['shape']):
            for x, cell in enumerate(row):
                if cell:
                    new_x = piece['x'] + x + x_offset
                    new_y = piece['y'] + y + y_offset
                    if (new_x < 0 or new_x >= GRID_WIDTH or 
                        new_y >= GRID_HEIGHT or
                        (new_y >= 0 and self.grid[new_y][new_x])):
                        return False
        return True

    def rotate_piece(self, piece: dict) -> None:
        original_shape = piece['shape']
        piece['shape'] = list(zip(*piece['shape'][::-1]))  # Rotate 90 degrees clockwise
        if not self.valid_move(piece):
            piece['shape'] = original_shape

    def merge_piece(self) -> None:
        for y, row in enumerate(self.current_piece['shape']):
            for x, cell in enumerate(row):
                if cell:
                    self.grid[self.current_piece['y'] + y][self.current_piece['x'] + x] = self.current_piece['color']

    def clear_lines(self) -> None:
        lines_to_clear = []
        for y in range(GRID_HEIGHT):
            if all(self.grid[y]):
                lines_to_clear.append(y)
        
        for line in lines_to_clear:
            del self.grid[line]
            self.grid.insert(0, [0 for _ in range(GRID_WIDTH)])
        
        cleared = len(lines_to_clear)
        if cleared:
            self.lines_cleared += cleared
            self.score += [0, 100, 300, 500, 800][cleared]
            self.level = self.lines_cleared // 10 + 1
            self.fall_speed = max(100, 1000 - (self.level - 1) * 100)  # Speed up as level increases

    def draw(self) -> None:
        self.screen.fill(BLACK)
        
        # Draw the grid
        for y in range(GRID_HEIGHT):
            for x in range(GRID_WIDTH):
                color = self.grid[y][x]
                if color:
                    pygame.draw.rect(self.screen, color,
                                   (x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1))

        # Draw current piece
        if self.current_piece:
            for y, row in enumerate(self.current_piece['shape']):
                for x, cell in enumerate(row):
                    if cell:
                        pygame.draw.rect(self.screen, self.current_piece['color'],
                                       ((self.current_piece['x'] + x) * BLOCK_SIZE,
                                        (self.current_piece['y'] + y) * BLOCK_SIZE,
                                        BLOCK_SIZE - 1, BLOCK_SIZE - 1))

        # Draw score and level
        font = pygame.font.Font(None, 36)
        score_text = font.render(f'Score: {self.score}', True, WHITE)
        level_text = font.render(f'Level: {self.level}', True, WHITE)
        self.screen.blit(score_text, (GRID_WIDTH * BLOCK_SIZE + 10, 20))
        self.screen.blit(level_text, (GRID_WIDTH * BLOCK_SIZE + 10, 60))

        pygame.display.flip()

    def run(self) -> None:
        while True:
            current_time = pygame.time.get_ticks()
            
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    return
                
                if event.type == pygame.KEYDOWN and not self.game_over:
                    if event.key == pygame.K_LEFT and self.valid_move(self.current_piece, x_offset=-1):
                        self.current_piece['x'] -= 1
                    elif event.key == pygame.K_RIGHT and self.valid_move(self.current_piece, x_offset=1):
                        self.current_piece['x'] += 1
                    elif event.key == pygame.K_DOWN and self.valid_move(self.current_piece, y_offset=1):
                        self.current_piece['y'] += 1
                    elif event.key == pygame.K_UP:
                        self.rotate_piece(self.current_piece)
                    elif event.key == pygame.K_SPACE:
                        while self.valid_move(self.current_piece, y_offset=1):
                            self.current_piece['y'] += 1
                    
                if event.type == pygame.KEYDOWN and self.game_over:
                    if event.key == pygame.K_r:
                        self.reset_game()

            if not self.game_over:
                # Handle piece falling
                if current_time - self.last_fall_time > self.fall_speed:
                    if self.valid_move(self.current_piece, y_offset=1):
                        self.current_piece['y'] += 1
                    else:
                        self.merge_piece()
                        self.clear_lines()
                        self.current_piece = self.new_piece()
                        if not self.valid_move(self.current_piece):
                            self.game_over = True
                    self.last_fall_time = current_time

            self.draw()
            self.clock.tick(60)

if __name__ == '__main__':
    game = Tetris()
    game.run()
