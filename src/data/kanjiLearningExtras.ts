export const similarKanjiGroups: Record<string, string[]> = {
  日: ['目', '白'], 目: ['日', '自'], 土: ['士'], 士: ['土'], 未: ['末'], 末: ['未'],
  人: ['入'], 入: ['人'], 千: ['干'], 干: ['千'], 牛: ['午'], 午: ['牛'],
  右: ['石'], 石: ['右'], 木: ['本', '未'], 本: ['木'], 名: ['各'], 各: ['名'],
  口: ['囗'], 貝: ['見'], 見: ['貝'], 待: ['持'], 持: ['待'], 鳥: ['島'],
};

export type ExampleSentence = {
  japanese: string;
  reading: string;
  meaning: string;
};

export const exampleSentences: Record<string, ExampleSentence[]> = {
  日: [{ japanese: '今日はいい天気です。', reading: 'きょうは いい てんきです。', meaning: 'Hôm nay thời tiết đẹp.' }],
  人: [{ japanese: 'あの人は先生です。', reading: 'あの ひとは せんせいです。', meaning: 'Người kia là giáo viên.' }],
  学: [{ japanese: '毎日、日本語を勉強します。', reading: 'まいにち、にほんごを べんきょうします。', meaning: 'Mỗi ngày tôi học tiếng Nhật.' }],
  行: [{ japanese: '明日、学校へ行きます。', reading: 'あした、がっこうへ いきます。', meaning: 'Ngày mai tôi đi đến trường.' }],
  食: [{ japanese: '家族と晩ご飯を食べます。', reading: 'かぞくと ばんごはんを たべます。', meaning: 'Tôi ăn tối cùng gia đình.' }],
  見: [{ japanese: '映画を見ました。', reading: 'えいがを みました。', meaning: 'Tôi đã xem phim.' }],
  聞: [{ japanese: '音楽を聞くのが好きです。', reading: 'おんがくを きくのが すきです。', meaning: 'Tôi thích nghe nhạc.' }],
  話: [{ japanese: '友達と日本語で話します。', reading: 'ともだちと にほんごで はなします。', meaning: 'Tôi nói tiếng Nhật với bạn.' }],
  会: [{ japanese: '駅で友達に会いました。', reading: 'えきで ともだちに あいました。', meaning: 'Tôi đã gặp bạn ở nhà ga.' }],
  住: [{ japanese: '東京に住んでいます。', reading: 'とうきょうに すんでいます。', meaning: 'Tôi đang sống ở Tokyo.' }],
  仕: [{ japanese: '父は会社で仕事をしています。', reading: 'ちちは かいしゃで しごとを しています。', meaning: 'Bố tôi làm việc tại công ty.' }],
  旅: [{ japanese: '夏休みに旅行へ行きます。', reading: 'なつやすみに りょこうへ いきます。', meaning: 'Tôi sẽ đi du lịch vào kỳ nghỉ hè.' }],
};

export const buildFallbackSentence = (kanji: string, vocabulary: { kanji: string; reading: string; meaning: string }): ExampleSentence => ({
  japanese: `「${vocabulary.kanji}」には「${kanji}」を使います。`,
  reading: `${vocabulary.reading} には ${kanji} を つかいます。`,
  meaning: `Từ “${vocabulary.meaning}” có sử dụng chữ ${kanji}.`,
});
