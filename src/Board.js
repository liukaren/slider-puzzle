import cn from 'classnames';
import React from 'react';
import BackgroundPicker from './BackgroundPicker';
import Button from './Button';
import GF from './Giphy';
import { useViewport } from './util';
import { ReactComponent as QuestionIcon } from './images/question.svg';
import { ReactComponent as GithubIcon } from './images/github.svg';
import { ReactComponent as HintOnIcon } from './images/lightbulb-fill.svg';
import { ReactComponent as HintOffIcon } from './images/lightbulb-outline.svg';
import { ReactComponent as SizeUpIcon } from './images/expand.svg';
import { ReactComponent as SizeDownIcon } from './images/collapse.svg';
import { ReactComponent as SoundOnIcon } from './images/volume-up.svg';
import { ReactComponent as SoundOffIcon } from './images/volume-mute.svg';
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
const MAX_TILE_PX = 100;
const GUTTER_MD_PX = 16;

const MIN_DIMENSION = 3;
const MAX_DIMENSION = 5;
const DEFAULT_DIMENSION = 4;

export default function Board() {
  const [dimension, setDimension] = React.useState(DEFAULT_DIMENSION);
  const [showNumbers, setShowNumbers] = React.useState(true);

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

  // Refs ensure animation callbacks always read latest state
  // https://reactjs.org/docs/hooks-faq.html#why-am-i-seeing-stale-props-or-state-inside-my-function

  const [isSolving, setSolving] = React.useState(false); // For proper text on button
  const isSolvingRef = React.useRef(isSolving); // For whether or not to actually run solution

  const [enableSound, setEnableSound] = React.useState(true);
  const enableSoundRef = React.useRef(enableSound);

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

  // Select a random background from Giphy on load
  React.useEffect(() => {
    GF.random({ tag: 'cute animal' }).then(result => {
      setBackground(result.data.images.downsized);
    });
  }, []);

  const [background, setBackground] = React.useState(null);

  const sound = React.useMemo(() => {
    return document.getElementById('sound-tile');
  }, []);

  const moveTile = React.useCallback(
    (row, col, animation) => {
      // Play animation
      setAnimation({ animation, row, col });

      // Play sound (after small delay)
      if (enableSoundRef.current) {
        setTimeout(() => {
          sound.currentTime = 0;
          sound.play();
        }, AUDIO_DELAY_MS);
      }

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
    [boardRef, sound, enableSoundRef]
  );

  const onClickTile = React.useCallback(
    (row, col) => {
      // Ignore clicks while an animation or a solution is playing
      if (animation.animation || isSolving) return Promise.resolve();

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
    [isSolving, moveTile, animation, boardRef]
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

  const onClickStop = React.useCallback(() => {
    setSolving(false);
    isSolvingRef.current = false;
  }, []);

  const onClickSolve = React.useCallback(() => {
    const solution = solve(board.tiles, board.blankRow, board.blankCol);

    setSolving(true);
    isSolvingRef.current = true;
    // Chain all steps of the solution into serial promises
    solution
      .reduce(
        (promise, nextStep) =>
          promise.then(() => {
            if (isSolvingRef.current)
              return onClickTile(nextStep.blankRow, nextStep.blankCol);
          }),
        Promise.resolve()
      )
      .then(() => {
        setSolving(false);
        isSolvingRef.current = false;
      });
  }, [isSolvingRef, onClickTile, board]);

  // Fit to smaller dimension ("cover" background style)
  const backgroundWidth = React.useMemo(() => {
    if (!background || background.width < background.height) {
      return 100 * dimension;
    } else {
      return 100 * (background.width / background.height) * dimension;
    }
  }, [background, dimension]);
  const backgroundHeight = React.useMemo(() => {
    if (!background || background.height < background.width) {
      return 100 * dimension;
    } else {
      return 100 * (background.height / background.width) * dimension;
    }
  }, [background, dimension]);

  const windowWidth = useViewport().width;
  const tileSize = React.useMemo(() => {
    return Math.min(MAX_TILE_PX, (windowWidth - GUTTER_MD_PX * 2) / 5);
  }, [windowWidth]);

  // Offsets to center non-square backgrounds
  const horizontalOffset = React.useMemo(() => {
    if (!background || background.height > background.width) return 0;
    const excessRatio = background.width / background.height - 1;
    const excessRatioLeft = excessRatio / 2;
    const excessPixelsLeft = excessRatioLeft * dimension * tileSize;
    return excessPixelsLeft;
  }, [background, dimension, tileSize]);
  const verticalOffset = React.useMemo(() => {
    if (!background || background.width > background.height) return 0;
    const excessRatio = background.height / background.width - 1;
    const excessRatioTop = excessRatio / 2;
    const excessPixelsTop = excessRatioTop * dimension * tileSize;
    return excessPixelsTop;
  }, [background, dimension, tileSize]);

  return (
    <>
      <h1 className={styles.title}>15-puzzle solver</h1>
      <div className={styles.wrapper}>
        <div className={styles.board}>
          {board.tiles.map((rowValues, row) => (
            <div className={styles.row} key={row}>
              {rowValues.map((tile, col) => {
                const goal = getGoalPosition(tile, dimension);

                // Use goal position to calculate background
                const backgroundPositionX = Math.ceil(
                  goal.col * -tileSize - horizontalOffset
                );
                const backgroundPositionY = Math.ceil(
                  goal.row * -tileSize - verticalOffset
                );

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
                            width: tileSize,
                            height: tileSize,
                            backgroundImage:
                              background && `url("${background.url}")`,
                            backgroundSize: `${backgroundWidth}% ${backgroundHeight}%`,
                            backgroundPosition: `${backgroundPositionX}px ${backgroundPositionY}px`
                          }
                        : {
                            width: tileSize,
                            height: tileSize
                          }
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
          <div>
            <Button
              className={cn(styles.control, styles.main)}
              disabled={isSolving}
              onClick={onClickShuffle}
              type="button">
              Shuffle
            </Button>
            <Button
              className={cn(styles.control, styles.main, {
                [styles.warning]: isSolving
              })}
              onClick={isSolving ? onClickStop : onClickSolve}
              type="button">
              {isSolving ? 'Stop' : 'Solve'}
            </Button>
          </div>
          <div className={styles.controlHeader}>Choose background</div>
          <div>
            <BackgroundPicker
              buttonClassName={styles.control}
              setBackground={setBackground}
            />
          </div>
          <div className={styles.controlHeader}>Settings</div>
          <div>
            <Button
              className={cn(styles.control, styles.setting)}
              disabled={isSolving}
              onClick={() => {
                if (dimension >= MAX_DIMENSION) setDimension(MIN_DIMENSION);
                else setDimension(dimension + 1);
              }}>
              {dimension >= MAX_DIMENSION ? (
                <SizeDownIcon alt="Toggle size" />
              ) : (
                <SizeUpIcon alt="Toggle size" />
              )}
            </Button>
            <Button
              className={cn(styles.control, styles.setting, {
                [styles.warning]: !showNumbers
              })}
              onClick={() => setShowNumbers(!showNumbers)}>
              {showNumbers ? (
                <HintOnIcon alt="Toggle labels" />
              ) : (
                <HintOffIcon alt="Toggle labels" />
              )}
            </Button>
            <Button
              className={cn(styles.control, styles.setting, {
                [styles.warning]: !enableSound
              })}
              onClick={() => {
                enableSoundRef.current = !enableSound;
                setEnableSound(!enableSound);
              }}>
              {enableSound ? (
                <SoundOnIcon alt="Toggle sound" />
              ) : (
                <SoundOffIcon alt="Toggle sound" />
              )}
            </Button>
          </div>
          <div className={styles.footer}>
            <a href="https://github.com/liukaren/slider-puzzle#15-puzzle-solver">
              <GithubIcon />
              Github
            </a>
            <a href="http://liukaren.github.io">
              <QuestionIcon />
              Karen
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
