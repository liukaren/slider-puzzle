import React from 'react';
import Board from './Board';
import styles from './App.module.scss';

function App() {
  return (
    <div className={styles.app}>
      <Board />
    </div>
  );
}

export default App;
