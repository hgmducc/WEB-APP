import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';

export default function ListeningQuiz({ words, onBack }) {
  const [shuffledWords, setShuffledWords] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [optionsMap, setOptionsMap] = useState({});
  const [showVietnamese, setShowVietnamese] = useState(false);

  useEffect(() => {
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const generatedOptions = {};

    shuffled.forEach((w) => {
      const options = shuffled
        .filter(x => x.word !== w.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      const fullOptions = [...options, w].sort(() => 0.5 - Math.random());
      generatedOptions[w.word] = fullOptions;
    });

    setShuffledWords(shuffled);
    setOptionsMap(generatedOptions);
  }, [words]);

  const handleChange = (word, answer) => {
    setAnswers({ ...answers, [word]: answer });
  };

  const handleSubmit = () => {
    let total = 0;
    shuffledWords.forEach(w => {
      if (answers[w.word] === w.word) {
        total++;
      }
    });
    setScore(total);
    setSubmitted(true);
  };

  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    speechSynthesis.speak(utter);
  };

  const calcScore10 = (rawScore, total) => {
    if (total === 0) return 0;
    return Math.round((rawScore / total) * 10);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-800">Bài kiểm tra Nghe (Listening)</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Hiển thị:</span>
          <button
            onClick={() => setShowVietnamese(!showVietnamese)}
            className={`relative w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 transition-colors duration-300 ${showVietnamese ? 'bg-green-400' : 'bg-gray-300'}`}
          >
            <span
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${showVietnamese ? 'translate-x-6' : 'translate-x-0'}`}
            ></span>
          </button>
        </div>
      </div>

      {submitted && (
        <div className="text-green-700 font-semibold text-center mb-6">
          🎉 Bạn đã làm đúng {score}/{shuffledWords.length} câu <br />
          📊 Điểm của bạn: <strong>{calcScore10(score, shuffledWords.length)}/10</strong>
        </div>
      )}

      {shuffledWords.map((w, i) => {
        const fullOptions = optionsMap[w.word] || [];
        const selected = answers[w.word];
        const isCorrect = selected === w.word;
        const showFeedback = submitted;

        return (
          <div key={i} className="mb-6 p-4 border rounded shadow bg-white">
            <p className="font-semibold mb-2 flex items-center gap-3">
              {i + 1}. Bấm để nghe đoạn phát âm này:
              <button
                onClick={() => speak(w.word)}
                className="text-blue-600 hover:text-blue-800 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 transition w-14 h-14 sm:w-10 sm:h-10"
                style={{ minWidth: '2.5rem', minHeight: '2.5rem', fontSize: '2rem', lineHeight: 1 }}
                aria-label="Nghe phát âm"
              >
                <Volume2 className="w-8 h-8 sm:w-6 sm:h-6" />
              </button>
            </p>

            {fullOptions.map((opt, j) => (
              <label
                key={j}
                className={`block p-2 rounded cursor-pointer border mb-1
                  ${submitted
                    ? opt.word === w.word
                      ? 'bg-green-100 border-green-500'
                      : opt.word === selected
                      ? 'bg-red-100 border-red-500'
                      : 'border-gray-300'
                    : 'hover:bg-gray-50 border-gray-200'}
                `}
              >
                <input
                  type="radio"
                  name={`q-${i}`}
                  value={opt.word}
                  disabled={submitted}
                  checked={selected === opt.word}
                  onChange={() => handleChange(w.word, opt.word)}
                  className="mr-2"
                />
                {showVietnamese ? opt.meaning : opt.word}
              </label>
            ))}

            {showFeedback && (
              <div className={`mt-2 p-2 text-sm rounded ${isCorrect ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                {isCorrect ? (
                  <>
                    ✅ <strong>{w.word}</strong> <span className="text-gray-500">--{w.ipa || w.pronunciation}</span>
                  </>
                ) : (
                  <>
                    ❌ Bạn đã chọn sai. <br />
                    ✔️ Đáp án đúng: <strong>{w.word}</strong> <span className="text-gray-500">--{w.ipa || w.pronunciation}</span>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button
          onClick={() => {
            handleSubmit();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Nộp bài
        </button>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => {
              setSubmitted(false);
              setAnswers({});
              setScore(0);
              const shuffled = [...words].sort(() => 0.5 - Math.random());
              const generatedOptions = {};
              shuffled.forEach((w) => {
                const options = shuffled
                  .filter(x => x.word !== w.word)
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 3);
                const fullOptions = [...options, w].sort(() => 0.5 - Math.random());
                generatedOptions[w.word] = fullOptions;
              });
              setShuffledWords(shuffled);
              setOptionsMap(generatedOptions);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
          >
            Làm lại
          </button>
          <button
            onClick={() => {
              onBack();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
          >
            Quay lại
          </button>
        </div>
      )}
    </div>
  );
}
