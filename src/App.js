import React from 'react';
import BackgroundPicker from './BackgroundPicker';
import Board from './Board';
import Button from './Button';
import styles from './App.module.scss';
import DefaultBackground from './images/bg.jpg'; // TODO: Remove

function App() {
  const [dimension, setDimension] = React.useState(3);
  const [showNumbers, setShowNumbers] = React.useState(true);
  const [background, setBackground] = React.useState({
    url: DefaultBackground
  });

  return (
    <div className={styles.app}>
      <div className={styles.controls}>
        <Button
          className={styles.control}
          onClick={() => setDimension(3)}
          disabled={dimension === 3}>
          8
        </Button>
        <Button
          className={styles.control}
          onClick={() => setDimension(4)}
          disabled={dimension === 4}>
          15
        </Button>
        <Button
          className={styles.control}
          onClick={() => setDimension(5)}
          disabled={dimension === 5}>
          24
        </Button>

        <Button
          className={styles.numbersControl}
          onClick={() => setShowNumbers(!showNumbers)}>
          123
        </Button>
      </div>
      <Board
        background={background}
        dimension={dimension}
        showNumbers={showNumbers}
      />
      <BackgroundPicker setBackground={setBackground} />
    </div>
  );
}

export default App;
