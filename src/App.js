import { useState } from "react";

import "@jetbrains/ring-ui/dist/style.css";
import Toggle, { Size } from "@jetbrains/ring-ui/dist/toggle/toggle";

const boardWidth = 3;
const boardHeight = 3;

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [sortMoveAsc, setSortMoveAsc] = useState(true);
  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;
  const gameDraw = currentMove === boardWidth * boardHeight;

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    const nextMove = nextHistory.length - 1;
    setHistory(nextHistory);
    setCurrentMove(nextMove);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setHistory([...history.slice(0, nextMove + 1)]);
  }

  function handleToggle(checked) {
    setSortMoveAsc(checked);
  }

  const moves = history
    .map((squares, move) => {
      const index =
        move > 0
          ? history[move].findIndex(
              (item, index) => history[move - 1][index] === null && item
            )
          : null;
      const { x, y } = getCoordinatesFromIndex(index);
      const extraDescription = x !== null ? `at cord (${x}, ${y})` : "";
      const description =
        move > 0
          ? `Go to move #${move} ${extraDescription}`
          : "Go to game start";
      return move === currentMove && move > 0 ? (
        <li key={move}>
          You are at move #{move} {extraDescription}
        </li>
      ) : (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{description}</button>
        </li>
      );
    })
    .sort((a, b) => (sortMoveAsc ? a.key - b.key : b.key - a.key));

  return (
    <div className="game">
      <div className="game-board">
        <Board
          gameDraw={gameDraw}
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
        />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
      <div className="game-info">
        <Toggle
          title="Sort"
          size={Size.Size20}
          defaultChecked={sortMoveAsc}
          onChange={(event) => handleToggle(event.target.checked)}
        >
          Sort the move list {sortMoveAsc ? "Ascending" : "Descending"}
        </Toggle>
      </div>
    </div>
  );

  function getCoordinatesFromIndex(index) {
    if (index === null || index === -1) return { x: null, y: null };
    const x = index % boardWidth;
    const y = (index - x) / boardWidth;
    return { x, y };
  }
}

function Board({ gameDraw, xIsNext, squares, onPlay }) {
  const [winnerIndexes, setWinnerIndexes] = useState(Array(3).fill(null));

  function handleClick(i) {
    if (squares[i] || winner) return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  const status = gameDraw
    ? "Game draw"
    : winner
    ? `Winner: ${winner}`
    : `Next player: ${xIsNext ? "X" : "O"}`;

  const boardRows = (columnIndex) =>
    Array(boardWidth)
      .fill(null)
      .map((square, rowIndex) => {
        const index = columnIndex * boardWidth + rowIndex;
        const highlight = winnerIndexes.includes(index);
        return (
          <Square
            key={index}
            value={squares[index]}
            highlight={highlight}
            onSquareClick={() => handleClick(index)}
          />
        );
      });

  const board = Array(boardHeight)
    .fill(null)
    .map((column, columnIndex) => (
      <div key={columnIndex} className="board-row">
        {boardRows(columnIndex)}
      </div>
    ));

  return (
    <>
      <div className="status">{status}</div>
      {board}
    </>
  );

  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        if (winnerIndexes.every((item) => item === null)) {
          setWinnerIndexes([a, b, c]);
        }
        return squares[a];
      }
    }
    if (winnerIndexes.some((item) => item)) {
      setWinnerIndexes(winnerIndexes.fill(null));
    }
    return null;
  }
}

function Square({ value, highlight, onSquareClick }) {
  return (
    <button
      className={`square ${highlight ? "highlight" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}
