import React, { useState, useEffect } from 'react';

export default function ReadingQuiz({ words, onBack }) {
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [optionsMap, setOptionsMap] = useState({});

  // Xáo trộn từ và tạo lựa chọn ngẫu nhiên
  useEffect(() => {
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const allMeanings = words.map(w => w.meaning).filter(Boolean);
    const opts = {};
    shuffled.forEach(w => {
      const others = allMeanings.filter(m => m !== w.meaning);
      const randomWrong = others.sort(() => 0.5 - Math.random()).slice(0, 3);
      opts[w.word] = [w.meaning, ...randomWrong].sort(() => 0.5 - Math.random());
    });
    setShuffledWords(shuffled);
    setOptionsMap(opts);
  }, [words]);

  const handleChange = (word, answer) => {
    setAnswers({ ...answers, [word]: answer });
  };

  const handleSubmit = async () => {
    let total = 0;
    shuffledWords.forEach(w => {
      if (answers[w.word] === w.meaning) total++;
    });

    setScore(total);
    setSubmitted(true);

    const finalScore = calcScore10(total, shuffledWords.length);
    const payload = {
      type: 'reading',
      score: finalScore,
      answers,
      timestamp: new Date().toISOString(),
    };

    try {
      await fetch('https://script.google.com/macros/s/AKfycbwFYOq6KHukwE_rr-NNFWthfX00SpvQiGOA4heENPnjC_ixU3ZW8ugFmSBcfgB9AH0PzQ/exec', {
        method: 'POST',
       // mode: 'cors', // Google Script không cho phản hồi
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Gửi kết quả thất bại:', error);
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setAnswers({});
    setScore(0);
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const allMeanings = words.map(w => w.meaning).filter(Boolean);
    const opts = {};
    shuffled.forEach(w => {
      const others = allMeanings.filter(m => m !== w.meaning);
      const randomWrong = others.sort(() => 0.5 - Math.random()).slice(0, 3);
      opts[w.word] = [w.meaning, ...randomWrong].sort(() => 0.5 - Math.random());
    });
    setShuffledWords(shuffled);
    setOptionsMap(opts);
  };

  const calcScore10 = (rawScore, total) => {
    if (total === 0) return 0;
    return Math.round((rawScore / total) * 10);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-6 text-blue-800">
        Bài kiểm tra từ vựng (Reading)
      </h2>

      {submitted && (
        <div className="text-green-700 font-semibold text-center mb-6">
          🎉 Bạn đã làm đúng {score}/{shuffledWords.length} câu<br />
          <span className="text-lg">
            Điểm: <span className="font-bold">{calcScore10(score, shuffledWords.length)}/10</span>
          </span>
        </div>
      )}

      {shuffledWords.map((w, i) => {
        const options = optionsMap[w.word] || [];
        const selected = answers[w.word];
        const isCorrect = selected === w.meaning;

        return (
          <div key={i} className="mb-6 p-4 border rounded shadow bg-white">
            <p className="font-semibold mb-2">
              {i + 1}. Từ <strong>'{w.word}'</strong> có nghĩa là gì?
            </p>

            {options.map((opt, j) => (
              <label
                key={j}
                className={`block p-2 rounded cursor-pointer border mb-1
                  ${submitted
                    ? opt === w.meaning
                      ? 'bg-green-100 border-green-500'
                      : opt === selected
                      ? 'bg-red-100 border-red-500'
                      : 'border-gray-300'
                    : 'hover:bg-gray-50 border-gray-200'
                  }`}
              >
                <input
                  type="radio"
                  name={`q-${i}`}
                  value={opt}
                  disabled={submitted}
                  checked={selected === opt}
                  onChange={() => handleChange(w.word, opt)}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}

            {submitted && (
              <div
                className={`mt-2 p-2 text-sm rounded ${
                  isCorrect ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                }`}
              >
                {isCorrect ? (
                  <>
                    ✅ <strong>{w.word}</strong> - <em>{w.meaning}</em><br />
                    🔔 Ví dụ: {w.example || 'Không có ví dụ'}
                  </>
                ) : (
                  <>
                    ❌ Bạn đã chọn sai. <br />
                    ✔️ Đáp án đúng: <strong>{w.meaning}</strong><br />
                    🔔 Ví dụ: {w.example || 'Không có ví dụ'}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Nộp bài
        </button>
      ) : (
        <div className="flex justify-center gap-4">
          <button
            onClick={handleRetry}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded"
          >
            Làm lại
          </button>
          <button
            onClick={onBack}
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
          >
            Quay lại
          </button>
        </div>
      )}
    </div>
  );
}
