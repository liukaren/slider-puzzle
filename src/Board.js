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
import { GUTTER_MD_PX } from './util';
import styles from './Board.module.scss';
import {
  swapTiles,
  generateSolved,
  generateRandom,
  getGoalPosition,
  solve,
  isGoal
} from './BoardUtil';

const ANIMATION_MS = 250;
const MAX_TILE_PX = 100;
const MIN_DIMENSION = 3;
const MAX_DIMENSION = 4;
const DEFAULT_DIMENSION = 4;

export default function Board() {
  const [dimension, setDimension] = React.useState(DEFAULT_DIMENSION);
  const [showNumbers, setShowNumbers] = React.useState(true);
  const [background, setBackground] = React.useState(null);

  let [board, setBoard] = React.useState(generateSolved(dimension));
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
  React.useEffect(() => setBoard(generateSolved(dimension)), [dimension]);

  const isSolved = React.useMemo(() => isGoal(board.tiles), [board]);

  // Select a random background from Giphy on load
  React.useEffect(() => {
    GF.random({ tag: 'cute animal' }).then(result => {
      setBackground(result.data.images.downsized);
    });
  }, []);

  const sound = React.useMemo(() => {
    return document.getElementById('sound-tile');
  }, []);

  const moveTile = React.useCallback(
    (row, col) => {
      const { blankRow, blankCol } = boardRef.current;

      let animation;
      if (row - 1 === blankRow) animation = styles.slideUp;
      else if (row + 1 === blankRow) animation = styles.slideDown;
      else if (col - 1 === blankCol) animation = styles.slideLeft;
      else animation = styles.slideRight;

      // Play animation
      setAnimation({ animation, row, col });

      // Play sound (unless playing automated solution)
      if (enableSoundRef.current && !isSolvingRef.current) {
        sound.currentTime = 0;
        sound.play();
      }

      // After ANIMATION_MS elapsed, clean up
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
      if (animation.animation || isSolvingRef.current) return Promise.resolve();

      // Ignore clicks on tiles not next to the blank tile
      const { blankRow, blankCol } = boardRef.current;
      const isValidMove =
        (blankRow === row && Math.abs(blankCol - col) === 1) ||
        (blankCol === col && Math.abs(blankRow - row) === 1);
      if (!isValidMove) return Promise.resolve();

      return moveTile(row, col);
    },
    [animation, isSolvingRef, boardRef, moveTile]
  );

  const onClickShuffle = React.useCallback(() => {
    setBoard(generateRandom(dimension));
  }, [dimension]);

  const onClickStop = React.useCallback(() => {
    setSolving(false);
    isSolvingRef.current = false;
  }, []);

  const onClickSolve = React.useCallback(() => {
    const solution = solve(board.tiles, board.blankRow, board.blankCol);

    setSolving(true);
    isSolvingRef.current = true;

    // Chain solution steps into a series of promises executed one after the other
    solution
      .reduce(
        (promise, nextStep) =>
          promise.then(() => {
            // Run next step of solution if "isSolving" is still true.
            // Otherwise, abort subsequent steps.
            if (isSolvingRef.current)
              return moveTile(nextStep.blankRow, nextStep.blankCol);
            else return Promise.reject();
          }),
        Promise.resolve()
      )
      .catch(() => {
        /* ignore errors from Stop button */
      })
      .then(() => {
        setSolving(false);
        isSolvingRef.current = false;
      });
  }, [isSolvingRef, board, moveTile]);

  // Fit to smaller dimension ("cover" background style)
  const backgroundWidth = React.useMemo(() => {
    if (!background || background.width < background.height)
      return 100 * dimension;
    return 100 * (background.width / background.height) * dimension;
  }, [background, dimension]);
  const backgroundHeight = React.useMemo(() => {
    if (!background || background.height < background.width)
      return 100 * dimension;
    return 100 * (background.height / background.width) * dimension;
  }, [background, dimension]);

  const windowWidth = useViewport().width;
  const tileSize = React.useMemo(() => {
    // On small screens, fill the window width minus padding on either side
    return Math.min(
      MAX_TILE_PX,
      (windowWidth - GUTTER_MD_PX * 2) / MAX_DIMENSION
    );
  }, [windowWidth]);

  // Offsets to center non-square backgrounds. Turn the excess % into a pixel count
  const horizontalOffset = React.useMemo(() => {
    if (!background || background.height > background.width) return 0;
    return (
      ((background.width / background.height - 1) / 2) * dimension * tileSize
    );
  }, [background, dimension, tileSize]);
  const verticalOffset = React.useMemo(() => {
    if (!background || background.width > background.height) return 0;
    return (
      ((background.height / background.width - 1) / 2) * dimension * tileSize
    );
  }, [background, dimension, tileSize]);

  return (
    <>
      <h1 className={styles.title}>15-puzzle solver</h1>
      <div className={styles.wrapper}>
        <div className={styles.board}>
          {board.tiles.map((rowTiles, row) => (
            <div className={styles.row} key={row}>
              {rowTiles.map((tile, col) => {
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
          <div className={styles.controlMainRow}>
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
              disabled={isSolved}
              onClick={isSolving ? onClickStop : onClickSolve}
              type="button">
              {isSolving ? 'Stop' : 'Play!'}
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
          <footer className={styles.footer}>
            <a href="https://github.com/liukaren/slider-puzzle#15-puzzle-solver">
              <GithubIcon />
              Github
            </a>
            <a href="http://liukaren.github.io">
              <QuestionIcon />
              About Author
            </a>
          </footer>
        </div>
      </div>
    </>
  );
}
