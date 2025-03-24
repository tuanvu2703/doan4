import { useState, useEffect } from "react";

const symbols = ["🍎", "🍌", "🍇", "🍉", "🍓", "🍒"];
const shuffledCards = [...symbols, ...symbols]
  .sort(() => Math.random() - 0.5)
  .map((symbol, index) => ({ id: index, symbol, flipped: false, matched: false }));

export default function MemoryGame() {
  const [cards, setCards] = useState(shuffledCards);
  const [selectedCards, setSelectedCards] = useState([]);

  useEffect(() => {
    if (selectedCards.length === 2) {
      const [first, second] = selectedCards;
      if (first.symbol === second.symbol) {
        setCards((prev) =>
          prev.map((card) =>
            card.symbol === first.symbol ? { ...card, matched: true } : card
          )
        );
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first.id || card.id === second.id
                ? { ...card, flipped: false }
                : card
            )
          );
        }, 1000);
      }
      setSelectedCards([]);
    }
  }, [selectedCards]);

  const handleCardClick = (id) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, flipped: true } : card
      )
    );
    setSelectedCards((prev) => [...prev, cards.find((card) => card.id === id)]);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Memory Card Game</h1>
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            className="w-16 h-16 text-2xl bg-gray-300 rounded flex items-center justify-center shadow"
            onClick={() => !card.flipped && !card.matched && handleCardClick(card.id)}
          >
            {card.flipped || card.matched ? card.symbol : "❓"}
          </button>
        ))}
      </div>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => setCards(shuffledCards.map(card => ({ ...card, flipped: false, matched: false })))}
      >
        Reset Game
      </button>
    </div>
  );
}
