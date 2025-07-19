import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const LEVELS = ['new', 'weak', 'medium', 'strong', 'master', 'legend'];
const LEVEL_INTERVALS = {
  new: 0,
  weak: 1,
  medium: 3,
  strong: 7,
  master: 14,
  legend: 30
};

export async function updateReviewResult(word, isCorrect) {
  if (!word || !word.id) return;

  const currentLevel = word.level || 'new';
  const index = LEVELS.indexOf(currentLevel);
  let newLevel = currentLevel;

  if (isCorrect && index < LEVELS.length - 1) {
    newLevel = LEVELS[index + 1];
  } else if (!isCorrect && index > 0) {
    newLevel = LEVELS[index - 1];
  }

  const today = new Date();
  const nextDate = new Date();
  nextDate.setDate(today.getDate() + LEVEL_INTERVALS[newLevel]);

  await updateDoc(doc(db, 'words', word.id), {
    level: newLevel,
    lastReviewedAt: today,
    nextReviewDate: nextDate,
    correctCount: (word.correctCount || 0) + (isCorrect ? 1 : 0),
    wrongCount: (word.wrongCount || 0) + (!isCorrect ? 1 : 0),
    updatedAt: today
  });
}
