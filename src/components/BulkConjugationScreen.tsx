"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { VocabularyInfo } from '@/data/vocabulary';
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech';
import {
  buildConjugationQuestionDeck,
  conjugationFormOptions,
  getConjugationGroupLabel,
  type ConjugationAnswerMode,
  type ConjugationAnswerRecord,
  type ConjugationDrillConfig,
  type ConjugationQuestion,
} from '@/lib/conjugationDrill';
import { analyzeJapaneseAnswer, commitRomajiInput, convertRomajiInput } from '@/lib/japaneseInput';
import type { StudySettings } from '@/lib/study';
import type { VerbGroup } from '@/lib/japaneseGrammar';
import { JapaneseAnswerFeedback } from './JapaneseAnswerFeedback';

type Props = {
  pool: VocabularyInfo[];
  config: ConjugationDrillConfig;
  settings: StudySettings;
  onExit: () => void;
  onHome: () => void;
  onNewSession: () => void;
  onComplete: (result: { score: number; total: number; wrongIds: string[] }) => void;
};

type AnswerState = 'idle' | 'correct' | 'incorrect';

const makeInitialQuestions = (pool: VocabularyInfo[], config: ConjugationDrillConfig) => {
  const deck = buildConjugationQuestionDeck(pool, config);
  return config.questionCount === 'endless' ? deck : deck.slice(0, config.questionCount);
};

const acceptedAnswers = (question: ConjugationQuestion) => [question.target.value, question.target.reading]
  .flatMap((answer) => answer.split(/[／/]/));

const playSuccessTone = () => {
  const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(660, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.12);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.2);
  oscillator.addEventListener('ended', () => void context.close());
};

const groupOrder: VerbGroup[] = ['godan', 'ichidan', 'irregular'];

export function BulkConjugationScreen({ pool, config, settings, onExit, onHome, onNewSession, onComplete }: Props) {
  const [questions, setQuestions] = useState<ConjugationQuestion[]>(() => makeInitialQuestions(pool, config));
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<ConjugationAnswerMode>('typing');
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [answers, setAnswers] = useState<ConjugationAnswerRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const nextTimerRef = useRef<number | null>(null);
  const checkingRef = useRef(false);
  const completionReportedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const speakJapanese = useJapaneseSpeech(settings.speechRate);
  const current = questions[index];

  const clearNextTimer = () => {
    if (nextTimerRef.current !== null) window.clearTimeout(nextTimerRef.current);
    nextTimerRef.current = null;
  };

  useEffect(() => () => {
    if (nextTimerRef.current !== null) window.clearTimeout(nextTimerRef.current);
  }, []);

  const resultSummary = useMemo(() => {
    const score = answers.filter((answer) => answer.correct).length;
    const breakdown = groupOrder.map((group) => {
      const groupAnswers = answers.filter((answer) => answer.question.group === group);
      return { group, correct: groupAnswers.filter((answer) => answer.correct).length, total: groupAnswers.length };
    }).filter((item) => item.total > 0);
    return { score, total: answers.length, breakdown };
  }, [answers]);

  const resetAnswerControls = () => {
    clearNextTimer();
    checkingRef.current = false;
    setValue('');
    setSubmitted('');
    setAnswerState('idle');
    setRevealAnswer(false);
  };

  const reportCompletion = (records: ConjugationAnswerRecord[]) => {
    if (completionReportedRef.current) return;
    completionReportedRef.current = true;
    onComplete({
      score: records.filter((answer) => answer.correct).length,
      total: records.length,
      wrongIds: [...new Set(records.filter((answer) => !answer.correct).map((answer) => answer.question.item.id))],
    });
  };

  const finishSession = (records = answers) => {
    clearNextTimer();
    reportCompletion(records);
    setFinished(true);
  };

  const moveNext = (records: ConjugationAnswerRecord[]) => {
    clearNextTimer();
    if (config.questionCount !== 'endless' && index >= questions.length - 1) {
      finishSession(records);
      return;
    }

    if (config.questionCount === 'endless' && index >= questions.length - 1) {
      const nextDeck = buildConjugationQuestionDeck(pool, config, questions.length + 1);
      if (nextDeck.length === 0) {
        finishSession(records);
        return;
      }
      if (current && nextDeck.length > 1 && nextDeck[0].item.id === current.item.id && nextDeck[0].target.key === current.target.key) {
        [nextDeck[0], nextDeck[1]] = [nextDeck[1], nextDeck[0]];
      }
      setQuestions((items) => [...items, ...nextDeck]);
    }
    setIndex((currentIndex) => currentIndex + 1);
    resetAnswerControls();
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const evaluateAnswer = (rawAnswer: string, answerMode: ConjugationAnswerMode) => {
    if (!current || answerState !== 'idle' || checkingRef.current || !rawAnswer.trim()) return;
    checkingRef.current = true;
    const committed = commitRomajiInput(rawAnswer);
    const isCorrect = analyzeJapaneseAnswer(committed, acceptedAnswers(current)).correct;
    const firstAttempt = !answers.some((answer) => answer.question.id === current.id);
    const nextAnswers = firstAttempt
      ? [...answers, { question: current, correct: isCorrect, submitted: committed, mode: answerMode }]
      : answers;

    setValue(committed);
    setSubmitted(committed);
    setAnswers(nextAnswers);
    setAnswerState(isCorrect ? 'correct' : 'incorrect');

    if (!isCorrect) {
      if (firstAttempt) setStreak(0);
      checkingRef.current = false;
      return;
    }

    if (firstAttempt) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak((currentBest) => Math.max(currentBest, nextStreak));
    }
    playSuccessTone();
    window.setTimeout(() => speakJapanese(current.target.value), 120);
    nextTimerRef.current = window.setTimeout(() => moveNext(nextAnswers), 1_000);
  };

  const retry = () => {
    resetAnswerControls();
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const reveal = () => {
    setRevealAnswer(true);
    checkingRef.current = false;
  };

  const changeMode = (nextMode: ConjugationAnswerMode) => {
    if (nextMode === mode || answerState === 'correct') return;
    resetAnswerControls();
    setMode(nextMode);
  };

  const retryWrongAnswers = () => {
    const wrongQuestions = answers.filter((answer) => !answer.correct).map((answer, retryIndex) => ({
      ...answer.question,
      id: `${answer.question.id}-retry-${retryIndex}-${Date.now()}`,
    }));
    if (wrongQuestions.length === 0) return;
    completionReportedRef.current = false;
    setQuestions(wrongQuestions);
    setAnswers([]);
    setIndex(0);
    setStreak(0);
    setBestStreak(0);
    setFinished(false);
    resetAnswerControls();
  };

  const exitDrill = () => {
    if (answers.length > 0) finishSession();
    else onExit();
  };

  if (questions.length === 0 || !current) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 text-slate-800 dark:text-slate-100 flex items-center justify-center">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/20 text-2xl text-orange-500"><i className="fas fa-triangle-exclamation"></i></div>
          <h1 className="text-2xl font-black">Không tạo được bộ câu hỏi</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Hãy chọn lại cấp độ, nhóm động từ hoặc thể cần luyện.</p>
          <button type="button" onClick={onNewSession} className="mt-6 w-full rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại cấu hình</button>
        </section>
      </div>
    );
  }

  if (finished) {
    const percent = Math.round((resultSummary.score / Math.max(1, resultSummary.total)) * 100);
    const wrongCount = resultSummary.total - resultSummary.score;
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8 text-slate-800 dark:text-slate-100 flex items-center justify-center">
        <section className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-9 shadow-xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/20 text-2xl text-orange-500"><i className="fas fa-trophy"></i></div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Kết quả luyện tập</div>
            <h1 className="mt-2 text-3xl font-black">{resultSummary.score}/{resultSummary.total} câu chính xác</h1>
            <div className="mt-3 text-5xl font-black text-orange-500">{percent}%</div>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Chuỗi đúng cao nhất: 🔥 x{bestStreak}</p>
          </div>

          <div className="mt-7 space-y-3">
            {resultSummary.breakdown.map((item) => {
              const groupPercent = Math.round((item.correct / item.total) * 100);
              return <div key={item.group} className="rounded-2xl bg-slate-50 dark:bg-slate-900/70 p-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm"><b>{getConjugationGroupLabel(item.group)}</b><span className="font-black">{item.correct}/{item.total} ({groupPercent}%)</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${groupPercent}%` }} /></div>
              </div>;
            })}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {wrongCount > 0 && <button type="button" onClick={retryWrongAnswers} className="rounded-xl bg-red-500 px-5 py-3 font-black text-white sm:col-span-2"><i className="fas fa-rotate-left mr-2"></i>Luyện lại {wrongCount} câu sai</button>}
            <button type="button" onClick={onNewSession} className="rounded-xl bg-orange-500 px-5 py-3 font-black text-white"><i className="fas fa-rocket mr-2"></i>Bắt đầu phiên mới</button>
            <button type="button" onClick={onHome} className="rounded-xl bg-slate-900 dark:bg-white px-5 py-3 font-black text-white dark:text-slate-900"><i className="fas fa-house mr-2"></i>Về trang chủ</button>
          </div>
        </section>
      </div>
    );
  }

  const targetLabel = conjugationFormOptions.find((form) => form.key === current.target.key)?.label ?? current.target.label;
  const finiteTotal = config.questionCount === 'endless' ? null : questions.length;
  const progress = finiteTotal ? ((index + 1) / finiteTotal) * 100 : 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8 text-slate-800 dark:text-slate-100">
      <div className="mx-auto max-w-3xl">
        <header className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={exitDrill} aria-label="Thoát đấu trường" className="h-11 w-11 shrink-0 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"><i className="fas fa-xmark"></i></button>
            <div className="min-w-0 text-center"><h1 className="font-black"><span className="sm:hidden">Đấu trường chia thể</span><span className="hidden sm:inline">Đấu trường biến đổi Động từ</span></h1><p className="text-xs text-slate-500 dark:text-slate-400">{config.level === 'all' ? 'N5 + N4' : config.level} · Câu {index + 1}/{finiteTotal ?? '∞'}</p></div>
            <div className="shrink-0 rounded-xl bg-orange-50 dark:bg-orange-950/20 px-3 py-2 text-sm font-black text-orange-600 dark:text-orange-300" aria-label={`Chuỗi đúng ${streak}`}>🔥 x{streak}</div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className={`h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all ${finiteTotal ? '' : 'animate-pulse'}`} style={{ width: `${progress}%` }} /></div>
        </header>

        <div className="mb-4 grid grid-cols-2 rounded-2xl bg-slate-200/70 dark:bg-slate-800 p-1.5">
          <button type="button" disabled={answerState === 'correct'} onClick={() => changeMode('typing')} className={`rounded-xl px-3 py-2.5 text-sm font-black ${mode === 'typing' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'} disabled:opacity-60`}><i className="fas fa-keyboard mr-2"></i>Gõ phím</button>
          <button type="button" disabled={answerState === 'correct'} onClick={() => changeMode('choice')} className={`rounded-xl px-3 py-2.5 text-sm font-black ${mode === 'choice' ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' : 'text-slate-500'} disabled:opacity-60`}><i className="fas fa-list-check mr-2"></i>Trắc nghiệm</button>
        </div>

        <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 sm:p-9 shadow-sm">
          <div className="text-center">
            <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-black">{getConjugationGroupLabel(current.group)}</span>
            <div className="mt-5 font-japanese text-4xl sm:text-6xl font-black leading-tight">
              <ruby>{current.dictionaryForm.value}<rt className="text-sm sm:text-base font-medium text-slate-400">{current.dictionaryForm.reading}</rt></ruby>
            </div>
            <p className="mt-3 text-lg font-bold text-slate-500 dark:text-slate-300">{current.item.meaning}</p>
            <div className="mt-6 rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-orange-50 dark:bg-orange-950/20 px-4 py-4">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Hãy chia sang</div>
              <div className="mt-1 text-xl sm:text-2xl font-black text-orange-700 dark:text-orange-300">{targetLabel}</div>
            </div>
          </div>

          {mode === 'typing' ? (
            <form className="mt-6" onSubmit={(event) => { event.preventDefault(); if (answerState === 'idle') evaluateAnswer(value, 'typing'); else if (answerState === 'incorrect' && revealAnswer) moveNext(answers); }}>
              <input ref={inputRef} autoFocus value={value} disabled={answerState !== 'idle'} onChange={(event) => setValue(convertRomajiInput(event.target.value))} autoComplete="off" spellCheck={false} lang="ja" inputMode="text" placeholder="Gõ Kanji, Kana hoặc Romaji" className={`w-full rounded-2xl border-2 bg-slate-50 dark:bg-slate-900 px-5 py-4 font-japanese text-2xl outline-none transition-colors ${answerState === 'correct' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : answerState === 'incorrect' ? 'border-red-400' : 'border-blue-200 dark:border-slate-600 focus:border-blue-500'}`} />
              {answerState === 'idle' && <button type="submit" disabled={!value.trim()} className="mt-3 w-full rounded-xl bg-blue-600 px-5 py-3 font-black text-white disabled:opacity-40">Kiểm tra <span className="hidden sm:inline">(Enter)</span></button>}
            </form>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.options.map((option, optionIndex) => {
                const selected = submitted === option;
                const isCorrectOption = analyzeJapaneseAnswer(option, acceptedAnswers(current)).correct;
                const answeredClass = answerState === 'idle' ? 'border-slate-200 dark:border-slate-700 hover:border-violet-500' : isCorrectOption && (answerState === 'correct' || revealAnswer) ? 'border-green-500 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300' : selected ? 'border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300' : 'border-slate-200 dark:border-slate-700 opacity-55';
                return <button key={`${option}-${optionIndex}`} type="button" disabled={answerState !== 'idle'} onClick={() => evaluateAnswer(option, 'choice')} className={`min-h-16 rounded-2xl border-2 px-4 py-3 text-left font-japanese text-xl font-black transition-colors ${answeredClass}`}><span className="mr-3 text-xs font-sans text-slate-400">{String.fromCharCode(65 + optionIndex)}</span>{option}</button>;
              })}
            </div>
          )}

          {answerState === 'correct' && <div className="mt-5 rounded-2xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20 p-4 text-green-700 dark:text-green-300"><div className="font-black"><i className="fas fa-circle-check mr-2"></i>Chính xác: <span className="font-japanese text-xl">{current.target.value}</span></div><p className="mt-1 text-xs">Đang chuyển sang câu tiếp theo...</p></div>}

          {answerState === 'incorrect' && <JapaneseAnswerFeedback input={submitted} acceptedAnswers={acceptedAnswers(current)} revealAnswer={revealAnswer} onRetry={retry} onReveal={reveal} />}

          {answerState === 'incorrect' && revealAnswer && <div className="mt-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20 p-4"><div className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-300">Quy tắc cần nhớ</div><p className="mt-1 text-sm font-bold text-amber-900 dark:text-amber-100">{current.rule}</p><button type="button" onClick={() => moveNext(answers)} className="mt-4 w-full rounded-xl bg-slate-900 dark:bg-white px-5 py-3 font-black text-white dark:text-slate-900">{finiteTotal && index === finiteTotal - 1 ? 'Xem kết quả' : 'Câu tiếp theo'}<i className="fas fa-arrow-right ml-2"></i></button></div>}

          <button type="button" onClick={() => speakJapanese(current.dictionaryForm.value)} className="mt-5 w-full rounded-xl bg-violet-50 dark:bg-violet-950/20 px-5 py-3 font-bold text-violet-600 dark:text-violet-300"><i className="fas fa-volume-high mr-2"></i>Nghe động từ gốc</button>
        </section>
      </div>
    </div>
  );
}
