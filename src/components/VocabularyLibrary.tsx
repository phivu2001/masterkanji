"use client";

import { useMemo, useState } from 'react';
import type { JLPTLevel } from '@/data/jlptCore';
import type { LearningVocabularyPartOfSpeech, VocabularyInfo, VocabularyLessonGroup } from '@/data/vocabulary';
import { getVocabularyClozeExercises, getVocabularyRelationPairs } from '@/data/vocabularyPractice';
import { isDue, type StudyProgress } from '@/lib/study';

type VocabularyFilter = 'all' | 'new' | 'learning' | 'hard' | 'learned' | 'due';
type MultiPracticeMode = 'quiz' | 'typing' | 'cloze';

type Props = {
  level: JLPTLevel;
  words: VocabularyInfo[];
  lessonGroups: VocabularyLessonGroup[];
  partOfSpeech: LearningVocabularyPartOfSpeech | null;
  progress: StudyProgress;
  onBack: () => void;
  onStartLesson: (lessonIndex: number, ids?: string[]) => void;
  onStartReview: (ids: string[]) => void;
  onStartQuiz: (pool: VocabularyInfo[], mode: 'practice' | 'rapid' | 'exam', questionCount?: number, title?: string) => void;
  onStartTyping: (pool: VocabularyInfo[], title: string) => void;
  onStartCloze: (pool: VocabularyInfo[], title: string) => void;
  onStartGame: (pool: VocabularyInfo[], mode: 'speed' | 'relations', title: string) => void;
  onStartRace: (pool: VocabularyInfo[], title: string) => void;
  onStartConjugation: () => void;
};

const partOfSpeechLabels: Record<LearningVocabularyPartOfSpeech, string> = {
  verb: 'Động từ',
  noun: 'Danh từ',
  adjective: 'Tính từ',
};

const filters: { id: VocabularyFilter; label: string; icon: string }[] = [
  { id: 'all', label: 'Tất cả', icon: 'fa-layer-group' },
  { id: 'new', label: 'Chưa học', icon: 'fa-circle' },
  { id: 'learning', label: 'Đang học', icon: 'fa-clock' },
  { id: 'hard', label: 'Hay sai', icon: 'fa-triangle-exclamation' },
  { id: 'learned', label: 'Đã thuộc', icon: 'fa-check-circle' },
  { id: 'due', label: 'Đến hạn', icon: 'fa-bell' },
];

export function VocabularyLibrary({ level, words, lessonGroups, partOfSpeech, progress, onBack, onStartLesson, onStartReview, onStartQuiz, onStartTyping, onStartCloze, onStartGame, onStartRace, onStartConjugation }: Props) {
  const [filter, setFilter] = useState<VocabularyFilter>('all');
  const [multiQuizOpen, setMultiQuizOpen] = useState(false);
  const [multiPracticeMode, setMultiPracticeMode] = useState<MultiPracticeMode>('quiz');
  const [selectedLessonIndexes, setSelectedLessonIndexes] = useState<number[]>([]);
  const [multiQuizCount, setMultiQuizCount] = useState(20);
  const selectedPool = useMemo(() => [...new Map(
    selectedLessonIndexes
      .flatMap((index) => lessonGroups[index]?.words ?? [])
      .map((item) => [item.id, item]),
  ).values()], [lessonGroups, selectedLessonIndexes]);
  const selectedQuestionCount = Math.min(multiQuizCount, Math.max(4, selectedPool.length));
  const selectedClozeCount = getVocabularyClozeExercises(selectedPool).length;
  const dueIds = words.filter((item) => isDue(progress[item.id])).map((item) => item.id);
  const learnedTotal = words.filter((item) => progress[item.id]?.status === 'learned').length;
  const libraryTitle = partOfSpeech ? `${partOfSpeechLabels[partOfSpeech]} ${level}` : `Từ vựng ${level}`;
  const clozeCount = getVocabularyClozeExercises(words).length;
  const relationCount = getVocabularyRelationPairs(words).length;

  const matchesFilter = (item: VocabularyInfo) => {
    const record = progress[item.id];
    if (filter === 'all') return true;
    if (filter === 'new') return !record;
    if (filter === 'due') return isDue(record);
    return record?.status === filter;
  };

  const openMultiPractice = (mode: MultiPracticeMode) => {
    setFilter('all');
    setSelectedLessonIndexes([]);
    setMultiQuizCount(20);
    setMultiPracticeMode(mode);
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
    onStartQuiz(selectedPool, 'practice', Math.min(selectedQuestionCount, selectedPool.length), `Quiz ${selectedLessonIndexes.length} bài • ${libraryTitle}`);
  };

  const startSelectedPractice = () => {
    if (multiPracticeMode === 'quiz') {
      startMultiQuiz();
      return;
    }
    if (selectedLessonIndexes.length === 0 || selectedPool.length === 0) return;
    const scopeTitle = `${selectedLessonIndexes.length} bài • ${libraryTitle}`;
    if (multiPracticeMode === 'typing') {
      onStartTyping(selectedPool, `Luyện gõ ${scopeTitle}`);
      return;
    }
    if (selectedClozeCount > 0) onStartCloze(selectedPool, `Cloze Test ${scopeTitle}`);
  };

  const canStartSelectedPractice = multiPracticeMode === 'quiz'
    ? selectedLessonIndexes.length >= 2 && selectedPool.length >= 4
    : multiPracticeMode === 'typing'
      ? selectedLessonIndexes.length >= 1 && selectedPool.length >= 1
      : selectedLessonIndexes.length >= 1 && selectedClozeCount >= 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 sm:p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} aria-label="Về bàn học" className="w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"><i className="fas fa-arrow-left"></i></button>
            <div><h1 className="text-2xl sm:text-3xl font-black">{libraryTitle}</h1><p className="text-sm text-slate-500 dark:text-slate-400">{words.length} từ • {lessonGroups.length} bài Minna no Nihongo • thẻ che, gõ nhớ và ngữ cảnh</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button disabled={dueIds.length === 0} onClick={() => onStartReview(dueIds)} className="px-4 py-2 bg-orange-500 text-white disabled:opacity-40 rounded-xl font-bold"><i className="fas fa-bell mr-2"></i>Ôn từ đến hạn ({dueIds.length})</button>
            <button disabled={lessonGroups.length < 1} onClick={multiQuizOpen ? closeMultiQuiz : () => openMultiPractice('quiz')} aria-pressed={multiQuizOpen} className={`px-4 py-2 disabled:opacity-40 rounded-xl font-bold ${multiQuizOpen ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-blue-600 text-white'}`}><i className={`fas ${multiQuizOpen ? 'fa-xmark' : 'fa-layer-group'} mr-2`}></i>{multiQuizOpen ? 'Hủy chọn bài' : 'Luyện nhiều bài'}</button>
            <button disabled={words.length < 4} onClick={() => onStartQuiz(words, 'rapid', 10, `Phản xạ ${libraryTitle}`)} className="px-4 py-2 bg-rose-500 text-white disabled:opacity-40 rounded-xl font-bold"><i className="fas fa-bolt mr-2"></i>Phản xạ 10 giây</button>
            <button disabled={words.length < 4} onClick={() => onStartQuiz(words, 'exam')} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-40 rounded-xl font-bold"><i className="fas fa-stopwatch mr-2"></i>Thi thử từ vựng</button>
          </div>
        </header>

        <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-5 shadow-sm">
          <div className="flex justify-between text-sm mb-2"><span className="font-bold">Tiến độ {libraryTitle.toLocaleLowerCase('vi-VN')}</span><span>{learnedTotal}/{words.length} đã thuộc</span></div>
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${(learnedTotal / Math.max(1, words.length)) * 100}%` }} /></div>
        </section>

        {multiQuizOpen && (
          <section aria-labelledby="vocabulary-multi-quiz-title" className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 mb-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div>
                <h2 id="vocabulary-multi-quiz-title" className="text-lg font-black text-blue-900 dark:text-blue-100">Chọn các bài {partOfSpeech ? partOfSpeechLabels[partOfSpeech].toLocaleLowerCase('vi-VN') : 'từ vựng'} muốn luyện</h2>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{selectedLessonIndexes.length} bài • {selectedPool.length} từ không trùng đã chọn{multiPracticeMode === 'cloze' ? ` • ${selectedClozeCount} câu Cloze` : ''}.</p>
                <div className="mt-3 inline-flex flex-wrap gap-1 rounded-xl border border-blue-200 bg-white p-1 dark:border-blue-800 dark:bg-slate-900">
                  <button type="button" onClick={() => setMultiPracticeMode('quiz')} className={`rounded-lg px-3 py-2 text-sm font-black ${multiPracticeMode === 'quiz' ? 'bg-blue-600 text-white' : 'text-blue-700 dark:text-blue-300'}`}><i className="fas fa-list-check mr-2" />Quiz</button>
                  <button type="button" onClick={() => setMultiPracticeMode('typing')} className={`rounded-lg px-3 py-2 text-sm font-black ${multiPracticeMode === 'typing' ? 'bg-blue-600 text-white' : 'text-blue-700 dark:text-blue-300'}`}><i className="fas fa-keyboard mr-2" />Luyện gõ Kana</button>
                  <button type="button" onClick={() => setMultiPracticeMode('cloze')} className={`rounded-lg px-3 py-2 text-sm font-black ${multiPracticeMode === 'cloze' ? 'bg-amber-500 text-white' : 'text-blue-700 dark:text-blue-300'}`}><i className="fas fa-quote-right mr-2" />Cloze</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={() => setSelectedLessonIndexes(lessonGroups.map((_, index) => index))} className="px-3 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg text-sm font-bold">Chọn tất cả</button>
                  <button onClick={() => setSelectedLessonIndexes([])} disabled={selectedLessonIndexes.length === 0} className="px-3 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 disabled:opacity-40 rounded-lg text-sm font-bold">Bỏ chọn</button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                {multiPracticeMode === 'quiz' && <label className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  <span className="block mb-1">Số câu hỏi</span>
                  <input aria-label="Số câu Quiz nhiều bài từ vựng" type="number" min={4} max={Math.max(4, selectedPool.length)} disabled={selectedPool.length === 0} value={selectedQuestionCount} onChange={(event) => setMultiQuizCount(Math.min(Math.max(4, Number(event.target.value) || 4), Math.max(4, selectedPool.length)))} className="w-full sm:w-28 px-3 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" />
                </label>}
                <button onClick={startSelectedPractice} disabled={!canStartSelectedPractice} className={`px-5 py-2.5 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-black ${multiPracticeMode === 'cloze' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}><i className="fas fa-play mr-2"></i>{multiPracticeMode === 'quiz' ? 'Bắt đầu Quiz' : multiPracticeMode === 'typing' ? 'Bắt đầu luyện gõ' : 'Bắt đầu Cloze'}</button>
              </div>
            </div>
          </section>
        )}

        {words.length > 0 && !multiQuizOpen && <section className="mb-5">
          <div className="flex items-end justify-between gap-3 mb-3"><div><h2 className="text-lg font-black">Luyện tập chủ động</h2><p className="text-xs text-slate-500 dark:text-slate-400">Mỗi chế độ là một màn hình riêng, dùng đúng bộ từ đang mở.</p></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <button disabled={words.length < 4} onClick={() => onStartRace(words, `Đua xe ${libraryTitle}`)} className="text-left rounded-2xl border border-sky-100 dark:border-sky-900/40 bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/10 p-4 hover:border-sky-400 disabled:opacity-40 transition-colors"><span className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center mb-3"><i className="fas fa-car-side"></i></span><b className="block">Đua xe từ vựng</b><span className="text-xs text-slate-500 dark:text-slate-400">Gõ đúng để tăng tốc và nạp Nitro</span></button>
            <button onClick={onStartConjugation} className="text-left rounded-2xl border border-orange-100 dark:border-orange-900/40 bg-orange-50 dark:bg-orange-900/10 p-4 hover:border-orange-400 transition-colors"><span className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center mb-3"><i className="fas fa-fire"></i></span><b className="block">Đấu trường chia thể</b><span className="text-xs text-slate-500 dark:text-slate-400">Luyện tổng hợp động từ N5/N4</span></button>
            <button onClick={() => openMultiPractice('typing')} className="text-left rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/10 p-4 hover:border-blue-400 transition-colors"><span className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-3"><i className="fas fa-keyboard"></i></span><b className="block">Luyện gõ Kana</b><span className="text-xs text-slate-500 dark:text-slate-400">Chọn bài rồi luyện đúng các từ đã chọn</span></button>
            {clozeCount > 0 && <button onClick={() => openMultiPractice('cloze')} className="text-left rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 p-4 hover:border-amber-400 transition-colors"><span className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3"><i className="fas fa-quote-right"></i></span><b className="block">Cloze thực tế</b><span className="text-xs text-slate-500 dark:text-slate-400">Chọn bài • {clozeCount} câu khả dụng</span></button>}
            <button disabled={words.length < 4} onClick={() => onStartGame(words, 'speed', `Speed Matching ${libraryTitle}`)} className="text-left rounded-2xl border border-cyan-100 dark:border-cyan-900/40 bg-cyan-50 dark:bg-cyan-900/10 p-4 hover:border-cyan-400 disabled:opacity-40 transition-colors"><span className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center mb-3"><i className="fas fa-bolt"></i></span><b className="block">Nối từ tính giờ</b><span className="text-xs text-slate-500 dark:text-slate-400">Ghép từ với nghĩa thật nhanh</span></button>
            <button disabled={relationCount < 2} onClick={() => onStartGame(words, 'relations', `Cặp từ ${libraryTitle}`)} className="text-left rounded-2xl border border-violet-100 dark:border-violet-900/40 bg-violet-50 dark:bg-violet-900/10 p-4 hover:border-violet-400 disabled:opacity-40 transition-colors"><span className="w-10 h-10 rounded-xl bg-violet-500 text-white flex items-center justify-center mb-3"><i className="fas fa-code-compare"></i></span><b className="block">Đồng/trái nghĩa</b><span className="text-xs text-slate-500 dark:text-slate-400">{relationCount} cặp dùng được</span></button>
          </div>
        </section>}

        {words.length > 0 && !multiQuizOpen && <div className="flex gap-2 overflow-x-auto pb-3 mb-3" aria-label="Bộ lọc từ vựng">
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
            const isSelected = selectedLessonIndexes.includes(index);
            return (
              <article key={`${lessonGroup.level}-${lessonGroup.title}-${index}`} className={`bg-white dark:bg-slate-800 border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-black">Bài {lessonGroup.lessonNumber}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-full">{lessonGroup.level}</span>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{lessonGroup.title}</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{learned}/{lessonGroup.words.length} thuộc {due > 0 && `• ${due} đến hạn`}</p>
                  </div>
                  {multiQuizOpen ? <span className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'}`} aria-hidden="true"><i className="fas fa-check text-xs"></i></span> : <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">{filteredItems.length} từ</span>}
                </div>
                <div className="font-japanese text-2xl leading-relaxed text-slate-500 dark:text-slate-300 line-clamp-2 mb-2">{filteredItems.slice(0, 8).map((item) => item.word).join('・')}</div>
                <div className="mb-5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                  <i className="fas fa-lightbulb mr-2"></i>{filteredItems[0]?.contexts[1]?.phrase ?? filteredItems[0]?.contexts[0]?.phrase} → {filteredItems[0]?.contexts[1]?.meaning ?? filteredItems[0]?.meaning}
                </div>
                {multiQuizOpen ? (
                  <button onClick={() => toggleLesson(index)} aria-pressed={isSelected} aria-label={`${isSelected ? 'Bỏ chọn' : 'Chọn'} Bài ${lessonGroup.lessonNumber}`} className={`w-full py-2.5 rounded-lg font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'}`}><i className={`fas ${isSelected ? 'fa-check' : 'fa-plus'} mr-2`}></i>{isSelected ? 'Đã chọn' : 'Chọn bài này'}</button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => onStartLesson(index, filter === 'all' ? undefined : filteredItems.map((item) => item.id))} className="py-2 bg-emerald-500 text-white rounded-lg font-bold"><i className="fas fa-book-open mr-2"></i>Học từ</button>
                    <button onClick={() => onStartQuiz(filteredItems, 'practice')} className="py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-bold"><i className="fas fa-list-check mr-2"></i>Quiz</button>
                  </div>
                )}
              </article>
            );
          })}
        </section>}
      </div>
    </div>
  );
}
