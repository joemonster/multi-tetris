// Types for Tetris game entities

// Tetromino piece names
export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

// Single cell on the board
export type Cell = {
  filled: boolean;
  color: string;
};

// Board is a 2D array of cells (20 rows x 10 columns)
export type Board = Cell[][];

// Position on the board
export type Position = {
  x: number;
  y: number;
};

// Tetromino shape (2D array of 0s and 1s)
export type Shape = number[][];

// Tetromino piece definition
export type Tetromino = {
  shape: Shape;
  color: string;
};

// Current piece state during gameplay
export type CurrentPiece = {
  type: TetrominoType;
  shape: Shape;
  color: string;
  position: Position;
  rotation: number;
};

// Game state
export type GameState = {
  board: Board;
  currentPiece: CurrentPiece | null;
  nextPiece: TetrominoType;
  score: number;
  lines: number;
  level: number;
  gameOver: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  highScore: number;
};

// Game actions
export type GameAction =
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'MOVE_DOWN' }
  | { type: 'ROTATE' }
  | { type: 'HARD_DROP' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'START_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'TICK' };

// Score multipliers for clearing multiple lines
export const SCORE_MULTIPLIERS: Record<number, number> = {
  1: 100,
  2: 300,
  3: 500,
  4: 800, // Tetris!
};

// Game constants
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const INITIAL_SPEED = 1000; // ms
export const SPEED_INCREMENT = 50; // ms faster per level
export const LINES_PER_LEVEL = 10;
