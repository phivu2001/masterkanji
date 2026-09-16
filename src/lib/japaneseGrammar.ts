import type { VocabularyInfo } from '../data/vocabulary';

export type GrammarForm = {
  key: string;
  label: string;
  value: string;
  reading: string;
};

export type VerbGroup = 'godan' | 'ichidan' | 'irregular';

export const verbGroupLabels: Record<VerbGroup, string> = {
  godan: 'Nhóm 1 · Godan',
  ichidan: 'Nhóm 2 · Ichidan',
  irregular: 'Nhóm 3 · Bất quy tắc',
};

const ichidanWords = new Set([
  '見ます', '起きます', '浴びます', '借ります', 'います', 'できます',
  '足ります', '着ます', '似ます', '信じます', '感じます', '過ぎます', '落ちます',
  '閉じます', '存じます',
]);

// Các động từ nhóm 1 kết thúc bằng âm す cũng có dạng lịch sự “...します”.
// Không tách chúng như danh từ + します (nhóm 3).
const godanSuWords = new Set([
  'なくします', '下ろします', '出します', '回します', '思い出します', '押します',
  '消します', '直します', '話します', '貸します', '返します', 'さします', 'だします',
  '冷やします', '動かします', '壊します', '外します', '戻します', '指します',
  '探します', '探します／捜します', '暮らします', '汚します', '沸かします',
  '渡します', '生かします', '申します', '目指します', '落とします', '過ごします',
  '降ろします', 'いたします', '失礼いたします',
]);

const godanDictionaryEnding: Record<string, string> = {
  い: 'う', き: 'く', ぎ: 'ぐ', し: 'す', ち: 'つ', に: 'ぬ', び: 'ぶ', み: 'む', り: 'る',
};

const godanNegativeEnding: Record<string, string> = {
  い: 'わない', き: 'かない', ぎ: 'がない', し: 'さない', ち: 'たない',
  に: 'なない', び: 'ばない', み: 'まない', り: 'らない',
};

const godanTeEnding: Record<string, string> = {
  い: 'って', ち: 'って', り: 'って', み: 'んで', び: 'んで', に: 'んで',
  き: 'いて', ぎ: 'いで', し: 'して',
};

const replaceLast = (value: string, replacement: string) => `${value.slice(0, -1)}${replacement}`;

const inflectPoliteVerb = (value: string, reading: string) => {
  const stem = value.slice(0, -2);
  const readingStem = reading.slice(0, -2);
  if (['いらっしゃいます', 'くださいます', 'おっしゃいます', 'なさいます'].some((ending) => value.endsWith(ending))) {
    return {
      group: 'godan' as const,
      dictionary: replaceLast(stem, 'る'),
      negative: replaceLast(stem, 'らない'),
      te: replaceLast(stem, 'って'),
      readingDictionary: replaceLast(readingStem, 'る'),
      readingNegative: replaceLast(readingStem, 'らない'),
      readingTe: replaceLast(readingStem, 'って'),
    };
  }
  if (value.endsWith('来ます')) {
    return { group: 'irregular' as const, dictionary: `${stem}る`, negative: `${stem}ない`, te: `${stem}て`, readingDictionary: `${readingStem.slice(0, -1)}くる`, readingNegative: `${readingStem.slice(0, -1)}こない`, readingTe: `${readingStem.slice(0, -1)}きて` };
  }
  if (value.endsWith('します') && !godanSuWords.has(value)) {
    const valueBase = value.slice(0, -3);
    const readingBase = reading.slice(0, -3);
    return { group: 'irregular' as const, dictionary: `${valueBase}する`, negative: `${valueBase}しない`, te: `${valueBase}して`, readingDictionary: `${readingBase}する`, readingNegative: `${readingBase}しない`, readingTe: `${readingBase}して` };
  }

  const lastReadingStem = readingStem.at(-1) ?? '';
  const isEStem = /[えけげせぜてでねへべめれ]/.test(lastReadingStem);
  const isIchidan = ichidanWords.has(value) || (value === '降ります' && reading === 'おります') || isEStem;
  if (isIchidan) {
    return { group: 'ichidan' as const, dictionary: `${stem}る`, negative: `${stem}ない`, te: `${stem}て`, readingDictionary: `${readingStem}る`, readingNegative: `${readingStem}ない`, readingTe: `${readingStem}て` };
  }

  const dictionaryEnding = godanDictionaryEnding[lastReadingStem];
  const negativeEnding = godanNegativeEnding[lastReadingStem];
  const teEnding = value.endsWith('行きます') ? 'って' : godanTeEnding[lastReadingStem];
  if (!dictionaryEnding || !negativeEnding || !teEnding) return null;
  const dictionary = replaceLast(stem, dictionaryEnding);
  const negative = replaceLast(stem, negativeEnding);
  const te = replaceLast(stem, teEnding);
  return {
    group: 'godan' as const,
    dictionary,
    negative,
    te,
    readingDictionary: replaceLast(readingStem, dictionaryEnding),
    readingNegative: replaceLast(readingStem, negativeEnding),
    readingTe: replaceLast(readingStem, teEnding),
  };
};

export const getVerbGroup = (item: VocabularyInfo): VerbGroup | null => {
  if (item.partOfSpeech !== 'verb' || !item.word.endsWith('ます') || !item.reading.endsWith('ます')) return null;
  return inflectPoliteVerb(item.word, item.reading)?.group ?? null;
};

export const getVerbForms = (item: VocabularyInfo): GrammarForm[] => {
  if (item.partOfSpeech !== 'verb' || !item.word.endsWith('ます') || !item.reading.endsWith('ます')) return [];
  const plain = inflectPoliteVerb(item.word, item.reading);
  if (!plain) return [];
  const past = plain.te.endsWith('て') ? `${plain.te.slice(0, -1)}た` : `${plain.te.slice(0, -1)}だ`;
  const readingPast = plain.readingTe.endsWith('て') ? `${plain.readingTe.slice(0, -1)}た` : `${plain.readingTe.slice(0, -1)}だ`;
  const stem = item.word.slice(0, -2);
  const readingStem = item.reading.slice(0, -2);
  return [
    { key: 'dictionary', label: 'Dạng từ điển', value: plain.dictionary, reading: plain.readingDictionary },
    { key: 'masu', label: 'Thể ます', value: item.word, reading: item.reading },
    { key: 'masen', label: 'Thể ません', value: `${stem}ません`, reading: `${readingStem}ません` },
    { key: 'te', label: 'Thể て', value: plain.te, reading: plain.readingTe },
    { key: 'nai', label: 'Thể ない', value: plain.negative, reading: plain.readingNegative },
    { key: 'past', label: 'Quá khứ thường', value: past, reading: readingPast },
  ];
};

const transitivityPairs: { transitive: string; intransitive: string }[] = [
  { transitive: '開ける', intransitive: '開く' }, { transitive: '閉める', intransitive: '閉まる' },
  { transitive: 'つける', intransitive: 'つく' }, { transitive: '消す', intransitive: '消える' },
  { transitive: '入れる', intransitive: '入る' }, { transitive: '出す', intransitive: '出る' },
  { transitive: '始める', intransitive: '始まる' }, { transitive: '集める', intransitive: '集まる' },
  { transitive: '決める', intransitive: '決まる' }, { transitive: '壊す', intransitive: '壊れる' },
  { transitive: '汚す', intransitive: '汚れる' }, { transitive: '動かす', intransitive: '動く' },
  { transitive: '変える', intransitive: '変わる' }, { transitive: '落とす', intransitive: '落ちる' },
];

export const getTransitivityPair = (dictionaryForm: string) => {
  const pair = transitivityPairs.find((candidate) => dictionaryForm.endsWith(candidate.transitive) || dictionaryForm.endsWith(candidate.intransitive));
  if (!pair) return null;
  const isTransitive = dictionaryForm.endsWith(pair.transitive);
  return { type: isTransitive ? 'Tha động từ' : 'Tự động từ', counterpart: isTransitive ? pair.intransitive : pair.transitive };
};

export const getAdjectiveForms = (item: VocabularyInfo): GrammarForm[] => {
  if (item.partOfSpeech !== 'adjective') return [];
  const isNa = item.adjectiveType === 'na';
  const naCompanions: Record<string, { word: string; reading: string }> = {
    静か: { word: '町', reading: 'まち' },
    簡単: { word: '問題', reading: 'もんだい' },
    暇: { word: '時間', reading: 'じかん' },
    好き: { word: '料理', reading: 'りょうり' },
    便利: { word: '道具', reading: 'どうぐ' },
    元気: { word: '人', reading: 'ひと' },
    いろいろ: { word: '方法', reading: 'ほうほう' },
  };
  const companion = naCompanions[item.word] ?? { word: 'もの', reading: 'もの' };
  if (isNa) return [
    { key: 'attributive', label: 'Đứng trước danh từ', value: `${item.word}な${companion.word}`, reading: `${item.reading}な${companion.reading}` },
    { key: 'present', label: 'Khẳng định', value: `${item.word}です`, reading: `${item.reading}です` },
    { key: 'negative', label: 'Phủ định', value: `${item.word}じゃない`, reading: `${item.reading}じゃない` },
    { key: 'past', label: 'Quá khứ', value: `${item.word}でした`, reading: `${item.reading}でした` },
  ];
  const exceptionalIi = item.word.endsWith('いい');
  const valueStem = exceptionalIi ? `${item.word.slice(0, -2)}よ` : item.word.slice(0, -1);
  const readingStem = item.reading.endsWith('いい') ? `${item.reading.slice(0, -2)}よ` : item.reading.slice(0, -1);
  return [
    { key: 'attributive', label: 'Đứng trước danh từ', value: `${item.word}もの`, reading: `${item.reading}もの` },
    { key: 'present', label: 'Khẳng định', value: `${item.word}です`, reading: `${item.reading}です` },
    { key: 'negative', label: 'Phủ định', value: `${valueStem}くない`, reading: `${readingStem}くない` },
    { key: 'past', label: 'Quá khứ', value: `${valueStem}かった`, reading: `${readingStem}かった` },
  ];
};

export type NounParticleExercise = {
  sentence: string;
  reading: string;
  meaning: string;
  answers: string[];
};

const nounParticleOverrides: Record<string, NounParticleExercise> = {
  学校: { sentence: '学校＿行きます。', reading: 'がっこう＿いきます。', meaning: 'Tôi đi đến trường.', answers: ['へ', 'に'] },
  先生: { sentence: '先生＿聞きます。', reading: 'せんせい＿ききます。', meaning: 'Tôi hỏi giáo viên.', answers: ['に'] },
  本: { sentence: '本＿読みます。', reading: 'ほん＿よみます。', meaning: 'Tôi đọc sách.', answers: ['を'] },
  駅: { sentence: '駅＿電車に乗ります。', reading: 'えき＿でんしゃにのります。', meaning: 'Tôi lên tàu ở nhà ga.', answers: ['で'] },
  友達: { sentence: '友達＿来ました。', reading: 'ともだち＿きました。', meaning: 'Bạn tôi đã đến.', answers: ['が'] },
  日本語: { sentence: '日本語＿勉強します。', reading: 'にほんご＿べんきょうします。', meaning: 'Tôi học tiếng Nhật.', answers: ['を'] },
};

export const getNounParticleExercise = (item: VocabularyInfo): NounParticleExercise | null => {
  if (item.partOfSpeech !== 'noun') return null;
  return nounParticleOverrides[item.word] ?? {
    sentence: `${item.word}＿覚えます。`,
    reading: `${item.reading}＿おぼえます。`,
    meaning: `Tôi ghi nhớ từ “${item.meaning}”.`,
    answers: ['を'],
  };
};

export type NounCounterExercise = {
  sentence: string;
  reading: string;
  meaning: string;
  answer: string;
};

const nounCounterExercises: Record<string, NounCounterExercise> = {
  本: { sentence: '本を三＿買いました。', reading: 'ほんをさん＿かいました。', meaning: 'Tôi đã mua ba quyển sách.', answer: '冊' },
  車: { sentence: '車が二＿あります。', reading: 'くるまがに＿あります。', meaning: 'Có hai chiếc ô tô.', answer: '台' },
  シャツ: { sentence: 'シャツを二＿買いました。', reading: 'シャツをに＿かいました。', meaning: 'Tôi đã mua hai chiếc áo sơ mi.', answer: '枚' },
  紙: { sentence: '紙を五＿ください。', reading: 'かみをご＿ください。', meaning: 'Cho tôi năm tờ giấy.', answer: '枚' },
  りんご: { sentence: 'りんごを三＿食べました。', reading: 'りんごをさん＿たべました。', meaning: 'Tôi đã ăn ba quả táo.', answer: '個' },
  鉛筆: { sentence: '鉛筆を二＿使います。', reading: 'えんぴつをに＿つかいます。', meaning: 'Tôi dùng hai cây bút chì.', answer: '本' },
  靴: { sentence: '靴を一＿買いました。', reading: 'くつをいっ＿かいました。', meaning: 'Tôi đã mua một đôi giày.', answer: '足' },
  コーヒー: { sentence: 'コーヒーを二＿飲みました。', reading: 'コーヒーをにはいのみました。', meaning: 'Tôi đã uống hai cốc cà phê.', answer: '杯' },
  人: { sentence: '教室に学生が三＿います。', reading: 'きょうしつにがくせいがさんにんいます。', meaning: 'Trong lớp có ba học sinh.', answer: '人' },
};

export const getNounCounterExercise = (item: VocabularyInfo): NounCounterExercise | null => (
  item.partOfSpeech === 'noun' ? nounCounterExercises[item.word] ?? null : null
);
