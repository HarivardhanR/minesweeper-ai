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

import algorithms from "./algorithms.json";
import { evolvePopulation } from "./AIutils/neuroEvolution";

const App = () => {
  const [boards, setBoards] = useState([]);
  const [savedBoards, setSavedBoards] = useState([]);
  const [algorithmClicked, setAlgorithmClicked] = useState("human");
  const [isAlgorithmPlaying, setIsAlgorithmPlaying] = useState(false);
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);
  const [intervalDelay, setIntervalDelay] = useState(100);
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [mines, setMines] = useState(10);
  const [population, setPopulation] = useState(1);
  const [generation, setGeneration] = useState(1);
  const [generationStats, setGenerationStats] = useState([]);
  const [enableAnimations, setEnableAnimations] = useState(true);
  const rafRef = useRef(null);
  const timeoutRef = useRef(null);

  // const disposeBoards = useCallback(() => {
  //   boards.forEach((board) => {
  //     board.brain.dispose();
  //   });
  // }, [boards]);

  const initializeBoards = useCallback((rows, cols, mines, count) => {
    // disposeBoards();
    const initialBoards = Array.from(
      { length: count },
      () => new Board(rows, cols, mines)
    );
    setBoards(initialBoards);
  }, []);

  useEffect(() => {
    initializeBoards(rows, cols, mines, population);
  }, [initializeBoards, rows, cols, mines, population]);

  const handleAlgorithmClicked = useCallback(
    (algorithm) => {
      setAlgorithmClicked(algorithm);
      if (algorithm === "human") {
        initializeBoards(rows, cols, mines, 1);
        setIsAlgorithmPlaying(false);

        setPopulation(1);
        setGeneration(1);
        setGenerationStats([]);
        setEnableAnimations(true);
      } else {
        setIsAlgorithmPlaying(true);
        setEnableAnimations(false);
        setPopulation(2);
        initializeBoards(rows, cols, mines, 2);
      }
      setIsAlgorithmRunning(false);
      setGeneration(1);
      setGenerationStats([]);
    },
    [rows, cols, mines, initializeBoards]
  );

  const handleNewGame = useCallback(() => {
    initializeBoards(rows, cols, mines, population);
    setGenerationStats([]);
  }, [initializeBoards, rows, cols, mines, population]);

  const handleAutoPlayClick = useCallback(() => {
    // setIsAlgorithmPlaying((prevState) => !prevState);
    setIsAlgorithmRunning((prevState) => !prevState);
  }, []);

  const handleNextMoveClick = useCallback(() => {
    if (
      boards.length > 0 &&
      !boards[0].gameOver &&
      !boards[0].gameWon &&
      !isAlgorithmRunning &&
      algorithmClicked
    ) {
      let move;
      if (algorithmClicked === "rs") {
        move = randomSearchAI(boards[0].board, boards[0].revealed);
      } else if (algorithmClicked === "neu") {
        move = boards[0].brain.getPredictions(
          boards[0].board,
          boards[0].revealed
        );
        console.log(move);
      }
      // Add other algorithms here...
      if (move) {
        boards[0].handleCellClick(move.row, move.col);
        setBoards([...boards]);
      }
    }
  }, [boards, isAlgorithmRunning, algorithmClicked]);

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
      if (isAlgorithmPlaying && algorithmClicked && isAlgorithmRunning) {
        if (boards && boards.length > 0) {
          let completedBoards = [];
          boards.forEach((board, index) => {
            if (!board.gameOver && !board.gameWon) {
              let move;
              if (algorithmClicked === "rs") {
                move = randomSearchAI(board.board, board.revealed);
              } else if (algorithmClicked === "neu") {
                move = board.brain.getPredictions(board.board, board.revealed);
              }
              // Add other algorithms here...
              if (move) {
                board.handleCellClick(move.row, move.col);
              }
              if (board.gameOver || board.gameWon) {
                completedBoards.push(board);
              }
            } else {
              completedBoards.push(board);
            }
          });

          // Update saved boards
          setSavedBoards((prev) => [...prev, ...completedBoards]);

          // Defer setting remaining boards to next animation frame
          requestAnimationFrame(() => {
            const remainingBoards = boards.filter(
              (board) => !board.gameOver && !board.gameWon
            );
            setBoards(remainingBoards);
          });
        } else {
          const wonBoardsCount = savedBoards.filter(
            (board) => board.gameWon
          ).length;
          setGenerationStats((prev) => [
            ...prev,
            {
              generation,
              wonBoardsCount,
              population,
            },
          ]);
          setGeneration(generation + 1);

          if (algorithmClicked === "rs") {
            const newBoards = [];
            while (newBoards.length < population) {
              const child = new Board(rows, cols, mines);
              newBoards.push(child);
            }
            setBoards(newBoards);
            for (let i = 0; i < population; i++) {
              savedBoards[i].brain.dispose();
            }
            savedBoards.length = 0;
          } else if (algorithmClicked === "neu") {
            // Generate new boards if all current boards are completed
            const newBoards = evolvePopulation(
              population,
              savedBoards,
              rows,
              cols,
              mines
            );
            // console.log(newBoards);
            setBoards(newBoards);
          }
        }
      } else {
        setBoards([...boards]);
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
  }, [
    isAlgorithmPlaying,
    isAlgorithmRunning,
    algorithmClicked,
    intervalDelay,
    boards,
    savedBoards,
    population,
    rows,
    cols,
    mines,
    generation,
  ]);

  const maxMines = useMemo(() => Math.floor(rows * cols * 0.4), [rows, cols]);

  return (
    <div className="App">
      {boards.length > 0 && boards[0].gameWon && enableAnimations ? (
        <Confetti />
      ) : null}
      {boards.length > 0 && boards[0].gameOver && enableAnimations ? (
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
                <button onClick={() => handleAlgorithmClicked("human")}>
                  Human
                </button>
              </td>
              <td>
                <button onClick={() => handleAlgorithmClicked("rs")}>
                  Random Search
                </button>
              </td>
              <td>
                <button onClick={() => handleAlgorithmClicked("neu")}>
                  Neuro Evolution(untrained)
                </button>
              </td>
              <td>
                <button onClick={() => handleAlgorithmClicked("net")}>
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
                  disabled={
                    algorithmClicked === null || algorithmClicked === "human"
                  }
                >
                  {isAlgorithmRunning ? "Pause AI" : "Auto Play"}
                </button>
              </td>
              <td>
                <button
                  onClick={handleNextMoveClick}
                  disabled={
                    algorithmClicked == null ||
                    algorithmClicked === "human" ||
                    isAlgorithmRunning
                  }
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
                <td>
                  <label>Population: {population}</label>
                  <br />
                  <input
                    disabled={algorithmClicked === "human"}
                    type="range"
                    min={2}
                    max={500}
                    value={population}
                    onChange={(e) => setPopulation(Number(e.target.value))}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="main-body">
        <div className="algorithm-info">
          {algorithmClicked && (
            <>
              {algorithms.find((algo) => algo.id === algorithmClicked) ? (
                <>
                  <div>
                    Algorithm:{" "}
                    {
                      algorithms.find((algo) => algo.id === algorithmClicked)
                        .name
                    }
                  </div>

                  <div>
                    {
                      algorithms.find((algo) => algo.id === algorithmClicked)
                        .description
                    }
                  </div>
                  <div>
                    {
                      algorithms.find((algo) => algo.id === algorithmClicked)
                        .additionalMessage
                    }
                  </div>
                </>
              ) : null}
            </>
          )}
          {generationStats.length > 0 && (
            <>
              <div className="generation-info">
                {generationStats.map((info, index) => (
                  <div
                    key={index}
                  >{`Gen ${info.generation}: ${info.wonBoardsCount}/${info.population} Won`}</div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="minesweeper-board">
          {boards.length > 0 && (
            <BoardUI
              boardObj={boards[0]}
              isAlgorithmPlaying={
                isAlgorithmPlaying || algorithmClicked !== "human"
              }
            />
          )}
        </div>
        <div className="algorithm-moves-info">
          {algorithmClicked && algorithmClicked !== "human" && (
            <p>
              AI Move Delay: {intervalDelay} ms
              <br />
              <input
                type="range"
                min={100}
                max={5000}
                step={10}
                value={intervalDelay}
                onChange={handleIntervalChange}
              />
            </p>
          )}
          {boards.length > 0 && (
            <>
              {algorithmClicked === "human" ? null : (
                <div>
                  <h3>Fitness Score: {boards[0].fitness}</h3>
                </div>
              )}

              <div className="moves-played">
                <h3>Moves Played</h3>
                {boards[0].movesPlayed.map((move, index) => (
                  <div key={index}>{`(${move.row}, ${move.col})`}</div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
