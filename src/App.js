import React from 'react';
import Board from './Board.js';
import styles from './App.module.scss';
import './App.css';

function App() {
  const [dimension, setDimension] = React.useState(3);

  return (
    <div className="App">
      <header className="App-header">
        <div className={styles.controls}>
          <button
            className={styles.control}
            onClick={() => setDimension(3)}
            disabled={dimension === 3}>
            8
          </button>
          <button
            className={styles.control}
            onClick={() => setDimension(4)}
            disabled={dimension === 4}>
            15
          </button>
          <button
            className={styles.control}
            onClick={() => setDimension(5)}
            disabled={dimension === 5}>
            24
          </button>
        </div>
        <Board dimension={dimension} />
      </header>
    </div>
  );
}

export default App;
