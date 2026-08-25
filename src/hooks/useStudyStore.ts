"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  calculateStreak,
  isStudyBackup,
  localDateKey,
  normalizeProgress,
  scheduleReview,
  type ActivityLog,
  type LastPosition,
  type PersonalSet,
  type QuizHistoryItem,
  type ReviewQuality,
  type StudyBackup,
  type StudyProgress,
  type StudySettings,
  type WritingScore,
} from '@/lib/study';

const STORAGE = {
  progress: 'kanjiProgress',
  settings: 'kanjiSettingsV2',
  favorites: 'kanjiFavorites',
  sets: 'kanjiPersonalSets',
  activity: 'kanjiActivity',
  lastPosition: 'kanjiLastPosition',
  writing: 'kanjiWritingScores',
  quizHistory: 'kanjiQuizHistory',
} as const;

const DEFAULT_SET: PersonalSet = {
  id: 'weekly-review',
  name: 'Ôn tuần này',
  kanjiIds: [],
  createdAt: new Date(0).toISOString(),
};

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
};

const persist = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export function useStudyStore() {
  const [hydrated, setHydrated] = useState(false);
  const [progress, setProgress] = useState<StudyProgress>({});
  const [settings, setSettings] = useState<StudySettings>(DEFAULT_SETTINGS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [personalSets, setPersonalSets] = useState<PersonalSet[]>([DEFAULT_SET]);
  const [activity, setActivity] = useState<ActivityLog>({});
  const [lastPosition, setLastPositionState] = useState<LastPosition | null>(null);
  const [writingScores, setWritingScores] = useState<Record<string, WritingScore>>({});
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);

  const loadFromStorage = useCallback(() => {
    setProgress(normalizeProgress(readJson<unknown>(STORAGE.progress, {})));
    setSettings({ ...DEFAULT_SETTINGS, ...readJson<Partial<StudySettings>>(STORAGE.settings, {}) });
    setFavorites(readJson<string[]>(STORAGE.favorites, []));
    const storedSets = readJson<PersonalSet[]>(STORAGE.sets, []);
    setPersonalSets(storedSets.length > 0 ? storedSets : [DEFAULT_SET]);
    setActivity(readJson<ActivityLog>(STORAGE.activity, {}));
    setLastPositionState(readJson<LastPosition | null>(STORAGE.lastPosition, null));
    setWritingScores(readJson<Record<string, WritingScore>>(STORAGE.writing, {}));
    setQuizHistory(readJson<QuizHistoryItem[]>(STORAGE.quizHistory, []));
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      loadFromStorage();
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [loadFromStorage]);

  useEffect(() => {
    if (!('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel('kanji-master-sync');
    channel.onmessage = () => loadFromStorage();
    return () => channel.close();
  }, [loadFromStorage]);

  const announceChange = useCallback(() => {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('kanji-master-sync');
      channel.postMessage('updated');
      channel.close();
    }
  }, []);

  const reviewKanji = useCallback((id: string, quality: ReviewQuality) => {
    const now = new Date();
    const wasNew = !progress[id]?.firstLearnedAt;
    setProgress((current) => {
      const updated = { ...current, [id]: scheduleReview(current[id], quality, now) };
      persist(STORAGE.progress, updated);
      return updated;
    });
    setActivity((current) => {
      const key = localDateKey(now);
      const day = current[key] ?? { reviewed: 0, newLearned: 0, correct: 0, incorrect: 0 };
      const updated = {
        ...current,
        [key]: {
          reviewed: day.reviewed + 1,
          newLearned: day.newLearned + (wasNew ? 1 : 0),
          correct: day.correct + (quality === 'again' ? 0 : 1),
          incorrect: day.incorrect + (quality === 'again' ? 1 : 0),
        },
      };
      persist(STORAGE.activity, updated);
      return updated;
    });
    announceChange();
  }, [announceChange, progress]);

  const updateSettings = useCallback((patch: Partial<StudySettings>) => {
    setSettings((current) => {
      const updated = { ...current, ...patch };
      persist(STORAGE.settings, updated);
      return updated;
    });
    announceChange();
  }, [announceChange]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => {
      const updated = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      persist(STORAGE.favorites, updated);
      return updated;
    });
    announceChange();
  }, [announceChange]);

  const createSet = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPersonalSets((current) => {
      const updated = [
        ...current,
        { id: `set-${Date.now()}`, name: trimmed, kanjiIds: [], createdAt: new Date().toISOString() },
      ];
      persist(STORAGE.sets, updated);
      return updated;
    });
    announceChange();
  }, [announceChange]);

  const renameSet = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPersonalSets((current) => {
      const updated = current.map((set) => set.id === id ? { ...set, name: trimmed } : set);
      persist(STORAGE.sets, updated);
      return updated;
    });
    announceChange();
  }, [announceChange]);

  const deleteSet = useCallback((id: string) => {
    setPersonalSets((current) => {
      const updated = current.filter((set) => set.id !== id);
      const safeUpdated = updated.length > 0 ? updated : [DEFAULT_SET];
      persist(STORAGE.sets, safeUpdated);
      return safeUpdated;
    });
    announceChange();
  }, [announceChange]);

  const toggleKanjiInSet = useCallback((setId: string, kanjiId: string) => {
    setPersonalSets((current) => {
      const updated = current.map((set) => {
        if (set.id !== setId) return set;
        return {
          ...set,
          kanjiIds: set.kanjiIds.includes(kanjiId)
            ? set.kanjiIds.filter((id) => id !== kanjiId)
            : [...set.kanjiIds, kanjiId],
        };
      });
      persist(STORAGE.sets, updated);
      return updated;
    });
    announceChange();
  }, [announceChange]);

  const saveLastPosition = useCallback((position: Omit<LastPosition, 'updatedAt'>) => {
    const updated = { ...position, updatedAt: new Date().toISOString() };
    setLastPositionState(updated);
    persist(STORAGE.lastPosition, updated);
  }, []);

  const saveWritingScore = useCallback((id: string, score: number) => {
    setWritingScores((current) => {
      const previous = current[id];
      const updated = {
        ...current,
        [id]: {
          bestScore: Math.max(score, previous?.bestScore ?? 0),
          attempts: (previous?.attempts ?? 0) + 1,
          lastScore: score,
          updatedAt: new Date().toISOString(),
        },
      };
      persist(STORAGE.writing, updated);
      return updated;
    });
    announceChange();
  }, [announceChange]);

  const addQuizHistory = useCallback((item: Omit<QuizHistoryItem, 'id' | 'completedAt'>) => {
    setQuizHistory((current) => {
      const updated = [
        { ...item, id: `quiz-${Date.now()}`, completedAt: new Date().toISOString() },
        ...current,
      ].slice(0, 30);
      persist(STORAGE.quizHistory, updated);
      return updated;
    });
    announceChange();
  }, [announceChange]);

  const createBackup = useCallback((): StudyBackup => ({
    version: 2,
    exportedAt: new Date().toISOString(),
    progress,
    settings,
    favorites,
    personalSets,
    activity,
    lastPosition,
    writingScores,
    quizHistory,
  }), [activity, favorites, lastPosition, personalSets, progress, quizHistory, settings, writingScores]);

  const restoreBackup = useCallback((value: unknown) => {
    if (!isStudyBackup(value)) throw new Error('Tệp sao lưu không đúng định dạng KanjiMaster phiên bản 2.');
    const restoredProgress = normalizeProgress(value.progress);
    const restoredSettings = { ...DEFAULT_SETTINGS, ...value.settings };
    setProgress(restoredProgress);
    setSettings(restoredSettings);
    setFavorites(value.favorites);
    setPersonalSets(value.personalSets.length > 0 ? value.personalSets : [DEFAULT_SET]);
    setActivity(value.activity ?? {});
    setLastPositionState(value.lastPosition ?? null);
    setWritingScores(value.writingScores ?? {});
    setQuizHistory(value.quizHistory ?? []);
    persist(STORAGE.progress, restoredProgress);
    persist(STORAGE.settings, restoredSettings);
    persist(STORAGE.favorites, value.favorites);
    persist(STORAGE.sets, value.personalSets.length > 0 ? value.personalSets : [DEFAULT_SET]);
    persist(STORAGE.activity, value.activity ?? {});
    persist(STORAGE.lastPosition, value.lastPosition ?? null);
    persist(STORAGE.writing, value.writingScores ?? {});
    persist(STORAGE.quizHistory, value.quizHistory ?? []);
    announceChange();
  }, [announceChange]);

  const todayActivity = activity[localDateKey()] ?? { reviewed: 0, newLearned: 0, correct: 0, incorrect: 0 };
  const streak = useMemo(() => calculateStreak(activity), [activity]);

  return {
    hydrated,
    progress,
    settings,
    favorites,
    personalSets,
    activity,
    todayActivity,
    streak,
    lastPosition,
    writingScores,
    quizHistory,
    reviewKanji,
    updateSettings,
    toggleFavorite,
    createSet,
    renameSet,
    deleteSet,
    toggleKanjiInSet,
    saveLastPosition,
    saveWritingScore,
    addQuizHistory,
    createBackup,
    restoreBackup,
  };
}
