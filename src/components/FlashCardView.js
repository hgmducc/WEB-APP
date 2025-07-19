// FlashCardView.js
import React, { useState } from 'react';
import { FaVolumeUp } from 'react-icons/fa';

function FlashCardView({ words = [] }) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const currentWord = words[current];

  const handleNext = () => {
    setFlipped(false);
    setCurrent((prev) => (prev + 1 < words.length ? prev + 1 : prev));
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  if (!currentWord) {
    return (
      <div className="text-center text-pastel-navy font-bold">
        Không có từ nào để hiển thị.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className={`w-80 h-56 cursor-pointer bg-white border-2 border-blue-400 shadow-xl rounded-xl flex items-center justify-center text-center px-4 text-xl font-bold text-pastel-navy transition-transform duration-300 ${
          flipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setFlipped(!flipped)}
      >
        {flipped ? (
          <div>
            <div className="text-lg font-semibold mb-2">Nghĩa: {currentWord.meaning}</div>
            <div className="text-sm text-gray-600 italic">
              Ví dụ: {currentWord.example || '(Chưa có ví dụ)'}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="text-2xl mb-2">{currentWord.word}</div>
            <div className="text-sm text-gray-500">{currentWord.pronunciation}</div>
            <button
              className="mt-2 text-blue-500 hover:text-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak(currentWord.word);
              }}
            >
              <FaVolumeUp size={20} />
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={current === words.length - 1}
        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow transition"
      >
        {current === words.length - 1 ? 'Hoàn tất' : 'Tiếp tục ➔'}
      </button>
    </div>
  );
}

export default FlashCardView;