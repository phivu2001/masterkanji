import type { JLPTLevel } from '@/data/jlptCore';

export type ProgressStatus = 'learned' | 'learning' | 'hard';
export type ReviewQuality = 'again' | 'hard' | 'good';

export type StudyRecord = {
  status: ProgressStatus;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  dueAt: string;
  lastReviewedAt: string | null;
  firstLearnedAt: string | null;
  correctCount: number;
  incorrectCount: number;
  lapses: number;
};

export type StudyProgress = Record<string, StudyRecord>;

export type StudySettings = {
  dailyGoal: number;
  hideRomaji: boolean;
  n4Only: boolean;
  reminderEnabled: boolean;
  reminderHour: number;
  speechRate: number;
  examQuestionCount: number;
  examMinutes: number;
};

export type LastPosition = {
  level: JLPTLevel;
  lesson: number;
  index: number;
  updatedAt: string;
};

export type ActivityDay = {
  reviewed: number;
  newLearned: number;
  correct: number;
  incorrect: number;
};

export type ActivityLog = Record<string, ActivityDay>;

export type PersonalSet = {
  id: string;
  name: string;
  kanjiIds: string[];
  createdAt: string;
};

export type WritingScore = {
  bestScore: number;
  attempts: number;
  lastScore: number;
  updatedAt: string;
};

export type QuizHistoryItem = {
  id: string;
  level: JLPTLevel;
  score: number;
  total: number;
  mode: 'practice' | 'exam';
  scope?: 'kanji' | 'vocabulary';
  completedAt: string;
};

export type StudyBackup = {
  version: 2;
  exportedAt: string;
  progress: StudyProgress;
  vocabularyProgress?: StudyProgress;
  settings: StudySettings;
  favorites: string[];
  personalSets: PersonalSet[];
  activity: ActivityLog;
  lastPosition: LastPosition | null;
  writingScores: Record<string, WritingScore>;
  quizHistory: QuizHistoryItem[];
};

export const DEFAULT_SETTINGS: StudySettings = {
  dailyGoal: 10,
  hideRomaji: false,
  n4Only: false,
  reminderEnabled: false,
  reminderHour: 19,
  speechRate: 0.8,
  examQuestionCount: 20,
  examMinutes: 15,
};

const DAY_MS = 86_400_000;

export const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const createStudyRecord = (status: ProgressStatus = 'learning', now = new Date()): StudyRecord => ({
  status,
  repetitions: status === 'learned' ? 2 : 0,
  intervalDays: status === 'learned' ? 7 : 0,
  easeFactor: 2.5,
  dueAt: new Date(now.getTime() + (status === 'learned' ? 7 * DAY_MS : 0)).toISOString(),
  lastReviewedAt: null,
  firstLearnedAt: status === 'learned' ? now.toISOString() : null,
  correctCount: 0,
  incorrectCount: 0,
  lapses: 0,
});

export const normalizeStudyRecord = (value: unknown, now = new Date()): StudyRecord => {
  if (!value || typeof value !== 'object') return createStudyRecord('learning', now);
  const candidate = value as Partial<StudyRecord> & { status?: ProgressStatus };
  const status: ProgressStatus = candidate.status === 'learned' || candidate.status === 'hard'
    ? candidate.status
    : 'learning';
  const fallback = createStudyRecord(status, now);

  return {
    status,
    repetitions: Number.isFinite(candidate.repetitions) ? Math.max(0, Number(candidate.repetitions)) : fallback.repetitions,
    intervalDays: Number.isFinite(candidate.intervalDays) ? Math.max(0, Number(candidate.intervalDays)) : fallback.intervalDays,
    easeFactor: Number.isFinite(candidate.easeFactor) ? Math.min(3, Math.max(1.3, Number(candidate.easeFactor))) : fallback.easeFactor,
    dueAt: typeof candidate.dueAt === 'string' ? candidate.dueAt : fallback.dueAt,
    lastReviewedAt: typeof candidate.lastReviewedAt === 'string' ? candidate.lastReviewedAt : null,
    firstLearnedAt: typeof candidate.firstLearnedAt === 'string' ? candidate.firstLearnedAt : fallback.firstLearnedAt,
    correctCount: Number.isFinite(candidate.correctCount) ? Math.max(0, Number(candidate.correctCount)) : 0,
    incorrectCount: Number.isFinite(candidate.incorrectCount) ? Math.max(0, Number(candidate.incorrectCount)) : 0,
    lapses: Number.isFinite(candidate.lapses) ? Math.max(0, Number(candidate.lapses)) : 0,
  };
};

export const normalizeProgress = (value: unknown): StudyProgress => {
  if (!value || typeof value !== 'object') return {};
  const now = new Date();
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([id, record]) => [id, normalizeStudyRecord(record, now)]),
  );
};

export const scheduleReview = (
  current: StudyRecord | undefined,
  quality: ReviewQuality,
  now = new Date(),
): StudyRecord => {
  const record = current ? normalizeStudyRecord(current, now) : createStudyRecord('learning', now);
  let intervalDays = record.intervalDays;
  let repetitions = record.repetitions;
  let easeFactor = record.easeFactor;
  let status: ProgressStatus = record.status;
  let correctCount = record.correctCount;
  let incorrectCount = record.incorrectCount;
  let lapses = record.lapses;

  if (quality === 'again') {
    intervalDays = 10 / 1_440;
    repetitions = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    status = 'hard';
    incorrectCount += 1;
    lapses += 1;
  } else if (quality === 'hard') {
    intervalDays = repetitions === 0 ? 1 : Math.max(1, Math.round(Math.max(1, intervalDays) * 1.2));
    repetitions += 1;
    easeFactor = Math.max(1.3, easeFactor - 0.15);
    status = 'learning';
    correctCount += 1;
  } else {
    intervalDays = repetitions === 0 ? 1 : repetitions === 1 ? 3 : Math.max(4, Math.round(intervalDays * easeFactor));
    repetitions += 1;
    easeFactor = Math.min(3, easeFactor + 0.05);
    status = repetitions >= 2 ? 'learned' : 'learning';
    correctCount += 1;
  }

  return {
    ...record,
    status,
    repetitions,
    intervalDays,
    easeFactor,
    dueAt: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    lastReviewedAt: now.toISOString(),
    firstLearnedAt: record.firstLearnedAt ?? now.toISOString(),
    correctCount,
    incorrectCount,
    lapses,
  };
};

export const isDue = (record: StudyRecord | undefined, now = new Date()) => (
  Boolean(record?.dueAt) && new Date(record!.dueAt).getTime() <= now.getTime()
);

export const formatDue = (record: StudyRecord | undefined, now = new Date()) => {
  if (!record) return 'Chưa lên lịch';
  const due = new Date(record.dueAt);
  const diff = due.getTime() - now.getTime();
  if (diff <= 0) return 'Đến hạn ôn';
  if (diff < 60 * 60 * 1_000) return `Sau ${Math.max(1, Math.round(diff / 60_000))} phút`;
  if (diff < DAY_MS) return `Sau ${Math.max(1, Math.round(diff / 3_600_000))} giờ`;
  return due.toLocaleDateString('vi-VN');
};

export const calculateStreak = (activity: ActivityLog, today = new Date()) => {
  let streak = 0;
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  while (true) {
    const day = activity[localDateKey(cursor)];
    if (!day || day.reviewed <= 0) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const withoutRomaji = (text: string, hide: boolean) => (
  hide ? text.replace(/\s*\([^)]*\)/g, '').trim() : text
);

export const isStudyBackup = (value: unknown): value is StudyBackup => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<StudyBackup>;
  return candidate.version === 2
    && Boolean(candidate.progress && typeof candidate.progress === 'object')
    && Boolean(candidate.settings && typeof candidate.settings === 'object')
    && Array.isArray(candidate.favorites)
    && Array.isArray(candidate.personalSets);
};
