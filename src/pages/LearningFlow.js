// LearningFlow.js
import React, { useState } from 'react';
import FlashCardView from './FlashCardView';
import QuizGame from './QuizGame';
import WriteWordGame from './WriteWordGame';
import MatchingGame from './MatchingGame';

function LearningFlow({ words, onFinish }) {
  const [step, setStep] = useState(0);

  const steps = [
    { component: FlashCardView, title: 'Flashcard - Ghi nhớ từ' },
    { component: QuizGame, title: 'Trắc nghiệm - Kiểm tra hiểu' },
    { component: WriteWordGame, title: 'Viết lại từ - Ghi nhớ chủ động' },
    { component: MatchingGame, title: 'Nối từ - Củng cố nghĩa' },
  ];

  const nextStep = () => {
    if (step + 1 < steps.length) {
      setStep(step + 1);
    } else {
      if (onFinish) onFinish();
    }
  };

  const CurrentComponent = steps[step].component;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-6 text-pastel-navy">
        {steps[step].title}
      </h2>
      <div className="mb-6">
        <CurrentComponent words={words} />
      </div>
      <div className="text-center">
        <button
          onClick={nextStep}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg transition"
        >
          {step + 1 < steps.length ? 'Tiếp tục ➡️' : 'Kết thúc buổi học'}
        </button>
      </div>
    </div>
  );
}

export default LearningFlow;
