const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src/data');
const files = fs.readdirSync(dataDir).filter((file) => (
  file === 'kanji.ts'
  || file === 'jlptAdditions.ts'
  || /^n[45]_part\d+\.ts$/.test(file)
));

const kanjis = [];
files.forEach(file => {
  const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
  const entries = content.matchAll(/\{\s*id:\s*(['"])[^'"]+\1,\s*kanji:\s*(['"])(.)\2/g);
  for (const entry of entries) {
    const kanji = entry[3];
    if (kanji && !kanjis.includes(kanji)) kanjis.push(kanji);
  }
});

console.log(`Found ${kanjis.length} kanjis. Fetching extra vocabularies fast...`);

async function fetchExtraVocab() {
  const extraVocab = {};
  
  const chunkArray = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
  
  const chunks = chunkArray(kanjis, 20); // 20 requests at a time
  
  let processed = 0;
  for (const chunk of chunks) {
    await Promise.all(chunk.map(async k => {
      try {
        const res = await fetch('https://mazii.net/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dict: 'javi', type: 'word', query: k, limit: 50, page: 1 })
        });
        if (!res.ok) throw new Error(`Mazii returned HTTP ${res.status}`);
        const data = await res.json();
        
        const added = [];
        if (data.data) {
          for (const item of data.data) {
            let isN4N5 = false;
            if (item.level) {
               const lvlStr = JSON.stringify(item.level);
               if (lvlStr.includes('jlpt-n5') || lvlStr.includes('jlpt-n4') || lvlStr.includes('N5') || lvlStr.includes('N4')) {
                 isN4N5 = true;
               }
            }
            if (isN4N5 && item.word && item.word.includes(k) && item.word !== k) {
              added.push({
                kanji: item.word,
                reading: item.phonetic || '',
                meaning: item.short_mean ? item.short_mean.split(';')[0].trim() : ''
              });
              if (added.length >= 3) break;
            }
          }
        }
        if (added.length > 0) extraVocab[k] = added;
      } catch (error) {
        console.warn(`Could not fetch vocabulary for ${k}:`, error.message);
      }
      processed++;
    }));
    console.log(`Processed ${processed}/${kanjis.length}`);
  }
  
  const outFile = path.join(dataDir, 'extraVocab.ts');
  if (Object.keys(extraVocab).length === 0) {
    throw new Error('No vocabulary was returned; keeping the existing extraVocab.ts file.');
  }
  const generatedSource = `import { kanjiData } from './kanji';\n\ntype ExtraVocabulary = { kanji: string; reading: string; meaning: string };\n\nconst generatedExtraVocab: Record<string, ExtraVocabulary[]> = ${JSON.stringify(extraVocab, null, 2)};\n\nexport const extraVocab = Object.fromEntries(\n  kanjiData.map((item) => [item.kanji, generatedExtraVocab[item.kanji] ?? item.vocabularies]),\n) as Record<string, ExtraVocabulary[]>;\n`;
  fs.writeFileSync(outFile, generatedSource);
  console.log(`Done! Saved to ${outFile}`);
}

fetchExtraVocab();
