"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { extraVocab } from '@/data/extraVocab';
import { buildFallbackSentence, exampleSentences, similarKanjiGroups } from '@/data/kanjiLearningExtras';
import { kanjiData } from '@/data/kanji';
import type { KanjiInfo } from '@/data/kanji';
import type { PersonalSet, ReviewQuality, StudyProgress, StudySettings, WritingScore } from '@/lib/study';
import { formatDue, withoutRomaji } from '@/lib/study';

type Props = {
  items: KanjiInfo[];
  currentIndex: number;
  sessionLabel: string;
  lessonNumber: number | null;
  totalLessons: number;
  progress: StudyProgress;
  settings: StudySettings;
  favorites: string[];
  personalSets: PersonalSet[];
  writingScores: Record<string, WritingScore>;
  isReview: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onBackToLessons: () => void;
  onHome: () => void;
  onSearch: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onPreviousLesson: () => void;
  onNextLesson: () => void;
  onSelectIndex: (index: number) => void;
  onRate: (quality: ReviewQuality) => void;
  onToggleFavorite: (id: string) => void;
  onToggleSet: (setId: string, kanjiId: string) => void;
  onSaveWritingScore: (id: string, score: number) => void;
};

export function StudyScreen(props: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showList, setShowList] = useState(false);
  const [writingMessage, setWritingMessage] = useState('');
  const writerRef = useRef<HTMLDivElement>(null);
  const writerInstance = useRef<HanziWriter | null>(null);
  const data = props.items[props.currentIndex] ?? props.items[0];

  const initWriter = useCallback((kanji: string) => {
    if (!writerRef.current) return;
    writerRef.current.innerHTML = '';
    writerInstance.current = HanziWriter.create(writerRef.current, kanji, {
      width: 140,
      height: 140,
      padding: 6,
      showOutline: true,
      strokeAnimationSpeed: 1,
      delayBetweenStrokes: 50,
      strokeColor: props.isDarkMode ? '#f8fafc' : '#1e293b',
      outlineColor: props.isDarkMode ? '#334155' : '#e2e8f0',
      charDataLoader: (character, onComplete) => {
        fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data-jp/${character}.json`)
          .then((response) => {
            if (!response.ok) throw new Error('Không có dữ liệu JP');
            return response.json();
          })
          .then(onComplete)
          .catch(() => fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data/${character}.json`).then((response) => response.json()).then(onComplete).catch(console.error));
      },
    });
  }, [props.isDarkMode]);

  useEffect(() => {
    if (!data?.kanji || showList) return;
    const timer = setTimeout(() => initWriter(data.kanji), 100);
    return () => clearTimeout(timer);
  }, [data?.kanji, initWriter, showList]);

  const startWritingQuiz = () => {
    if (!data || !writerInstance.current) return;
    setWritingMessage('Hãy viết đúng thứ tự nét...');
    writerInstance.current.quiz({
      showHintAfterMisses: 3,
      highlightOnComplete: true,
      onComplete: ({ totalMistakes }) => {
        const score = Math.max(0, Math.round(100 - totalMistakes * 12));
        props.onSaveWritingScore(data.id, score);
        setWritingMessage(`Hoàn thành: ${score}/100 • ${totalMistakes} lỗi`);
      },
    });
  };

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
      if (event.key.toLowerCase() === 'f' && data) props.onToggleFavorite(data.id);
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
  const vocabulary = [...data.vocabularies, ...(extraVocab[data.kanji] ?? []).filter((extra) => !data.vocabularies.some((item) => item.kanji === extra.kanji))];
  const sentences = exampleSentences[data.kanji] ?? [buildFallbackSentence(data.kanji, data.vocabularies[0])];
  const similar = (similarKanjiGroups[data.kanji] ?? []).map((character) => kanjiData.find((item) => item.kanji === character)).filter((item): item is KanjiInfo => Boolean(item));
  const writingScore = props.writingScores[data.id];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-20">
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between gap-3">
          <button onClick={props.onHome} className="flex items-center gap-2 font-black text-lg"><span className="w-8 h-8 bg-red-500 text-white font-japanese rounded-lg flex items-center justify-center">漢</span><span className="hidden sm:inline">KanjiMaster</span></button>
          <div className="flex items-center gap-2">
            <button onClick={props.onSearch} aria-label="Tra cứu Kanji" className="w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><i className="fas fa-search"></i></button>
            <button onClick={props.onToggleDarkMode} aria-label={props.isDarkMode ? 'Giao diện sáng' : 'Giao diện tối'} className="w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><i className={`fas ${props.isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-xl shadow-sm">
            <button onClick={props.onBackToLessons} className="h-10 px-3 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-700"><i className="fas fa-list-ul mr-2"></i>Các bài học</button>
            <button disabled={props.lessonNumber === null || props.lessonNumber <= 1} onClick={props.onPreviousLesson} aria-label="Bài trước" className="w-10 h-10 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><i className="fas fa-chevron-left"></i></button>
            <div className="min-w-28 text-center"><div className="text-[10px] uppercase tracking-wider font-bold text-red-500">{props.lessonNumber ? `Bài ${props.lessonNumber}` : 'Phiên học'}</div><div className="text-sm font-bold">{props.sessionLabel}</div></div>
            <button disabled={props.lessonNumber === null || props.lessonNumber >= props.totalLessons} onClick={props.onNextLesson} className="h-10 px-3 bg-red-500 text-white disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 rounded-lg font-bold"><span>Bài tiếp theo</span><i className="fas fa-chevron-right ml-2"></i></button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowList((value) => !value)} className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"><i className={`fas ${showList ? 'fa-book-open' : 'fa-list'} mr-2`}></i>{showList ? 'Học tiếp' : 'Danh sách'}</button>
            <button onClick={props.onPrevious} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"><i className="fas fa-arrow-left mr-2"></i>Trở lại</button>
            <button onClick={props.onNext} className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold">Tiếp theo<i className="fas fa-arrow-right ml-2"></i></button>
          </div>
        </div>

        {showList ? (
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">{props.items.map((item, index) => <button key={item.id} onClick={() => { props.onSelectIndex(index); setShowList(false); }} className={`relative p-3 rounded-xl border-2 ${index === props.currentIndex ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-100 dark:border-slate-700'}`}><span className="font-japanese text-4xl">{item.kanji}</span>{props.progress[item.id]?.status === 'learned' && <i className="fas fa-check-circle text-green-500 absolute top-1 right-1 text-xs"></i>}</button>)}</div>
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div className="bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
                    <div className="flex w-full justify-between text-xs font-bold"><span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">{record?.status === 'learned' ? 'Đã thuộc' : record?.status === 'hard' ? 'Hay sai' : record ? 'Đang học' : 'Chưa học'}</span><span className="text-slate-400">{formatDue(record)}</span></div>
                    <div className="font-japanese text-[110px] leading-none font-black my-5">{data.kanji}</div>
                    <div className="font-black uppercase tracking-[0.2em] text-lg">{data.hanviet}</div>
                    <div className="mt-6 text-center"><div ref={writerRef} className="w-[152px] h-[152px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1" /><div className="flex gap-2 mt-3"><button onClick={() => writerInstance.current?.animateCharacter()} className="px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg font-bold"><i className="fas fa-play mr-1"></i>Vẽ mẫu</button><button onClick={startWritingQuiz} className="px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg font-bold"><i className="fas fa-pen mr-1"></i>Chấm viết</button></div>{(writingMessage || writingScore) && <p className="text-xs text-slate-500 mt-2">{writingMessage || `Điểm tốt nhất: ${writingScore.bestScore}/100`}</p>}</div>
                  </div>

                  <div className="md:col-span-2 p-6 sm:p-8">
                    <div className="flex justify-between gap-4 mb-6"><div><div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Ý nghĩa</div><h2 className="text-2xl font-black">{data.meaning}</h2></div><div className="flex gap-2"><button onClick={() => speak(data.kanji)} aria-label="Nghe Kanji" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700"><i className="fas fa-volume-high"></i></button><button onClick={() => props.onToggleFavorite(data.id)} aria-label="Yêu thích" className={`w-10 h-10 rounded-full ${props.favorites.includes(data.id) ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}><i className={`${props.favorites.includes(data.id) ? 'fas' : 'far'} fa-heart`}></i></button></div></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"><div><div className="text-xs uppercase font-bold text-slate-400 mb-2">Âm On</div><div className="inline-block bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg">{withoutRomaji(data.onyomi, props.settings.hideRomaji)}</div></div><div><div className="text-xs uppercase font-bold text-slate-400 mb-2">Âm Kun</div><div className="inline-block bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg">{withoutRomaji(data.kunyomi, props.settings.hideRomaji)}</div></div></div>
                    <div className="mb-5"><div className="text-xs uppercase font-bold text-slate-400 mb-2">Thành phần</div><div className="flex flex-wrap gap-2">{data.components.map((component, index) => <span key={index} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"><b className="font-japanese mr-2">{component.kanji}</b>{component.meaning}</span>)}</div></div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 text-yellow-900 dark:text-yellow-200 rounded-xl p-4"><i className="fas fa-lightbulb text-yellow-500 mr-2"></i><strong>Mẹo nhớ:</strong> {data.mnemonic}</div>
                    <details className="mt-4"><summary className="cursor-pointer font-bold text-sm">Thêm vào bộ cá nhân</summary><div className="flex flex-wrap gap-2 mt-3">{props.personalSets.map((set) => <button key={set.id} onClick={() => props.onToggleSet(set.id, data.id)} className={`px-3 py-2 rounded-lg text-sm border ${set.kanjiIds.includes(data.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-200 dark:border-slate-700'}`}><i className={`fas ${set.kanjiIds.includes(data.id) ? 'fa-check' : 'fa-plus'} mr-1`}></i>{set.name}</button>)}</div></details>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-sm">
                <h3 className="font-black text-lg mb-4">Từ vựng thường gặp</h3><div className="space-y-2">{vocabulary.map((item, index) => <button key={`${item.kanji}-${index}`} onClick={() => speak(item.kanji)} className="w-full flex items-center justify-between text-left p-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"><div className="flex items-center gap-4"><span className="font-japanese text-2xl font-bold">{item.kanji}</span><span><span className="block text-xs text-slate-400">{withoutRomaji(item.reading, props.settings.hideRomaji)}</span><span className="text-sm">{item.meaning}</span></span></div><i className="fas fa-volume-high text-slate-400"></i></button>)}</div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5"><h3 className="font-black mb-3">Câu ví dụ</h3>{sentences.map((sentence, index) => <button key={index} onClick={() => speak(sentence.japanese)} className="w-full text-left bg-slate-50 dark:bg-slate-900 rounded-xl p-4"><div className="font-japanese font-bold text-lg">{sentence.japanese}</div><div className="text-xs text-slate-400 my-1">{sentence.reading}</div><div className="text-sm">{sentence.meaning}</div></button>)}</div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5"><h3 className="font-black mb-3">Kanji dễ nhầm</h3>{similar.length > 0 ? <div className="space-y-2">{similar.map((item) => <div key={item.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-xl p-3"><span className="font-japanese text-4xl">{item.kanji}</span><div><div className="font-bold">{item.hanviet}</div><div className="text-sm text-slate-500">{item.meaning}</div></div></div>)}</div> : <p className="text-sm text-slate-500">Chưa có cặp dễ nhầm trong phiên học này.</p>}</div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm"><div className="flex justify-between mb-2 text-sm"><span>Tiến độ phiên</span><b>{props.currentIndex + 1}/{props.items.length}</b></div><div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${((props.currentIndex + 1) / props.items.length) * 100}%` }} /></div><p className="text-xs text-slate-400 mt-3">Phím tắt: ←/→ chuyển chữ, Space lật, 1/2/3 đánh giá, F yêu thích, L danh sách.</p></section>
              <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm"><h3 className="font-black mb-4">Flashcard</h3><button onClick={() => setIsFlipped((value) => !value)} className="w-full h-64 perspective-1000"><span className={`relative block w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}><span className="absolute inset-0 backface-hidden rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center"><span className="font-japanese text-7xl font-black">{data.kanji}</span><span className="text-xs text-slate-400 mt-3">Bấm hoặc Space để lật</span></span><span className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-5"><b className="uppercase text-xl">{data.hanviet}</b><span className="text-center text-sm mt-2">{data.meaning}</span><span className="text-xs text-slate-400 mt-4">{withoutRomaji(data.onyomi, props.settings.hideRomaji)}</span></span></span></button><div className="grid grid-cols-3 gap-2 mt-4"><button onClick={() => props.onRate('again')} className="py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg font-bold">1 · Lại</button><button onClick={() => props.onRate('hard')} className="py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg font-bold">2 · Khó</button><button onClick={() => props.onRate('good')} className="py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg font-bold">3 · Tốt</button></div></section>
              <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5"><h3 className="font-black mb-3">Lịch sử ghi nhớ</h3><div className="grid grid-cols-2 gap-2 text-sm"><div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3"><div className="text-green-600 font-black text-xl">{record?.correctCount ?? 0}</div>Đúng</div><div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3"><div className="text-red-600 font-black text-xl">{record?.incorrectCount ?? 0}</div>Sai</div></div></section>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
