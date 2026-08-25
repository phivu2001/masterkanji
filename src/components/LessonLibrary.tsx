"use client";

import { useMemo, useState } from 'react';
import type { KanjiInfo } from '@/data/kanji';
import type { JLPTLevel } from '@/data/jlptCore';
import { isDue, type StudyProgress } from '@/lib/study';

type LessonFilter = 'all' | 'new' | 'learning' | 'hard' | 'learned' | 'due' | 'favorite';

type Props = {
  level: JLPTLevel;
  levelData: KanjiInfo[];
  lessonGroups: { level: JLPTLevel; title: string; items: KanjiInfo[] }[];
  progress: StudyProgress;
  favorites: string[];
  onBack: () => void;
  onSearch: () => void;
  onStartLesson: (lessonIndex: number, ids?: string[]) => void;
  onStartReview: (ids: string[]) => void;
  onStartQuiz: (pool: KanjiInfo[], mode: 'practice' | 'exam', questionCount?: number, title?: string) => void;
};

const filters: { id: LessonFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'Tất cả', icon: 'fa-layer-group' },
  { id: 'new', label: 'Chưa học', icon: 'fa-circle' },
  { id: 'learning', label: 'Đang học', icon: 'fa-clock' },
  { id: 'hard', label: 'Hay sai', icon: 'fa-triangle-exclamation' },
  { id: 'learned', label: 'Đã thuộc', icon: 'fa-check-circle' },
  { id: 'due', label: 'Đến hạn', icon: 'fa-bell' },
  { id: 'favorite', label: 'Yêu thích', icon: 'fa-heart' },
];

export function LessonLibrary({ level, levelData, lessonGroups, progress, favorites, onBack, onSearch, onStartLesson, onStartReview, onStartQuiz }: Props) {
  const [filter, setFilter] = useState<LessonFilter>('all');
  const [multiQuizOpen, setMultiQuizOpen] = useState(false);
  const [selectedLessonIndexes, setSelectedLessonIndexes] = useState<number[]>([]);
  const [multiQuizCount, setMultiQuizCount] = useState(20);
  const selectedPool = useMemo(() => selectedLessonIndexes.flatMap((index) => lessonGroups[index]?.items ?? []), [lessonGroups, selectedLessonIndexes]);
  const selectedQuestionCount = Math.min(multiQuizCount, Math.max(4, selectedPool.length));
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

  const openMultiQuiz = () => {
    setFilter('all');
    setSelectedLessonIndexes([]);
    setMultiQuizCount(20);
    setMultiQuizOpen(true);
  };

  const closeMultiQuiz = () => {
    setMultiQuizOpen(false);
    setSelectedLessonIndexes([]);
  };

  const toggleLesson = (lessonIndex: number) => {
    setSelectedLessonIndexes((selected) => selected.includes(lessonIndex)
      ? selected.filter((index) => index !== lessonIndex)
      : [...selected, lessonIndex].sort((left, right) => left - right));
  };

  const startMultiQuiz = () => {
    if (selectedLessonIndexes.length < 2 || selectedPool.length < 4) return;
    onStartQuiz(selectedPool, 'practice', Math.min(selectedQuestionCount, selectedPool.length), `Quiz ${selectedLessonIndexes.length} bài theo chủ đề • ${level}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 sm:p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} aria-label="Về bàn học" className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"><i className="fas fa-arrow-left"></i></button>
            <div><h1 className="text-2xl sm:text-3xl font-black">Lộ trình {level}</h1><p className="text-sm text-slate-500 dark:text-slate-400">{levelData.length} chữ • {lessonGroups.length} bài theo chủ đề</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onSearch} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"><i className="fas fa-search mr-2"></i>Tra cứu</button>
            <button disabled={dueIds.length === 0} onClick={() => onStartReview(dueIds)} className="px-4 py-2 bg-orange-500 text-white disabled:opacity-40 rounded-xl font-bold"><i className="fas fa-bell mr-2"></i>Ôn đến hạn ({dueIds.length})</button>
            <button onClick={multiQuizOpen ? closeMultiQuiz : openMultiQuiz} aria-pressed={multiQuizOpen} className={`px-4 py-2 rounded-xl font-bold ${multiQuizOpen ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-blue-600 text-white'}`}><i className={`fas ${multiQuizOpen ? 'fa-xmark' : 'fa-layer-group'} mr-2`}></i>{multiQuizOpen ? 'Hủy chọn bài' : 'Quiz nhiều bài'}</button>
            <button onClick={() => onStartQuiz(levelData, 'exam')} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold"><i className="fas fa-stopwatch mr-2"></i>Thi thử</button>
          </div>
        </header>

        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-5 shadow-sm">
          <div className="flex justify-between text-sm mb-2"><span className="font-bold">Tiến độ {level}</span><span>{learnedTotal}/{levelData.length} đã thuộc</span></div>
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-red-500 to-orange-400" style={{ width: `${(learnedTotal / Math.max(1, levelData.length)) * 100}%` }} /></div>
        </section>

        {multiQuizOpen ? (
          <section aria-labelledby="multi-quiz-title" className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 mb-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <h2 id="multi-quiz-title" className="text-lg font-black text-blue-900 dark:text-blue-100">Chọn các bài muốn làm Quiz</h2>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{selectedLessonIndexes.length} bài • {selectedPool.length} chữ đã chọn. Chọn ít nhất 2 bài.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={() => setSelectedLessonIndexes(lessonGroups.map((_, index) => index))} className="px-3 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg text-sm font-bold">Chọn tất cả</button>
                  <button onClick={() => setSelectedLessonIndexes([])} disabled={selectedLessonIndexes.length === 0} className="px-3 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 disabled:opacity-40 rounded-lg text-sm font-bold">Bỏ chọn</button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <label className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  <span className="block mb-1">Số câu hỏi</span>
                  <input aria-label="Số câu Quiz nhiều bài" type="number" min={4} max={Math.max(4, selectedPool.length)} disabled={selectedPool.length === 0} value={selectedQuestionCount} onChange={(event) => setMultiQuizCount(Math.min(Math.max(4, Number(event.target.value) || 4), Math.max(4, selectedPool.length)))} className="w-full sm:w-28 px-3 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
                </label>
                <button onClick={startMultiQuiz} disabled={selectedLessonIndexes.length < 2} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black"><i className="fas fa-play mr-2"></i>Bắt đầu Quiz</button>
              </div>
            </div>
          </section>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3" aria-label="Bộ lọc bài học">
            {filters.map((item) => <button key={item.id} onClick={() => setFilter(item.id)} className={`shrink-0 px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${filter === item.id ? 'bg-red-500 border-red-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}><i className={`fas ${item.icon} mr-2`}></i>{item.label}</button>)}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessonGroups.map((lessonGroup, index) => {
            const lesson = lessonGroup.items;
            const filteredItems = lesson.filter(matchesFilter);
            if (filteredItems.length === 0) return null;
            const learned = lesson.filter((item) => progress[item.id]?.status === 'learned').length;
            const due = lesson.filter((item) => isDue(progress[item.id])).length;
            const isSelected = selectedLessonIndexes.includes(index);
            return (
              <article key={index} className={`bg-white dark:bg-slate-800 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-black">Bài {index + 1}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-black bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full">{lessonGroup.level}</span>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{lessonGroup.title}</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{learned}/{lesson.length} thuộc {due > 0 && `• ${due} đến hạn`}</p>
                  </div>
                  {multiQuizOpen ? <span className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'}`} aria-hidden="true"><i className="fas fa-check text-xs"></i></span> : <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">{filteredItems.length} chữ</span>}
                </div>
                <div className="font-japanese text-3xl tracking-wider text-slate-500 dark:text-slate-300 truncate mb-5">{filteredItems.map((item) => item.kanji).join('')}</div>
                {multiQuizOpen ? (
                  <button onClick={() => toggleLesson(index)} aria-pressed={isSelected} aria-label={`${isSelected ? 'Bỏ chọn' : 'Chọn'} Bài ${index + 1}`} className={`w-full py-2.5 rounded-lg font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'}`}><i className={`fas ${isSelected ? 'fa-check' : 'fa-plus'} mr-2`}></i>{isSelected ? 'Đã chọn' : 'Chọn bài này'}</button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onStartLesson(index, filter === 'all' ? undefined : filteredItems.map((item) => item.id))} className="py-2 bg-red-500 text-white rounded-lg font-bold"><i className="fas fa-book-open mr-2"></i>Học</button>
                    <button onClick={() => onStartQuiz(filteredItems, 'practice')} className="py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-bold"><i className="fas fa-list-check mr-2"></i>Quiz</button>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
