import React from 'react';
import Board from './Board';
import styles from './App.module.scss';

export default function App() {
  return (
    <div className={styles.app}>
      <Board />
      <div id="modal-root"></div>
    </div>
  );
}
