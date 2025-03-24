import { useState } from "react";

const Board = ({ squares, onClick }) => {
    return (
        <div className="grid grid-cols-3 gap-1 w-48">
            {squares.map((square, i) => (
                <button
                    key={i}
                    className="w-16 h-16 flex items-center justify-center text-xl font-bold border bg-gray-200 hover:bg-gray-300"
                    onClick={() => onClick(i)}
                >
                    {square}
                </button>
            ))}
        </div>
    );
};

export default function CaroGame() {
    const [squares, setSquares] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);

    const handleClick = (i) => {
        if (squares[i] || calculateWinner(squares)) return;
        const newSquares = squares.slice();
        newSquares[i] = xIsNext ? "X" : "O";
        setSquares(newSquares);
        setXIsNext(!xIsNext);
    };

    const winner = calculateWinner(squares);
    const status = winner ? `Winner: ${winner}` : `Next player: ${xIsNext ? "X" : "O"}`;

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <h1 className="text-2xl font-bold">Caro Game</h1>
            <Board squares={squares} onClick={handleClick} />
            <p className="text-lg font-semibold">{status}</p>
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => setSquares(Array(9).fill(null))}
            >
                Reset Game
            </button>
        </div>
    );
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (let [a, b, c] of lines) {
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}
