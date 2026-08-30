"use client";

import { useEffect, useState } from 'react';
import type { VocabularyInfo } from '@/data/vocabulary';
import type { ReviewQuality, StudyProgress, StudySettings } from '@/lib/study';
import { formatDue, withoutRomaji } from '@/lib/study';

type Props = {
  items: VocabularyInfo[];
  currentIndex: number;
  sessionLabel: string;
  lessonNumber: number | null;
  totalLessons: number;
  progress: StudyProgress;
  settings: StudySettings;
  isReview: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onBackToLibrary: () => void;
  onHome: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onPreviousLesson: () => void;
  onNextLesson: () => void;
  onSelectIndex: (index: number) => void;
  onRate: (quality: ReviewQuality) => void;
};

export function VocabularyStudyScreen(props: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showList, setShowList] = useState(false);
  const data = props.items[props.currentIndex] ?? props.items[0];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
      if (event.key === 'ArrowLeft') props.onPrevious();
      if (event.key === 'ArrowRight') props.onNext();
      if (event.key === ' ') { event.preventDefault(); setIsFlipped((value) => !value); }
      if (event.key === '1') props.onRate('again');
      if (event.key === '2') props.onRate('hard');
      if (event.key === '3') props.onRate('good');
      if (event.key.toLowerCase() === 'l') setShowList((value) => !value);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data, props]);

  if (!data) return null;

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = props.settings.speechRate;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => voice.lang === 'ja-JP') ?? voices.find((voice) => voice.lang.startsWith('ja')) ?? null;
    window.speechSynthesis.speak(utterance);
  };

  const record = props.progress[data.id];
  const contexts = data.contexts.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-20">
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between gap-3">
          <button onClick={props.onHome} className="flex items-center gap-2 font-black text-lg"><span className="w-8 h-8 bg-emerald-500 text-white font-japanese rounded-lg flex items-center justify-center">語</span><span className="hidden sm:inline">KanjiMaster</span></button>
          <button onClick={props.onToggleDarkMode} aria-label={props.isDarkMode ? 'Giao diện sáng' : 'Giao diện tối'} className="w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><i className={`fas ${props.isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl shadow-sm">
            <button onClick={props.onBackToLibrary} className="h-10 px-3 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-700"><i className="fas fa-list-ul mr-2"></i>Các bài từ vựng</button>
            <button disabled={props.lessonNumber === null || props.lessonNumber <= 1 || props.isReview} onClick={props.onPreviousLesson} aria-label="Bài từ vựng trước" className="w-10 h-10 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><i className="fas fa-chevron-left"></i></button>
            <div className="min-w-28 text-center"><div className="text-[10px] uppercase tracking-wider font-bold text-emerald-500">{props.lessonNumber ? `Bài ${props.lessonNumber}` : 'Phiên học'}</div><div className="text-sm font-bold">{props.sessionLabel}</div></div>
            <button disabled={props.lessonNumber === null || props.lessonNumber >= props.totalLessons || props.isReview} onClick={props.onNextLesson} className="h-10 px-3 bg-emerald-500 text-white disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 rounded-lg font-bold"><span>Bài tiếp theo</span><i className="fas fa-chevron-right ml-2"></i></button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowList((value) => !value)} className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"><i className={`fas ${showList ? 'fa-book-open' : 'fa-list'} mr-2`}></i>{showList ? 'Học tiếp' : 'Danh sách'}</button>
            <button onClick={props.onPrevious} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"><i className="fas fa-arrow-left mr-2"></i>Từ trước</button>
            <button onClick={props.onNext} className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold">Từ tiếp theo<i className="fas fa-arrow-right ml-2"></i></button>
          </div>
        </div>

        {showList ? (
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{props.items.map((item, index) => <button key={item.id} onClick={() => { props.onSelectIndex(index); setShowList(false); }} className={`relative text-left p-4 rounded-xl border-2 ${index === props.currentIndex ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-700'}`}><span className="font-japanese text-2xl font-black block">{item.word}</span><span className="text-xs text-slate-400 block">{withoutRomaji(item.reading, props.settings.hideRomaji)}</span><span className="text-sm">{item.meaning}</span>{props.progress[item.id]?.status === 'learned' && <i className="fas fa-check-circle text-green-500 absolute top-2 right-2 text-xs"></i>}</button>)}</div>
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div className="bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
                    <div className="flex w-full justify-between text-xs font-bold"><span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">{record?.status === 'learned' ? 'Đã thuộc' : record?.status === 'hard' ? 'Hay sai' : record ? 'Đang học' : 'Chưa học'}</span><span className="text-slate-400">{formatDue(record)}</span></div>
                    <button onClick={() => speak(data.word)} className="font-japanese text-5xl sm:text-6xl leading-tight font-black my-8 text-center hover:text-emerald-500">{data.word}</button>
                    <div className="text-sm text-slate-500 dark:text-slate-400 text-center">{withoutRomaji(data.reading, props.settings.hideRomaji)}</div>
                    <button onClick={() => speak(data.word)} className="mt-5 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg font-bold"><i className="fas fa-volume-high mr-2"></i>Nghe phát âm</button>
                  </div>

                  <div className="md:col-span-2 p-6 sm:p-8">
                    <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Nghĩa</div>
                    <h2 className="text-2xl sm:text-3xl font-black mb-6">{data.meaning}</h2>
                    <div className="mb-5">
                      <div className="text-xs uppercase font-bold text-slate-400 mb-2">Kanji liên quan</div>
                      {data.relatedKanji.length > 0 ? (
                        <div className="flex flex-wrap gap-2">{data.relatedKanji.map((item) => <span key={item.id} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"><b className="font-japanese mr-2">{item.kanji}</b>{item.meaning}</span>)}</div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">Từ này chủ yếu dùng kana/katakana hoặc chưa gắn Kanji trong bộ hiện tại.</p>
                      )}
                    </div>
                    <div className="mb-5">
                      <div className="text-xs uppercase font-bold text-slate-400 mb-2">Cụm từ & ngữ cảnh</div>
                      <div className="space-y-3">
                        {contexts.map((context) => (
                          <button key={`${context.title}-${context.phrase}`} onClick={() => speak(context.phrase)} className="w-full text-left rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/80 dark:bg-emerald-900/10 p-4 hover:border-emerald-400 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-[11px] uppercase tracking-wider font-black text-emerald-600 dark:text-emerald-300 mb-1">{context.title}</div>
                                <div className="font-japanese text-2xl font-black leading-relaxed">{context.phrase}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{withoutRomaji(context.reading, props.settings.hideRomaji)}</div>
                              </div>
                              <i className="fas fa-volume-high text-emerald-500 mt-1"></i>
                            </div>
                            <div className="mt-3 text-sm font-bold text-emerald-900 dark:text-emerald-100">{context.meaning}</div>
                            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{context.hint}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 text-amber-900 dark:text-amber-200 rounded-xl p-4"><i className="fas fa-lightbulb text-amber-500 mr-2"></i>Cách học nhanh: đọc to cụm/câu mẫu trước, tự tưởng tượng tình huống, rồi mới bấm 1/2/3 để lên lịch ôn.</div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm"><div className="flex justify-between mb-2 text-sm"><span>Tiến độ phiên</span><b>{props.currentIndex + 1}/{props.items.length}</b></div><div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${((props.currentIndex + 1) / props.items.length) * 100}%` }} /></div><p className="text-xs text-slate-400 mt-3">Phím tắt: ←/→ chuyển từ, Space lật, 1/2/3 đánh giá, L danh sách.</p></section>
              <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm"><h3 className="font-black mb-4">Flashcard từ vựng</h3><button onClick={() => setIsFlipped((value) => !value)} className="w-full h-64 perspective-1000"><span className={`relative block w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}><span className="absolute inset-0 backface-hidden rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-5"><span className="font-japanese text-4xl font-black text-center">{data.word}</span><span className="text-xs text-slate-400 mt-3">Bấm hoặc Space để lật</span></span><span className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-5"><b className="text-xl text-center">{data.meaning}</b><span className="text-xs text-slate-400 mt-4">{withoutRomaji(data.reading, props.settings.hideRomaji)}</span></span></span></button><div className="grid grid-cols-3 gap-2 mt-4"><button onClick={() => props.onRate('again')} className="py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg font-bold">1 · Lại</button><button onClick={() => props.onRate('hard')} className="py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg font-bold">2 · Khó</button><button onClick={() => props.onRate('good')} className="py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg font-bold">3 · Tốt</button></div></section>
              <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5"><h3 className="font-black mb-3">Lịch sử từ này</h3><div className="grid grid-cols-2 gap-2 text-sm"><div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3"><div className="text-green-600 font-black text-xl">{record?.correctCount ?? 0}</div>Đúng</div><div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3"><div className="text-red-600 font-black text-xl">{record?.incorrectCount ?? 0}</div>Sai</div></div></section>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
