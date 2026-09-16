"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toRomaji } from 'wanakana';
import type { JLPTLevel } from '@/data/jlptCore';
import type { VocabularyInfo } from '@/data/vocabulary';
import { analyzeJapaneseAnswer, commitRomajiInput, convertRomajiInput, normalizeJapaneseAnswer } from '@/lib/japaneseInput';
import { buildTrack, renderRacingCanvas, type Segment, SEGMENT_LENGTH } from '@/lib/racing/engine';

type Props = {
  pool: VocabularyInfo[];
  level: JLPTLevel;
  title: string;
  onExit: () => void;
  onComplete: (result: { score: number; total: number; wrongIds: string[] }) => void;
};

type AnswerFlash = { kind: 'correct' | 'incorrect'; text: string } | null;
type ChallengeMode = 'meaning-to-japanese' | 'japanese-to-meaning';
type CarImpulse = 'idle' | 'forward' | 'back';
type RaceResult = {
  elapsedSeconds: number;
  attempts: number;
  correct: number;
  wrongIds: string[];
  maxCombo: number;
  score: number;
  averageResponseSeconds: number;
  rank: number;
};

const TARGET_DISTANCE = 10_000;
const DEFAULT_SPEED = 120;
const MIN_SPEED = 60;
const BASE_MAX_SPEED = 230;
const NITRO_SPEED = 330;
const NITRO_DURATION_MS = 5_000;
const FRICTION_PER_SECOND = 8;
const DISTANCE_SCALE = 3;
const AI_SPEEDS = [175, 150];

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const acceptedAnswers = (item: VocabularyInfo) => [item.reading, item.word]
  .flatMap((answer) => answer.split(/[／/]/));
const normalizeVietnameseAnswer = (value: string) => value
  .normalize('NFD')
  .replace(/\p{M}/gu, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLocaleLowerCase('vi-VN')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim();
const acceptedMeaningAnswers = (item: VocabularyInfo) => [...new Set([
  item.meaning,
  ...item.meaning.split(/[;,()]|\s+\/\s+/),
].map((answer) => answer.trim()).filter((answer) => normalizeVietnameseAnswer(answer).length >= 2))];
const isCorrectInput = (input: string, item: VocabularyInfo, mode: ChallengeMode) => mode === 'meaning-to-japanese'
  ? analyzeJapaneseAnswer(commitRomajiInput(input), acceptedAnswers(item)).correct
  : acceptedMeaningAnswers(item).some((answer) => normalizeVietnameseAnswer(answer) === normalizeVietnameseAnswer(input));
const isValidInputPrefix = (input: string, item: VocabularyInfo, mode: ChallengeMode) => {
  if (!input.trim()) return true;
  if (mode === 'japanese-to-meaning') {
    const submitted = normalizeVietnameseAnswer(input);
    return acceptedMeaningAnswers(item).some((answer) => normalizeVietnameseAnswer(answer).startsWith(submitted));
  }
  const submitted = normalizeJapaneseAnswer(input);
  const submittedRomaji = toRomaji(submitted).toLocaleLowerCase('ja-JP');
  return acceptedAnswers(item).some((answer) => {
    const normalized = normalizeJapaneseAnswer(answer);
    return normalized.startsWith(submitted) || toRomaji(normalized).toLocaleLowerCase('ja-JP').startsWith(submittedRomaji);
  });
};
const formatRaceTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

function ArcadeCar({ id, color, accent, nitro = false }: { id: string; color: string; accent: string; nitro?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 170" className="h-full w-full overflow-visible drop-shadow-[0_12px_9px_rgba(0,0,0,.55)]">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={accent} /><stop offset="0.45" stopColor={color} /><stop offset="1" stopColor="#111827" /></linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#cffafe" stopOpacity=".95" /><stop offset="1" stopColor="#0c4a6e" /></linearGradient>
      </defs>
      {nitro && <g className="arcade-flame"><path d="M43 151 C38 174 54 178 59 151Z" fill="#38bdf8" /><path d="M61 151 C63 180 82 173 76 150Z" fill="#f8fafc" /></g>}
      <ellipse cx="60" cy="151" rx="46" ry="13" fill="#020617" opacity=".65" />
      <rect x="4" y="82" width="19" height="57" rx="7" fill="#020617" /><rect x="97" y="82" width="19" height="57" rx="7" fill="#020617" />
      <path d="M20 58 L34 22 Q60 7 86 22 L100 58 L106 135 Q60 158 14 135Z" fill={`url(#${id}-body)`} stroke="#e0f2fe" strokeOpacity=".55" strokeWidth="2" />
      <path d="M35 29 Q60 16 85 29 L92 65 Q60 56 28 65Z" fill={`url(#${id}-glass)`} stroke="#67e8f9" strokeWidth="2" />
      <path d="M19 77 Q60 63 101 77 L96 91 Q60 80 24 91Z" fill={accent} opacity=".9" />
      <path d="M8 55 H112 V68 H8Z" rx="3" fill="#0f172a" /><path d="M18 50 H102 V59 H18Z" fill={accent} />
      <rect x="22" y="108" width="25" height="14" rx="6" fill="#fb7185" /><rect x="73" y="108" width="25" height="14" rx="6" fill="#fb7185" />
      <path d="M45 132 H75 L70 145 H50Z" fill="#020617" stroke={accent} strokeWidth="2" />
      <path d="M24 96 Q60 84 96 96" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" />
    </svg>
  );
}

export function VocabularyRacingScreen({ pool, level, title, onExit, onComplete }: Props) {
  const racePool = useMemo(() => [...new Map(pool.map((item) => [item.id, item])).values()], [pool]);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<Segment[]>([]);
  const skyOffsetRef = useRef(0);
  const composingRef = useRef(false);
  const feedbackTimerRef = useRef<number | null>(null);
  const typingFeedbackTimerRef = useRef<number | null>(null);
  const impulseTimerRef = useRef<number | null>(null);
  const comboTimerRef = useRef<number | null>(null);
  const lastPenalizedValueRef = useRef('');
  const speedRef = useRef(DEFAULT_SPEED);
  const distanceRef = useRef(0);
  const nitroRef = useRef(0);
  const nitroUntilRef = useRef(0);
  const lastTickRef = useRef(0);
  const raceStartedAtRef = useRef(0);
  const questionStartedAtRef = useRef(0);
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const statsRef = useRef({ attempts: 0, correct: 0, wrongIds: new Set<string>(), maxCombo: 0, score: 0, totalResponseMs: 0 });

  const [queue, setQueue] = useState<VocabularyInfo[]>(() => shuffle(racePool));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [challengeMode, setChallengeMode] = useState<ChallengeMode>('meaning-to-japanese');
  const [value, setValue] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [distance, setDistance] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [combo, setCombo] = useState(0);
  const [nitro, setNitro] = useState(0);
  const [nitroActive, setNitroActive] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [answerFlash, setAnswerFlash] = useState<AnswerFlash>(null);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [carImpulse, setCarImpulse] = useState<CarImpulse>('idle');
  const [comboMilestone, setComboMilestone] = useState<number | null>(null);
  const [result, setResult] = useState<RaceResult | null>(null);

  const current = queue[questionIndex];
  const progress = Math.min(100, (distance / TARGET_DISTANCE) * 100);
  const aiDistances = AI_SPEEDS.map((aiSpeed) => elapsedSeconds * (aiSpeed / 3.6) * DISTANCE_SCALE);
  const livePrefixValid = current ? isValidInputPrefix(value, current, challengeMode) : true;
  const speedometerProgress = Math.min(100, (speed / NITRO_SPEED) * 100);
  const liveRank = 1 + aiDistances.filter((aiDistance) => aiDistance > distance).length;
  const finishTrackPosition = progress < 80 ? -18 : ((progress - 80) / 20) * 95;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const finishRace = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    const elapsed = Math.max(1, (Date.now() - raceStartedAtRef.current) / 1_000);
    const stats = statsRef.current;
    const wrongIds = [...stats.wrongIds];
    const rank = 1 + AI_SPEEDS.filter((aiSpeed) => elapsed * (aiSpeed / 3.6) * DISTANCE_SCALE >= TARGET_DISTANCE).length;
    const finalResult: RaceResult = {
      elapsedSeconds: elapsed,
      attempts: stats.attempts,
      correct: stats.correct,
      wrongIds,
      maxCombo: stats.maxCombo,
      score: stats.score,
      averageResponseSeconds: stats.attempts > 0 ? stats.totalResponseMs / stats.attempts / 1_000 : 0,
      rank,
    };
    setAnswerLocked(true);
    setResult(finalResult);
    onCompleteRef.current({ score: stats.correct, total: Math.max(1, stats.attempts), wrongIds });
  }, []);

  useEffect(() => {
    if (countdown <= 0 || result) return;
    const timer = window.setTimeout(() => setCountdown((currentValue) => currentValue - 1), 1_000);
    return () => window.clearTimeout(timer);
  }, [countdown, result]);

  useEffect(() => {
    if (countdown !== 0 || result || racePool.length === 0) return;
    const now = performance.now();
    lastTickRef.current = now;
    raceStartedAtRef.current = Date.now();
    questionStartedAtRef.current = Date.now();
    inputRef.current?.focus();

    if (trackRef.current.length === 0) {
      trackRef.current = buildTrack();
    }

    let animationFrameId: number;
    const loop = () => {
      const tick = performance.now();
      const deltaSeconds = Math.min(0.25, Math.max(0, (tick - lastTickRef.current) / 1_000));
      lastTickRef.current = tick;
      const activeNitro = Date.now() < nitroUntilRef.current;
      const nextSpeed = activeNitro
        ? NITRO_SPEED
        : Math.max(MIN_SPEED, speedRef.current - FRICTION_PER_SECOND * deltaSeconds);
      const nextDistance = Math.min(TARGET_DISTANCE, distanceRef.current + (nextSpeed / 3.6) * deltaSeconds * DISTANCE_SCALE);
      speedRef.current = nextSpeed;
      distanceRef.current = nextDistance;
      setSpeed(Math.round(nextSpeed));
      setDistance(nextDistance);
      setNitroActive(activeNitro);
      setElapsedSeconds((Date.now() - raceStartedAtRef.current) / 1_000);

      // Canvas Rendering
      const segments = trackRef.current;
      const baseSegmentIndex = Math.floor(nextDistance / SEGMENT_LENGTH);
      const baseSegment = segments[baseSegmentIndex % segments.length];
      if (baseSegment) {
        skyOffsetRef.current = skyOffsetRef.current + baseSegment.curve * (nextSpeed / 3.6) * deltaSeconds * 0.2;
      }

      if (canvasRef.current) {
        renderRacingCanvas(
          canvasRef.current.getContext('2d', { alpha: false })!,
          canvasRef.current.width,
          canvasRef.current.height,
          segments,
          nextDistance,
          skyOffsetRef.current
        );
      }

      if (nextDistance >= TARGET_DISTANCE) {
        finishRace();
      } else {
        animationFrameId = requestAnimationFrame(loop);
      }
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [countdown, finishRace, racePool.length, result]);

  const activateNitro = useCallback(() => {
    if (countdown !== 0 || finishedRef.current || nitroRef.current < 100 || Date.now() < nitroUntilRef.current) return;
    nitroRef.current = 0;
    nitroUntilRef.current = Date.now() + NITRO_DURATION_MS;
    speedRef.current = NITRO_SPEED;
    setNitro(0);
    setSpeed(NITRO_SPEED);
    setNitroActive(true);
  }, [countdown]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isNitroHotkey = event.code === 'Space' || event.key === 'Shift';
      if (!isNitroHotkey || event.repeat || nitroRef.current < 100 || Date.now() < nitroUntilRef.current) return;
      event.preventDefault();
      activateNitro();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activateNitro]);

  useEffect(() => () => {
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    if (typingFeedbackTimerRef.current !== null) window.clearTimeout(typingFeedbackTimerRef.current);
    if (impulseTimerRef.current !== null) window.clearTimeout(impulseTimerRef.current);
    if (comboTimerRef.current !== null) window.clearTimeout(comboTimerRef.current);
  }, []);

  const triggerCarImpulse = (direction: Exclude<CarImpulse, 'idle'>) => {
    if (impulseTimerRef.current !== null) window.clearTimeout(impulseTimerRef.current);
    setCarImpulse(direction);
    impulseTimerRef.current = window.setTimeout(() => setCarImpulse('idle'), 340);
  };

  const advanceQuestion = (retryItem?: VocabularyInfo) => {
    setQueue((currentQueue) => {
      const nextQueue = [...currentQueue];
      if (retryItem) {
        const retryOffset = 3 + Math.floor(Math.random() * 3);
        const retryPosition = Math.min(questionIndex + retryOffset, nextQueue.length);
        nextQueue.splice(retryPosition, 0, retryItem);
      }
      if (questionIndex + 1 >= nextQueue.length) nextQueue.push(...shuffle(racePool));
      return nextQueue;
    });
    setQuestionIndex((index) => index + 1);
    setValue('');
    lastPenalizedValueRef.current = '';
    setAnswerFlash(null);
    setAnswerLocked(false);
    questionStartedAtRef.current = Date.now();
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const submitAnswer = (submittedValue = value) => {
    if (!current || countdown !== 0 || answerLocked || composingRef.current || !submittedValue.trim() || result) return;
    setAnswerLocked(true);
    const committed = challengeMode === 'meaning-to-japanese' ? commitRomajiInput(submittedValue) : submittedValue.trim();
    const correct = isCorrectInput(committed, current, challengeMode);
    const responseTime = Date.now() - questionStartedAtRef.current;
    const stats = statsRef.current;
    stats.attempts += 1;
    stats.totalResponseMs += responseTime;
    setAttempts(stats.attempts);

    if (correct) {
      const nextCombo = combo + 1;
      const speedLimit = Math.min(300, BASE_MAX_SPEED + nextCombo * 6);
      const speedBoost = 30 + Math.min(45, nextCombo * 3);
      const nextSpeed = nitroActive ? NITRO_SPEED : Math.min(speedLimit, speedRef.current + speedBoost);
      const nextNitro = Math.min(100, nitroRef.current + 20);
      const points = Math.round((100 + nextCombo * 12) * (nitroActive ? 2 : 1));
      speedRef.current = nextSpeed;
      nitroRef.current = nextNitro;
      stats.correct += 1;
      stats.maxCombo = Math.max(stats.maxCombo, nextCombo);
      stats.score += points;
      setSpeed(Math.round(nextSpeed));
      setNitro(nextNitro);
      setCombo(nextCombo);
      setCorrectCount(stats.correct);
      setScore(stats.score);
      triggerCarImpulse('forward');
      if (nextCombo % 5 === 0) {
        if (comboTimerRef.current !== null) window.clearTimeout(comboTimerRef.current);
        setComboMilestone(nextCombo);
        comboTimerRef.current = window.setTimeout(() => setComboMilestone(null), 900);
      }
      setAnswerFlash({ kind: 'correct', text: `+${points} điểm · +${Math.round(speedBoost)} km/h` });
      feedbackTimerRef.current = window.setTimeout(() => advanceQuestion(), 420);
      return;
    }

    speedRef.current = Math.max(MIN_SPEED, speedRef.current - 35);
    distanceRef.current = Math.max(0, distanceRef.current - 140);
    stats.wrongIds.add(current.id);
    setSpeed(Math.round(speedRef.current));
    setDistance(distanceRef.current);
    setCombo(0);
    setValue(committed);
    triggerCarImpulse('back');
    setAnswerFlash({ kind: 'incorrect', text: challengeMode === 'meaning-to-japanese' ? `Đáp án: ${current.word}・${current.reading}` : `Đáp án: ${current.meaning}` });
    feedbackTimerRef.current = window.setTimeout(() => advanceQuestion(current), 850);
  };

  const penalizeTypingMistake = (submittedValue: string) => {
    if (!current || answerLocked || !submittedValue.trim()) return;
    const penaltyKey = challengeMode === 'meaning-to-japanese'
      ? toRomaji(normalizeJapaneseAnswer(submittedValue)).toLocaleLowerCase('ja-JP')
      : normalizeVietnameseAnswer(submittedValue);
    if (!penaltyKey || lastPenalizedValueRef.current === penaltyKey) return;
    lastPenalizedValueRef.current = penaltyKey;
    speedRef.current = Math.max(MIN_SPEED, speedRef.current - 18);
    distanceRef.current = Math.max(0, distanceRef.current - 70);
    const stats = statsRef.current;
    stats.attempts += 1;
    stats.totalResponseMs += Date.now() - questionStartedAtRef.current;
    stats.wrongIds.add(current.id);
    questionStartedAtRef.current = Date.now();
    setSpeed(Math.round(speedRef.current));
    setDistance(distanceRef.current);
    setAttempts(stats.attempts);
    setCombo(0);
    triggerCarImpulse('back');
    setAnswerFlash({ kind: 'incorrect', text: 'Sai ký tự — xe bị lùi. Sửa lại để tiếp tục!' });
    if (typingFeedbackTimerRef.current !== null) window.clearTimeout(typingFeedbackTimerRef.current);
    typingFeedbackTimerRef.current = window.setTimeout(() => setAnswerFlash(null), 700);
  };

  const handleInputValue = (rawValue: string) => {
    if (!current || answerLocked || countdown !== 0 || result) return;
    const nextValue = challengeMode === 'meaning-to-japanese' ? convertRomajiInput(rawValue) : rawValue;
    setValue(nextValue);
    if (composingRef.current || !nextValue.trim()) return;
    if (isCorrectInput(nextValue, current, challengeMode)) {
      submitAnswer(nextValue);
      return;
    }
    if (isValidInputPrefix(nextValue, current, challengeMode)) {
      lastPenalizedValueRef.current = '';
      if (answerFlash?.kind === 'incorrect') setAnswerFlash(null);
      return;
    }
    penalizeTypingMistake(nextValue);
  };

  const changeChallengeMode = (mode: ChallengeMode) => {
    setChallengeMode(mode);
    setValue('');
    setAnswerFlash(null);
    lastPenalizedValueRef.current = '';
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const restart = () => {
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current);
    if (typingFeedbackTimerRef.current !== null) window.clearTimeout(typingFeedbackTimerRef.current);
    if (impulseTimerRef.current !== null) window.clearTimeout(impulseTimerRef.current);
    if (comboTimerRef.current !== null) window.clearTimeout(comboTimerRef.current);
    speedRef.current = DEFAULT_SPEED;
    distanceRef.current = 0;
    nitroRef.current = 0;
    nitroUntilRef.current = 0;
    finishedRef.current = false;
    lastPenalizedValueRef.current = '';
    statsRef.current = { attempts: 0, correct: 0, wrongIds: new Set<string>(), maxCombo: 0, score: 0, totalResponseMs: 0 };
    setQueue(shuffle(racePool));
    setQuestionIndex(0);
    setValue('');
    setCountdown(3);
    setSpeed(DEFAULT_SPEED);
    setDistance(0);
    setElapsedSeconds(0);
    setCombo(0);
    setNitro(0);
    setNitroActive(false);
    setAnswerLocked(false);
    setAnswerFlash(null);
    setAttempts(0);
    setCorrectCount(0);
    setScore(0);
    setCarImpulse('idle');
    setComboMilestone(null);
    setResult(null);
  };

  if (racePool.length < 4 || !current) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4"><section className="max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-8 text-center"><h1 className="text-2xl font-black">Chưa đủ từ để mở đường đua</h1><p className="mt-2 text-slate-400">Cần ít nhất 4 từ không trùng để chơi.</p><button onClick={onExit} className="mt-5 w-full rounded-xl bg-cyan-500 py-3 font-black text-slate-950">Trở về Vocabulary</button></section></div>;
  }

  if (result) {
    const accuracy = Math.round((result.correct / Math.max(1, result.attempts)) * 100);
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex items-center justify-center">
        <section className="w-full max-w-2xl overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-900 shadow-2xl shadow-cyan-950/40">
          <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 p-7 text-center">
            <div className="text-6xl">{result.rank === 1 ? '🏆' : result.rank === 2 ? '🥈' : '🥉'}</div>
            <h1 className="mt-3 text-3xl font-black">Về đích hạng {result.rank}</h1>
            <p className="mt-1 text-cyan-50">10.000m · {formatRaceTime(result.elapsedSeconds)}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5 sm:p-7">
            {[
              ['fa-star', 'Điểm', result.score.toLocaleString('vi-VN')],
              ['fa-bullseye', 'Chính xác', `${accuracy}%`],
              ['fa-fire', 'Combo cao nhất', `x${result.maxCombo}`],
              ['fa-stopwatch', 'Phản xạ TB', `${result.averageResponseSeconds.toFixed(1)}s`],
              ['fa-check', 'Trả lời đúng', `${result.correct}/${result.attempts}`],
              ['fa-rotate-left', 'Từ cần ôn', String(result.wrongIds.length)],
            ].map(([icon, label, valueText]) => <div key={label} className="rounded-2xl bg-slate-950/70 p-4 text-center"><i className={`fas ${icon} text-cyan-400`} /><div className="mt-2 text-xs text-slate-400">{label}</div><div className="mt-1 text-xl font-black">{valueText}</div></div>)}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 px-5 pb-6 sm:px-7">
            <button onClick={restart} className="flex-1 rounded-xl bg-cyan-500 py-3 font-black text-slate-950"><i className="fas fa-rotate-right mr-2" />Đua lại</button>
            <button onClick={onExit} className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-3 font-black">Trở về Vocabulary</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-hidden bg-slate-950 text-white ${nitroActive ? 'nitro-shake' : ''}`}>
      <header className="border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <button onClick={onExit} aria-label="Thoát đường đua" className="h-11 w-11 shrink-0 rounded-full border border-slate-700 bg-slate-900"><i className="fas fa-xmark" /></button>
          <div className="min-w-0 text-center"><h1 className="truncate font-black">Đua xe từ vựng</h1><p className="text-xs text-slate-400">{title} · {level}</p></div>
          <div className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-black"><i className="fas fa-stopwatch mr-2 text-cyan-400" />{formatRaceTime(elapsedSeconds)}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-3 sm:p-5">
        <section className={`arcade-stage relative h-[340px] overflow-hidden rounded-[1.75rem] border-2 border-cyan-400/40 bg-slate-900 shadow-2xl shadow-cyan-950/60 sm:h-[430px] ${nitroActive ? 'shadow-cyan-400/50' : ''}`}>
          <canvas ref={canvasRef} width={800} height={430} className="absolute inset-0 h-full w-full object-cover" />

          {(nitroActive || speed >= 220) && <div className="speed-lines pointer-events-none absolute inset-0" />}

          {AI_SPEEDS.map((_, index) => {
            const lead = Math.max(-1, Math.min(1, (aiDistances[index] - distance) / 2_500));
            const top = 50 - lead * 28;
            const scale = 0.72 - lead * 0.3;
            // Need to shift AI cars slightly based on curves. Simplified here.
            return <div key={index} className="absolute z-[4] h-20 w-14 transition-[top,transform] duration-100 sm:h-24 sm:w-16" style={{ left: index === 0 ? '42%' : '58%', top: `${top}%`, transform: `translate(-50%, -50%) scale(${scale})` }}><ArcadeCar id={`ai-${index}`} color={index === 0 ? '#e11d48' : '#f59e0b'} accent={index === 0 ? '#fda4af' : '#fde047'} /><span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-slate-950/75 px-1.5 py-0.5 text-[8px] font-black">AI {index + 1}</span></div>;
          })}

          <div className="absolute bottom-1 left-1/2 z-[6] h-32 w-24 -translate-x-1/2 sm:h-40 sm:w-32">
            <div className={`player-car player-car-${carImpulse} h-full w-full ${nitroActive ? 'drop-shadow-[0_0_22px_#22d3ee]' : ''}`}><ArcadeCar id="player" color="#0891b2" accent="#67e8f9" nitro={nitroActive} /></div>
          </div>

          <div className="absolute left-3 top-3 z-10 rounded-2xl border border-cyan-300/30 bg-slate-950/75 px-3 py-2 text-center backdrop-blur sm:left-5 sm:top-5 sm:px-5">
            <div className="text-[9px] font-black uppercase tracking-widest text-cyan-300">Vị trí</div><div className="text-3xl font-black italic text-white"><span className="text-amber-300">{liveRank}</span><span className="text-sm text-slate-400">/3</span></div>
          </div>
          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-white/20 bg-slate-950/75 px-4 py-2 text-center backdrop-blur sm:top-5">
            <div className="font-mono text-xs font-black text-white">{Math.round(distance).toLocaleString('vi-VN')}m <span className="text-slate-500">/ 10.000m</span></div><div className="mt-1 text-[9px] font-bold text-cyan-300">{Math.round(progress)}% ĐƯỜNG ĐUA</div>
          </div>
          <div className="absolute right-3 top-3 z-10 rounded-2xl border border-violet-300/30 bg-slate-950/75 px-3 py-2 text-right backdrop-blur sm:right-5 sm:top-5 sm:px-5"><div className="text-[9px] font-black uppercase tracking-widest text-violet-300">Score</div><div className="text-xl font-black text-white sm:text-2xl">{score.toLocaleString('vi-VN')}</div><div className="text-[9px] text-emerald-300">{attempts > 0 ? Math.round((correctCount / attempts) * 100) : 100}% chính xác</div></div>

          <div className="absolute bottom-3 left-3 z-10 sm:bottom-5 sm:left-5">
            <div className="speedometer relative h-24 w-24 rounded-full p-1 sm:h-28 sm:w-28" style={{ background: `conic-gradient(from 225deg, #22d3ee 0deg ${speedometerProgress * 2.7}deg, #172554 ${speedometerProgress * 2.7}deg 270deg, transparent 270deg)` }}><div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-cyan-300/25 bg-slate-950/85"><span className="text-3xl font-black italic text-white sm:text-4xl">{speed}</span><span className="text-[9px] font-black text-cyan-300">KM/H</span></div></div>
          </div>
          <div className={`absolute bottom-5 right-4 z-10 -skew-x-6 rounded-xl border bg-slate-950/80 px-4 py-2 text-right backdrop-blur sm:bottom-7 sm:right-7 ${combo > 0 && combo % 5 === 0 ? 'combo-card border-orange-300 shadow-lg shadow-orange-500/30' : 'border-orange-400/30'}`}><div className="skew-x-6 text-[9px] font-black tracking-widest text-orange-300">COMBO</div><div className="skew-x-6 text-3xl font-black italic text-white">x{combo}</div></div>
          {comboMilestone && <div className="combo-burst absolute inset-x-0 top-[28%] z-20 text-center text-5xl font-black italic text-orange-300 drop-shadow-[0_4px_0_#c2410c] sm:text-7xl">COMBO x{comboMilestone}!</div>}
          {countdown > 0 && <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/35 text-8xl font-black italic text-white backdrop-blur-[2px] drop-shadow-[0_7px_0_#0891b2] sm:text-9xl">{countdown}</div>}
        </section>

        <div className="arcade-progress mt-3 flex items-center gap-2 rounded-full border border-cyan-500/20 bg-slate-900/80 px-3 py-2 text-sm" aria-label={`Tiến trình đường đua ${Math.round(progress)}%`}>
          <span title="Xuất phát">🏁</span><div className="relative h-3 flex-1 overflow-visible rounded-full bg-slate-950"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-[width] duration-100" style={{ width: `${progress}%` }} /><span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-100" style={{ left: `${Math.max(2, progress)}%` }}>🏎️</span></div><span title="Đích">🚩</span>
        </div>

        <section className="cockpit-panel relative mt-4 overflow-hidden rounded-3xl border border-cyan-500/30 bg-[linear-gradient(135deg,rgba(15,23,42,.98),rgba(10,20,55,.96))] p-5 shadow-xl shadow-cyan-950/20 sm:p-7">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Buồng lái phản xạ</div><p className="mt-1 text-xs text-slate-400">Chọn chiều luyện phù hợp, có thể đổi ngay trong cuộc đua.</p></div>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1 text-xs font-black">
              <button type="button" onClick={() => changeChallengeMode('meaning-to-japanese')} aria-pressed={challengeMode === 'meaning-to-japanese'} className={`rounded-lg px-3 py-2 ${challengeMode === 'meaning-to-japanese' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>Nghĩa → Nhật</button>
              <button type="button" onClick={() => changeChallengeMode('japanese-to-meaning')} aria-pressed={challengeMode === 'japanese-to-meaning'} className={`rounded-lg px-3 py-2 ${challengeMode === 'japanese-to-meaning' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>Nhật → Nghĩa</button>
            </div>
          </div>
          <div className="mt-5">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">{challengeMode === 'meaning-to-japanese' ? 'Gõ từ tiếng Nhật phù hợp' : 'Gõ nghĩa tiếng Việt phù hợp'}</div>
            <div className={`mt-2 font-black leading-tight ${challengeMode === 'meaning-to-japanese' ? 'text-3xl sm:text-5xl' : 'font-japanese text-4xl sm:text-6xl'}`}>{challengeMode === 'meaning-to-japanese' ? current.meaning : current.word}</div>
            <p className="mt-2 text-sm text-slate-400">{challengeMode === 'meaning-to-japanese' ? 'Chấp nhận Kanji, Kana hoặc Romaji.' : 'Chấp nhận nghĩa có dấu hoặc không dấu.'} Hệ thống tự chấm ngay khi bạn gõ đủ.</p>
            <form onSubmit={(event) => { event.preventDefault(); submitAnswer(); }} className="mt-5">
              <input ref={inputRef} value={value} disabled={countdown > 0 || answerLocked} onCompositionStart={() => { composingRef.current = true; }} onCompositionEnd={(event) => { composingRef.current = false; handleInputValue(event.currentTarget.value); }} onChange={(event) => handleInputValue(event.target.value)} autoComplete="off" spellCheck={false} lang={challengeMode === 'meaning-to-japanese' ? 'ja' : 'vi'} inputMode="text" placeholder={challengeMode === 'meaning-to-japanese' ? 'Gõ Kana, Kanji hoặc Romaji...' : 'Gõ nghĩa tiếng Việt...'} className={`w-full rounded-2xl border-2 bg-slate-950 px-5 py-4 text-2xl outline-none ${challengeMode === 'meaning-to-japanese' ? 'font-japanese' : ''} ${answerFlash?.kind === 'correct' ? 'border-emerald-500 text-emerald-300' : answerFlash?.kind === 'incorrect' ? 'border-red-500 text-red-300' : 'border-slate-700 focus:border-cyan-400'}`} />
            </form>
            <div className="mt-2 flex min-h-7 flex-wrap items-center gap-1" aria-live="polite">
              {value && Array.from(value).map((character, index) => <span key={`${character}-${index}`} className={`min-w-6 rounded-md border px-1.5 py-0.5 text-center font-bold ${livePrefixValid ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-red-500/40 bg-red-500/10 text-red-300'}`}>{character === ' ' ? '·' : character}</span>)}
              {value && <span className={`ml-1 text-xs font-bold ${livePrefixValid ? 'text-emerald-400' : 'text-red-400'}`}>{livePrefixValid ? 'Đang khớp đúng' : 'Có ký tự chưa đúng'}</span>}
            </div>
            <div className="mt-1 min-h-6 text-sm font-black">{answerFlash && <span className={answerFlash.kind === 'correct' ? 'text-emerald-400' : 'text-red-400'}><i className={`fas ${answerFlash.kind === 'correct' ? 'fa-circle-check' : 'fa-circle-xmark'} mr-2`} />{answerFlash.text}</span>}</div>

            <div className={`mt-4 rounded-2xl border p-3 transition-shadow ${nitro >= 100 ? 'nitro-ready border-cyan-300 bg-blue-950/60 shadow-lg shadow-cyan-500/30' : 'border-blue-500/30 bg-slate-950/60'}`}>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1"><div className="flex items-center justify-between text-xs font-black"><span className="text-blue-300">NITRO N₂O</span><span>{nitro}%</span></div><div className="mt-2 h-4 overflow-hidden rounded-full border border-blue-500/40 bg-slate-950"><div className={`h-full bg-gradient-to-r from-blue-600 to-cyan-300 transition-[width] ${nitro >= 100 ? 'animate-pulse' : ''}`} style={{ width: `${nitro}%` }} /></div></div>
                <button type="button" onClick={activateNitro} disabled={nitro < 100 || nitroActive || countdown > 0} className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-4 py-3 text-xs font-black text-white shadow-lg shadow-blue-950 disabled:grayscale disabled:opacity-40 sm:px-6"><i className="fas fa-gauge-high mr-2" />{nitroActive ? 'ĐANG CHẠY' : 'KÍCH HOẠT'}<span className="block text-[9px] font-bold opacity-80">Space · 5 giây</span></button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .arcade-stage::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(115deg, rgba(255,255,255,.12), transparent 24% 76%, rgba(34,211,238,.08)); box-shadow: inset 0 0 70px rgba(2,6,23,.55); }
        .cockpit-panel::after { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .12; background-image: linear-gradient(rgba(34,211,238,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.35) 1px,transparent 1px); background-size: 28px 28px; mask-image: linear-gradient(to bottom,black,transparent 70%); }
        .arcade-progress { box-shadow: inset 0 0 18px rgba(8,145,178,.12); }
        .player-car { transition: transform .22s ease-out, filter .2s ease; }
        .player-car-forward { animation: car-forward .34s ease-out; }
        .player-car-back { animation: car-back .34s ease-out; }
        .combo-burst { animation: combo-burst .9s ease-out both; }
        .combo-card { animation: combo-card .65s ease-in-out; }
        .arcade-flame { transform-origin: 60px 150px; animation: nitro-flame .12s ease-in-out infinite alternate; }
        .nitro-ready { animation: nitro-ready 1s ease-in-out infinite alternate; }
        .nitro-shake { animation: nitro-shake .16s linear infinite; }
        .speed-lines { background: repeating-conic-gradient(from 0deg at 50% 88%, transparent 0deg 7deg, rgba(255,255,255,.2) 8deg 8.7deg); animation: speed-lines .2s linear infinite; mix-blend-mode: screen; }
        @keyframes car-forward { 0% { transform: translateY(0); } 45% { transform: translateY(-28px) scale(1.08); } 100% { transform: translateY(0); } }
        @keyframes car-back { 0% { transform: translateY(0); } 40% { transform: translateY(18px) rotate(-3deg); } 65% { transform: translate(6px,14px) rotate(3deg); } 100% { transform: translateY(0); } }
        @keyframes combo-burst { 0% { opacity: 0; transform: scale(.45) rotate(-4deg); } 30% { opacity: 1; transform: scale(1.2) rotate(2deg); } 100% { opacity: 0; transform: scale(1.45); } }
        @keyframes combo-card { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes nitro-flame { from { transform: scaleY(.75); filter: hue-rotate(0deg); } to { transform: scaleY(1.3); filter: hue-rotate(45deg); } }
        @keyframes nitro-ready { from { box-shadow: 0 0 8px rgba(34,211,238,.25); } to { box-shadow: 0 0 24px rgba(34,211,238,.7); } }
        @keyframes nitro-shake { 0%,100% { transform: translate(0,0); } 25% { transform: translate(1px,-1px); } 75% { transform: translate(-1px,1px); } }
        @keyframes speed-lines { from { transform: scale(1); opacity: .45; } to { transform: scale(1.04); opacity: .8; } }
        @media (prefers-reduced-motion: reduce) { .nitro-shake, .player-car-forward, .player-car-back, .combo-burst, .combo-card, .arcade-flame, .nitro-ready, .speed-lines { animation: none; } }
      `}</style>
    </div>
  );
}
