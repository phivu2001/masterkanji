import { toHiragana } from 'wanakana';

export const convertRomajiInput = (value: string) => toHiragana(value.normalize('NFKC'), { IMEMode: true });

export const commitRomajiInput = (value: string) => toHiragana(value.normalize('NFKC'));

export const normalizeJapaneseAnswer = (value: string) => commitRomajiInput(value)
  .toLocaleLowerCase('ja-JP')
  .replace(/[\s。、・]/g, '');

export type JapaneseCharacterComparison = {
  input: string;
  expected: string;
  correct: boolean;
};

const alignCharacters = (input: string, expected: string): JapaneseCharacterComparison[] => {
  const left = Array.from(input);
  const right = Array.from(expected);
  const costs = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));
  for (let index = 0; index <= left.length; index += 1) costs[index][0] = index;
  for (let index = 0; index <= right.length; index += 1) costs[0][index] = index;
  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      costs[row][column] = Math.min(
        costs[row - 1][column] + 1,
        costs[row][column - 1] + 1,
        costs[row - 1][column - 1] + (left[row - 1] === right[column - 1] ? 0 : 1),
      );
    }
  }

  const result: JapaneseCharacterComparison[] = [];
  let row = left.length;
  let column = right.length;
  while (row > 0 || column > 0) {
    if (row > 0 && column > 0) {
      const replacementCost = left[row - 1] === right[column - 1] ? 0 : 1;
      if (costs[row][column] === costs[row - 1][column - 1] + replacementCost) {
        result.unshift({ input: left[row - 1], expected: right[column - 1], correct: replacementCost === 0 });
        row -= 1;
        column -= 1;
        continue;
      }
    }
    if (row > 0 && costs[row][column] === costs[row - 1][column] + 1) {
      result.unshift({ input: left[row - 1], expected: '', correct: false });
      row -= 1;
      continue;
    }
    result.unshift({ input: '', expected: right[column - 1], correct: false });
    column -= 1;
  }
  return result;
};

export const analyzeJapaneseAnswer = (input: string, acceptedAnswers: string[]) => {
  const submitted = normalizeJapaneseAnswer(input);
  const normalizedAnswers = [...new Set(acceptedAnswers.map(normalizeJapaneseAnswer).filter(Boolean))];
  const candidates = normalizedAnswers.map((answer) => ({
    answer,
    comparison: alignCharacters(submitted, answer),
  }));
  const closest = candidates.sort((a, b) => (
    a.comparison.filter((item) => !item.correct).length - b.comparison.filter((item) => !item.correct).length
  ))[0] ?? { answer: '', comparison: [] };
  return {
    submitted,
    correct: normalizedAnswers.includes(submitted),
    closestAnswer: closest.answer,
    comparison: closest.comparison,
  };
};
