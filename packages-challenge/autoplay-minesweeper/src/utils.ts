import { CellState } from './types';

export const createBoard = (rows: number, cols: number, mines: number): CellState[][] => {
  // Initialize empty board
  const board: CellState[][] = Array(rows).fill(null).map(() =>
    Array(cols).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0,
    }))
  );

  // Place mines randomly
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    if (!board[row][col].isMine) {
      board[row][col].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbor mines
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!board[row][col].isMine) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (
              newRow >= 0 && newRow < rows &&
              newCol >= 0 && newCol < cols &&
              board[newRow][newCol].isMine
            ) {
              count++;
            }
          }
        }
        board[row][col].neighborMines = count;
      }
    }
  }

  return board;
};

export const revealCell = (
  board: CellState[][],
  row: number,
  col: number
): CellState[][] => {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  
  if (
    row < 0 || row >= board.length ||
    col < 0 || col >= board[0].length ||
    newBoard[row][col].isRevealed ||
    newBoard[row][col].isFlagged
  ) {
    return newBoard;
  }

  newBoard[row][col].isRevealed = true;

  if (newBoard[row][col].neighborMines === 0 && !newBoard[row][col].isMine) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        revealCell(newBoard, row + i, col + j);
      }
    }
  }

  return newBoard;
};

export const checkWin = (board: CellState[][]): boolean => {
  return board.every(row =>
    row.every(cell =>
      (cell.isMine && !cell.isRevealed) || (!cell.isMine && cell.isRevealed)
    )
  );
};