"use client";

import { analyzeJapaneseAnswer } from '@/lib/japaneseInput';

type Props = {
  input: string;
  acceptedAnswers: string[];
  revealAnswer: boolean;
  onRetry: () => void;
  onReveal: () => void;
};

export function JapaneseAnswerFeedback({ input, acceptedAnswers, revealAnswer, onRetry, onReveal }: Props) {
  const analysis = analyzeJapaneseAnswer(input, acceptedAnswers);
  const wrongPositions = analysis.comparison
    .map((character, index) => (!character.correct ? index + 1 : null))
    .filter((position): position is number => position !== null);

  return (
    <div className="mt-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/15 p-4 text-red-800 dark:text-red-200">
      <div className="font-black"><i className="fas fa-circle-xmark mr-2"></i>Chưa đúng — hãy kiểm tra từng ký tự</div>
      <div className="mt-3 text-sm font-bold">Bạn đã nhập:</div>
      <div className="mt-2 flex flex-wrap gap-1 font-japanese text-xl" aria-label={`Bạn đã nhập ${analysis.submitted}`}>
        {analysis.comparison.map((character, index) => (
          <span key={`${character.input}-${index}`} className={`min-w-8 rounded-lg px-2 py-1 text-center ${character.correct ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-200 text-red-800 dark:bg-red-950/60 dark:text-red-200'}`}>
            {character.input || '□'}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs">Vị trí cần sửa: {wrongPositions.join(', ') || 'không xác định'} · ô □ là ký tự còn thiếu.</p>
      <p className="mt-3 rounded-lg bg-white/70 dark:bg-slate-900/40 px-3 py-2 text-xs">
        <i className="fas fa-circle-info mr-2"></i>Chấp nhận mặt từ Kanji, cách đọc Kana và Romaji (Romaji được tự chuyển sang Hiragana).
      </p>
      {revealAnswer && (
        <div className="mt-3 rounded-xl bg-white dark:bg-slate-900 px-3 py-3">
          <div className="text-xs uppercase tracking-wider font-black text-slate-400">Đáp án gần nhất</div>
          <div className="font-japanese text-2xl font-black text-slate-800 dark:text-slate-100">{analysis.closestAnswer}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Các đáp án được chấp nhận: {acceptedAnswers.join(' ・ ')}</div>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onRetry} className="px-4 py-2 rounded-xl bg-red-600 text-white font-black"><i className="fas fa-rotate-left mr-2"></i>Thử lại</button>
        {!revealAnswer && <button type="button" onClick={onReveal} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 font-bold">Xem đáp án</button>}
      </div>
    </div>
  );
}
