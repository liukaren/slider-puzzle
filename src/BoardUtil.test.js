import {
  deepEqual,
  generateSolved,
  isGoal,
  manhattan,
  neighbors
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

test('generateSolved', () => {
  expect(generateSolved(3)).toEqual([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0]
  ]);

  expect(generateSolved(4)).toEqual([
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 0]
  ]);
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
  );

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
  );

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
  );

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
