export type JLPTLevel = 'N5' | 'N4';

// JLPT không công bố danh sách Kanji cố định. Hai danh sách dưới đây là bộ lõi
// ôn thi phổ biến (80 chữ N5 và 167 chữ N4 riêng), được giữ theo thứ tự tần suất.
export const JLPT_N5_CORE_ORDER = Array.from(
  '日一国人年大十二本中長出三時行見月分後前生五間上東四今金九入学高円子外八六下来気小七山話女北午百書先名川千水半男西電校語土木聞食車何南万毎白天母火右読友左休父雨',
);

export const JLPT_N4_CORE_ORDER = Array.from(
  '会同事自社発者地業方新場員立開手力問代明動京目通言理体田主題意不作用度強公持野以思家世多正安院心界教文元重近考画海売知道集別物使品計死特私始朝運終台広住無真有口少町料工建空急止送切転研足究楽起着店病質待試族銀早映親験英医仕去味写字答夜音注帰古歌買悪図週室歩風紙黒花春赤青館屋色走秋夏習駅洋旅服夕借曜飲肉貸堂鳥飯勉冬昼茶弟牛魚兄犬妹姉漢',
);

export const JLPT_N5_CORE_SET = new Set(JLPT_N5_CORE_ORDER);
export const JLPT_N4_CORE_SET = new Set(JLPT_N4_CORE_ORDER);

export const getJlptCoreLevel = (kanji: string): JLPTLevel | null => {
  if (JLPT_N5_CORE_SET.has(kanji)) return 'N5';
  if (JLPT_N4_CORE_SET.has(kanji)) return 'N4';
  return null;
};

export const getJlptStudyOrder = (level: JLPTLevel) =>
  level === 'N5'
    ? JLPT_N5_CORE_ORDER
    : [...JLPT_N5_CORE_ORDER, ...JLPT_N4_CORE_ORDER];
