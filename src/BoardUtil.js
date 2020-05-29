import TinyQueue from 'tinyqueue';

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

export function getGoalPosition(tile, dimension) {
  return {
    row: Math.floor((tile - 1) / dimension),
    col: (tile - 1) % dimension
  };
}

// Returns the "manhattan" or "taxicab" distance of this board from the goal board
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
  return n1.manhattan + n1.steps - (n2.manhattan + n2.steps);
}

export function solve(board, blankRow, blankCol) {
  const initial = {
    board,
    blankRow,
    blankCol,
    manhattan: manhattan(board),
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
        manhattan: manhattan(nextNeighbor.board),
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
      board: searchNode.board,
      blankRow: searchNode.blankRow,
      blankCol: searchNode.blankCol
    });
    searchNode = searchNode.previous;
  }

  solution.reverse();
  solution.shift(); // Remove initial board
  return solution;
}
