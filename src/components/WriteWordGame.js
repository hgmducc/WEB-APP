// WriteWordGame.js
import React, { useState } from 'react';

function WriteWordGame({ words = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentWord = words[currentIndex];

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizedInput = input.trim().toLowerCase();
    const normalizedAnswer = currentWord.word.toLowerCase();
    const isCorrect = normalizedInput === normalizedAnswer;
    setCorrect(isCorrect);
    if (isCorrect) setScore(score + 1);
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < words.length) {
        setCurrentIndex(nextIndex);
        setInput('');
        setCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  if (showResult) {
    return (
      <div className="text-center text-pastel-navy">
        <h2 className="text-2xl font-bold mb-4">Kết quả</h2>
        <p className="text-lg">Bạn đã viết đúng {score}/{words.length} từ.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-pastel-navy">
      <div className="text-xl font-bold">
        Nghĩa: {currentWord.meaning}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-3 border rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
        placeholder="Gõ từ tiếng Anh tương ứng"
        autoFocus
      />
      {correct !== null && (
        <div className={`text-sm font-medium ${correct ? 'text-green-600' : 'text-red-500'}`}>
          {correct ? 'Chính xác!' : `Sai, đáp án: ${currentWord.word}`}
        </div>
      )}
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow transition"
        disabled={correct !== null}
      >
        Gửi
      </button>
    </form>
  );
}

export default WriteWordGame;