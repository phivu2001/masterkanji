"use client";

import { useMemo, useState } from 'react';
import type { JLPTLevel } from '@/data/jlptCore';
import type { VocabularyInfo } from '@/data/vocabulary';
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech';
import { commitRomajiInput, convertRomajiInput, normalizeJapaneseAnswer } from '@/lib/japaneseInput';
import type { StudySettings } from '@/lib/study';
import { withoutRomaji } from '@/lib/study';

type Props = {
  pool: VocabularyInfo[];
  level: JLPTLevel;
  title: string;
  settings: StudySettings;
  onExit: () => void;
  onComplete: (result: { score: number; total: number; wrongIds: string[] }) => void;
};

type AnswerRecord = { wordId: string; correct: boolean };

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const acceptedAnswers = (item: VocabularyInfo) => [item.reading, item.word]
  .flatMap((answer) => answer.split(/[／/]/))
  .map(normalizeJapaneseAnswer);

export function VocabularyTypingScreen({ pool, level, title, settings, onExit, onComplete }: Props) {
  const questions = useMemo(() => shuffle(pool).slice(0, Math.min(10, pool.length)), [pool]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);
  const current = questions[index];
  const speakJapanese = useJapaneseSpeech(settings.speechRate);

  if (!current) return <div className="min-h-screen flex items-center justify-center">Không có dữ liệu để luyện gõ.</div>;

  const checkAnswer = () => {
    if (result !== 'idle' || !value.trim()) return;
    setValue(commitRomajiInput(value));
    const correct = acceptedAnswers(current).includes(normalizeJapaneseAnswer(value));
    setResult(correct ? 'correct' : 'incorrect');
    setAnswers((items) => [...items, { wordId: current.id, correct }]);
  };

  const next = () => {
    if (result === 'idle') return;
    if (index >= questions.length - 1) {
      const score = answers.filter((answer) => answer.correct).length;
      const wrongIds = [...new Set(answers.filter((answer) => !answer.correct).map((answer) => answer.wordId))];
      onComplete({ score, total: questions.length, wrongIds });
      setFinished(true);
      return;
    }
    setIndex((currentIndex) => currentIndex + 1);
    setValue('');
    setResult('idle');
  };

  if (finished) {
    const score = answers.filter((answer) => answer.correct).length;
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 flex items-center justify-center">
        <section className="w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center text-2xl"><i className="fas fa-keyboard"></i></div>
          <h1 className="text-3xl font-black">Hoàn thành luyện gõ</h1>
          <div className="text-6xl font-black text-blue-500 my-5">{score}/{questions.length}</div>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Các từ gõ sai đã được đưa vào lịch ôn.</p>
          <button onClick={onExit} className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black">Trở về Vocabulary</button>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-7">
          <button onClick={onExit} aria-label="Thoát luyện gõ" className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><i className="fas fa-xmark"></i></button>
          <div className="text-center"><div className="font-black">{title}</div><div className="text-xs text-slate-400">{level} • Câu {index + 1}/{questions.length}</div></div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center"><i className="fas fa-keyboard"></i></div>
        </header>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-6"><div className="h-full bg-blue-500" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-7 sm:p-10 shadow-sm">
          <div className="text-xs uppercase tracking-widest font-black text-blue-500 mb-3">Gõ cách đọc bằng Kana</div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3">{current.meaning}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Không nhìn đáp án. Hãy tự trích xuất cách đọc từ trí nhớ.</p>
          <form onSubmit={(event) => { event.preventDefault(); if (result === 'idle') checkAnswer(); else next(); }}>
            <input autoFocus value={value} disabled={result !== 'idle'} onChange={(event) => setValue(convertRomajiInput(event.target.value))} autoComplete="off" spellCheck={false} lang="ja" inputMode="text" placeholder="Gõ tabemasu → たべます" className="w-full rounded-2xl border-2 border-blue-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-5 py-4 text-2xl font-japanese outline-none focus:border-blue-500 disabled:opacity-80" />
            {result === 'correct' && <div className="mt-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 font-bold"><i className="fas fa-circle-check mr-2"></i>Chính xác: <span className="font-japanese text-xl">{current.word}・{withoutRomaji(current.reading, settings.hideRomaji)}</span></div>}
            {result === 'incorrect' && <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4"><b><i className="fas fa-circle-xmark mr-2"></i>Chưa đúng.</b> Đáp án: <span className="font-japanese text-xl font-black">{current.word}・{withoutRomaji(current.reading, settings.hideRomaji)}</span></div>}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button type="button" onClick={() => speakJapanese(current.word)} className="px-5 py-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 font-bold"><i className="fas fa-volume-high mr-2"></i>Nghe từ</button>
              <button className="flex-1 px-5 py-3 rounded-xl bg-blue-500 text-white font-black">{result === 'idle' ? 'Kiểm tra' : index === questions.length - 1 ? 'Xem kết quả' : 'Từ tiếp theo'}<i className="fas fa-arrow-right ml-2"></i></button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
