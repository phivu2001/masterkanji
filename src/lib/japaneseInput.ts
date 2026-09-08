import { toHiragana } from 'wanakana';

export const convertRomajiInput = (value: string) => toHiragana(value.normalize('NFKC'), { IMEMode: true });

export const commitRomajiInput = (value: string) => toHiragana(value.normalize('NFKC'));

export const normalizeJapaneseAnswer = (value: string) => commitRomajiInput(value)
  .toLocaleLowerCase('ja-JP')
  .replace(/[\s。、・]/g, '');
