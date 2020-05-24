import React from 'react';
import styles from './Board.module.scss';
import backgroundImage from './images/bg.jpg';

function generateBoard(dimension) {
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

export default function Board({ dimension }) {
  let [board, setBoard] = React.useState(generateBoard(dimension));
  let [blankRow, setBlankRow] = React.useState(dimension - 1);
  let [blankCol, setBlankCol] = React.useState(dimension - 1);

  const swapTiles = React.useCallback(
    (row1, col1, row2, col2) => {
      const temp = board[row1][col1];
      board[row1][col1] = board[row2][col2];
      board[row2][col2] = temp;
      setBoard(board); // TODO: does this trigger a re-render?
    },
    [board]
  );

  const onClick = React.useCallback(
    (row, col) => {
      if (row - 1 === blankRow && col === blankCol) {
        swapTiles(row, col, row - 1, col);
      } else if (row + 1 === blankRow && col === blankCol) {
        swapTiles(row, col, row + 1, col);
      } else if (row === blankRow && col - 1 === blankCol) {
        swapTiles(row, col, row, col - 1);
      } else if (row === blankRow && col + 1 === blankCol) {
        swapTiles(row, col, row, col + 1);
      } else {
        // Not adjacent to blank space, do nothing
        return;
      }
      setBlankRow(row);
      setBlankCol(col);
    },
    [swapTiles, blankRow, blankCol]
  );

  const backgroundSize = 100 * dimension;

  return (
    <div>
      {board.map((rowValues, row) => (
        <div key={row}>
          {rowValues.map((tile, col) => {
            // Where this tile would be if it were in the winning position
            const targetRow = Math.floor((tile - 1) / dimension);
            const targetCol = (tile - 1) % dimension;

            // Use winning position to calculate background
            const backgroundPositionX = Math.ceil(-100 * targetCol);
            const backgroundPositionY = Math.ceil(-100 * targetRow);

            return (
              <div
                className={styles.tile}
                key={col}
                onClick={() => onClick(row, col)}
                style={
                  tile !== 0
                    ? {
                        backgroundImage: `url("${backgroundImage}")`,
                        backgroundSize: `${backgroundSize}%`,
                        backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`
                      }
                    : undefined
                }>
                {tile}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
