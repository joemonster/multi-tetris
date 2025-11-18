import { TetrominoType, Tetromino, Shape } from '../types/game.types';

// Tetromino definitions with shapes and colors
export const TETROMINOS: Record<TetrominoType, Tetromino> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00f5ff', // Cyan
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#ffd700', // Yellow
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a855f7', // Purple
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#22c55e', // Green
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#ef4444', // Red
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#3b82f6', // Blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f97316', // Orange
  },
};

// Get a random tetromino type
export const getRandomTetromino = (): TetrominoType => {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
};

// Rotate a shape 90 degrees clockwise
export const rotateShape = (shape: Shape): Shape => {
  const rows = shape.length;
  const cols = shape[0].length;
  const rotated: Shape = [];

  for (let i = 0; i < cols; i++) {
    rotated[i] = [];
    for (let j = rows - 1; j >= 0; j--) {
      rotated[i][rows - 1 - j] = shape[j][i];
    }
  }

  return rotated;
};

// Get all rotations for a tetromino (for wall kick calculations)
export const getAllRotations = (type: TetrominoType): Shape[] => {
  const shapes: Shape[] = [];
  let currentShape = TETROMINOS[type].shape;

  for (let i = 0; i < 4; i++) {
    shapes.push(currentShape);
    currentShape = rotateShape(currentShape);
  }

  return shapes;
};
