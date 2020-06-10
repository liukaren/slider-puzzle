import cn from 'classnames';
import React from 'react';
import Button from './Button';
import styles from './Board.module.scss';
import {
  swapTiles,
  generateSolved,
  generateRandom,
  getGoalPosition,
  solve
} from './BoardUtil';

const ANIMATION_MS = 250;
const AUDIO_DELAY_MS = ANIMATION_MS / 2;

export default function Board({ dimension, showNumbers, background }) {
  let [board, setBoard] = React.useState({
    tiles: generateSolved(dimension),
    blankRow: dimension - 1,
    blankCol: dimension - 1
  });

  let [animation, setAnimation] = React.useState({
    animation: null,
    row: null,
    col: null
  });

  // Ensure animation callbacks always read latest state
  // https://reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function
  const boardRef = React.useRef(board);
  boardRef.current = board;

  // Re-generate board when dimension changes
  React.useEffect(() => {
    // TODO: Ask to confirm if modifying from non-goal board
    setBoard({
      tiles: generateSolved(dimension),
      blankRow: dimension - 1,
      blankCol: dimension - 1
    });
  }, [dimension]);

  const sound = React.useMemo(() => {
    return document.getElementById('sound-tile');
  }, []);

  const moveTile = React.useCallback(
    (row, col, animation) => {
      // Play animation
      setAnimation({ animation, row, col });

      // Play sound (after small delay)
      setTimeout(() => {
        sound.currentTime = 0;
        sound.play();
      }, AUDIO_DELAY_MS);

      return new Promise(resolve => {
        setTimeout(() => {
          // Stop animation
          setAnimation({ animation: null, row: null, col: null });

          // Update state
          swapTiles(
            boardRef.current.tiles,
            row,
            col,
            boardRef.current.blankRow,
            boardRef.current.blankCol
          );
          setBoard({
            tiles: boardRef.current.tiles,
            blankRow: row,
            blankCol: col
          });

          resolve();
        }, ANIMATION_MS);
      });
    },
    [boardRef, sound]
  );

  const onClickTile = React.useCallback(
    (row, col) => {
      if (animation.animation) return Promise.resolve(); // Ignore clicks during animation

      const { blankRow, blankCol } = boardRef.current;
      if (row - 1 === blankRow && col === blankCol) {
        return moveTile(row, col, styles.slideUp);
      } else if (row + 1 === blankRow && col === blankCol) {
        return moveTile(row, col, styles.slideDown);
      } else if (row === blankRow && col - 1 === blankCol) {
        return moveTile(row, col, styles.slideLeft);
      } else if (row === blankRow && col + 1 === blankCol) {
        return moveTile(row, col, styles.slideRight);
      }

      // Not adjacent to blank space, do nothing
      return Promise.resolve();
    },
    [moveTile, animation, boardRef]
  );

  const onClickShuffle = React.useCallback(() => {
    const randomBoard = generateRandom(dimension);
    for (let row = 0; row < dimension; row++) {
      for (let col = 0; col < dimension; col++) {
        if (randomBoard[row][col] === 0) {
          setBoard({
            tiles: randomBoard,
            blankRow: row,
            blankCol: col
          });
          return;
        }
      }
    }
  }, [dimension]);

  const onClickSolve = React.useCallback(() => {
    const solution = solve(board.tiles, board.blankRow, board.blankCol);

    // Chain all steps of the solution into serial promises
    solution.reduce(
      (promise, nextStep) =>
        promise.then(() => onClickTile(nextStep.blankRow, nextStep.blankCol)),
      Promise.resolve()
    );
  }, [onClickTile, board]);

  // Fit to smaller dimension ("cover" background style)
  // (If we don't know dimensions, stretch in both dimensions)
  const backgroundWidth = React.useMemo(() => {
    if (
      !background.width ||
      !background.height ||
      background.width < background.height
    ) {
      return 100 * dimension;
    } else {
      return 100 * (background.width / background.height) * dimension;
    }
  }, [background, dimension]);
  const backgroundHeight = React.useMemo(() => {
    if (
      !background.width ||
      !background.height ||
      background.height < background.width
    ) {
      return 100 * dimension;
    } else {
      return 100 * (background.height / background.width) * dimension;
    }
  }, [background, dimension]);

  return (
    <div className={styles.wrapper}>
      <div>
        {board.tiles.map((rowValues, row) => (
          <div className={styles.row} key={row}>
            {rowValues.map((tile, col) => {
              const goal = getGoalPosition(tile, dimension);

              // Use goal position to calculate background
              // TODO: offset to center non-square backgrounds
              const backgroundPositionX = Math.ceil(-100 * goal.col);
              const backgroundPositionY = Math.ceil(-100 * goal.row);

              return (
                <div
                  className={cn([
                    styles.tile,
                    {
                      [styles.nonEmpty]: tile !== 0,
                      [animation.animation]:
                        animation.row === row && animation.col === col
                    }
                  ])}
                  key={col}
                  onClick={() => onClickTile(row, col)}
                  style={
                    tile !== 0
                      ? {
                          backgroundImage: `url("${background.url}")`,
                          backgroundSize: `${backgroundWidth}% ${backgroundHeight}%`,
                          backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`
                        }
                      : undefined
                  }>
                  {tile !== 0 && showNumbers && (
                    <div className={styles.number}>{tile}</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className={styles.controls}>
        <Button
          className={styles.control}
          onClick={onClickShuffle}
          type="button">
          Shuffle
        </Button>
        <Button className={styles.control} onClick={onClickSolve} type="button">
          Solve
        </Button>
      </div>
    </div>
  );
}
