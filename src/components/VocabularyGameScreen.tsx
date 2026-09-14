"use client";

import { useEffect, useMemo, useState } from 'react';
import type { JLPTLevel } from '@/data/jlptCore';
import type { VocabularyInfo } from '@/data/vocabulary';
import { getVocabularyRelationPairs, type VocabularyRelationKind } from '@/data/vocabularyPractice';

export type VocabularyGameMode = 'speed' | 'relations';

type Props = {
  pool: VocabularyInfo[];
  level: JLPTLevel;
  mode: VocabularyGameMode;
  title: string;
  onExit: () => void;
};

type MatchPair = {
  id: string;
  left: string;
  leftDetail: string;
  right: string;
  rightDetail: string;
  kind?: VocabularyRelationKind;
  leftMeaning?: string;
  rightMeaning?: string;
  explanation?: string;
};

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const buildSpeedPairs = (pool: VocabularyInfo[]): MatchPair[] => {
  const seenWords = new Set<string>();
  const seenMeanings = new Set<string>();
  const unique = shuffle(pool).filter((item) => {
    if (seenWords.has(item.word) || seenMeanings.has(item.meaning)) return false;
    seenWords.add(item.word);
    seenMeanings.add(item.meaning);
    return true;
  }).slice(0, 6);
  return unique.map((item) => ({
    id: item.id,
    left: item.word,
    leftDetail: item.reading,
    right: item.meaning,
    rightDetail: item.partOfSpeech === 'verb' ? 'Động từ' : item.partOfSpeech === 'noun' ? 'Danh từ' : item.partOfSpeech === 'adjective' ? 'Tính từ' : 'Cụm từ',
  }));
};

const buildRelationPairs = (pool: VocabularyInfo[]): MatchPair[] => shuffle(getVocabularyRelationPairs(pool)).slice(0, 6).map((pair) => ({
  id: pair.id,
  left: pair.left.word,
  leftDetail: pair.left.reading,
  right: pair.right.word,
  rightDetail: pair.right.reading,
  kind: pair.kind,
  leftMeaning: pair.left.meaning,
  rightMeaning: pair.right.meaning,
  explanation: pair.explanation,
}));

export function VocabularyGameScreen({ pool, level, mode, title, onExit }: Props) {
  const [pairs, setPairs] = useState<MatchPair[]>(() => (mode === 'speed' ? buildSpeedPairs(pool) : buildRelationPairs(pool)));
  const leftCards = useMemo(() => shuffle(pairs), [pairs]);
  const rightCards = useMemo(() => shuffle(pairs), [pairs]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [bestSeconds, setBestSeconds] = useState<number | null>(null);
  const [feedbackPair, setFeedbackPair] = useState<MatchPair | null>(null);
  const [finishAfterFeedback, setFinishAfterFeedback] = useState(false);
  const storageKey = `kanjimaster-vocabulary-game-${mode}-${level}`;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = Number.parseInt(localStorage.getItem(storageKey) ?? '', 10);
      setBestSeconds(Number.isFinite(saved) ? saved : null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [storageKey]);

  useEffect(() => {
    if (finished || feedbackPair || pairs.length < 2) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1_000);
    return () => window.clearInterval(timer);
  }, [feedbackPair, finished, pairs.length]);

  const finishRound = (finalSeconds: number) => {
    setFinished(true);
    if (bestSeconds === null || finalSeconds < bestSeconds) {
      localStorage.setItem(storageKey, String(finalSeconds));
      setBestSeconds(finalSeconds);
    }
  };

  const compare = (leftId: string, rightId: string) => {
    setLocked(true);
    setSelectedLeft(leftId);
    setSelectedRight(rightId);
    window.setTimeout(() => {
      if (leftId === rightId) {
        const nextMatched = [...matched, leftId];
        setMatched(nextMatched);
        const roundFinished = nextMatched.length === pairs.length;
        if (mode === 'relations') {
          setFeedbackPair(pairs.find((pair) => pair.id === leftId) ?? null);
          setFinishAfterFeedback(roundFinished);
        } else if (roundFinished) {
          finishRound(seconds);
        }
      } else {
        setErrors((value) => value + 1);
      }
      setSelectedLeft(null);
      setSelectedRight(null);
      if (leftId !== rightId || mode !== 'relations') setLocked(false);
    }, leftId === rightId ? 250 : 550);
  };

  const closeFeedback = () => {
    setFeedbackPair(null);
    setLocked(false);
    if (finishAfterFeedback) finishRound(seconds);
    setFinishAfterFeedback(false);
  };

  const chooseLeft = (id: string) => {
    if (locked || matched.includes(id)) return;
    if (selectedRight) compare(id, selectedRight);
    else setSelectedLeft(id === selectedLeft ? null : id);
  };

  const chooseRight = (id: string) => {
    if (locked || matched.includes(id)) return;
    if (selectedLeft) compare(selectedLeft, id);
    else setSelectedRight(id === selectedRight ? null : id);
  };

  const restart = () => {
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatched([]);
    setErrors(0);
    setSeconds(0);
    setLocked(false);
    setFinished(false);
    setFeedbackPair(null);
    setFinishAfterFeedback(false);
    setPairs(mode === 'speed' ? buildSpeedPairs(pool) : buildRelationPairs(pool));
  };

  if (pairs.length < 2) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 text-slate-800 dark:text-slate-100">
        <section className="max-w-lg bg-white dark:bg-slate-800 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-black mb-2">Chưa đủ cặp từ trong phạm vi này</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-5">Hãy chọn toàn bộ Vocabulary hoặc tắt “Chỉ học phần N4” để có thêm cặp từ.</p>
          <button onClick={onExit} className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black">Trở về Vocabulary</button>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between gap-3 mb-6">
          <button onClick={onExit} aria-label="Thoát trò chơi" className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><i className="fas fa-xmark"></i></button>
          <div className="text-center"><h1 className="font-black text-lg">{title}</h1><p className="text-xs text-slate-400">{mode === 'speed' ? 'Nối từ với nghĩa' : 'Tìm cặp có quan hệ'} • {level}</p></div>
          <div className="flex gap-2 text-sm font-black"><span className="bg-white dark:bg-slate-800 rounded-xl px-3 py-2"><i className="fas fa-stopwatch text-cyan-500 mr-2"></i>{seconds}s</span><span className="bg-white dark:bg-slate-800 rounded-xl px-3 py-2"><i className="fas fa-xmark text-red-500 mr-2"></i>{errors}</span></div>
        </header>
        <div className="rounded-2xl bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-900/30 p-4 mb-5 flex flex-col sm:flex-row justify-between gap-2 text-sm">
          <span><b>Cách chơi:</b> chọn một thẻ bên trái rồi chọn thẻ tương ứng bên phải.</span>
          <span className="font-bold">Kỷ lục đã lưu: {bestSeconds === null ? 'chưa có' : `${bestSeconds}s`}</span>
        </div>
        {finished ? (
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center shadow-xl">
            <div className="text-5xl mb-3">🏆</div><h2 className="text-3xl font-black">Hoàn thành!</h2><p className="text-slate-500 dark:text-slate-400 mt-2">{seconds} giây • {errors} lần chọn sai</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6"><button onClick={restart} className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-black"><i className="fas fa-rotate-right mr-2"></i>Chơi lượt mới</button><button onClick={onExit} className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black">Trở về Vocabulary</button></div>
          </section>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <div className="space-y-3">{leftCards.map((card) => <button key={`left-${card.id}`} disabled={matched.includes(card.id) || locked} onClick={() => chooseLeft(card.id)} className={`w-full min-h-24 text-left rounded-2xl border-2 p-4 transition-all ${matched.includes(card.id) ? 'opacity-0 pointer-events-none' : selectedLeft === card.id ? 'border-cyan-500 bg-cyan-500 text-white scale-[1.02]' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-400'}`}><span className="font-japanese text-xl sm:text-2xl font-black block">{card.left}</span><span className="text-xs opacity-70 mt-1 block">{card.leftDetail}</span>{card.kind && <span className="inline-block mt-2 text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-black/10">{card.kind === 'antonym' ? 'Tìm trái nghĩa' : 'Tìm đồng nghĩa'}</span>}</button>)}</div>
            <div className="space-y-3">{rightCards.map((card) => <button key={`right-${card.id}`} disabled={matched.includes(card.id) || locked} onClick={() => chooseRight(card.id)} className={`w-full min-h-24 text-left rounded-2xl border-2 p-4 transition-all ${matched.includes(card.id) ? 'opacity-0 pointer-events-none' : selectedRight === card.id ? 'border-violet-500 bg-violet-500 text-white scale-[1.02]' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-400'}`}><span className={`${mode === 'relations' ? 'font-japanese text-xl sm:text-2xl' : 'text-base sm:text-lg'} font-black block`}>{card.right}</span><span className="text-xs opacity-70 mt-1 block">{card.rightDetail}</span></button>)}</div>
          </div>
        )}
      </div>
      {feedbackPair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="relation-feedback-title" className="w-full max-w-xl rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 p-5 sm:p-7 shadow-2xl">
            <div className="text-center">
              <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300"><i className="fas fa-check-circle mr-2" />Ghép chính xác</span>
              <h2 id="relation-feedback-title" className="mt-3 text-2xl font-black">{feedbackPair.kind === 'antonym' ? 'Cặp từ trái nghĩa' : 'Cặp từ đồng nghĩa'}</h2>
            </div>
            <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
              <div className="rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 p-4 text-center">
                <div className="font-japanese text-2xl sm:text-3xl font-black">{feedbackPair.left}</div>
                {feedbackPair.leftDetail && <div className="mt-1 text-xs text-cyan-700 dark:text-cyan-300">{feedbackPair.leftDetail}</div>}
                <div className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">{feedbackPair.leftMeaning}</div>
              </div>
              <div className="flex items-center justify-center text-xl font-black text-emerald-500">{feedbackPair.kind === 'antonym' ? '↔' : '≈'}</div>
              <div className="rounded-2xl bg-violet-50 dark:bg-violet-950/30 p-4 text-center">
                <div className="font-japanese text-2xl sm:text-3xl font-black">{feedbackPair.right}</div>
                {feedbackPair.rightDetail && <div className="mt-1 text-xs text-violet-700 dark:text-violet-300">{feedbackPair.rightDetail}</div>}
                <div className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">{feedbackPair.rightMeaning}</div>
              </div>
            </div>
            {feedbackPair.explanation && <p className="mt-4 rounded-xl bg-slate-100 dark:bg-slate-900 px-4 py-3 text-center text-sm font-bold text-slate-600 dark:text-slate-300"><i className="fas fa-language mr-2 text-emerald-500" />{feedbackPair.explanation}</p>}
            <button autoFocus onClick={closeFeedback} className="mt-5 w-full rounded-xl bg-emerald-500 py-3 font-black text-white hover:bg-emerald-600">{finishAfterFeedback ? 'Xem kết quả' : 'Tiếp tục'} <i className="fas fa-arrow-right ml-2" /></button>
          </section>
        </div>
      )}
    </div>
  );
}
