"use client";

import { useMemo, useRef, useState } from 'react';
import {
  createShadowingId,
  mergeTranslatedSubtitles,
  parseSubtitleFile,
  parseYouTubeVideoId,
  type ShadowingLesson,
  type ShadowingLevel,
  type ShadowingSegment,
  type ShadowingTopic,
} from '@/lib/shadowing';

type Props = {
  lesson?: ShadowingLesson | null;
  currentLocalFile?: File;
  initialYoutubeUrl?: string;
  initialSourceKind?: 'youtube' | 'local';
  initialTopic?: ShadowingTopic;
  onCancel: () => void;
  onSave: (lesson: ShadowingLesson, localFile?: File) => void;
};

const SEGMENTS_PER_PAGE = 30;
const MAX_SUBTITLE_FILE_SIZE = 2 * 1024 * 1024;
const MAX_SUBTITLE_SEGMENTS = 1_500;

const makeBlankSegment = (previous?: ShadowingSegment): ShadowingSegment => ({
  id: createShadowingId('cue'),
  startTime: previous ? Number(previous.endTime.toFixed(1)) : 0,
  endTime: previous ? Number((previous.endTime + 3).toFixed(1)) : 3,
  japanese: '',
  reading: '',
  meaning: '',
});

const readSubtitle = async (file: File) => {
  const extension = file.name.toLowerCase().split('.').at(-1);
  if (extension !== 'srt' && extension !== 'vtt') throw new Error('Chỉ hỗ trợ tệp phụ đề SRT hoặc VTT.');
  if (file.size > MAX_SUBTITLE_FILE_SIZE) throw new Error('Tệp phụ đề vượt quá giới hạn 2 MB.');
  const parsed = parseSubtitleFile(await file.text());
  if (parsed.length > MAX_SUBTITLE_SEGMENTS) throw new Error(`Tệp có hơn ${MAX_SUBTITLE_SEGMENTS} câu phụ đề.`);
  return parsed;
};

export function ShadowingLessonEditor({ lesson, currentLocalFile, initialYoutubeUrl = '', initialSourceKind = 'youtube', initialTopic = 'Mới bắt đầu', onCancel, onSave }: Props) {
  const [sourceKind, setSourceKind] = useState<'youtube' | 'local'>(lesson?.source.kind ?? initialSourceKind);
  const [youtubeUrl, setYoutubeUrl] = useState(lesson?.source.kind === 'youtube' ? lesson.source.url : initialYoutubeUrl);
  const [localFile, setLocalFile] = useState<File | undefined>(currentLocalFile);
  const [title, setTitle] = useState(lesson?.title ?? '');
  const [level, setLevel] = useState<ShadowingLevel>(lesson?.level ?? 'N5');
  const [topic, setTopic] = useState<ShadowingTopic>(lesson?.topic ?? initialTopic);
  const [segments, setSegments] = useState<ShadowingSegment[]>(lesson?.segments ?? []);
  const [message, setMessage] = useState('');
  const [segmentPage, setSegmentPage] = useState(0);
  const [isImportingSubtitle, setIsImportingSubtitle] = useState(false);
  const subtitleImportRunRef = useRef(0);

  const parsedVideoId = useMemo(() => parseYouTubeVideoId(youtubeUrl), [youtubeUrl]);
  const segmentPageCount = Math.max(1, Math.ceil(segments.length / SEGMENTS_PER_PAGE));
  const safeSegmentPage = Math.min(segmentPage, segmentPageCount - 1);
  const visibleStart = safeSegmentPage * SEGMENTS_PER_PAGE;
  const visibleSegments = segments.slice(visibleStart, visibleStart + SEGMENTS_PER_PAGE);
  const isBusy = isImportingSubtitle;

  const updateSegment = (id: string, patch: Partial<ShadowingSegment>) => {
    setSegments((current) => current.map((segment) => segment.id === id ? { ...segment, ...patch } : segment));
  };

  const closeEditor = () => {
    subtitleImportRunRef.current += 1;
    onCancel();
  };

  const importJapanese = async (file?: File) => {
    if (!file) return;
    const importRunId = subtitleImportRunRef.current + 1;
    subtitleImportRunRef.current = importRunId;
    setIsImportingSubtitle(true);
    try {
      const imported = await readSubtitle(file);
      if (importRunId !== subtitleImportRunRef.current) return;
      if (imported.length === 0) {
        setMessage('Không tìm thấy câu có mốc thời gian hợp lệ trong tệp phụ đề.');
        return;
      }
      if (!imported.some((segment) => /[ぁ-んァ-ヶ一-龯]/u.test(segment.japanese))) {
        setMessage('Tệp không có nội dung tiếng Nhật hợp lệ.');
        return;
      }
      setSegments(imported);
      setSegmentPage(0);
      const readingCount = imported.filter((segment) => segment.reading.length > 0).length;
      const meaningCount = imported.filter((segment) => segment.meaning.length > 0).length;
      setMessage(`Đã nhập ${imported.length} câu, gồm ${readingCount} cách đọc Romaji và ${meaningCount} nghĩa tiếng Việt.`);
    } catch (error) {
      if (importRunId !== subtitleImportRunRef.current) return;
      setMessage(error instanceof Error ? error.message : 'Không đọc được tệp phụ đề tiếng Nhật.');
    } finally {
      if (importRunId === subtitleImportRunRef.current) setIsImportingSubtitle(false);
    }
  };

  const importVietnamese = async (file?: File) => {
    if (!file) return;
    if (segments.length === 0) {
      setMessage('Hãy nhập phụ đề tiếng Nhật trước, sau đó mới ghép bản dịch tiếng Việt.');
      return;
    }
    const importRunId = subtitleImportRunRef.current + 1;
    subtitleImportRunRef.current = importRunId;
    setIsImportingSubtitle(true);
    try {
      const translated = await readSubtitle(file);
      if (importRunId !== subtitleImportRunRef.current) return;
      if (translated.length === 0) {
        setMessage('Không tìm thấy bản dịch có mốc thời gian hợp lệ.');
        return;
      }
      setSegments((current) => mergeTranslatedSubtitles(current, translated));
      setMessage(`Đã ghép bản dịch cho ${Math.min(segments.length, translated.length)} câu gần mốc thời gian nhất.`);
    } catch (error) {
      if (importRunId !== subtitleImportRunRef.current) return;
      setMessage(error instanceof Error ? error.message : 'Không đọc được tệp bản dịch tiếng Việt.');
    } finally {
      if (importRunId === subtitleImportRunRef.current) setIsImportingSubtitle(false);
    }
  };

  const handleSave = () => {
    if (isBusy) {
      setMessage('Hãy chờ đọc xong tệp phụ đề trước khi lưu.');
      return;
    }
    const cleanTitle = title.trim();
    const cleanSegments = segments
      .map((segment) => ({
        ...segment,
        startTime: Math.max(0, Number(segment.startTime) || 0),
        endTime: Math.max(0, Number(segment.endTime) || 0),
        japanese: segment.japanese.trim(),
        reading: segment.reading.trim(),
        meaning: segment.meaning.trim(),
      }))
      .filter((segment) => segment.japanese.length > 0)
      .sort((a, b) => a.startTime - b.startTime);

    if (!cleanTitle) {
      setMessage('Hãy đặt tên cho bài Shadowing.');
      return;
    }
    if (cleanSegments.length === 0) {
      setMessage('Bài học cần ít nhất một câu tiếng Nhật.');
      return;
    }
    if (cleanSegments.some((segment) => segment.endTime <= segment.startTime)) {
      setMessage('Mốc kết thúc của mỗi câu phải lớn hơn mốc bắt đầu.');
      return;
    }

    const now = Date.now();
    if (sourceKind === 'youtube') {
      if (!parsedVideoId) {
        setMessage('Link YouTube chưa hợp lệ. Hãy dùng link watch, youtu.be, Shorts hoặc Live.');
        return;
      }
      onSave({
        id: lesson?.id ?? createShadowingId('lesson'),
        title: cleanTitle,
        level,
        topic,
        source: { kind: 'youtube', videoId: parsedVideoId, url: youtubeUrl.trim() },
        segments: cleanSegments,
        createdAt: lesson?.createdAt ?? now,
        updatedAt: now,
      });
      return;
    }

    const existingFileName = lesson?.source.kind === 'local' ? lesson.source.fileName : '';
    if (!localFile && !existingFileName) {
      setMessage('Hãy chọn một video trên thiết bị. Video chỉ được dùng trong phiên hiện tại.');
      return;
    }
    onSave({
      id: lesson?.id ?? createShadowingId('lesson'),
      title: cleanTitle,
      level,
      topic,
      source: { kind: 'local', fileName: localFile?.name ?? existingFileName },
      segments: cleanSegments,
      createdAt: lesson?.createdAt ?? now,
      updatedAt: now,
    }, localFile);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24">
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
          <button onClick={closeEditor} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700" aria-label="Đóng trình tạo bài"><i className="fas fa-xmark" /></button>
          <div className="text-center min-w-0"><h1 className="font-black truncate">{lesson ? 'Sửa bài Shadowing' : 'Tạo bài Video Shadowing'}</h1><p className="text-xs text-slate-500">Video + phụ đề theo từng câu</p></div>
          <button disabled={isBusy} onClick={handleSave} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm"><i className="fas fa-check mr-2" />Lưu</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
        <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-white p-5 sm:p-7 shadow-lg">
          <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl"><i className="fas fa-video" /></div><div><h2 className="text-xl sm:text-2xl font-black">Biến video thành bài luyện nói</h2><p className="text-sm text-emerald-50">Web chỉ nhúng YouTube hoặc phát tệp bạn chọn, không tải lại video.</p></div></div>
          <div className="inline-flex rounded-xl bg-emerald-950/20 p-1">
            <button onClick={() => setSourceKind('youtube')} className={`px-4 py-2 rounded-lg text-sm font-black ${sourceKind === 'youtube' ? 'bg-white text-red-500 shadow' : 'text-white'}`}><i className="fab fa-youtube mr-2" />YouTube</button>
            <button onClick={() => setSourceKind('local')} className={`px-4 py-2 rounded-lg text-sm font-black ${sourceKind === 'local' ? 'bg-white text-emerald-600 shadow' : 'text-white'}`}><i className="fas fa-upload mr-2" />Tải lên</button>
          </div>
          <div className="mt-4">
            {sourceKind === 'youtube' ? (
              <label className="block text-sm font-bold">Link YouTube
                <input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="mt-2 w-full rounded-xl bg-white text-slate-900 px-4 py-3 outline-none ring-2 ring-transparent focus:ring-emerald-200" />
              </label>
            ) : (
              <label className="block rounded-xl bg-white/15 border border-white/30 p-4 cursor-pointer">
                <span className="font-black"><i className="fas fa-file-video mr-2" />{localFile?.name ?? (lesson?.source.kind === 'local' ? lesson.source.fileName : 'Chọn video MP4/WebM trên máy')}</span>
                <span className="block text-xs text-emerald-50 mt-1">Vì quyền riêng tư, tệp video không được lưu sau khi đóng hoặc tải lại trang.</span>
                <input type="file" accept="video/*" className="hidden" onChange={(event) => setLocalFile(event.target.files?.[0])} />
              </label>
            )}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <h2 className="font-black text-lg mb-4">Thông tin bài học</h2>
          <div className="grid sm:grid-cols-[1fr_150px_190px] gap-4">
            <label className="text-sm font-bold">Tên bài học<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Giao tiếp ở cửa hàng" className="mt-2 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-4 py-3 outline-none focus:border-emerald-500" /></label>
            <label className="text-sm font-bold">Cấp độ<select value={level} onChange={(event) => setLevel(event.target.value as ShadowingLevel)} className="mt-2 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-4 py-3 outline-none focus:border-emerald-500"><option>N5</option><option>N4</option><option>N3</option><option>Khác</option></select></label>
            <label className="text-sm font-bold">Chủ đề<select value={topic} onChange={(event) => setTopic(event.target.value as ShadowingTopic)} className="mt-2 w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-4 py-3 outline-none focus:border-emerald-500"><option>Mới bắt đầu</option><option>Giao tiếp</option><option>Podcast</option><option>Tin tức</option><option>Phim &amp; Anime</option><option>Giáo dục</option><option>Văn hóa</option><option>Khác</option></select></label>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div><h2 className="font-black text-lg">Phụ đề theo mốc thời gian</h2><p className="text-sm text-slate-500">Nhập một SRT/VTT tổng hợp có các dòng [JA], [RO], [VI] để tự điền tiếng Nhật, Romaji và nghĩa Việt. Vẫn hỗ trợ hai tệp Nhật–Việt riêng. Mỗi trang hiển thị tối đa {SEGMENTS_PER_PAGE} câu.</p></div>
            <div className="flex flex-wrap gap-2">
              <label className={`px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm ${isBusy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}><i className="fas fa-closed-captioning mr-2" />SRT Nhật / tổng hợp<input disabled={isBusy} type="file" accept=".srt,.vtt,text/vtt" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; void importJapanese(file); }} /></label>
              <label className={`px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 font-bold text-sm ${isBusy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}><i className="fas fa-language mr-2" />Bản dịch Việt<input disabled={isBusy} type="file" accept=".srt,.vtt,text/vtt" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; void importVietnamese(file); }} /></label>
            </div>
          </div>

          {message && <div role="status" className="mb-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 px-4 py-3 text-sm font-bold"><i className="fas fa-circle-info mr-2" />{message}</div>}

          {segments.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
              <span className="text-sm font-black text-emerald-800 dark:text-emerald-200"><i className="fas fa-list-ol mr-2" />{segments.length} câu · đang xem {visibleStart + 1}–{Math.min(visibleStart + SEGMENTS_PER_PAGE, segments.length)}</span>
              {segmentPageCount > 1 && (
                <div className="flex items-center gap-2">
                  <button type="button" disabled={safeSegmentPage === 0} onClick={() => setSegmentPage(Math.max(0, safeSegmentPage - 1))} className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 disabled:opacity-35" aria-label="Trang phụ đề trước"><i className="fas fa-chevron-left" /></button>
                  <span className="min-w-20 text-center text-sm font-bold">Trang {safeSegmentPage + 1}/{segmentPageCount}</span>
                  <button type="button" disabled={safeSegmentPage === segmentPageCount - 1} onClick={() => setSegmentPage(Math.min(segmentPageCount - 1, safeSegmentPage + 1))} className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 disabled:opacity-35" aria-label="Trang phụ đề tiếp"><i className="fas fa-chevron-right" /></button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            {visibleSegments.map((segment, index) => (
              <article key={segment.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4">
                <div className="flex items-center justify-between gap-3 mb-3"><div className="font-black text-sm text-emerald-600">Câu {visibleStart + index + 1}</div><button disabled={isBusy} onClick={() => setSegments((current) => current.filter((item) => item.id !== segment.id))} className="w-8 h-8 text-slate-400 hover:text-red-500 disabled:opacity-35 disabled:cursor-not-allowed" aria-label={`Xóa câu ${visibleStart + index + 1}`}><i className="fas fa-trash" /></button></div>
                <div className="grid grid-cols-2 sm:grid-cols-[130px_130px_1fr] gap-3">
                  <label className="text-xs font-bold text-slate-500">Bắt đầu (giây)<input disabled={isBusy} type="number" min="0" step="0.1" value={segment.startTime} onChange={(event) => updateSegment(segment.id, { startTime: Number(event.target.value) })} className="mt-1 w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white disabled:opacity-60" /></label>
                  <label className="text-xs font-bold text-slate-500">Kết thúc (giây)<input disabled={isBusy} type="number" min="0" step="0.1" value={segment.endTime} onChange={(event) => updateSegment(segment.id, { endTime: Number(event.target.value) })} className="mt-1 w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white disabled:opacity-60" /></label>
                  <label className="col-span-2 sm:col-span-1 text-xs font-bold text-slate-500">Câu tiếng Nhật<input disabled={isBusy} value={segment.japanese} onChange={(event) => updateSegment(segment.id, { japanese: event.target.value })} className="font-japanese mt-1 w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white disabled:opacity-60" /></label>
                  <label className="col-span-2 sm:col-start-3 text-xs font-bold text-slate-500">Romaji (cách đọc)<input disabled={isBusy} value={segment.reading} onChange={(event) => updateSegment(segment.id, { reading: event.target.value })} className="mt-1 w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white disabled:opacity-60" /></label>
                  <label className="col-span-2 sm:col-start-3 text-xs font-bold text-slate-500">Nghĩa tiếng Việt<input disabled={isBusy} value={segment.meaning} onChange={(event) => updateSegment(segment.id, { meaning: event.target.value })} className="mt-1 w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white disabled:opacity-60" /></label>
                </div>
              </article>
            ))}
          </div>

          <button disabled={isBusy} onClick={() => { setSegmentPage(Math.floor(segments.length / SEGMENTS_PER_PAGE)); setSegments((current) => [...current, makeBlankSegment(current.at(-1))]); }} className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed"><i className="fas fa-plus mr-2" />Thêm câu thủ công</button>
        </section>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button onClick={closeEditor} className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-black">Hủy</button>
          <button disabled={isBusy} onClick={handleSave} className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black shadow-lg shadow-emerald-200 dark:shadow-none"><i className="fas fa-play mr-2" />Lưu và mở phòng luyện</button>
        </div>
      </main>
    </div>
  );
}
