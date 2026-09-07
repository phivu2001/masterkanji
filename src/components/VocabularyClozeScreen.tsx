"use client";

import { useMemo, useState } from 'react';
import type { JLPTLevel } from '@/data/jlptCore';
import type { VocabularyInfo } from '@/data/vocabulary';
import { getVocabularyClozeExercises } from '@/data/vocabularyPractice';

type Props = {
  pool: VocabularyInfo[];
  level: JLPTLevel;
  title: string;
  onExit: () => void;
  onComplete: (result: { score: number; total: number; wrongIds: string[] }) => void;
};

type AnswerRecord = { wordId: string; correct: boolean };

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const normalizeAnswer = (value: string) => value
  .normalize('NFKC')
  .toLocaleLowerCase('ja-JP')
  .replace(/[\s。、・]/g, '');

export function VocabularyClozeScreen({ pool, level, title, onExit, onComplete }: Props) {
  const exercises = useMemo(() => shuffle(getVocabularyClozeExercises(pool)).slice(0, 10), [pool]);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const current = exercises[index];

  if (!current) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <section className="max-w-lg bg-white dark:bg-slate-800 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-black mb-2">Chưa đủ câu Cloze trong phạm vi này</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-5">Hãy trở về và chọn toàn bộ Vocabulary N5 hoặc N4.</p>
          <button onClick={onExit} className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black">Trở về Vocabulary</button>
        </section>
      </div>
    );
  }

  const blankReading = current.reading.includes(current.item.reading)
    ? current.reading.replace(current.item.reading, '＿＿＿')
    : current.reading;

  const checkAnswer = () => {
    if (result !== 'idle' || !value.trim()) return;
    const submitted = normalizeAnswer(value);
    const accepted = [current.item.word, current.item.reading]
      .flatMap((answer) => answer.split(/[／/]/))
      .map(normalizeAnswer);
    const correct = accepted.includes(submitted);
    setResult(correct ? 'correct' : 'incorrect');
    setAnswers((items) => [...items, { wordId: current.item.id, correct }]);
  };

  const next = () => {
    if (result === 'idle') return;
    if (index >= exercises.length - 1) {
      const score = answers.filter((answer) => answer.correct).length;
      const wrongIds = [...new Set(answers.filter((answer) => !answer.correct).map((answer) => answer.wordId))];
      onComplete({ score, total: exercises.length, wrongIds });
      setFinished(true);
      return;
    }
    setIndex((currentIndex) => currentIndex + 1);
    setValue('');
    setResult('idle');
    setShowHint(false);
  };

  if (finished) {
    const score = answers.filter((answer) => answer.correct).length;
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 flex items-center justify-center">
        <section className="w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center text-2xl"><i className="fas fa-quote-right"></i></div>
          <h1 className="text-3xl font-black">Hoàn thành Cloze Test</h1>
          <div className="text-6xl font-black text-amber-500 my-5">{score}/{exercises.length}</div>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Bạn đã luyện từ trong câu giao tiếp hoàn chỉnh.</p>
          <button onClick={onExit} className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black">Trở về Vocabulary</button>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-7">
          <button onClick={onExit} aria-label="Thoát Cloze Test" className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><i className="fas fa-xmark"></i></button>
          <div className="text-center"><div className="font-black">{title}</div><div className="text-xs text-slate-400">{level} • Câu {index + 1}/{exercises.length}</div></div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center"><i className="fas fa-quote-right"></i></div>
        </header>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-6"><div className="h-full bg-amber-500" style={{ width: `${((index + 1) / exercises.length) * 100}%` }} /></div>
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-7 sm:p-10 shadow-sm">
          <div className="text-xs uppercase tracking-widest font-black text-amber-500 mb-4">Điền từ phù hợp vào ngữ cảnh</div>
          <div className="font-japanese text-3xl sm:text-5xl font-black leading-relaxed mb-4">{current.blankSentence}</div>
          <p className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">{current.meaning}</p>
          {showHint && <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-4 py-3 mb-4"><span className="block text-xs font-black uppercase mb-1">Gợi ý cách đọc</span><span className="font-japanese">{blankReading}</span></div>}
          <form onSubmit={(event) => { event.preventDefault(); if (result === 'idle') checkAnswer(); else next(); }}>
            <input autoFocus value={value} disabled={result !== 'idle'} onChange={(event) => setValue(event.target.value)} autoComplete="off" spellCheck={false} lang="ja" placeholder="Gõ từ bằng Kanji hoặc Kana..." className="w-full rounded-2xl border-2 border-amber-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-5 py-4 text-2xl font-japanese outline-none focus:border-amber-500 disabled:opacity-80" />
            {result !== 'idle' && <div className={`mt-4 rounded-xl p-4 ${result === 'correct' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
              <b><i className={`fas ${result === 'correct' ? 'fa-circle-check' : 'fa-circle-xmark'} mr-2`}></i>{result === 'correct' ? 'Chính xác!' : 'Chưa đúng.'}</b>
              <div className="font-japanese text-xl font-black mt-2">{current.sentence}</div>
              <div className="text-sm mt-2">Cụm nên nhớ: <b>{current.collocation}</b></div>
            </div>}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button type="button" disabled={result !== 'idle'} onClick={() => setShowHint(true)} className="px-5 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 disabled:opacity-40 font-bold"><i className="fas fa-lightbulb mr-2"></i>Gợi ý</button>
              <button className="flex-1 px-5 py-3 rounded-xl bg-amber-500 text-white font-black">{result === 'idle' ? 'Kiểm tra' : index === exercises.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}<i className="fas fa-arrow-right ml-2"></i></button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
