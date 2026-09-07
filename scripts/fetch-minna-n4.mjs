import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const outputFile = path.join(projectDirectory, 'src', 'data', 'vocabularyN4.ts');

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

const cleanWord = (value) => value
  .replace(readingPattern, '$1')
  .replace(/\[な\]$/, '')
  .replace(/\[([^\]]+)\]/g, '$1')
  .replace(/\s*[,、]\s*/g, '／')
  .replace(/^／+|／+$/g, '')
  .replace(/\s+/g, '')
  .trim();

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
  const rows = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);

  for (const row of rows) {
    const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => cellLines(match[1]));
    if (cells.length !== 3 || cells[0].length === 0 || cells[2].length === 0) continue;

    const kanaSource = cells[0][0];
    const kanjiSource = cells[1][0] ?? '';
    const hasOnlyUsageHint = /^\[[^\]]+\]$/.test(kanjiSource);
    const word = cleanWord(hasOnlyUsageHint ? kanaSource : kanjiSource || kanaSource);
    const reading = cleanReading(kanaSource);
    const meaning = cells[2].join(' ').replace(/\s+/g, ' ').trim();

    if (!word || !reading || !meaning) continue;
    vocabulary.push({ lesson, word, reading, meaning });
  }

  return vocabulary;
};

const fetchLesson = async (lesson) => {
  const sourceUrl = `https://jtest.net/tu-vung-minna/bai-${lesson}`;
  const response = await fetch(sourceUrl, { headers: { 'user-agent': 'KanjiMaster vocabulary importer/1.0' } });
  if (!response.ok) throw new Error(`Bài ${lesson}: HTTP ${response.status}`);
  const vocabulary = parseLesson(lesson, await response.text());
  if (vocabulary.length < 10) throw new Error(`Bài ${lesson}: chỉ đọc được ${vocabulary.length} từ`);
  return vocabulary;
};

const lessons = Array.from({ length: 25 }, (_, index) => index + 26);
const lessonData = await Promise.all(lessons.map(fetchLesson));
const vocabulary = lessonData.flat();

if (vocabulary.length < 600) throw new Error(`Dữ liệu N4 quá ít: ${vocabulary.length} từ`);

const generatedSource = `/*
 * Generated from Minna no Nihongo II lessons 26-50.
 * Source: https://jtest.net/tu-vung-minna/bai-26 ... bai-50
 * Run: node scripts/fetch-minna-n4.mjs
 */

export type RawMinnaN4VocabularyInfo = {
  lesson: number;
  word: string;
  reading: string;
  meaning: string;
};

export const rawMinnaN4Vocabulary = ${JSON.stringify(vocabulary, null, 2)} as const satisfies readonly RawMinnaN4VocabularyInfo[];
`;

fs.writeFileSync(outputFile, generatedSource, 'utf8');

for (const [index, words] of lessonData.entries()) {
  console.log(`Bài ${index + 26}: ${words.length} từ`);
}
console.log(`Đã ghi ${vocabulary.length} từ N4 vào ${outputFile}`);
