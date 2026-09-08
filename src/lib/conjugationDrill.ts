import type { JLPTLevel } from '../data/jlptCore';
import type { VocabularyInfo } from '../data/vocabulary';
import { getVerbForms, getVerbGroup, verbGroupLabels, type GrammarForm, type VerbGroup } from './japaneseGrammar';
import { normalizeJapaneseAnswer } from './japaneseInput';

export type ConjugationLevel = JLPTLevel | 'all';
export type ConjugationFormKey = 'dictionary' | 'masu' | 'masen' | 'te' | 'nai' | 'past';
export type ConjugationQuestionCount = 10 | 20 | 'endless';
export type ConjugationAnswerMode = 'typing' | 'choice';

export type ConjugationDrillConfig = {
  level: ConjugationLevel;
  groups: VerbGroup[];
  forms: ConjugationFormKey[];
  questionCount: ConjugationQuestionCount;
};

export type ConjugationQuestion = {
  id: string;
  item: VocabularyInfo;
  group: VerbGroup;
  target: GrammarForm & { key: ConjugationFormKey };
  dictionaryForm: GrammarForm;
  options: string[];
  rule: string;
};

export type ConjugationAnswerRecord = {
  question: ConjugationQuestion;
  correct: boolean;
  submitted: string;
  mode: ConjugationAnswerMode;
};

export const conjugationFormOptions: { key: ConjugationFormKey; label: string; shortLabel: string }[] = [
  { key: 'dictionary', label: 'Dạng từ điển (辞書形)', shortLabel: 'Dạng từ điển' },
  { key: 'masu', label: 'Thể ます (Lịch sự)', shortLabel: 'Thể ます' },
  { key: 'masen', label: 'Thể ません (Phủ định)', shortLabel: 'Thể ません' },
  { key: 'te', label: 'Thể て (Te-form)', shortLabel: 'Thể て' },
  { key: 'nai', label: 'Thể ない (Nai-form)', shortLabel: 'Thể ない' },
  { key: 'past', label: 'Thể た (Ta-form)', shortLabel: 'Thể た' },
];

export const defaultConjugationDrillConfig = (level: JLPTLevel): ConjugationDrillConfig => ({
  level,
  groups: ['godan', 'ichidan', 'irregular'],
  forms: conjugationFormOptions.map((form) => form.key),
  questionCount: 10,
});

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

const isTargetForm = (form: GrammarForm): form is GrammarForm & { key: ConjugationFormKey } => (
  conjugationFormOptions.some((candidate) => candidate.key === form.key)
);

const canonicalizeVerbItem = (item: VocabularyInfo): VocabularyInfo => {
  const firstWrittenVariant = item.word.split(/[／/]/)[0];
  const firstPoliteEnding = firstWrittenVariant.indexOf('ます');
  const word = firstPoliteEnding >= 0 ? firstWrittenVariant.slice(0, firstPoliteEnding + 2) : firstWrittenVariant;
  const reading = item.reading.split(/[／/]/)[0];
  return word === item.word && reading === item.reading ? item : { ...item, word, reading };
};

export const getEligibleConjugationVerbs = (pool: VocabularyInfo[], config: ConjugationDrillConfig) => {
  const unique = new Map<string, VocabularyInfo>();
  pool.forEach((item) => {
    if (item.partOfSpeech !== 'verb' || (config.level !== 'all' && item.level !== config.level)) return;
    const canonicalItem = canonicalizeVerbItem(item);
    const group = getVerbGroup(canonicalItem);
    const forms = getVerbForms(canonicalItem);
    if (!group || !config.groups.includes(group) || forms.length === 0) return;
    const dictionary = forms.find((form) => form.key === 'dictionary');
    if (!dictionary) return;
    const key = `${normalizeJapaneseAnswer(dictionary.reading)}\u0000${normalizeJapaneseAnswer(dictionary.value)}`;
    if (!unique.has(key)) unique.set(key, canonicalItem);
  });
  return [...unique.values()];
};

const replaceLast = (value: string, ending: string) => `${value.slice(0, -1)}${ending}`;

const buildDistractors = (item: VocabularyInfo, target: GrammarForm, allForms: GrammarForm[]) => {
  const politeStem = item.word.endsWith('ます') ? item.word.slice(0, -2) : item.word;
  const generated: string[] = [];
  if (target.key === 'te') generated.push(`${politeStem}て`, replaceLast(politeStem, 'って'), replaceLast(politeStem, 'んで'), replaceLast(politeStem, 'いて'));
  if (target.key === 'past') generated.push(`${politeStem}た`, replaceLast(politeStem, 'った'), replaceLast(politeStem, 'んだ'), replaceLast(politeStem, 'いた'));
  if (target.key === 'nai') generated.push(`${politeStem}ない`, replaceLast(politeStem, 'らない'), replaceLast(politeStem, 'さない'));
  if (target.key === 'dictionary') generated.push(`${politeStem}る`, `${politeStem}う`, `${politeStem}く`);
  if (target.key === 'masu') generated.push(`${politeStem}る`, `${politeStem}ました`, `${politeStem}ません`);
  if (target.key === 'masen') generated.push(`${politeStem}ない`, `${politeStem}ます`, `${politeStem}ませんでした`);
  generated.push(...allForms.filter((form) => form.key !== target.key).map((form) => form.value));

  const correct = normalizeJapaneseAnswer(target.value);
  const unique = [...new Map(generated
    .filter(Boolean)
    .filter((candidate) => normalizeJapaneseAnswer(candidate) !== correct)
    .map((candidate) => [normalizeJapaneseAnswer(candidate), candidate])).values()];
  return shuffle(unique).slice(0, 3);
};

const godanTeRules: Record<string, string> = {
  う: 'う・つ・る → って', つ: 'う・つ・る → って', る: 'う・つ・る → って',
  む: 'む・ぶ・ぬ → んで', ぶ: 'む・ぶ・ぬ → んで', ぬ: 'む・ぶ・ぬ → んで',
  く: 'く → いて (行く là ngoại lệ: 行って)', ぐ: 'ぐ → いで', す: 'す → して',
};

const godanNaiRules: Record<string, string> = {
  う: 'う → わない', く: 'く → かない', ぐ: 'ぐ → がない', す: 'す → さない',
  つ: 'つ → たない', ぬ: 'ぬ → なない', ぶ: 'ぶ → ばない', む: 'む → まない', る: 'る → らない',
};

const buildRule = (group: VerbGroup, target: GrammarForm, dictionaryForm: GrammarForm) => {
  if (group === 'irregular') return `Nhóm 3 là bất quy tắc: hãy ghi nhớ trực tiếp ${dictionaryForm.value} → ${target.value}.`;
  if (group === 'ichidan') {
    const suffix: Record<string, string> = { dictionary: 'る', masu: 'ます', masen: 'ません', te: 'て', nai: 'ない', past: 'た' };
    return `Nhóm 2: bỏ る ở dạng từ điển rồi thêm ${suffix[target.key] ?? 'đuôi tương ứng'}.`;
  }
  const ending = Array.from(dictionaryForm.reading).at(-1) ?? '';
  if (target.key === 'te') return `Nhóm 1, thể て: ${godanTeRules[ending] ?? 'đổi âm cuối theo hàng tương ứng'}.`;
  if (target.key === 'past') return `Nhóm 1, thể た: áp dụng quy tắc thể て rồi đổi て→た và で→だ.`;
  if (target.key === 'nai') return `Nhóm 1, thể ない: ${godanNaiRules[ending] ?? 'đổi âm cuối sang hàng あ rồi thêm ない'}.`;
  if (target.key === 'dictionary') return 'Nhóm 1: đổi âm hàng い trước ます về âm hàng う tương ứng.';
  if (target.key === 'masen') return 'Giữ thân ます và thay ます bằng ません để tạo phủ định lịch sự.';
  return 'Giữ thân động từ và thêm ます để tạo thể lịch sự.';
};

const createQuestion = (item: VocabularyInfo, target: GrammarForm & { key: ConjugationFormKey }, sequence: number): ConjugationQuestion | null => {
  const group = getVerbGroup(item);
  const forms = getVerbForms(item);
  const dictionaryForm = forms.find((form) => form.key === 'dictionary');
  if (!group || !dictionaryForm) return null;
  const options = shuffle([target.value, ...buildDistractors(item, target, forms)]);
  if (options.length < 4) return null;
  return {
    id: `${item.id}-${target.key}-${sequence}`,
    item,
    group,
    target,
    dictionaryForm,
    options,
    rule: buildRule(group, target, dictionaryForm),
  };
};

export const buildConjugationQuestionDeck = (
  pool: VocabularyInfo[],
  config: ConjugationDrillConfig,
  sequenceOffset = 0,
) => {
  const verbs = getEligibleConjugationVerbs(pool, config);
  const selectedForms = new Set(config.forms);
  const pairs = verbs.flatMap((item) => getVerbForms(item)
    .filter(isTargetForm)
    .filter((form) => selectedForms.has(form.key))
    .map((form) => ({ item, form })));
  return shuffle(pairs).flatMap((pair, index) => {
    const question = createQuestion(pair.item, pair.form, sequenceOffset + index);
    return question ? [question] : [];
  });
};

export const getConjugationGroupLabel = (group: VerbGroup) => verbGroupLabels[group];
