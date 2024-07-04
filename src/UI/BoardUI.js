import React from "react";
import { FaBomb } from "react-icons/fa";
import { BsFlagFill } from "react-icons/bs";
import "./Cell.css";
import "./Board.css";

const BoardUI = ({ boardObj, isAlgorithmPlaying }) => {
  const { board, revealed, flagged, handleCellClick, handleRightClick } =
    boardObj;

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={`cell ${
                revealed[rowIndex][colIndex] ? "revealed" : ""
              } ${flagged[rowIndex][colIndex] ? "flagged" : ""}`}
              onClick={
                !isAlgorithmPlaying
                  ? () => handleCellClick(rowIndex, colIndex)
                  : null
              }
              onContextMenu={
                !isAlgorithmPlaying
                  ? (e) => handleRightClick(e, rowIndex, colIndex)
                  : null
              }
            >
              {revealed[rowIndex][colIndex] ? (
                cell === "M" ? (
                  <FaBomb />
                ) : (
                  cell
                )
              ) : flagged[rowIndex][colIndex] ? (
                <BsFlagFill />
              ) : null}
            </div>
          ))}
        </div>
      ))}

      {boardObj.gameOver && <div className="game-status">Game Over</div>}
      {boardObj.gameWon && <div className="game-status">You Won!</div>}
    </div>
  );
};

export default BoardUI;
