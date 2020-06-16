import TinyQueue from 'tinyqueue';

// This is a crucial improvement to put more weight on the manhattan/linear conflict
// distance when comparing the priority of boards. The end solution may not use
// the minimum number of moves, but it will be found more quickly.
const HEURISTIC_FACTOR = 2;

export function swapTiles(board, row1, col1, row2, col2) {
  const temp = board[row1][col1];
  board[row1][col1] = board[row2][col2];
  board[row2][col2] = temp;
}

function findBlank(board) {
  const dimension = board.length;
  for (let row = 0; row < dimension; row++) {
    for (let col = 0; col < dimension; col++) {
      if (board[row][col] === 0) return { row, col };
    }
  }
}

export function shuffleBoard(board) {
  const dimension = board.length;
  // Fisher-Yates shuffle, adapted for a 2-d array
  for (let i = dimension * dimension - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const iRow = Math.floor(i / dimension);
    const iCol = i % dimension;
    const jRow = Math.floor(j / dimension);
    const jCol = j % dimension;
    swapTiles(board, iRow, iCol, jRow, jCol);
  }

  const blankPos = findBlank(board);
  if (!isSolvable(board, blankPos.row)) {
    // Create one more inversion (avoid the blank tile) to make the board solvable.
    // Probably makes the board randomness less evenly distributed, but meh.
    if (blankPos.row === 0) swapTiles(board, 1, 0, 1, 1);
    else swapTiles(board, 0, 0, 0, 1);
  }

  return board;
}

// Merge and count inversions
function merge(array, tempArray, left, mid, right) {
  let inversions = 0;
  let i = left;
  let j = mid + 1;
  let k = left; // tempArray index

  while (i <= mid && j <= right) {
    if (array[i] <= array[j]) {
      tempArray[k] = array[i];
      k++;
      i++;
    } else {
      tempArray[k] = array[j];
      // Ignore blank space when counting inversions
      if (array[j] !== 0) inversions += mid - i + 1;
      k++;
      j++;
    }
  }

  while (i <= mid) {
    tempArray[k] = array[i];
    k++;
    i++;
  }
  while (j <= right) {
    tempArray[k] = array[j];
    k++;
    j++;
  }

  for (let x = left; x <= right; x++) {
    array[x] = tempArray[x];
  }

  return inversions;
}

// Mergesort and count inversions
function mergeSort(array, tempArray, left, right) {
  let inversions = 0;

  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    inversions += mergeSort(array, tempArray, left, mid);
    inversions += mergeSort(array, tempArray, mid + 1, right);
    inversions += merge(array, tempArray, left, mid, right);
  }

  return inversions;
}

export function countInversions(array) {
  return mergeSort(array, [], 0, array.length - 1);
}

// https://www.geeksforgeeks.org/check-instance-15-puzzle-solvable/
export function isSolvable(board, blankRow) {
  const dimension = board.length;
  const flattenedBoard = [].concat(...board);
  const inversions = countInversions(flattenedBoard);
  if (dimension % 2 === 1) {
    return inversions % 2 === 0;
  } else {
    if (blankRow % 2 === 0) {
      return inversions % 2 === 1;
    }
    return inversions % 2 === 0;
  }
}

export function generateSolved(dimension) {
  let board = new Array(dimension);
  for (let row = 0; row < dimension; row++) {
    board[row] = new Array(dimension);
    for (let col = 0; col < dimension; col++) {
      board[row][col] = row * dimension + col + 1;
    }
  }
  board[dimension - 1][dimension - 1] = 0;
  return board;
}

export function isGoal(board) {
  return manhattan(board) === 0;
}

export function getGoalPosition(tile, dimension) {
  return {
    row: Math.floor((tile - 1) / dimension),
    col: (tile - 1) % dimension
  };
}

// Returns distance from the goal board
export function manhattan(board) {
  const dim = board.length;
  let distance = 0;
  for (let row = 0; row < dim; row++) {
    for (let col = 0; col < dim; col++) {
      const tile = board[row][col];
      if (tile === 0) continue;
      const goal = getGoalPosition(tile, dim);
      distance += Math.abs(goal.row - row) + Math.abs(goal.col - col);
    }
  }
  return distance;
}

export function linearConflict(board) {
  const dim = board.length;

  let linearConflicts = 0;

  // Check for row conflicts
  for (let row = 0; row < dim; row++) {
    for (let col1 = 0; col1 < dim; col1++) {
      for (let col2 = col1; col2 < dim; col2++) {
        const tile1 = board[row][col1];
        const tile2 = board[row][col2];
        if (tile1 === 0 || tile2 === 0) continue;
        const goal1 = getGoalPosition(tile1, dim);
        const goal2 = getGoalPosition(tile2, dim);
        if (goal1.row === row && goal2.row === row && goal1.col > goal2.col)
          linearConflicts++;
      }
    }
  }

  // Check for col conflicts
  for (let col = 0; col < dim; col++) {
    for (let row1 = 0; row1 < dim; row1++) {
      for (let row2 = row1; row2 < dim; row2++) {
        const tile1 = board[row1][col];
        const tile2 = board[row2][col];
        if (tile1 === 0 || tile2 === 0) continue;
        const goal1 = getGoalPosition(tile1, dim);
        const goal2 = getGoalPosition(tile2, dim);
        if (goal1.col === col && goal2.col === col && goal1.row > goal2.row)
          linearConflicts++;
      }
    }
  }

  return linearConflicts;
}

export function heuristic(board) {
  return manhattan(board) + 2 * linearConflict(board);
}

export function deepEqual(board1, board2) {
  if (board1.length !== board2.length) return false;
  for (let row = 0; row < board1.length; row++) {
    for (let col = 0; col < board1.length; col++) {
      if (board1[row][col] !== board2[row][col]) return false;
    }
  }
  return true;
}

function createNeighbor(board, blankRow, blankCol, neighborRow, neighborCol) {
  swapTiles(board, blankRow, blankCol, neighborRow, neighborCol); // Swap two tiles
  const neighbor = JSON.parse(JSON.stringify(board)); // Copy the board
  swapTiles(board, blankRow, blankCol, neighborRow, neighborCol); // Swap tiles back
  return neighbor;
}

// Boards reachable in one step. For convenience, pass in the position of the blank tile
export function neighbors(board, blankRow, blankCol) {
  let neighbors = [];

  if (blankRow > 0) {
    neighbors.push({
      board: createNeighbor(board, blankRow, blankCol, blankRow - 1, blankCol),
      blankRow: blankRow - 1,
      blankCol
    });
  }
  if (blankCol > 0) {
    neighbors.push({
      board: createNeighbor(board, blankRow, blankCol, blankRow, blankCol - 1),
      blankRow,
      blankCol: blankCol - 1
    });
  }
  if (blankRow < board.length - 1) {
    neighbors.push({
      board: createNeighbor(board, blankRow, blankCol, blankRow + 1, blankCol),
      blankRow: blankRow + 1,
      blankCol
    });
  }
  if (blankCol < board.length - 1) {
    neighbors.push({
      board: createNeighbor(board, blankRow, blankCol, blankRow, blankCol + 1),
      blankRow,
      blankCol: blankCol + 1
    });
  }

  return neighbors;
}

export function generateRandom(dimension) {
  return shuffleBoard(generateSolved(dimension));
}

function compare(n1, n2) {
  const priority1 = n1.heuristic * HEURISTIC_FACTOR + n1.steps;
  const priority2 = n2.heuristic * HEURISTIC_FACTOR + n2.steps;
  return priority1 - priority2;
}

export function solve(board, blankRow, blankCol) {
  const initial = {
    board,
    blankRow,
    blankCol,
    heuristic: heuristic(board),
    steps: 0,
    previous: null
  };
  const queue = new TinyQueue([initial], compare);
  let searchNode = initial;

  while (!isGoal(searchNode.board)) {
    searchNode = queue.pop();
    const neighborList = neighbors(
      searchNode.board,
      searchNode.blankRow,
      searchNode.blankCol
    );
    for (let i = 0; i < neighborList.length; i++) {
      const nextNeighbor = neighborList[i];

      // Optimization: Don't go back to the previous board, that's silly
      if (
        searchNode.previous !== null &&
        deepEqual(nextNeighbor.board, searchNode.previous.board)
      ) {
        continue;
      }

      queue.push({
        board: nextNeighbor.board,
        heuristic: heuristic(nextNeighbor.board),
        steps: searchNode.steps + 1,
        previous: searchNode,
        blankRow: nextNeighbor.blankRow,
        blankCol: nextNeighbor.blankCol
      });
    }
  }

  // Retrace steps
  const solution = [];
  while (searchNode !== null) {
    solution.push({
      blankRow: searchNode.blankRow,
      blankCol: searchNode.blankCol
    });
    searchNode = searchNode.previous;
  }

  solution.reverse();
  solution.shift(); // Remove initial board
  return solution;
}
