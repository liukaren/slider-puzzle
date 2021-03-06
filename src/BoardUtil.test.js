import {
  deepEqual,
  countInversions,
  generateSolved,
  getGoalPosition,
  isGoal,
  isSolvable,
  linearConflict,
  manhattan,
  neighbors,
  solve
} from './BoardUtil';

test('deepEqual', () => {
  expect(
    deepEqual(
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0]
      ],
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0]
      ]
    )
  ).toBe(true);

  expect(
    deepEqual(
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0]
      ],
      [
        [1, 2, 3],
        [4, 5, 6],
        [8, 7, 0]
      ]
    )
  ).toBe(false);
});

test('countInversions', () => {
  expect(countInversions([1, 2, 3])).toBe(0);
  expect(countInversions([3, 2, 1])).toBe(3);
  expect(countInversions([9, 4, 6, 5, 2, 8])).toBe(9);
});

test('countInversions - ignores zero (blank space)', () => {
  expect(countInversions([1, 2, 3, 4, 0])).toBe(0);
  expect(countInversions([1, 2, 0, 3, 4])).toBe(0);
  expect(countInversions([1, 4, 3, 2, 0])).toBe(3);
  expect(countInversions([1, 4, 0, 3, 2])).toBe(3);
});

test('generateSolved', () => {
  expect(generateSolved(3)).toEqual({
    tiles: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 0]
    ],
    blankRow: 2,
    blankCol: 2
  });

  expect(generateSolved(4)).toEqual({
    tiles: [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 0]
    ],
    blankRow: 3,
    blankCol: 3
  });
});

test('getGoalPosition', () => {
  expect(getGoalPosition(1, 3)).toEqual({ row: 0, col: 0 });
  expect(getGoalPosition(1, 4)).toEqual({ row: 0, col: 0 });
  expect(getGoalPosition(4, 3)).toEqual({ row: 1, col: 0 });
  expect(getGoalPosition(4, 4)).toEqual({ row: 0, col: 3 });
  expect(getGoalPosition(5, 3)).toEqual({ row: 1, col: 1 });
  expect(getGoalPosition(5, 4)).toEqual({ row: 1, col: 0 });
  // NOTE: getGoalPosition(0, x) is not expected to be called
});

test('isGoal', () => {
  expect(isGoal(generateSolved(3))).toBe(true);
  expect(isGoal(generateSolved(4))).toBe(true);

  expect(
    isGoal([
      [1, 2, 3],
      [4, 5, 6],
      [7, 0, 8]
    ])
  ).toBe(false);
  expect(
    isGoal([
      [1, 2, 3, 4],
      [5, 6, 11, 8],
      [9, 10, 7, 12],
      [13, 14, 15, 0]
    ])
  ).toBe(false);
});

test('isSolvable', () => {
  expect(
    isSolvable(
      [
        [1, 8, 2],
        [0, 4, 3],
        [7, 6, 5]
      ],
      1
    )
  ).toBe(true);

  expect(
    isSolvable(
      [
        [8, 1, 2], // Same as above, but swap two tiles here
        [0, 4, 3],
        [7, 6, 5]
      ],
      1
    )
  ).toBe(false);

  expect(
    isSolvable(
      [
        [13, 2, 10, 3],
        [1, 12, 8, 4],
        [5, 0, 9, 6],
        [15, 14, 11, 7]
      ],
      2
    )
  ).toBe(true);

  expect(
    isSolvable(
      [
        [13, 2, 10, 3],
        [1, 12, 4, 8], // Same as above, but swap two tiles here
        [5, 0, 9, 6],
        [15, 14, 11, 7]
      ],
      2,
      1
    )
  ).toBe(false);
});

test('linearConflict - row conflict', () => {
  expect(
    linearConflict([
      [2, 3, 1],
      [4, 5, 6],
      [7, 8, 0]
    ])
  ).toBe(2);

  expect(
    linearConflict([
      [2, 1, 3],
      [4, 5, 6],
      [7, 8, 0]
    ])
  ).toBe(1);

  expect(
    linearConflict([
      [1, 2, 3],
      [4, 6, 5],
      [7, 8, 0]
    ])
  ).toBe(1);
});

test('linearConflict - col conflict', () => {
  expect(
    linearConflict([
      [4, 2, 3],
      [7, 5, 6],
      [1, 8, 0]
    ])
  ).toBe(2);

  expect(
    linearConflict([
      [4, 2, 3],
      [1, 5, 6],
      [7, 8, 0]
    ])
  ).toBe(1);

  expect(
    linearConflict([
      [1, 2, 3],
      [4, 8, 6],
      [7, 5, 0]
    ])
  ).toBe(1);
});

test('linearConflict - no conflict', () => {
  expect(
    linearConflict([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 0]
    ])
  ).toBe(0);

  expect(
    linearConflict([
      [1, 7, 2], // 7 is in the way of 2, but 7's goal is in a different row/col
      [4, 5, 6],
      [3, 8, 0]
    ])
  ).toBe(0);

  // All are in the correct spot or in both wrong row and col
  expect(
    linearConflict([
      [5, 2, 3],
      [4, 1, 6],
      [7, 8, 0]
    ])
  ).toBe(0);

  // Blank spot does not count as linear conflict
  expect(
    linearConflict([
      [1, 2, 3],
      [4, 5, 6],
      [7, 0, 8]
    ])
  ).toBe(0);
});

test('linearConflict - other examples', () => {
  expect(
    linearConflict([
      [4, 2, 5],
      [1, 0, 6],
      [3, 8, 7]
    ])
  ).toBe(2);
});

test('manhattan', () => {
  expect(
    manhattan([
      [1, 2, 3, 4],
      [5, 6, 11, 8],
      [9, 10, 7, 12],
      [13, 14, 15, 0]
    ])
  ).toBe(2);

  expect(
    manhattan([
      [1, 2, 3],
      [4, 5, 6],
      [7, 0, 8]
    ])
  ).toBe(1);

  expect(
    manhattan([
      [3, 1, 2],
      [4, 8, 5],
      [7, 6, 0]
    ])
  ).toBe(8);
});

test('neighbors - center case', () => {
  let neighborList = neighbors(
    [
      [1, 2, 3],
      [4, 0, 5],
      [6, 7, 8]
    ],
    1,
    1
  ).map(n => n.tiles);

  expect(neighborList.length).toBe(4);
  expect(neighborList).toContainEqual([
    [1, 2, 3],
    [4, 5, 0],
    [6, 7, 8]
  ]);
  expect(neighborList).toContainEqual([
    [1, 2, 3],
    [0, 4, 5],
    [6, 7, 8]
  ]);
  expect(neighborList).toContainEqual([
    [1, 2, 3],
    [4, 7, 5],
    [6, 0, 8]
  ]);
  expect(neighborList).toContainEqual([
    [1, 0, 3],
    [4, 2, 5],
    [6, 7, 8]
  ]);
});

test('neighbors - edge case', () => {
  let neighborList = neighbors(
    [
      [1, 2, 3],
      [4, 5, 6],
      [7, 0, 8]
    ],
    2,
    1
  ).map(n => n.tiles);

  expect(neighborList.length).toBe(3);
  expect(neighborList).toContainEqual([
    [1, 2, 3],
    [4, 5, 6],
    [0, 7, 8]
  ]);
  expect(neighborList).toContainEqual([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0]
  ]);
  expect(neighborList).toContainEqual([
    [1, 2, 3],
    [4, 0, 6],
    [7, 5, 8]
  ]);
});

test('neighbors - corner case', () => {
  let neighborList = neighbors(
    [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 0]
    ],
    2,
    2
  ).map(n => n.tiles);

  expect(neighborList.length).toBe(2);
  expect(neighborList).toContainEqual([
    [1, 2, 3],
    [4, 5, 0],
    [7, 8, 6]
  ]);
  expect(neighborList).toContainEqual([
    [1, 2, 3],
    [4, 5, 6],
    [7, 0, 8]
  ]);
});

test('solve - already solved', () => {
  expect(
    solve(
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 0]
      ],
      2,
      2
    ).length
  ).toBe(0);
});

test('solve - one move', () => {
  expect(
    solve(
      [
        [1, 2, 3],
        [4, 5, 6],
        [7, 0, 8]
      ],
      2,
      1
    ).length
  ).toBe(1);
});

test('solve - multiple moves', () => {
  const solution = solve(
    [
      [0, 1, 3],
      [4, 2, 5],
      [7, 8, 6]
    ],
    0,
    0
  );
  expect(solution.length).toBe(4);
});
