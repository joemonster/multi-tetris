import {
  createEmptyBoard,
  isValidPosition,
  mergePieceToBoard,
  clearLines,
  getGhostPosition,
  calculateScore,
  calculateLevel,
  calculateSpeed,
  getStartPosition,
  isGameOver,
  tryRotate,
  WALL_KICK_OFFSETS,
} from '../gameHelpers';
import { TETROMINOS } from '../tetrominos';
import {
  Board,
  CurrentPiece,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from '../../types/game.types';

describe('gameHelpers', () => {
  describe('createEmptyBoard', () => {
    it('should create a board with correct dimensions', () => {
      const board = createEmptyBoard();
      expect(board).toHaveLength(BOARD_HEIGHT);
      expect(board[0]).toHaveLength(BOARD_WIDTH);
    });

    it('should create a board with all empty cells', () => {
      const board = createEmptyBoard();
      board.forEach(row => {
        row.forEach(cell => {
          expect(cell.filled).toBe(false);
          expect(cell.color).toBe('transparent');
        });
      });
    });
  });

  describe('isValidPosition', () => {
    let board: Board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it('should return true for valid position in the center', () => {
      const shape = TETROMINOS.O.shape;
      const position = { x: 4, y: 10 };
      expect(isValidPosition(board, shape, position)).toBe(true);
    });

    it('should return false for position beyond left boundary', () => {
      const shape = TETROMINOS.O.shape;
      const position = { x: -1, y: 10 };
      expect(isValidPosition(board, shape, position)).toBe(false);
    });

    it('should return false for position beyond right boundary', () => {
      const shape = TETROMINOS.O.shape;
      const position = { x: 9, y: 10 }; // O piece is 2 wide, so x=9 would go to x=10 (out of bounds)
      expect(isValidPosition(board, shape, position)).toBe(false);
    });

    it('should return false for position beyond bottom boundary', () => {
      const shape = TETROMINOS.O.shape;
      const position = { x: 4, y: 19 }; // O piece is 2 high, so y=19 would go to y=20 (out of bounds)
      expect(isValidPosition(board, shape, position)).toBe(false);
    });

    it('should allow negative y positions (piece above board)', () => {
      const shape = TETROMINOS.I.shape;
      const position = { x: 3, y: -1 };
      expect(isValidPosition(board, shape, position)).toBe(true);
    });

    it('should return false when colliding with filled cells', () => {
      const shape = TETROMINOS.O.shape;
      const position = { x: 4, y: 18 };

      // Fill some cells that would collide
      board[18][4].filled = true;
      board[18][4].color = '#fff';

      expect(isValidPosition(board, shape, position)).toBe(false);
    });

    it('should return true when piece is above filled cells', () => {
      const shape = TETROMINOS.I.shape;
      const position = { x: 3, y: 10 };

      // Fill cells below
      board[15][3].filled = true;

      expect(isValidPosition(board, shape, position)).toBe(true);
    });
  });

  describe('mergePieceToBoard', () => {
    let board: Board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it('should merge O piece into board', () => {
      const piece: CurrentPiece = {
        type: 'O',
        shape: TETROMINOS.O.shape,
        color: TETROMINOS.O.color,
        position: { x: 4, y: 18 },
        rotation: 0,
      };

      const newBoard = mergePieceToBoard(board, piece);

      expect(newBoard[18][4].filled).toBe(true);
      expect(newBoard[18][5].filled).toBe(true);
      expect(newBoard[19][4].filled).toBe(true);
      expect(newBoard[19][5].filled).toBe(true);
      expect(newBoard[18][4].color).toBe(TETROMINOS.O.color);
    });

    it('should merge I piece into board', () => {
      const piece: CurrentPiece = {
        type: 'I',
        shape: TETROMINOS.I.shape,
        color: TETROMINOS.I.color,
        position: { x: 3, y: 17 },
        rotation: 0,
      };

      const newBoard = mergePieceToBoard(board, piece);

      // I piece is at row 1 of its shape (4 blocks wide)
      expect(newBoard[18][3].filled).toBe(true);
      expect(newBoard[18][4].filled).toBe(true);
      expect(newBoard[18][5].filled).toBe(true);
      expect(newBoard[18][6].filled).toBe(true);
      expect(newBoard[18][3].color).toBe(TETROMINOS.I.color);
    });

    it('should not modify original board', () => {
      const piece: CurrentPiece = {
        type: 'O',
        shape: TETROMINOS.O.shape,
        color: TETROMINOS.O.color,
        position: { x: 4, y: 18 },
        rotation: 0,
      };

      const originalBoard = JSON.parse(JSON.stringify(board));
      mergePieceToBoard(board, piece);

      expect(board).toEqual(originalBoard);
    });

    it('should not merge blocks that are above the board', () => {
      const piece: CurrentPiece = {
        type: 'I',
        shape: TETROMINOS.I.shape,
        color: TETROMINOS.I.color,
        position: { x: 3, y: -2 },
        rotation: 0,
      };

      const newBoard = mergePieceToBoard(board, piece);

      // Check that nothing was merged (piece is above board)
      const hasAnyFilled = newBoard.some(row => row.some(cell => cell.filled));
      expect(hasAnyFilled).toBe(false);
    });
  });

  describe('clearLines', () => {
    let board: Board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it('should return 0 lines cleared for empty board', () => {
      const { newBoard, linesCleared } = clearLines(board);
      expect(linesCleared).toBe(0);
      expect(newBoard).toHaveLength(BOARD_HEIGHT);
    });

    it('should clear a single completed line', () => {
      // Fill the bottom row
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board[19][x] = { filled: true, color: '#fff' };
      }

      const { newBoard, linesCleared } = clearLines(board);
      expect(linesCleared).toBe(1);
      expect(newBoard).toHaveLength(BOARD_HEIGHT);
      expect(newBoard[19].every(cell => !cell.filled)).toBe(true);
    });

    it('should clear multiple completed lines', () => {
      // Fill bottom 3 rows
      for (let y = 17; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          board[y][x] = { filled: true, color: '#fff' };
        }
      }

      const { newBoard, linesCleared } = clearLines(board);
      expect(linesCleared).toBe(3);
      expect(newBoard).toHaveLength(BOARD_HEIGHT);
      // Check bottom rows are now empty
      for (let y = 17; y < BOARD_HEIGHT; y++) {
        expect(newBoard[y].every(cell => !cell.filled)).toBe(true);
      }
    });

    it('should clear 4 lines (Tetris)', () => {
      // Fill bottom 4 rows
      for (let y = 16; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          board[y][x] = { filled: true, color: '#fff' };
        }
      }

      const { newBoard, linesCleared } = clearLines(board);
      expect(linesCleared).toBe(4);
      expect(newBoard).toHaveLength(BOARD_HEIGHT);
    });

    it('should not clear incomplete lines', () => {
      // Fill bottom row except one cell
      for (let x = 0; x < BOARD_WIDTH - 1; x++) {
        board[19][x] = { filled: true, color: '#fff' };
      }

      const { newBoard, linesCleared } = clearLines(board);
      expect(linesCleared).toBe(0);
      // Board should remain unchanged
      expect(newBoard[19][BOARD_WIDTH - 1].filled).toBe(false);
    });

    it('should preserve blocks above cleared lines', () => {
      // Place a block at top
      board[0][5] = { filled: true, color: '#ff0000' };

      // Fill bottom row
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board[19][x] = { filled: true, color: '#fff' };
      }

      const { newBoard, linesCleared } = clearLines(board);
      expect(linesCleared).toBe(1);
      // The red block should now be at row 1 (moved down)
      expect(newBoard[1][5].filled).toBe(true);
      expect(newBoard[1][5].color).toBe('#ff0000');
    });
  });

  describe('getGhostPosition', () => {
    let board: Board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it('should return bottom position for empty board', () => {
      const piece: CurrentPiece = {
        type: 'O',
        shape: TETROMINOS.O.shape,
        color: TETROMINOS.O.color,
        position: { x: 4, y: 0 },
        rotation: 0,
      };

      const ghostPos = getGhostPosition(board, piece);
      expect(ghostPos.x).toBe(4);
      expect(ghostPos.y).toBe(18); // O piece is 2 high, so bottom is 18
    });

    it('should stop at filled cells', () => {
      // Fill some cells
      board[15][4].filled = true;
      board[15][5].filled = true;

      const piece: CurrentPiece = {
        type: 'O',
        shape: TETROMINOS.O.shape,
        color: TETROMINOS.O.color,
        position: { x: 4, y: 0 },
        rotation: 0,
      };

      const ghostPos = getGhostPosition(board, piece);
      expect(ghostPos.y).toBe(13); // Should stop just above the filled cells
    });

    it('should return same position if already at bottom', () => {
      const piece: CurrentPiece = {
        type: 'O',
        shape: TETROMINOS.O.shape,
        color: TETROMINOS.O.color,
        position: { x: 4, y: 18 },
        rotation: 0,
      };

      const ghostPos = getGhostPosition(board, piece);
      expect(ghostPos).toEqual(piece.position);
    });
  });

  describe('calculateScore', () => {
    it('should calculate score for single line', () => {
      expect(calculateScore(1, 1)).toBe(100);
      expect(calculateScore(1, 2)).toBe(200);
      expect(calculateScore(1, 5)).toBe(500);
    });

    it('should calculate score for double lines', () => {
      expect(calculateScore(2, 1)).toBe(300);
      expect(calculateScore(2, 3)).toBe(900);
    });

    it('should calculate score for triple lines', () => {
      expect(calculateScore(3, 1)).toBe(500);
      expect(calculateScore(3, 2)).toBe(1000);
    });

    it('should calculate score for Tetris (4 lines)', () => {
      expect(calculateScore(4, 1)).toBe(800);
      expect(calculateScore(4, 5)).toBe(4000);
    });

    it('should return 0 for 0 lines cleared', () => {
      expect(calculateScore(0, 1)).toBe(0);
    });

    it('should return 0 for invalid line counts', () => {
      expect(calculateScore(5, 1)).toBe(0);
      expect(calculateScore(-1, 1)).toBe(0);
    });
  });

  describe('calculateLevel', () => {
    it('should start at level 1', () => {
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(5)).toBe(1);
      expect(calculateLevel(9)).toBe(1);
    });

    it('should increase every 10 lines', () => {
      expect(calculateLevel(10)).toBe(2);
      expect(calculateLevel(15)).toBe(2);
      expect(calculateLevel(20)).toBe(3);
      expect(calculateLevel(100)).toBe(11);
    });
  });

  describe('calculateSpeed', () => {
    it('should start at 1000ms for level 1', () => {
      expect(calculateSpeed(1)).toBe(1000);
    });

    it('should decrease by 50ms per level', () => {
      expect(calculateSpeed(2)).toBe(950);
      expect(calculateSpeed(3)).toBe(900);
      expect(calculateSpeed(10)).toBe(550);
    });

    it('should not go below 100ms', () => {
      expect(calculateSpeed(20)).toBe(100);
      expect(calculateSpeed(50)).toBe(100);
      expect(calculateSpeed(100)).toBe(100);
    });
  });

  describe('getStartPosition', () => {
    it('should center O piece', () => {
      const pos = getStartPosition(TETROMINOS.O.shape);
      expect(pos.x).toBe(4); // (10 - 2) / 2 = 4
      expect(pos.y).toBe(-1);
    });

    it('should center I piece', () => {
      const pos = getStartPosition(TETROMINOS.I.shape);
      expect(pos.x).toBe(3); // (10 - 4) / 2 = 3
      expect(pos.y).toBe(-1);
    });

    it('should center T piece', () => {
      const pos = getStartPosition(TETROMINOS.T.shape);
      expect(pos.x).toBe(3); // (10 - 3) / 2 = 3.5, floor to 3
      expect(pos.y).toBe(-1);
    });
  });

  describe('isGameOver', () => {
    let board: Board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it('should return false for empty board', () => {
      expect(isGameOver(board, TETROMINOS.O.shape)).toBe(false);
      expect(isGameOver(board, TETROMINOS.I.shape)).toBe(false);
    });

    it('should return true when piece cannot be placed at start', () => {
      // Fill the top rows where pieces spawn
      for (let x = 0; x < BOARD_WIDTH; x++) {
        board[0][x] = { filled: true, color: '#fff' };
        board[1][x] = { filled: true, color: '#fff' };
      }

      expect(isGameOver(board, TETROMINOS.O.shape)).toBe(true);
    });

    it('should allow game to continue if only some top cells are filled', () => {
      // Fill just a few cells at the top
      board[0][0] = { filled: true, color: '#fff' };
      board[0][1] = { filled: true, color: '#fff' };

      // Most pieces should still be able to spawn
      expect(isGameOver(board, TETROMINOS.O.shape)).toBe(false);
    });
  });

  describe('tryRotate', () => {
    let board: Board;

    beforeEach(() => {
      board = createEmptyBoard();
    });

    it('should return position when rotation is valid without wall kick', () => {
      const piece: CurrentPiece = {
        type: 'T',
        shape: TETROMINOS.T.shape,
        color: TETROMINOS.T.color,
        position: { x: 4, y: 10 },
        rotation: 0,
      };

      // Rotate the T piece
      const rotatedShape = [
        [0, 1],
        [1, 1],
        [0, 1],
      ];

      const newPos = tryRotate(board, piece, rotatedShape);
      expect(newPos).not.toBeNull();
      expect(newPos?.x).toBe(4);
      expect(newPos?.y).toBe(10);
    });

    it('should use wall kick when rotation would collide', () => {
      const piece: CurrentPiece = {
        type: 'I',
        shape: TETROMINOS.I.shape,
        color: TETROMINOS.I.color,
        position: { x: 0, y: 10 }, // Against left wall
        rotation: 0,
      };

      // Rotated I piece (vertical)
      const rotatedShape = [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ];

      const newPos = tryRotate(board, piece, rotatedShape);
      expect(newPos).not.toBeNull();
      // Should kick to the right
      expect(newPos!.x).toBeGreaterThanOrEqual(0);
    });

    it('should return null when rotation is impossible', () => {
      // Fill cells around the piece
      const piece: CurrentPiece = {
        type: 'T',
        shape: TETROMINOS.T.shape,
        color: TETROMINOS.T.color,
        position: { x: 4, y: 10 },
        rotation: 0,
      };

      // Fill surrounding cells
      for (let y = 9; y <= 11; y++) {
        for (let x = 3; x <= 6; x++) {
          if (y !== 10 || x !== 4) {
            board[y][x] = { filled: true, color: '#fff' };
          }
        }
      }

      const rotatedShape = [
        [0, 1],
        [1, 1],
        [0, 1],
      ];

      const newPos = tryRotate(board, piece, rotatedShape);
      expect(newPos).toBeNull();
    });
  });

  describe('WALL_KICK_OFFSETS', () => {
    it('should have correct number of wall kick attempts', () => {
      expect(WALL_KICK_OFFSETS).toHaveLength(8);
    });

    it('should start with no offset', () => {
      expect(WALL_KICK_OFFSETS[0]).toEqual({ x: 0, y: 0 });
    });

    it('should include basic left/right offsets', () => {
      expect(WALL_KICK_OFFSETS).toContainEqual({ x: -1, y: 0 });
      expect(WALL_KICK_OFFSETS).toContainEqual({ x: 1, y: 0 });
    });
  });
});
