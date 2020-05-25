import cn from 'classnames';
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

const ANIMATION_MS = 500;

export default function Board({ dimension }) {
  let [board, setBoard] = React.useState(generateBoard(dimension));
  let [blankRow, setBlankRow] = React.useState(dimension - 1);
  let [blankCol, setBlankCol] = React.useState(dimension - 1);

  let [animation, setAnimation] = React.useState(null);
  let [animatingTileRow, setAnimatingTileRow] = React.useState(null);
  let [animatingTileCol, setAnimatingTileCol] = React.useState(null);

  const swapTiles = React.useCallback(
    (row1, col1, row2, col2) => {
      const temp = board[row1][col1];
      board[row1][col1] = board[row2][col2];
      board[row2][col2] = temp;
      setBoard(board); // TODO: does this trigger a re-render?
    },
    [board]
  );

  const moveTile = React.useCallback(
    (row, col, animation) => {
      setAnimatingTileRow(row);
      setAnimatingTileCol(col);
      setAnimation(animation);
      setTimeout(() => {
        setAnimatingTileRow(null);
        setAnimatingTileCol(null);
        setAnimation(null);

        swapTiles(row, col, blankRow, blankCol);
        setBlankRow(row);
        setBlankCol(col);
      }, ANIMATION_MS);
    },
    [swapTiles, blankRow, blankCol]
  );

  const onClick = React.useCallback(
    (row, col) => {
      if (animation) return; // Ignore clicks during animation

      if (row - 1 === blankRow && col === blankCol) {
        moveTile(row, col, styles.slideUp);
      } else if (row + 1 === blankRow && col === blankCol) {
        moveTile(row, col, styles.slideDown);
      } else if (row === blankRow && col - 1 === blankCol) {
        moveTile(row, col, styles.slideLeft);
      } else if (row === blankRow && col + 1 === blankCol) {
        moveTile(row, col, styles.slideRight);
      }
      // Not adjacent to blank space, do nothing
    },
    [moveTile, animation, blankCol, blankRow]
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
                className={cn([
                  styles.tile,
                  {
                    [styles.nonEmpty]: tile !== 0,
                    [animation]:
                      animation &&
                      animatingTileRow === row &&
                      animatingTileCol === col
                  }
                ])}
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
