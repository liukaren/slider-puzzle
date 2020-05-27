import cn from 'classnames';
import React from 'react';
import styles from './Board.module.scss';
import backgroundImage from './images/bg.jpg';
import { swapTiles, generateSolved, generateRandom } from './BoardUtil';

const ANIMATION_MS = 500;
const AUDIO_DELAY_MS = 300;

export default function Board({ dimension }) {
  let [board, setBoard] = React.useState(generateSolved(dimension));
  let [blankRow, setBlankRow] = React.useState(dimension - 1);
  let [blankCol, setBlankCol] = React.useState(dimension - 1);

  let [animation, setAnimation] = React.useState(null);
  let [animatingTileRow, setAnimatingTileRow] = React.useState(null);
  let [animatingTileCol, setAnimatingTileCol] = React.useState(null);

  const sound = React.useMemo(() => {
    return document.getElementById('sound-tile');
  }, []);

  const moveTile = React.useCallback(
    (row, col, animation) => {
      // Play animation
      setAnimatingTileRow(row);
      setAnimatingTileCol(col);
      setAnimation(animation);

      // Play sound (after small delay)
      setTimeout(() => {
        sound.currentTime = 0;
        sound.play();
      }, AUDIO_DELAY_MS);

      setTimeout(() => {
        // Stop animation
        setAnimatingTileRow(null);
        setAnimatingTileCol(null);
        setAnimation(null);

        // Update state
        swapTiles(board, row, col, blankRow, blankCol);
        setBoard(board); // TODO: does this trigger a re-render?
        setBlankRow(row);
        setBlankCol(col);
      }, ANIMATION_MS);
    },
    [board, blankRow, blankCol, sound]
  );

  const onClickTile = React.useCallback(
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

  const onClickShuffle = React.useCallback(() => {
    const randomBoard = generateRandom(dimension);
    setBoard(randomBoard);
    for (let row = 0; row < dimension; row++) {
      for (let col = 0; col < dimension; col++) {
        if (randomBoard[row][col] === 0) {
          setBlankRow(row);
          setBlankCol(col);
          return;
        }
      }
    }
  }, [dimension]);

  const backgroundSize = 100 * dimension;

  return (
    <div className={styles.wrapper}>
      <div>
        {board.map((rowValues, row) => (
          <div className={styles.row} key={row}>
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
                  onClick={() => onClickTile(row, col)}
                  style={
                    tile !== 0
                      ? {
                          backgroundImage: `url("${backgroundImage}")`,
                          backgroundSize: `${backgroundSize}%`,
                          backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`
                        }
                      : undefined
                  }>
                  {tile !== 0 && <div className={styles.number}>{tile}</div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className={styles.controls}>
        <button
          className={styles.control}
          onClick={onClickShuffle}
          type="button">
          Shuffle
        </button>
      </div>
    </div>
  );
}
