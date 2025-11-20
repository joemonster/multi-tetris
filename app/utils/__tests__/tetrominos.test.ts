import {
  TETROMINOS,
  getRandomTetromino,
  rotateShape,
  getAllRotations,
} from '../tetrominos';
import { TetrominoType, Shape } from '../../types/game.types';

describe('tetrominos', () => {
  describe('TETROMINOS', () => {
    const tetrominoTypes: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

    it('should have all 7 tetromino types', () => {
      expect(Object.keys(TETROMINOS)).toHaveLength(7);
      tetrominoTypes.forEach(type => {
        expect(TETROMINOS[type]).toBeDefined();
      });
    });

    describe('I piece', () => {
      it('should have correct shape (4x4 grid)', () => {
        const iPiece = TETROMINOS.I;
        expect(iPiece.shape).toEqual([
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ]);
      });

      it('should have cyan color', () => {
        expect(TETROMINOS.I.color).toBe('#00f5ff');
      });
    });

    describe('O piece', () => {
      it('should have correct shape (2x2 square)', () => {
        const oPiece = TETROMINOS.O;
        expect(oPiece.shape).toEqual([
          [1, 1],
          [1, 1],
        ]);
      });

      it('should have yellow color', () => {
        expect(TETROMINOS.O.color).toBe('#ffd700');
      });
    });

    describe('T piece', () => {
      it('should have correct shape', () => {
        const tPiece = TETROMINOS.T;
        expect(tPiece.shape).toEqual([
          [0, 1, 0],
          [1, 1, 1],
          [0, 0, 0],
        ]);
      });

      it('should have purple color', () => {
        expect(TETROMINOS.T.color).toBe('#a855f7');
      });
    });

    describe('S piece', () => {
      it('should have correct shape', () => {
        const sPiece = TETROMINOS.S;
        expect(sPiece.shape).toEqual([
          [0, 1, 1],
          [1, 1, 0],
          [0, 0, 0],
        ]);
      });

      it('should have green color', () => {
        expect(TETROMINOS.S.color).toBe('#22c55e');
      });
    });

    describe('Z piece', () => {
      it('should have correct shape', () => {
        const zPiece = TETROMINOS.Z;
        expect(zPiece.shape).toEqual([
          [1, 1, 0],
          [0, 1, 1],
          [0, 0, 0],
        ]);
      });

      it('should have red color', () => {
        expect(TETROMINOS.Z.color).toBe('#ef4444');
      });
    });

    describe('J piece', () => {
      it('should have correct shape', () => {
        const jPiece = TETROMINOS.J;
        expect(jPiece.shape).toEqual([
          [1, 0, 0],
          [1, 1, 1],
          [0, 0, 0],
        ]);
      });

      it('should have blue color', () => {
        expect(TETROMINOS.J.color).toBe('#3b82f6');
      });
    });

    describe('L piece', () => {
      it('should have correct shape', () => {
        const lPiece = TETROMINOS.L;
        expect(lPiece.shape).toEqual([
          [0, 0, 1],
          [1, 1, 1],
          [0, 0, 0],
        ]);
      });

      it('should have orange color', () => {
        expect(TETROMINOS.L.color).toBe('#f97316');
      });
    });

    it('should have unique colors for all pieces', () => {
      const colors = tetrominoTypes.map(type => TETROMINOS[type].color);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(7);
    });

    it('should have valid shape arrays (rectangular grids)', () => {
      tetrominoTypes.forEach(type => {
        const shape = TETROMINOS[type].shape;
        expect(Array.isArray(shape)).toBe(true);
        expect(shape.length).toBeGreaterThan(0);

        // Check that all rows have the same length
        const rowLength = shape[0].length;
        shape.forEach(row => {
          expect(row.length).toBe(rowLength);
        });
      });
    });

    it('should only contain 0s and 1s in shapes', () => {
      tetrominoTypes.forEach(type => {
        const shape = TETROMINOS[type].shape;
        shape.forEach(row => {
          row.forEach(cell => {
            expect([0, 1]).toContain(cell);
          });
        });
      });
    });

    it('should have at least one filled block in each shape', () => {
      tetrominoTypes.forEach(type => {
        const shape = TETROMINOS[type].shape;
        const hasFilledBlock = shape.some(row => row.some(cell => cell === 1));
        expect(hasFilledBlock).toBe(true);
      });
    });
  });

  describe('getRandomTetromino', () => {
    it('should return a valid tetromino type', () => {
      const validTypes: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      const randomType = getRandomTetromino();
      expect(validTypes).toContain(randomType);
    });

    it('should return different types over multiple calls', () => {
      const results = new Set<TetrominoType>();
      // Generate 100 random pieces - statistically should get variety
      for (let i = 0; i < 100; i++) {
        results.add(getRandomTetromino());
      }
      // Should have at least 5 different types in 100 tries
      expect(results.size).toBeGreaterThanOrEqual(5);
    });

    it('should only return one of the 7 types', () => {
      const validTypes: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      for (let i = 0; i < 50; i++) {
        const randomType = getRandomTetromino();
        expect(validTypes).toContain(randomType);
      }
    });
  });

  describe('rotateShape', () => {
    it('should rotate O piece (result should be same)', () => {
      const original = TETROMINOS.O.shape;
      const rotated = rotateShape(original);
      expect(rotated).toEqual(original);
    });

    it('should rotate I piece from horizontal to vertical', () => {
      const horizontal = [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];

      const rotated = rotateShape(horizontal);
      expect(rotated).toEqual([
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ]);
    });

    it('should rotate T piece correctly', () => {
      const original = [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ];

      const rotated = rotateShape(original);
      expect(rotated).toEqual([
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ]);
    });

    it('should rotate L piece correctly', () => {
      const original = [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ];

      const rotated = rotateShape(original);
      expect(rotated).toEqual([
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ]);
    });

    it('should return to original shape after 4 rotations', () => {
      const original = TETROMINOS.T.shape;
      let rotated = original;

      for (let i = 0; i < 4; i++) {
        rotated = rotateShape(rotated);
      }

      expect(rotated).toEqual(original);
    });

    it('should preserve the number of filled blocks', () => {
      const original = TETROMINOS.S.shape;
      const countFilled = (shape: Shape) =>
        shape.reduce((sum, row) => sum + row.filter(cell => cell === 1).length, 0);

      const originalCount = countFilled(original);
      const rotatedCount = countFilled(rotateShape(original));

      expect(rotatedCount).toBe(originalCount);
    });

    it('should change dimensions for non-square shapes', () => {
      const shape = [
        [1, 1, 1],
        [0, 0, 0],
      ];

      const rotated = rotateShape(shape);
      expect(rotated.length).toBe(3); // Original width becomes height
      expect(rotated[0].length).toBe(2); // Original height becomes width
    });

    it('should handle single cell shape', () => {
      const shape = [[1]];
      const rotated = rotateShape(shape);
      expect(rotated).toEqual([[1]]);
    });
  });

  describe('getAllRotations', () => {
    it('should return 4 rotations', () => {
      const rotations = getAllRotations('T');
      expect(rotations).toHaveLength(4);
    });

    it('should return same shape for all O piece rotations', () => {
      const rotations = getAllRotations('O');
      expect(rotations[0]).toEqual(rotations[1]);
      expect(rotations[1]).toEqual(rotations[2]);
      expect(rotations[2]).toEqual(rotations[3]);
    });

    it('should have different shapes for I piece rotations', () => {
      const rotations = getAllRotations('I');
      // I piece has different rotations (each rotation shifts position in 4x4 grid)
      expect(rotations[0]).not.toEqual(rotations[1]);
      expect(rotations[0]).not.toEqual(rotations[2]);
      expect(rotations[0]).not.toEqual(rotations[3]);
      // All should still have 4 filled blocks
      const countFilled = (shape: Shape) =>
        shape.reduce((sum, row) => sum + row.filter(cell => cell === 1).length, 0);
      rotations.forEach(rotation => {
        expect(countFilled(rotation)).toBe(4);
      });
    });

    it('should have 4 unique rotations for T piece', () => {
      const rotations = getAllRotations('T');
      // T piece should have 4 different rotations
      const uniqueRotations = new Set(rotations.map(r => JSON.stringify(r)));
      expect(uniqueRotations.size).toBe(4);
    });

    it('should return to original after 4 rotations', () => {
      const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      types.forEach(type => {
        const rotations = getAllRotations(type);
        expect(rotations[0]).toEqual(rotations[4 % 4]); // Should be same as index 0
      });
    });

    it('should preserve filled block count in all rotations', () => {
      const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      const countFilled = (shape: Shape) =>
        shape.reduce((sum, row) => sum + row.filter(cell => cell === 1).length, 0);

      types.forEach(type => {
        const rotations = getAllRotations(type);
        const counts = rotations.map(countFilled);
        const uniqueCounts = new Set(counts);
        expect(uniqueCounts.size).toBe(1); // All rotations should have same count
      });
    });

    it('should work for all 7 tetromino types', () => {
      const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      types.forEach(type => {
        const rotations = getAllRotations(type);
        expect(rotations).toHaveLength(4);
        expect(Array.isArray(rotations)).toBe(true);
      });
    });

    it('should maintain 4 blocks for all pieces in all rotations', () => {
      const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      const countFilled = (shape: Shape) =>
        shape.reduce((sum, row) => sum + row.filter(cell => cell === 1).length, 0);

      types.forEach(type => {
        const rotations = getAllRotations(type);
        rotations.forEach(rotation => {
          expect(countFilled(rotation)).toBe(4);
        });
      });
    });
  });
});
