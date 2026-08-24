const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts') && (f.startsWith('n5_') || f.startsWith('n4_')));

const kanjis = [];
files.forEach(file => {
  const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
  const matches = content.match(/kanji:\s*['"](.)['"]/g);
  if (matches) {
    matches.forEach(m => {
      const k = m.replace(/kanji:\s*['"]/, '').replace(/['"]/, '');
      if (k && k.length === 1 && !kanjis.includes(k)) kanjis.push(k);
    });
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
      } catch (e) {
        // ignore
      }
      processed++;
    }));
    console.log(`Processed ${processed}/${kanjis.length}`);
  }
  
  const outFile = path.join(dataDir, 'extraVocab.ts');
  fs.writeFileSync(outFile, `export const extraVocab: Record<string, { kanji: string, reading: string, meaning: string }[]> = ${JSON.stringify(extraVocab, null, 2)};\n`);
  console.log(`Done! Saved to ${outFile}`);
}

fetchExtraVocab();
