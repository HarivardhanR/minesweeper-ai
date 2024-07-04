import tf from "../tensorflow-init";

class Brain {
  constructor(rows, cols, mines) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.model = this.initializeNeuralNetwork();
    this.previousMoves = new Set();
  }

  initializeNeuralNetwork = () => {
    return tf.tidy(() => {
      console.log(tf.getBackend());
      const model = tf.sequential();
      model.add(
        tf.layers.dense({
          inputShape: [this.rows * this.cols + 1],
          units: 128,
          activation: "relu",
        })
      );
      model.add(tf.layers.dense({ units: 128, activation: "relu" }));
      model.add(
        tf.layers.dense({ units: this.rows * this.cols, activation: "softmax" })
      );
      return model;
    });
  };

  dispose = () => {
    this.model.dispose();
  };
  prepareInputs = (board, revealed) => {
    let inputs = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!revealed[r][c]) {
          inputs.push(-1); // unrevealed cell
        } else {
          if (board[r][c] === "M") {
            inputs.push(9); // revealed mine
          } else {
            inputs.push(board[r][c]); // revealed non-mine
          }
        }
      }
    }
    inputs.push(this.mines); // add total mines as an additional input
    return inputs;
  };

  getPredictions = (board, revealed) => {
    return tf.tidy(() => {
      let inputs = this.prepareInputs(board, revealed);

      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs);

      let output = ys.dataSync().slice();

      // Ensure the move is an unrevealed cell
      let index, row, col;
      do {
        index = output.indexOf(Math.max(...output));
        row = Math.floor(index / this.cols);
        col = index % this.cols;
        output[index] = -Infinity; // Mark this move as checked
      } while (revealed[row][col] && Math.max(...output) !== -Infinity);

      return { row, col };
    });
  };
}

export default Brain;
