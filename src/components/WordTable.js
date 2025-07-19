// WordTable.js - Giao diện responsive tốt hơn trên điện thoại, giữ nguyên logic, ẩn IPA trên mobile, vẫn hiện trên máy tính
import React, { useEffect, useState } from 'react';
import { FaVolumeUp } from 'react-icons/fa';

export default function WordTable() {
  const [words, setWords] = useState([]);
  const [groupFilter, setGroupFilter] = useState('');
  const [showReviewOnly, setShowReviewOnly] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        'https://docs.google.com/spreadsheets/d/1Ojx3jW6dJfzQyEDP0M3Of9I8KnxVNxsus7PQLL8VP8I/gviz/tq?tqx=out:json&sheet=Từ%20vựng&time=' + new Date().getTime()
      );
      const text = await res.text();
      const json = JSON.parse(text.substr(47).slice(0, -2));

      const rows = json.table.rows.map(row => {
        const c = row.c;
        return {
          word: c[0]?.v || '',
          meaning: c[1]?.v || '',
          example: c[3]?.v || '',
          ipa: c[4]?.v || '',
          synonym: c[5]?.v || '',
          antonym: c[6]?.v || '',
          phrase: c[8]?.v || '',
          group: c[14]?.v || '',
          stage: c[9]?.v || ''
        };
      });

      setWords(rows);
    };

    fetchData();
  }, []);

  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    speechSynthesis.speak(utter);
  };

  const filteredWords = words.filter(w => {
    const matchStage = showReviewOnly ? w.stage.includes('Cần ôn') : true;
    const matchGroup = groupFilter ? w.group === groupFilter : true;
    return matchStage && matchGroup;
  });

  const uniqueGroups = [...new Set(
    words
      .filter(w => !showReviewOnly || w.stage.includes('Cần ôn'))
      .map(w => w.group)
      .filter(Boolean)
  )];

  return (
    <div className="p-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-center text-pastel-navy">
        Từ vựng cần ôn <span className="inline-block ml-1">📚</span>
      </h2>

      <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showReviewOnly}
            onChange={() => setShowReviewOnly(!showReviewOnly)}
          />
          Chỉ hiện từ cần ôn
        </label>

        <select
          className="border rounded p-2"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option value="">Tất cả nhóm từ</option>
          {uniqueGroups.map((g, i) => (
            <option key={i} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto shadow rounded-xl">
        <table className="w-full table-auto border-collapse rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-gradient-to-r from-yellow-100 to-yellow-300 text-sm md:text-base text-gray-800 font-semibold">
            <tr>
              <th className="border p-3 text-center">Từ vựng</th>
              <th className="border p-3 text-center">Nghĩa</th>
              <th className="border p-3 text-center">Nghe</th>
              <th className="border p-3 hidden lg:table-cell text-center">Ví dụ</th>
              <th className="border p-3 hidden lg:table-cell text-center">Đồng nghĩa</th>
              <th className="border p-3 hidden xl:table-cell text-center">Trái nghĩa</th>
              <th className="border p-3 hidden xl:table-cell text-center">Cụm từ</th>
              <th className="border p-3 hidden xl:table-cell text-center">Nhóm từ</th>
            </tr>
          </thead>
          <tbody className="text-sm md:text-base">
            {filteredWords.map((w, i) => (
              <tr key={i} className="even:bg-blue-50 hover:bg-blue-100 transition duration-200">
                <td className="border p-2 font-semibold text-pastel-navy text-center">{w.word}</td>
                <td className="border p-2 text-center">{w.meaning}</td>
                <td className="border p-2 text-center">
                  <div className="flex justify-center items-center space-x-2">
                    <span className="hidden md:inline">{w.ipa}</span>
                    {w.word && (
                      <button
                        onClick={() => speak(w.word)}
                        className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-transform duration-150"
                        title="Phát âm"
                      >
                        <FaVolumeUp />
                      </button>
                    )}
                  </div>
                </td>
                <td className="border p-2 hidden lg:table-cell text-left">{w.example}</td>
                <td className="border p-2 hidden lg:table-cell text-left">{w.synonym}</td>
                <td className="border p-2 hidden xl:table-cell text-left">{w.antonym}</td>
                <td className="border p-2 hidden xl:table-cell text-left">{w.phrase}</td>
                <td className="border p-2 hidden xl:table-cell text-left">{w.group}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// Note: Ensure you have the necessary CSS classes defined for styling, such as pastel-navy, bg-gradient-to-r, etc.
// This code assumes you have a CSS framework like Tailwind CSS for styling.