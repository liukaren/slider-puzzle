import TinyQueue from 'tinyqueue';

// This is a crucial optimization to give more priority to distance than to steps taken.
// As a result, the solution may not take the minimum number of steps,
// but it will be found more quickly.
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

// Translates an index in a flattened array to coordinates in a 2-d array
function indexToCoords(index, dimension) {
  return {
    row: Math.floor(index / dimension),
    col: index % dimension
  };
}

function shuffleBoard(tiles) {
  const dimension = tiles.length;
  const size = dimension * dimension - 1;

  // Fisher-Yates shuffle, adapted for a 2-d array
  for (let i = size; i > 0; i--) {
    const j = Math.floor(Math.random() * i); // Tile to swap with
    const iCoords = indexToCoords(i, dimension);
    const jCoords = indexToCoords(j, dimension);
    swapTiles(tiles, iCoords.row, iCoords.col, jCoords.row, jCoords.col);
  }

  const blankPos = findBlank(tiles);
  if (!isSolvable(tiles, blankPos.row)) {
    // Create one more inversion (avoid the blank tile) to make the board solvable.
    // Probably makes the randomness unevenly distributed, but meh.
    if (blankPos.row === 0) swapTiles(tiles, 1, 0, 1, 1);
    else swapTiles(tiles, 0, 0, 0, 1);
  }

  return { tiles: tiles, blankRow: blankPos.row, blankCol: blankPos.col };
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

  // Copy back into original array
  for (let x = left; x <= right; x++) array[x] = tempArray[x];

  return inversions;
}

// Mergesort to count inversions
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

export function isSolvable(tiles, blankRow) {
  const dimension = tiles.length;
  const flattenedBoard = [].concat(...tiles);
  const inversions = countInversions(flattenedBoard);
  if (dimension % 2 === 1) return inversions % 2 === 0;
  else if (blankRow % 2 === 0) return inversions % 2 === 1;
  return inversions % 2 === 0;
}

export function generateSolved(dimension) {
  let tiles = [];
  for (let row = 0; row < dimension; row++) {
    tiles[row] = [];
    for (let col = 0; col < dimension; col++) {
      tiles[row][col] = row * dimension + col + 1;
    }
  }
  tiles[dimension - 1][dimension - 1] = 0;
  return { tiles: tiles, blankRow: dimension - 1, blankCol: dimension - 1 };
}

export function isGoal(tiles) {
  return manhattan(tiles) === 0;
}

export function getGoalPosition(tile, dimension) {
  return indexToCoords(tile - 1, dimension);
}

// Returns distance from the goal board
export function manhattan(tiles) {
  const dim = tiles.length;
  let distance = 0;
  for (let row = 0; row < dim; row++) {
    for (let col = 0; col < dim; col++) {
      const tile = tiles[row][col];
      if (tile === 0) continue;
      const goal = getGoalPosition(tile, dim);
      distance += Math.abs(goal.row - row) + Math.abs(goal.col - col);
    }
  }
  return distance;
}

export function linearConflict(tiles) {
  const dim = tiles.length;

  let linearConflicts = 0;

  // Check for row conflicts
  for (let row = 0; row < dim; row++) {
    for (let col1 = 0; col1 < dim; col1++) {
      for (let col2 = col1; col2 < dim; col2++) {
        const tile1 = tiles[row][col1];
        const tile2 = tiles[row][col2];
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
        const tile1 = tiles[row1][col];
        const tile2 = tiles[row2][col];
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

export function heuristic(tiles) {
  return manhattan(tiles) + 2 * linearConflict(tiles);
}

export function deepEqual(tiles1, tiles2) {
  if (tiles1.length !== tiles2.length) return false;
  for (let row = 0; row < tiles1.length; row++) {
    for (let col = 0; col < tiles1.length; col++) {
      if (tiles1[row][col] !== tiles2[row][col]) return false;
    }
  }
  return true;
}

function createNeighbor(tiles, blankRow, blankCol, neighborRow, neighborCol) {
  swapTiles(tiles, blankRow, blankCol, neighborRow, neighborCol); // Swap two tiles
  const neighbor = JSON.parse(JSON.stringify(tiles)); // Copy the board
  swapTiles(tiles, blankRow, blankCol, neighborRow, neighborCol); // Swap tiles back
  return { tiles: neighbor, blankRow: neighborRow, blankCol: neighborCol };
}

// Boards reachable in one step. For convenience, pass in the position of the blank tile
export function neighbors(tiles, blankRow, blankCol) {
  let neighbors = [];

  if (blankRow > 0) {
    neighbors.push(
      createNeighbor(tiles, blankRow, blankCol, blankRow - 1, blankCol)
    );
  }
  if (blankCol > 0) {
    neighbors.push(
      createNeighbor(tiles, blankRow, blankCol, blankRow, blankCol - 1)
    );
  }
  if (blankRow < tiles.length - 1) {
    neighbors.push(
      createNeighbor(tiles, blankRow, blankCol, blankRow + 1, blankCol)
    );
  }
  if (blankCol < tiles.length - 1) {
    neighbors.push(
      createNeighbor(tiles, blankRow, blankCol, blankRow, blankCol + 1)
    );
  }

  return neighbors;
}

export function generateRandom(dimension) {
  return shuffleBoard(generateSolved(dimension).tiles);
}

function compare(n1, n2) {
  const priority1 = n1.heuristic * HEURISTIC_FACTOR + n1.steps;
  const priority2 = n2.heuristic * HEURISTIC_FACTOR + n2.steps;
  return priority1 - priority2;
}

export function solve(tiles, blankRow, blankCol) {
  const initial = {
    tiles,
    blankRow,
    blankCol,
    heuristic: heuristic(tiles),
    steps: 0,
    previous: null
  };
  const queue = new TinyQueue([initial], compare);
  let searchNode = initial;

  while (!isGoal(searchNode.tiles)) {
    searchNode = queue.pop();
    const neighborList = neighbors(
      searchNode.tiles,
      searchNode.blankRow,
      searchNode.blankCol
    );
    for (let i = 0; i < neighborList.length; i++) {
      const nextNeighbor = neighborList[i];

      // Optimization: Don't go back to the previous board, that's silly
      if (
        searchNode.previous !== null &&
        deepEqual(nextNeighbor.tiles, searchNode.previous.tiles)
      ) {
        continue;
      }

      queue.push({
        tiles: nextNeighbor.tiles,
        blankRow: nextNeighbor.blankRow,
        blankCol: nextNeighbor.blankCol,
        heuristic: heuristic(nextNeighbor.tiles),
        steps: searchNode.steps + 1,
        previous: searchNode
      });
    }
  }

  // Reached the goal, now retrace steps
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
