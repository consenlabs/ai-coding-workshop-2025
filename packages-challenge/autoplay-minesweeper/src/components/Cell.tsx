import React from 'react';
import { Flag, Bomb } from 'lucide-react';
import { CellState } from '../types';

interface CellProps {
  cell: CellState;
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
}

export const Cell: React.FC<CellProps> = ({ cell, onClick, onRightClick }) => {
  const getCellContent = () => {
    if (cell.isFlagged) return <Flag className="w-4 h-4 text-red-500" />;
    if (!cell.isRevealed) return null;
    if (cell.isMine) return <Bomb className="w-4 h-4 text-black" />;
    if (cell.neighborMines > 0) return cell.neighborMines;
    return null;
  };

  const getBackgroundColor = () => {
    if (!cell.isRevealed) return 'bg-gray-300 hover:bg-gray-400';
    return 'bg-gray-100';
  };

  const getTextColor = () => {
    const colors = {
      1: 'text-blue-600',
      2: 'text-green-600',
      3: 'text-red-600',
      4: 'text-purple-600',
      5: 'text-yellow-600',
      6: 'text-cyan-600',
      7: 'text-gray-600',
      8: 'text-pink-600',
    };
    return colors[cell.neighborMines as keyof typeof colors] || '';
  };

  return (
    <button
      className={`w-10 h-10 border border-gray-400 flex items-center justify-center 
        font-bold ${getBackgroundColor()} ${getTextColor()}`}
      onClick={onClick}
      onContextMenu={onRightClick}
    >
      {getCellContent()}
    </button>
  );
};
