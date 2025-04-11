import React, { useState, useCallback, useEffect } from 'react';
import { Bomb, Flag, RefreshCw } from 'lucide-react';
import { Board } from './components/Board';
import { createBoard, revealCell, checkWin } from './utils';
import { GameState } from './types';

function App() {
  const [board, setBoard] = useState(() => createBoard(9, 9, 10));
  const [gameState, setGameState] = useState<GameState>('playing');
  const [flagCount, setFlagCount] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (gameState === 'playing') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing') return;

    const cell = board[row][col];
    if (cell.isFlagged) return;

    if (cell.isMine) {
      setGameState('lost');
      setBoard(board.map(row => row.map(cell => ({ ...cell, isRevealed: true }))));
      return;
    }

    const newBoard = revealCell(board, row, col);
    setBoard(newBoard);

    if (checkWin(newBoard)) {
      setGameState('won');
    }
  }, [board, gameState]);

  const handleCellRightClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing') return;

    setBoard(board => board.map((r, rIndex) =>
      r.map((cell, cIndex) =>
        rIndex === row && cIndex === col
          ? { ...cell, isFlagged: !cell.isFlagged }
          : cell
      )
    ));
    setFlagCount(count => count + (board[row][col].isFlagged ? -1 : 1));
  }, [board, gameState]);

  const resetGame = useCallback(() => {
    setBoard(createBoard(9, 9, 10));
    setGameState('playing');
    setFlagCount(0);
    setTimer(0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Minesweeper</h1>
          <p className="text-gray-600">Find all mines to win!</p>
        </div>

        <div className="flex justify-between items-center mb-4 px-4">
          <div className="flex items-center gap-2">
            <Bomb className="w-5 h-5" />
            <span className="font-mono text-lg">{10 - flagCount}</span>
          </div>
          <button
            onClick={resetGame}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Reset Game"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            <span className="font-mono text-lg">{flagCount}</span>
          </div>
        </div>

        <Board
          board={board}
          onCellClick={handleCellClick}
          onCellRightClick={handleCellRightClick}
        />

        <div className="mt-4 text-center">
          <div className="font-mono text-lg">Time: {timer}s</div>
          {gameState !== 'playing' && (
            <div className={`mt-2 text-lg font-bold ${gameState === 'won' ? 'text-green-600' : 'text-red-600'}`}>
              {gameState === 'won' ? 'Congratulations! You won!' : 'Game Over!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
