"use client";

import { useState } from 'react';
import type { JLPTLevel } from '@/data/jlptCore';
import type { VocabularyInfo, VocabularyLessonGroup } from '@/data/vocabulary';
import { isDue, type StudyProgress } from '@/lib/study';

type VocabularyFilter = 'all' | 'new' | 'learning' | 'hard' | 'learned' | 'due';

type Props = {
  level: JLPTLevel;
  words: VocabularyInfo[];
  lessonGroups: VocabularyLessonGroup[];
  progress: StudyProgress;
  onBack: () => void;
  onStartLesson: (lessonIndex: number, ids?: string[]) => void;
  onStartReview: (ids: string[]) => void;
  onStartQuiz: (pool: VocabularyInfo[], mode: 'practice' | 'exam', questionCount?: number, title?: string) => void;
};

const filters: { id: VocabularyFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'Tất cả', icon: 'fa-layer-group' },
  { id: 'new', label: 'Chưa học', icon: 'fa-circle' },
  { id: 'learning', label: 'Đang học', icon: 'fa-clock' },
  { id: 'hard', label: 'Hay sai', icon: 'fa-triangle-exclamation' },
  { id: 'learned', label: 'Đã thuộc', icon: 'fa-check-circle' },
  { id: 'due', label: 'Đến hạn', icon: 'fa-bell' },
];

export function VocabularyLibrary({ level, words, lessonGroups, progress, onBack, onStartLesson, onStartReview, onStartQuiz }: Props) {
  const [filter, setFilter] = useState<VocabularyFilter>('all');
  const dueIds = words.filter((item) => isDue(progress[item.id])).map((item) => item.id);
  const learnedTotal = words.filter((item) => progress[item.id]?.status === 'learned').length;

  const matchesFilter = (item: VocabularyInfo) => {
    const record = progress[item.id];
    if (filter === 'all') return true;
    if (filter === 'new') return !record;
    if (filter === 'due') return isDue(record);
    return record?.status === filter;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 sm:p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} aria-label="Về bàn học" className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"><i className="fas fa-arrow-left"></i></button>
            <div><h1 className="text-2xl sm:text-3xl font-black">Từ vựng {level}</h1><p className="text-sm text-slate-500 dark:text-slate-400">{words.length} từ • {lessonGroups.length} bài Minna no Nihongo • học bằng cụm từ/ngữ cảnh</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button disabled={dueIds.length === 0} onClick={() => onStartReview(dueIds)} className="px-4 py-2 bg-orange-500 text-white disabled:opacity-40 rounded-xl font-bold"><i className="fas fa-bell mr-2"></i>Ôn từ đến hạn ({dueIds.length})</button>
            <button disabled={words.length < 4} onClick={() => onStartQuiz(words, 'exam')} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-40 rounded-xl font-bold"><i className="fas fa-stopwatch mr-2"></i>Thi thử từ vựng</button>
          </div>
        </header>

        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-5 shadow-sm">
          <div className="flex justify-between text-sm mb-2"><span className="font-bold">Tiến độ từ vựng {level}</span><span>{learnedTotal}/{words.length} đã thuộc</span></div>
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${(learnedTotal / Math.max(1, words.length)) * 100}%` }} /></div>
        </section>

        {words.length > 0 && <div className="flex gap-2 overflow-x-auto pb-3 mb-3" aria-label="Bộ lọc từ vựng">
          {filters.map((item) => <button key={item.id} onClick={() => setFilter(item.id)} className={`shrink-0 px-3 py-2 rounded-lg text-sm font-bold border transition-colors ${filter === item.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}><i className={`fas ${item.icon} mr-2`}></i>{item.label}</button>)}
        </div>}

        {words.length === 0 ? (
          <section className="bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center text-2xl mb-4"><i className="fas fa-language"></i></div>
            <h2 className="text-xl font-black mb-2">Chưa có dữ liệu từ vựng</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Phần học từ vựng đang được để trống. Dữ liệu từ vựng trong từng bài Kanji vẫn được giữ lại để xem ví dụ khi học Kanji.</p>
          </section>
        ) : <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessonGroups.map((lessonGroup, index) => {
            const filteredItems = lessonGroup.words.filter(matchesFilter);
            if (filteredItems.length === 0) return null;
            const learned = lessonGroup.words.filter((item) => progress[item.id]?.status === 'learned').length;
            const due = lessonGroup.words.filter((item) => isDue(progress[item.id])).length;
            return (
              <article key={`${lessonGroup.level}-${lessonGroup.title}-${index}`} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-black">Bài {index + 1}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-full">{lessonGroup.level}</span>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{lessonGroup.title}</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{learned}/{lessonGroup.words.length} thuộc {due > 0 && `• ${due} đến hạn`}</p>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">{filteredItems.length} từ</span>
                </div>
                <div className="font-japanese text-2xl leading-relaxed text-slate-500 dark:text-slate-300 line-clamp-2 mb-2">{filteredItems.slice(0, 8).map((item) => item.word).join('・')}</div>
                <div className="mb-5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                  <i className="fas fa-lightbulb mr-2"></i>{filteredItems[0]?.contexts[1]?.phrase ?? filteredItems[0]?.contexts[0]?.phrase} → {filteredItems[0]?.contexts[1]?.meaning ?? filteredItems[0]?.meaning}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => onStartLesson(index, filter === 'all' ? undefined : filteredItems.map((item) => item.id))} className="py-2 bg-emerald-500 text-white rounded-lg font-bold"><i className="fas fa-book-open mr-2"></i>Học từ</button>
                  <button onClick={() => onStartQuiz(filteredItems, 'practice')} className="py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-bold"><i className="fas fa-list-check mr-2"></i>Quiz</button>
                </div>
              </article>
            );
          })}
        </section>}
      </div>
    </div>
  );
}
