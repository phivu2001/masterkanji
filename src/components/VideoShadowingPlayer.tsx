"use client";

import { useEffect, useRef, useState } from 'react';
import { createShadowingSrtFileName, formatShadowingTime, serializeShadowingSrt, type ShadowingLesson } from '@/lib/shadowing';

type YoutubePlayer = {
  destroy?: () => void;
  getCurrentTime?: () => number;
  getPlayerState?: () => number;
  pauseVideo?: () => void;
  playVideo?: () => void;
  seekTo?: (seconds: number, allowSeekAhead: boolean) => void;
  setPlaybackRate?: (rate: number) => void;
};

type YoutubeApi = {
  Player: new (element: HTMLElement, options: {
    videoId: string;
    width: string;
    height: string;
    playerVars: Record<string, number | string>;
    events: {
      onReady: () => void;
      onStateChange: (event: { data: number }) => void;
      onError: () => void;
    };
  }) => YoutubePlayer;
};

declare global {
  interface Window {
    YT?: YoutubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YoutubeApi> | null = null;

const loadYoutubeApi = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('YouTube chỉ hoạt động trên trình duyệt.'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YoutubeApi>((resolve, reject) => {
    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      existingCallback?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error('Không thể khởi tạo trình phát YouTube.'));
    };

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (existingScript) return;
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => reject(new Error('Không tải được YouTube Player API. Hãy kiểm tra kết nối mạng.'));
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
};

type Props = {
  lesson: ShadowingLesson;
  localFile?: File;
  onBack: () => void;
  onEdit?: () => void;
  onLocalFileSelected: (file: File) => void;
};

type SelfRating = 'again' | 'hard' | 'good';
type PlaybackMode = 'continuous' | 'loop' | 'shadowing';
const SHADOWING_PAUSE_MS = 2_500;

export function VideoShadowingPlayer({ lesson, localFile, onBack, onEdit, onLocalFileSelected }: Props) {
  const youtubeHostRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<YoutubePlayer | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const focusStageRef = useRef<HTMLDivElement>(null);
  const playbackRateRef = useRef(0.85);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const shadowingTimerRef = useRef<number | null>(null);
  const transcriptListRef = useRef<HTMLDivElement>(null);
  const activeTranscriptRef = useRef<HTMLElement | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [isFocusFullscreen, setIsFocusFullscreen] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('continuous');
  const [isShadowingPause, setIsShadowingPause] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.85);
  const [showReading, setShowReading] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [mediaMessage, setMediaMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, SelfRating>>({});
  const [transcriptQuery, setTranscriptQuery] = useState('');

  const selectedSegment = lesson.segments[selectedIndex] ?? lesson.segments[0];
  const ratedCount = Object.keys(ratings).length;
  const lessonEndTime = lesson.segments.at(-1)?.endTime ?? 0;
  const playbackProgress = lessonEndTime > 0 ? Math.min(100, Math.max(0, (currentTime / lessonEndTime) * 100)) : 0;
  const normalizedTranscriptQuery = transcriptQuery.trim().toLocaleLowerCase('vi');
  const transcriptItems = lesson.segments
    .map((segment, index) => ({ segment, index }))
    .filter(({ segment }) => !normalizedTranscriptQuery || [segment.japanese, segment.reading, segment.meaning]
      .some((value) => value.toLocaleLowerCase('vi').includes(normalizedTranscriptQuery)));

  const downloadSrt = () => {
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

  useEffect(() => {
    if (!localFile) {
      const frame = requestAnimationFrame(() => setLocalVideoUrl(null));
      return () => cancelAnimationFrame(frame);
    }
    const url = URL.createObjectURL(localFile);
    const frame = requestAnimationFrame(() => setLocalVideoUrl(url));
    return () => {
      cancelAnimationFrame(frame);
      URL.revokeObjectURL(url);
    };
  }, [localFile]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFocusFullscreen(document.fullscreenElement === focusStageRef.current);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (lesson.source.kind !== 'youtube' || !youtubeHostRef.current) return;
    let cancelled = false;
    const host = youtubeHostRef.current;

    void loadYoutubeApi().then((api) => {
      if (cancelled) return;
      youtubePlayerRef.current = new api.Player(host, {
        videoId: lesson.source.kind === 'youtube' ? lesson.source.videoId : '',
        width: '100%',
        height: '100%',
        playerVars: { controls: 1, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            setMediaReady(true);
            youtubePlayerRef.current?.setPlaybackRate?.(playbackRateRef.current);
          },
          onStateChange: (event) => setIsPlaying(event.data === 1),
          onError: () => setMediaMessage('Video này không cho phép nhúng hoặc không còn khả dụng trên YouTube.'),
        },
      });
    }).catch((error: unknown) => setMediaMessage(error instanceof Error ? error.message : 'Không tải được video YouTube.'));

    return () => {
      cancelled = true;
      youtubePlayerRef.current?.destroy?.();
      youtubePlayerRef.current = null;
    };
  }, [lesson.source]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const youtubePlayer = youtubePlayerRef.current;
      const video = localVideoRef.current;
      const nextTime = lesson.source.kind === 'youtube' ? youtubePlayer?.getCurrentTime?.() : video?.currentTime;
      if (typeof nextTime !== 'number' || !Number.isFinite(nextTime)) return;
      setCurrentTime(nextTime);

      if (playbackMode === 'continuous') {
        const matchingIndex = lesson.segments.findIndex((segment) => nextTime >= segment.startTime && nextTime < segment.endTime);
        if (matchingIndex >= 0 && matchingIndex !== selectedIndex) {
          setSelectedIndex(matchingIndex);
        }
        return;
      }

      if (!isPlaying || !selectedSegment || nextTime < selectedSegment.endTime - 0.04) return;
      if (playbackMode === 'loop') {
        if (lesson.source.kind === 'youtube') youtubePlayer?.seekTo?.(selectedSegment.startTime, true);
        else if (video) video.currentTime = selectedSegment.startTime;
        return;
      }

      if (lesson.source.kind === 'youtube') youtubePlayer?.pauseVideo?.();
      else video?.pause();
      setIsPlaying(false);
      setIsShadowingPause(true);
      if (shadowingTimerRef.current !== null) return;

      const nextIndex = selectedIndex + 1;
      if (nextIndex >= lesson.segments.length) {
        setIsShadowingPause(false);
        return;
      }
      shadowingTimerRef.current = window.setTimeout(() => {
        shadowingTimerRef.current = null;
        const nextSegment = lesson.segments[nextIndex];
        setSelectedIndex(nextIndex);
        setIsShadowingPause(false);
        if (lesson.source.kind === 'youtube') {
          youtubePlayerRef.current?.seekTo?.(nextSegment.startTime, true);
          youtubePlayerRef.current?.playVideo?.();
        } else if (localVideoRef.current) {
          localVideoRef.current.currentTime = nextSegment.startTime;
          void localVideoRef.current.play();
        }
        setCurrentTime(nextSegment.startTime);
        setIsPlaying(true);
      }, SHADOWING_PAUSE_MS);
    }, 100);
    return () => window.clearInterval(timer);
  }, [isPlaying, lesson.segments, lesson.source.kind, playbackMode, selectedIndex, selectedSegment]);

  useEffect(() => {
    if (!activeTranscriptRef.current || !transcriptListRef.current || normalizedTranscriptQuery) return;
    const list = transcriptListRef.current;
    const active = activeTranscriptRef.current;
    list.scrollTo({
      top: active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2,
      behavior: 'smooth',
    });
  }, [normalizedTranscriptQuery, selectedIndex]);

  useEffect(() => () => {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl);
  }, [recordingUrl]);

  useEffect(() => () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    if (shadowingTimerRef.current !== null) window.clearTimeout(shadowingTimerRef.current);
  }, []);

  const seek = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    if (lesson.source.kind === 'youtube') youtubePlayerRef.current?.seekTo?.(safeSeconds, true);
    else if (localVideoRef.current) localVideoRef.current.currentTime = safeSeconds;
    setCurrentTime(safeSeconds);
  };

  const playSelected = (index = selectedIndex) => {
    const segment = lesson.segments[index];
    if (!segment) return;
    if (shadowingTimerRef.current !== null) window.clearTimeout(shadowingTimerRef.current);
    shadowingTimerRef.current = null;
    setIsShadowingPause(false);
    setSelectedIndex(index);
    seek(segment.startTime);
    if (lesson.source.kind === 'youtube') youtubePlayerRef.current?.playVideo?.();
    else void localVideoRef.current?.play();
    setIsPlaying(true);
  };

  const togglePlayback = () => {
    if (!mediaReady) return;
    if (shadowingTimerRef.current !== null) window.clearTimeout(shadowingTimerRef.current);
    shadowingTimerRef.current = null;
    setIsShadowingPause(false);
    if (isPlaying) {
      if (lesson.source.kind === 'youtube') youtubePlayerRef.current?.pauseVideo?.();
      else localVideoRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    if (playbackMode !== 'continuous') {
      const insideSelected = currentTime >= selectedSegment.startTime && currentTime < selectedSegment.endTime;
      if (!insideSelected) seek(selectedSegment.startTime);
    }
    if (lesson.source.kind === 'youtube') youtubePlayerRef.current?.playVideo?.();
    else void localVideoRef.current?.play();
    setIsPlaying(true);
  };

  const changePlaybackMode = (mode: PlaybackMode) => {
    if (shadowingTimerRef.current !== null) window.clearTimeout(shadowingTimerRef.current);
    shadowingTimerRef.current = null;
    setIsShadowingPause(false);
    setPlaybackMode(mode);
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    playbackRateRef.current = rate;
    youtubePlayerRef.current?.setPlaybackRate?.(rate);
    if (localVideoRef.current) localVideoRef.current.playbackRate = rate;
  };

  const toggleFocusFullscreen = async () => {
    setMediaMessage('');
    try {
      if (document.fullscreenElement === focusStageRef.current) {
        await document.exitFullscreen();
      } else {
        await focusStageRef.current?.requestFullscreen();
      }
    } catch {
      setMediaMessage('Trình duyệt chưa cho phép mở toàn màn hình video và phụ đề.');
    }
  };

  const moveSegment = (direction: -1 | 1) => {
    const nextIndex = Math.min(lesson.segments.length - 1, Math.max(0, selectedIndex + direction));
    playSelected(nextIndex);
  };

  const toggleRecording = async () => {
    setMediaMessage('');
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMediaMessage('Trình duyệt này chưa hỗ trợ thu âm trực tiếp.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      recordingStreamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setRecordingUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return URL.createObjectURL(blob);
        });
        recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
        setIsRecording(false);
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      setMediaMessage('Không thể dùng micro. Hãy cấp quyền micro cho localhost rồi thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-28">
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto h-16 px-4 sm:px-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onBack} className="w-10 h-10 shrink-0 rounded-full border border-slate-700 hover:bg-slate-800" aria-label="Về thư viện Shadowing"><i className="fas fa-chevron-left" /></button>
            <div className="hidden sm:block font-black text-lg">Kanji<span className="text-emerald-400">Master</span></div>
          </div>
          <div className="text-center min-w-0"><h1 className="font-black truncate max-w-[45vw]">{lesson.title}</h1><p className="text-xs text-slate-400">{lesson.level} · Câu {selectedIndex + 1}/{lesson.segments.length}</p></div>
          <div className="flex gap-2">
            <button onClick={downloadSrt} className="ml-auto w-10 h-10 rounded-full border border-emerald-700 text-emerald-300 hover:bg-emerald-950" aria-label="Tải file SRT"><i className="fas fa-download" /></button>
            {onEdit && <button onClick={onEdit} className="w-10 h-10 rounded-full border border-slate-700 hover:bg-slate-800" aria-label="Sửa bài Shadowing"><i className="fas fa-pen" /></button>}
          </div>
        </div>
        <div className="h-1 bg-slate-800"><div className="h-full bg-emerald-400 transition-[width] duration-200" style={{ width: `${playbackProgress}%` }} /></div>
      </header>

      <main className="max-w-[1600px] mx-auto px-3 pb-3 pt-2 sm:px-5 sm:pb-5 sm:pt-3">
        <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.54fr)] gap-4 xl:items-start">
          <div className="space-y-4">
            <div ref={focusStageRef} className={isFocusFullscreen ? 'relative h-full w-full overflow-hidden bg-slate-950 p-3 sm:p-5 flex flex-col gap-4' : 'space-y-4'}>
              {isFocusFullscreen && (
                <button type="button" onClick={() => void toggleFocusFullscreen()} className="absolute right-5 top-5 z-30 w-11 h-11 rounded-full border border-slate-600 bg-slate-950/80 text-white backdrop-blur hover:bg-slate-800" aria-label="Thoát toàn màn hình" title="Thoát toàn màn hình">
                  <i className="fas fa-compress" />
                </button>
              )}

              <div className={isFocusFullscreen ? 'flex-1 min-h-0 flex items-start justify-center' : ''}>
                <section className={`${isFocusFullscreen ? 'h-full max-w-full aspect-video rounded-2xl' : 'w-full rounded-2xl sm:rounded-3xl'} overflow-hidden bg-black border border-slate-800 shadow-2xl`}>
                  <div className={isFocusFullscreen ? 'h-full relative' : 'aspect-video relative'}>
                    {lesson.source.kind === 'youtube' ? <div ref={youtubeHostRef} className="absolute inset-0" /> : localVideoUrl ? (
                      <video ref={localVideoRef} src={localVideoUrl} controls playsInline className="absolute inset-0 w-full h-full" onLoadedMetadata={() => { setMediaReady(true); if (localVideoRef.current) localVideoRef.current.playbackRate = playbackRate; }} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900 cursor-pointer">
                        <span className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-2xl mb-4"><i className="fas fa-file-video" /></span>
                        <strong>Chọn lại video “{lesson.source.fileName}”</strong>
                        <span className="text-sm text-slate-400 mt-2 max-w-md">Trình duyệt không lưu tệp video local sau khi tải lại trang. Nội dung bài và phụ đề vẫn còn nguyên.</span>
                        <input type="file" accept="video/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onLocalFileSelected(file); }} />
                      </label>
                    )}
                  </div>
                </section>
              </div>

              <section className={`shrink-0 rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:px-5 sm:py-4 ${isFocusFullscreen ? 'max-h-[34vh] overflow-y-auto' : ''}`}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-[11px] uppercase tracking-[0.18em] font-black text-emerald-400">
                    {playbackMode === 'continuous' ? 'Phát liên tục' : playbackMode === 'loop' ? 'Luyện một câu' : isShadowingPause ? 'Đến lượt bạn nói' : 'Nghe và nói theo'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{formatShadowingTime(currentTime)} / {formatShadowingTime(selectedSegment.endTime)}</span>
                </div>
                <p className="font-japanese text-xl sm:text-3xl leading-relaxed font-black">{selectedSegment.japanese}</p>
                {showReading && selectedSegment.reading && <p className="text-sm sm:text-base text-emerald-300 mt-2">{selectedSegment.reading}</p>}
                {showMeaning && selectedSegment.meaning && <p className="text-sm sm:text-base text-slate-300 mt-1.5">{selectedSegment.meaning}</p>}
              </section>
            </div>

            {mediaMessage && <div role="alert" className="rounded-xl border border-amber-700/50 bg-amber-950/40 text-amber-200 px-4 py-3 text-sm"><i className="fas fa-circle-info mr-2" />{mediaMessage}</div>}

            <section className="rounded-2xl bg-slate-900 border border-slate-800 p-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 pr-2 sm:pr-3 sm:border-r border-slate-700">
                  <button onClick={() => moveSegment(-1)} disabled={selectedIndex === 0} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30" aria-label="Câu trước"><i className="fas fa-backward-step" /></button>
                  <button onClick={togglePlayback} disabled={!mediaReady} className="w-14 h-14 rounded-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-slate-950 text-lg shadow-lg shadow-emerald-950" aria-label={isPlaying ? 'Tạm dừng' : playbackMode === 'continuous' ? 'Phát liên tục' : 'Phát câu'}><i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} /></button>
                  <button onClick={() => moveSegment(1)} disabled={selectedIndex === lesson.segments.length - 1} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30" aria-label="Câu tiếp"><i className="fas fa-forward-step" /></button>
                </div>

                <div className="flex flex-1 min-w-[260px] rounded-xl bg-slate-950 p-1">
                  {([
                    ['continuous', 'fa-infinity', 'Liên tục'],
                    ['loop', 'fa-repeat', 'Lặp câu'],
                    ['shadowing', 'fa-headphones', 'Shadowing'],
                  ] as const).map(([mode, icon, label]) => (
                    <button key={mode} onClick={() => changePlaybackMode(mode)} aria-pressed={playbackMode === mode} className={`flex-1 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-black whitespace-nowrap transition-colors ${playbackMode === mode ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}><i className={`fas ${icon} mr-1.5`} />{label}</button>
                  ))}
                </div>

                <div className="flex rounded-xl bg-slate-950 p-1">
                  {[0.65, 0.85, 1].map((rate) => <button key={rate} onClick={() => changeRate(rate)} className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-black ${playbackRate === rate ? 'bg-white text-slate-900' : 'text-slate-400'}`}>{rate}x</button>)}
                </div>

                <button onClick={() => setShowReading((current) => !current)} aria-pressed={showReading} className={`px-3 py-2.5 rounded-xl text-sm font-bold ${showReading ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/50' : 'bg-slate-800 text-slate-400'}`}><i className="fas fa-language mr-1.5" />Romaji</button>
                <button onClick={() => setShowMeaning((current) => !current)} aria-pressed={showMeaning} className={`px-3 py-2.5 rounded-xl text-sm font-bold ${showMeaning ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/50' : 'bg-slate-800 text-slate-400'}`}><i className="fas fa-closed-captioning mr-1.5" />Bản dịch</button>
                <button onClick={() => void toggleRecording()} className={`w-11 h-11 rounded-full border text-white ${isRecording ? 'bg-red-500 border-red-400 animate-pulse' : 'bg-slate-800 border-violet-600 hover:bg-violet-600'}`} aria-label={isRecording ? 'Dừng thu âm' : 'Thu giọng của bạn'} title={isRecording ? 'Dừng thu âm' : 'Thu giọng của bạn'}><i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`} /></button>
                <button type="button" onClick={() => void toggleFocusFullscreen()} className="w-11 h-11 rounded-full border border-slate-700 bg-slate-800 text-white hover:bg-slate-700" aria-label="Toàn màn hình video và phụ đề" title="Toàn màn hình video và phụ đề"><i className="fas fa-expand" /></button>
              </div>

              {(isRecording || recordingUrl) && (
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-violet-950/40 border border-violet-800/50 px-3 py-2.5">
                  <span className={`text-xs font-black ${isRecording ? 'text-red-300' : 'text-violet-300'}`}><i className={`fas ${isRecording ? 'fa-circle animate-pulse' : 'fa-wave-square'} mr-2`} />{isRecording ? 'Đang thu giọng của bạn…' : 'Bản thu gần nhất'}</span>
                  {recordingUrl && <audio src={recordingUrl} controls className="h-9 flex-1 min-w-0" />}
                </div>
              )}
            </section>
          </div>

          <aside className="xl:h-[calc(100vh-6.75rem)] xl:sticky xl:top-20 min-h-[560px] rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 bg-slate-900/95">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="font-black text-lg">Kịch bản luyện nói</h2><p className="text-xs text-slate-400">Tự cuộn theo video · Chạm để phát từng đoạn</p></div>
                <span className="shrink-0 rounded-full bg-slate-800 px-3 py-1 text-xs font-bold">{lesson.segments.length} câu</span>
              </div>
              <label className="mt-3 flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 focus-within:border-emerald-500">
                <i className="fas fa-magnifying-glass text-slate-500" />
                <input value={transcriptQuery} onChange={(event) => setTranscriptQuery(event.target.value)} placeholder="Tìm tiếng Nhật, Romaji hoặc nghĩa…" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-600" />
                {transcriptQuery && <button type="button" onClick={() => setTranscriptQuery('')} className="text-slate-500 hover:text-white" aria-label="Xóa tìm kiếm"><i className="fas fa-xmark" /></button>}
              </label>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-slate-300">Đã luyện {ratedCount}/{lesson.segments.length} câu</span>
                <span className="font-mono text-emerald-300">{Math.round((ratedCount / lesson.segments.length) * 100)}%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full rounded-full bg-emerald-400 transition-[width]" style={{ width: `${(ratedCount / lesson.segments.length) * 100}%` }} /></div>
            </div>
            <div ref={transcriptListRef} className="flex-1 overflow-y-auto divide-y divide-slate-800 scroll-smooth">
              {transcriptItems.map(({ segment, index }) => {
                const isActive = index === selectedIndex;
                const rating = ratings[segment.id];
                return (
                  <article ref={isActive ? activeTranscriptRef : undefined} key={segment.id} className={`relative p-4 transition-colors ${isActive ? 'bg-emerald-950/60 border-l-4 border-emerald-400' : 'border-l-4 border-transparent hover:bg-slate-800/70'}`}>
                    <button onClick={() => playSelected(index)} className="w-full text-left">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-xs font-mono font-bold ${isActive ? 'text-emerald-300' : 'text-slate-500'}`}>{formatShadowingTime(segment.startTime)} — {formatShadowingTime(segment.endTime)}</span>
                        {isActive ? <span className="rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 text-[10px] font-black"><i className="fas fa-wave-square mr-1" />Đang phát</span> : rating && <span className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center ${rating === 'good' ? 'bg-emerald-500 text-slate-950' : rating === 'hard' ? 'bg-amber-500 text-slate-950' : 'bg-red-500 text-white'}`}><i className={`fas ${rating === 'good' ? 'fa-check' : rating === 'hard' ? 'fa-bolt' : 'fa-rotate-left'}`} /></span>}
                      </div>
                      <p className="font-japanese text-lg font-bold leading-relaxed">{segment.japanese}</p>
                      {showReading && segment.reading && <p className="text-sm text-emerald-300 mt-1">{segment.reading}</p>}
                      {showMeaning && segment.meaning && <p className="text-sm text-slate-400 mt-2">{segment.meaning}</p>}
                    </button>
                    {index === selectedIndex && <div className="grid grid-cols-3 gap-2 mt-3"><button onClick={() => setRatings((current) => ({ ...current, [segment.id]: 'again' }))} className="py-2 rounded-lg bg-red-500/15 text-red-300 text-xs font-black">Lại</button><button onClick={() => setRatings((current) => ({ ...current, [segment.id]: 'hard' }))} className="py-2 rounded-lg bg-amber-500/15 text-amber-300 text-xs font-black">Khó</button><button onClick={() => setRatings((current) => ({ ...current, [segment.id]: 'good' }))} className="py-2 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-black">Tốt</button></div>}
                  </article>
                );
              })}
              {transcriptItems.length === 0 && <div className="p-8 text-center text-sm text-slate-500"><i className="fas fa-magnifying-glass mb-3 text-xl block" />Không tìm thấy câu phù hợp.</div>}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
