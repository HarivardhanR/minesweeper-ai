import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import BoardUI from "./UI/BoardUI";
import Board from "./GameLogic/Board";
import Confetti from "./Animations/Confetti";
import BombDrop from "./Animations/BombDrop";
import { randomSearchAI } from "./AIutils/randomSearchAI";
// import { neatAI } from "./AIutils/neatAI";
import "./App.css";

const App = () => {
  const [boards, setBoards] = useState([]);
  const [algorithmClicked, setAlgorithmClicked] = useState(null);
  const [isAlgorithmPlaying, setIsAlgorithmPlaying] = useState(false);
  const [intervalDelay, setIntervalDelay] = useState(1000);
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [mines, setMines] = useState(10);
  const rafRef = useRef(null);
  const timeoutRef = useRef(null);

  const initializeBoards = useCallback((rows, cols, mines, count) => {
    const initialBoards = Array.from(
      { length: count },
      () => new Board(rows, cols, mines)
    );
    setBoards(initialBoards);
  }, []);

  useEffect(() => {
    initializeBoards(rows, cols, mines, 1);
  }, [initializeBoards, rows, cols, mines]);

  const handleAlgorithmClicked = useCallback((algorithm) => {
    setAlgorithmClicked(algorithm);
  }, []);

  const handleNewGame = useCallback(() => {
    initializeBoards(rows, cols, mines, 1);
  }, [initializeBoards, rows, cols, mines]);

  const handleAutoPlayClick = useCallback(() => {
    setIsAlgorithmPlaying((prevState) => !prevState);
  }, []);

  const handleNextMoveClick = useCallback(() => {
    if (
      boards.length > 0 &&
      !boards[0].gameOver &&
      !boards[0].gameWon &&
      !isAlgorithmPlaying &&
      algorithmClicked
    ) {
      let move;
      if (algorithmClicked === "Random Search") {
        move = randomSearchAI(boards[0].board, boards[0].revealed);
      }
      // Add other algorithms here...
      if (move) {
        boards[0].handleCellClick(move.row, move.col);
        setBoards([...boards]);
      }
    }
  }, [boards, isAlgorithmPlaying, algorithmClicked]);

  const handleIntervalChange = useCallback((e) => {
    setIntervalDelay(Number(e.target.value));
  }, []);

  const handleRowsChange = useCallback(
    (e) => {
      const newRows = Number(e.target.value);
      const maxMines = Math.floor(newRows * cols * 0.4);
      if (mines > maxMines) {
        setMines(maxMines);
      }
      setRows(newRows);
    },
    [cols, mines]
  );

  const handleColsChange = useCallback(
    (e) => {
      const newCols = Number(e.target.value);
      const maxMines = Math.floor(rows * newCols * 0.4);
      if (mines > maxMines) {
        setMines(maxMines);
      }
      setCols(newCols);
    },
    [rows, mines]
  );

  useEffect(() => {
    const gameLoop = () => {
      if (boards && boards.length > 0) {
        if (
          isAlgorithmPlaying &&
          algorithmClicked &&
          boards.length > 0 &&
          !boards[0].gameOver &&
          !boards[0].gameWon
        ) {
          let move;
          if (algorithmClicked === "Random Search") {
            move = randomSearchAI(boards[0].board, boards[0].revealed);
          }
          // Add other algorithms here...
          if (move) {
            boards[0].handleCellClick(move.row, move.col);
            setBoards([...boards]);
          }
        }

        let updatedBoards = Object.assign([], boards);
        setBoards(updatedBoards);
      }
    };

    timeoutRef.current = setTimeout(
      () => {
        rafRef.current = requestAnimationFrame(gameLoop);
      },
      isAlgorithmPlaying ? intervalDelay : 0
    );

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [isAlgorithmPlaying, algorithmClicked, intervalDelay, boards]);

  const maxMines = useMemo(() => Math.floor(rows * cols * 0.4), [rows, cols]);

  return (
    <div className="App">
      {boards.length > 0 && boards[0].gameWon ? <Confetti /> : null}
      {boards.length > 0 && boards[0].gameOver ? (
        <BombDrop numBombs={mines} />
      ) : null}
      <div className="main-header">
        <h1>Minesweeper</h1>
      </div>
      <div className="algorithm-buttons">
        <table>
          <tbody>
            <tr>
              <td>
                <button onClick={() => handleAlgorithmClicked("Random Search")}>
                  Random Search
                </button>
              </td>
              <td>
                <button
                  onClick={() => handleAlgorithmClicked("NeuroEvolutionU")}
                >
                  Neuro Evolution(untrained)
                </button>
              </td>
              <td>
                <button
                  onClick={() => handleAlgorithmClicked("NeuroEvolutionT")}
                >
                  Neuro Evolution(trained)
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="algorithm-controls">
        <table>
          <tbody>
            <tr>
              <td>
                <button onClick={handleNewGame}>New Game</button>
              </td>
              <td>
                <button
                  onClick={handleAutoPlayClick}
                  disabled={algorithmClicked === null}
                >
                  {isAlgorithmPlaying ? "Stop AI" : "Auto Play"}
                </button>
              </td>
              <td>
                <button
                  onClick={handleNextMoveClick}
                  disabled={algorithmClicked == null || isAlgorithmPlaying}
                >
                  Next Move
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="algorithm-controls-sliders">
          <table>
            <tbody>
              <tr>
                <td>
                  <label>Rows: {rows}</label>
                  <br />
                  <input
                    type="range"
                    min={5}
                    max={20}
                    value={rows}
                    onChange={handleRowsChange}
                  />
                </td>
                <td>
                  <label>Columns: {cols}</label>
                  <br />
                  <input
                    type="range"
                    min={5}
                    max={20}
                    value={cols}
                    onChange={handleColsChange}
                  />
                </td>
                <td>
                  <label>Mines: {mines}</label>
                  <br />
                  <input
                    type="range"
                    min={5}
                    max={maxMines}
                    value={mines}
                    onChange={(e) => setMines(Number(e.target.value))}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="main-body">
        <div className="algorithm-info">
          {algorithmClicked && <p>Algorithm: {algorithmClicked}</p>}
        </div>
        <div className="minesweeper-board">
          {boards.length > 0 && (
            <BoardUI
              boardObj={boards[0]}
              isAlgorithmPlaying={isAlgorithmPlaying}
            />
          )}
        </div>
        <div className="algorithm-moves-info">
          {algorithmClicked && (
            <p>
              AI Move Delay: {intervalDelay} ms
              <br />
              <input
                type="range"
                min={0}
                max={5000}
                step={100}
                value={intervalDelay}
                onChange={handleIntervalChange}
              />
            </p>
          )}
          {boards.length > 0 && (
            <div className="moves-played">
              <h3>Moves Played</h3>
              {boards[0].movesPlayed.map((move, index) => (
                <div key={index}>{`(${move.row}, ${move.col})`}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      {boards.length > 0 && boards[0].gameOver && (
        <div className="game-status">Game Over</div>
      )}
      {boards.length > 0 && boards[0].gameWon && (
        <div className="game-status">You Won!</div>
      )}
    </div>
  );
};

export default App;
