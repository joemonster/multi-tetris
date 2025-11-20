import {
  Board,
  CurrentPiece,
  Position,
  Shape,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from '../types/game.types';

// Create an empty board
export const createEmptyBoard = (): Board => {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => ({
      filled: false,
      color: 'transparent',
    }))
  );
};

// Check if a position is valid (within bounds and not colliding)
export const isValidPosition = (
  board: Board,
  shape: Shape,
  position: Position
): boolean => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newX = position.x + x;
        const newY = position.y + y;

        // Check bounds
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false;
        }

        // Check collision with existing pieces (only if within board)
        if (newY >= 0 && board[newY][newX].filled) {
          return false;
        }
      }
    }
  }
  return true;
};

// Merge a piece into the board
export const mergePieceToBoard = (
  board: Board,
  piece: CurrentPiece
): Board => {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));

  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.position.y + y;
        const boardX = piece.position.x + x;

        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = {
            filled: true,
            color: piece.color,
          };
        }
      }
    }
  }

  return newBoard;
};

// Check and clear completed lines
export const clearLines = (board: Board): { newBoard: Board; linesCleared: number } => {
  const newBoard = board.filter(row => !row.every(cell => cell.filled));
  const linesCleared = BOARD_HEIGHT - newBoard.length;

  // Add empty rows at the top
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(
      Array.from({ length: BOARD_WIDTH }, () => ({
        filled: false,
        color: 'transparent',
      }))
    );
  }

  return { newBoard, linesCleared };
};

// Get the ghost piece position (where the piece would land)
export const getGhostPosition = (
  board: Board,
  piece: CurrentPiece
): Position => {
  let ghostY = piece.position.y;

  while (
    isValidPosition(board, piece.shape, {
      x: piece.position.x,
      y: ghostY + 1,
    })
  ) {
    ghostY++;
  }

  return { x: piece.position.x, y: ghostY };
};

// Calculate score based on lines cleared and level
export const calculateScore = (
  linesCleared: number,
  level: number
): number => {
  const baseScores: Record<number, number> = {
    1: 100,
    2: 300,
    3: 500,
    4: 800,
  };

  return (baseScores[linesCleared] || 0) * level;
};

// Calculate level based on total lines cleared
export const calculateLevel = (lines: number): number => {
  return Math.floor(lines / 10) + 1;
};

// Calculate drop speed based on level
export const calculateSpeed = (level: number): number => {
  const baseSpeed = 1000;
  const minSpeed = 100;
  const speed = baseSpeed - (level - 1) * 50;
  return Math.max(speed, minSpeed);
};

// Get starting position for a new piece
export const getStartPosition = (shape: Shape): Position => {
  return {
    x: Math.floor((BOARD_WIDTH - shape[0].length) / 2),
    y: -1, // Start slightly above the board
  };
};

// Check if game is over (piece can't be placed at start)
export const isGameOver = (board: Board, shape: Shape): boolean => {
  const startPos = getStartPosition(shape);
  // Game is over if piece can't be placed at its starting position (-1)
  // This gives more room before triggering game over
  return !isValidPosition(board, shape, startPos);
};

// Wall kick offsets for rotation (SRS - Super Rotation System)
export const WALL_KICK_OFFSETS: Position[] = [
  { x: 0, y: 0 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: -2, y: 0 },
  { x: 2, y: 0 },
];

// Try to rotate a piece with wall kicks
export const tryRotate = (
  board: Board,
  piece: CurrentPiece,
  rotatedShape: Shape
): Position | null => {
  for (const offset of WALL_KICK_OFFSETS) {
    const newPosition = {
      x: piece.position.x + offset.x,
      y: piece.position.y + offset.y,
    };

    if (isValidPosition(board, rotatedShape, newPosition)) {
      return newPosition;
    }
  }

  return null;
};
