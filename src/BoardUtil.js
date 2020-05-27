export function swapTiles(board, row1, col1, row2, col2) {
  const temp = board[row1][col1];
  board[row1][col1] = board[row2][col2];
  board[row2][col2] = temp;
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
  return board;
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
  const dim = board.length;
  for (let row = 0; row < dim; row++) {
    for (let col = 0; col < dim; col++) {
      let tile = board[row][col];
      if (row === dim - 1 && col === dim - 1) {
        if (tile !== 0) return false;
      } else if (tile !== row * dim + col + 1) return false;
    }
  }
  return true;
}

// Returns the "manhattan" or "taxicab" distance of this board from the goal board
export function manhattan(board) {
  let dim = board.length;
  let distance = 0;
  for (let row = 0; row < dim; row++) {
    for (let col = 0; col < dim; col++) {
      let tile = board[row][col];
      if (tile === 0) continue;
      let goalRow = Math.floor((tile - 1) / dim);
      let goalCol = (tile - 1) % dim;
      distance += Math.abs(goalRow - row) + Math.abs(goalCol - col);
    }
  }
  return distance;
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
  swapTiles(board, blankRow, blankCol, neighborRow, neighborCol);
  const neighbor = JSON.parse(JSON.stringify(board));
  swapTiles(board, blankRow, blankCol, neighborRow, neighborCol); // Swap back
  return neighbor;
}

// Boards reachable in one step. For convenience, pass in the position of the blank tile
export function neighbors(board, blankRow, blankCol) {
  let neighbors = [];

  if (blankRow > 0) {
    neighbors.push(
      createNeighbor(board, blankRow, blankCol, blankRow - 1, blankCol)
    );
  }
  if (blankCol > 0) {
    neighbors.push(
      createNeighbor(board, blankRow, blankCol, blankRow, blankCol - 1)
    );
  }
  if (blankRow < board.length - 1) {
    neighbors.push(
      createNeighbor(board, blankRow, blankCol, blankRow + 1, blankCol)
    );
  }
  if (blankCol < board.length - 1) {
    neighbors.push(
      createNeighbor(board, blankRow, blankCol, blankRow, blankCol + 1)
    );
  }

  return neighbors;
}

export function generateRandom(dimension) {
  return shuffleBoard(generateSolved(dimension));
}
