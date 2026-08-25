"use client";

import { useMemo, useState } from 'react';
import type { KanjiInfo } from '@/data/kanji';
import type { JLPTLevel } from '@/data/jlptCore';
import { isDue, type StudyProgress } from '@/lib/study';

type LessonFilter = 'all' | 'new' | 'learning' | 'hard' | 'learned' | 'due' | 'favorite';

type Props = {
  level: JLPTLevel;
  levelData: KanjiInfo[];
  progress: StudyProgress;
  favorites: string[];
  onBack: () => void;
  onSearch: () => void;
  onStartLesson: (lessonIndex: number, ids?: string[]) => void;
  onStartReview: (ids: string[]) => void;
  onStartQuiz: (pool: KanjiInfo[], mode: 'practice' | 'exam') => void;
};

const WORDS_PER_LESSON = 10;

const filters: { id: LessonFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'Tất cả', icon: 'fa-layer-group' },
  { id: 'new', label: 'Chưa học', icon: 'fa-circle' },
  { id: 'learning', label: 'Đang học', icon: 'fa-clock' },
  { id: 'hard', label: 'Hay sai', icon: 'fa-triangle-exclamation' },
  { id: 'learned', label: 'Đã thuộc', icon: 'fa-check-circle' },
  { id: 'due', label: 'Đến hạn', icon: 'fa-bell' },
  { id: 'favorite', label: 'Yêu thích', icon: 'fa-heart' },
];

export function LessonLibrary({ level, levelData, progress, favorites, onBack, onSearch, onStartLesson, onStartReview, onStartQuiz }: Props) {
  const [filter, setFilter] = useState<LessonFilter>('all');
  const lessons = useMemo(() => Array.from({ length: Math.ceil(levelData.length / WORDS_PER_LESSON) }, (_, index) => (
    levelData.slice(index * WORDS_PER_LESSON, (index + 1) * WORDS_PER_LESSON)
  )), [levelData]);
  const dueIds = levelData.filter((item) => isDue(progress[item.id])).map((item) => item.id);
  const learnedTotal = levelData.filter((item) => progress[item.id]?.status === 'learned').length;

  const matchesFilter = (item: KanjiInfo) => {
    const record = progress[item.id];
    if (filter === 'all') return true;
    if (filter === 'new') return !record;
    if (filter === 'due') return isDue(record);
    if (filter === 'favorite') return favorites.includes(item.id);
    return record?.status === filter;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 sm:p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} aria-label="Về bàn học" className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"><i className="fas fa-arrow-left"></i></button>
            <div><h1 className="text-2xl sm:text-3xl font-black">Lộ trình {level}</h1><p className="text-sm text-slate-500 dark:text-slate-400">{levelData.length} chữ • {lessons.length} bài</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onSearch} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"><i className="fas fa-search mr-2"></i>Tra cứu</button>
            <button disabled={dueIds.length === 0} onClick={() => onStartReview(dueIds)} className="px-4 py-2 bg-orange-500 text-white disabled:opacity-40 rounded-xl font-bold"><i className="fas fa-bell mr-2"></i>Ôn đến hạn ({dueIds.length})</button>
            <button onClick={() => onStartQuiz(levelData, 'exam')} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold"><i className="fas fa-stopwatch mr-2"></i>Thi thử</button>
          </div>
        </header>

        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-5 shadow-sm">
          <div className="flex justify-between text-sm mb-2"><span className="font-bold">Tiến độ {level}</span><span>{learnedTotal}/{levelData.length} đã thuộc</span></div>
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-red-500 to-orange-400" style={{ width: `${(learnedTotal / Math.max(1, levelData.length)) * 100}%` }} /></div>
        </section>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-3" aria-label="Bộ lọc bài học">
          {filters.map((item) => <button key={item.id} onClick={() => setFilter(item.id)} className={`shrink-0 px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${filter === item.id ? 'bg-red-500 border-red-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}><i className={`fas ${item.icon} mr-2`}></i>{item.label}</button>)}
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson, index) => {
            const filteredItems = lesson.filter(matchesFilter);
            if (filteredItems.length === 0) return null;
            const learned = lesson.filter((item) => progress[item.id]?.status === 'learned').length;
            const due = lesson.filter((item) => isDue(progress[item.id])).length;
            return (
              <article key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4"><div><h2 className="text-lg font-black">Bài {index + 1}</h2><p className="text-xs text-slate-500 dark:text-slate-400">{learned}/{lesson.length} thuộc {due > 0 && `• ${due} đến hạn`}</p></div><span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">{filteredItems.length} chữ</span></div>
                <div className="font-japanese text-3xl tracking-wider text-slate-500 dark:text-slate-300 truncate mb-5">{filteredItems.map((item) => item.kanji).join('')}</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => onStartLesson(index, filter === 'all' ? undefined : filteredItems.map((item) => item.id))} className="py-2 bg-red-500 text-white rounded-lg font-bold"><i className="fas fa-book-open mr-2"></i>Học</button>
                  <button onClick={() => onStartQuiz(filteredItems, 'practice')} className="py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-bold"><i className="fas fa-list-check mr-2"></i>Quiz</button>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
