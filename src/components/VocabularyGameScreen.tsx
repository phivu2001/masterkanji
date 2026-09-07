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
  leftDetail: pair.left.meaning,
  right: pair.right.word,
  rightDetail: pair.explanation,
  kind: pair.kind,
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
  const storageKey = `kanjimaster-vocabulary-game-${mode}-${level}`;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = Number.parseInt(localStorage.getItem(storageKey) ?? '', 10);
      setBestSeconds(Number.isFinite(saved) ? saved : null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [storageKey]);

  useEffect(() => {
    if (finished || pairs.length < 2) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1_000);
    return () => window.clearInterval(timer);
  }, [finished, pairs.length]);

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
        if (nextMatched.length === pairs.length) finishRound(seconds);
      } else {
        setErrors((value) => value + 1);
      }
      setSelectedLeft(null);
      setSelectedRight(null);
      setLocked(false);
    }, leftId === rightId ? 250 : 550);
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
    </div>
  );
}
