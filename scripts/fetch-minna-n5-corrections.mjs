import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const vocabularyFile = path.join(projectDirectory, 'src', 'data', 'vocabulary.ts');
const outputFile = path.join(projectDirectory, 'src', 'data', 'vocabularyN5Corrections.ts');

const decodeHtml = (value) => value
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>');

const cellLines = (html) => decodeHtml(html)
  .replace(/<br\s*\/?\s*>/gi, '\n')
  .replace(/<[^>]+>/g, '')
  .split('\n')
  .map((line) => line.replace(/\s+/g, ' ').trim())
  .filter(Boolean);

const readingPattern = /([一-龯々〆ヶ]+)[（(]([ぁ-んァ-ンー・\s]+)[）)]/g;
const cleanReading = (value) => value
  .replace(readingPattern, '$2')
  .replace(/\[な\]$/, '')
  .replace(/\[([^\]]+)\]/g, '$1')
  .replace(/\s*[,、]\s*/g, '／')
  .replace(/^／+|／+$/g, '')
  .replace(/\s+/g, '')
  .trim();

const parseLesson = (lesson, html) => {
  const vocabulary = [];
  for (const row of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => cellLines(match[1]));
    if (cells.length !== 3 || cells[0].length === 0 || cells[2].length === 0) continue;
    const reading = cleanReading(cells[0][0]);
    if (reading) vocabulary.push({ lesson, reading });
  }
  return vocabulary;
};

const lessons = Array.from({ length: 25 }, (_, index) => index + 1);
const lessonData = await Promise.all(lessons.map(async (lesson) => {
  const response = await fetch(`https://jtest.net/tu-vung-minna/bai-${lesson}`, { headers: { 'user-agent': 'KanjiMaster vocabulary importer/1.0' } });
  if (!response.ok) throw new Error(`Bài ${lesson}: HTTP ${response.status}`);
  return parseLesson(lesson, await response.text());
}));
const fetched = lessonData.flat();

const source = fs.readFileSync(vocabularyFile, 'utf8');
const rawMatch = source.match(/const rawMinnaN5Vocabulary = (\[[\s\S]*?\]) as const satisfies readonly RawVocabularyInfo\[\];/);
if (!rawMatch) throw new Error('Không tìm thấy rawMinnaN5Vocabulary');
const current = JSON.parse(rawMatch[1]);
if (current.length !== fetched.length) throw new Error(`Số dòng không khớp: source=${current.length}, fetched=${fetched.length}`);

const hasKanji = (value) => /[一-龯々〆ヶ]/.test(value);
const readingOverrides = new Map([
  ['初めまして', 'はじめまして'],
  ['～から来ました', '～からきました'],
  ['失礼ですが', 'しつれいですが'],
  ['お名前は？', 'おなまえは？'],
  ['韓国', 'かんこく'],
  ['中国', 'ちゅうごく'],
  ['日本', 'にほん'],
  ['神戸病院', 'こうべびょういん'],
  ['さくら大学富士大学', 'さくらだいがく・ふじだいがく'],
  ['を見せてください', 'をみせてください'],
  ['もう一杯いかがですか', 'もういっぱい、いかがですか'],
  ['航空便', 'こうくうびん'],
  ['わあ、すごい人ですね', 'わあ、すごいひとですね'],
  ['お待ちください', 'おまちください'],
  ['痛いです', 'いたいです'],
  ['お世話になりました', 'おせわになりました'],
]);
const corrections = Object.fromEntries(current.flatMap((item, index) => {
  const replacement = fetched[index];
  if (item.lesson !== replacement.lesson) throw new Error(`Sai thứ tự tại dòng ${index + 1}`);
  const overriddenReading = readingOverrides.get(item.word);
  if (!hasKanji(item.reading)) return [];
  if (overriddenReading) return [[index, overriddenReading]];
  if (hasKanji(replacement.reading)) return [];
  return [[index, replacement.reading]];
}));

if (Object.keys(corrections).length < 50) throw new Error(`Chỉ tạo được ${Object.keys(corrections).length} bản sửa`);

const generatedSource = `/*
 * Reading corrections generated from Minna no Nihongo I lessons 1-25.
 * Source: https://jtest.net/tu-vung-minna/bai-1 ... bai-25
 * Keys are zero-based source indexes so existing vocabulary IDs remain stable.
 * Run: node scripts/fetch-minna-n5-corrections.mjs
 */

export const minnaN5ReadingCorrections: Readonly<Record<number, string>> = ${JSON.stringify(corrections, null, 2)};
`;

fs.writeFileSync(outputFile, generatedSource, 'utf8');
console.log(`Đã ghi ${Object.keys(corrections).length} cách đọc N5 vào ${outputFile}`);
