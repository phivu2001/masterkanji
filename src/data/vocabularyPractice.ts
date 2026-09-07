import type { VocabularyInfo } from './vocabulary';

export type VocabularyClozeExercise = {
  item: VocabularyInfo;
  sentence: string;
  blankSentence: string;
  reading: string;
  meaning: string;
  collocation: string;
};

type CuratedCloze = Omit<VocabularyClozeExercise, 'item' | 'blankSentence'>;

const curatedClozeByWord: Record<string, CuratedCloze> = {
  '食べます': { sentence: '毎朝、パンと卵を食べます。', reading: 'まいあさ、パンとたまごをたべます。', meaning: 'Mỗi sáng tôi ăn bánh mì và trứng.', collocation: '朝ご飯を食べます' },
  '飲みます': { sentence: '食事のあとで、薬を飲みます。', reading: 'しょくじのあとで、くすりをのみます。', meaning: 'Sau bữa ăn, tôi uống thuốc.', collocation: '薬を飲みます' },
  '行きます': { sentence: '日曜日に家族と公園へ行きます。', reading: 'にちようびにかぞくとこうえんへいきます。', meaning: 'Chủ nhật tôi đi công viên cùng gia đình.', collocation: '公園へ行きます' },
  '来ます': { sentence: '午後三時に友達が家へ来ます。', reading: 'ごごさんじにともだちがいえへきます。', meaning: 'Ba giờ chiều bạn tôi sẽ đến nhà.', collocation: '家へ来ます' },
  '見ます': { sentence: '寝る前に、テレビでニュースを見ます。', reading: 'ねるまえに、テレビでニュースをみます。', meaning: 'Trước khi ngủ, tôi xem tin tức trên TV.', collocation: 'ニュースを見ます' },
  '買います': { sentence: '駅の近くで、電車の切符を買います。', reading: 'えきのちかくで、でんしゃのきっぷをかいます。', meaning: 'Tôi mua vé tàu ở gần nhà ga.', collocation: '切符を買います' },
  '読みます': { sentence: '電車の中で日本語の本を読みます。', reading: 'でんしゃのなかでにほんごのほんをよみます。', meaning: 'Tôi đọc sách tiếng Nhật trên tàu.', collocation: '本を読みます' },
  '書きます': { sentence: '申込書に名前と住所を書きます。', reading: 'もうしこみしょになまえとじゅうしょをかきます。', meaning: 'Tôi viết tên và địa chỉ vào đơn đăng ký.', collocation: '名前を書きます' },
  '起きます': { sentence: '仕事がある日は、朝六時に起きます。', reading: 'しごとがあるひは、あさろくじにおきます。', meaning: 'Ngày có việc, tôi thức dậy lúc sáu giờ sáng.', collocation: '朝六時に起きます' },
  '寝ます': { sentence: '明日は早いので、今晩は十一時に寝ます。', reading: 'あしたははやいので、こんばんじゅういちじにねます。', meaning: 'Ngày mai phải dậy sớm nên tối nay tôi ngủ lúc 11 giờ.', collocation: '十一時に寝ます' },
  '学校': { sentence: '子どもたちは毎日八時に学校へ行きます。', reading: 'こどもたちはまいにちはちじにがっこうへいきます。', meaning: 'Bọn trẻ đi học lúc tám giờ mỗi ngày.', collocation: '学校へ行きます' },
  '会社': { sentence: '父は毎朝電車で会社へ行きます。', reading: 'ちちはまいあさでんしゃでかいしゃへいきます。', meaning: 'Bố tôi đi làm bằng tàu mỗi sáng.', collocation: '会社へ行きます' },
  '駅': { sentence: '午後三時に駅で友達を待っています。', reading: 'ごごさんじにえきでともだちをまっています。', meaning: 'Tôi đang đợi bạn ở ga lúc ba giờ chiều.', collocation: '駅で待ちます' },
  '電車': { sentence: '雨の日は電車で会社へ行きます。', reading: 'あめのひはでんしゃでかいしゃへいきます。', meaning: 'Ngày mưa tôi đi làm bằng tàu.', collocation: '電車で行きます' },
  '本': { sentence: '図書館で日本の料理についての本を借りました。', reading: 'としょかんでにほんのりょうりについてのほんをかりました。', meaning: 'Tôi đã mượn sách về ẩm thực Nhật ở thư viện.', collocation: '本を借ります' },
  '水': { sentence: '暑いので、冷たい水を飲んでください。', reading: 'あついので、つめたいみずをのんでください。', meaning: 'Vì trời nóng nên hãy uống nước lạnh.', collocation: '水を飲みます' },
  '家族': { sentence: '週末は家族といっしょに料理を作ります。', reading: 'しゅうまつはかぞくといっしょにりょうりをつくります。', meaning: 'Cuối tuần tôi nấu ăn cùng gia đình.', collocation: '家族といっしょに' },
  '友達': { sentence: '昨日、友達と映画を見に行きました。', reading: 'きのう、ともだちとえいがをみにいきました。', meaning: 'Hôm qua tôi đi xem phim với bạn.', collocation: '友達と行きます' },
  '病院': { sentence: '熱が下がらないので、病院へ行きます。', reading: 'ねつがさがらないので、びょういんへいきます。', meaning: 'Vì không hạ sốt nên tôi đi bệnh viện.', collocation: '病院へ行きます' },
  '大きい': { sentence: '駅の前に大きいスーパーがあります。', reading: 'えきのまえにおおきいスーパーがあります。', meaning: 'Trước ga có một siêu thị lớn.', collocation: '大きいスーパー' },
  '小さい': { sentence: '机の上に小さいかばんがあります。', reading: 'つくえのうえにちいさいかばんがあります。', meaning: 'Trên bàn có một chiếc túi nhỏ.', collocation: '小さいかばん' },
  '新しい': { sentence: '来週の旅行のために、新しい靴を買いました。', reading: 'らいしゅうのりょこうのために、あたらしいくつをかいました。', meaning: 'Tôi đã mua giày mới cho chuyến đi tuần sau.', collocation: '新しい靴' },
  '古い': { sentence: 'この町には古いお寺がたくさんあります。', reading: 'このまちにはふるいおてらがたくさんあります。', meaning: 'Thị trấn này có nhiều ngôi chùa cổ.', collocation: '古いお寺' },
  '寒い': { sentence: '今日は寒いので、厚いコートを着ます。', reading: 'きょうはさむいので、あついコートをきます。', meaning: 'Hôm nay trời lạnh nên tôi mặc áo khoác dày.', collocation: '今日は寒いです' },
  'きれい': { sentence: 'この公園は花が多くて、とてもきれいです。', reading: 'このこうえんははながおおくて、とてもきれいです。', meaning: 'Công viên này có nhiều hoa và rất đẹp.', collocation: 'とてもきれいです' },
  '静か': { sentence: '図書館は静かですから、勉強しやすいです。', reading: 'としょかんはしずかですから、べんきょうしやすいです。', meaning: 'Thư viện yên tĩnh nên rất dễ học.', collocation: '静かな場所' },
  '忙しい': { sentence: '今日は仕事が多くて、とても忙しいです。', reading: 'きょうはしごとがおおくて、とてもいそがしいです。', meaning: 'Hôm nay có nhiều việc nên tôi rất bận.', collocation: '仕事が忙しいです' },
  '暇': { sentence: '日曜日の午後は暇ですから、映画を見ませんか。', reading: 'にちようびのごごはひまですから、えいがをみませんか。', meaning: 'Chiều Chủ nhật tôi rảnh, cùng xem phim nhé?', collocation: '暇な時間' },
  '参加します': { sentence: '来週、日本語のスピーチ大会に参加します。', reading: 'らいしゅう、にほんごのスピーチたいかいにさんかします。', meaning: 'Tuần sau tôi tham gia cuộc thi hùng biện tiếng Nhật.', collocation: '大会に参加します' },
  '入院します': { sentence: '父は手術のため、来週から入院します。', reading: 'ちちはしゅじゅつのため、らいしゅうからにゅういんします。', meaning: 'Bố tôi sẽ nhập viện từ tuần sau để phẫu thuật.', collocation: '病院に入院します' },
  '退院します': { sentence: '順調に治れば、金曜日に退院します。', reading: 'じゅんちょうになおれば、きんようびにたいいんします。', meaning: 'Nếu hồi phục thuận lợi, tôi sẽ xuất viện vào thứ Sáu.', collocation: '病院を退院します' },
  '続けます': { sentence: '健康のために、毎朝の運動を続けます。', reading: 'けんこうのために、まいあさのうんどうをつづけます。', meaning: 'Vì sức khỏe, tôi tiếp tục tập thể dục mỗi sáng.', collocation: '運動を続けます' },
  '届けます': { sentence: '道で拾った財布を交番に届けます。', reading: 'みちでひろったさいふをこうばんにとどけます。', meaning: 'Tôi mang chiếc ví nhặt được trên đường đến đồn cảnh sát.', collocation: '交番に届けます' },
  '地震': { sentence: '昨日の夜、この町で大きな地震がありました。', reading: 'きのうのよる、このまちでおおきなじしんがありました。', meaning: 'Tối qua đã xảy ra một trận động đất lớn ở thị trấn này.', collocation: '地震があります' },
  '台風': { sentence: '台風が近づいているので、電車が止まりました。', reading: 'たいふうがちかづいているので、でんしゃがとまりました。', meaning: 'Vì bão đang đến gần nên tàu đã dừng.', collocation: '台風が近づきます' },
  '予定': { sentence: '忘れないように、明日の予定を手帳に書きます。', reading: 'わすれないように、あしたのよていをてちょうにかきます。', meaning: 'Để không quên, tôi ghi kế hoạch ngày mai vào sổ.', collocation: '予定を立てます' },
  '健康': { sentence: '毎日三十分歩くことは健康にいいです。', reading: 'まいにちさんじゅっぷんあるくことはけんこうにいいです。', meaning: 'Đi bộ 30 phút mỗi ngày rất tốt cho sức khỏe.', collocation: '健康にいいです' },
  '宇宙': { sentence: '子どものころ、宇宙へ行きたいと思っていました。', reading: 'こどものころ、うちゅうへいきたいとおもっていました。', meaning: 'Khi còn nhỏ tôi từng muốn đi vào vũ trụ.', collocation: '宇宙へ行きます' },
  '文化': { sentence: '旅行をすると、外国の文化を知ることができます。', reading: 'りょこうをすると、がいこくのぶんかをしることができます。', meaning: 'Khi đi du lịch, ta có thể tìm hiểu văn hóa nước ngoài.', collocation: '文化を知ります' },
  '習慣': { sentence: '朝ご飯を食べることは大切な習慣です。', reading: 'あさごはんをたべることはたいせつなしゅうかんです。', meaning: 'Ăn sáng là một thói quen quan trọng.', collocation: '生活習慣' },
  '心配': { sentence: 'まだ連絡がないので、家族のことが心配です。', reading: 'まだれんらくがないので、かぞくのことがしんぱいです。', meaning: 'Vì vẫn chưa có liên lạc nên tôi lo cho gia đình.', collocation: '家族のことが心配です' },
  '不思議': { sentence: '何度聞いても、この話は不思議です。', reading: 'なんどきいても、このはなしはふしぎです。', meaning: 'Dù nghe bao nhiêu lần, câu chuyện này vẫn kỳ lạ.', collocation: '不思議な話' },
  '必要': { sentence: '海外旅行にはパスポートが必要です。', reading: 'かいがいりょこうにはパスポートがひつようです。', meaning: 'Du lịch nước ngoài cần có hộ chiếu.', collocation: 'パスポートが必要です' },
  '丈夫': { sentence: 'このかばんは丈夫なので、長く使えます。', reading: 'このかばんはじょうぶなので、ながくつかえます。', meaning: 'Chiếc túi này bền nên có thể dùng lâu.', collocation: '丈夫なかばん' },
  '変': { sentence: '車のエンジンから変な音がします。', reading: 'くるまのエンジンからへんなおとがします。', meaning: 'Có tiếng động lạ phát ra từ động cơ ô tô.', collocation: '変な音' },
  '安全': { sentence: '夜は明るくて安全な道を歩いてください。', reading: 'よるはあかるくてあんぜんなみちをあるいてください。', meaning: 'Buổi tối hãy đi trên con đường sáng và an toàn.', collocation: '安全な道' },
  '危険': { sentence: '波が高い日は、ここで泳ぐのは危険です。', reading: 'なみがたかいひは、ここでおよぐのはきけんです。', meaning: 'Ngày sóng cao, bơi ở đây rất nguy hiểm.', collocation: '危険な場所' },
  '美しい': { sentence: '山の上から美しい夕日が見えます。', reading: 'やまのうえからうつくしいゆうひがみえます。', meaning: 'Từ trên núi có thể nhìn thấy hoàng hôn tuyệt đẹp.', collocation: '美しい景色' },
};

export const getVocabularyClozeExercises = (pool: VocabularyInfo[]): VocabularyClozeExercise[] => {
  const seen = new Set<string>();
  return pool.flatMap((item) => {
    const cloze = curatedClozeByWord[item.word];
    if (!cloze || seen.has(item.word) || !cloze.sentence.includes(item.word)) return [];
    seen.add(item.word);
    return [{ ...cloze, item, blankSentence: cloze.sentence.replace(item.word, '＿＿＿') }];
  });
};

export type VocabularyRelationKind = 'synonym' | 'antonym';

export type VocabularyRelationPair = {
  id: string;
  kind: VocabularyRelationKind;
  left: VocabularyInfo;
  right: VocabularyInfo;
  explanation: string;
};

const relationDefinitions: { kind: VocabularyRelationKind; left: string; right: string; explanation: string }[] = [
  { kind: 'antonym', left: '大きい', right: '小さい', explanation: 'lớn ↔ nhỏ' },
  { kind: 'antonym', left: '新しい', right: '古い', explanation: 'mới ↔ cũ' },
  { kind: 'antonym', left: '高い', right: '安い', explanation: 'đắt/cao ↔ rẻ' },
  { kind: 'antonym', left: '忙しい', right: '暇', explanation: 'bận ↔ rảnh' },
  { kind: 'antonym', left: '好き', right: '嫌い', explanation: 'thích ↔ ghét' },
  { kind: 'antonym', left: '上手', right: '下手', explanation: 'giỏi ↔ kém' },
  { kind: 'antonym', left: '近い', right: '遠い', explanation: 'gần ↔ xa' },
  { kind: 'antonym', left: '多い', right: '少ない', explanation: 'nhiều ↔ ít' },
  { kind: 'antonym', left: '重い', right: '軽い', explanation: 'nặng ↔ nhẹ' },
  { kind: 'antonym', left: '広い', right: '狭い', explanation: 'rộng ↔ hẹp' },
  { kind: 'antonym', left: '長い', right: '短い', explanation: 'dài ↔ ngắn' },
  { kind: 'antonym', left: '明るい', right: '暗い', explanation: 'sáng ↔ tối' },
  { kind: 'antonym', left: 'いい', right: '悪い', explanation: 'tốt ↔ xấu' },
  { kind: 'antonym', left: '安全', right: '危険', explanation: 'an toàn ↔ nguy hiểm' },
  { kind: 'antonym', left: '起きます', right: '寝ます', explanation: 'thức dậy ↔ đi ngủ' },
  { kind: 'antonym', left: '開けます', right: '閉めます', explanation: 'mở ↔ đóng' },
  { kind: 'antonym', left: 'つけます', right: '消します', explanation: 'bật ↔ tắt' },
  { kind: 'antonym', left: '入ります', right: '出ます', explanation: 'vào ↔ ra' },
  { kind: 'antonym', left: '上げます', right: '下げます', explanation: 'nâng lên ↔ hạ xuống' },
  { kind: 'antonym', left: '気分がいい', right: '気分が悪い', explanation: 'cảm thấy khỏe ↔ cảm thấy mệt' },
  { kind: 'antonym', left: '気持ちがいい', right: '気持ちが悪い', explanation: 'dễ chịu ↔ khó chịu' },
  { kind: 'antonym', left: '硬い', right: '軟らかい', explanation: 'cứng ↔ mềm' },
  { kind: 'antonym', left: 'うれしい', right: '悲しい', explanation: 'vui ↔ buồn' },
  { kind: 'antonym', left: '濃い', right: '薄い', explanation: 'đậm ↔ nhạt' },
  { kind: 'antonym', left: '太い', right: '細い', explanation: 'to/dày ↔ nhỏ/mảnh' },
  { kind: 'antonym', left: 'うまい', right: 'まずい', explanation: 'ngon ↔ dở' },
  { kind: 'antonym', left: '安心', right: '心配', explanation: 'yên tâm ↔ lo lắng' },
  { kind: 'antonym', left: '成功します', right: '失敗します', explanation: 'thành công ↔ thất bại' },
  { kind: 'antonym', left: '入院します', right: '退院します', explanation: 'nhập viện ↔ xuất viện' },
  { kind: 'antonym', left: '輸出します', right: '輸入します', explanation: 'xuất khẩu ↔ nhập khẩu' },
  { kind: 'antonym', left: '太ります', right: 'やせます', explanation: 'tăng cân ↔ giảm cân' },
  { kind: 'antonym', left: '開きます', right: '閉まります', explanation: 'mở ↔ đóng' },
  { kind: 'antonym', left: 'つきます', right: '消えます', explanation: 'sáng/bật ↔ tắt' },
  { kind: 'antonym', left: '晴れます', right: '曇ります', explanation: 'trời quang ↔ trời nhiều mây' },
  { kind: 'antonym', left: '入れます', right: '切ります', explanation: 'bật nguồn ↔ tắt nguồn' },
  { kind: 'antonym', left: '褒めます', right: 'しかります', explanation: 'khen ↔ mắng' },
  { kind: 'synonym', left: 'きれい', right: '美しい', explanation: 'đẹp, xinh đẹp' },
  { kind: 'synonym', left: '男の人', right: '男性', explanation: 'người đàn ông/nam giới' },
  { kind: 'synonym', left: '女の人', right: '女性', explanation: 'người phụ nữ/nữ giới' },
  { kind: 'synonym', left: 'うち', right: '家', explanation: 'nhà, nhà mình' },
  { kind: 'synonym', left: '車', right: '自動車', explanation: 'xe hơi/ô tô' },
  { kind: 'synonym', left: '食堂', right: 'レストラン', explanation: 'nơi dùng bữa/nhà hàng' },
  { kind: 'synonym', left: '家', right: 'お宅', explanation: 'nhà (お宅 là cách nói lịch sự)' },
  { kind: 'synonym', left: '子どもたち', right: '子供たち', explanation: 'trẻ em, bọn trẻ' },
  { kind: 'synonym', left: '息子', right: '息子さん', explanation: 'con trai (息子さん là cách gọi lịch sự)' },
  { kind: 'synonym', left: '娘', right: '娘さん', explanation: 'con gái (娘さん là cách gọi lịch sự)' },
  { kind: 'synonym', left: 'けが', right: '傷', explanation: 'vết thương/chấn thương' },
  { kind: 'synonym', left: '材料', right: '原料', explanation: 'vật liệu/nguyên liệu' },
  { kind: 'synonym', left: 'おじ', right: 'おじさん', explanation: 'chú/cậu/bác trai' },
  { kind: 'synonym', left: 'おば', right: 'おばさん', explanation: 'cô/dì/bác gái' },
];

export const getVocabularyRelationPairs = (pool: VocabularyInfo[]): VocabularyRelationPair[] => {
  const byWord = new Map<string, VocabularyInfo>();
  pool.forEach((item) => {
    if (!byWord.has(item.word)) byWord.set(item.word, item);
  });
  return relationDefinitions.flatMap((definition, index) => {
    const left = byWord.get(definition.left);
    const right = byWord.get(definition.right);
    if (!left || !right) return [];
    return [{ id: `${definition.kind}-${index}`, kind: definition.kind, left, right, explanation: definition.explanation }];
  });
};
