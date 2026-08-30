"use client";

import { useState } from 'react';
import { getJlptStudyOrder } from '@/data/jlptCore';
import type { JLPTLevel } from '@/data/jlptCore';
import type { LastPosition, PersonalSet, QuizHistoryItem, StudySettings } from '@/lib/study';

type Props = {
  learned: number;
  learning: number;
  hard: number;
  due: number;
  streak: number;
  todayLearned: number;
  lastPosition: LastPosition | null;
  settings: StudySettings;
  personalSets: PersonalSet[];
  favoriteCount: number;
  vocabularyCounts: { n5: number; n4: number; n5Learned: number; n5Due: number; n4Learned: number; n4Due: number };
  quizHistory: QuizHistoryItem[];
  hardest: { id: string; kanji: string; hanviet: string; incorrect: number }[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onSelectLevel: (level: JLPTLevel) => void;
  onSelectVocabulary: (level: JLPTLevel) => void;
  onContinue: () => void;
  onUpdateSettings: (patch: Partial<StudySettings>) => void;
  onCreateSet: (name: string) => void;
  onRenameSet: (id: string, name: string) => void;
  onDeleteSet: (id: string) => void;
  onStartSet: (set: PersonalSet) => void;
  onStartFavorites: () => void;
  onExport: () => void;
  onExportCsv: () => void;
  onImport: () => void;
  onEnableReminder: () => void;
};

const statCards = [
  { key: 'learned', label: 'Đã thuộc', icon: 'fa-check-circle', color: 'text-green-500 bg-green-50 dark:bg-green-900/20' },
  { key: 'learning', label: 'Đang học', icon: 'fa-clock', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  { key: 'hard', label: 'Hay sai', icon: 'fa-triangle-exclamation', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
  { key: 'due', label: 'Đến hạn ôn', icon: 'fa-bell', color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20' },
] as const;

export function HomeDashboard(props: Props) {
  const [newSetName, setNewSetName] = useState('');
  const stats = { learned: props.learned, learning: props.learning, hard: props.hard, due: props.due };
  const dailyPercent = Math.min(100, Math.round((props.todayLearned / Math.max(1, props.settings.dailyGoal)) * 100));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 sm:p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 text-white font-japanese font-bold rounded-xl w-12 h-12 flex items-center justify-center text-2xl shadow-lg shadow-red-200 dark:shadow-none">漢</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">KanjiMaster</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Bàn học cá nhân của bạn</p>
            </div>
          </div>
          <button
            onClick={props.onToggleDarkMode}
            aria-label={props.isDarkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            className="w-11 h-11 rounded-full bg-slate-800 dark:bg-white text-white dark:text-slate-800 shadow flex items-center justify-center"
          >
            <i className={`fas ${props.isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </header>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6" aria-label="Thống kê học tập">
          {statCards.map((card) => (
            <div key={card.key} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.color}`}><i className={`fas ${card.icon}`}></i></div>
              <div className="text-2xl font-black">{stats[card.key]}</div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{card.label}</div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-3xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <div className="text-sm font-bold text-red-100 mb-2">Mục tiêu hôm nay</div>
                <div className="text-3xl font-black mb-2">{props.todayLearned}/{props.settings.dailyGoal} chữ mới</div>
                <p className="text-sm text-red-100">Chuỗi học hiện tại: <strong>{props.streak} ngày</strong></p>
              </div>
              <div className="w-24 h-24 rounded-full border-[10px] border-white/25 flex items-center justify-center text-xl font-black shrink-0">{dailyPercent}%</div>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full mt-5 overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${dailyPercent}%` }} /></div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Học gần nhất</div>
              <div className="text-xl font-black mb-1">{props.lastPosition ? `${props.lastPosition.level} • Bài ${props.lastPosition.lesson + 1}` : 'Chưa có tiến độ'}</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{props.lastPosition ? `Kanji thứ ${props.lastPosition.index + 1}` : 'Chọn một lộ trình để bắt đầu.'}</p>
            </div>
            <button disabled={!props.lastPosition} onClick={props.onContinue} className="mt-5 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-40 py-3 rounded-xl font-bold">
              <i className="fas fa-play mr-2"></i>Tiếp tục học
            </button>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-end justify-between mb-3">
            <div><h2 className="text-xl font-black">Chọn lộ trình</h2><p className="text-sm text-slate-500 dark:text-slate-400">N4 có thể học cộng dồn hoặc chỉ phần N4 trong cài đặt.</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => props.onSelectLevel('N5')} className="text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-red-500 rounded-2xl p-6 transition-all shadow-sm">
              <div className="flex justify-between items-start"><div><div className="text-4xl text-red-500 font-black">N5</div><div className="font-bold text-lg">Kanji nhập môn</div></div><span className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 px-3 py-1 rounded-full text-sm font-bold">{getJlptStudyOrder('N5').length} chữ</span></div>
            </button>
            <button onClick={() => props.onSelectLevel('N4')} className="text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-2xl p-6 transition-all shadow-sm">
              <div className="flex justify-between items-start"><div><div className="text-4xl text-blue-500 font-black">N4</div><div className="font-bold text-lg">Kanji sơ trung cấp</div></div><span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-bold">{props.settings.n4Only ? '167 chữ' : '247 chữ'}</span></div>
            </button>
          </div>
          <div className="mt-5 mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
            <i className="fas fa-book-open text-emerald-500"></i>
            Vocabulary
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => props.onSelectVocabulary('N5')} className="text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 transition-all shadow-sm">
              <div className="flex justify-between items-start"><div><div className="text-4xl text-emerald-500 font-black">語</div><div className="font-bold text-lg">Vocabulary N5</div><div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{props.vocabularyCounts.n5Learned} từ đã thuộc • {props.vocabularyCounts.n5Due} đến hạn</div></div><span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-bold">{props.vocabularyCounts.n5} từ</span></div>
            </button>
            <button onClick={() => props.onSelectVocabulary('N4')} className="text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-cyan-500 rounded-2xl p-6 transition-all shadow-sm">
              <div className="flex justify-between items-start"><div><div className="text-4xl text-cyan-500 font-black">語</div><div className="font-bold text-lg">Vocabulary N4</div><div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{props.vocabularyCounts.n4Learned} từ đã thuộc • {props.vocabularyCounts.n4Due} đến hạn</div></div><span className="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-300 px-3 py-1 rounded-full text-sm font-bold">{props.vocabularyCounts.n4} từ</span></div>
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4"><div><h2 className="font-black text-lg">Bộ Kanji cá nhân</h2><p className="text-xs text-slate-500 dark:text-slate-400">Tạo bộ riêng và học nhanh theo nhu cầu.</p></div><button onClick={props.onStartFavorites} disabled={props.favoriteCount === 0} className="text-sm font-bold text-red-500 disabled:opacity-40"><i className="fas fa-heart mr-1"></i>{props.favoriteCount}</button></div>
            <form className="flex gap-2 mb-4" onSubmit={(event) => { event.preventDefault(); props.onCreateSet(newSetName); setNewSetName(''); }}>
              <input value={newSetName} onChange={(event) => setNewSetName(event.target.value)} placeholder="Tên bộ mới..." className="min-w-0 flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-red-400" />
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold" aria-label="Tạo bộ Kanji"><i className="fas fa-plus"></i></button>
            </form>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {props.personalSets.map((set) => (
                <div key={set.id} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <button onClick={() => props.onStartSet(set)} disabled={set.kanjiIds.length === 0} className="flex-1 text-left disabled:opacity-40"><div className="font-bold">{set.name}</div><div className="text-xs text-slate-500 dark:text-slate-400">{set.kanjiIds.length} chữ</div></button>
                  <button aria-label={`Đổi tên ${set.name}`} onClick={() => { const name = prompt('Tên mới của bộ:', set.name); if (name) props.onRenameSet(set.id, name); }} className="w-8 h-8 text-slate-400 hover:text-blue-500"><i className="fas fa-pen"></i></button>
                  <button aria-label={`Xóa ${set.name}`} onClick={() => { if (confirm(`Xóa bộ “${set.name}”?`)) props.onDeleteSet(set.id); }} className="w-8 h-8 text-slate-400 hover:text-red-500"><i className="fas fa-trash"></i></button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <h2 className="font-black text-lg mb-4">Cài đặt học tập</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <label className="text-sm">Mục tiêu/ngày<input type="number" min={1} max={50} value={props.settings.dailyGoal} onChange={(event) => props.onUpdateSettings({ dailyGoal: Math.max(1, Number(event.target.value)) })} className="mt-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2" /></label>
              <label className="text-sm">Tốc độ đọc<select value={props.settings.speechRate} onChange={(event) => props.onUpdateSettings({ speechRate: Number(event.target.value) })} className="mt-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"><option value={0.65}>Chậm</option><option value={0.8}>Vừa</option><option value={1}>Nhanh</option></select></label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={props.settings.hideRomaji} onChange={(event) => props.onUpdateSettings({ hideRomaji: event.target.checked })} />Ẩn romaji</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={props.settings.n4Only} onChange={(event) => props.onUpdateSettings({ n4Only: event.target.checked })} />Chỉ học phần N4</label>
              <label className="text-sm">Câu thi thử<input type="number" min={5} max={50} value={props.settings.examQuestionCount} onChange={(event) => props.onUpdateSettings({ examQuestionCount: Math.min(50, Math.max(5, Number(event.target.value))) })} className="mt-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2" /></label>
              <label className="text-sm">Thời gian (phút)<input type="number" min={1} max={60} value={props.settings.examMinutes} onChange={(event) => props.onUpdateSettings({ examMinutes: Math.min(60, Math.max(1, Number(event.target.value))) })} className="mt-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2" /></label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={props.onEnableReminder} className="px-3 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg text-sm font-bold"><i className="fas fa-bell mr-2"></i>{props.settings.reminderEnabled ? 'Đã bật nhắc học' : 'Bật nhắc học'}</button>
              <label className="text-sm flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-lg px-3">Giờ<input type="number" min={0} max={23} value={props.settings.reminderHour} onChange={(event) => props.onUpdateSettings({ reminderHour: Math.min(23, Math.max(0, Number(event.target.value))) })} className="w-12 bg-transparent font-bold" /></label>
              <button onClick={props.onExport} className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-sm font-bold"><i className="fas fa-download mr-2"></i>Sao lưu</button>
              <button onClick={props.onImport} className="px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg text-sm font-bold"><i className="fas fa-upload mr-2"></i>Khôi phục</button>
              <button onClick={props.onExportCsv} className="col-span-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg text-sm font-bold"><i className="fas fa-file-csv mr-2"></i>Xuất CSV cho Anki</button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm"><h2 className="font-black text-lg mb-3">Kanji sai nhiều nhất</h2>{props.hardest.length > 0 ? <div className="space-y-2">{props.hardest.map((item) => <div key={item.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-xl p-3"><div className="flex items-center gap-3"><span className="font-japanese text-3xl">{item.kanji}</span><span className="font-bold uppercase">{item.hanviet}</span></div><span className="text-red-500 font-bold">{item.incorrect} lần sai</span></div>)}</div> : <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có lỗi nào được ghi nhận.</p>}</div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm"><h2 className="font-black text-lg mb-3">Kết quả gần đây</h2>{props.quizHistory.length > 0 ? <div className="space-y-2">{props.quizHistory.slice(0, 3).map((item) => <div key={item.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 flex justify-between"><div><div className="font-bold">{item.level} • {item.scope === 'vocabulary' ? 'Từ vựng' : item.mode === 'exam' ? 'Thi thử' : 'Luyện tập'}</div><div className="text-xs text-slate-400">{new Date(item.completedAt).toLocaleDateString('vi-VN')}</div></div><div className="text-xl font-black text-red-500">{item.score}/{item.total}</div></div>)}</div> : <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có bài Quiz nào.</p>}</div>
        </section>
      </div>
    </div>
  );
}
