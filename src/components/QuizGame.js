// QuizGame.js
import React, { useState } from 'react';

function QuizGame({ words = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const currentWord = words[currentIndex];

  const getOptions = () => {
    const options = [currentWord.meaning];
    while (options.length < 4) {
      const random = words[Math.floor(Math.random() * words.length)].meaning;
      if (!options.includes(random)) options.push(random);
    }
    return options.sort(() => Math.random() - 0.5);
  };

  const [options, setOptions] = useState(getOptions());

  const handleSelect = (option) => {
    setSelected(option);
    if (option === currentWord.meaning) {
      setScore(score + 1);
    }
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < words.length) {
        setCurrentIndex(nextIndex);
        setOptions(getOptions());
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  if (showResult) {
    return (
      <div className="text-center text-pastel-navy">
        <h2 className="text-2xl font-bold mb-4">Kết quả</h2>
        <p className="text-lg">Bạn đã trả lời đúng {score}/{words.length} câu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xl font-bold text-pastel-navy">
        Từ: {currentWord.word}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(option)}
            className={`p-4 rounded-xl shadow text-white font-semibold transition-all duration-300
              ${selected
                ? option === currentWord.meaning
                  ? 'bg-green-500'
                  : option === selected
                    ? 'bg-red-500'
                    : 'bg-gray-400'
                : 'bg-blue-500 hover:bg-blue-600'}`}
            disabled={selected !== null}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuizGame;
