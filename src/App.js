import React from 'react';
import Board from './Board.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Board dimension={3} />
      </header>
    </div>
  );
}

export default App;
