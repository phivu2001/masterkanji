"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toRomaji } from 'wanakana';
import type { JLPTLevel } from '@/data/jlptCore';
import type { VocabularyInfo } from '@/data/vocabulary';
import { analyzeJapaneseAnswer, commitRomajiInput, convertRomajiInput, normalizeJapaneseAnswer } from '@/lib/japaneseInput';
import { getVerbForms } from '@/lib/japaneseGrammar';

type Props = {
  pool: VocabularyInfo[];
  level: JLPTLevel;
  title: string;
  onExit: () => void;
  onComplete: (result: { score: number; total: number; wrongIds: string[] }) => void;
};

type AnswerFlash = {
  kind: 'correct' | 'incorrect';
  title: string;
  submitted?: string;
  expected?: string;
  detail: string;
} | null;
type ChallengeMode = 'meaning-to-japanese' | 'japanese-to-meaning';
type RacerId = 'player' | 'ai-0' | 'ai-1' | 'ai-2';

const TARGET_DISTANCE = 10_000;
const DEFAULT_SPEED = 160;
const MIN_SPEED = 125;
const BASE_MAX_SPEED = 230;
const NITRO_SPEED = 330;
const NITRO_DURATION_MS = 5_000;
const FRICTION_PER_SECOND = 2.5;
const DISTANCE_SCALE = 4;
const AI_SPEEDS = [155, 145, 135];
const AI_NAMES = ["Sora", "Miku", "Ken"];
const AI_COLORS = ["#fb7185", "#fde047", "#a78bfa"]; // Pink, Yellow, Purple
const PLAYER_COLOR = "#38bdf8"; // Blue
const RACER_TRAVEL_RATIO = 0.78;
const PLAYER_SPRING = 12;
const AI_SPRING = 8;

const racerName = (id: RacerId) => {
  if (id === 'player') return 'Bạn';
  return AI_NAMES[Number(id.slice(3))] ?? 'Đối thủ';
};

const moveRacer = (element: HTMLDivElement | null, coveredDistance: number, trackWidth: number) => {
  if (!element) return;
  const progress = Math.max(0, Math.min(1, coveredDistance / TARGET_DISTANCE));
  const translateX = progress * trackWidth * RACER_TRAVEL_RATIO;
  element.style.transform = `translate3d(${translateX.toFixed(2)}px, -50%, 0)`;
};

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const acceptedAnswers = (item: VocabularyInfo) => {
  const lessonAnswers = [item.reading, item.word]
    .flatMap((answer) => answer.split(/[／/]/));
  const dictionaryAnswers = item.partOfSpeech === 'verb'
    ? getVerbForms(item)
      .filter((form) => form.key === 'dictionary')
      .flatMap((form) => [form.reading, form.value])
    : [];
  return [...new Set([...lessonAnswers, ...dictionaryAnswers])];
};
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
const formatRaceTime = (seconds: number) => {
  const h = Math.floor(seconds / 3_600);
  const m = Math.floor((seconds % 3_600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const DuckSprite = memo(function DuckSprite({ name, color, lane, nitro = false }: { name: string; color: string; lane: number; nitro?: boolean }) {
  const patternId = `duck-pattern-${lane}`;
  const animationClass = nitro ? 'animate-duck-dash' : 'animate-duck-bob';
  const animStyle = { animationDuration: nitro ? '0.35s' : '0.9s' };

  return (
    <div className={`relative flex flex-col items-center transition-all duration-300 ease-out ${nitro ? 'drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]' : ''}`}>
      <div className="absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-xl border-[3px] border-slate-950 bg-white px-2.5 py-0.5 text-xs font-black text-slate-950 shadow-sm sm:-top-10 sm:text-base transition-transform group-hover:-translate-y-1">
        {name}
        <div className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-slate-950 bg-white" />
      </div>

      <div className={`relative h-20 w-28 drop-shadow-xl sm:h-24 sm:w-36 ${animationClass}`} style={animStyle}>
        <div className={`duck-wake absolute -bottom-1 -left-8 z-0 h-8 w-24 ${nitro ? 'duck-wake-nitro' : ''}`} aria-hidden="true">
          <span /><span /><span />
        </div>
        <svg viewBox="0 0 190 125" className="h-full w-full overflow-visible">
          <defs><pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="4.5" fill="#fff" opacity=".25" /></pattern></defs>
          {nitro && <g className="duck-boost"><path d="M27 77 C-7 60 2 99 34 88Z" fill="#38bdf8" /><path d="M28 80 C4 70 9 94 37 85Z" fill="#fef08a" /></g>}
          <ellipse cx="92" cy="111" rx="76" ry="10" fill="#075985" opacity=".28" />
          <ellipse cx="82" cy="78" rx="64" ry="39" fill={color} stroke="#0f172a" strokeWidth="3" />
          <ellipse cx="82" cy="78" rx="61" ry="36" fill={`url(#${patternId})`} />
          <circle cx="132" cy="42" r="30" fill={color} stroke="#0f172a" strokeWidth="3" />
          <circle cx="132" cy="42" r="27" fill={`url(#${patternId})`} />
          <path d="M151 49 Q178 48 185 61 Q165 73 146 60Z" fill="#f97316" stroke="#7c2d12" strokeWidth="3" />
          <circle cx="142" cy="32" r="8" fill="#fff" stroke="#0f172a" strokeWidth="2" /><circle cx="145" cy="33" r="3.5" fill="#0f172a" />
          <path d="M67 72 Q94 54 113 79 Q94 100 64 88Z" fill="#fff" opacity=".2" stroke="#0f172a" strokeWidth="2" />
        </svg>
        <div className="absolute left-[31%] top-[51%] z-10 flex h-7 w-10 items-center justify-center rounded-xl border-2 border-slate-950 bg-white text-sm font-black text-slate-950 sm:h-8 sm:w-12 sm:text-base shadow-inner">{lane}</div>
        
        {/* Splash Particles when Dash */}
        {nitro && (
           <>
             <div className="absolute -bottom-2 -left-4 h-3 w-12 bg-white/70 rounded-full blur-[1px] splash-particle" style={{ animationDelay: '0s' }} />
             <div className="absolute -bottom-1 -left-10 h-4 w-16 bg-white/50 rounded-full blur-[2px] splash-particle" style={{ animationDelay: '0.15s' }} />
           </>
        )}
      </div>

      {!nitro && <div className="absolute -bottom-1 w-20 h-2 bg-white/30 rounded-full blur-[2px]"></div>}
      {nitro && <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-3xl drop-shadow-md animate-bounce">💨</div>}
    </div>
  );
});

export function VocabularyRacingScreen({ pool, level, title, onExit, onComplete }: Props) {
  const racePool = useMemo(() => [...new Map(pool.map((item) => [item.id, item])).values()], [pool]);
  const inputRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);
  const feedbackTimerRef = useRef<number | null>(null);
  const comboTimerRef = useRef<number | null>(null);
  const lastPenalizedValueRef = useRef('');
  const speedRef = useRef(DEFAULT_SPEED);
  const targetSpeedRef = useRef(DEFAULT_SPEED);
  const distanceRef = useRef(0);
  const aiDistancesRef = useRef<number[]>([0, 0, 0]);
  const visualDistancesRef = useRef<number[]>([0, 0, 0, 0]);
  const visualVelocitiesRef = useRef<number[]>([0, 0, 0, 0]);
  const finishOrderRef = useRef<RacerId[]>([]);
  const riverRef = useRef<HTMLDivElement | null>(null);
  const trackWidthRef = useRef(0);
  const playerRacerRef = useRef<HTMLDivElement | null>(null);
  const aiRacerRefs = useRef<Array<HTMLDivElement | null>>([null, null, null]);
  const nitroRef = useRef(0);
  const nitroUntilRef = useRef(0);
  const lastTickRef = useRef(0);
  const lastHudUpdateRef = useRef(0);
  const elapsedRef = useRef(0);
  const questionStartedAtRef = useRef(0);
  const pausedAtRef = useRef(0);
  const finishedRef = useRef(false);
  const pausedRef = useRef(false);
  const autoPausedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(true);
  const onCompleteRef = useRef(onComplete);
  const statsRef = useRef({ attempts: 0, correct: 0, wrongIds: new Set<string>(), maxCombo: 0, score: 0, totalResponseMs: 0 });

  const [queue, setQueue] = useState<VocabularyInfo[]>(() => shuffle(racePool));
  const [currentWord, setCurrentWord] = useState<VocabularyInfo>(queue[0]);
  const [mode, setMode] = useState<ChallengeMode>('meaning-to-japanese');
  const [inputDisplay, setInputDisplay] = useState('');
  const [answerFlash, setAnswerFlash] = useState<AnswerFlash>(null);
  const [combo, setCombo] = useState(0);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [distance, setDistance] = useState(0);
  const [nitroActive, setNitroActive] = useState(false);
  const [nitroCharge, setNitroCharge] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [finishOrder, setFinishOrder] = useState<RacerId[]>([]);
  const [result, setResult] = useState<null | { rank: number; time: number; score: number; order: RacerId[] }>(null);
  const [answerStats, setAnswerStats] = useState({ correct: 0, attempts: 0 });

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => () => {
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    if (comboTimerRef.current) window.clearTimeout(comboTimerRef.current);
    if (audioContextRef.current) void audioContextRef.current.close();
  }, []);

  useEffect(() => {
    const river = riverRef.current;
    if (!river) return;
    const updateTrackWidth = () => {
      trackWidthRef.current = river.clientWidth;
    };
    updateTrackWidth();
    const observer = new ResizeObserver(updateTrackWidth);
    observer.observe(river);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !result && !pausedRef.current) {
        autoPausedRef.current = true;
        pausedAtRef.current = Date.now();
        pausedRef.current = true;
        setIsPaused(true);
      } else if (!document.hidden && autoPausedRef.current) {
        autoPausedRef.current = false;
        const pausedFor = pausedAtRef.current > 0 ? Date.now() - pausedAtRef.current : 0;
        if (nitroUntilRef.current > pausedAtRef.current) nitroUntilRef.current += pausedFor;
        if (questionStartedAtRef.current > 0) questionStartedAtRef.current += pausedFor;
        pausedAtRef.current = 0;
        pausedRef.current = false;
        setIsPaused(false);
        window.requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [result]);

  const playRaceSound = useCallback((kind: 'correct' | 'wrong' | 'nitro' | 'finish' | 'pause') => {
    if (!soundEnabledRef.current || typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext;
    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    if (context.state === 'suspended') void context.resume();

    const patterns = {
      correct: [[620, 0], [830, 0.08]],
      wrong: [[190, 0], [135, 0.1]],
      nitro: [[240, 0], [480, 0.08], [960, 0.16]],
      finish: [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.38]],
      pause: [[360, 0]],
    } as const;
    const duration = kind === 'finish' ? 0.22 : 0.12;
    patterns[kind].forEach(([frequency, delay]) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startsAt = context.currentTime + delay;
      oscillator.type = kind === 'wrong' ? 'sawtooth' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, startsAt);
      gain.gain.setValueAtTime(0.0001, startsAt);
      gain.gain.exponentialRampToValueAtTime(0.12, startsAt + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(startsAt);
      oscillator.stop(startsAt + duration + 0.02);
    });
  }, []);

  const registerFinish = useCallback((id: RacerId) => {
    if (finishOrderRef.current.includes(id)) return;
    finishOrderRef.current = [...finishOrderRef.current, id];
    setFinishOrder(finishOrderRef.current);
  }, []);

  const finishRace = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const stats = statsRef.current;
    const finalElapsed = elapsedRef.current;
    const crossedOrder: RacerId[] = finishOrderRef.current.includes('player')
      ? [...finishOrderRef.current]
      : [...finishOrderRef.current, 'player'];
    const unfinished = (['ai-0', 'ai-1', 'ai-2'] as RacerId[])
      .filter((id) => !crossedOrder.includes(id))
      .sort((left, right) => aiDistancesRef.current[Number(right.slice(3))] - aiDistancesRef.current[Number(left.slice(3))]);
    const finalOrder: RacerId[] = [...crossedOrder, ...unfinished];
    finishOrderRef.current = finalOrder;
    const rank = finalOrder.indexOf('player') + 1;

    setFinishOrder(finalOrder);
    setResult({ rank, time: finalElapsed, score: stats.score, order: finalOrder });
    playRaceSound('finish');
    onCompleteRef.current({ score: stats.correct, total: Math.max(1, stats.attempts), wrongIds: Array.from(stats.wrongIds) });
  }, [playRaceSound]);

  useEffect(() => {
    if (countdown > 0 && !isPaused) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isPaused]);

  useEffect(() => {
    if (countdown !== 0 || result || isPaused || racePool.length === 0) return;
    const now = performance.now();
    lastTickRef.current = now;
    lastHudUpdateRef.current = now;
    if (questionStartedAtRef.current === 0) questionStartedAtRef.current = Date.now();
    inputRef.current?.focus();

    let animationFrameId: number;
    const loop = () => {
      const tick = performance.now();
      const deltaSeconds = Math.min(0.05, Math.max(0, (tick - lastTickRef.current) / 1_000));
      lastTickRef.current = tick;

      const activeNitro = Date.now() < nitroUntilRef.current;
      if (!activeNitro) {
        targetSpeedRef.current = Math.max(MIN_SPEED, targetSpeedRef.current - FRICTION_PER_SECOND * deltaSeconds);
      }
      const requestedSpeed = activeNitro ? NITRO_SPEED : targetSpeedRef.current;
      const speedEase = 1 - Math.exp(-(activeNitro ? 12 : 5) * deltaSeconds);
      const nextSpeed = speedRef.current + (requestedSpeed - speedRef.current) * speedEase;

      const nextDistance = Math.min(TARGET_DISTANCE, distanceRef.current + (nextSpeed / 3.6) * deltaSeconds * DISTANCE_SCALE);
      elapsedRef.current += deltaSeconds;
      speedRef.current = nextSpeed;
      distanceRef.current = nextDistance;

      const nextAiDistances = aiDistancesRef.current.map((currentDistance, index) => {
        if (currentDistance >= TARGET_DISTANCE) return TARGET_DISTANCE;
        // AI speed variance
        const speedVariance = Math.sin(tick / 2000 + index) * 20;
        const aiSpeed = AI_SPEEDS[index] + speedVariance;
        const nextAiDistance = Math.min(TARGET_DISTANCE, currentDistance + (aiSpeed / 3.6) * deltaSeconds * DISTANCE_SCALE);
        if (nextAiDistance >= TARGET_DISTANCE) registerFinish(`ai-${index}` as RacerId);
        return nextAiDistance;
      });
      aiDistancesRef.current = nextAiDistances;

      const targetDistances = [nextDistance, ...nextAiDistances];
      visualDistancesRef.current = visualDistancesRef.current.map((visualDistance, index) => {
        const stiffness = index === 0 ? PLAYER_SPRING : AI_SPRING;
        const damping = 2 * Math.sqrt(stiffness);
        const displacement = targetDistances[index] - visualDistance;
        const acceleration = stiffness * displacement - damping * visualVelocitiesRef.current[index];
        const nextVelocity = visualVelocitiesRef.current[index] + acceleration * deltaSeconds;
        visualVelocitiesRef.current[index] = nextVelocity;
        return Math.min(TARGET_DISTANCE, visualDistance + nextVelocity * deltaSeconds);
      });

      moveRacer(playerRacerRef.current, visualDistancesRef.current[0], trackWidthRef.current);
      nextAiDistances.forEach((_, index) => moveRacer(aiRacerRefs.current[index], visualDistancesRef.current[index + 1], trackWidthRef.current));

      // Text and gauges do not need 60 React renders per second.
      if (tick - lastHudUpdateRef.current >= 80 || nextDistance >= TARGET_DISTANCE) {
        lastHudUpdateRef.current = tick;
        setSpeed(Math.round(nextSpeed));
        setDistance(nextDistance);
        setNitroActive(activeNitro);
        setNitroCharge(Math.min(100, nitroRef.current));
        setElapsedSeconds(elapsedRef.current);
      }

      if (nextDistance >= TARGET_DISTANCE) {
        registerFinish('player');
        finishRace();
      } else {
        animationFrameId = requestAnimationFrame(loop);
      }
    };
    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [countdown, finishRace, isPaused, racePool.length, registerFinish, result]);

  const handleNextWord = useCallback((isCorrect: boolean) => {
    statsRef.current.attempts++;
    statsRef.current.totalResponseMs += (Date.now() - questionStartedAtRef.current);
    
    if (isCorrect) {
      statsRef.current.correct++;
      setCombo((c) => {
        const newCombo = c + 1;
        statsRef.current.maxCombo = Math.max(statsRef.current.maxCombo, newCombo);
        
        let speedBoost = 15;
        if (newCombo >= 10) speedBoost = 35;
        else if (newCombo >= 5) speedBoost = 25;
        targetSpeedRef.current = Math.min(BASE_MAX_SPEED, targetSpeedRef.current + speedBoost);
        
        nitroRef.current = Math.min(100, nitroRef.current + 20);
        setNitroCharge(nitroRef.current);
        
        return newCombo;
      });
      statsRef.current.score += 100 + combo * 10;
      playRaceSound('correct');
    } else {
      statsRef.current.wrongIds.add(currentWord.id);
      setCombo(0);
      targetSpeedRef.current = Math.max(MIN_SPEED, targetSpeedRef.current - 40);
      nitroRef.current = Math.max(0, nitroRef.current - 20);
      setNitroCharge(nitroRef.current);
      playRaceSound('wrong');
    }

    setAnswerStats({ correct: statsRef.current.correct, attempts: statsRef.current.attempts });

    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = window.setTimeout(() => setCombo(0), 4000);

    setQueue((q) => {
      const nextQ = q.length > 1 ? q.slice(1) : shuffle(racePool);
      setCurrentWord(nextQ[0]);
      return nextQ;
    });
    setMode(Math.random() > 0.5 ? 'meaning-to-japanese' : 'japanese-to-meaning');
    setInputDisplay('');
    lastPenalizedValueRef.current = '';
    questionStartedAtRef.current = Date.now();
  }, [combo, currentWord.id, playRaceSound, racePool]);

  const processInputValue = (rawValue: string) => {
    if (countdown > 0 || result) return;
    const candidate = mode === 'meaning-to-japanese' ? convertRomajiInput(rawValue) : rawValue;
    setInputDisplay(candidate);
    if (composingRef.current || !candidate.trim()) return;

    if (isCorrectInput(candidate, currentWord, mode)) {
      setAnswerFlash({
        kind: 'correct',
        title: 'Chính xác! Tăng tốc',
        submitted: candidate,
        expected: mode === 'meaning-to-japanese' ? `${currentWord.word} · ${currentWord.reading}` : currentWord.meaning,
        detail: mode === 'meaning-to-japanese'
          ? 'Chấp nhận Kanji, Kana, Romaji và dạng từ điển của động từ.'
          : 'Nghĩa tiếng Việt được chấp nhận cả có dấu và không dấu.',
      });
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = window.setTimeout(() => setAnswerFlash(null), 1_100);
      handleNextWord(true);
      return;
    }

    const prefixIsValid = isValidInputPrefix(candidate, currentWord, mode);
    if (prefixIsValid) {
      lastPenalizedValueRef.current = '';
      return;
    }

    if (!lastPenalizedValueRef.current) {
      lastPenalizedValueRef.current = 'penalized';
      const japaneseAnalysis = mode === 'meaning-to-japanese'
        ? analyzeJapaneseAnswer(commitRomajiInput(candidate), acceptedAnswers(currentWord))
        : null;
      const wrongCharacter = japaneseAnalysis?.comparison.find((character) => !character.correct);
      setAnswerFlash({
        kind: 'incorrect',
        title: 'Chưa khớp — vịt bị giảm tốc',
        submitted: candidate,
        expected: mode === 'meaning-to-japanese'
          ? `${currentWord.word} · ${currentWord.reading}`
          : currentWord.meaning,
        detail: wrongCharacter
          ? `Vị trí cần sửa: “${wrongCharacter.input || 'thiếu ký tự'}” → “${wrongCharacter.expected || 'bỏ ký tự'}”.`
          : 'Kiểm tra lại chính tả hoặc thử một cách diễn đạt khác.',
      });
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = window.setTimeout(() => setAnswerFlash(null), 1_400);

      statsRef.current.attempts += 1;
      statsRef.current.wrongIds.add(currentWord.id);
      setAnswerStats({ correct: statsRef.current.correct, attempts: statsRef.current.attempts });
      setCombo(0);
      targetSpeedRef.current = Math.max(MIN_SPEED, targetSpeedRef.current - 30);
      playRaceSound('wrong');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (composingRef.current) {
      setInputDisplay(event.target.value);
      return;
    }
    processInputValue(event.target.value);
  };

  const handleCompositionEnd = (event: React.CompositionEvent<HTMLInputElement>) => {
    composingRef.current = false;
    processInputValue(event.currentTarget.value);
  };

  const resumeAfterPause = useCallback(() => {
    const pausedFor = pausedAtRef.current > 0 ? Date.now() - pausedAtRef.current : 0;
    if (pausedFor > 0) {
      if (nitroUntilRef.current > pausedAtRef.current) nitroUntilRef.current += pausedFor;
      if (questionStartedAtRef.current > 0) questionStartedAtRef.current += pausedFor;
    }
    pausedAtRef.current = 0;
    pausedRef.current = false;
    setIsPaused(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const togglePause = useCallback(() => {
    if (countdown > 0 || result) return;
    autoPausedRef.current = false;
    if (pausedRef.current) {
      resumeAfterPause();
    } else {
      pausedAtRef.current = Date.now();
      pausedRef.current = true;
      setIsPaused(true);
      playRaceSound('pause');
    }
  }, [countdown, playRaceSound, result, resumeAfterPause]);

  const activateNitro = useCallback(() => {
    if (countdown > 0 || result || isPaused || nitroRef.current < 100 || Date.now() < nitroUntilRef.current) return;
    nitroRef.current = 0;
    nitroUntilRef.current = Date.now() + NITRO_DURATION_MS;
    setNitroCharge(0);
    setNitroActive(true);
    playRaceSound('nitro');
  }, [countdown, isPaused, playRaceSound, result]);

  useEffect(() => {
    const handleNitroKey = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || nitroRef.current < 100) return;
      event.preventDefault();
      activateNitro();
    };
    window.addEventListener('keydown', handleNitroKey);
    return () => window.removeEventListener('keydown', handleNitroKey);
  }, [activateNitro]);

  const restartRace = () => {
    const nextQueue = shuffle(racePool);
    speedRef.current = DEFAULT_SPEED;
    targetSpeedRef.current = DEFAULT_SPEED;
    distanceRef.current = 0;
    aiDistancesRef.current = [0, 0, 0];
    visualDistancesRef.current = [0, 0, 0, 0];
    visualVelocitiesRef.current = [0, 0, 0, 0];
    finishOrderRef.current = [];
    nitroRef.current = 0;
    nitroUntilRef.current = 0;
    lastTickRef.current = 0;
    lastHudUpdateRef.current = 0;
    elapsedRef.current = 0;
    questionStartedAtRef.current = 0;
    pausedAtRef.current = 0;
    pausedRef.current = false;
    autoPausedRef.current = false;
    finishedRef.current = false;
    statsRef.current = { attempts: 0, correct: 0, wrongIds: new Set<string>(), maxCombo: 0, score: 0, totalResponseMs: 0 };
    setQueue(nextQueue);
    setCurrentWord(nextQueue[0]);
    setMode('meaning-to-japanese');
    setInputDisplay('');
    setAnswerFlash(null);
    setCombo(0);
    setSpeed(DEFAULT_SPEED);
    setDistance(0);
    setNitroActive(false);
    setNitroCharge(0);
    moveRacer(playerRacerRef.current, 0, trackWidthRef.current);
    aiRacerRefs.current.forEach((element) => moveRacer(element, 0, trackWidthRef.current));
    setCountdown(3);
    setIsPaused(false);
    setElapsedSeconds(0);
    setFinishOrder([]);
    setResult(null);
    setAnswerStats({ correct: 0, attempts: 0 });
  };

  if (racePool.length === 0) return <div className="p-8 text-center">Không có dữ liệu từ vựng.</div>;

  const progress = Math.min(100, (distance / TARGET_DISTANCE) * 100);
  const finishRank = (id: RacerId) => {
    const index = finishOrder.indexOf(id);
    return index >= 0 ? index + 1 : null;
  };
  const reshuffleWords = () => {
    const nextQueue = shuffle(racePool);
    setQueue(nextQueue);
    setCurrentWord(nextQueue[0]);
    setInputDisplay('');
    setAnswerFlash(null);
    inputRef.current?.focus();
  };

  return (
    <div className={`flex min-h-screen flex-col bg-sky-100 text-slate-900 selection:bg-cyan-300/50 ${isPaused ? 'race-paused' : ''}`}>
      <header className="flex flex-shrink-0 items-center justify-between border-b-4 border-emerald-800 bg-emerald-600 p-3 text-white shadow-md sm:px-6 sm:py-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">Đua vịt từ vựng</h1>
          <p className="text-xs font-bold text-emerald-100 sm:text-sm">{title} • Cấp độ {level}</p>
        </div>
        <button onClick={onExit} aria-label="Thoát cuộc đua" className="rounded-full border-2 border-white/60 bg-emerald-800 p-2 text-white transition-colors hover:bg-emerald-900">
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col p-2 sm:p-4">
        {/* River Scene */}
        <section className="relative h-[520px] flex-none overflow-hidden rounded-2xl border-4 border-slate-800 bg-green-500 shadow-2xl sm:h-[620px]">
          
          {/* Top Grass Background */}
          <div className="absolute inset-x-0 top-0 z-0 h-[25%] border-b-8 border-[#8b4b08] bg-[#09c909]">
             {/* Simple bushes */}
             <div className="absolute top-4 left-[10%] w-12 h-12 bg-green-600 rounded-full opacity-60 mix-blend-multiply blur-[1px]"></div>
             <div className="absolute top-2 left-[45%] w-16 h-12 bg-green-600 rounded-full opacity-60 mix-blend-multiply blur-[1px]"></div>
             <div className="absolute top-6 left-[85%] w-14 h-14 bg-green-600 rounded-full opacity-60 mix-blend-multiply blur-[1px]"></div>
          </div>
          
          {/* UI Timer Overlay */}
          <div className="absolute left-2 top-2 z-30 flex flex-col gap-1 sm:left-3 sm:top-3">
            <div className="flex gap-1">
              <button onClick={onExit} aria-label="Cài đặt và thoát" className="grid h-10 w-10 place-items-center border-2 border-white bg-black text-xl text-white sm:h-14 sm:w-14 sm:text-3xl"><i className="fas fa-gear" /></button>
              <button type="button" onClick={() => setSoundEnabled((enabled) => !enabled)} aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'} aria-pressed={soundEnabled} className={`grid h-10 w-10 place-items-center border-2 border-white text-xl text-white sm:h-14 sm:w-14 sm:text-3xl ${soundEnabled ? 'bg-black' : 'bg-slate-600'}`}><i className={`fas ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`} /></button>
              <button type="button" onClick={togglePause} disabled={countdown > 0 || !!result} aria-label={isPaused ? 'Tiếp tục cuộc đua' : 'Tạm dừng cuộc đua'} className="grid h-10 w-10 place-items-center border-2 border-white bg-black text-xl text-white disabled:opacity-40 sm:h-14 sm:w-14 sm:text-3xl"><i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`} /></button>
            </div>
            <button onClick={reshuffleWords} className="rounded-md bg-emerald-700 px-2 py-1 text-left text-[10px] font-black text-white shadow sm:text-sm"><i className="fas fa-shuffle mr-1" />Xáo trộn từ</button>
          </div>

          <div className="absolute inset-x-0 top-2 z-20 flex justify-center sm:top-3">
            <div className="flex min-w-[250px] flex-col items-center rounded-2xl border-[5px] border-slate-800 bg-[#e8eaff] px-5 py-1 shadow-lg sm:min-w-[460px] sm:px-8 sm:py-2">
               <span className="font-mono text-4xl font-black tracking-wider text-slate-950 sm:text-7xl">{formatRaceTime(elapsedSeconds)}</span>
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 sm:text-xs">{Math.floor(distance).toLocaleString('vi-VN')}m / {TARGET_DISTANCE.toLocaleString('vi-VN')}m</span>
            </div>
          </div>

          {/* River Area */}
          <div ref={riverRef} className="absolute inset-x-0 bottom-0 h-[75%] overflow-hidden bg-[#4298b4]">
            {/* Wavy lines scrolling */}
            <div className="water-waves pointer-events-none absolute inset-0 opacity-30" />
            <div className="water-glints pointer-events-none absolute inset-0" aria-hidden="true" />

            {/* Finish Line */}
            <div className="finish-line absolute bottom-0 top-0 z-[5] w-12 -skew-x-[14deg] shadow-2xl sm:w-16" style={{ left: '87%' }}><div className="absolute -right-10 inset-y-0 flex flex-col justify-around text-4xl font-black italic text-slate-950 sm:-right-14 sm:text-6xl">{[4, 3, 2, 1].map((position) => <span key={position}>{position}</span>)}</div></div>

            {/* Ducks Grid */}
            <div className="absolute inset-0 flex flex-col justify-around py-2 sm:py-4 z-10">
              
              {/* Lane 1: AI 3 */}
              <div className="relative h-14 sm:h-16 w-full">
                  <div ref={(element) => { aiRacerRefs.current[2] = element; }} className="absolute left-[4%] top-1/2 transform-gpu will-change-transform" style={{ transform: 'translate3d(0, -50%, 0)', backfaceVisibility: 'hidden' }}>
                    <DuckSprite name={AI_NAMES[2]} color={AI_COLORS[2]} lane={1} />
                    {finishRank('ai-2') && <span className="finish-badge">#{finishRank('ai-2')}</span>}
                 </div>
              </div>

              {/* Lane 2: AI 1 */}
              <div className="relative h-14 sm:h-16 w-full">
                  <div ref={(element) => { aiRacerRefs.current[0] = element; }} className="absolute left-[4%] top-1/2 transform-gpu will-change-transform" style={{ transform: 'translate3d(0, -50%, 0)', backfaceVisibility: 'hidden' }}>
                    <DuckSprite name={AI_NAMES[0]} color={AI_COLORS[0]} lane={2} />
                    {finishRank('ai-0') && <span className="finish-badge">#{finishRank('ai-0')}</span>}
                 </div>
              </div>

              {/* Lane 3: PLAYER */}
              <div className="relative h-14 sm:h-16 w-full border-y border-white/20 bg-white/5 shadow-inner">
                  <div ref={playerRacerRef} className="absolute left-[4%] top-1/2 z-20 transform-gpu will-change-transform" style={{ transform: 'translate3d(0, -50%, 0)', backfaceVisibility: 'hidden' }}>
                    <DuckSprite name="Bạn" color={PLAYER_COLOR} lane={3} nitro={nitroActive} />
                    {finishRank('player') && <span className="finish-badge">#{finishRank('player')}</span>}
                 </div>
              </div>

              {/* Lane 4: AI 2 */}
              <div className="relative h-14 sm:h-16 w-full">
                  <div ref={(element) => { aiRacerRefs.current[1] = element; }} className="absolute left-[4%] top-1/2 transform-gpu will-change-transform" style={{ transform: 'translate3d(0, -50%, 0)', backfaceVisibility: 'hidden' }}>
                    <DuckSprite name={AI_NAMES[1]} color={AI_COLORS[1]} lane={4} />
                    {finishRank('ai-1') && <span className="finish-badge">#{finishRank('ai-1')}</span>}
                 </div>
              </div>
              
            </div>
          </div>

          {/* Nitro Bar overlay on the left */}
          <button type="button" onClick={activateNitro} disabled={nitroCharge < 100 || nitroActive || countdown > 0} aria-label="Kích hoạt Nitro" className="absolute bottom-3 left-3 z-30 flex flex-col items-center gap-1 text-white disabled:opacity-70 sm:bottom-5 sm:left-5">
            <span className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-slate-950 text-yellow-300 shadow-lg ${nitroCharge >= 100 ? 'animate-pulse shadow-yellow-300' : ''}`}><i className="fas fa-bolt" /></span>
            <span className="flex h-24 w-5 flex-col-reverse overflow-hidden rounded-full border-2 border-white bg-slate-900/60 shadow-lg shadow-black/50 sm:h-32 sm:w-6"><span className="block w-full bg-yellow-300 shadow-[0_0_12px_#fde047] transition-all duration-300" style={{ height: `${nitroCharge}%` }} /></span>
            <span className="rounded bg-slate-950/75 px-1 text-[8px] font-black">SPACE</span>
          </button>
          <div className="absolute bottom-3 right-3 z-30 rounded-xl border-2 border-white bg-slate-950/75 px-3 py-2 text-right text-white sm:bottom-5 sm:right-5"><div className="text-[9px] font-black text-sky-200">TỐC ĐỘ</div><div className="text-2xl font-black italic sm:text-4xl">{speed}<span className="ml-1 text-[9px] sm:text-xs">km/h</span></div><div className="text-xs font-black text-yellow-300">COMBO x{combo}</div><div className="text-[9px] text-sky-100">Tiến trình {Math.round(progress)}%</div></div>

          {/* Start Countdown */}
          {countdown > 0 && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
              <div className="animate-bounce text-[120px] font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-500 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
                {countdown}
              </div>
            </div>
          )}

          {isPaused && !result && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/65 text-white backdrop-blur-sm">
              <i className="fas fa-pause mb-4 text-6xl text-yellow-300" />
              <div className="text-4xl font-black uppercase italic">Đã tạm dừng</div>
              <p className="mt-2 text-sm text-slate-200">Đồng hồ, Nitro và toàn bộ vịt đều đang dừng.</p>
              <button type="button" onClick={togglePause} className="mt-6 rounded-xl bg-yellow-400 px-7 py-3 font-black text-slate-950 shadow-lg hover:bg-yellow-300"><i className="fas fa-play mr-2" />Tiếp tục</button>
            </div>
          )}

          {/* Race Result */}
          {result && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
              <h2 className="mb-2 text-5xl font-black uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500">
                {result.rank === 1 ? 'Vô Địch!' : `Hạng ${result.rank}`}
              </h2>
              <div className="text-xl font-bold text-slate-200">
                Thời gian: <span className="text-yellow-400">{formatRaceTime(result.time)}</span>
              </div>
              <div className="mt-2 text-lg font-black text-white">Điểm: {result.score.toLocaleString('vi-VN')}</div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {result.order.map((racer, index) => (
                  <div key={racer} className={`rounded-xl border px-3 py-2 text-center font-black ${racer === 'player' ? 'border-sky-300 bg-sky-500/25 text-sky-100' : 'border-white/20 bg-white/10 text-white'}`}>
                    <div className="text-xl text-yellow-300">#{index + 1}</div>
                    <div className="text-xs">{racerName(racer)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row"><button onClick={restartRace} className="rounded-xl bg-yellow-400 px-6 py-3 font-black text-slate-950 hover:bg-yellow-300"><i className="fas fa-rotate-right mr-2" />Đua lại</button><button onClick={onExit} className="rounded-xl border-2 border-white px-6 py-3 font-black text-white hover:bg-white/10"><i className="fas fa-house mr-2" />Về thư viện</button></div>
            </div>
          )}
        </section>

        {/* Dashboard Panels */}
        <section className="mt-2 flex flex-col gap-2 sm:flex-row">
          <div className="flex-1 rounded-2xl border-2 border-sky-300 bg-white p-3 shadow-lg">
            <div className="mb-1 flex items-end justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-700">Tốc độ</div>
              <div className="text-2xl font-black italic text-slate-900 sm:text-3xl">{speed}<span className="ml-1 text-sm text-sky-600">km/h</span></div>
            </div>
            <div className="mb-1 flex items-end justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-700">Combo</div>
              <div className={`text-2xl font-black italic sm:text-3xl ${combo >= 5 ? 'text-orange-500 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-slate-900'}`}>x{combo}</div>
            </div>
            
            {/* Feedback / Question Area */}
            <div className={`relative mt-2 flex min-h-20 flex-col items-center justify-center rounded-xl border-2 px-3 py-2 text-center shadow-inner transition-colors ${answerFlash?.kind === 'correct' ? 'border-emerald-300 bg-emerald-50' : answerFlash?.kind === 'incorrect' ? 'border-rose-300 bg-rose-50' : 'border-sky-200 bg-sky-50'}`} aria-live="polite">
              {answerFlash ? (
                <div className="w-full">
                  <div className={`text-xl font-black tracking-wide ${answerFlash.kind === 'correct' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    <i className={`fas ${answerFlash.kind === 'correct' ? 'fa-circle-check' : 'fa-circle-xmark'} mr-2`} />{answerFlash.title}
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm text-slate-700">
                    {answerFlash.submitted && <span><strong>Bạn nhập:</strong> {answerFlash.submitted}</span>}
                    {answerFlash.expected && <span><strong>Đáp án:</strong> {answerFlash.expected}</span>}
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-600">{answerFlash.detail}</p>
                </div>
              ) : (
                <>
                  <div className="mb-1 text-sm font-semibold text-sky-700">
                    {mode === 'meaning-to-japanese' ? 'Nhập Romaji / Kana:' : 'Nhập Nghĩa (Tiếng Việt):'}
                  </div>
                  <div className="text-2xl font-black tracking-wide text-slate-950 sm:text-3xl">
                    {mode === 'meaning-to-japanese' ? currentWord.meaning : currentWord.word}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col justify-end sm:w-2/5 shrink-0 relative">
            <div className="absolute -top-6 right-2 text-xs font-bold text-slate-600">
               {answerStats.correct} đúng / {answerStats.attempts} thử
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputDisplay}
              onChange={handleInputChange}
              onCompositionStart={() => (composingRef.current = true)}
              onCompositionEnd={handleCompositionEnd}
              disabled={countdown > 0 || isPaused || !!result}
              placeholder="Gõ đáp án vào đây..."
              className={`w-full rounded-2xl border-2 bg-white px-5 py-3 text-center text-xl font-black text-slate-950 shadow-xl outline-none transition-colors placeholder:text-slate-400 focus:ring-4 disabled:opacity-50 sm:text-2xl ${answerFlash?.kind === 'incorrect' ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200' : answerFlash?.kind === 'correct' ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200' : 'border-sky-400 focus:border-amber-400 focus:ring-amber-200'}`}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>
        </section>
      </main>
      <style jsx global>{`
        .water-waves {
          background-image:
            radial-gradient(ellipse at 15% 15%, rgba(255,255,255,.3) 0 3%, transparent 4%),
            repeating-linear-gradient(0deg, transparent 0 54px, rgba(255,255,255,.2) 55px 66px, transparent 67px 108px);
          background-size: 220px 120px, 100% 108px;
          animation: water-flow 2.4s linear infinite;
        }
        .water-glints {
          opacity: .45;
          background-image: radial-gradient(ellipse, rgba(255,255,255,.8) 0 18%, transparent 22%);
          background-size: 150px 78px;
          background-position: 0 10px;
          animation: glints-flow 4s linear infinite;
        }
        .finish-line {
          background-color: white;
          background-image:
            linear-gradient(45deg,#020617 25%,transparent 25%,transparent 75%,#020617 75%),
            linear-gradient(45deg,#020617 25%,transparent 25%,transparent 75%,#020617 75%);
          background-position: 0 0, 16px 16px;
          background-size: 32px 32px;
        }
        .duck-boost { transform-origin: 32px 82px; animation: duck-boost .16s ease-in-out infinite alternate; }
        .duck-wake span {
          position: absolute;
          left: 34px;
          top: 11px;
          width: 34px;
          height: 11px;
          border: 3px solid rgba(255,255,255,.75);
          border-left: 0;
          border-radius: 50%;
          animation: wake-trail .9s ease-out infinite;
        }
        .duck-wake span:nth-child(2) { animation-delay: -.3s; }
        .duck-wake span:nth-child(3) { animation-delay: -.6s; }
        .duck-wake-nitro span { animation-duration: .38s; border-color: rgba(186,230,253,.95); }
        .finish-badge {
          position: absolute;
          right: -8px;
          top: -18px;
          z-index: 40;
          display: grid;
          width: 40px;
          height: 40px;
          place-items: center;
          border: 3px solid #0f172a;
          border-radius: 9999px;
          background: #fde047;
          color: #0f172a;
          font-weight: 900;
          box-shadow: 0 4px 0 rgba(15,23,42,.35);
          animation: finish-pop .45s cubic-bezier(.2,1.7,.4,1);
        }
        
        /* New Duck Animations */
        @keyframes duck-bob {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-6px) rotate(2deg); }
        }
        @keyframes duck-dash {
          0%, 100% { transform: translateY(0) rotate(5deg) scale(1.1); }
          50% { transform: translateY(-4px) rotate(10deg) scale(1.15); }
        }
        @keyframes splash-wave {
          0% { opacity: 0.8; transform: scaleX(0.5) scaleY(1); }
          100% { opacity: 0; transform: scaleX(2.5) scaleY(1.5); }
        }
        @keyframes wake-trail {
          from { opacity: .9; transform: translate3d(10px,0,0) scale(.45); }
          to { opacity: 0; transform: translate3d(-48px,0,0) scale(1.4); }
        }
        @keyframes finish-pop {
          from { opacity: 0; transform: scale(.2) rotate(-18deg); }
          to { opacity: 1; transform: scale(1) rotate(0); }
        }
        .animate-duck-bob { animation: duck-bob ease-in-out infinite; }
        .animate-duck-dash { animation: duck-dash 0.4s ease-in-out infinite; }
        .splash-particle { animation: splash-wave 0.6s ease-out infinite; }
        
        @keyframes water-flow { from { background-position: 0 0, 0 0; } to { background-position: 220px 0, -180px 108px; } }
        @keyframes glints-flow { from { background-position: 0 10px; } to { background-position: -300px 88px; } }
        @keyframes duck-boost { from { transform: scaleX(.75); } to { transform: scaleX(1.3); } }
        .race-paused .water-waves,
        .race-paused .water-glints,
        .race-paused .animate-duck-bob,
        .race-paused .animate-duck-dash,
        .race-paused .duck-wake span,
        .race-paused .duck-boost,
        .race-paused .splash-particle { animation-play-state: paused !important; }
        @media (prefers-reduced-motion: reduce) { .water-waves, .water-glints, .duck-boost, .duck-wake span, .animate-duck-bob, .animate-duck-dash, .splash-particle { animation: none !important; } }
      `}</style>
    </div>
  );
}
