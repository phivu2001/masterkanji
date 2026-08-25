"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KanjiInfo } from '@/data/kanji';
import type { JLPTLevel } from '@/data/jlptCore';
import { buildClozeSentence } from '@/data/kanjiLearningExtras';
import type { StudySettings } from '@/lib/study';

type QuizKind = 'meaning' | 'reading' | 'kanji' | 'vocabulary';
type QuizOption = { label: string; isCorrect: boolean };
type QuizQuestion = { kanjiData: KanjiInfo; kind: QuizKind; prompt: string; display: string; options: QuizOption[] };
type QuizAnswer = { kind: QuizKind; correct: boolean; kanjiId: string };

type Props = {
  pool: KanjiInfo[];
  level: JLPTLevel;
  mode: 'practice' | 'exam';
  settings: StudySettings;
  onExit: () => void;
  onComplete: (result: { score: number; total: number; wrongIds: string[] }) => void;
};

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const buildOptions = (correct: string, candidates: string[]): QuizOption[] => [
  { label: correct, isCorrect: true },
  ...shuffle([...new Set(candidates.filter((item) => item && item !== correct))]).slice(0, 3).map((label) => ({ label, isCorrect: false })),
].sort(() => Math.random() - 0.5);

const buildQuestions = (pool: KanjiInfo[], count: number): QuizQuestion[] => {
  const selected = shuffle(pool).slice(0, Math.min(count, pool.length));
  const kinds: QuizKind[] = ['meaning', 'reading', 'kanji', 'vocabulary'];
  return selected.map((item, index) => {
    const others = pool.filter((candidate) => candidate.id !== item.id);
    const kind = kinds[index % kinds.length];
    if (kind === 'reading') {
      return { kanjiData: item, kind, prompt: 'Từ này đọc như thế nào?', display: item.vocabularies[0].kanji, options: buildOptions(item.vocabularies[0].reading, others.map((candidate) => candidate.vocabularies[0]?.reading ?? '')) };
    }
    if (kind === 'kanji') {
      return { kanjiData: item, kind, prompt: 'Chọn Kanji đúng với nghĩa:', display: item.meaning, options: buildOptions(item.kanji, others.map((candidate) => candidate.kanji)) };
    }
    if (kind === 'vocabulary') {
      const cloze = buildClozeSentence(item.kanji, item.vocabularies[0]);
      const distractors = others.map((candidate) => buildClozeSentence(candidate.kanji, candidate.vocabularies[0]).answer);
      return { kanjiData: item, kind, prompt: 'Chọn từ thích hợp để hoàn thành câu:', display: cloze.display, options: buildOptions(cloze.answer, distractors) };
    }
    return { kanjiData: item, kind, prompt: 'Chữ này có nghĩa là gì?', display: item.kanji, options: buildOptions(item.meaning, others.map((candidate) => candidate.meaning)) };
  });
};

export function QuizScreen({ pool, level, mode, settings, onExit, onComplete }: Props) {
  const questionCount = mode === 'exam' ? settings.examQuestionCount : Math.min(10, pool.length);
  const questions = useMemo(() => buildQuestions(pool, questionCount), [pool, questionCount]);
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(mode === 'exam' ? settings.examMinutes * 60 : 0);
  const [saved, setSaved] = useState(false);
  const current = questions[index];

  const finish = useCallback((finalAnswers: QuizAnswer[]) => {
    if (finished) return;
    setFinished(true);
    const score = finalAnswers.filter((answer) => answer.correct).length;
    const wrongIds = [...new Set(finalAnswers.filter((answer) => !answer.correct).map((answer) => answer.kanjiId))];
    onComplete({ score, total: questions.length, wrongIds });
    setSaved(true);
  }, [finished, onComplete, questions.length]);

  useEffect(() => {
    if (mode !== 'exam' || finished) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(timer);
          window.setTimeout(() => finish(answers), 0);
          return 0;
        }
        return currentSeconds - 1;
      });
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [answers, finish, finished, mode]);

  if (questions.length === 0) return <div className="min-h-screen flex items-center justify-center">Không có dữ liệu Quiz.</div>;

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null || finished) return;
    setSelectedOption(optionIndex);
    const answer = { kind: current.kind, correct: current.options[optionIndex].isCorrect, kanjiId: current.kanjiData.id };
    setAnswers((items) => [...items, answer]);
  };

  const nextQuestion = () => {
    const finalAnswers = answers;
    if (index >= questions.length - 1) {
      finish(finalAnswers);
      return;
    }
    setIndex((value) => value + 1);
    setSelectedOption(null);
  };

  const score = answers.filter((answer) => answer.correct).length;
  const breakdown = (['meaning', 'reading', 'kanji', 'vocabulary'] as QuizKind[]).map((kind) => {
    const relevant = answers.filter((answer) => answer.kind === kind);
    return { kind, correct: relevant.filter((answer) => answer.correct).length, total: relevant.length };
  });
  const labels: Record<QuizKind, string> = { meaning: 'Ý nghĩa', reading: 'Cách đọc', kanji: 'Mặt chữ', vocabulary: 'Từ vựng' };
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  if (finished) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 flex items-center justify-center">
        <section className="w-full max-w-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="text-center mb-8"><div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl"><i className="fas fa-trophy"></i></div><h1 className="text-3xl font-black">Kết quả {mode === 'exam' ? 'thi thử' : 'luyện tập'}</h1><div className="text-6xl font-black text-red-500 mt-4">{score}/{questions.length}</div><p className="text-slate-500 dark:text-slate-400">{Math.round((score / questions.length) * 100)}% chính xác • {saved ? 'Đã lưu kết quả' : 'Đang lưu...'}</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">{breakdown.map((item) => <div key={item.kind} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-center"><div className="text-sm text-slate-500 dark:text-slate-400">{labels[item.kind]}</div><div className="text-xl font-black">{item.correct}/{item.total}</div></div>)}</div>
          {answers.some((answer) => !answer.correct) && <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-xl p-4 text-sm mb-6"><i className="fas fa-circle-info mr-2"></i>{new Set(answers.filter((answer) => !answer.correct).map((answer) => answer.kanjiId)).size} chữ trả lời sai đã được đưa vào lịch ôn.</div>}
          <button onClick={onExit} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold">Trở về các bài học</button>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-8"><button onClick={onExit} aria-label="Thoát Quiz" className="w-11 h-11 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700"><i className="fas fa-xmark"></i></button><div className="text-center"><div className="font-black">{mode === 'exam' ? `Thi thử ${level}` : `Quiz ${level}`}</div><div className="text-xs text-slate-400">Câu {index + 1}/{questions.length}</div></div>{mode === 'exam' ? <div className={`font-mono font-black px-3 py-2 rounded-lg ${secondsLeft < 60 ? 'bg-red-500 text-white' : 'bg-white dark:bg-slate-800'}`}>{minutes}:{seconds}</div> : <div className="w-11" />}</header>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6"><div className="h-full bg-red-500" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-7 sm:p-12 text-center shadow-sm mb-5"><h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">{current.prompt}</h2><div className={`${current.kind === 'kanji' ? 'text-3xl leading-snug' : current.kind === 'vocabulary' ? 'font-japanese text-4xl sm:text-5xl leading-snug' : current.display.length > 2 ? 'font-japanese text-6xl' : 'font-japanese text-8xl'} font-black`}>{current.display}</div>{selectedOption !== null && <div className="mt-6 flex justify-center gap-3 text-xs"><span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-2 rounded-lg">ON: {current.kanjiData.onyomi}</span><span className="bg-green-50 dark:bg-green-900/20 text-green-600 px-3 py-2 rounded-lg">KUN: {current.kanjiData.kunyomi}</span></div>}</section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{current.options.map((option, optionIndex) => { let style = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-red-400'; if (selectedOption !== null) style = option.isCorrect ? 'bg-green-500 border-green-600 text-white' : selectedOption === optionIndex ? 'bg-red-500 border-red-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-45'; return <button key={option.label} disabled={selectedOption !== null} onClick={() => handleAnswer(optionIndex)} className={`p-5 rounded-2xl border-2 font-bold text-lg flex justify-between items-center ${style}`}><span className={current.kind === 'kanji' || current.kind === 'vocabulary' ? 'font-japanese text-2xl' : ''}>{option.label}</span>{selectedOption !== null && option.isCorrect && <i className="fas fa-check-circle"></i>}</button>; })}</div>
        {selectedOption !== null && <div className="flex justify-end mt-6"><button onClick={nextQuestion} className="px-7 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold">{index === questions.length - 1 ? 'Xem kết quả' : 'Tiếp theo'}<i className="fas fa-arrow-right ml-2"></i></button></div>}
      </div>
    </div>
  );
}
