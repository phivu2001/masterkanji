"use client";

import { useState, useEffect } from 'react';
import { kanjiData } from '@/data/kanji';
import Head from 'next/head';

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState<'N5' | 'N4' | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<'learn' | 'review' | 'list'>('learn');
  const [reviewCount, setReviewCount] = useState(12);
  const [userProgress, setUserProgress] = useState<Record<string, { status: 'learned' | 'learning' | 'hard' }>>({});
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('kanjiProgress');
    if (saved) {
      try {
        setUserProgress(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const updateProgress = (id: string, status: 'learned' | 'learning' | 'hard') => {
    setUserProgress(prev => {
      const updated = { ...prev, [id]: { status } };
      localStorage.setItem('kanjiProgress', JSON.stringify(updated));
      return updated;
    });
  };
  
  const WORDS_PER_LESSON = 10;

  // Lọc dữ liệu theo cấp độ đã chọn
  const levelData = kanjiData.filter(k => k.level === selectedLevel);
  const totalLessons = Math.ceil(levelData.length / WORDS_PER_LESSON);
  
  // Lọc dữ liệu theo bài học
  const lessonData = selectedLesson !== null 
    ? levelData.slice(selectedLesson * WORDS_PER_LESSON, (selectedLesson + 1) * WORDS_PER_LESSON) 
    : [];
  const total = lessonData.length;
  const data = lessonData[currentIndex] || lessonData[0]; // Tránh lỗi khi mảng rỗng tạm thời

  const nextKanji = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      alert("Bạn đã hoàn thành bài học này! Hãy quay lại chọn bài tiếp theo.");
    }
  };

  const handleFlashcardResponse = (quality: 'lai' | 'kho' | 'tot') => {
    // Map quality to status
    const statusMap: Record<'lai' | 'kho' | 'tot', 'hard' | 'learning' | 'learned'> = { 
      'lai': 'hard', 
      'kho': 'learning', 
      'tot': 'learned' 
    };
    updateProgress(data.id, statusMap[quality]);

    // Nếu đang ôn tập, giảm số từ cần ôn tập
    if (mode === 'review' && reviewCount > 0) {
      setReviewCount(prev => prev - 1);
    }
    nextKanji();
  };

  const toggleReviewMode = () => {
    if (mode === 'learn') {
      setMode('review');
      // Lấy random 1 từ để ôn tập
      setCurrentIndex(Math.floor(Math.random() * total));
    } else {
      setMode('learn');
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  };

  const previousKanji = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      
      const voices = window.speechSynthesis.getVoices();
      // Tìm giọng Google 日本語 hoặc bất kỳ giọng tiếng Nhật nào
      const jaVoice = voices.find(voice => 
        voice.name.includes('Google') && voice.lang.includes('ja') || 
        voice.lang === 'ja-JP' || 
        voice.lang.includes('ja')
      );
      
      if (jaVoice) {
        utterance.voice = jaVoice;
      }

      // Hack nhỏ: Chrome đôi khi cần delay 50ms để không bị kẹt khi cancel()
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    } else {
      alert("Thiết bị của bạn không hỗ trợ phát âm thanh.");
    }
  };

  // Nếu chưa chọn cấp độ, hiển thị Trang Chủ
  if (!selectedLevel) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden p-10 text-center border border-slate-200">
          <div className="bg-red-500 text-white font-bold rounded-2xl w-24 h-24 flex items-center justify-center font-[Noto_Sans_JP] text-5xl mx-auto mb-6 shadow-lg shadow-red-200">漢</div>
          <h1 className="text-4xl font-black text-slate-800 mb-4">KanjiMaster</h1>
          <p className="text-slate-500 text-lg mb-10">Chọn cấp độ để bắt đầu học ngay hôm nay</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card N5 */}
            <button onClick={() => { setSelectedLevel('N5'); setSelectedLesson(null); }} className="group text-left border-2 border-slate-200 hover:border-red-500 rounded-2xl p-6 transition-all hover:shadow-lg bg-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -z-0 transition-transform duration-500 group-hover:scale-150"></div>
               <h2 className="text-4xl font-black text-red-500 mb-2 relative z-10">N5</h2>
               <p className="font-bold text-slate-800 text-lg relative z-10">Kanji Nhập môn</p>
               <p className="text-slate-500 text-sm mt-2 relative z-10 leading-relaxed">21 chữ Kanji nền tảng. Dành cho người mới bắt đầu học tiếng Nhật.</p>
            </button>
            
            {/* Card N4 */}
            <button onClick={() => { setSelectedLevel('N4'); setSelectedLesson(null); }} className="group text-left border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-6 transition-all hover:shadow-lg bg-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 transition-transform duration-500 group-hover:scale-150"></div>
               <h2 className="text-4xl font-black text-blue-500 mb-2 relative z-10">N4</h2>
               <p className="font-bold text-slate-800 text-lg relative z-10">Kanji Sơ trung cấp</p>
               <p className="text-slate-500 text-sm mt-2 relative z-10 leading-relaxed">Mở rộng vốn từ vựng. (Chứa 1 chữ Kanji mẫu 'Nghiên').</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chọn Bài Học (Lesson Selection)
  if (selectedLesson === null) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 font-sans">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-8 gap-4">
            <button onClick={() => setSelectedLevel(null)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-200 hover:bg-slate-100 transition-colors">
              <i className="fas fa-arrow-left text-slate-600"></i>
            </button>
            <h1 className="text-3xl font-black text-slate-800">Lộ trình {selectedLevel}</h1>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: totalLessons }).map((_, i) => {
              const startIdx = i * WORDS_PER_LESSON;
              const endIdx = Math.min((i + 1) * WORDS_PER_LESSON, levelData.length);
              const lessonKanji = levelData.slice(startIdx, endIdx);
              let learnedCount = 0;
              lessonKanji.forEach(k => {
                if (userProgress[k.id]?.status === 'learned') learnedCount++;
              });
              const isCompleted = learnedCount === lessonKanji.length;
              
              return (
                <button 
                  key={i}
                  onClick={() => { setSelectedLesson(i); setCurrentIndex(0); setMode('learn'); setIsFlipped(false); }}
                  className={`bg-white border ${isCompleted ? 'border-green-400' : 'border-slate-200'} hover:border-red-400 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between h-40 group relative overflow-hidden`}
                >
                  {isCompleted && <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -z-0"></div>}
                  <div className="flex justify-between items-start w-full relative z-10">
                    <span className="font-bold text-slate-700 text-lg flex items-center gap-2">
                      Bài {i + 1}
                      {isCompleted && <i className="fas fa-check-circle text-green-500 text-sm"></i>}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {learnedCount}/{lessonKanji.length} thuộc
                    </span>
                  </div>
                  <div className="mt-4 relative z-10">
                    <div className="text-2xl font-[Noto_Sans_JP] text-slate-400 group-hover:text-red-500 transition-colors truncate">
                      {lessonKanji.map(k => k.kanji).join('')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 text-slate-800 font-sans min-h-screen">
      <Head>
        <title>Học Kanji - Giao diện mẫu</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </Head>

      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div onClick={() => { setSelectedLevel(null); setSelectedLesson(null); }} className="flex-shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" title="Quay lại Trang Chủ">
                <div className="bg-red-500 text-white font-bold rounded-lg w-8 h-8 flex items-center justify-center font-[Noto_Sans_JP] text-lg">漢</div>
                <span className="font-bold text-xl text-slate-800">KanjiMaster</span>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <a href="#" className="border-red-500 text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Bàn làm việc</a>
                <button onClick={() => setShowSearch(true)} className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  <i className="fas fa-search mr-2"></i>Từ điển
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowSearch(true)} className="sm:hidden text-slate-500 hover:text-red-500">
                <i className="fas fa-search"></i>
              </button>
              <button onClick={() => setSelectedLesson(null)} className="text-sm text-slate-500 hover:text-red-500 font-medium mr-2">
                <i className="fas fa-list-ul mr-1"></i> Mục lục
              </button>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium border border-slate-200">Trình độ: {selectedLevel}</span>
              <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer">
                <i className="fas fa-user"></i>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold uppercase">Bài {selectedLesson! + 1}</span>
              <h1 className="text-2xl font-bold text-slate-900">
                {mode === 'learn' ? `Học bài mới` : mode === 'list' ? `Danh sách Kanji` : 'Chế độ: Ôn tập Flashcard'}
              </h1>
            </div>
            <p className="text-slate-500">Mục tiêu bài này: {total} chữ • Đã học: {currentIndex + 1}/{total}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setMode(mode === 'list' ? 'learn' : 'list')} className="flex-1 sm:flex-none bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 font-medium transition-colors">
              <i className={`fas ${mode === 'list' ? 'fa-book-open' : 'fa-list'} mr-2`}></i>{mode === 'list' ? 'Học tiếp' : 'Xem danh sách'}
            </button>
            {mode !== 'list' && (
              <>
                <button onClick={previousKanji} className="flex-1 sm:flex-none bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 font-medium transition-colors">
                  <i className="fas fa-arrow-left mr-2"></i>Trở lại
                </button>
                <button onClick={nextKanji} className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 font-medium transition-colors">
                  Tiếp theo <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </>
            )}
          </div>
        </div>

        {mode === 'list' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-4">
              {lessonData.map((k, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setMode('learn');
                    setIsFlipped(false);
                  }}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover:scale-105 ${idx === currentIndex ? 'border-red-500 bg-red-50' : 'border-slate-100 hover:border-red-300 bg-slate-50'}`}
                >
                  {userProgress[k.id]?.status === 'learned' && <div className="absolute top-2 right-2 text-green-500" title="Đã thuộc"><i className="fas fa-check-circle"></i></div>}
                  {userProgress[k.id]?.status === 'hard' && <div className="absolute top-2 right-2 text-red-500" title="Hay sai"><i className="fas fa-exclamation-circle"></i></div>}
                  {userProgress[k.id]?.status === 'learning' && <div className="absolute top-2 right-2 text-blue-500" title="Đang học"><i className="fas fa-clock"></i></div>}
                  <span className="font-[Noto_Sans_JP] text-4xl font-bold text-slate-800 mb-2">{k.kanji}</span>
                  <span className="text-xs font-bold text-slate-500 uppercase">{k.hanviet}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Kanji Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex flex-col md:flex-row border-b border-slate-100">
                  <div className="md:w-1/3 bg-slate-50 p-8 flex flex-col items-center justify-center border-r border-slate-100 relative min-h-[300px]">
                    {!userProgress[data.id] && <span className="absolute top-4 left-4 bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">Chưa học</span>}
                    {userProgress[data.id]?.status === 'learned' && <span className="absolute top-4 left-4 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded"><i className="fas fa-check-circle mr-1"></i> Đã thuộc</span>}
                    {userProgress[data.id]?.status === 'learning' && <span className="absolute top-4 left-4 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded"><i className="fas fa-clock mr-1"></i> Đang học</span>}
                    {userProgress[data.id]?.status === 'hard' && <span className="absolute top-4 left-4 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded"><i className="fas fa-exclamation-circle mr-1"></i> Hay sai</span>}
                    <div className="text-[100px] leading-none font-[Noto_Sans_JP] font-bold text-slate-800 mt-4">{data.kanji}</div>
                    <div className="text-xl font-bold text-slate-600 mt-4 uppercase tracking-widest">{data.hanviet}</div>
                  </div>
                  
                  <div className="md:w-2/3 p-6 sm:p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-400 uppercase tracking-wide mb-1">Ý nghĩa</h2>
                        <p className="text-xl font-medium text-slate-800">{data.meaning}</p>
                      </div>
                      <button className="text-slate-400 hover:text-red-500 transition-colors">
                        <i className="far fa-heart text-xl"></i>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Âm On (Onyomi)</h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium border border-blue-100">{data.onyomi}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Âm Kun (Kunyomi)</h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md text-sm font-medium border border-emerald-100">{data.kunyomi}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">Thành phần (Bộ thủ)</h3>
                      <div className="flex gap-4 flex-wrap">
                        {data.components.map((comp, i) => (
                          <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                            <span className="font-[Noto_Sans_JP] font-bold text-lg text-slate-700">{comp.kanji}</span>
                            <span className="text-sm text-slate-600">{comp.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <p className="text-sm text-yellow-800 leading-relaxed">
                        <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        <strong>Mẹo nhớ:</strong> {data.mnemonic}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 sm:p-8 bg-white">
                  <h3 className="text-base font-bold text-slate-800 mb-4 border-l-4 border-red-500 pl-3">Từ vựng thường gặp</h3>
                  <div className="space-y-3">
                    {data.vocabularies.map((voc, i) => (
                      <div 
                        key={i} 
                        onClick={() => speakText(voc.kanji)}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100 cursor-pointer"
                        title="Nhấn để nghe phát âm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="font-[Noto_Sans_JP] text-2xl font-bold text-slate-800">{voc.kanji}</div>
                          <div>
                            <div className="text-xs text-slate-500 font-medium mb-1">{voc.reading}</div>
                            <div className="text-sm text-slate-800">{voc.meaning}</div>
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600">
                          <i className="fas fa-volume-up"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Tiến độ hôm nay</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Chữ mới</span>
                  <span className="text-sm font-bold text-slate-800">{currentIndex + 1} / {total}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4">
                  <div className="bg-red-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / total) * 100}%` }}></div>
                </div>
                <div className="flex items-center justify-between mb-2 mt-4">
                  <span className="text-sm text-slate-600">Cần ôn tập</span>
                  <span className="text-sm font-bold text-orange-500">{reviewCount} chữ</span>
                </div>
                <button onClick={toggleReviewMode} className={`w-full mt-2 font-medium py-2 rounded-lg transition-colors ${mode === 'review' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
                  {mode === 'review' ? 'Thoát Ôn Tập' : 'Ôn tập ngay'}
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Trải nghiệm Flashcard (Bấm để lật)</h3>
                
                <div 
                  className="group bg-transparent perspective-1000 w-full h-64 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div className={`relative w-full h-full text-center transition-transform duration-700 transform-style-3d shadow-md rounded-2xl border border-slate-200 ${isFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* Front */}
                    <div className="absolute w-full h-full backface-hidden bg-white text-black flex flex-col items-center justify-center p-4 rounded-2xl">
                      <div className="text-6xl font-[Noto_Sans_JP] font-bold text-slate-800 mb-2">{data.kanji}</div>
                      <div className="text-sm text-slate-400">Bấm chuột để lật thẻ</div>
                    </div>
                    
                    {/* Back */}
                    <div className="absolute w-full h-full backface-hidden bg-slate-50 rotate-y-180 flex flex-col items-center justify-center p-6 rounded-2xl">
                      <div className="text-lg font-bold text-slate-800 uppercase mb-1">{data.hanviet}</div>
                      <div className="text-sm text-slate-600 mb-4 text-center">{data.meaning}</div>
                      <div className="w-full bg-white rounded-lg p-2 shadow-sm border border-slate-100 text-left mb-2">
                        <div className="text-xs text-slate-400">Onyomi</div>
                        <div className="font-medium text-sm">{data.onyomi}</div>
                      </div>
                      <div className="w-full bg-white rounded-lg p-2 shadow-sm border border-slate-100 text-left">
                        <div className="text-xs text-slate-400">Kunyomi</div>
                        <div className="font-medium text-sm">{data.kunyomi}</div>
                      </div>
                    </div>
                    
                  </div>
                </div>
                
                <div className="flex justify-between mt-4 gap-2">
                  <button onClick={() => handleFlashcardResponse('lai')} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors">Lại (1p)</button>
                  <button onClick={() => handleFlashcardResponse('kho')} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors">Khó (10p)</button>
                  <button onClick={() => handleFlashcardResponse('tot')} className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 transition-colors">Tốt (1n)</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Search Modal */}
      {showSearch && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex flex-col items-center pt-20 px-4"
          onClick={() => { setShowSearch(false); setSearchQuery(''); }}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <i className="fas fa-search text-slate-400 text-xl"></i>
              <input
                autoFocus
                type="text"
                placeholder="Tra cứu Kanji, Hán Việt, hoặc Nghĩa..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-lg text-slate-700 bg-transparent"
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-slate-400 hover:text-red-500">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {searchQuery.trim() === '' ? (
                <div className="text-center text-slate-400 py-10">
                  <i className="fas fa-book-open text-4xl mb-3"></i>
                  <p>Nhập từ khóa để tra cứu trong {kanjiData.length} chữ Kanji</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {kanjiData.filter(k => 
                    k.kanji.includes(searchQuery) || 
                    k.hanviet.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    k.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    k.onyomi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    k.kunyomi.toLowerCase().includes(searchQuery.toLowerCase())
                  ).slice(0, 20).map((k, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 hover:border-red-300 transition-colors">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center font-[Noto_Sans_JP] text-4xl font-bold text-slate-800">
                        {k.kanji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-700 uppercase">{k.hanviet}</span>
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{k.level}</span>
                          {userProgress[k.id]?.status === 'learned' && <i className="fas fa-check-circle text-green-500"></i>}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{k.meaning}</p>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span><strong className="text-slate-400 font-normal">On:</strong> {k.onyomi}</span>
                          <span><strong className="text-slate-400 font-normal">Kun:</strong> {k.kunyomi}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
