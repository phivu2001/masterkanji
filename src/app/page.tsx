"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { HomeDashboard } from '@/components/HomeDashboard';
import { LessonLibrary } from '@/components/LessonLibrary';
import { QuizScreen } from '@/components/QuizScreen';
import { SearchModal } from '@/components/SearchModal';
import { StudyScreen } from '@/components/StudyScreen';
import { kanjiData } from '@/data/kanji';
import type { KanjiInfo } from '@/data/kanji';
import { getJlptLessons, getJlptStudyOrder } from '@/data/jlptCore';
import type { JLPTLevel } from '@/data/jlptCore';
import { useStudyStore } from '@/hooks/useStudyStore';
import { isDue, type PersonalSet, type ReviewQuality } from '@/lib/study';

type AppView = 'home' | 'lessons' | 'study' | 'quiz';
type StudySource = 'lesson' | 'review' | 'favorites' | 'personal' | 'search' | 'filtered';
type StudySession = { ids: string[]; label: string; source: StudySource; lessonIndex: number | null };
type QuizSession = { pool: KanjiInfo[]; mode: 'practice' | 'exam'; questionCount?: number; title?: string };
type RouteLesson = { level: JLPTLevel; title: string; items: KanjiInfo[] };

const kanjiById = new Map(kanjiData.map((item) => [item.id, item]));
const kanjiByCharacter = new Map(kanjiData.map((item) => [item.kanji, item]));

const getRouteLessons = (level: JLPTLevel, n4Only: boolean): RouteLesson[] => getJlptLessons(level, n4Only)
  .map((lesson) => ({
    level: lesson.level,
    title: lesson.title,
    items: lesson.characters.map((character) => kanjiByCharacter.get(character)).filter((item): item is KanjiInfo => Boolean(item)),
  }))
  .filter((lesson) => lesson.items.length > 0);

export default function Home() {
  const store = useStudyStore();
  const [view, setView] = useState<AppView>('home');
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>('N5');
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notice, setNotice] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  const routeLessons = useMemo(() => getRouteLessons(selectedLevel, store.settings.n4Only), [selectedLevel, store.settings.n4Only]);
  const routeData = useMemo(() => routeLessons.flatMap((lesson) => lesson.items), [routeLessons]);
  const totalLessons = routeLessons.length;
  const sessionItems = useMemo(() => (studySession?.ids ?? []).map((id) => kanjiById.get(id)).filter((item): item is KanjiInfo => Boolean(item)), [studySession]);
  const allCoreData = useMemo(() => getJlptStudyOrder('N4').map((character) => kanjiByCharacter.get(character)).filter((item): item is KanjiInfo => Boolean(item)), []);
  const dashboardStats = useMemo(() => ({
    learned: allCoreData.filter((item) => store.progress[item.id]?.status === 'learned').length,
    learning: allCoreData.filter((item) => store.progress[item.id]?.status === 'learning').length,
    hard: allCoreData.filter((item) => store.progress[item.id]?.status === 'hard').length,
    due: allCoreData.filter((item) => isDue(store.progress[item.id])).length,
  }), [allCoreData, store.progress]);
  const hardestKanji = useMemo(() => allCoreData
    .map((item) => ({ id: item.id, kanji: item.kanji, hanviet: item.hanviet, incorrect: store.progress[item.id]?.incorrectCount ?? 0 }))
    .filter((item) => item.incorrect > 0)
    .sort((a, b) => b.incorrect - a.incorrect)
    .slice(0, 5), [allCoreData, store.progress]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const dark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(dark);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3_500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!store.settings.reminderEnabled || !('Notification' in window)) return;
    const notifyIfNeeded = () => {
      if (Notification.permission !== 'granted' || new Date().getHours() !== store.settings.reminderHour) return;
      const reminderKey = `kanjiReminder-${new Date().toISOString().slice(0, 10)}`;
      if (localStorage.getItem(reminderKey) || dashboardStats.due === 0) return;
      new Notification('KanjiMaster', { body: `Bạn có ${dashboardStats.due} chữ Kanji đến hạn ôn.`, icon: '/icon.svg' });
      localStorage.setItem(reminderKey, 'sent');
    };
    notifyIfNeeded();
    const timer = window.setInterval(notifyIfNeeded, 60_000);
    return () => window.clearInterval(timer);
  }, [dashboardStats.due, store.settings.reminderEnabled, store.settings.reminderHour]);

  const selectLevel = (level: JLPTLevel) => {
    setSelectedLevel(level);
    setSelectedLesson(null);
    setView('lessons');
  };

  const openLesson = (lessonIndex: number, filteredIds?: string[], startIndex = 0) => {
    const lessons = getRouteLessons(selectedLevel, store.settings.n4Only);
    const lesson = lessons[lessonIndex];
    if (!lesson) {
      setNotice('Không tìm thấy bài học này.');
      return;
    }
    const ids = filteredIds?.length ? filteredIds : lesson.items.map((item) => item.id);
    setSelectedLesson(lessonIndex);
    setStudySession({ ids, label: filteredIds?.length ? `Bộ lọc • ${lesson.title}` : `${lesson.level} • ${lesson.title}`, source: filteredIds?.length ? 'filtered' : 'lesson', lessonIndex });
    const safeIndex = Math.min(Math.max(0, startIndex), Math.max(0, ids.length - 1));
    setCurrentIndex(safeIndex);
    store.saveLastPosition({ level: selectedLevel, lesson: lessonIndex, index: safeIndex });
    setView('study');
  };

  const startSession = (ids: string[], label: string, source: StudySource) => {
    if (ids.length === 0) {
      setNotice('Bộ này chưa có Kanji để học.');
      return;
    }
    setStudySession({ ids, label, source, lessonIndex: null });
    setSelectedLesson(null);
    setCurrentIndex(0);
    setView('study');
  };

  const continueLearning = () => {
    const position = store.lastPosition;
    if (!position) return;
    setSelectedLevel(position.level);
    const lessons = getRouteLessons(position.level, store.settings.n4Only);
    if (lessons.length === 0) return;
    const lessonIndex = Math.min(position.lesson, lessons.length - 1);
    const lesson = lessons[lessonIndex];
    setSelectedLesson(lessonIndex);
    setStudySession({ ids: lesson.items.map((item) => item.id), label: `${lesson.level} • ${lesson.title}`, source: 'lesson', lessonIndex });
    setCurrentIndex(Math.min(position.index, Math.max(0, lesson.items.length - 1)));
    setView('study');
  };

  const startFavorites = () => startSession(store.favorites, 'Kanji yêu thích', 'favorites');
  const startPersonalSet = (set: PersonalSet) => startSession(set.kanjiIds, set.name, 'personal');
  const startReview = (ids: string[]) => startSession(ids, 'Ôn tập SRS', 'review');

  const moveToIndex = (nextIndex: number) => {
    if (!studySession || sessionItems.length === 0) return;
    const safeIndex = Math.min(Math.max(0, nextIndex), sessionItems.length - 1);
    setCurrentIndex(safeIndex);
    if (studySession.source === 'lesson' && studySession.lessonIndex !== null) store.saveLastPosition({ level: selectedLevel, lesson: studySession.lessonIndex, index: safeIndex });
  };

  const nextKanji = () => {
    if (currentIndex < sessionItems.length - 1) {
      moveToIndex(currentIndex + 1);
    } else if (studySession?.source === 'lesson' && selectedLesson !== null && selectedLesson < totalLessons - 1) {
      openLesson(selectedLesson + 1);
    } else {
      setNotice('Bạn đã hoàn thành phiên học này.');
    }
  };

  const rateCurrentKanji = (quality: ReviewQuality) => {
    const item = sessionItems[currentIndex];
    if (!item || !studySession) return;
    store.reviewKanji(item.id, quality);
    if (studySession.source === 'review') {
      const remaining = studySession.ids.filter((id) => id !== item.id);
      if (remaining.length === 0) {
        setNotice('Đã hoàn thành toàn bộ chữ đến hạn ôn.');
        setView('lessons');
        setStudySession(null);
        return;
      }
      setStudySession({ ...studySession, ids: remaining });
      setCurrentIndex(Math.min(currentIndex, remaining.length - 1));
      return;
    }
    nextKanji();
  };

  const startQuiz = (pool: KanjiInfo[], mode: 'practice' | 'exam', questionCount?: number, title?: string) => {
    if (pool.length < 4) {
      setNotice('Cần ít nhất 4 chữ Kanji để tạo Quiz.');
      return;
    }
    setQuizSession({ pool, mode, questionCount, title });
    setView('quiz');
  };

  const completeQuiz = (result: { score: number; total: number; wrongIds: string[] }) => {
    store.addQuizHistory({ level: selectedLevel, score: result.score, total: result.total, mode: quizSession?.mode ?? 'practice' });
    result.wrongIds.forEach((id) => store.reviewKanji(id, 'again'));
  };

  const openSearchResult = (item: KanjiInfo) => {
    setSelectedLevel(item.level);
    setStudySession({ ids: [item.id], label: item.isSupplemental ? 'Kanji mở rộng' : 'Kết quả tra cứu', source: 'search', lessonIndex: null });
    setSelectedLesson(null);
    setCurrentIndex(0);
    setShowSearch(false);
    setView('study');
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(store.createBackup(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `kanjimaster-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      ['Kanji', 'Hán Việt', 'Nghĩa', 'Onyomi', 'Kunyomi', 'Từ vựng', 'Cấp độ'],
      ...allCoreData.map((item) => [item.kanji, item.hanviet, item.meaning, item.onyomi, item.kunyomi, item.vocabularies.map((vocabulary) => `${vocabulary.kanji}: ${vocabulary.meaning}`).join(' | '), item.level]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(escapeCell).join(',')).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'kanjimaster-anki.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = async (file: File | undefined) => {
    if (!file) return;
    try {
      store.restoreBackup(JSON.parse(await file.text()));
      setNotice('Đã khôi phục dữ liệu học tập thành công.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không thể đọc tệp sao lưu.');
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const enableReminder = async () => {
    if (!('Notification' in window)) {
      setNotice('Trình duyệt này không hỗ trợ thông báo.');
      return;
    }
    const permission = await Notification.requestPermission();
    store.updateSettings({ reminderEnabled: permission === 'granted' });
    if (permission !== 'granted') setNotice('Bạn cần cho phép thông báo để bật nhắc học.');
  };

  if (!store.hydrated) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500"><i className="fas fa-circle-notch fa-spin mr-2"></i>Đang tải bàn học...</div>;

  let content;
  if (view === 'home') {
    content = <HomeDashboard {...dashboardStats} streak={store.streak} todayLearned={store.todayActivity.newLearned} lastPosition={store.lastPosition} settings={store.settings} personalSets={store.personalSets} favoriteCount={store.favorites.length} quizHistory={store.quizHistory} hardest={hardestKanji} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode((value) => !value)} onSelectLevel={selectLevel} onContinue={continueLearning} onUpdateSettings={store.updateSettings} onCreateSet={store.createSet} onRenameSet={store.renameSet} onDeleteSet={store.deleteSet} onStartSet={startPersonalSet} onStartFavorites={startFavorites} onExport={exportBackup} onExportCsv={exportCsv} onImport={() => importInputRef.current?.click()} onEnableReminder={enableReminder} />;
  } else if (view === 'lessons') {
    content = <LessonLibrary level={selectedLevel} levelData={routeData} lessonGroups={routeLessons} progress={store.progress} favorites={store.favorites} onBack={() => setView('home')} onSearch={() => setShowSearch(true)} onStartLesson={openLesson} onStartReview={startReview} onStartQuiz={startQuiz} />;
  } else if (view === 'quiz' && quizSession) {
    content = <QuizScreen pool={quizSession.pool} level={selectedLevel} mode={quizSession.mode} requestedQuestionCount={quizSession.questionCount} title={quizSession.title} settings={store.settings} onExit={() => { setQuizSession(null); setView('lessons'); }} onComplete={completeQuiz} />;
  } else if (studySession && sessionItems.length > 0) {
    content = <StudyScreen items={sessionItems} currentIndex={currentIndex} sessionLabel={studySession.label} lessonNumber={studySession.lessonIndex === null ? null : studySession.lessonIndex + 1} totalLessons={totalLessons} progress={store.progress} settings={store.settings} favorites={store.favorites} personalSets={store.personalSets} writingScores={store.writingScores} isReview={studySession.source === 'review'} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode((value) => !value)} onBackToLessons={() => setView('lessons')} onHome={() => setView('home')} onSearch={() => setShowSearch(true)} onPrevious={() => moveToIndex(currentIndex - 1)} onNext={nextKanji} onPreviousLesson={() => { if (selectedLesson !== null && selectedLesson > 0) openLesson(selectedLesson - 1); }} onNextLesson={() => { if (selectedLesson !== null && selectedLesson < totalLessons - 1) openLesson(selectedLesson + 1); }} onSelectIndex={moveToIndex} onRate={rateCurrentKanji} onToggleFavorite={store.toggleFavorite} onToggleSet={store.toggleKanjiInSet} onSaveWritingScore={store.saveWritingScore} />;
  } else {
    content = <LessonLibrary level={selectedLevel} levelData={routeData} lessonGroups={routeLessons} progress={store.progress} favorites={store.favorites} onBack={() => setView('home')} onSearch={() => setShowSearch(true)} onStartLesson={openLesson} onStartReview={startReview} onStartQuiz={startQuiz} />;
  }

  return <>{content}<SearchModal open={showSearch} data={kanjiData} favorites={store.favorites} onClose={() => setShowSearch(false)} onOpenKanji={openSearchResult} onToggleFavorite={store.toggleFavorite} />{notice && <div role="status" className="fixed z-[120] bottom-5 left-1/2 -translate-x-1/2 max-w-[90vw] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl shadow-2xl font-bold text-sm"><i className="fas fa-circle-check text-green-400 mr-2"></i>{notice}</div>}<input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={(event) => importBackup(event.target.files?.[0])} /></>;
}
