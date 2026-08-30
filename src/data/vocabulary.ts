import { kanjiData } from './kanji';
import type { JLPTLevel } from './jlptCore';

export type VocabularyKanjiReference = {
  id: string;
  kanji: string;
  meaning: string;
  level: JLPTLevel;
};

export type VocabularyContext = {
  title: string;
  phrase: string;
  reading: string;
  meaning: string;
  hint: string;
};

export type VocabularyInfo = {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  level: JLPTLevel;
  relatedKanji: VocabularyKanjiReference[];
  contexts: VocabularyContext[];
};

export type VocabularyLessonGroup = {
  level: JLPTLevel;
  title: string;
  words: VocabularyInfo[];
};

type RawVocabularyInfo = {
  lesson: number;
  word: string;
  reading: string;
  meaning: string;
};

/*
 * Vocabulary N5 is grouped by Minna no Nihongo I lessons 1-25.
 * Source pages used for the raw lesson order: https://jtest.net/tu-vung-minna/bai-1 ... 25
 * Only vocabulary rows are included; textbook dialogues/examples are intentionally omitted.
 */
const minnaN5LessonTitles = Array.from({ length: 25 }, (_, index) => (
  `Minna no Nihongo I - Bài ${String(index + 1).padStart(2, '0')}`
));

const rawMinnaN5Vocabulary = [
  {
    "lesson": 1,
    "word": "わたし",
    "reading": "わたし",
    "meaning": "tôi"
  },
  {
    "lesson": 1,
    "word": "あなた",
    "reading": "あなた",
    "meaning": "anh/ chị/ ông/ bà"
  },
  {
    "lesson": 1,
    "word": "あの人",
    "reading": "あのひと",
    "meaning": "người kia, người đó"
  },
  {
    "lesson": 1,
    "word": "あの方",
    "reading": "あのかた",
    "meaning": "vị kia (cách nói lịch sự của あのひと)"
  },
  {
    "lesson": 1,
    "word": "～さん",
    "reading": "～さん",
    "meaning": "anh, chị, ông, bà"
  },
  {
    "lesson": 1,
    "word": "～ちゃん",
    "reading": "～ちゃん",
    "meaning": "(hậu tố thêm vào sau tên của trẻ em thay cho 「～さん」)"
  },
  {
    "lesson": 1,
    "word": "～人",
    "reading": "～じん",
    "meaning": "người (nước)~ ví dụ 「アメリカじん」: người Mỹ)"
  },
  {
    "lesson": 1,
    "word": "先生",
    "reading": "せんせい",
    "meaning": "thầy/ cô"
  },
  {
    "lesson": 1,
    "word": "教師",
    "reading": "きょうし",
    "meaning": "giáo viên"
  },
  {
    "lesson": 1,
    "word": "学生",
    "reading": "がくせい",
    "meaning": "học sinh, sinh viên"
  },
  {
    "lesson": 1,
    "word": "会社員",
    "reading": "かいしゃいん",
    "meaning": "nhân viên công ty"
  },
  {
    "lesson": 1,
    "word": "社員",
    "reading": "しゃいん",
    "meaning": "nhân viên công ty ~ ví dụ「ＩＭＣのしゃいん」"
  },
  {
    "lesson": 1,
    "word": "銀行員",
    "reading": "ぎんこういん",
    "meaning": "nhân viên ngân hàng"
  },
  {
    "lesson": 1,
    "word": "医者",
    "reading": "いしゃ",
    "meaning": "bác sĩ"
  },
  {
    "lesson": 1,
    "word": "研究者",
    "reading": "けんきゅうしゃ",
    "meaning": "nhà nghiên cứu"
  },
  {
    "lesson": 1,
    "word": "大学",
    "reading": "だいがく",
    "meaning": "đại học, trường đại học"
  },
  {
    "lesson": 1,
    "word": "病院",
    "reading": "びょういん",
    "meaning": "bệnh viện"
  },
  {
    "lesson": 1,
    "word": "だれ",
    "reading": "だれ",
    "meaning": "ai (「どなた」là cách nói lịch sự của 「だれ」, vị nào)"
  },
  {
    "lesson": 1,
    "word": "－歳",
    "reading": "―さい",
    "meaning": "―tuổi"
  },
  {
    "lesson": 1,
    "word": "何歳",
    "reading": "なんさい",
    "meaning": "mấy tuổi, bao nhiêu tuổi (「おいくつ」là cách nói lịch sự của「なんさい」)"
  },
  {
    "lesson": 1,
    "word": "はい",
    "reading": "はい",
    "meaning": "vâng, dạ"
  },
  {
    "lesson": 1,
    "word": "いいえ",
    "reading": "いいえ",
    "meaning": "không"
  },
  {
    "lesson": 1,
    "word": "初めまして",
    "reading": "初めまして",
    "meaning": "Rất hân hạnh được gặp anh/chị"
  },
  {
    "lesson": 1,
    "word": "～から来ました",
    "reading": "～から来ました",
    "meaning": "(tôi) đến từ ~"
  },
  {
    "lesson": 1,
    "word": "どうぞよろしく",
    "reading": "どうぞよろしく",
    "meaning": "Rất vui khi được làm quen"
  },
  {
    "lesson": 1,
    "word": "失礼ですが",
    "reading": "失礼ですが",
    "meaning": "xin lỗi,…"
  },
  {
    "lesson": 1,
    "word": "お名前は？",
    "reading": "お名前は？",
    "meaning": "Tên anh/chị là gì?"
  },
  {
    "lesson": 1,
    "word": "こちらは～さんです",
    "reading": "こちらは～さんです",
    "meaning": "Đây là anh/chị/ông/bà ~"
  },
  {
    "lesson": 1,
    "word": "アメリカ",
    "reading": "アメリカ",
    "meaning": "Mỹ"
  },
  {
    "lesson": 1,
    "word": "イギリス",
    "reading": "イギリス",
    "meaning": "Anh"
  },
  {
    "lesson": 1,
    "word": "インド",
    "reading": "インド",
    "meaning": "Ấn Độ"
  },
  {
    "lesson": 1,
    "word": "インドネシア",
    "reading": "インドネシア",
    "meaning": "Indonesia"
  },
  {
    "lesson": 1,
    "word": "韓国",
    "reading": "韓国",
    "meaning": "Hàn Quốc"
  },
  {
    "lesson": 1,
    "word": "タイ",
    "reading": "タイ",
    "meaning": "Thái Lan"
  },
  {
    "lesson": 1,
    "word": "中国",
    "reading": "中国",
    "meaning": "Trung Quốc"
  },
  {
    "lesson": 1,
    "word": "ドイツ",
    "reading": "ドイツ",
    "meaning": "Đức"
  },
  {
    "lesson": 1,
    "word": "日本",
    "reading": "日本",
    "meaning": "Nhật Bản"
  },
  {
    "lesson": 1,
    "word": "ブラジル",
    "reading": "ブラジル",
    "meaning": "Braxin"
  },
  {
    "lesson": 1,
    "word": "ＩＭＣ/パワーでんき/ブラジルエアー",
    "reading": "ＩＭＣ/パワーでんき/ブラジルエアー",
    "meaning": "tên công ty (giả định)"
  },
  {
    "lesson": 1,
    "word": "ＡＫＣ",
    "reading": "ＡＫＣ",
    "meaning": "tên một tổ chức (giả định)"
  },
  {
    "lesson": 1,
    "word": "神戸病院",
    "reading": "神戸病院",
    "meaning": "tên một bệnh viện (giả định)"
  },
  {
    "lesson": 1,
    "word": "さくら大学富士大学",
    "reading": "さくら大学富士大学",
    "meaning": "Đại học Sakura (giả định) Đại học Phú Sĩ (giả định)"
  },
  {
    "lesson": 2,
    "word": "これ",
    "reading": "これ",
    "meaning": "cái này, đây (vật ở gần người nói)"
  },
  {
    "lesson": 2,
    "word": "それ",
    "reading": "それ",
    "meaning": "cái đó, đó (vật ở gần người nghe)"
  },
  {
    "lesson": 2,
    "word": "あれ",
    "reading": "あれ",
    "meaning": "cái kia, kia (vật ở xa cả người nói và người nghe)"
  },
  {
    "lesson": 2,
    "word": "この～",
    "reading": "この～",
    "meaning": "~ này"
  },
  {
    "lesson": 2,
    "word": "その～",
    "reading": "その～",
    "meaning": "~ đó"
  },
  {
    "lesson": 2,
    "word": "あの～",
    "reading": "あの～",
    "meaning": "~ kia"
  },
  {
    "lesson": 2,
    "word": "本",
    "reading": "ほん",
    "meaning": "sách"
  },
  {
    "lesson": 2,
    "word": "辞書",
    "reading": "じしょ",
    "meaning": "từ điển"
  },
  {
    "lesson": 2,
    "word": "雑誌",
    "reading": "ざっし",
    "meaning": "tạp chí"
  },
  {
    "lesson": 2,
    "word": "新聞",
    "reading": "しんぶん",
    "meaning": "báo"
  },
  {
    "lesson": 2,
    "word": "ノート",
    "reading": "ノート",
    "meaning": "vở"
  },
  {
    "lesson": 2,
    "word": "手帳",
    "reading": "てちょう",
    "meaning": "sổ tay"
  },
  {
    "lesson": 2,
    "word": "名刺",
    "reading": "めいし",
    "meaning": "danh thiếp"
  },
  {
    "lesson": 2,
    "word": "カード",
    "reading": "カード",
    "meaning": "thẻ, cạc"
  },
  {
    "lesson": 2,
    "word": "鉛筆",
    "reading": "えんぴつ",
    "meaning": "bút chì"
  },
  {
    "lesson": 2,
    "word": "ボールペン",
    "reading": "ボールペン",
    "meaning": "bút bi"
  },
  {
    "lesson": 2,
    "word": "シャープペンシル",
    "reading": "シャープペンシル",
    "meaning": "bút chì kim, bút chì bấm"
  },
  {
    "lesson": 2,
    "word": "かぎ",
    "reading": "かぎ",
    "meaning": "chìa khóa"
  },
  {
    "lesson": 2,
    "word": "時計",
    "reading": "とけい",
    "meaning": "đồng hồ"
  },
  {
    "lesson": 2,
    "word": "傘",
    "reading": "かさ",
    "meaning": "ô, dù"
  },
  {
    "lesson": 2,
    "word": "かばん",
    "reading": "かばん",
    "meaning": "cặp sách, túi sách"
  },
  {
    "lesson": 2,
    "word": "CD",
    "reading": "CD",
    "meaning": "đĩa CD"
  },
  {
    "lesson": 2,
    "word": "テレビ",
    "reading": "テレビ",
    "meaning": "tivi"
  },
  {
    "lesson": 2,
    "word": "ラジオ",
    "reading": "ラジオ",
    "meaning": "Radio"
  },
  {
    "lesson": 2,
    "word": "カメラ",
    "reading": "カメラ",
    "meaning": "máy ảnh"
  },
  {
    "lesson": 2,
    "word": "コンピューター",
    "reading": "コンピューター",
    "meaning": "máy vi tính"
  },
  {
    "lesson": 2,
    "word": "車",
    "reading": "くるま",
    "meaning": "ô tô, xe hơi"
  },
  {
    "lesson": 2,
    "word": "机",
    "reading": "つくえ",
    "meaning": "cái bàn"
  },
  {
    "lesson": 2,
    "word": "いす",
    "reading": "いす",
    "meaning": "cái ghế"
  },
  {
    "lesson": 2,
    "word": "チョコレート",
    "reading": "チョコレート",
    "meaning": "Socola"
  },
  {
    "lesson": 2,
    "word": "コーヒー",
    "reading": "コーヒー",
    "meaning": "cà phê"
  },
  {
    "lesson": 2,
    "word": "土産",
    "reading": "みやげ",
    "meaning": "quà (mua khi đi xa về hoặc mang đi thăm nhà người nào đó)"
  },
  {
    "lesson": 2,
    "word": "英語",
    "reading": "えいご",
    "meaning": "tiếng Anh"
  },
  {
    "lesson": 2,
    "word": "日本語",
    "reading": "にほんご",
    "meaning": "tiếng Nhật"
  },
  {
    "lesson": 2,
    "word": "～語",
    "reading": "～ご",
    "meaning": "tiếng ~"
  },
  {
    "lesson": 2,
    "word": "何",
    "reading": "なに",
    "meaning": "cái gì"
  },
  {
    "lesson": 2,
    "word": "そう",
    "reading": "そう",
    "meaning": "đúng rồi"
  },
  {
    "lesson": 2,
    "word": "あのう",
    "reading": "あのう",
    "meaning": "à, ờ (dùng để biểu thị sự ngại ngùng, do dự)"
  },
  {
    "lesson": 2,
    "word": "えっ",
    "reading": "えっ",
    "meaning": "hả?"
  },
  {
    "lesson": 2,
    "word": "どうぞ",
    "reading": "どうぞ",
    "meaning": "Xin mời (dùng khi mời ai đó cái gì)"
  },
  {
    "lesson": 2,
    "word": "ありがとう",
    "reading": "ありがとう",
    "meaning": "Xin chân thành cám ơn"
  },
  {
    "lesson": 2,
    "word": "そうですか",
    "reading": "そうですか",
    "meaning": "Thế à, vậy à"
  },
  {
    "lesson": 2,
    "word": "違います",
    "reading": "違います",
    "meaning": "Không phải, không đúng, sai rồi"
  },
  {
    "lesson": 2,
    "word": "あ",
    "reading": "あ",
    "meaning": "Ôi! (Dùng khi nhận ra điều gì)"
  },
  {
    "lesson": 2,
    "word": "これからお世話になります",
    "reading": "これからお世話になります",
    "meaning": "Từ nay tôi rất mong sự giúp đỡ của anh chị"
  },
  {
    "lesson": 2,
    "word": "こちらこそよろしく",
    "reading": "こちらこそよろしく",
    "meaning": "Chính tôi mới phải xin ông giúp đỡ cho"
  },
  {
    "lesson": 3,
    "word": "ここ",
    "reading": "ここ",
    "meaning": "chỗ này, đây"
  },
  {
    "lesson": 3,
    "word": "そこ",
    "reading": "そこ",
    "meaning": "chỗ đó, đó"
  },
  {
    "lesson": 3,
    "word": "あそこ",
    "reading": "あそこ",
    "meaning": "chỗ kia, kia"
  },
  {
    "lesson": 3,
    "word": "どこ",
    "reading": "どこ",
    "meaning": "chỗ nào, đâu"
  },
  {
    "lesson": 3,
    "word": "こちら",
    "reading": "こちら",
    "meaning": "phía này, đằng này, chỗ này, đây"
  },
  {
    "lesson": 3,
    "word": "そちら",
    "reading": "そちら",
    "meaning": "phía đó, đằng đó, chỗ đó, đó"
  },
  {
    "lesson": 3,
    "word": "あちら",
    "reading": "あちら",
    "meaning": "phía kia, đằng kia, chỗ kia, kia"
  },
  {
    "lesson": 3,
    "word": "どちら",
    "reading": "どちら",
    "meaning": "phía nào, đằng nào, chỗ nào, đâu"
  },
  {
    "lesson": 3,
    "word": "教室",
    "reading": "きょうしつ",
    "meaning": "lớp học, phòng học"
  },
  {
    "lesson": 3,
    "word": "食堂",
    "reading": "しょくどう",
    "meaning": "nhà ăn"
  },
  {
    "lesson": 3,
    "word": "事務所",
    "reading": "じむしょ",
    "meaning": "văn phòng"
  },
  {
    "lesson": 3,
    "word": "会議室",
    "reading": "かいぎしつ",
    "meaning": "phòng họp"
  },
  {
    "lesson": 3,
    "word": "受付",
    "reading": "うけつけ",
    "meaning": "bộ phận tiếp tân, phòng thường trực"
  },
  {
    "lesson": 3,
    "word": "ロビー",
    "reading": "ロビー",
    "meaning": "hành lang, đại sảnh"
  },
  {
    "lesson": 3,
    "word": "部屋",
    "reading": "へや",
    "meaning": "căn phòng"
  },
  {
    "lesson": 3,
    "word": "トイレ",
    "reading": "トイレ",
    "meaning": "nhà vệ sinh, phòng vệ sinh, toa-lét"
  },
  {
    "lesson": 3,
    "word": "階段",
    "reading": "かいだん",
    "meaning": "cầu thang"
  },
  {
    "lesson": 3,
    "word": "エレベーター",
    "reading": "エレベーター",
    "meaning": "thang máy"
  },
  {
    "lesson": 3,
    "word": "エスカレーター",
    "reading": "エスカレーター",
    "meaning": "thang cuốn"
  },
  {
    "lesson": 3,
    "word": "自動販売機",
    "reading": "じどうはんばいき",
    "meaning": "máy bán hàng tự động"
  },
  {
    "lesson": 3,
    "word": "電話",
    "reading": "でんわ",
    "meaning": "máy điện thoại, điện thoại"
  },
  {
    "lesson": 3,
    "word": "国",
    "reading": "くに",
    "meaning": "đất nước (của anh/chị)"
  },
  {
    "lesson": 3,
    "word": "会社",
    "reading": "かいしゃ",
    "meaning": "công ty"
  },
  {
    "lesson": 3,
    "word": "うち",
    "reading": "うち",
    "meaning": "nhà"
  },
  {
    "lesson": 3,
    "word": "靴",
    "reading": "くつ",
    "meaning": "giầy"
  },
  {
    "lesson": 3,
    "word": "ネクタイ",
    "reading": "ネクタイ",
    "meaning": "cà vạt"
  },
  {
    "lesson": 3,
    "word": "ワイン",
    "reading": "ワイン",
    "meaning": "rượu vang"
  },
  {
    "lesson": 3,
    "word": "売り場",
    "reading": "うりば",
    "meaning": "quầy bán (trong một cửa hàng bách hóa)"
  },
  {
    "lesson": 3,
    "word": "地下",
    "reading": "ちか",
    "meaning": "tầng hầm, dưới mặt đất"
  },
  {
    "lesson": 3,
    "word": "－階",
    "reading": "―かい",
    "meaning": "tầng thứ -"
  },
  {
    "lesson": 3,
    "word": "何階",
    "reading": "なんがい",
    "meaning": "tầng mấy"
  },
  {
    "lesson": 3,
    "word": "―円",
    "reading": "―えん",
    "meaning": "-yên"
  },
  {
    "lesson": 3,
    "word": "いくら",
    "reading": "いくら",
    "meaning": "bao nhiêu tiền"
  },
  {
    "lesson": 3,
    "word": "百",
    "reading": "ひゃく",
    "meaning": "trăm"
  },
  {
    "lesson": 3,
    "word": "千",
    "reading": "せん",
    "meaning": "nghìn"
  },
  {
    "lesson": 3,
    "word": "万",
    "reading": "まん",
    "meaning": "mười nghìn, vạn"
  },
  {
    "lesson": 3,
    "word": "すみません",
    "reading": "すみません",
    "meaning": "Xin lỗi"
  },
  {
    "lesson": 3,
    "word": "～どうも",
    "reading": "～どうも",
    "meaning": "Cám ơn"
  },
  {
    "lesson": 3,
    "word": "いらっしゃいませ",
    "reading": "いらっしゃいませ",
    "meaning": "Xin chào quý khách, mời quý khách vào"
  },
  {
    "lesson": 3,
    "word": "を見せてください",
    "reading": "を見せてください",
    "meaning": "cho tôi xem [~]"
  },
  {
    "lesson": 3,
    "word": "じゃ",
    "reading": "じゃ",
    "meaning": "thế thì, vậy thì"
  },
  {
    "lesson": 3,
    "word": "ください",
    "reading": "ください",
    "meaning": "cho tôi [~]"
  },
  {
    "lesson": 3,
    "word": "イタリア",
    "reading": "イタリア",
    "meaning": "Ý"
  },
  {
    "lesson": 3,
    "word": "スイス",
    "reading": "スイス",
    "meaning": "Thụy Sĩ"
  },
  {
    "lesson": 3,
    "word": "フランス",
    "reading": "フランス",
    "meaning": "Pháp"
  },
  {
    "lesson": 3,
    "word": "ジャカルタ",
    "reading": "ジャカルタ",
    "meaning": "Gia-các-ta"
  },
  {
    "lesson": 3,
    "word": "バンコク",
    "reading": "バンコク",
    "meaning": "Băng-cốc"
  },
  {
    "lesson": 3,
    "word": "ベルリン",
    "reading": "ベルリン",
    "meaning": "Béc-lin"
  },
  {
    "lesson": 3,
    "word": "新大阪",
    "reading": "新大阪",
    "meaning": "tên một nhà ga ở Osaka"
  },
  {
    "lesson": 4,
    "word": "起きます",
    "reading": "おきます",
    "meaning": "dậy, thức dậy"
  },
  {
    "lesson": 4,
    "word": "寝ます",
    "reading": "ねます",
    "meaning": "ngủ, đi ngủ"
  },
  {
    "lesson": 4,
    "word": "働きます",
    "reading": "はたらきます",
    "meaning": "làm việc"
  },
  {
    "lesson": 4,
    "word": "休みます",
    "reading": "やすみます",
    "meaning": "nghỉ, nghỉ ngơi"
  },
  {
    "lesson": 4,
    "word": "勉強します",
    "reading": "べんきょうします",
    "meaning": "học"
  },
  {
    "lesson": 4,
    "word": "終わります",
    "reading": "おわります",
    "meaning": "hết, kết thúc, xong"
  },
  {
    "lesson": 4,
    "word": "デパート",
    "reading": "デパート",
    "meaning": "bách hóa"
  },
  {
    "lesson": 4,
    "word": "銀行",
    "reading": "ぎんこう",
    "meaning": "ngân hàng"
  },
  {
    "lesson": 4,
    "word": "郵便局",
    "reading": "ゆうびんきょく",
    "meaning": "bưu điện"
  },
  {
    "lesson": 4,
    "word": "図書館",
    "reading": "としょかん",
    "meaning": "thư viện"
  },
  {
    "lesson": 4,
    "word": "美術館",
    "reading": "びじゅつかん",
    "meaning": "bảo tàng mỹ thuật"
  },
  {
    "lesson": 4,
    "word": "今",
    "reading": "いま",
    "meaning": "bây giờ"
  },
  {
    "lesson": 4,
    "word": "－時",
    "reading": "―じ",
    "meaning": "-giờ"
  },
  {
    "lesson": 4,
    "word": "―分",
    "reading": "―ふん",
    "meaning": "- phút"
  },
  {
    "lesson": 4,
    "word": "半",
    "reading": "はん",
    "meaning": "rưỡi, nửa"
  },
  {
    "lesson": 4,
    "word": "何時",
    "reading": "なんじ",
    "meaning": "mấy giờ"
  },
  {
    "lesson": 4,
    "word": "何分",
    "reading": "なんぷん",
    "meaning": "mấy phút"
  },
  {
    "lesson": 4,
    "word": "午前",
    "reading": "ごぜん",
    "meaning": "sáng, trước 12 giờ trưa"
  },
  {
    "lesson": 4,
    "word": "午後",
    "reading": "ごご",
    "meaning": "chiều, sau 12 giờ trưa"
  },
  {
    "lesson": 4,
    "word": "朝",
    "reading": "あさ",
    "meaning": "buổi sáng, sáng"
  },
  {
    "lesson": 4,
    "word": "昼",
    "reading": "ひる",
    "meaning": "buổi trưa, trưa"
  },
  {
    "lesson": 4,
    "word": "晩",
    "reading": "ばん",
    "meaning": "buổi tối, tối"
  },
  {
    "lesson": 4,
    "word": "おととい",
    "reading": "おととい",
    "meaning": "hôm kia"
  },
  {
    "lesson": 4,
    "word": "きのう",
    "reading": "きのう",
    "meaning": "hôm qua"
  },
  {
    "lesson": 4,
    "word": "きょう",
    "reading": "きょう",
    "meaning": "hôm nay"
  },
  {
    "lesson": 4,
    "word": "あした",
    "reading": "あした",
    "meaning": "ngày mai"
  },
  {
    "lesson": 4,
    "word": "あさって",
    "reading": "あさって",
    "meaning": "ngày kia"
  },
  {
    "lesson": 4,
    "word": "けさ",
    "reading": "けさ",
    "meaning": "sáng nay"
  },
  {
    "lesson": 4,
    "word": "今晩",
    "reading": "こんばん",
    "meaning": "tối nay"
  },
  {
    "lesson": 4,
    "word": "休み",
    "reading": "やすみ",
    "meaning": "nghỉ, nghỉ phép, ngày nghỉ"
  },
  {
    "lesson": 4,
    "word": "昼休み",
    "reading": "ひるやすみ",
    "meaning": "nghỉ trưa"
  },
  {
    "lesson": 4,
    "word": "試験",
    "reading": "試験",
    "meaning": "thi, kỳ thi, kiểm tra"
  },
  {
    "lesson": 4,
    "word": "会議",
    "reading": "会議",
    "meaning": "cuộc họp, hội nghị (～を します： tổ chức cuộc họp, hội nghị)"
  },
  {
    "lesson": 4,
    "word": "映画",
    "reading": "映画",
    "meaning": "phim, điện ảnh"
  },
  {
    "lesson": 4,
    "word": "毎朝",
    "reading": "まいあさ",
    "meaning": "hàng sáng, mỗi sáng"
  },
  {
    "lesson": 4,
    "word": "毎晩",
    "reading": "まいばん",
    "meaning": "hàng tối, mỗi tối"
  },
  {
    "lesson": 4,
    "word": "毎日",
    "reading": "まいにち",
    "meaning": "hàng ngày, mỗi ngày"
  },
  {
    "lesson": 4,
    "word": "月曜日",
    "reading": "げつようび",
    "meaning": "thứ hai"
  },
  {
    "lesson": 4,
    "word": "火曜日",
    "reading": "かようび",
    "meaning": "thứ ba"
  },
  {
    "lesson": 4,
    "word": "水曜日",
    "reading": "すいようび",
    "meaning": "thứ tư"
  },
  {
    "lesson": 4,
    "word": "木曜日",
    "reading": "もくようび",
    "meaning": "thứ năm"
  },
  {
    "lesson": 4,
    "word": "金曜日",
    "reading": "きんようび",
    "meaning": "thứ sáu"
  },
  {
    "lesson": 4,
    "word": "土曜日",
    "reading": "どようび",
    "meaning": "thứ bảy"
  },
  {
    "lesson": 4,
    "word": "日曜日",
    "reading": "にちようび",
    "meaning": "chủ nhật"
  },
  {
    "lesson": 4,
    "word": "何曜日",
    "reading": "なんようび",
    "meaning": "thứ mấy"
  },
  {
    "lesson": 4,
    "word": "～から",
    "reading": "～から",
    "meaning": "~ từ"
  },
  {
    "lesson": 4,
    "word": "～まで",
    "reading": "～まで",
    "meaning": "~ đến"
  },
  {
    "lesson": 4,
    "word": "～と",
    "reading": "～と",
    "meaning": "~ và (dùng để nối hai danh từ)"
  },
  {
    "lesson": 4,
    "word": "大変ですね",
    "reading": "大変ですね",
    "meaning": "Anh/chị vất vả quá"
  },
  {
    "lesson": 4,
    "word": "番号",
    "reading": "番号",
    "meaning": "số (số điện thoại, số phòng)"
  },
  {
    "lesson": 4,
    "word": "何番",
    "reading": "何番",
    "meaning": "số bao nhiêu, số mấy"
  },
  {
    "lesson": 4,
    "word": "そちら",
    "reading": "そちら",
    "meaning": "ông/bà, phía ông/ phía bà"
  },
  {
    "lesson": 4,
    "word": "ニューヨーク",
    "reading": "ニューヨーク",
    "meaning": "New York"
  },
  {
    "lesson": 4,
    "word": "ペキン",
    "reading": "ペキン",
    "meaning": "Bắc Kinh"
  },
  {
    "lesson": 4,
    "word": "ロサンゼルス",
    "reading": "ロサンゼルス",
    "meaning": "Los Angeles"
  },
  {
    "lesson": 4,
    "word": "ロンドン",
    "reading": "ロンドン",
    "meaning": "Luân Đôn"
  },
  {
    "lesson": 4,
    "word": "あすか",
    "reading": "あすか",
    "meaning": "tên giả định của một nhà hàng Nhật"
  },
  {
    "lesson": 4,
    "word": "アップル銀行",
    "reading": "アップル銀行",
    "meaning": "ngân hàng Apple (giả định)"
  },
  {
    "lesson": 4,
    "word": "みどり図書館",
    "reading": "みどり図書館",
    "meaning": "thư viện Midori (giả định)"
  },
  {
    "lesson": 4,
    "word": "やまと美術館",
    "reading": "やまと美術館",
    "meaning": "bảo tàng mỹ thuật Yamato (giả định)"
  },
  {
    "lesson": 5,
    "word": "行きます",
    "reading": "いきます",
    "meaning": "đi"
  },
  {
    "lesson": 5,
    "word": "来ます",
    "reading": "きます",
    "meaning": "đến"
  },
  {
    "lesson": 5,
    "word": "帰ります",
    "reading": "かえります",
    "meaning": "về"
  },
  {
    "lesson": 5,
    "word": "学校",
    "reading": "がっこう",
    "meaning": "trường học"
  },
  {
    "lesson": 5,
    "word": "スーパー",
    "reading": "スーパー",
    "meaning": "siêu thị"
  },
  {
    "lesson": 5,
    "word": "駅",
    "reading": "えき",
    "meaning": "ga, nhà ga"
  },
  {
    "lesson": 5,
    "word": "飛行機",
    "reading": "ひこうき",
    "meaning": "máy bay"
  },
  {
    "lesson": 5,
    "word": "船",
    "reading": "ふね",
    "meaning": "thuyền, tàu thủy"
  },
  {
    "lesson": 5,
    "word": "電車",
    "reading": "でんしゃ",
    "meaning": "tàu điện"
  },
  {
    "lesson": 5,
    "word": "地下鉄",
    "reading": "ちかてつ",
    "meaning": "tàu điện ngầm"
  },
  {
    "lesson": 5,
    "word": "新幹線",
    "reading": "しんかんせん",
    "meaning": "tàu Shinkansen (tàu điện siêu tốc của Nhật)"
  },
  {
    "lesson": 5,
    "word": "バス",
    "reading": "バス",
    "meaning": "xe buýt"
  },
  {
    "lesson": 5,
    "word": "タクシー",
    "reading": "タクシー",
    "meaning": "tắc-xi"
  },
  {
    "lesson": 5,
    "word": "自転車",
    "reading": "じてんしゃ",
    "meaning": "xe đạp"
  },
  {
    "lesson": 5,
    "word": "歩いて",
    "reading": "あるいて",
    "meaning": "đi bộ"
  },
  {
    "lesson": 5,
    "word": "人",
    "reading": "ひと",
    "meaning": "người"
  },
  {
    "lesson": 5,
    "word": "友達",
    "reading": "ともだち",
    "meaning": "bạn, bạn bè"
  },
  {
    "lesson": 5,
    "word": "彼",
    "reading": "かれ",
    "meaning": "anh ấy, bạn trai"
  },
  {
    "lesson": 5,
    "word": "彼女",
    "reading": "かのじょ",
    "meaning": "chị ấy, bạn gái"
  },
  {
    "lesson": 5,
    "word": "家族",
    "reading": "かぞく",
    "meaning": "gia đình"
  },
  {
    "lesson": 5,
    "word": "一人で",
    "reading": "ひとりで",
    "meaning": "một mình"
  },
  {
    "lesson": 5,
    "word": "先週",
    "reading": "せんしゅう",
    "meaning": "tuần trước"
  },
  {
    "lesson": 5,
    "word": "今週",
    "reading": "こんしゅう",
    "meaning": "tuần này"
  },
  {
    "lesson": 5,
    "word": "来週",
    "reading": "らいしゅう",
    "meaning": "tuần sau"
  },
  {
    "lesson": 5,
    "word": "先月",
    "reading": "せんげつ",
    "meaning": "tháng trước"
  },
  {
    "lesson": 5,
    "word": "今月",
    "reading": "こんげつ",
    "meaning": "tháng này"
  },
  {
    "lesson": 5,
    "word": "来月",
    "reading": "らいげつ",
    "meaning": "tháng sau"
  },
  {
    "lesson": 5,
    "word": "去年",
    "reading": "きょねん",
    "meaning": "năm ngoái"
  },
  {
    "lesson": 5,
    "word": "ことし",
    "reading": "ことし",
    "meaning": "năm nay"
  },
  {
    "lesson": 5,
    "word": "来年",
    "reading": "らいねん",
    "meaning": "năm sau"
  },
  {
    "lesson": 5,
    "word": "ー年",
    "reading": "ーねん",
    "meaning": "năm -"
  },
  {
    "lesson": 5,
    "word": "何年",
    "reading": "なんねん",
    "meaning": "mấy năm"
  },
  {
    "lesson": 5,
    "word": "ー月",
    "reading": "ーがつ",
    "meaning": "tháng -"
  },
  {
    "lesson": 5,
    "word": "何月",
    "reading": "なんがつ",
    "meaning": "tháng mấy"
  },
  {
    "lesson": 5,
    "word": "１日",
    "reading": "ついたち",
    "meaning": "ngày mồng 1"
  },
  {
    "lesson": 5,
    "word": "２日",
    "reading": "ふつか",
    "meaning": "ngày mồng 2, 2 ngày"
  },
  {
    "lesson": 5,
    "word": "３日",
    "reading": "みっか",
    "meaning": "ngày mồng 3, 3 ngày"
  },
  {
    "lesson": 5,
    "word": "４日",
    "reading": "よっか",
    "meaning": "ngày mồng 4, 4 ngày"
  },
  {
    "lesson": 5,
    "word": "５日",
    "reading": "いつか",
    "meaning": "ngày mồng 5, 5 ngày"
  },
  {
    "lesson": 5,
    "word": "６日",
    "reading": "むいか",
    "meaning": "ngày mồng 6, 6 ngày"
  },
  {
    "lesson": 5,
    "word": "７日",
    "reading": "なのか",
    "meaning": "ngày mồng 7, 7 ngày"
  },
  {
    "lesson": 5,
    "word": "８日",
    "reading": "ようか",
    "meaning": "ngày mồng 8, 8 ngày"
  },
  {
    "lesson": 5,
    "word": "９日",
    "reading": "ここのか",
    "meaning": "ngày mồng 9, 9 ngày"
  },
  {
    "lesson": 5,
    "word": "１０日",
    "reading": "とおか",
    "meaning": "ngày mồng 10, 10 ngày"
  },
  {
    "lesson": 5,
    "word": "１４日",
    "reading": "じゅうよっか",
    "meaning": "ngày 14, 14 ngày"
  },
  {
    "lesson": 5,
    "word": "２０日",
    "reading": "はつか",
    "meaning": "ngày 20, 20 ngày"
  },
  {
    "lesson": 5,
    "word": "２４日",
    "reading": "にじゅうよっか",
    "meaning": "ngày 24, 24 ngày"
  },
  {
    "lesson": 5,
    "word": "―日",
    "reading": "―にち",
    "meaning": "ngày -, - ngày"
  },
  {
    "lesson": 5,
    "word": "何日",
    "reading": "なんにち",
    "meaning": "ngày mấy, ngày bao nhiêu, mấy ngày, bao nhiêu ngày"
  },
  {
    "lesson": 5,
    "word": "いつ",
    "reading": "いつ",
    "meaning": "bao giờ, khi nào"
  },
  {
    "lesson": 5,
    "word": "誕生日",
    "reading": "たんじょうび",
    "meaning": "sinh nhật"
  },
  {
    "lesson": 5,
    "word": "そうですね",
    "reading": "そうですね",
    "meaning": "Ừ, nhỉ"
  },
  {
    "lesson": 5,
    "word": "ありがとうございました",
    "reading": "ありがとうございました",
    "meaning": "Xin cám ơn anh/chị rất nhiều"
  },
  {
    "lesson": 5,
    "word": "どういたしまして",
    "reading": "どういたしまして",
    "meaning": "Không có gì"
  },
  {
    "lesson": 5,
    "word": "―番線",
    "reading": "―番線",
    "meaning": "sân ga số -"
  },
  {
    "lesson": 5,
    "word": "次の",
    "reading": "次の",
    "meaning": "tiếp theo"
  },
  {
    "lesson": 5,
    "word": "普通",
    "reading": "普通",
    "meaning": "tàu thường (dừng cả ở các ga lẻ)"
  },
  {
    "lesson": 5,
    "word": "急行",
    "reading": "急行",
    "meaning": "tàu tốc hành"
  },
  {
    "lesson": 5,
    "word": "特急",
    "reading": "特急",
    "meaning": "tàu tốc hành đặc biệt"
  },
  {
    "lesson": 5,
    "word": "甲子園",
    "reading": "甲子園",
    "meaning": "tên một khu phố ở Osaka"
  },
  {
    "lesson": 5,
    "word": "大阪城",
    "reading": "大阪城",
    "meaning": "Lâu đài Osaka, một lâu đài nổi tiếng ở Osaka"
  },
  {
    "lesson": 6,
    "word": "食べます",
    "reading": "たべます",
    "meaning": "ăn"
  },
  {
    "lesson": 6,
    "word": "飲みます",
    "reading": "のみます",
    "meaning": "uống"
  },
  {
    "lesson": 6,
    "word": "吸います",
    "reading": "すいます",
    "meaning": "hút [thuốc lá]"
  },
  {
    "lesson": 6,
    "word": "見ます",
    "reading": "みます",
    "meaning": "xem, nhìn, trông"
  },
  {
    "lesson": 6,
    "word": "聞きます",
    "reading": "ききます",
    "meaning": "nghe"
  },
  {
    "lesson": 6,
    "word": "読みます",
    "reading": "よみます",
    "meaning": "đọc"
  },
  {
    "lesson": 6,
    "word": "書きます",
    "reading": "かきます",
    "meaning": "viết, vẽ"
  },
  {
    "lesson": 6,
    "word": "買います",
    "reading": "かいます",
    "meaning": "mua"
  },
  {
    "lesson": 6,
    "word": "撮ります",
    "reading": "とります",
    "meaning": "chụp [ảnh]"
  },
  {
    "lesson": 6,
    "word": "します",
    "reading": "します",
    "meaning": "làm"
  },
  {
    "lesson": 6,
    "word": "会います",
    "reading": "あいます",
    "meaning": "gặp [bạn]"
  },
  {
    "lesson": 6,
    "word": "ごはん",
    "reading": "ごはん",
    "meaning": "cơm, bữa ăn"
  },
  {
    "lesson": 6,
    "word": "朝ごはん",
    "reading": "あさごはん",
    "meaning": "cơm sáng"
  },
  {
    "lesson": 6,
    "word": "昼ごはん",
    "reading": "ひるごはん",
    "meaning": "cơm trưa"
  },
  {
    "lesson": 6,
    "word": "晩ごはん",
    "reading": "ばんごはん",
    "meaning": "cơm tối"
  },
  {
    "lesson": 6,
    "word": "パン",
    "reading": "パン",
    "meaning": "bánh mì"
  },
  {
    "lesson": 6,
    "word": "卵",
    "reading": "たまご",
    "meaning": "trứng"
  },
  {
    "lesson": 6,
    "word": "肉",
    "reading": "にく",
    "meaning": "thịt"
  },
  {
    "lesson": 6,
    "word": "魚",
    "reading": "さかな",
    "meaning": "cá"
  },
  {
    "lesson": 6,
    "word": "野菜",
    "reading": "やさい",
    "meaning": "rau"
  },
  {
    "lesson": 6,
    "word": "果物",
    "reading": "くだもの",
    "meaning": "hoa quả, trái cây"
  },
  {
    "lesson": 6,
    "word": "水",
    "reading": "みず",
    "meaning": "nước"
  },
  {
    "lesson": 6,
    "word": "お茶",
    "reading": "おちゃ",
    "meaning": "trà (nói chung)"
  },
  {
    "lesson": 6,
    "word": "紅茶",
    "reading": "こうちゃ",
    "meaning": "trà đen"
  },
  {
    "lesson": 6,
    "word": "牛乳",
    "reading": "ぎゅうにゅう",
    "meaning": "sữa bò (sữa)"
  },
  {
    "lesson": 6,
    "word": "ジュース",
    "reading": "ジュース",
    "meaning": "nước hoa quả"
  },
  {
    "lesson": 6,
    "word": "ビール",
    "reading": "ビール",
    "meaning": "bia"
  },
  {
    "lesson": 6,
    "word": "酒",
    "reading": "さけ",
    "meaning": "rượu, rượu sake"
  },
  {
    "lesson": 6,
    "word": "たばこ",
    "reading": "たばこ",
    "meaning": "thuốc lá"
  },
  {
    "lesson": 6,
    "word": "手紙",
    "reading": "てがみ",
    "meaning": "thư"
  },
  {
    "lesson": 6,
    "word": "レポート",
    "reading": "レポート",
    "meaning": "báo cáo"
  },
  {
    "lesson": 6,
    "word": "写真",
    "reading": "しゃしん",
    "meaning": "ảnh"
  },
  {
    "lesson": 6,
    "word": "ビデオ",
    "reading": "ビデオ",
    "meaning": "video, băng video, đầu video"
  },
  {
    "lesson": 6,
    "word": "店",
    "reading": "みせ",
    "meaning": "cửa hàng, tiệm"
  },
  {
    "lesson": 6,
    "word": "庭",
    "reading": "にわ",
    "meaning": "vườn"
  },
  {
    "lesson": 6,
    "word": "宿題",
    "reading": "しゅくだい",
    "meaning": "bài tập về nhà (～をします: làm bài tập)"
  },
  {
    "lesson": 6,
    "word": "テニス",
    "reading": "テニス",
    "meaning": "quần vợt (～をします: đánh quần vợt)"
  },
  {
    "lesson": 6,
    "word": "サッカー",
    "reading": "サッカー",
    "meaning": "bóng đá (～をします: chơi bóng đá)"
  },
  {
    "lesson": 6,
    "word": "花見",
    "reading": "はなみ",
    "meaning": "việc ngắm hoa anh đào (～をします: ngắm hoa anh đào)"
  },
  {
    "lesson": 6,
    "word": "何",
    "reading": "なに",
    "meaning": "cái gì, gì"
  },
  {
    "lesson": 6,
    "word": "いっしょに",
    "reading": "いっしょに",
    "meaning": "cùng, cùng nhau"
  },
  {
    "lesson": 6,
    "word": "ちょっと",
    "reading": "ちょっと",
    "meaning": "một chút"
  },
  {
    "lesson": 6,
    "word": "いつも",
    "reading": "いつも",
    "meaning": "luôn luôn, lúc nào cũng"
  },
  {
    "lesson": 6,
    "word": "時々",
    "reading": "ときどき",
    "meaning": "thỉnh thoảng"
  },
  {
    "lesson": 6,
    "word": "それから",
    "reading": "それから",
    "meaning": "sau đó, tiếp theo"
  },
  {
    "lesson": 6,
    "word": "ええ",
    "reading": "ええ",
    "meaning": "vâng, được (cách nói thân mật của 「はい」)"
  },
  {
    "lesson": 6,
    "word": "いいですね",
    "reading": "いいですね",
    "meaning": "Được đấy nhỉ./ hay quá"
  },
  {
    "lesson": 6,
    "word": "わかりました",
    "reading": "わかりました",
    "meaning": "Tôi hiểu rồi/ vâng ạ"
  },
  {
    "lesson": 6,
    "word": "何ですか",
    "reading": "何ですか",
    "meaning": "Có gì đấy ạ?/ cái gì vậy?"
  },
  {
    "lesson": 6,
    "word": "じゃ、また",
    "reading": "じゃ、また",
    "meaning": "Hẹn gặp lại [ngày mai]"
  },
  {
    "lesson": 6,
    "word": "メキシコ",
    "reading": "メキシコ",
    "meaning": "Mexico"
  },
  {
    "lesson": 6,
    "word": "大阪デパート",
    "reading": "大阪デパート",
    "meaning": "bách hóa Osaka (giả định)"
  },
  {
    "lesson": 6,
    "word": "つるや",
    "reading": "つるや",
    "meaning": "tên nhà hàng (giả định)"
  },
  {
    "lesson": 6,
    "word": "フランス屋",
    "reading": "フランス屋",
    "meaning": "tên siêu thị (giả định)"
  },
  {
    "lesson": 6,
    "word": "毎日屋",
    "reading": "毎日屋",
    "meaning": "tên siêu thị (giả định)"
  },
  {
    "lesson": 7,
    "word": "切ります",
    "reading": "きります",
    "meaning": "cắt"
  },
  {
    "lesson": 7,
    "word": "送ります",
    "reading": "おくります",
    "meaning": "gửi"
  },
  {
    "lesson": 7,
    "word": "あげます",
    "reading": "あげます",
    "meaning": "cho, tặng"
  },
  {
    "lesson": 7,
    "word": "もらいます",
    "reading": "もらいます",
    "meaning": "nhận"
  },
  {
    "lesson": 7,
    "word": "貸します",
    "reading": "かします",
    "meaning": "cho mượn, cho vay"
  },
  {
    "lesson": 7,
    "word": "借ります",
    "reading": "かります",
    "meaning": "mượn, vay"
  },
  {
    "lesson": 7,
    "word": "教えます",
    "reading": "おしえます",
    "meaning": "dạy"
  },
  {
    "lesson": 7,
    "word": "習います",
    "reading": "ならいます",
    "meaning": "học, tập"
  },
  {
    "lesson": 7,
    "word": "かけます",
    "reading": "かけます",
    "meaning": "gọi [điện thoại]"
  },
  {
    "lesson": 7,
    "word": "手",
    "reading": "て",
    "meaning": "tay"
  },
  {
    "lesson": 7,
    "word": "はし",
    "reading": "はし",
    "meaning": "đũa"
  },
  {
    "lesson": 7,
    "word": "スプーン",
    "reading": "スプーン",
    "meaning": "thìa"
  },
  {
    "lesson": 7,
    "word": "ナイフ",
    "reading": "ナイフ",
    "meaning": "dao"
  },
  {
    "lesson": 7,
    "word": "フォーク",
    "reading": "フォーク",
    "meaning": "nĩa"
  },
  {
    "lesson": 7,
    "word": "はさみ",
    "reading": "はさみ",
    "meaning": "kéo"
  },
  {
    "lesson": 7,
    "word": "パソコン",
    "reading": "パソコン",
    "meaning": "máy vi tính cá nhân"
  },
  {
    "lesson": 7,
    "word": "ケータイ",
    "reading": "ケータイ",
    "meaning": "điện thoại di động"
  },
  {
    "lesson": 7,
    "word": "メール",
    "reading": "メール",
    "meaning": "thư điện tử, email"
  },
  {
    "lesson": 7,
    "word": "年賀状",
    "reading": "ねんがじょう",
    "meaning": "thiệp mừng năm mới"
  },
  {
    "lesson": 7,
    "word": "パンチ",
    "reading": "パンチ",
    "meaning": "cái đục lỗ"
  },
  {
    "lesson": 7,
    "word": "ホッチキス",
    "reading": "ホッチキス",
    "meaning": "cái dập ghim"
  },
  {
    "lesson": 7,
    "word": "セロテープ",
    "reading": "セロテープ",
    "meaning": "băng dính"
  },
  {
    "lesson": 7,
    "word": "けしゴム",
    "reading": "けしゴム",
    "meaning": "cái tẩy"
  },
  {
    "lesson": 7,
    "word": "紙",
    "reading": "かみ",
    "meaning": "giấy"
  },
  {
    "lesson": 7,
    "word": "花",
    "reading": "はな",
    "meaning": "hoa"
  },
  {
    "lesson": 7,
    "word": "シャツ",
    "reading": "シャツ",
    "meaning": "áo sơ mi"
  },
  {
    "lesson": 7,
    "word": "プレゼント",
    "reading": "プレゼント",
    "meaning": "quà tặng, tặng phẩm"
  },
  {
    "lesson": 7,
    "word": "荷物",
    "reading": "にもつ",
    "meaning": "đồ đạc, hành lý"
  },
  {
    "lesson": 7,
    "word": "お金",
    "reading": "おかね",
    "meaning": "tiền"
  },
  {
    "lesson": 7,
    "word": "切符",
    "reading": "きっぷ",
    "meaning": "vé"
  },
  {
    "lesson": 7,
    "word": "クリスマス",
    "reading": "クリスマス",
    "meaning": "Giáng sinh"
  },
  {
    "lesson": 7,
    "word": "父",
    "reading": "ちち",
    "meaning": "bố (dùng khi nói về bố mình)"
  },
  {
    "lesson": 7,
    "word": "母",
    "reading": "はは",
    "meaning": "mẹ (dùng khi nói về mẹ mình)"
  },
  {
    "lesson": 7,
    "word": "お父さん",
    "reading": "おとうさん",
    "meaning": "bố (dùng khi nói về bố người khác và dùng khi xưng hô với bố mình)"
  },
  {
    "lesson": 7,
    "word": "お母さん",
    "reading": "おかあさん",
    "meaning": "mẹ (dùng khi nói về mẹ người khác và dùng khi xưng hô với mẹ mình)"
  },
  {
    "lesson": 7,
    "word": "もう",
    "reading": "もう",
    "meaning": "đã, rồi"
  },
  {
    "lesson": 7,
    "word": "まだ",
    "reading": "まだ",
    "meaning": "chưa"
  },
  {
    "lesson": 7,
    "word": "これから",
    "reading": "これから",
    "meaning": "từ bây giờ, sau đây"
  },
  {
    "lesson": 7,
    "word": "すてきですね",
    "reading": "すてきですね",
    "meaning": "[~] hay nhỉ./ đẹp nhỉ"
  },
  {
    "lesson": 7,
    "word": "いらっしゃい",
    "reading": "いらっしゃい",
    "meaning": "Chào mừng anh/chị đã đến chơi"
  },
  {
    "lesson": 7,
    "word": "どうぞおあがりください",
    "reading": "どうぞおあがりください",
    "meaning": "Mời anh/chị vào"
  },
  {
    "lesson": 7,
    "word": "しつれいします",
    "reading": "しつれいします",
    "meaning": "Xin thất lễ"
  },
  {
    "lesson": 7,
    "word": "いかがですか",
    "reading": "いかがですか",
    "meaning": "Anh/chị dùng [~] có được không?"
  },
  {
    "lesson": 7,
    "word": "いただきます",
    "reading": "いただきます",
    "meaning": "Xin nhận ~. (cách nói dùng trước khi ăn hoặc uống)"
  },
  {
    "lesson": 7,
    "word": "ごちそうさま",
    "reading": "ごちそうさま",
    "meaning": "Xin cám ơn anh/chị đã đãi tôi bữa ăn ngon (cách nói dùng sau khi ăn xong)"
  },
  {
    "lesson": 7,
    "word": "スペイン",
    "reading": "スペイン",
    "meaning": "Tây Ban Nha"
  },
  {
    "lesson": 8,
    "word": "ハンサム",
    "reading": "ハンサム",
    "meaning": "đẹp trai"
  },
  {
    "lesson": 8,
    "word": "きれい",
    "reading": "きれい",
    "meaning": "đẹp, sạch"
  },
  {
    "lesson": 8,
    "word": "静か",
    "reading": "しずか",
    "meaning": "yên tĩnh"
  },
  {
    "lesson": 8,
    "word": "にぎやか",
    "reading": "にぎやか",
    "meaning": "náo nhiệt"
  },
  {
    "lesson": 8,
    "word": "有名",
    "reading": "ゆうめい",
    "meaning": "nổi tiếng"
  },
  {
    "lesson": 8,
    "word": "親切",
    "reading": "しんせつ",
    "meaning": "tốt bụng, thân thiện"
  },
  {
    "lesson": 8,
    "word": "元気",
    "reading": "げんき",
    "meaning": "khỏe"
  },
  {
    "lesson": 8,
    "word": "暇",
    "reading": "ひま",
    "meaning": "rảnh rỗi"
  },
  {
    "lesson": 8,
    "word": "便利",
    "reading": "べんり",
    "meaning": "tiện lợi"
  },
  {
    "lesson": 8,
    "word": "すてき",
    "reading": "すてき",
    "meaning": "đẹp, hay"
  },
  {
    "lesson": 8,
    "word": "大きい",
    "reading": "おおきい",
    "meaning": "lớn, to"
  },
  {
    "lesson": 8,
    "word": "小さい",
    "reading": "ちいさい",
    "meaning": "bé, nhỏ"
  },
  {
    "lesson": 8,
    "word": "新しい",
    "reading": "あたらしい",
    "meaning": "mới"
  },
  {
    "lesson": 8,
    "word": "古い",
    "reading": "ふるい",
    "meaning": "cũ"
  },
  {
    "lesson": 8,
    "word": "いい",
    "reading": "いい",
    "meaning": "tốt"
  },
  {
    "lesson": 8,
    "word": "悪い",
    "reading": "わるい",
    "meaning": "xấu"
  },
  {
    "lesson": 8,
    "word": "暑い熱い",
    "reading": "あつい",
    "meaning": "nóng"
  },
  {
    "lesson": 8,
    "word": "寒い",
    "reading": "さむい",
    "meaning": "lạnh, rét (dùng cho thời tiết)"
  },
  {
    "lesson": 8,
    "word": "冷たい",
    "reading": "つめたい",
    "meaning": "lạnh, buốt (dùng cho cảm giác)"
  },
  {
    "lesson": 8,
    "word": "難しい",
    "reading": "むずかしい",
    "meaning": "khó"
  },
  {
    "lesson": 8,
    "word": "易しい",
    "reading": "やさしい",
    "meaning": "dễ"
  },
  {
    "lesson": 8,
    "word": "高い",
    "reading": "たかい",
    "meaning": "đắt, cao"
  },
  {
    "lesson": 8,
    "word": "安い",
    "reading": "やすい",
    "meaning": "rẻ"
  },
  {
    "lesson": 8,
    "word": "低い",
    "reading": "ひくい",
    "meaning": "thấp"
  },
  {
    "lesson": 8,
    "word": "おもしろい",
    "reading": "おもしろい",
    "meaning": "thú vị, hay"
  },
  {
    "lesson": 8,
    "word": "おいしい",
    "reading": "おいしい",
    "meaning": "ngon"
  },
  {
    "lesson": 8,
    "word": "忙しい",
    "reading": "いそがしい",
    "meaning": "bận"
  },
  {
    "lesson": 8,
    "word": "楽しい",
    "reading": "たのしい",
    "meaning": "vui"
  },
  {
    "lesson": 8,
    "word": "白い",
    "reading": "しろい",
    "meaning": "trắng"
  },
  {
    "lesson": 8,
    "word": "黒い",
    "reading": "くろい",
    "meaning": "đen"
  },
  {
    "lesson": 8,
    "word": "赤い",
    "reading": "あかい",
    "meaning": "đỏ"
  },
  {
    "lesson": 8,
    "word": "青い",
    "reading": "あおい",
    "meaning": "xanh da trời"
  },
  {
    "lesson": 8,
    "word": "桜",
    "reading": "さくら",
    "meaning": "anh đào (hoa, cây)"
  },
  {
    "lesson": 8,
    "word": "山",
    "reading": "やま",
    "meaning": "núi"
  },
  {
    "lesson": 8,
    "word": "町",
    "reading": "まち",
    "meaning": "thị trấn, thị xã, thành phố"
  },
  {
    "lesson": 8,
    "word": "食べ物",
    "reading": "たべもの",
    "meaning": "đồ ăn"
  },
  {
    "lesson": 8,
    "word": "所",
    "reading": "ところ",
    "meaning": "nơi, chỗ"
  },
  {
    "lesson": 8,
    "word": "寮",
    "reading": "りょう",
    "meaning": "kí túc xá"
  },
  {
    "lesson": 8,
    "word": "レストラン",
    "reading": "レストラン",
    "meaning": "nhà hàng"
  },
  {
    "lesson": 8,
    "word": "生活",
    "reading": "せいかつ",
    "meaning": "cuộc sống, sinh hoạt"
  },
  {
    "lesson": 8,
    "word": "仕事",
    "reading": "しごと",
    "meaning": "công việc (～をします：làm việc)"
  },
  {
    "lesson": 8,
    "word": "どう",
    "reading": "どう",
    "meaning": "thế nào"
  },
  {
    "lesson": 8,
    "word": "どんな～",
    "reading": "どんな～",
    "meaning": "~ như thế nào"
  },
  {
    "lesson": 8,
    "word": "とても",
    "reading": "とても",
    "meaning": "rất, lắm"
  },
  {
    "lesson": 8,
    "word": "あまり",
    "reading": "あまり",
    "meaning": "không ~ lắm"
  },
  {
    "lesson": 8,
    "word": "そして",
    "reading": "そして",
    "meaning": "và, thêm nữa (dùng để nối 2 câu)"
  },
  {
    "lesson": 8,
    "word": "～が、～",
    "reading": "～が、～",
    "meaning": "~, nhưng ~"
  },
  {
    "lesson": 8,
    "word": "お元気ですか",
    "reading": "お元気ですか",
    "meaning": "Anh/chị có khỏe không?"
  },
  {
    "lesson": 8,
    "word": "そうですね",
    "reading": "そうですね",
    "meaning": "Thế à. Như vậy nhỉ"
  },
  {
    "lesson": 8,
    "word": "もう一杯いかがですか",
    "reading": "もう一杯いかがですか",
    "meaning": "Anh/ chị dùng thêm một chén/ly [~] nữa được không ạ?"
  },
  {
    "lesson": 8,
    "word": "いいえ、けっこうです",
    "reading": "いいえ、けっこうです",
    "meaning": "Không, đủ rồi ạ"
  },
  {
    "lesson": 8,
    "word": "もう～です",
    "reading": "もう～です",
    "meaning": "Đã ~ rồi nhỉ./ Đã ~ rồi, đúng không ạ?"
  },
  {
    "lesson": 8,
    "word": "そろそろ失礼します",
    "reading": "そろそろ失礼します",
    "meaning": "Sắp đến lúc tôi phải xin phép rồi. Đã đến lúc tôi phải về"
  },
  {
    "lesson": 8,
    "word": "いいえ",
    "reading": "いいえ",
    "meaning": "Không có gì./ Không sao cả"
  },
  {
    "lesson": 8,
    "word": "またいらっしゃってください",
    "reading": "またいらっしゃってください",
    "meaning": "Lần sau anh/ chị lại đến chơi nhé"
  },
  {
    "lesson": 8,
    "word": "上海",
    "reading": "上海",
    "meaning": "Thượng Hải"
  },
  {
    "lesson": 8,
    "word": "金閣寺",
    "reading": "金閣寺",
    "meaning": "Chùa Kinkaku-ji (chùa vàng)"
  },
  {
    "lesson": 8,
    "word": "奈良公園",
    "reading": "奈良公園",
    "meaning": "Công viên Nara"
  },
  {
    "lesson": 8,
    "word": "富士山",
    "reading": "富士山",
    "meaning": "Núi Phú Sĩ (ngọn núi cao nhất Nhật Bản)"
  },
  {
    "lesson": 8,
    "word": "七人の侍",
    "reading": "七人の侍",
    "meaning": "bảy chàng võ sĩ Samurai (tên phim)"
  },
  {
    "lesson": 9,
    "word": "わかります",
    "reading": "わかります",
    "meaning": "hiểu, nắm được"
  },
  {
    "lesson": 9,
    "word": "あります",
    "reading": "あります",
    "meaning": "có (sở hữu)"
  },
  {
    "lesson": 9,
    "word": "好き",
    "reading": "すき",
    "meaning": "thích"
  },
  {
    "lesson": 9,
    "word": "嫌い",
    "reading": "きらい",
    "meaning": "ghét, không thích"
  },
  {
    "lesson": 9,
    "word": "上手",
    "reading": "じょうず",
    "meaning": "giỏi, khéo"
  },
  {
    "lesson": 9,
    "word": "下手",
    "reading": "へた",
    "meaning": "kém"
  },
  {
    "lesson": 9,
    "word": "飲み物",
    "reading": "のみもの",
    "meaning": "đồ uống"
  },
  {
    "lesson": 9,
    "word": "料理",
    "reading": "りょうり",
    "meaning": "món ăn, việc nấu ăn"
  },
  {
    "lesson": 9,
    "word": "スポーツ",
    "reading": "スポーツ",
    "meaning": "thể thao (～をします：chơi thể thao)"
  },
  {
    "lesson": 9,
    "word": "野球",
    "reading": "やきゅう",
    "meaning": "bóng chày (～をします：chơi bóng chày)"
  },
  {
    "lesson": 9,
    "word": "ダンス",
    "reading": "ダンス",
    "meaning": "nhảy, khiêu vũ(～をします：nhảy, khiêu vũ)"
  },
  {
    "lesson": 9,
    "word": "旅行",
    "reading": "りょこう",
    "meaning": "du lịch, chuyến du lịch"
  },
  {
    "lesson": 9,
    "word": "音楽",
    "reading": "おんがく",
    "meaning": "âm nhạc"
  },
  {
    "lesson": 9,
    "word": "歌",
    "reading": "うた",
    "meaning": "bài hát"
  },
  {
    "lesson": 9,
    "word": "クラシック",
    "reading": "クラシック",
    "meaning": "nhạc cổ điển"
  },
  {
    "lesson": 9,
    "word": "ジャズ",
    "reading": "ジャズ",
    "meaning": "nhạc jazz"
  },
  {
    "lesson": 9,
    "word": "コンサート",
    "reading": "コンサート",
    "meaning": "buổi hòa nhạc"
  },
  {
    "lesson": 9,
    "word": "カラオケ",
    "reading": "カラオケ",
    "meaning": "karaoke"
  },
  {
    "lesson": 9,
    "word": "歌舞伎",
    "reading": "かぶき",
    "meaning": "Kabuki (một loại ca kịch truyền thống của Nhật)"
  },
  {
    "lesson": 9,
    "word": "絵",
    "reading": "え",
    "meaning": "tranh, hội họa"
  },
  {
    "lesson": 9,
    "word": "字",
    "reading": "じ",
    "meaning": "chữ"
  },
  {
    "lesson": 9,
    "word": "漢字",
    "reading": "かんじ",
    "meaning": "chữ hán"
  },
  {
    "lesson": 9,
    "word": "ひらがな",
    "reading": "ひらがな",
    "meaning": "chữ Hiragana"
  },
  {
    "lesson": 9,
    "word": "かたかな",
    "reading": "かたかな",
    "meaning": "Chữ Katakana"
  },
  {
    "lesson": 9,
    "word": "ローマ字",
    "reading": "ローマじ",
    "meaning": "chữ La Mã"
  },
  {
    "lesson": 9,
    "word": "細かいお金",
    "reading": "こまかいおかね",
    "meaning": "tiền lẻ"
  },
  {
    "lesson": 9,
    "word": "チケット",
    "reading": "チケット",
    "meaning": "vé (xem hòa nhạc, xem phim)"
  },
  {
    "lesson": 9,
    "word": "時間",
    "reading": "じかん",
    "meaning": "thời gian"
  },
  {
    "lesson": 9,
    "word": "用事",
    "reading": "ようじ",
    "meaning": "việc bận, công chuyện"
  },
  {
    "lesson": 9,
    "word": "約束",
    "reading": "やくそく",
    "meaning": "cuộc hẹn, lời hứa"
  },
  {
    "lesson": 9,
    "word": "アルバイト",
    "reading": "アルバイト",
    "meaning": "việc làm thêm"
  },
  {
    "lesson": 9,
    "word": "ご主人",
    "reading": "ごしゅじん",
    "meaning": "chồng (dùng khi nói về chồng người khác)"
  },
  {
    "lesson": 9,
    "word": "夫/主人",
    "reading": "おっと/しゅじん",
    "meaning": "chồng (dùng khi nói về chồng mình)"
  },
  {
    "lesson": 9,
    "word": "奥さん",
    "reading": "おくさん",
    "meaning": "vợ (dùng khi nói về vợ người khác)"
  },
  {
    "lesson": 9,
    "word": "妻/家内",
    "reading": "つま/かない",
    "meaning": "vợ (dùng khi nói về vợ mình)"
  },
  {
    "lesson": 9,
    "word": "子ども",
    "reading": "こども",
    "meaning": "con cái"
  },
  {
    "lesson": 9,
    "word": "よく",
    "reading": "よく",
    "meaning": "tốt, rõ (chỉ mức độ)"
  },
  {
    "lesson": 9,
    "word": "だいたい",
    "reading": "だいたい",
    "meaning": "đại khái, đại thể"
  },
  {
    "lesson": 9,
    "word": "たくさん",
    "reading": "たくさん",
    "meaning": "nhiều"
  },
  {
    "lesson": 9,
    "word": "少し",
    "reading": "すこし",
    "meaning": "ít, một ít"
  },
  {
    "lesson": 9,
    "word": "全然",
    "reading": "ぜんぜん",
    "meaning": "hoàn toàn ~ không"
  },
  {
    "lesson": 9,
    "word": "早く速く",
    "reading": "はやく",
    "meaning": "sớm, nhanh"
  },
  {
    "lesson": 9,
    "word": "～から",
    "reading": "～から",
    "meaning": "vì ~"
  },
  {
    "lesson": 9,
    "word": "どうして",
    "reading": "どうして",
    "meaning": "tại sao"
  },
  {
    "lesson": 9,
    "word": "貸してください",
    "reading": "貸してください",
    "meaning": "Hãy cho tôi mượn"
  },
  {
    "lesson": 9,
    "word": "いいですよ",
    "reading": "いいですよ",
    "meaning": "Được chứ./ Được ạ"
  },
  {
    "lesson": 9,
    "word": "残念ですね",
    "reading": "残念ですね",
    "meaning": "Thật đáng tiếc nhỉ./ buồn nhỉ"
  },
  {
    "lesson": 9,
    "word": "ああ",
    "reading": "ああ",
    "meaning": "Ah (cách nói khi đã gặp được đúng người trên điện thoại)"
  },
  {
    "lesson": 9,
    "word": "いっしょにいかがですか",
    "reading": "いっしょにいかがですか",
    "meaning": "Anh/chị cùng ~ (làm cái gì đó) với chúng tôi được không?"
  },
  {
    "lesson": 9,
    "word": "ちょっと…",
    "reading": "ちょっと…",
    "meaning": "[~ thì] có lẽ không được rồi"
  },
  {
    "lesson": 9,
    "word": "だめですか",
    "reading": "だめですか",
    "meaning": "Không được à?"
  },
  {
    "lesson": 9,
    "word": "また今度お願いします",
    "reading": "また今度お願いします",
    "meaning": "Hẹn Anh/Chị lần sau vậy"
  },
  {
    "lesson": 10,
    "word": "あります",
    "reading": "あります",
    "meaning": "có (tồn tại, dùng cho đồ vật)"
  },
  {
    "lesson": 10,
    "word": "います",
    "reading": "います",
    "meaning": "có, ở (tồn tại, dùng cho người và động vật)"
  },
  {
    "lesson": 10,
    "word": "いろいろ",
    "reading": "いろいろ",
    "meaning": "nhiều, đa dạng"
  },
  {
    "lesson": 10,
    "word": "男の人",
    "reading": "おとこのひと",
    "meaning": "người đàn ông"
  },
  {
    "lesson": 10,
    "word": "女の人",
    "reading": "おんなのひと",
    "meaning": "người đàn bà"
  },
  {
    "lesson": 10,
    "word": "男の子",
    "reading": "おとこのこ",
    "meaning": "cậu con trai"
  },
  {
    "lesson": 10,
    "word": "女の子",
    "reading": "おんなのこ",
    "meaning": "cô con gái"
  },
  {
    "lesson": 10,
    "word": "犬",
    "reading": "いぬ",
    "meaning": "chó"
  },
  {
    "lesson": 10,
    "word": "猫",
    "reading": "ねこ",
    "meaning": "mèo"
  },
  {
    "lesson": 10,
    "word": "パンダ",
    "reading": "パンダ",
    "meaning": "gấu trúc"
  },
  {
    "lesson": 10,
    "word": "象",
    "reading": "ぞう",
    "meaning": "voi"
  },
  {
    "lesson": 10,
    "word": "木",
    "reading": "き",
    "meaning": "cây, gỗ"
  },
  {
    "lesson": 10,
    "word": "物",
    "reading": "もの",
    "meaning": "vật, đồ vật"
  },
  {
    "lesson": 10,
    "word": "電池",
    "reading": "でんち",
    "meaning": "Pin"
  },
  {
    "lesson": 10,
    "word": "箱",
    "reading": "はこ",
    "meaning": "hộp"
  },
  {
    "lesson": 10,
    "word": "スイッチ",
    "reading": "スイッチ",
    "meaning": "công tắc"
  },
  {
    "lesson": 10,
    "word": "冷蔵庫",
    "reading": "れいぞうこ",
    "meaning": "tủ lạnh"
  },
  {
    "lesson": 10,
    "word": "テーブル",
    "reading": "テーブル",
    "meaning": "bàn"
  },
  {
    "lesson": 10,
    "word": "ベッド",
    "reading": "ベッド",
    "meaning": "giường"
  },
  {
    "lesson": 10,
    "word": "棚",
    "reading": "たな",
    "meaning": "giá sách"
  },
  {
    "lesson": 10,
    "word": "ドア",
    "reading": "ドア",
    "meaning": "cửa"
  },
  {
    "lesson": 10,
    "word": "窓",
    "reading": "まど",
    "meaning": "cửa sổ"
  },
  {
    "lesson": 10,
    "word": "ポスト",
    "reading": "ポスト",
    "meaning": "hộp thư, hòm thư"
  },
  {
    "lesson": 10,
    "word": "ビル",
    "reading": "ビル",
    "meaning": "toà nhà"
  },
  {
    "lesson": 10,
    "word": "ATM",
    "reading": "ATM",
    "meaning": "máy rút tiền tự động ATM"
  },
  {
    "lesson": 10,
    "word": "コンビニ",
    "reading": "コンビニ",
    "meaning": "cửa hàng tiện lợi (mở 24/24)"
  },
  {
    "lesson": 10,
    "word": "公園",
    "reading": "こうえん",
    "meaning": "công viên"
  },
  {
    "lesson": 10,
    "word": "喫茶店",
    "reading": "きっさてん",
    "meaning": "quán giải khát, quán cà-phê"
  },
  {
    "lesson": 10,
    "word": "～屋",
    "reading": "～や",
    "meaning": "hiệu ~, cửa hàng ~"
  },
  {
    "lesson": 10,
    "word": "乗り場",
    "reading": "のりば",
    "meaning": "bến xe, điểm lên xuống xe"
  },
  {
    "lesson": 10,
    "word": "県",
    "reading": "けん",
    "meaning": "tỉnh"
  },
  {
    "lesson": 10,
    "word": "上",
    "reading": "うえ",
    "meaning": "trên"
  },
  {
    "lesson": 10,
    "word": "下",
    "reading": "した",
    "meaning": "dưới"
  },
  {
    "lesson": 10,
    "word": "前",
    "reading": "まえ",
    "meaning": "trước"
  },
  {
    "lesson": 10,
    "word": "うしろ",
    "reading": "うしろ",
    "meaning": "sau"
  },
  {
    "lesson": 10,
    "word": "右",
    "reading": "みぎ",
    "meaning": "phải"
  },
  {
    "lesson": 10,
    "word": "左",
    "reading": "ひだり",
    "meaning": "trái"
  },
  {
    "lesson": 10,
    "word": "中",
    "reading": "なか",
    "meaning": "trong, giữa"
  },
  {
    "lesson": 10,
    "word": "外",
    "reading": "そと",
    "meaning": "ngoài"
  },
  {
    "lesson": 10,
    "word": "隣",
    "reading": "となり",
    "meaning": "bên cạnh"
  },
  {
    "lesson": 10,
    "word": "近く",
    "reading": "ちかく",
    "meaning": "gần"
  },
  {
    "lesson": 10,
    "word": "間",
    "reading": "あいだ",
    "meaning": "giữa"
  },
  {
    "lesson": 10,
    "word": "～や～～",
    "reading": "～や～～",
    "meaning": "~và ~, [v.v.]"
  },
  {
    "lesson": 10,
    "word": "すみません",
    "reading": "すみません",
    "meaning": "Cám ơn"
  },
  {
    "lesson": 10,
    "word": "ナンプラー",
    "reading": "ナンプラー",
    "meaning": "nampla, nước mắn"
  },
  {
    "lesson": 10,
    "word": "コーナー",
    "reading": "コーナー",
    "meaning": "góc, khu vực"
  },
  {
    "lesson": 10,
    "word": "いちばん下",
    "reading": "いちばん下",
    "meaning": "ở dưới cùng"
  },
  {
    "lesson": 10,
    "word": "東京ディズニーランド",
    "reading": "東京ディズニーランド",
    "meaning": "Công viên Tokyo Disneyland"
  },
  {
    "lesson": 10,
    "word": "アジアストア",
    "reading": "アジアストア",
    "meaning": "tên một siêu thị (giả định)"
  },
  {
    "lesson": 11,
    "word": "います",
    "reading": "います",
    "meaning": "có [con]"
  },
  {
    "lesson": 11,
    "word": "います",
    "reading": "います",
    "meaning": "ở [Nhật]"
  },
  {
    "lesson": 11,
    "word": "かかります",
    "reading": "かかります",
    "meaning": "mất, tốn (thời gian, tiền bạc)"
  },
  {
    "lesson": 11,
    "word": "休みます",
    "reading": "やすみます",
    "meaning": "nghỉ [làm việc]"
  },
  {
    "lesson": 11,
    "word": "１つ",
    "reading": "ひとつ",
    "meaning": "một cái (dùng để đếm đồ vật)"
  },
  {
    "lesson": 11,
    "word": "２つ",
    "reading": "ふたつ",
    "meaning": "hai cái"
  },
  {
    "lesson": 11,
    "word": "３つ",
    "reading": "みっつ",
    "meaning": "ba cái"
  },
  {
    "lesson": 11,
    "word": "４つ",
    "reading": "よっつ",
    "meaning": "bốn cái"
  },
  {
    "lesson": 11,
    "word": "５つ",
    "reading": "いつつ",
    "meaning": "năm cái"
  },
  {
    "lesson": 11,
    "word": "６つ",
    "reading": "むっつ",
    "meaning": "sáu cái"
  },
  {
    "lesson": 11,
    "word": "７つ",
    "reading": "ななつ",
    "meaning": "bảy cái"
  },
  {
    "lesson": 11,
    "word": "８つ",
    "reading": "やっつ",
    "meaning": "tám cái"
  },
  {
    "lesson": 11,
    "word": "９つ",
    "reading": "ここのつ",
    "meaning": "chín cái"
  },
  {
    "lesson": 11,
    "word": "10",
    "reading": "とお",
    "meaning": "mười cái"
  },
  {
    "lesson": 11,
    "word": "いくつ",
    "reading": "いくつ",
    "meaning": "mấy cái, bao nhiêu cái"
  },
  {
    "lesson": 11,
    "word": "１人",
    "reading": "ひとり",
    "meaning": "một người"
  },
  {
    "lesson": 11,
    "word": "２人",
    "reading": "ふたり",
    "meaning": "hai người"
  },
  {
    "lesson": 11,
    "word": "－人",
    "reading": "―にん",
    "meaning": "- người"
  },
  {
    "lesson": 11,
    "word": "－台",
    "reading": "―だい",
    "meaning": "- cái (dùng để đếm máy móc, xe cộ v.v.)"
  },
  {
    "lesson": 11,
    "word": "－枚",
    "reading": "―まい",
    "meaning": "tờ, tấm (dùng để đếm những vật mỏng như giấy, con tem v.v.)"
  },
  {
    "lesson": 11,
    "word": "―回",
    "reading": "―かい",
    "meaning": "- lần"
  },
  {
    "lesson": 11,
    "word": "りんご",
    "reading": "りんご",
    "meaning": "táo"
  },
  {
    "lesson": 11,
    "word": "みかん",
    "reading": "みかん",
    "meaning": "quýt"
  },
  {
    "lesson": 11,
    "word": "サンドイッチ",
    "reading": "サンドイッチ",
    "meaning": "bánh San Uých"
  },
  {
    "lesson": 11,
    "word": "カレー",
    "reading": "カレー",
    "meaning": "món [cơm] ca-ri"
  },
  {
    "lesson": 11,
    "word": "アイスクリーム",
    "reading": "アイスクリーム",
    "meaning": "kem"
  },
  {
    "lesson": 11,
    "word": "切手",
    "reading": "きって",
    "meaning": "tem"
  },
  {
    "lesson": 11,
    "word": "はがき",
    "reading": "はがき",
    "meaning": "bưu thiếp"
  },
  {
    "lesson": 11,
    "word": "封筒",
    "reading": "ふうとう",
    "meaning": "phong bì"
  },
  {
    "lesson": 11,
    "word": "両親",
    "reading": "りょうしん",
    "meaning": "bố mẹ"
  },
  {
    "lesson": 11,
    "word": "兄弟",
    "reading": "きょうだい",
    "meaning": "anh chị em"
  },
  {
    "lesson": 11,
    "word": "兄",
    "reading": "あに",
    "meaning": "anh trai"
  },
  {
    "lesson": 11,
    "word": "お兄さん",
    "reading": "おにいさん",
    "meaning": "anh trai (dùng cho người khác)"
  },
  {
    "lesson": 11,
    "word": "姉",
    "reading": "あね",
    "meaning": "chị gái"
  },
  {
    "lesson": 11,
    "word": "お姉さん",
    "reading": "おねえさん",
    "meaning": "chị gái (dùng cho người khác)"
  },
  {
    "lesson": 11,
    "word": "弟",
    "reading": "おとうと",
    "meaning": "em trai"
  },
  {
    "lesson": 11,
    "word": "弟さん",
    "reading": "おとうとさん",
    "meaning": "em trai (dùng cho người khác)"
  },
  {
    "lesson": 11,
    "word": "妹",
    "reading": "いもうと",
    "meaning": "em gái"
  },
  {
    "lesson": 11,
    "word": "妹さん",
    "reading": "いもうとさん",
    "meaning": "em gái (dùng cho người khác)"
  },
  {
    "lesson": 11,
    "word": "外国",
    "reading": "がいこく",
    "meaning": "nước ngoài"
  },
  {
    "lesson": 11,
    "word": "留学生",
    "reading": "りゅうがくせい",
    "meaning": "lưu học sinh, sinh viên nước ngoài"
  },
  {
    "lesson": 11,
    "word": "クラス",
    "reading": "クラス",
    "meaning": "lớp học"
  },
  {
    "lesson": 11,
    "word": "―時間",
    "reading": "―じかん",
    "meaning": "- tiếng"
  },
  {
    "lesson": 11,
    "word": "―週間",
    "reading": "―しゅうかん",
    "meaning": "- tuần"
  },
  {
    "lesson": 11,
    "word": "－か月",
    "reading": "―かげつ",
    "meaning": "- tháng"
  },
  {
    "lesson": 11,
    "word": "―年",
    "reading": "―ねん",
    "meaning": "- năm"
  },
  {
    "lesson": 11,
    "word": "～ぐらい",
    "reading": "～ぐらい",
    "meaning": "khoảng ~"
  },
  {
    "lesson": 11,
    "word": "どのくらい",
    "reading": "どのくらい",
    "meaning": "bao lâu"
  },
  {
    "lesson": 11,
    "word": "全部で",
    "reading": "ぜんぶで",
    "meaning": "tổng cộng"
  },
  {
    "lesson": 11,
    "word": "みんな",
    "reading": "みんな",
    "meaning": "tất cả"
  },
  {
    "lesson": 11,
    "word": "～だけ",
    "reading": "～だけ",
    "meaning": "chỉ ~"
  },
  {
    "lesson": 11,
    "word": "かしこまりました",
    "reading": "かしこまりました",
    "meaning": "Tôi đã rõ rồi ạ (thưa ông/bà)"
  },
  {
    "lesson": 11,
    "word": "いい天気ですね",
    "reading": "いい天気ですね",
    "meaning": "Trời đẹp nhỉ"
  },
  {
    "lesson": 11,
    "word": "お出かけですか",
    "reading": "お出かけですか",
    "meaning": "Anh/ chị đi ra ngoài đấy à?"
  },
  {
    "lesson": 11,
    "word": "ちょっと～まで",
    "reading": "ちょっと～まで",
    "meaning": "Tôi đi ~ một chút"
  },
  {
    "lesson": 11,
    "word": "行っていらっしゃい",
    "reading": "行っていらっしゃい",
    "meaning": "Anh/chị đi nhé"
  },
  {
    "lesson": 11,
    "word": "行ってきます",
    "reading": "行ってきます",
    "meaning": "Tôi đi đây"
  },
  {
    "lesson": 11,
    "word": "船便",
    "reading": "船便",
    "meaning": "gửi bằng đường biển"
  },
  {
    "lesson": 11,
    "word": "航空便",
    "reading": "航空便",
    "meaning": "gửi bằng đường hàng không"
  },
  {
    "lesson": 11,
    "word": "お願いします",
    "reading": "お願いします",
    "meaning": "Nhờ anh/chị"
  },
  {
    "lesson": 11,
    "word": "オーストラリア",
    "reading": "オーストラリア",
    "meaning": "Úc"
  },
  {
    "lesson": 12,
    "word": "簡単な",
    "reading": "かんたんな",
    "meaning": "đơn giản, dễ"
  },
  {
    "lesson": 12,
    "word": "近い",
    "reading": "ちかい",
    "meaning": "gần"
  },
  {
    "lesson": 12,
    "word": "遠い",
    "reading": "とおい",
    "meaning": "xa"
  },
  {
    "lesson": 12,
    "word": "速い早い",
    "reading": "はやい",
    "meaning": "nhanh, sớm"
  },
  {
    "lesson": 12,
    "word": "遅い",
    "reading": "おそい",
    "meaning": "chậm, muộn"
  },
  {
    "lesson": 12,
    "word": "多い",
    "reading": "おおい",
    "meaning": "nhiều [người]"
  },
  {
    "lesson": 12,
    "word": "少ない",
    "reading": "すくない",
    "meaning": "ít [người]"
  },
  {
    "lesson": 12,
    "word": "温かい暖かい",
    "reading": "あたたかい",
    "meaning": "ấm"
  },
  {
    "lesson": 12,
    "word": "涼しい",
    "reading": "すずしい",
    "meaning": "mát"
  },
  {
    "lesson": 12,
    "word": "甘い",
    "reading": "あまい",
    "meaning": "ngọt"
  },
  {
    "lesson": 12,
    "word": "辛い",
    "reading": "からい",
    "meaning": "cay"
  },
  {
    "lesson": 12,
    "word": "重い",
    "reading": "おもい",
    "meaning": "nặng"
  },
  {
    "lesson": 12,
    "word": "軽い",
    "reading": "かるい",
    "meaning": "nhẹ"
  },
  {
    "lesson": 12,
    "word": "いい",
    "reading": "いい",
    "meaning": "thích, chọn, dùng [cafe]"
  },
  {
    "lesson": 12,
    "word": "季節",
    "reading": "きせつ",
    "meaning": "mùa"
  },
  {
    "lesson": 12,
    "word": "春",
    "reading": "はる",
    "meaning": "mùa xuân"
  },
  {
    "lesson": 12,
    "word": "夏",
    "reading": "なつ",
    "meaning": "mùa hè"
  },
  {
    "lesson": 12,
    "word": "秋",
    "reading": "あき",
    "meaning": "mùa thu"
  },
  {
    "lesson": 12,
    "word": "冬",
    "reading": "ふゆ",
    "meaning": "mùa đông"
  },
  {
    "lesson": 12,
    "word": "天気",
    "reading": "てんき",
    "meaning": "thời tiết"
  },
  {
    "lesson": 12,
    "word": "雨",
    "reading": "あめ",
    "meaning": "mưa"
  },
  {
    "lesson": 12,
    "word": "雪",
    "reading": "ゆき",
    "meaning": "tuyết"
  },
  {
    "lesson": 12,
    "word": "曇り",
    "reading": "くもり",
    "meaning": "có mây"
  },
  {
    "lesson": 12,
    "word": "ホテル",
    "reading": "ホテル",
    "meaning": "khách sạn"
  },
  {
    "lesson": 12,
    "word": "空港",
    "reading": "くうこう",
    "meaning": "sân bay"
  },
  {
    "lesson": 12,
    "word": "海",
    "reading": "うみ",
    "meaning": "biển, đại dương"
  },
  {
    "lesson": 12,
    "word": "世界",
    "reading": "せかい",
    "meaning": "thế giới"
  },
  {
    "lesson": 12,
    "word": "パーティー",
    "reading": "パーティー",
    "meaning": "tiệc (~をします：tổ chức tiệc)"
  },
  {
    "lesson": 12,
    "word": "祭り",
    "reading": "まつり",
    "meaning": "lễ hội"
  },
  {
    "lesson": 12,
    "word": "すき焼き",
    "reading": "すきやき",
    "meaning": "Sukiyaki (món thịt bò nấu rau)"
  },
  {
    "lesson": 12,
    "word": "刺身",
    "reading": "さしみ",
    "meaning": "Sashimi (món gỏi cá sống)"
  },
  {
    "lesson": 12,
    "word": "すし",
    "reading": "すし",
    "meaning": "Sushi"
  },
  {
    "lesson": 12,
    "word": "てんぷら",
    "reading": "てんぷら",
    "meaning": "Tempura (món hải sản và rau chiên tẩm bột)"
  },
  {
    "lesson": 12,
    "word": "豚肉",
    "reading": "ぶたにく",
    "meaning": "thịt heo, thịt lợn"
  },
  {
    "lesson": 12,
    "word": "とり肉",
    "reading": "とりにく",
    "meaning": "thịt gà"
  },
  {
    "lesson": 12,
    "word": "牛肉",
    "reading": "ぎゅうにく",
    "meaning": "thịt bò"
  },
  {
    "lesson": 12,
    "word": "レモン",
    "reading": "レモン",
    "meaning": "chanh tây"
  },
  {
    "lesson": 12,
    "word": "生け花",
    "reading": "いけばな",
    "meaning": "Nghệ thuật cắm hoa (～をします：cắm hoa)"
  },
  {
    "lesson": 12,
    "word": "紅葉",
    "reading": "もみじ",
    "meaning": "lá đỏ"
  },
  {
    "lesson": 12,
    "word": "どちら",
    "reading": "どちら",
    "meaning": "cái nào"
  },
  {
    "lesson": 12,
    "word": "どちらも",
    "reading": "どちらも",
    "meaning": "cả hai"
  },
  {
    "lesson": 12,
    "word": "いちばん",
    "reading": "いちばん",
    "meaning": "nhất"
  },
  {
    "lesson": 12,
    "word": "ずっと",
    "reading": "ずっと",
    "meaning": "(hơn) hẳn, suốt"
  },
  {
    "lesson": 12,
    "word": "初めて",
    "reading": "はじめて",
    "meaning": "lần đầu tiên"
  },
  {
    "lesson": 12,
    "word": "ただいま",
    "reading": "ただいま",
    "meaning": "Tôi đã về đây. (dùng nói khi về đến nhà)"
  },
  {
    "lesson": 12,
    "word": "お帰りなさい",
    "reading": "お帰りなさい",
    "meaning": "Anh/Chị đã về đấy à. (dùng để nói với ai đó mới về đến nhà)"
  },
  {
    "lesson": 12,
    "word": "わあ、すごい人ですね",
    "reading": "わあ、すごい人ですね",
    "meaning": "Ôi, (người) đông quá nhỉ!"
  },
  {
    "lesson": 12,
    "word": "疲れました",
    "reading": "疲れました",
    "meaning": "Tôi mệt rồi"
  },
  {
    "lesson": 12,
    "word": "祗園祭",
    "reading": "祗園祭",
    "meaning": "Lễ hội Gi-ôn (lễ hội nổi tiếng nhất ở Kyoto)"
  },
  {
    "lesson": 12,
    "word": "ホンコン",
    "reading": "ホンコン",
    "meaning": "Hồng Kông"
  },
  {
    "lesson": 12,
    "word": "シンガポール",
    "reading": "シンガポール",
    "meaning": "Singapore"
  },
  {
    "lesson": 12,
    "word": "ＡＣＢストア",
    "reading": "ＡＣＢストア",
    "meaning": "tên một siêu thị (giả định)"
  },
  {
    "lesson": 12,
    "word": "ジャパン",
    "reading": "ジャパン",
    "meaning": "tên một siêu thị (giả định)"
  },
  {
    "lesson": 13,
    "word": "遊びます",
    "reading": "あそびます",
    "meaning": "chơi"
  },
  {
    "lesson": 13,
    "word": "泳ぎます",
    "reading": "およぎます",
    "meaning": "bơi"
  },
  {
    "lesson": 13,
    "word": "迎えます",
    "reading": "むかえます",
    "meaning": "đón"
  },
  {
    "lesson": 13,
    "word": "疲れます",
    "reading": "つかれます",
    "meaning": "mệt"
  },
  {
    "lesson": 13,
    "word": "結婚します",
    "reading": "けっこんします",
    "meaning": "kết hôn, lập gia đình, cưới"
  },
  {
    "lesson": 13,
    "word": "買い物します",
    "reading": "かいものします",
    "meaning": "mua hàng"
  },
  {
    "lesson": 13,
    "word": "食事します",
    "reading": "しょくじします",
    "meaning": "ăn cơm"
  },
  {
    "lesson": 13,
    "word": "散歩します",
    "reading": "さんぽします",
    "meaning": "đi dạo [ở công viên]"
  },
  {
    "lesson": 13,
    "word": "大変な",
    "reading": "たいへんな",
    "meaning": "vất vả, khó khăn, khổ"
  },
  {
    "lesson": 13,
    "word": "欲しい",
    "reading": "ほしい",
    "meaning": "muốn có"
  },
  {
    "lesson": 13,
    "word": "広い",
    "reading": "ひろい",
    "meaning": "rộng"
  },
  {
    "lesson": 13,
    "word": "狭い",
    "reading": "せまい",
    "meaning": "chật, hẹp"
  },
  {
    "lesson": 13,
    "word": "プール",
    "reading": "プール",
    "meaning": "bể bơi"
  },
  {
    "lesson": 13,
    "word": "川",
    "reading": "かわ",
    "meaning": "sông"
  },
  {
    "lesson": 13,
    "word": "美術",
    "reading": "びじゅつ",
    "meaning": "mỹ thuật"
  },
  {
    "lesson": 13,
    "word": "釣り",
    "reading": "つり",
    "meaning": "việc câu cá (~をします：câu cá)"
  },
  {
    "lesson": 13,
    "word": "スキー",
    "reading": "スキー",
    "meaning": "việc trượt tuyết (~をします：trượt tuyết)"
  },
  {
    "lesson": 13,
    "word": "週末",
    "reading": "しゅうまつ",
    "meaning": "cuối tuần"
  },
  {
    "lesson": 13,
    "word": "正月",
    "reading": "しょうがつ",
    "meaning": "Tết"
  },
  {
    "lesson": 13,
    "word": "～ごろ",
    "reading": "～ごろ",
    "meaning": "khoảng ~ (dùng cho thời gian)"
  },
  {
    "lesson": 13,
    "word": "何か",
    "reading": "なにか",
    "meaning": "cái gì đó"
  },
  {
    "lesson": 13,
    "word": "どこか",
    "reading": "どこか",
    "meaning": "đâu đó, chỗ nào đó"
  },
  {
    "lesson": 13,
    "word": "のどがかわきます",
    "reading": "のどがかわきます",
    "meaning": "(tôi) khát"
  },
  {
    "lesson": 13,
    "word": "おなかがすきます",
    "reading": "おなかがすきます",
    "meaning": "(tôi) đói rồi"
  },
  {
    "lesson": 13,
    "word": "そうしましょう",
    "reading": "そうしましょう",
    "meaning": "Nhất trí./ Chúng ta thống nhất như thế"
  },
  {
    "lesson": 13,
    "word": "ご注文は？",
    "reading": "ご注文は？",
    "meaning": "Anh/Chị dùng món gì ạ"
  },
  {
    "lesson": 13,
    "word": "定食",
    "reading": "定食",
    "meaning": "cơm suất, cơm phần"
  },
  {
    "lesson": 13,
    "word": "牛どん",
    "reading": "牛どん",
    "meaning": "món cơm thịt bò"
  },
  {
    "lesson": 13,
    "word": "お待ちください",
    "reading": "お待ちください",
    "meaning": "Xin anh/chị vui lòng đợi [một chút]"
  },
  {
    "lesson": 13,
    "word": "～でございます",
    "reading": "～でございます",
    "meaning": "(cách nói lịch sự của です)"
  },
  {
    "lesson": 13,
    "word": "別々に",
    "reading": "別々に",
    "meaning": "riêng ra/ để riêng"
  },
  {
    "lesson": 13,
    "word": "アキックス",
    "reading": "アキックス",
    "meaning": "tên một công ty (giả định)"
  },
  {
    "lesson": 13,
    "word": "おはようテレビ",
    "reading": "おはようテレビ",
    "meaning": "tên một chương trình truyền hình (giả định)"
  },
  {
    "lesson": 14,
    "word": "つけます",
    "reading": "つけます",
    "meaning": "bật (điện, máy điều hòa)"
  },
  {
    "lesson": 14,
    "word": "消します",
    "reading": "けします",
    "meaning": "tắt (điện, máy điều hòa)"
  },
  {
    "lesson": 14,
    "word": "開けます",
    "reading": "あけます",
    "meaning": "mở (cửa, cửa sổ)"
  },
  {
    "lesson": 14,
    "word": "閉めます",
    "reading": "しめます",
    "meaning": "đóng (cửa, cửa sổ)"
  },
  {
    "lesson": 14,
    "word": "急ぎます",
    "reading": "いそぎます",
    "meaning": "vội, gấp"
  },
  {
    "lesson": 14,
    "word": "待ちます",
    "reading": "まちます",
    "meaning": "đợi, chờ"
  },
  {
    "lesson": 14,
    "word": "持ちます",
    "reading": "もちます",
    "meaning": "mang, cầm"
  },
  {
    "lesson": 14,
    "word": "取ります",
    "reading": "とります",
    "meaning": "lấy (muối)"
  },
  {
    "lesson": 14,
    "word": "手伝います",
    "reading": "てつだいます",
    "meaning": "giúp (làm việc)"
  },
  {
    "lesson": 14,
    "word": "呼びます",
    "reading": "よびます",
    "meaning": "gọi (taxi, tên)"
  },
  {
    "lesson": 14,
    "word": "話します",
    "reading": "はなします",
    "meaning": "nói, nói chuyện"
  },
  {
    "lesson": 14,
    "word": "使います",
    "reading": "つかいます",
    "meaning": "dùng, sử dụng"
  },
  {
    "lesson": 14,
    "word": "止めます",
    "reading": "とめます",
    "meaning": "dừng, đỗ"
  },
  {
    "lesson": 14,
    "word": "見せます",
    "reading": "みせます",
    "meaning": "cho xem, trình"
  },
  {
    "lesson": 14,
    "word": "教えます",
    "reading": "おしえます",
    "meaning": "nói, cho biết [địa chỉ]"
  },
  {
    "lesson": 14,
    "word": "座ります",
    "reading": "すわります",
    "meaning": "ngồi"
  },
  {
    "lesson": 14,
    "word": "立ちます",
    "reading": "たちます",
    "meaning": "đứng"
  },
  {
    "lesson": 14,
    "word": "入ります",
    "reading": "はいります",
    "meaning": "vào [quán giải khát]"
  },
  {
    "lesson": 14,
    "word": "出ます",
    "reading": "でます",
    "meaning": "ra, ra khỏi [quán giải khát]"
  },
  {
    "lesson": 14,
    "word": "降ります",
    "reading": "ふります",
    "meaning": "rơi [mưa~]"
  },
  {
    "lesson": 14,
    "word": "コピーします",
    "reading": "コピーします",
    "meaning": "copy"
  },
  {
    "lesson": 14,
    "word": "電気",
    "reading": "でんき",
    "meaning": "điện, đèn điện"
  },
  {
    "lesson": 14,
    "word": "エアコン",
    "reading": "エアコン",
    "meaning": "máy điều hòa"
  },
  {
    "lesson": 14,
    "word": "パスポート",
    "reading": "パスポート",
    "meaning": "hộ chiếu"
  },
  {
    "lesson": 14,
    "word": "名前",
    "reading": "なまえ",
    "meaning": "tên"
  },
  {
    "lesson": 14,
    "word": "住所",
    "reading": "じゅうしょ",
    "meaning": "địa chỉ"
  },
  {
    "lesson": 14,
    "word": "地図",
    "reading": "ちず",
    "meaning": "bản đồ"
  },
  {
    "lesson": 14,
    "word": "塩",
    "reading": "しお",
    "meaning": "muối"
  },
  {
    "lesson": 14,
    "word": "砂糖",
    "reading": "さとう",
    "meaning": "đường"
  },
  {
    "lesson": 14,
    "word": "問題",
    "reading": "もんだい",
    "meaning": "câu hỏi, vấn đề"
  },
  {
    "lesson": 14,
    "word": "答え",
    "reading": "こたえ",
    "meaning": "câu trả lời"
  },
  {
    "lesson": 14,
    "word": "読み方",
    "reading": "よみかた",
    "meaning": "cách đọc"
  },
  {
    "lesson": 14,
    "word": "～方",
    "reading": "～かた",
    "meaning": "cách ~"
  },
  {
    "lesson": 14,
    "word": "まっすぐ",
    "reading": "まっすぐ",
    "meaning": "thẳng"
  },
  {
    "lesson": 14,
    "word": "ゆっくり",
    "reading": "ゆっくり",
    "meaning": "chậm, thong thả, thoải mái"
  },
  {
    "lesson": 14,
    "word": "すぐ",
    "reading": "すぐ",
    "meaning": "ngay, lập tức"
  },
  {
    "lesson": 14,
    "word": "また",
    "reading": "また",
    "meaning": "lại (~đến)"
  },
  {
    "lesson": 14,
    "word": "あとで",
    "reading": "あとで",
    "meaning": "sau"
  },
  {
    "lesson": 14,
    "word": "もう少し",
    "reading": "もうすこし",
    "meaning": "thêm một chút nữa thôi"
  },
  {
    "lesson": 14,
    "word": "もう～",
    "reading": "もう～",
    "meaning": "thêm~"
  },
  {
    "lesson": 14,
    "word": "さあ",
    "reading": "さあ",
    "meaning": "thôi/nào (dùng để thúc giục hoặc khuyến khích ai làm gì.)"
  },
  {
    "lesson": 14,
    "word": "あれ？",
    "reading": "あれ？",
    "meaning": "Ô! (câu cảm thán khi phát hiện hoặc thấy cái gì đó lạ, hoặc bất ngờ)"
  },
  {
    "lesson": 14,
    "word": "信号を右へ曲がってください",
    "reading": "信号を右へ曲がってください",
    "meaning": "Anh/ Chị rẽ phải ở chổ đèn tín hiệu"
  },
  {
    "lesson": 14,
    "word": "これでお願いします",
    "reading": "これでお願いします",
    "meaning": "Gởi anh tiền này"
  },
  {
    "lesson": 14,
    "word": "お釣り",
    "reading": "お釣り",
    "meaning": "tiền lẻ"
  },
  {
    "lesson": 14,
    "word": "みどり町",
    "reading": "みどり町",
    "meaning": "tên một thành phố (giả định)"
  },
  {
    "lesson": 15,
    "word": "置きます",
    "reading": "おきます",
    "meaning": "đặt, để"
  },
  {
    "lesson": 15,
    "word": "作ります造ります",
    "reading": "つくります",
    "meaning": "làm, chế tạo, sản xuất"
  },
  {
    "lesson": 15,
    "word": "売ります",
    "reading": "うります",
    "meaning": "bán"
  },
  {
    "lesson": 15,
    "word": "知ります",
    "reading": "しります",
    "meaning": "biết"
  },
  {
    "lesson": 15,
    "word": "住みます",
    "reading": "すみます",
    "meaning": "sống, ở"
  },
  {
    "lesson": 15,
    "word": "研究します",
    "reading": "けんきゅうします",
    "meaning": "nghiên cứu"
  },
  {
    "lesson": 15,
    "word": "資料",
    "reading": "しりょう",
    "meaning": "tài liệu, tư liệu"
  },
  {
    "lesson": 15,
    "word": "カタログ",
    "reading": "カタログ",
    "meaning": "ca-ta-lô"
  },
  {
    "lesson": 15,
    "word": "時刻表",
    "reading": "じこくひょう",
    "meaning": "bảng giờ tàu chạy"
  },
  {
    "lesson": 15,
    "word": "服",
    "reading": "ふく",
    "meaning": "quần áo"
  },
  {
    "lesson": 15,
    "word": "製品",
    "reading": "せいひん",
    "meaning": "sản phẩm"
  },
  {
    "lesson": 15,
    "word": "ソフト",
    "reading": "ソフト",
    "meaning": "phần mềm"
  },
  {
    "lesson": 15,
    "word": "電子辞書",
    "reading": "でんしじしょ",
    "meaning": "kim từ điển"
  },
  {
    "lesson": 15,
    "word": "経済",
    "reading": "けいざい",
    "meaning": "kinh tế"
  },
  {
    "lesson": 15,
    "word": "市役所",
    "reading": "しやくしょ",
    "meaning": "tòa thị chính"
  },
  {
    "lesson": 15,
    "word": "高校",
    "reading": "こうこう",
    "meaning": "trường trung học phổ thông, trường cấp 3"
  },
  {
    "lesson": 15,
    "word": "歯医者",
    "reading": "はいしゃ",
    "meaning": "nha sĩ"
  },
  {
    "lesson": 15,
    "word": "独身",
    "reading": "どくしん",
    "meaning": "độc thân"
  },
  {
    "lesson": 15,
    "word": "すみません",
    "reading": "すみません",
    "meaning": "xin lỗi"
  },
  {
    "lesson": 15,
    "word": "皆さん",
    "reading": "皆さん",
    "meaning": "các anh chị, các ông bà, các bạn, quý vị"
  },
  {
    "lesson": 15,
    "word": "思い出します",
    "reading": "思い出します",
    "meaning": "nhớ lại, hồi tưởng"
  },
  {
    "lesson": 15,
    "word": "いらっしゃいます",
    "reading": "いらっしゃいます",
    "meaning": "kính ngữ của 「います」"
  },
  {
    "lesson": 15,
    "word": "日本橋",
    "reading": "日本橋",
    "meaning": "tên một khu phố buôn bán ở Osaka"
  },
  {
    "lesson": 15,
    "word": "みんなのインタビュー",
    "reading": "みんなのインタビュー",
    "meaning": "tên chương trình truyền hình (giả định)"
  },
  {
    "lesson": 16,
    "word": "乗ります",
    "reading": "のります",
    "meaning": "đi, lên [tàu]"
  },
  {
    "lesson": 16,
    "word": "降ります",
    "reading": "おります",
    "meaning": "xuống [tàu]"
  },
  {
    "lesson": 16,
    "word": "乗り換えます",
    "reading": "のりかえます",
    "meaning": "chuyển, đổi (tàu)"
  },
  {
    "lesson": 16,
    "word": "浴びます",
    "reading": "あびます",
    "meaning": "tắm [vòi hoa sen]"
  },
  {
    "lesson": 16,
    "word": "入れます",
    "reading": "いれます",
    "meaning": "cho vào, bỏ vào"
  },
  {
    "lesson": 16,
    "word": "出します",
    "reading": "だします",
    "meaning": "lấy ra, đưa ra, gửi"
  },
  {
    "lesson": 16,
    "word": "下ろします",
    "reading": "おろします",
    "meaning": "rút [tiền]"
  },
  {
    "lesson": 16,
    "word": "入ります",
    "reading": "はいります",
    "meaning": "vào, nhập học [đại học]"
  },
  {
    "lesson": 16,
    "word": "出ます",
    "reading": "でます",
    "meaning": "ra, tốt nghiệp [đại học]"
  },
  {
    "lesson": 16,
    "word": "押します",
    "reading": "おします",
    "meaning": "bấm, ấn (nút)"
  },
  {
    "lesson": 16,
    "word": "飲みます",
    "reading": "のみます",
    "meaning": "uống (bia, rượu)"
  },
  {
    "lesson": 16,
    "word": "始めます",
    "reading": "はじめます",
    "meaning": "bắt đầu"
  },
  {
    "lesson": 16,
    "word": "見学します",
    "reading": "けんがくします",
    "meaning": "tham quan kiến tập"
  },
  {
    "lesson": 16,
    "word": "電話します",
    "reading": "でんわします",
    "meaning": "gọi điện thoại"
  },
  {
    "lesson": 16,
    "word": "若い",
    "reading": "わかい",
    "meaning": "trẻ"
  },
  {
    "lesson": 16,
    "word": "長い",
    "reading": "ながい",
    "meaning": "dài"
  },
  {
    "lesson": 16,
    "word": "短い",
    "reading": "みじかい",
    "meaning": "ngắn"
  },
  {
    "lesson": 16,
    "word": "明るい",
    "reading": "あかるい",
    "meaning": "sáng"
  },
  {
    "lesson": 16,
    "word": "暗い",
    "reading": "くらい",
    "meaning": "tối"
  },
  {
    "lesson": 16,
    "word": "体",
    "reading": "からだ",
    "meaning": "người, cơ thể"
  },
  {
    "lesson": 16,
    "word": "頭",
    "reading": "あたま",
    "meaning": "đầu"
  },
  {
    "lesson": 16,
    "word": "髪",
    "reading": "かみ",
    "meaning": "tóc"
  },
  {
    "lesson": 16,
    "word": "顔",
    "reading": "かお",
    "meaning": "mặt"
  },
  {
    "lesson": 16,
    "word": "目",
    "reading": "め",
    "meaning": "mắt"
  },
  {
    "lesson": 16,
    "word": "耳",
    "reading": "みみ",
    "meaning": "tai"
  },
  {
    "lesson": 16,
    "word": "鼻",
    "reading": "はな",
    "meaning": "mũi"
  },
  {
    "lesson": 16,
    "word": "口",
    "reading": "くち",
    "meaning": "miệng"
  },
  {
    "lesson": 16,
    "word": "歯",
    "reading": "は",
    "meaning": "răng"
  },
  {
    "lesson": 16,
    "word": "おなか",
    "reading": "おなか",
    "meaning": "bụng"
  },
  {
    "lesson": 16,
    "word": "足",
    "reading": "あし",
    "meaning": "chân"
  },
  {
    "lesson": 16,
    "word": "背",
    "reading": "せ",
    "meaning": "chiều cao (cơ thể)"
  },
  {
    "lesson": 16,
    "word": "サービス",
    "reading": "サービス",
    "meaning": "dịch vụ"
  },
  {
    "lesson": 16,
    "word": "ジョギング",
    "reading": "ジョギング",
    "meaning": "việc chạy bộ (~をします: chạy bộ)"
  },
  {
    "lesson": 16,
    "word": "シャワー",
    "reading": "シャワー",
    "meaning": "vòi hoa sen"
  },
  {
    "lesson": 16,
    "word": "緑",
    "reading": "みどり",
    "meaning": "màu xanh lá cây"
  },
  {
    "lesson": 16,
    "word": "寺",
    "reading": "てら",
    "meaning": "chùa"
  },
  {
    "lesson": 16,
    "word": "神社",
    "reading": "じんじゃ",
    "meaning": "đền thờ đạo thần"
  },
  {
    "lesson": 16,
    "word": "一番",
    "reading": "一ばん",
    "meaning": "số ―"
  },
  {
    "lesson": 16,
    "word": "どうやって",
    "reading": "どうやって",
    "meaning": "làm thế nào~"
  },
  {
    "lesson": 16,
    "word": "どの～",
    "reading": "どの～",
    "meaning": "cái nào~ (dùng với trường hợp từ ba thứ trở lên)"
  },
  {
    "lesson": 16,
    "word": "どれ",
    "reading": "どれ",
    "meaning": "cái nào~ (dùng với trường hợp ba cái hoặc nhiều hơn)"
  },
  {
    "lesson": 16,
    "word": "すごいですね",
    "reading": "すごいですね",
    "meaning": "Thật là tuyệt vời. / Kinh quá nhỉ"
  },
  {
    "lesson": 16,
    "word": "まだまだです",
    "reading": "まだまだです",
    "meaning": "[không,] tôi còn kém lắm. (cách nói khiêm nhường khi ai đó khen)"
  },
  {
    "lesson": 16,
    "word": "お引き出しですか",
    "reading": "お引き出しですか",
    "meaning": "Anh/ chị rút tiền ạ?"
  },
  {
    "lesson": 16,
    "word": "まず",
    "reading": "まず",
    "meaning": "trước hết, đầu tiên"
  },
  {
    "lesson": 16,
    "word": "次に",
    "reading": "次に",
    "meaning": "tiếp theo, sau đó"
  },
  {
    "lesson": 16,
    "word": "キャッシュカード",
    "reading": "キャッシュカード",
    "meaning": "thẻ ngân hàng, thẻ ATM"
  },
  {
    "lesson": 16,
    "word": "暗証番号",
    "reading": "暗証番号",
    "meaning": "mã số bí mật (mật khẩu)"
  },
  {
    "lesson": 16,
    "word": "金額",
    "reading": "金額",
    "meaning": "số tiền, khoản tiền"
  },
  {
    "lesson": 16,
    "word": "確認",
    "reading": "確認",
    "meaning": "sự xác nhận, sự kiểm tra (~します：xác nhận)"
  },
  {
    "lesson": 16,
    "word": "ボタン",
    "reading": "ボタン",
    "meaning": "nút"
  },
  {
    "lesson": 16,
    "word": "ＪＲ",
    "reading": "ＪＲ",
    "meaning": "công ty đường sắt Nhật Bản"
  },
  {
    "lesson": 16,
    "word": "雪祭り",
    "reading": "雪祭り",
    "meaning": "Lễ hội tuyết"
  },
  {
    "lesson": 16,
    "word": "バンドン",
    "reading": "バンドン",
    "meaning": "Bandung (ở Indonesia)"
  },
  {
    "lesson": 16,
    "word": "フランケン",
    "reading": "フランケン",
    "meaning": "Franken (ở Đức)"
  },
  {
    "lesson": 16,
    "word": "ベラクルス",
    "reading": "ベラクルス",
    "meaning": "Veracruz (ở Mexico)"
  },
  {
    "lesson": 16,
    "word": "梅田",
    "reading": "梅田",
    "meaning": "tên một quận ở Osaka"
  },
  {
    "lesson": 16,
    "word": "大学前",
    "reading": "大学前",
    "meaning": "tên một điểm dừng xe buýt (giả tưởng)"
  },
  {
    "lesson": 17,
    "word": "覚えます",
    "reading": "おぼえます",
    "meaning": "nhớ"
  },
  {
    "lesson": 17,
    "word": "忘れます",
    "reading": "わすれます",
    "meaning": "quên"
  },
  {
    "lesson": 17,
    "word": "なくします",
    "reading": "なくします",
    "meaning": "mất, đánh mất"
  },
  {
    "lesson": 17,
    "word": "払います",
    "reading": "はらいます",
    "meaning": "trả tiền"
  },
  {
    "lesson": 17,
    "word": "返します",
    "reading": "かえします",
    "meaning": "trả lại"
  },
  {
    "lesson": 17,
    "word": "出かけます",
    "reading": "でかけます",
    "meaning": "ra ngoài"
  },
  {
    "lesson": 17,
    "word": "脱ぎます",
    "reading": "ぬぎます",
    "meaning": "cởi (quần áo, giầy)"
  },
  {
    "lesson": 17,
    "word": "持って行きます",
    "reading": "もっていきます",
    "meaning": "mang đi, mang theo"
  },
  {
    "lesson": 17,
    "word": "持って来ます",
    "reading": "もってきます",
    "meaning": "mang đến"
  },
  {
    "lesson": 17,
    "word": "心配します",
    "reading": "しんぱいします",
    "meaning": "lo lắng"
  },
  {
    "lesson": 17,
    "word": "残業します",
    "reading": "ざんぎょうします",
    "meaning": "làm thêm, làm quá giờ"
  },
  {
    "lesson": 17,
    "word": "出張します",
    "reading": "しゅっちょうします",
    "meaning": "đi công tác"
  },
  {
    "lesson": 17,
    "word": "飲みます",
    "reading": "のみます",
    "meaning": "uống [thuốc]"
  },
  {
    "lesson": 17,
    "word": "入ります",
    "reading": "はいります",
    "meaning": "tắm bồn [vào bồn tắm]"
  },
  {
    "lesson": 17,
    "word": "大切",
    "reading": "たいせつ",
    "meaning": "quan trọng, quý giá"
  },
  {
    "lesson": 17,
    "word": "大丈夫",
    "reading": "だいじょうぶ",
    "meaning": "không sao, không có vấn đề gì"
  },
  {
    "lesson": 17,
    "word": "危ない",
    "reading": "あぶない",
    "meaning": "nguy hiểm"
  },
  {
    "lesson": 17,
    "word": "禁煙",
    "reading": "きんえん",
    "meaning": "cấm hút thuốc"
  },
  {
    "lesson": 17,
    "word": "保険証",
    "reading": "ほけんしょう",
    "meaning": "thẻ bảo hiểm [y tế]"
  },
  {
    "lesson": 17,
    "word": "熱",
    "reading": "ねつ",
    "meaning": "sốt"
  },
  {
    "lesson": 17,
    "word": "病気",
    "reading": "びょうき",
    "meaning": "ốm, bệnh"
  },
  {
    "lesson": 17,
    "word": "薬",
    "reading": "くすり",
    "meaning": "thuốc"
  },
  {
    "lesson": 17,
    "word": "ふろ",
    "reading": "ふろ",
    "meaning": "bồn tắm"
  },
  {
    "lesson": 17,
    "word": "上着",
    "reading": "うわぎ",
    "meaning": "áo khoác"
  },
  {
    "lesson": 17,
    "word": "下着",
    "reading": "したぎ",
    "meaning": "quần áo lót"
  },
  {
    "lesson": 17,
    "word": "２３日",
    "reading": "２３にち",
    "meaning": "2,3 ngày, vài ngày"
  },
  {
    "lesson": 17,
    "word": "２３～",
    "reading": "２３～",
    "meaning": "vài~ (“~” là hậu tố đếm)"
  },
  {
    "lesson": 17,
    "word": "～までに",
    "reading": "～までに",
    "meaning": "trước ~ (chỉ thời hạn)"
  },
  {
    "lesson": 17,
    "word": "ですから",
    "reading": "ですから",
    "meaning": "vì thế, vì vậy, do đó"
  },
  {
    "lesson": 17,
    "word": "どうしましたか",
    "reading": "どうしましたか",
    "meaning": "Có vần đề gì? Anh/chị bị làm sao?"
  },
  {
    "lesson": 17,
    "word": "のど",
    "reading": "のど",
    "meaning": "họng"
  },
  {
    "lesson": 17,
    "word": "痛いです",
    "reading": "痛いです",
    "meaning": "Tôi bị đau [~]"
  },
  {
    "lesson": 17,
    "word": "かぜ",
    "reading": "かぜ",
    "meaning": "cảm, cúm"
  },
  {
    "lesson": 17,
    "word": "それから",
    "reading": "それから",
    "meaning": "và, sau đó"
  },
  {
    "lesson": 17,
    "word": "お大事に",
    "reading": "お大事に",
    "meaning": "Anh/chị nhớ giữ gìn sức khỏe. (câu nói với người ốm,bị bệnh)"
  },
  {
    "lesson": 18,
    "word": "できます",
    "reading": "できます",
    "meaning": "có thể"
  },
  {
    "lesson": 18,
    "word": "洗います",
    "reading": "あらいます",
    "meaning": "rửa"
  },
  {
    "lesson": 18,
    "word": "弾きます",
    "reading": "ひきます",
    "meaning": "chơi (nhạc cụ)"
  },
  {
    "lesson": 18,
    "word": "歌います",
    "reading": "うたいます",
    "meaning": "hát"
  },
  {
    "lesson": 18,
    "word": "集めます",
    "reading": "あつめます",
    "meaning": "sưu tầm, thu thập"
  },
  {
    "lesson": 18,
    "word": "捨てます",
    "reading": "すてます",
    "meaning": "vứt, bỏ đi"
  },
  {
    "lesson": 18,
    "word": "換えます",
    "reading": "かえます",
    "meaning": "đổi"
  },
  {
    "lesson": 18,
    "word": "運転します",
    "reading": "うんてんします",
    "meaning": "lái"
  },
  {
    "lesson": 18,
    "word": "予約します",
    "reading": "よやくします",
    "meaning": "đặt chỗ, đặt trước"
  },
  {
    "lesson": 18,
    "word": "ピアノ",
    "reading": "ピアノ",
    "meaning": "đàn Piano"
  },
  {
    "lesson": 18,
    "word": "―メートル",
    "reading": "―メートル",
    "meaning": "― mét"
  },
  {
    "lesson": 18,
    "word": "現金",
    "reading": "げんきん",
    "meaning": "tiền mặt"
  },
  {
    "lesson": 18,
    "word": "趣味",
    "reading": "しゅみ",
    "meaning": "sở thích, thú vui"
  },
  {
    "lesson": 18,
    "word": "日記",
    "reading": "にっき",
    "meaning": "nhật ký"
  },
  {
    "lesson": 18,
    "word": "祈り",
    "reading": "いのり",
    "meaning": "việc cầu nguyện (～をします：cầu nguyện)"
  },
  {
    "lesson": 18,
    "word": "課長",
    "reading": "かちょう",
    "meaning": "tổ trưởng"
  },
  {
    "lesson": 18,
    "word": "部長",
    "reading": "ぶちょう",
    "meaning": "trưởng phòng"
  },
  {
    "lesson": 18,
    "word": "社長",
    "reading": "しゃちょう",
    "meaning": "giám đốc"
  },
  {
    "lesson": 18,
    "word": "動物",
    "reading": "どうぶつ",
    "meaning": "động vật"
  },
  {
    "lesson": 18,
    "word": "馬",
    "reading": "うま",
    "meaning": "ngựa"
  },
  {
    "lesson": 18,
    "word": "インターネット",
    "reading": "インターネット",
    "meaning": "internet"
  },
  {
    "lesson": 18,
    "word": "特に",
    "reading": "特に",
    "meaning": "đặt biệt là"
  },
  {
    "lesson": 18,
    "word": "へえ",
    "reading": "へえ",
    "meaning": "thế à! (dùng để biểu thị sự ngạc nhiên hoặc quan tâm)"
  },
  {
    "lesson": 18,
    "word": "それはおもしろいですね",
    "reading": "それはおもしろいですね",
    "meaning": "Hay thật nhỉ"
  },
  {
    "lesson": 18,
    "word": "なかなか",
    "reading": "なかなか",
    "meaning": "khó mà~, mãi mà (dùng với thể phủ định)"
  },
  {
    "lesson": 18,
    "word": "ほんとうですか",
    "reading": "ほんとうですか",
    "meaning": "Thật không ạ?"
  },
  {
    "lesson": 18,
    "word": "ぜひ",
    "reading": "ぜひ",
    "meaning": "nhất định, rất"
  },
  {
    "lesson": 18,
    "word": "故郷",
    "reading": "故郷",
    "meaning": "Furusato(tên bài hát có nghĩa \"quê nhà\")"
  },
  {
    "lesson": 18,
    "word": "ビートルズ",
    "reading": "ビートルズ",
    "meaning": "Beatles, một băng nhạc nỗi tiếng nước Anh"
  },
  {
    "lesson": 18,
    "word": "秋葉原",
    "reading": "秋葉原",
    "meaning": "một quận ở Tokyo"
  },
  {
    "lesson": 19,
    "word": "登ります",
    "reading": "のぼります",
    "meaning": "leo [núi]"
  },
  {
    "lesson": 19,
    "word": "泊まります",
    "reading": "とまります",
    "meaning": "trọ [ở khách sạn]"
  },
  {
    "lesson": 19,
    "word": "掃除します",
    "reading": "そうじします",
    "meaning": "dọn vệ sinh"
  },
  {
    "lesson": 19,
    "word": "洗濯します",
    "reading": "せんたくします",
    "meaning": "giặt"
  },
  {
    "lesson": 19,
    "word": "なります",
    "reading": "なります",
    "meaning": "trở thành, trở nên"
  },
  {
    "lesson": 19,
    "word": "眠い",
    "reading": "ねむい",
    "meaning": "buồn ngủ"
  },
  {
    "lesson": 19,
    "word": "強い",
    "reading": "つよい",
    "meaning": "mạnh"
  },
  {
    "lesson": 19,
    "word": "弱い",
    "reading": "よわい",
    "meaning": "yếu"
  },
  {
    "lesson": 19,
    "word": "ゴルフ",
    "reading": "ゴルフ",
    "meaning": "gôn (～をします:chơi gôn)"
  },
  {
    "lesson": 19,
    "word": "相撲",
    "reading": "すもう",
    "meaning": "vật Sumo"
  },
  {
    "lesson": 19,
    "word": "お茶",
    "reading": "おちゃ",
    "meaning": "trà"
  },
  {
    "lesson": 19,
    "word": "日",
    "reading": "ひ",
    "meaning": "ngày"
  },
  {
    "lesson": 19,
    "word": "調子",
    "reading": "ちょうし",
    "meaning": "tình trạng, trạng thái"
  },
  {
    "lesson": 19,
    "word": "一度",
    "reading": "いちど",
    "meaning": "một lần"
  },
  {
    "lesson": 19,
    "word": "一度も",
    "reading": "いちども",
    "meaning": "chưa lần nào"
  },
  {
    "lesson": 19,
    "word": "だんだん",
    "reading": "だんだん",
    "meaning": "dần dần"
  },
  {
    "lesson": 19,
    "word": "もうすぐ",
    "reading": "もうすぐ",
    "meaning": "sắp"
  },
  {
    "lesson": 19,
    "word": "おかげさまで",
    "reading": "おかげさまで",
    "meaning": "nhờ ơn anh/ chị mà ~; Nhờ trời ~"
  },
  {
    "lesson": 19,
    "word": "でも",
    "reading": "でも",
    "meaning": "nhưng"
  },
  {
    "lesson": 19,
    "word": "乾杯",
    "reading": "乾杯",
    "meaning": "nâng cốc!/cạn chén"
  },
  {
    "lesson": 19,
    "word": "ダイエット",
    "reading": "ダイエット",
    "meaning": "việc ăn kiêng, chế độ giảm cân (～をします:ăn kiêng)"
  },
  {
    "lesson": 19,
    "word": "無理",
    "reading": "無理",
    "meaning": "không thể, quá sức"
  },
  {
    "lesson": 19,
    "word": "体にいい",
    "reading": "体にいい",
    "meaning": "tốt cho sức khỏe"
  },
  {
    "lesson": 19,
    "word": "東京スカイツリー",
    "reading": "東京スカイツリー",
    "meaning": "Tokyo Sky Tree (tháp truyền hình có đài ngắm)"
  },
  {
    "lesson": 19,
    "word": "葛飾北斎",
    "reading": "葛飾北斎",
    "meaning": "Katsushika Hokusai (1760-1849), một họa sĩ nổi tiếng thời Edo"
  },
  {
    "lesson": 20,
    "word": "要ります",
    "reading": "いります",
    "meaning": "cần [thị thực (visa)]"
  },
  {
    "lesson": 20,
    "word": "調べます",
    "reading": "しらべます",
    "meaning": "tìm hiểu, điều tra, xem"
  },
  {
    "lesson": 20,
    "word": "修理します",
    "reading": "しゅうりします",
    "meaning": "sửa chữa, tu sửa"
  },
  {
    "lesson": 20,
    "word": "僕",
    "reading": "ぼく",
    "meaning": "tớ (cách xưng thân mật của わたし được dùng bởi nam giới)"
  },
  {
    "lesson": 20,
    "word": "君",
    "reading": "きみ",
    "meaning": "cậu, bạn (cách gọi thân mật của あなたdùng cho người ngang hàng hoặc ít tuổi hơn.)"
  },
  {
    "lesson": 20,
    "word": "～君",
    "reading": "～くん",
    "meaning": "anh~, cậu~ (cách gọi thân mật dùng cho nam giới, cùng nghĩa với 「～さん」)"
  },
  {
    "lesson": 20,
    "word": "うん",
    "reading": "うん",
    "meaning": "ừ (cách nói thân mật của 「はい」)"
  },
  {
    "lesson": 20,
    "word": "ううん",
    "reading": "ううん",
    "meaning": "không (cách nói thân mật của 「いいえ」)"
  },
  {
    "lesson": 20,
    "word": "ことば",
    "reading": "ことば",
    "meaning": "từ, tiếng"
  },
  {
    "lesson": 20,
    "word": "着物",
    "reading": "きもの",
    "meaning": "Kimono (trang phục truyền thống của Nhật Bản)"
  },
  {
    "lesson": 20,
    "word": "ビザ",
    "reading": "ビザ",
    "meaning": "thị thực, Visa"
  },
  {
    "lesson": 20,
    "word": "始め",
    "reading": "はじめ",
    "meaning": "ban đầu, đầu tiên"
  },
  {
    "lesson": 20,
    "word": "終わり",
    "reading": "おわり",
    "meaning": "kết thúc"
  },
  {
    "lesson": 20,
    "word": "こっち",
    "reading": "こっち",
    "meaning": "phía này, chỗ này (cách nói thân mật của 「こちら」)"
  },
  {
    "lesson": 20,
    "word": "そっち",
    "reading": "そっち",
    "meaning": "phía đó, chỗ đó (cách nói thân mật của 「そちら」)"
  },
  {
    "lesson": 20,
    "word": "あっち",
    "reading": "あっち",
    "meaning": "phía kia, chỗ kia (cách nói thân mật của 「あちら」)"
  },
  {
    "lesson": 20,
    "word": "どっち",
    "reading": "どっち",
    "meaning": "cái nào, phía nào, đâu (cách nói thân mật của 「どちら」)"
  },
  {
    "lesson": 20,
    "word": "みんなで",
    "reading": "みんなで",
    "meaning": "mọi người cùng"
  },
  {
    "lesson": 20,
    "word": "～けど",
    "reading": "～けど",
    "meaning": "nhưng (cách nói thân mật của 「が」)"
  },
  {
    "lesson": 20,
    "word": "おなかがいっぱいです",
    "reading": "おなかがいっぱいです",
    "meaning": "(Tôi) no rồi"
  },
  {
    "lesson": 20,
    "word": "よかったら",
    "reading": "よかったら",
    "meaning": "Nếu anh/chị thích thì"
  },
  {
    "lesson": 20,
    "word": "いろいろ",
    "reading": "いろいろ",
    "meaning": "nhiều thứ"
  },
  {
    "lesson": 21,
    "word": "思います",
    "reading": "おもいます",
    "meaning": "nghĩ"
  },
  {
    "lesson": 21,
    "word": "言います",
    "reading": "いいます",
    "meaning": "nói"
  },
  {
    "lesson": 21,
    "word": "勝ちます",
    "reading": "かちます",
    "meaning": "thắng"
  },
  {
    "lesson": 21,
    "word": "負けます",
    "reading": "まけます",
    "meaning": "thua"
  },
  {
    "lesson": 21,
    "word": "あります",
    "reading": "あります",
    "meaning": "được tổ chức, diễn ra, có [lễ hội~]"
  },
  {
    "lesson": 21,
    "word": "役に立ちます",
    "reading": "やくにたちます",
    "meaning": "giúp ích"
  },
  {
    "lesson": 21,
    "word": "動きます",
    "reading": "うごきます",
    "meaning": "chuyển động, chạy"
  },
  {
    "lesson": 21,
    "word": "やめます",
    "reading": "やめます",
    "meaning": "bỏ, thôi [việc công ty]"
  },
  {
    "lesson": 21,
    "word": "気をつけます",
    "reading": "きをつけます",
    "meaning": "chú ý, bảo trọng"
  },
  {
    "lesson": 21,
    "word": "留学します",
    "reading": "りゅうがくします",
    "meaning": "du học"
  },
  {
    "lesson": 21,
    "word": "むだ",
    "reading": "むだ",
    "meaning": "lãng phí, vô ích"
  },
  {
    "lesson": 21,
    "word": "不便",
    "reading": "ふべん",
    "meaning": "bất tiện"
  },
  {
    "lesson": 21,
    "word": "すごい",
    "reading": "すごい",
    "meaning": "ghê quá, giỏi quá"
  },
  {
    "lesson": 21,
    "word": "ほんとう",
    "reading": "ほんとう",
    "meaning": "sự thật"
  },
  {
    "lesson": 21,
    "word": "うそ",
    "reading": "うそ",
    "meaning": "giả dối, nói dối"
  },
  {
    "lesson": 21,
    "word": "自動車",
    "reading": "じどうしゃ",
    "meaning": "ô tô, xe hơi"
  },
  {
    "lesson": 21,
    "word": "交通",
    "reading": "こうつう",
    "meaning": "giao thông"
  },
  {
    "lesson": 21,
    "word": "物価",
    "reading": "ぶっか",
    "meaning": "giá cả, mức giá, vật giá"
  },
  {
    "lesson": 21,
    "word": "放送",
    "reading": "ほうそう",
    "meaning": "phát, phát thanh"
  },
  {
    "lesson": 21,
    "word": "ニュース",
    "reading": "ニュース",
    "meaning": "tin tức, bản tin"
  },
  {
    "lesson": 21,
    "word": "アニメ",
    "reading": "アニメ",
    "meaning": "phim hoạt hình (Nhật Bản)"
  },
  {
    "lesson": 21,
    "word": "マンガ",
    "reading": "マンガ",
    "meaning": "truyện tranh"
  },
  {
    "lesson": 21,
    "word": "デザイン",
    "reading": "デザイン",
    "meaning": "thiết kế"
  },
  {
    "lesson": 21,
    "word": "夢",
    "reading": "ゆめ",
    "meaning": "giấc mơ"
  },
  {
    "lesson": 21,
    "word": "天才",
    "reading": "てんさい",
    "meaning": "thiên tài"
  },
  {
    "lesson": 21,
    "word": "試合",
    "reading": "しあい",
    "meaning": "trận đấu"
  },
  {
    "lesson": 21,
    "word": "意見",
    "reading": "いけん",
    "meaning": "ý kiến"
  },
  {
    "lesson": 21,
    "word": "話",
    "reading": "はなし",
    "meaning": "câu chuyện, bài nói chuyện (～をします: Nói chuyện)"
  },
  {
    "lesson": 21,
    "word": "地球",
    "reading": "ちきゅう",
    "meaning": "trái đất"
  },
  {
    "lesson": 21,
    "word": "月",
    "reading": "つき",
    "meaning": "mặt trăng"
  },
  {
    "lesson": 21,
    "word": "最近",
    "reading": "さいきん",
    "meaning": "gần đây"
  },
  {
    "lesson": 21,
    "word": "たぶん",
    "reading": "たぶん",
    "meaning": "chắc, có thể"
  },
  {
    "lesson": 21,
    "word": "きっと",
    "reading": "きっと",
    "meaning": "chắc chắn, nhất định"
  },
  {
    "lesson": 21,
    "word": "ほんとうに",
    "reading": "ほんとうに",
    "meaning": "thật sự"
  },
  {
    "lesson": 21,
    "word": "そんなに",
    "reading": "そんなに",
    "meaning": "(không)~ lắm"
  },
  {
    "lesson": 21,
    "word": "～について",
    "reading": "～について",
    "meaning": "về~"
  },
  {
    "lesson": 21,
    "word": "久しぶりですね",
    "reading": "久しぶりですね",
    "meaning": "Đã lâu không gặp nhỉ"
  },
  {
    "lesson": 21,
    "word": "～でも飲みませんか",
    "reading": "～でも飲みませんか",
    "meaning": "Anh/chị uống~ (cà-phê, rựu hay cái gì đó) nhé"
  },
  {
    "lesson": 21,
    "word": "もちろん",
    "reading": "もちろん",
    "meaning": "tất nhiên"
  },
  {
    "lesson": 21,
    "word": "帰らないと…",
    "reading": "帰らないと…",
    "meaning": "Tôi phải về bây giờ không thì …"
  },
  {
    "lesson": 21,
    "word": "アインシュタイン",
    "reading": "アインシュタイン",
    "meaning": "Albert Einstein (1879-1955)"
  },
  {
    "lesson": 21,
    "word": "ガガーリン",
    "reading": "ガガーリン",
    "meaning": "Yuri Alekseyevich Gagarin (1934-1968)"
  },
  {
    "lesson": 21,
    "word": "ガリレオ",
    "reading": "ガリレオ",
    "meaning": "Galileo Galilei (1564-1642)"
  },
  {
    "lesson": 21,
    "word": "キング牧師",
    "reading": "キング牧師",
    "meaning": "Mục sư Martin Luther King, JR. (1929-1968)"
  },
  {
    "lesson": 21,
    "word": "フランクリン",
    "reading": "フランクリン",
    "meaning": "Benjamin Franklin(1706-1790)"
  },
  {
    "lesson": 21,
    "word": "かぐや姫",
    "reading": "かぐや姫",
    "meaning": "công chúa Kaguya"
  },
  {
    "lesson": 21,
    "word": "天神祭",
    "reading": "天神祭",
    "meaning": "Lễ hội Tenjin (ở Osaka)"
  },
  {
    "lesson": 21,
    "word": "吉野山",
    "reading": "吉野山",
    "meaning": "núi Yoshino (ở tỉnh Nara)"
  },
  {
    "lesson": 21,
    "word": "カンガルー",
    "reading": "カンガルー",
    "meaning": "con kăng-gu-ru, chuột túi"
  },
  {
    "lesson": 21,
    "word": "キャプテン・クック",
    "reading": "キャプテン・クック",
    "meaning": "thuyền trưởng Cook (James Cook 1728 – 79)"
  },
  {
    "lesson": 21,
    "word": "ヨーネン",
    "reading": "ヨーネン",
    "meaning": "tên công ty (giả định)"
  },
  {
    "lesson": 22,
    "word": "着ます",
    "reading": "きます",
    "meaning": "mặc [áo sơ mi, v.v.]"
  },
  {
    "lesson": 22,
    "word": "はきます",
    "reading": "はきます",
    "meaning": "đi, mặc [giầy, quần âu, v.v.]"
  },
  {
    "lesson": 22,
    "word": "かぶります",
    "reading": "かぶります",
    "meaning": "đội [mũ, v.v.]"
  },
  {
    "lesson": 22,
    "word": "かけます",
    "reading": "かけます",
    "meaning": "đeo [kính]"
  },
  {
    "lesson": 22,
    "word": "します",
    "reading": "します",
    "meaning": "đeo [cà vạt]"
  },
  {
    "lesson": 22,
    "word": "生まれます",
    "reading": "うまれます",
    "meaning": "sinh ra"
  },
  {
    "lesson": 22,
    "word": "わたしたち",
    "reading": "わたしたち",
    "meaning": "chúng tôi, chúng ta"
  },
  {
    "lesson": 22,
    "word": "コート",
    "reading": "コート",
    "meaning": "áo khoác"
  },
  {
    "lesson": 22,
    "word": "セーター",
    "reading": "セーター",
    "meaning": "áo len"
  },
  {
    "lesson": 22,
    "word": "スーツ",
    "reading": "スーツ",
    "meaning": "com-lê"
  },
  {
    "lesson": 22,
    "word": "帽子",
    "reading": "ぼうし",
    "meaning": "mũ"
  },
  {
    "lesson": 22,
    "word": "眼鏡",
    "reading": "めがね",
    "meaning": "kính"
  },
  {
    "lesson": 22,
    "word": "ケーキ",
    "reading": "ケーキ",
    "meaning": "bánh ngọt"
  },
  {
    "lesson": 22,
    "word": "お弁当",
    "reading": "べんとう",
    "meaning": "cơm hộp"
  },
  {
    "lesson": 22,
    "word": "ロボット",
    "reading": "ロボット",
    "meaning": "ro bốt"
  },
  {
    "lesson": 22,
    "word": "ユーモア",
    "reading": "ユーモア",
    "meaning": "sự hài hước"
  },
  {
    "lesson": 22,
    "word": "都合",
    "reading": "つごう",
    "meaning": "(sự) thích hợp"
  },
  {
    "lesson": 22,
    "word": "よく",
    "reading": "よく",
    "meaning": "thường, hay"
  },
  {
    "lesson": 22,
    "word": "えーと",
    "reading": "えーと",
    "meaning": "ừ, à"
  },
  {
    "lesson": 22,
    "word": "おめでとう",
    "reading": "おめでとう",
    "meaning": "Chúc mừng"
  },
  {
    "lesson": 22,
    "word": "お探しですか",
    "reading": "お探しですか",
    "meaning": "Anh/chị tìm ~ à?"
  },
  {
    "lesson": 22,
    "word": "では",
    "reading": "では",
    "meaning": "Thế/Vậy (nhé)"
  },
  {
    "lesson": 22,
    "word": "こちら",
    "reading": "こちら",
    "meaning": "cái này (cách nói lịch sự của [これ])"
  },
  {
    "lesson": 22,
    "word": "家賃",
    "reading": "家賃",
    "meaning": "tiền thuê nhà"
  },
  {
    "lesson": 22,
    "word": "ダイニングキチン",
    "reading": "ダイニングキチン",
    "meaning": "bếp kèm phòng ăn"
  },
  {
    "lesson": 22,
    "word": "和室",
    "reading": "和室",
    "meaning": "phòng kiểu Nhật"
  },
  {
    "lesson": 22,
    "word": "押し入れ",
    "reading": "押し入れ",
    "meaning": "Chổ để chăn gối trong một căn phòng kiểu Nhật"
  },
  {
    "lesson": 22,
    "word": "布団",
    "reading": "布団",
    "meaning": "chăn, đệm"
  },
  {
    "lesson": 22,
    "word": "パリ",
    "reading": "パリ",
    "meaning": "Pari"
  },
  {
    "lesson": 22,
    "word": "万里の長城",
    "reading": "万里の長城",
    "meaning": "Vạn Lý Trường Thành"
  },
  {
    "lesson": 22,
    "word": "みんなのアンケート",
    "reading": "みんなのアンケート",
    "meaning": "tiêu đề bài điều tra (giả định)"
  },
  {
    "lesson": 23,
    "word": "聞きます",
    "reading": "ききます",
    "meaning": "hỏi [giáo viên]"
  },
  {
    "lesson": 23,
    "word": "回します",
    "reading": "まわします",
    "meaning": "vặn (núm)"
  },
  {
    "lesson": 23,
    "word": "引きます",
    "reading": "ひきます",
    "meaning": "kéo"
  },
  {
    "lesson": 23,
    "word": "変えます",
    "reading": "かえます",
    "meaning": "đổi"
  },
  {
    "lesson": 23,
    "word": "触ります",
    "reading": "さわります",
    "meaning": "sờ, chạm vào [cửa]"
  },
  {
    "lesson": 23,
    "word": "出ます",
    "reading": "でます",
    "meaning": "[tiền thừa] ra, chạy ra"
  },
  {
    "lesson": 23,
    "word": "歩きます",
    "reading": "あるきます",
    "meaning": "đi bộ"
  },
  {
    "lesson": 23,
    "word": "渡ります",
    "reading": "わたります",
    "meaning": "qua, đi qua [cầu]"
  },
  {
    "lesson": 23,
    "word": "曲がります",
    "reading": "まがります",
    "meaning": "rẽ, quẹo [phải]"
  },
  {
    "lesson": 23,
    "word": "寂しい",
    "reading": "さびしい",
    "meaning": "buồn, cô đơn"
  },
  {
    "lesson": 23,
    "word": "湯",
    "reading": "ゆ",
    "meaning": "nước nóng"
  },
  {
    "lesson": 23,
    "word": "音",
    "reading": "おと",
    "meaning": "âm thanh"
  },
  {
    "lesson": 23,
    "word": "サイズ",
    "reading": "サイズ",
    "meaning": "cỡ, kích thước"
  },
  {
    "lesson": 23,
    "word": "故障",
    "reading": "こしょう",
    "meaning": "hỏng (~します：bị hỏng)"
  },
  {
    "lesson": 23,
    "word": "道",
    "reading": "みち",
    "meaning": "đường"
  },
  {
    "lesson": 23,
    "word": "交差点",
    "reading": "こうさてん",
    "meaning": "ngã tư"
  },
  {
    "lesson": 23,
    "word": "信号",
    "reading": "しんごう",
    "meaning": "đèn tín hiệu"
  },
  {
    "lesson": 23,
    "word": "角",
    "reading": "かど",
    "meaning": "góc"
  },
  {
    "lesson": 23,
    "word": "橋",
    "reading": "はし",
    "meaning": "cầu"
  },
  {
    "lesson": 23,
    "word": "駐車場",
    "reading": "ちゅうしゃじょう",
    "meaning": "bãi đỗ xe"
  },
  {
    "lesson": 23,
    "word": "建物",
    "reading": "たてもの",
    "meaning": "tòa nhà"
  },
  {
    "lesson": 23,
    "word": "何回も",
    "reading": "なんかいも",
    "meaning": "nhiều lần"
  },
  {
    "lesson": 23,
    "word": "―目",
    "reading": "―め",
    "meaning": "thứ -, số - (biểu thị thứ tự)"
  },
  {
    "lesson": 23,
    "word": "しょうとくたいし",
    "reading": "しょうとくたいし",
    "meaning": "Thái tử Shotoku (574 – 622)"
  },
  {
    "lesson": 23,
    "word": "ほうりゅうじ",
    "reading": "ほうりゅうじ",
    "meaning": "Chùa Horyu-ji (một ngôi chùa ở Nara do hoàng tử Shotoku xây vào thế kỷ thứ 7)"
  },
  {
    "lesson": 23,
    "word": "げんきちゃ",
    "reading": "げんきちゃ",
    "meaning": "tên một loại trà (giả tưởng)"
  },
  {
    "lesson": 23,
    "word": "ほんだえき",
    "reading": "ほんだえき",
    "meaning": "tên một nhà ga (giả tưởng)"
  },
  {
    "lesson": 23,
    "word": "としょかんまえ",
    "reading": "としょかんまえ",
    "meaning": "tên một bến xe buýt (giả tưởng"
  },
  {
    "lesson": 24,
    "word": "くれます",
    "reading": "くれます",
    "meaning": "cho, tặng (tôi)"
  },
  {
    "lesson": 24,
    "word": "直します",
    "reading": "なおします",
    "meaning": "chữa, sửa"
  },
  {
    "lesson": 24,
    "word": "連れて行きます",
    "reading": "つれていきます",
    "meaning": "dẫn đi"
  },
  {
    "lesson": 24,
    "word": "連れて来ます",
    "reading": "つれてきます",
    "meaning": "dẫn đến"
  },
  {
    "lesson": 24,
    "word": "送ります",
    "reading": "おくります",
    "meaning": "đưa đi, đưa đến, tiễn [một ai đó]"
  },
  {
    "lesson": 24,
    "word": "紹介します",
    "reading": "しょうかいします",
    "meaning": "giới thiệu"
  },
  {
    "lesson": 24,
    "word": "案内します",
    "reading": "あんないします",
    "meaning": "hướng dẫn, giới thiệu, dẫn đường"
  },
  {
    "lesson": 24,
    "word": "説明します",
    "reading": "せつめいします",
    "meaning": "giải thích, trình bày"
  },
  {
    "lesson": 24,
    "word": "おじいさん／おじいちゃん",
    "reading": "おじいさん／おじいちゃん",
    "meaning": "ông nội, ông ngoại, ông"
  },
  {
    "lesson": 24,
    "word": "おばあさん／おばあちゃん",
    "reading": "おばあさん／おばあちゃん",
    "meaning": "bà nội, bà ngoại, bà"
  },
  {
    "lesson": 24,
    "word": "準備",
    "reading": "じゅんび",
    "meaning": "chuẩn bị [～します:chuẩn bị]"
  },
  {
    "lesson": 24,
    "word": "引っ越し",
    "reading": "ひっこし",
    "meaning": "sự chuyển nhà"
  },
  {
    "lesson": 24,
    "word": "菓子",
    "reading": "かし",
    "meaning": "bánh kẹo"
  },
  {
    "lesson": 24,
    "word": "ホームステイ",
    "reading": "ホームステイ",
    "meaning": "homestay"
  },
  {
    "lesson": 24,
    "word": "全部",
    "reading": "ぜんぶ",
    "meaning": "toàn bộ, tất cả"
  },
  {
    "lesson": 24,
    "word": "自分で",
    "reading": "じぶんで",
    "meaning": "tự (mình)"
  },
  {
    "lesson": 24,
    "word": "ほかに",
    "reading": "ほかに",
    "meaning": "ngoài ra, bên cạnh đó"
  },
  {
    "lesson": 24,
    "word": "母の日",
    "reading": "母の日",
    "meaning": "Ngày của Mẹ"
  },
  {
    "lesson": 25,
    "word": "考えます",
    "reading": "かんがえます",
    "meaning": "nghĩ, suy nghĩ"
  },
  {
    "lesson": 25,
    "word": "着きます",
    "reading": "つきます",
    "meaning": "đến"
  },
  {
    "lesson": 25,
    "word": "取ります",
    "reading": "とります",
    "meaning": "thêm [tuổi]"
  },
  {
    "lesson": 25,
    "word": "足ります",
    "reading": "たります",
    "meaning": "đủ"
  },
  {
    "lesson": 25,
    "word": "田舎",
    "reading": "いなか",
    "meaning": "quê, nông thôn"
  },
  {
    "lesson": 25,
    "word": "チャンス",
    "reading": "チャンス",
    "meaning": "cơ hội"
  },
  {
    "lesson": 25,
    "word": "億",
    "reading": "おく",
    "meaning": "một trăm triệu"
  },
  {
    "lesson": 25,
    "word": "もし",
    "reading": "もし",
    "meaning": "nếu [~ thì]"
  },
  {
    "lesson": 25,
    "word": "意味",
    "reading": "いみ",
    "meaning": "nghĩa, ý nghĩa"
  },
  {
    "lesson": 25,
    "word": "もしもし",
    "reading": "もしもし",
    "meaning": "A-lô"
  },
  {
    "lesson": 25,
    "word": "転勤",
    "reading": "転勤",
    "meaning": "việc chuyển địa điểm làm việc (～します：chuyển địa điểm làm việc)"
  },
  {
    "lesson": 25,
    "word": "こと",
    "reading": "こと",
    "meaning": "việc, chuyện (~の こと: việc ~)"
  },
  {
    "lesson": 25,
    "word": "暇",
    "reading": "暇",
    "meaning": "thời gian rảnh"
  },
  {
    "lesson": 25,
    "word": "お世話になりました",
    "reading": "お世話になりました",
    "meaning": "Anh/chị đã giúp tôi (nhiều)"
  },
  {
    "lesson": 25,
    "word": "頑張ります",
    "reading": "頑張ります",
    "meaning": "cố, cố gắng"
  },
  {
    "lesson": 25,
    "word": "どうぞお元気で",
    "reading": "どうぞお元気で",
    "meaning": "Chúc anh/chị mạnh khỏe"
  },
  {
    "lesson": 25,
    "word": "ベトナム",
    "reading": "ベトナム",
    "meaning": "Việt Nam"
  }
] as const satisfies readonly RawVocabularyInfo[];

const kanjiByCharacter = new Map(kanjiData.map((item) => [item.kanji, item]));

const getRelatedKanji = (word: string): VocabularyKanjiReference[] => {
  const seen = new Set<string>();
  return Array.from(word)
    .map((character) => kanjiByCharacter.get(character))
    .filter((item): item is NonNullable<ReturnType<typeof kanjiByCharacter.get>> => {
      if (!item || seen.has(item.kanji)) return false;
      seen.add(item.kanji);
      return true;
    })
    .map((item) => ({
      id: item.id,
      kanji: item.kanji,
      meaning: item.meaning,
      level: item.level,
    }));
};

const lowerFirst = (value: string) => (
  value.length === 0 ? value : value.charAt(0).toLocaleLowerCase('vi-VN') + value.slice(1)
);

const includesAny = (value: string, hints: string[]) => (
  hints.some((hint) => value.toLocaleLowerCase('vi-VN').includes(hint))
);

const personMeaningHints = [
  'người', 'anh', 'chị', 'ông', 'bà', 'thầy', 'cô', 'bác sĩ', 'giáo viên',
  'học sinh', 'sinh viên', 'bạn', 'nhân viên', 'trẻ em', 'vợ', 'chồng', 'con',
];

const placeMeaningHints = [
  'trường', 'nhà', 'bệnh viện', 'cửa hàng', 'ga', 'sân bay', 'phòng', 'lớp',
  'ngân hàng', 'bưu điện', 'công ty', 'đại học', 'quán', 'khách sạn', 'nước',
  'thành phố', 'địa điểm',
];

const timeMeaningHints = [
  'ngày', 'tháng', 'năm', 'tuần', 'giờ', 'sáng', 'trưa', 'chiều', 'tối', 'hôm',
  'phút', 'lần',
];

const questionStarters = [
  'いつ', 'どこ', 'だれ', 'どなた', 'どちら', 'どれ', 'どの', 'どう', 'どうして',
  'なに', 'なん', 'いくら', 'いくつ', 'どんな',
];

const createVocabularyContexts = (item: RawVocabularyInfo): VocabularyContext[] => {
  const { word, reading, meaning } = item;
  const isFragment = /[～―－]/.test(word) || /[～―－]/.test(reading);
  const isFixedExpression = /[。？！?]|です|ます|ました|ません|ましょう|ください|なさい/.test(word);
  const isVerb = /(?:ます|ました|ません|ましょう)$/.test(word);
  const isQuestion = questionStarters.some((starter) => word.startsWith(starter) || reading.startsWith(starter));
  const isPerson = includesAny(meaning, personMeaningHints);
  const isPlace = includesAny(meaning, placeMeaningHints);
  const isTime = includesAny(meaning, timeMeaningHints);
  const isIAdjective = /い$/.test(word) && !isFixedExpression;

  const contexts: VocabularyContext[] = [{
    title: 'Cụm gốc',
    phrase: word,
    reading,
    meaning,
    hint: 'Đọc từ này thành một nhịp âm thanh trước, sau đó mới nhớ nghĩa tiếng Việt.',
  }];

  if (isFragment) {
    contexts.push({
      title: 'Mảnh ghép câu',
      phrase: word,
      reading,
      meaning: `Dùng như một mảnh ghép trong câu: ${meaning}`,
      hint: 'Những mục có dấu ～ thường không học một mình; hãy ghép với tên người, nơi chốn hoặc danh từ phía trước/sau.',
    });
    return contexts;
  }

  if (isQuestion) {
    contexts.push({
      title: 'Ngữ cảnh hỏi',
      phrase: `${word}ですか。`,
      reading: `${reading}ですか。`,
      meaning: `Dùng để hỏi: ${meaning}?`,
      hint: 'Nhóm từ hỏi nên học kèm đuôi ですか để bật ra thành câu hỏi ngay khi giao tiếp.',
    });
    return contexts;
  }

  if (isFixedExpression) {
    contexts.push({
      title: 'Câu giao tiếp',
      phrase: word,
      reading,
      meaning,
      hint: 'Học nguyên cụm như một câu dùng trong tình huống thật, không tách từng chữ quá sớm.',
    });
    return contexts;
  }

  if (isVerb) {
    contexts.push({
      title: 'Cụm hành động',
      phrase: `よく${word}。`,
      reading: `よく${reading}。`,
      meaning: `Thường ${lowerFirst(meaning)}.`,
      hint: 'Gắn động từ với よく để nhớ theo thói quen/hành động lặp lại.',
    });
    contexts.push({
      title: 'Ngữ cảnh hôm nay',
      phrase: `きょう、${word}。`,
      reading: `きょう、${reading}。`,
      meaning: `Hôm nay ${lowerFirst(meaning)}.`,
      hint: 'Tự tưởng tượng một việc xảy ra hôm nay để biến từ mới thành trải nghiệm gần.',
    });
    return contexts;
  }

  if (isIAdjective) {
    contexts.push({
      title: 'Mô tả nhanh',
      phrase: `${word}です。`,
      reading: `${reading}です。`,
      meaning: `Thật ${lowerFirst(meaning)}.`,
      hint: 'Tính từ dễ nhớ hơn khi học như một nhận xét ngắn: “...です”.',
    });
    return contexts;
  }

  if (isPerson) {
    contexts.push({
      title: 'Ngữ cảnh con người',
      phrase: `${word}がいます。`,
      reading: `${reading}がいます。`,
      meaning: `Có ${lowerFirst(meaning)}.`,
      hint: 'Danh từ chỉ người/động vật thường đi với います.',
    });
    return contexts;
  }

  if (isPlace) {
    contexts.push({
      title: 'Ngữ cảnh địa điểm',
      phrase: `${word}へ行きます。`,
      reading: `${reading}へいきます。`,
      meaning: `Đi đến ${lowerFirst(meaning)}.`,
      hint: 'Danh từ nơi chốn nhớ nhanh hơn khi gắn với hướng đi: へ行きます.',
    });
    return contexts;
  }

  if (isTime) {
    contexts.push({
      title: 'Ngữ cảnh thời gian',
      phrase: `${word}です。`,
      reading: `${reading}です。`,
      meaning: `Là/vào ${lowerFirst(meaning)}.`,
      hint: 'Từ thời gian nên học như một nhãn mốc trong ngày, tuần hoặc lịch.',
    });
    return contexts;
  }

  contexts.push({
    title: 'Ngữ cảnh có/ở',
    phrase: `${word}があります。`,
    reading: `${reading}があります。`,
    meaning: `Có ${lowerFirst(meaning)}.`,
    hint: 'Danh từ đồ vật/khái niệm dễ nhớ hơn khi gắn với mẫu があります.',
  });
  return contexts;
};

const vocabularyWithLesson = rawMinnaN5Vocabulary.map((item, index) => ({
  lesson: item.lesson,
  word: {
    id: `minna-n5-${String(item.lesson).padStart(2, '0')}-${String(index + 1).padStart(3, '0')}`,
    word: item.word,
    reading: item.reading,
    meaning: item.meaning,
    level: 'N5',
    relatedKanji: getRelatedKanji(item.word),
    contexts: createVocabularyContexts(item),
  } satisfies VocabularyInfo,
}));

const minnaN5VocabularyLessons: VocabularyLessonGroup[] = minnaN5LessonTitles
  .map((title, index) => ({
    level: 'N5' as JLPTLevel,
    title,
    words: vocabularyWithLesson.filter((item) => item.lesson === index + 1).map((item) => item.word),
  }))
  .filter((lesson) => lesson.words.length > 0);

export const vocabularyData: VocabularyInfo[] = vocabularyWithLesson.map((item) => item.word);
export const vocabularyById = new Map(vocabularyData.map((item) => [item.id, item]));

export const getVocabularyRouteLessons = (level: JLPTLevel, n4Only = false): VocabularyLessonGroup[] => {
  void n4Only;
  if (level === 'N5') return minnaN5VocabularyLessons;
  return [];
};

export const getVocabularyRouteData = (level: JLPTLevel, n4Only = false) => (
  getVocabularyRouteLessons(level, n4Only).flatMap((lesson) => lesson.words)
);
