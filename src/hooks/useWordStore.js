import { useEffect, useState } from 'react';
import { db, storage } from '../firebase';
import {
  collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, getDocs, serverTimestamp
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL
} from 'firebase/storage';

// Spaced repetition intervals (in days) for each level (mở rộng)
const LEVELS = ['new', 'weak', 'medium', 'strong', 'master', 'legend'];
const LEVEL_INTERVALS = {
  new: 0,        // học ngay hôm nay
  weak: 1,       // ôn lại sau 1 ngày
  medium: 3,     // ôn lại sau 3 ngày
  strong: 7,     // ôn lại sau 7 ngày
  master: 14,    // ôn lại sau 14 ngày
  legend: 30     // ôn lại sau 30 ngày
};

export function useWordStore() {
  const [words, setWords] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'words'), snapshot => {
      const firebaseWords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWords(firebaseWords);
    });
    return () => unsub();
  }, []);

  const wordExists = (word, meaning) =>
    words.some(w => w.word.toLowerCase() === word.toLowerCase() && w.meaning === meaning);

  const addWord = async (newWord) => {
    if (!newWord.word.trim() || !newWord.meaning.trim()) {
      alert('Vui lòng nhập đầy đủ');
      return null;
    }

    if (wordExists(newWord.word, newWord.meaning)) {
      alert('Từ đã tồn tại trong danh sách!');
      return null;
    }

    // Chuẩn hóa model dữ liệu khi thêm mới
    const docRef = await addDoc(collection(db, 'words'), {
      ...newWord,
      level: 'new',
      favorite: false,
      synonyms: newWord.synonyms || [],
      examples: newWord.examples || [],
      note: newWord.note || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastReviewedAt: serverTimestamp(),
      correctCount: 0,
      wrongCount: 0
    });

    return { id: docRef.id, word: newWord.word };
  };

  // --- Spaced Repetition Core ---
  // Lấy danh sách từ cần học/ôn hôm nay
  const getWordsForToday = () => {
    const today = new Date();
    return words.filter(word => {
      // Nếu là từ mới (level new), học ngay hôm nay
      if (word.level === 'new') return true;
      // Nếu đã có lastReviewedAt, kiểm tra đã đến hạn ôn chưa
      if (word.lastReviewedAt && LEVEL_INTERVALS[word.level] !== undefined) {
        const last = word.lastReviewedAt.toDate ? word.lastReviewedAt.toDate() : new Date(word.lastReviewedAt);
        const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
        return diffDays >= LEVEL_INTERVALS[word.level];
      }
      return false;
    });
  };

  // Ghi nhận kết quả ôn tập, tăng/giảm level, cập nhật ngày ôn, số lần đúng/sai
  const updateWordReviewResult = async (id, isCorrect) => {
    const word = words.find(w => w.id === id);
    if (!word) return;

    let newLevel = word.level;
    const currentIdx = LEVELS.indexOf(word.level);

    if (isCorrect) {
      // Tăng level nếu chưa phải max
      if (currentIdx < LEVELS.length - 1) {
        newLevel = LEVELS[currentIdx + 1];
      }
    } else {
      // Giảm level nếu chưa phải min
      if (currentIdx > 0) {
        newLevel = LEVELS[currentIdx - 1];
      }
    }

    await updateDoc(doc(db, 'words', id), {
      level: newLevel,
      lastReviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      correctCount: (word.correctCount || 0) + (isCorrect ? 1 : 0),
      wrongCount: (word.wrongCount || 0) + (!isCorrect ? 1 : 0)
    });
  };

  // ✅ Hàm duy nhất: Lấy IPA + audioUrl (fallback VoiceRSS nếu cần)
  const getIPAAndAudio = async (word) => {
    let ipa = '';
    let audioUrl = '';

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await res.json();
      const phonetics = data[0]?.phonetics || [];

      ipa = phonetics.find(p => p.text)?.text || '';
      audioUrl = phonetics.find(p => p.audio)?.audio || '';
    } catch (err) {
      console.warn('⚠️ Lỗi dictionaryapi.dev:', err);
    }

    if (!audioUrl) {
      const voicerssKey = process.env.REACT_APP_VOICERSS_KEY;
      audioUrl = `https://api.voicerss.org/?key=${voicerssKey}&hl=en-us&src=${encodeURIComponent(word)}&c=MP3`;
    }

    return { ipa, audioUrl };
  };

  // ✅ Chỉ lấy IPA/audioUrl → hiển thị hoặc preview
  const fetchIPAAndAudioOnly = async (word) => {
    return await getIPAAndAudio(word);
  };

  // ✅ Lấy IPA + audio và lưu lên Firebase Storage + Firestore
  const fetchAndUpdateIPAAndAudio = async (id, word) => {
    try {
      const { ipa, audioUrl } = await getIPAAndAudio(word);

      let audioBlob;
      try {
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) throw new Error('Tải audio lỗi');
        audioBlob = await audioResponse.blob();
      } catch (err) {
        console.error('❌ Lỗi khi tải audio:', err);
        return;
      }

      const audioRef = ref(storage, `audio/${id}.mp3`);
      await uploadBytes(audioRef, audioBlob);
      const finalAudioUrl = await getDownloadURL(audioRef);

      await updateDoc(doc(db, 'words', id), {
        ipa,
        audioUrl: finalAudioUrl,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Lỗi khi lấy hoặc lưu IPA/audio:', error);
    }
  };

  const fixMissingAudio = async () => {
    const snapshot = await getDocs(collection(db, 'words'));
    const wordList = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

    for (const word of wordList) {
      if (!word.audioUrl || word.audioUrl === '') {
        console.log(`🔁 Fixing audio: ${word.word}`);
        await fetchAndUpdateIPAAndAudio(word.id, word.word);
      }
    }

    console.log('✅ Xong đồng bộ các từ thiếu phát âm.');
  };

  const toggleFavorite = async (id) => {
    const word = words.find(w => w.id === id);
    if (!word) return;
    await updateDoc(doc(db, 'words', id), { favorite: !word.favorite });
  };

  const deleteWord = async (id) => {
    await deleteDoc(doc(db, 'words', id));
  };

  const updateIPA = async (id, newIPA) => {
    await updateDoc(doc(db, 'words', id), {
      ipa: newIPA,
      updatedAt: serverTimestamp()
    });
  };

  return {
    words,
    addWord,
    toggleFavorite,
    deleteWord,
    updateIPA,
    fetchIPAAndAudioOnly,
    fetchAndUpdateIPAAndAudio,
    wordExists,
    fixMissingAudio,
    // Spaced repetition API
    getWordsForToday,
    updateWordReviewResult
  };
}