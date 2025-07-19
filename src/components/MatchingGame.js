// MatchingGame.js
import React, { useState, useEffect } from 'react';

function MatchingGame({ words = [] }) {
  const [leftWords, setLeftWords] = useState([]);
  const [rightMeanings, setRightMeanings] = useState([]);
  const [matches, setMatches] = useState({});
  const [selectedWord, setSelectedWord] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const limited = shuffled.slice(0, 6); // Giới hạn 6 cặp cho dễ chơi
    setLeftWords(limited);
    setRightMeanings(limited.map(w => w.meaning).sort(() => Math.random() - 0.5));
  }, [words]);

  const handleMatch = (meaning) => {
    if (selectedWord) {
      const word = selectedWord.word;
      if (selectedWord.meaning === meaning && !matches[word]) {
        setMatches({ ...matches, [word]: meaning });
        setScore(score + 1);
        if (Object.keys(matches).length + 1 === leftWords.length) {
          setFinished(true);
        }
      }
      setSelectedWord(null);
    }
  };

  return (
    <div className="space-y-6">
      {finished ? (
        <div className="text-center text-pastel-navy">
          <h2 className="text-2xl font-bold">Hoàn thành!</h2>
          <p>Bạn đã nối đúng {score}/{leftWords.length} cặp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            {leftWords.map((w, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedWord(w)}
                className={`p-3 rounded-xl shadow cursor-pointer transition
                  ${matches[w.word] ? 'bg-green-200 cursor-not-allowed' : selectedWord?.word === w.word ? 'bg-blue-100' : 'bg-white'}`}
              >
                {w.word}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {rightMeanings.map((meaning, idx) => (
              <div
                key={idx}
                onClick={() => handleMatch(meaning)}
                className={`p-3 rounded-xl shadow cursor-pointer transition
                  ${Object.values(matches).includes(meaning) ? 'bg-green-200 cursor-not-allowed' : 'bg-white hover:bg-blue-50'}`}
              >
                {meaning}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchingGame;