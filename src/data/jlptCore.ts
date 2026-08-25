export type JLPTLevel = 'N5' | 'N4';

export type JLPTLessonDefinition = {
  level: JLPTLevel;
  title: string;
  characters: string[];
};

const createLesson = (level: JLPTLevel, title: string, characters: string): JLPTLessonDefinition => ({
  level,
  title,
  characters: Array.from(characters),
});

// JLPT không công bố danh sách Kanji cố định. Các nhóm dưới đây giữ đủ bộ lõi
// ôn thi phổ biến (80 chữ N5 và 167 chữ N4 riêng) nhưng sắp xếp theo chủ đề.
export const JLPT_N5_LESSONS: JLPTLessonDefinition[] = [
  createLesson('N5', 'Số đếm cơ bản', '一二三四五六七八九十'),
  createLesson('N5', 'Thời gian và lịch', '日月年時分半午今毎間'),
  createLesson('N5', 'Vị trí và phương hướng', '上下中外左右東西南北'),
  createLesson('N5', 'Trường học và ngôn ngữ', '学校本書読聞話語見何'),
  createLesson('N5', 'Con người và gia đình', '人男女子父母友名先生'),
  createLesson('N5', 'Thiên nhiên và địa lý', '国天気雨山川水木火土'),
  createLesson('N5', 'Di chuyển và sinh hoạt', '行来出入食休車電前後'),
  createLesson('N5', 'Số lượng và đặc điểm', '大小長高白百千万円金'),
];

export const JLPT_N4_LESSONS: JLPTLessonDefinition[] = [
  createLesson('N4', 'Gia đình và con người', '家族親兄弟姉妹私者'),
  createLesson('N4', 'Cơ thể và sức khỏe', '体目手足口心病医力強死'),
  createLesson('N4', 'Trường học và nghiên cứu', '教文字習勉試験問題答研究'),
  createLesson('N4', 'Công việc và tổ chức', '会社員業仕事工場用'),
  createLesson('N4', 'Nhà cửa và địa điểm', '京町住建室屋館堂院店台'),
  createLesson('N4', 'Di chuyển và giao thông', '運転通道駅旅歩走着帰送去'),
  createLesson('N4', 'Hành động và tiến trình', '立開持使作起止待切集動発始終'),
  createLesson('N4', 'Mua bán và tiền bạc', '売買貸借銀品物料計代'),
  createLesson('N4', 'Ăn uống', '飲飯肉魚牛茶味'),
  createLesson('N4', 'Thời gian và mùa', '朝昼夜夕週曜春夏秋冬早'),
  createLesson('N4', 'Thiên nhiên và động vật', '海野田空風花鳥犬'),
  createLesson('N4', 'Màu sắc và nghệ thuật', '赤青黒色画写映音歌図紙服楽'),
  createLesson('N4', 'Ngôn ngữ và tư duy', '言理意思知考注英漢洋'),
  createLesson('N4', 'Tính chất và đánh giá', '新明正安重近広急悪古特質'),
  createLesson('N4', 'Trạng thái và mức độ', '有無真不多少別元度'),
  createLesson('N4', 'Xã hội và quan hệ', '世地主公以自同方界'),
];

export const JLPT_N5_CORE_ORDER = JLPT_N5_LESSONS.flatMap((lesson) => lesson.characters);

export const JLPT_N4_CORE_ORDER = JLPT_N4_LESSONS.flatMap((lesson) => lesson.characters);

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

export const getJlptLessons = (level: JLPTLevel, n4Only = false) => {
  if (level === 'N5') return JLPT_N5_LESSONS;
  return n4Only ? JLPT_N4_LESSONS : [...JLPT_N5_LESSONS, ...JLPT_N4_LESSONS];
};
