import React from 'react';
import { Cell } from './Cell';
import { CellState } from '../types';

interface BoardProps {
  board: CellState[][];
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number) => void;
}

export const Board: React.FC<BoardProps> = ({ board, onCellClick, onCellRightClick }) => {
  return (
    <div className="grid grid-cols-9 gap-0 bg-gray-200 p-2 rounded-lg shadow-lg">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            onClick={() => onCellClick(rowIndex, colIndex)}
            onRightClick={(e) => {
              e.preventDefault();
              onCellRightClick(rowIndex, colIndex);
            }}
          />
        ))
      )}
    </div>
  );
};
