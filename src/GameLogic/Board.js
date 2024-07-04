import Brain from "../NeuralNetwork/Brain";

class Board {
  constructor(rows, cols, mines) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.board = [];
    this.revealed = [];
    this.flagged = [];
    this.gameOver = false;
    this.gameWon = false;
    this.movesPlayed = [];
    this.fitness = 0;

    this.initializeBoard();
    this.brain = new Brain(this.rows, this.cols, this.mines);
    // this.prepareInputs();
    // this.getPredictions();
  }

  initializeBoard = () => {
    this.board = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(0));
    let minePositions = new Set();

    while (minePositions.size < this.mines) {
      minePositions.add(Math.floor(Math.random() * this.rows * this.cols));
    }

    minePositions.forEach((pos) => {
      let row = Math.floor(pos / this.cols);
      let col = pos % this.cols;
      this.board[row][col] = "M";

      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (
            r >= 0 &&
            r < this.rows &&
            c >= 0 &&
            c < this.cols &&
            this.board[r][c] !== "M"
          ) {
            this.board[r][c]++;
          }
        }
      }
    });

    this.revealed = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(false));
    this.flagged = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(false));
    this.gameOver = false;
    this.gameWon = false;
  };

  revealCell = (row, col) => {
    let newRevealed = this.revealed.slice();
    newRevealed[row][col] = true;
    this.revealed = newRevealed;

    if (typeof this.board[row][col] === "number") {
      this.fitness += this.board[row][col];
    }

    if (this.board[row][col] === 0) {
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (
            r >= 0 &&
            r < this.board.length &&
            c >= 0 &&
            c < this.board[0].length &&
            !newRevealed[r][c]
          ) {
            this.revealCell(r, c);
          }
        }
      }
    }
  };

  revealAllMines = () => {
    let newRevealed = this.revealed.slice();
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c] === "M") {
          newRevealed[r][c] = true;
        }
      }
    }
    this.revealed = newRevealed;
  };

  checkForWin = () => {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c] !== "M" && !this.revealed[r][c]) {
          return false;
        }
      }
    }
    return true;
  };

  handleCellClick = (row, col) => {
    // console.log(row, col, "left click");
    if (
      this.gameOver ||
      this.gameWon ||
      this.revealed[row][col] ||
      this.flagged[row][col]
    )
      return;

    this.movesPlayed.push({ row, col });
    if (this.board[row][col] === "M") {
      this.gameOver = true;
      this.revealAllMines();
      return;
    }
    this.revealCell(row, col);

    if (this.checkForWin()) {
      this.gameWon = true;
    }
  };

  handleRightClick = (e, row, col) => {
    e.preventDefault();
    // console.log(row, col, "right click");
    if (this.gameOver || this.gameWon || this.revealed[row][col]) return;
    let newFlagged = this.flagged.slice();
    newFlagged[row][col] = !newFlagged[row][col];
    this.flagged = newFlagged;

    if (this.checkForWin()) {
      this.gameWon = true;
    }
  };
}

export default Board;
