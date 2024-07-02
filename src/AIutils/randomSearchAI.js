// Function to perform random search
export const randomSearchAI = (board, revealed) => {
  const rows = board.length;
  const cols = board[0].length;

  while (true) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);

    if (!revealed[row][col]) {
      return { row, col };
    }
  }
};
