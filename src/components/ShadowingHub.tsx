"use client";

import { useEffect, useMemo, useState } from 'react';
import { ShadowingLessonEditor } from '@/components/ShadowingLessonEditor';
import { VideoShadowingPlayer } from '@/components/VideoShadowingPlayer';
import { createShadowingSrtFileName, parseYouTubeVideoId, sanitizeShadowingLessons, serializeShadowingSrt, type ShadowingLesson, type ShadowingLevel, type ShadowingTopic } from '@/lib/shadowing';

const STORAGE_KEY = 'kanjiMaster.shadowingLessons.v1';
const topicFilters: Array<{ id: ShadowingTopic | 'Toàn bộ'; icon: string; active: string }> = [
  { id: 'Toàn bộ', icon: 'fa-table-cells-large', active: 'bg-slate-800 text-white border-slate-800' },
  { id: 'Mới bắt đầu', icon: 'fa-seedling', active: 'bg-blue-500 text-white border-blue-500' },
  { id: 'Giao tiếp', icon: 'fa-comments', active: 'bg-cyan-500 text-white border-cyan-500' },
  { id: 'Podcast', icon: 'fa-podcast', active: 'bg-violet-500 text-white border-violet-500' },
  { id: 'Tin tức', icon: 'fa-newspaper', active: 'bg-red-500 text-white border-red-500' },
  { id: 'Phim & Anime', icon: 'fa-film', active: 'bg-purple-500 text-white border-purple-500' },
  { id: 'Giáo dục', icon: 'fa-graduation-cap', active: 'bg-amber-500 text-white border-amber-500' },
  { id: 'Văn hóa', icon: 'fa-torii-gate', active: 'bg-teal-500 text-white border-teal-500' },
  { id: 'Khác', icon: 'fa-shapes', active: 'bg-fuchsia-500 text-white border-fuchsia-500' },
];

type HubTab = 'library' | 'discover' | 'shorts';

type Props = {
  onBack: () => void;
};

export function ShadowingHub({ onBack }: Props) {
  const [lessons, setLessons] = useState<ShadowingLesson[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [levelFilter, setLevelFilter] = useState<ShadowingLevel | 'Tất cả'>('Tất cả');
  const [topicFilter, setTopicFilter] = useState<ShadowingTopic | 'Toàn bộ'>('Toàn bộ');
  const [hubTab, setHubTab] = useState<HubTab>('library');
  const [sourceDraft, setSourceDraft] = useState<'youtube' | 'local'>('youtube');
  const [youtubeDraft, setYoutubeDraft] = useState('');
  const [topicDraft, setTopicDraft] = useState<ShadowingTopic>('Mới bắt đầu');
  const [bannerMessage, setBannerMessage] = useState('');
  const [editorDraft, setEditorDraft] = useState<{ sourceKind: 'youtube' | 'local'; youtubeUrl: string; topic: ShadowingTopic } | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [localFiles, setLocalFiles] = useState<Record<string, File>>({});

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setLessons(stored ? sanitizeShadowingLessons(JSON.parse(stored)) : []);
      } catch {
        setLessons([]);
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
    } catch (error) {
      console.error('Không thể lưu thêm bài Shadowing vào bộ nhớ trình duyệt.', error);
    }
  }, [hydrated, lessons]);

  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) ?? null;
  const editingLesson = lessons.find((lesson) => lesson.id === editingLessonId) ?? null;
  const filteredLessons = useMemo(() => lessons
    .filter((lesson) => levelFilter === 'Tất cả' || lesson.level === levelFilter)
    .filter((lesson) => topicFilter === 'Toàn bộ' || lesson.topic === topicFilter)
    .filter((lesson) => hubTab !== 'shorts' || (lesson.source.kind === 'youtube' && lesson.source.url.includes('/shorts/')))
    .sort((a, b) => b.updatedAt - a.updatedAt), [hubTab, levelFilter, lessons, topicFilter]);

  const visibleLessons = hubTab === 'discover' ? [] : filteredLessons;

  const openNewLesson = (draft?: { sourceKind: 'youtube' | 'local'; youtubeUrl?: string; topic?: ShadowingTopic }) => {
    setEditingLessonId(null);
    setEditorDraft({ sourceKind: draft?.sourceKind ?? 'youtube', youtubeUrl: draft?.youtubeUrl ?? '', topic: draft?.topic ?? 'Mới bắt đầu' });
    setEditorOpen(true);
  };

  const createFromBanner = () => {
    setBannerMessage('');
    if (sourceDraft === 'local') {
      openNewLesson({ sourceKind: 'local', topic: topicDraft });
      return;
    }
    const input = youtubeDraft.trim();
    if (!input) {
      setBannerMessage('Hãy dán link một video YouTube để bắt đầu.');
      return;
    }
    const videoId = parseYouTubeVideoId(input);
    if (!videoId) {
      const isChannelLink = /youtube\.com\/(?:@|channel\/|c\/|user\/)/i.test(input);
      setBannerMessage(isChannelLink
        ? 'Đây là link kênh. Hãy mở một video trong kênh rồi dán link video đó.'
        : 'Link này chưa phải một video YouTube hợp lệ.');
      return;
    }

    const existingLesson = lessons.find((lesson) => lesson.source.kind === 'youtube' && lesson.source.videoId === videoId);
    if (existingLesson) {
      setActiveLessonId(existingLesson.id);
      return;
    }

    openNewLesson({ sourceKind: 'youtube', youtubeUrl: input, topic: topicDraft });
  };

  const saveLesson = (lesson: ShadowingLesson, localFile?: File) => {
    setLessons((current) => {
      const exists = current.some((item) => item.id === lesson.id);
      return exists ? current.map((item) => item.id === lesson.id ? lesson : item) : [lesson, ...current];
    });
    if (localFile) setLocalFiles((current) => ({ ...current, [lesson.id]: localFile }));
    setEditorOpen(false);
    setEditorDraft(null);
    setEditingLessonId(null);
    setActiveLessonId(lesson.id);
  };

  const downloadLessonSrt = (lesson: ShadowingLesson) => {
    const srt = serializeShadowingSrt(lesson.segments);
    if (!srt) return;
    const url = URL.createObjectURL(new Blob([`\uFEFF${srt}`], { type: 'application/x-subrip;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = createShadowingSrtFileName(lesson.title);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const deleteLesson = (lesson: ShadowingLesson) => {
    if (!window.confirm(`Xóa bài “${lesson.title}” và toàn bộ phụ đề đã biên soạn?`)) return;
    setLessons((current) => current.filter((item) => item.id !== lesson.id));
    setLocalFiles((current) => {
      const next = { ...current };
      delete next[lesson.id];
      return next;
    });
  };

  if (!hydrated) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500"><i className="fas fa-circle-notch fa-spin mr-2" />Đang mở thư viện Shadowing...</div>;

  if (editorOpen) {
    return <ShadowingLessonEditor lesson={editingLesson} currentLocalFile={editingLesson ? localFiles[editingLesson.id] : undefined} initialYoutubeUrl={editorDraft?.youtubeUrl} initialSourceKind={editorDraft?.sourceKind} initialTopic={editorDraft?.topic} onCancel={() => { setEditorOpen(false); setEditorDraft(null); }} onSave={saveLesson} />;
  }

  if (activeLesson) {
    return <VideoShadowingPlayer lesson={activeLesson} localFile={localFiles[activeLesson.id]} onBack={() => setActiveLessonId(null)} onEdit={() => { setEditorDraft(null); setEditingLessonId(activeLesson.id); setEditorOpen(true); }} onLocalFileSelected={(file) => setLocalFiles((current) => ({ ...current, [activeLesson.id]: file }))} />;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-10 h-10 shrink-0 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Về bàn học"><i className="fas fa-chevron-left" /></button>
            <div><h1 className="text-xl font-black">Học qua video</h1><p className="text-xs text-slate-500 dark:text-slate-400">Video Shadowing tiếng Nhật</p></div>
          </div>
          <nav className="grid grid-cols-3 gap-2" aria-label="Khu vực Video Shadowing" role="tablist">
            {([
              ['library', 'fa-book-open', 'Thư viện'],
              ['discover', 'fa-compass', 'Khám phá'],
              ['shorts', 'fa-mobile-screen-button', 'Shorts'],
            ] as const).map(([id, icon, label]) => (
              <button key={id} type="button" role="tab" aria-selected={hubTab === id} onClick={() => setHubTab(id)} className={`px-3 sm:px-5 py-2.5 rounded-2xl border text-sm font-black transition-colors ${hubTab === id ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'}`}><i className={`fas ${icon} mr-2`} />{label}</button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-3 sm:p-5">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 p-4 sm:p-5 text-white shadow-sm" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)', backgroundSize: '22px 22px' }}>
          <div className="relative z-10 lg:pr-48">
            <h2 className="text-lg sm:text-xl font-black">Biến mọi video yêu thích thành bài học.</h2>
            <p className="mt-1 text-sm text-emerald-50">Thêm link YouTube hoặc video trên thiết bị, sau đó nhập phụ đề SRT/VTT thủ công trong trình tạo bài.</p>
            <div className="mt-3 inline-flex rounded-t-xl overflow-hidden bg-white/20">
              <button type="button" onClick={() => { setSourceDraft('youtube'); setBannerMessage(''); }} className={`px-4 py-2.5 text-sm font-black ${sourceDraft === 'youtube' ? 'bg-white text-red-500' : 'text-white hover:bg-white/10'}`}><i className="fab fa-youtube mr-2" />YouTube</button>
              <button type="button" onClick={() => { setSourceDraft('local'); setBannerMessage(''); }} className={`px-4 py-2.5 text-sm font-black ${sourceDraft === 'local' ? 'bg-white text-emerald-700' : 'text-white hover:bg-white/10'}`}><i className="fas fa-upload mr-2" />Tải lên</button>
            </div>
            <form onSubmit={(event) => { event.preventDefault(); createFromBanner(); }} className="rounded-b-2xl rounded-tr-2xl bg-white dark:bg-slate-900 p-3 grid lg:grid-cols-[minmax(280px,1fr)_180px_210px_auto] gap-2.5 text-slate-900 dark:text-slate-100 shadow-sm">
              {sourceDraft === 'youtube' ? (
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Link YouTube
                  <input type="url" autoComplete="url" enterKeyHint="go" value={youtubeDraft} onChange={(event) => { setYoutubeDraft(event.target.value); if (bannerMessage) setBannerMessage(''); }} placeholder="Dán link video YouTube..." className="mt-1.5 w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 outline-none focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-300" />
                </label>
              ) : (
                <div className="text-xs font-bold text-slate-600 dark:text-slate-300">Video trên thiết bị
                  <button type="button" onClick={createFromBanner} className="mt-1.5 w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-left px-3 text-slate-500"><i className="fas fa-file-video mr-2 text-emerald-500" />Chọn tệp ở bước tiếp theo</button>
                </div>
              )}
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Ngôn ngữ video
                <select value="ja" disabled className="mt-1.5 w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 disabled:opacity-100"><option value="ja">🇯🇵 Tiếng Nhật</option></select>
              </label>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Chủ đề
                <select value={topicDraft} onChange={(event) => setTopicDraft(event.target.value as ShadowingTopic)} className="mt-1.5 w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 outline-none focus:border-emerald-500"><option>Mới bắt đầu</option><option>Giao tiếp</option><option>Podcast</option><option>Tin tức</option><option>Phim &amp; Anime</option><option>Giáo dục</option><option>Văn hóa</option><option>Khác</option></select>
              </label>
              <button type="submit" className="lg:self-end h-11 px-5 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-emerald-950 font-black whitespace-nowrap"><i className="fas fa-arrow-right mr-2" />Tạo bài học</button>
            </form>
            {bannerMessage && <div role="alert" className="mt-2 rounded-xl bg-red-950/55 px-3 py-2 text-sm font-bold text-red-50"><i className="fas fa-triangle-exclamation mr-2" />{bannerMessage}</div>}
          </div>
          <div className="hidden lg:flex absolute right-8 bottom-3 w-32 h-32 rounded-[2rem] bg-white/20 border border-white/30 rotate-3 items-center justify-center shadow-xl" aria-hidden="true">
            <div className="relative -rotate-3"><div className="text-5xl font-japanese font-black">聴</div><span className="absolute -right-8 -top-5 w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center shadow"><i className="fas fa-play ml-1" /></span><span className="block text-xs font-black text-center mt-1">SHADOWING</span></div>
          </div>
        </section>

        <section className="mt-3 flex items-center gap-2">
          <div className="min-w-0 flex-1 flex gap-2 overflow-x-auto py-1" aria-label="Lọc theo chủ đề">
            {topicFilters.map((topic) => {
              const selected = topicFilter === topic.id;
              return <button key={topic.id} type="button" aria-pressed={selected} onClick={() => setTopicFilter(topic.id)} className={`shrink-0 px-3 py-2 rounded-full border text-xs sm:text-sm font-bold transition-colors ${selected ? topic.active : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'}`}><i className={`fas ${topic.icon} mr-2`} />{topic.id}</button>;
            })}
          </div>
          <label className="relative shrink-0" aria-label="Lọc theo cấp độ">
            <i className="fas fa-sliders absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
            <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value as ShadowingLevel | 'Tất cả')} className="h-10 w-24 pl-9 pr-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none appearance-none"><option>Tất cả</option><option>N5</option><option>N4</option><option>N3</option><option>Khác</option></select>
          </label>
        </section>

        <section className="mt-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center bg-emerald-100 dark:bg-emerald-950 text-slate-900 dark:text-emerald-100 px-6 py-2 -skew-x-6"><h2 className="text-xl font-black skew-x-6">{hubTab === 'discover' ? 'Khám phá' : hubTab === 'shorts' ? 'Shorts' : 'Bài luyện Shadowing'}</h2></div>
            <div className="text-xs sm:text-sm text-slate-500"><strong className="text-slate-900 dark:text-white">{visibleLessons.length}</strong> bài · {lessons.reduce((total, lesson) => total + lesson.segments.length, 0)} câu</div>
          </div>

          {hubTab === 'discover' ? (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-500 flex items-center justify-center text-2xl"><i className="fas fa-compass" /></div>
              <h3 className="font-black text-xl mt-4">Kho khám phá đang chờ nguồn nội dung</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">Khu vực gợi ý nội dung đang được phát triển. Bạn vẫn có thể tự thêm video và phụ đề vào thư viện cá nhân.</p>
            </div>
          ) : visibleLessons.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 text-2xl flex items-center justify-center mx-auto mb-4"><i className={`fas ${hubTab === 'shorts' ? 'fa-mobile-screen-button' : 'fa-clapperboard'}`} /></div>
              <h3 className="font-black text-lg">{hubTab === 'shorts' ? 'Chưa có bài từ YouTube Shorts' : lessons.length === 0 ? 'Chưa có bài Video Shadowing' : 'Không có bài phù hợp bộ lọc'}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto">Dán link YouTube hoặc chọn video trên thiết bị, sau đó nhập phụ đề SRT/VTT thủ công để tạo bài luyện.</p>
              <button onClick={() => openNewLesson()} className="mt-5 px-5 py-3 rounded-xl bg-emerald-500 text-white font-black"><i className="fas fa-plus mr-2" />Tạo bài mới</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {visibleLessons.map((lesson) => {
                const thumbnail = lesson.source.kind === 'youtube' ? `https://i.ytimg.com/vi/${lesson.source.videoId}/hqdefault.jpg` : null;
                const preview = lesson.segments[0]?.meaning || lesson.segments[0]?.japanese || 'Bài luyện nói theo từng câu.';
                return (
                  <article key={lesson.id} className="group overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    <button onClick={() => setActiveLessonId(lesson.id)} className="w-full text-left">
                      <div className={`relative aspect-video bg-cover bg-center ${thumbnail ? 'bg-slate-800' : 'bg-gradient-to-br from-emerald-500 to-cyan-700'}`} style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : undefined}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                        <span className="absolute left-3 bottom-3 w-10 h-10 rounded-full bg-white/90 text-emerald-600 flex items-center justify-center shadow"><i className={`fas ${lesson.source.kind === 'youtube' ? 'fa-play ml-0.5' : 'fa-file-video'}`} /></span>
                        <span className="absolute right-3 bottom-3 rounded-full bg-black/70 text-white px-2.5 py-1 text-xs font-bold"><i className="fas fa-headphones mr-1.5 text-emerald-300" />{lesson.segments.length} câu</span>
                      </div>
                      <div className="p-4 pb-3">
                        <div className="flex items-start justify-between gap-2"><h3 className="font-black leading-snug line-clamp-2">{lesson.title}</h3><span className="shrink-0 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 px-2 py-1 text-xs font-black">{lesson.level}</span></div>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{preview}</p>
                        <div className="mt-3 text-xs font-bold text-violet-500"><i className="fas fa-tag mr-1.5" />{lesson.topic}</div>
                      </div>
                    </button>
                    <div className="px-4 pb-4 flex gap-2">
                      <button onClick={() => { setEditorDraft(null); setEditingLessonId(lesson.id); setEditorOpen(true); }} className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold"><i className="fas fa-pen mr-2" />Sửa</button>
                      <button onClick={() => downloadLessonSrt(lesson)} className="px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600" aria-label={`Tải SRT ${lesson.title}`}><i className="fas fa-download" /></button>
                      <button onClick={() => deleteLesson(lesson)} className="w-10 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-500" aria-label={`Xóa bài ${lesson.title}`}><i className="fas fa-trash" /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
