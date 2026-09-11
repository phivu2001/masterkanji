export type ShadowingLevel = 'N5' | 'N4' | 'N3' | 'Khác';
export type ShadowingTopic = 'Mới bắt đầu' | 'Giao tiếp' | 'Podcast' | 'Tin tức' | 'Phim & Anime' | 'Giáo dục' | 'Văn hóa' | 'Khác';

export type ShadowingSegment = {
  id: string;
  startTime: number;
  endTime: number;
  japanese: string;
  reading: string;
  meaning: string;
};

export type ShadowingSource =
  | { kind: 'youtube'; videoId: string; url: string }
  | { kind: 'local'; fileName: string };

export type ShadowingLesson = {
  id: string;
  title: string;
  level: ShadowingLevel;
  topic: ShadowingTopic;
  source: ShadowingSource;
  segments: ShadowingSegment[];
  createdAt: number;
  updatedAt: number;
};

const cueTimePattern = /(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[,.](\d{1,3}))?/;
const cueTimingLinePattern = /^\s*((?:(?:\d{1,2}):)?\d{1,2}:\d{2}(?:[,.]\d{1,3})?)\s*-->\s*((?:(?:\d{1,2}):)?\d{1,2}:\d{2}(?:[,.]\d{1,3})?)(?:\s+.*)?$/;

export const createShadowingId = (prefix = 'shadowing') => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export const parseYouTubeVideoId = (input: string): string | null => {
  const value = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      const fromQuery = url.searchParams.get('v');
      if (fromQuery && /^[a-zA-Z0-9_-]{11}$/.test(fromQuery)) return fromQuery;
      const parts = url.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live'].includes(parts[0] ?? '') && /^[a-zA-Z0-9_-]{11}$/.test(parts[1] ?? '')) return parts[1];
    }
  } catch {
    return null;
  }

  return null;
};

export const parseShadowingTime = (input: string): number | null => {
  const value = input.trim();
  if (/^\d+(?:\.\d+)?$/.test(value)) return Number(value);
  const match = value.match(cueTimePattern);
  if (!match) return null;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const milliseconds = Number((match[4] ?? '').padEnd(3, '0')) || 0;
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
};

export const formatShadowingTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const wholeSeconds = Math.floor(safeSeconds % 60);
  const tenths = Math.floor((safeSeconds % 1) * 10);
  const base = `${String(minutes).padStart(2, '0')}:${String(wholeSeconds).padStart(2, '0')}.${tenths}`;
  return hours > 0 ? `${String(hours).padStart(2, '0')}:${base}` : base;
};

const formatSrtTime = (seconds: number) => {
  const totalMilliseconds = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(totalMilliseconds / 3_600_000);
  const minutes = Math.floor((totalMilliseconds % 3_600_000) / 60_000);
  const wholeSeconds = Math.floor((totalMilliseconds % 60_000) / 1000);
  const milliseconds = totalMilliseconds % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(wholeSeconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
};

type SerializableShadowingSegment = Pick<ShadowingSegment, 'startTime' | 'endTime' | 'japanese'>
  & Partial<Pick<ShadowingSegment, 'reading' | 'meaning'>>;

export const serializeShadowingSrt = (segments: SerializableShadowingSegment[]) => segments
  .filter((segment) => (
    Number.isFinite(segment.startTime)
    && Number.isFinite(segment.endTime)
    && segment.endTime > segment.startTime
    && segment.japanese.trim().length > 0
  ))
  .map((segment, index) => {
    const japanese = segment.japanese.replace(/\r?\n/g, ' ').trim();
    const reading = segment.reading?.replace(/\r?\n/g, ' ').trim() ?? '';
    const meaning = segment.meaning?.replace(/\r?\n/g, ' ').trim() ?? '';
    const cueText = reading || meaning
      ? [`[JA] ${japanese}`, ...(reading ? [`[RO] ${reading}`] : []), ...(meaning ? [`[VI] ${meaning}`] : [])]
      : [japanese];
    return [
      String(index + 1),
      `${formatSrtTime(segment.startTime)} --> ${formatSrtTime(segment.endTime)}`,
      ...cueText,
    ].join('\r\n');
  })
  .join('\r\n\r\n');

export const createShadowingSrtFileName = (title: string) => {
  const normalized = title.normalize('NFKC').replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-').replace(/\s+/g, ' ').trim();
  return `${normalized.slice(0, 100) || 'shadowing'}.srt`;
};

const cleanCueText = (text: string) => text
  .replace(/<br\s*\/?>/gi, ' ')
  .replace(/<[^>]+>/g, '')
  .replace(/\{\\[^}]+}/g, '')
  .replace(/\s+/g, ' ')
  .trim();

type SubtitleCueField = 'japanese' | 'reading' | 'meaning';

const normalizeSubtitleTag = (tag: string) => tag
  .normalize('NFD')
  .replace(/\p{M}/gu, '')
  .replace(/[\s_-]+/g, '')
  .toLowerCase();

const subtitleTagFields: Record<string, SubtitleCueField> = {
  ja: 'japanese',
  jp: 'japanese',
  jpn: 'japanese',
  japanese: 'japanese',
  '日本語': 'japanese',
  nhat: 'japanese',
  tiengnhat: 'japanese',
  ro: 'reading',
  romaji: 'reading',
  reading: 'reading',
  cachdoc: 'reading',
  vi: 'meaning',
  vn: 'meaning',
  vie: 'meaning',
  vietnamese: 'meaning',
  nghia: 'meaning',
  tiengviet: 'meaning',
};

const parseTaggedCueLine = (line: string): { field: SubtitleCueField; text: string } | null => {
  const bracketed = line.match(/^\s*\[\s*([^\]]{1,24})\s*\]\s*(.*)$/u);
  const labelled = bracketed ?? line.match(/^\s*([^:：]{1,24})\s*[:：]\s*(.*)$/u);
  if (!labelled) return null;
  const field = subtitleTagFields[normalizeSubtitleTag(labelled[1])];
  return field ? { field, text: labelled[2] } : null;
};

const hasJapaneseText = (text: string) => /[ぁ-んァ-ヶ一-龯]/u.test(text);

const parseCueText = (cueLines: string[]) => {
  const cleanedLines = cueLines.map(cleanCueText).filter(Boolean);
  const fields: Record<SubtitleCueField, string[]> = { japanese: [], reading: [], meaning: [] };
  const untagged: string[] = [];
  let activeField: SubtitleCueField | null = null;
  let hasTags = false;

  for (const line of cleanedLines) {
    const tagged = parseTaggedCueLine(line);
    if (tagged) {
      hasTags = true;
      activeField = tagged.field;
      const text = cleanCueText(tagged.text);
      if (text) fields[activeField].push(text);
    } else if (hasTags && activeField) {
      fields[activeField].push(line);
    } else {
      untagged.push(line);
    }
  }

  if (hasTags) {
    if (untagged.length > 0) fields.japanese.unshift(...untagged);
    const taggedJapanese = cleanCueText(fields.japanese.join(' '));
    const reading = cleanCueText(fields.reading.join(' '));
    const meaning = cleanCueText(fields.meaning.join(' '));
    return {
      japanese: taggedJapanese || meaning || reading,
      reading: taggedJapanese ? reading : '',
      meaning,
    };
  }

  if (
    cleanedLines.length >= 3
    && hasJapaneseText(cleanedLines[0])
    && !hasJapaneseText(cleanedLines[1])
    && cleanedLines.slice(2).every((line) => !hasJapaneseText(line))
  ) {
    return {
      japanese: cleanedLines[0],
      reading: cleanedLines[1],
      meaning: cleanCueText(cleanedLines.slice(2).join(' ')),
    };
  }

  return { japanese: cleanCueText(cleanedLines.join(' ')), reading: '', meaning: '' };
};

export const parseSubtitleFile = (input: string): ShadowingSegment[] => {
  const normalized = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim();
  if (!normalized) return [];

  const lines = normalized.split('\n');
  const segments: ShadowingSegment[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const timing = lines[index].match(cueTimingLinePattern);
    if (!timing) continue;
    const startTime = parseShadowingTime(timing[1]);
    const endTime = parseShadowingTime(timing[2]);
    if (startTime === null || endTime === null || endTime <= startTime) continue;

    const cueLines: string[] = [];
    let cursor = index + 1;
    let sawBlankLine = false;
    while (cursor < lines.length) {
      const line = lines[cursor];
      if (cueTimingLinePattern.test(line)) break;

      if (line.trim() === '') {
        sawBlankLine = true;
        cursor += 1;
        continue;
      }

      const nextLineIsTiming = cursor + 1 < lines.length && cueTimingLinePattern.test(lines[cursor + 1]);
      const isCueIdentifier = /^\s*\d+\s*$/.test(line) || sawBlankLine;
      if (nextLineIsTiming && isCueIdentifier) {
        cursor += 1;
        break;
      }

      if (!/^(NOTE|STYLE|REGION)(\s|$)/.test(line.trim())) cueLines.push(line);
      sawBlankLine = false;
      cursor += 1;
    }
    index = cursor - 1;

    const { japanese, reading, meaning } = parseCueText(cueLines);
    if (!japanese) continue;
    segments.push({
      id: createShadowingId('cue'),
      startTime,
      endTime,
      japanese,
      reading,
      meaning,
    });
  }

  return segments.sort((a, b) => a.startTime - b.startTime);
};

export const mergeTranslatedSubtitles = (segments: ShadowingSegment[], translated: ShadowingSegment[]) => segments.map((segment, index) => {
  const closest = translated.reduce<ShadowingSegment | null>((best, candidate) => {
    if (!best) return candidate;
    return Math.abs(candidate.startTime - segment.startTime) < Math.abs(best.startTime - segment.startTime) ? candidate : best;
  }, null);
  const aligned = closest && Math.abs(closest.startTime - segment.startTime) <= 1.5 ? closest : translated[index];
  return { ...segment, meaning: aligned?.meaning || aligned?.japanese || segment.meaning };
});

export const sanitizeShadowingLessons = (value: unknown): ShadowingLesson[] => {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is ShadowingLesson => {
    if (!item || typeof item !== 'object') return false;
    const lesson = item as Partial<ShadowingLesson>;
    if (typeof lesson.id !== 'string' || typeof lesson.title !== 'string' || !Array.isArray(lesson.segments) || lesson.segments.length === 0) return false;
    if (!lesson.source || (lesson.source.kind !== 'youtube' && lesson.source.kind !== 'local')) return false;
    return lesson.segments.every((segment) => (
      segment
      && typeof segment.id === 'string'
      && typeof segment.startTime === 'number'
      && typeof segment.endTime === 'number'
      && Number.isFinite(segment.startTime)
      && Number.isFinite(segment.endTime)
      && segment.startTime >= 0
      && segment.endTime > segment.startTime
      && typeof segment.japanese === 'string'
      && segment.japanese.trim().length > 0
    ));
  }).map((lesson) => ({
    ...lesson,
    level: ['N5', 'N4', 'N3', 'Khác'].includes(lesson.level) ? lesson.level : 'Khác',
    topic: ['Mới bắt đầu', 'Giao tiếp', 'Podcast', 'Tin tức', 'Phim & Anime', 'Giáo dục', 'Văn hóa', 'Khác'].includes(lesson.topic) ? lesson.topic : 'Khác',
    segments: lesson.segments.map((segment) => ({
      ...segment,
      reading: typeof segment.reading === 'string' ? segment.reading : '',
      meaning: typeof segment.meaning === 'string' ? segment.meaning : '',
    })),
  }));
};
