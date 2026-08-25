import { n5Part2Data } from './n5_part2';
import { n5Part3Data } from './n5_part3';
import { n5Part4Data } from './n5_part4';
import { n5Part5Data } from './n5_part5';
import { n4Part1Data } from './n4_part1';
import { n4Part2Data } from './n4_part2';
import { n4Part3Data } from './n4_part3';
import { n4Part4Data } from './n4_part4';
import { n4Part5Data } from './n4_part5';
import { n4Part6Data } from './n4_part6';
import { n4Part7Data } from './n4_part7';
import { n4Part8Data } from './n4_part8';
import { n4Part9Data } from './n4_part9';
import { n4Part10Data } from './n4_part10';
import { n4Part11Data } from './n4_part11';
import { jlptAdditions } from './jlptAdditions';
import { getJlptCoreLevel, JLPT_N4_CORE_ORDER, JLPT_N5_CORE_ORDER } from './jlptCore';
import type { JLPTLevel } from './jlptCore';

export interface KanjiComponent {
    kanji: string;
    meaning: string;
}

export interface Vocabulary {
    kanji: string;
    reading: string;
    meaning: string;
}

export interface KanjiInfo {
    id: string;
    kanji: string;
    hanviet: string;
    meaning: string;
    onyomi: string;
    kunyomi: string;
    level: JLPTLevel;
    isSupplemental?: boolean;
    components: KanjiComponent[];
    mnemonic: string;
    vocabularies: Vocabulary[];
}

const rawKanjiData: KanjiInfo[] = [
    // ==========================================
    // N5 KANJI (28 KANJI)
    // ==========================================
    { id: "ichi", kanji: "一", hanviet: "Nhất", meaning: "Số 1", onyomi: "イチ (ichi)", kunyomi: "ひと.つ (hito.tsu)", level: "N5", components: [{ kanji: "一", meaning: "Nhất" }], mnemonic: "Chỉ có MỘT nét gạch ngang, là số 1.", vocabularies: [{ kanji: "一つ", reading: "ひとつ (hitotsu)", meaning: "Một cái" }, { kanji: "一日", reading: "ついたち (tsuitachi)", meaning: "Mùng 1" }] },
    { id: "ni", kanji: "二", hanviet: "Nhị", meaning: "Số 2", onyomi: "ニ (ni)", kunyomi: "ふた.つ (futa.tsu)", level: "N5", components: [{ kanji: "二", meaning: "Nhị" }], mnemonic: "Hai nét gạch ngang, là số 2.", vocabularies: [{ kanji: "二つ", reading: "ふたつ (futatsu)", meaning: "Hai cái" }, { kanji: "二月", reading: "にがつ (nigatsu)", meaning: "Tháng 2" }] },
    { id: "san", kanji: "三", hanviet: "Tam", meaning: "Số 3", onyomi: "サン (san)", kunyomi: "みっ.つ (mit.tsu)", level: "N5", components: [{ kanji: "一", meaning: "Nhất" }, { kanji: "二", meaning: "Nhị" }], mnemonic: "Ba nét gạch ngang, là số 3.", vocabularies: [{ kanji: "三つ", reading: "みっつ (mittsu)", meaning: "Ba cái" }, { kanji: "三日", reading: "みっか (mikka)", meaning: "Mùng 3" }] },
    { id: "yon", kanji: "四", hanviet: "Tứ", meaning: "Số 4", onyomi: "シ (shi)", kunyomi: "よっ.つ (yot.tsu), よん (yon)", level: "N5", components: [{ kanji: "囗", meaning: "Vi" }, { kanji: "儿", meaning: "Nhân" }], mnemonic: "NGƯỜI (儿) bị nhốt trong 4 bức tường (囗).", vocabularies: [{ kanji: "四つ", reading: "よっつ (yottsu)", meaning: "Bốn cái" }, { kanji: "四月", reading: "しがつ (shigatsu)", meaning: "Tháng 4" }] },
    { id: "go", kanji: "五", hanviet: "Ngũ", meaning: "Số 5", onyomi: "ゴ (go)", kunyomi: "いつ.つ (itsu.tsu)", level: "N5", components: [{ kanji: "二", meaning: "Nhị" }, { kanji: "丨", meaning: "Cổn" }], mnemonic: "Năm ngón tay đan vào nhau.", vocabularies: [{ kanji: "五つ", reading: "いつつ (itsutsu)", meaning: "Năm cái" }, { kanji: "五日", reading: "いつか (itsuka)", meaning: "Mùng 5" }] },
    { id: "roku", kanji: "六", hanviet: "Lục", meaning: "Số 6", onyomi: "ロク (roku)", kunyomi: "むっ.つ (mut.tsu)", level: "N5", components: [{ kanji: "亠", meaning: "Đầu" }, { kanji: "八", meaning: "Bát" }], mnemonic: "ĐỘI (亠) mũ số TÁM (八) biến thành số SÁU.", vocabularies: [{ kanji: "六つ", reading: "むっつ (muttsu)", meaning: "Sáu cái" }, { kanji: "六日", reading: "むいか (muika)", meaning: "Mùng 6" }] },
    { id: "nana", kanji: "七", hanviet: "Thất", meaning: "Số 7", onyomi: "シチ (shichi)", kunyomi: "なな.つ (nana.tsu)", level: "N5", components: [{ kanji: "一", meaning: "Nhất" }, { kanji: "乚", meaning: "Ất" }], mnemonic: "Giống hình số 7 bị lật ngược.", vocabularies: [{ kanji: "七つ", reading: "ななつ (nanatsu)", meaning: "Bảy cái" }, { kanji: "七月", reading: "しちがつ (shichigatsu)", meaning: "Tháng 7" }] },
    { id: "hachi", kanji: "八", hanviet: "Bát", meaning: "Số 8", onyomi: "ハチ (hachi)", kunyomi: "やっ.つ (yat.tsu)", level: "N5", components: [{ kanji: "八", meaning: "Bát" }], mnemonic: "Hai nét phẩy tách rời nhau giống bị bát (bỏ) ra.", vocabularies: [{ kanji: "八つ", reading: "やっつ (yattsu)", meaning: "Tám cái" }, { kanji: "八日", reading: "ようか (youka)", meaning: "Mùng 8" }] },
    { id: "kyuu", kanji: "九", hanviet: "Cửu", meaning: "Số 9", onyomi: "キュウ (kyuu)", kunyomi: "ここの.つ (kokono.tsu)", level: "N5", components: [{ kanji: "乙", meaning: "Ất" }], mnemonic: "Người đang hít đất 9 lần.", vocabularies: [{ kanji: "九つ", reading: "ここのつ (kokonotsu)", meaning: "Chín cái" }, { kanji: "九月", reading: "くがつ (kugatsu)", meaning: "Tháng 9" }] },
    { id: "juu", kanji: "十", hanviet: "Thập", meaning: "Số 10", onyomi: "ジュウ (juu)", kunyomi: "とお (too)", level: "N5", components: [{ kanji: "十", meaning: "Thập" }], mnemonic: "Giống hình chữ thập (dấu cộng).", vocabularies: [{ kanji: "十", reading: "とお (too)", meaning: "Mười cái" }, { kanji: "十日", reading: "とおか (tooka)", meaning: "Mùng 10" }] },
    
    { id: "hi", kanji: "日", hanviet: "Nhật", meaning: "Mặt trời, Ngày", onyomi: "ニチ (nichi)", kunyomi: "ひ (hi)", level: "N5", components: [{ kanji: "日", meaning: "Nhật" }], mnemonic: "Hình ảnh mặt trời mọc, bên trong có 1 vệt sáng.", vocabularies: [{ kanji: "日本", reading: "にほん (nihon)", meaning: "Nhật Bản" }, { kanji: "日曜日", reading: "にちようび (nichiyoubi)", meaning: "Chủ nhật" }] },
    { id: "tsuki", kanji: "月", hanviet: "Nguyệt", meaning: "Mặt trăng, Tháng", onyomi: "ゲツ (getsu)", kunyomi: "つき (tsuki)", level: "N5", components: [{ kanji: "月", meaning: "Nguyệt" }], mnemonic: "Hình ảnh mặt trăng khuyết.", vocabularies: [{ kanji: "月曜日", reading: "げつようび (getsuyoubi)", meaning: "Thứ hai" }, { kanji: "一月", reading: "いちがつ (ichigatsu)", meaning: "Tháng 1" }] },
    { id: "hi_fire", kanji: "火", hanviet: "Hỏa", meaning: "Lửa", onyomi: "カ (ka)", kunyomi: "ひ (hi)", level: "N5", components: [{ kanji: "火", meaning: "Hỏa" }], mnemonic: "Hình ảnh ngọn lửa đang bùng cháy dữ dội.", vocabularies: [{ kanji: "火曜日", reading: "かようび (kayoubi)", meaning: "Thứ ba" }, { kanji: "花火", reading: "はなび (hanabi)", meaning: "Pháo hoa" }] },
    { id: "mizu", kanji: "水", hanviet: "Thủy", meaning: "Nước", onyomi: "スイ (sui)", kunyomi: "みず (mizu)", level: "N5", components: [{ kanji: "水", meaning: "Thủy" }], mnemonic: "Dòng nước đang chảy xuống, tỏa ra 2 bên.", vocabularies: [{ kanji: "水曜日", reading: "すいようび (suiyoubi)", meaning: "Thứ tư" }, { kanji: "水", reading: "みず (mizu)", meaning: "Nước" }] },
    { id: "ki", kanji: "木", hanviet: "Mộc", meaning: "Cây", onyomi: "モク (moku)", kunyomi: "き (ki)", level: "N5", components: [{ kanji: "木", meaning: "Mộc" }], mnemonic: "Hình ảnh cái cây có rễ cắm sâu xuống đất.", vocabularies: [{ kanji: "木曜日", reading: "もくようび (mokuyoubi)", meaning: "Thứ năm" }, { kanji: "木", reading: "き (ki)", meaning: "Cây" }] },
    { id: "kane", kanji: "金", hanviet: "Kim", meaning: "Vàng, Tiền", onyomi: "キン (kin)", kunyomi: "かね (kane)", level: "N5", components: [{ kanji: "人", meaning: "Nhân" }, { kanji: "王", meaning: "Vương" }], mnemonic: "Dưới mái nhà, VUA (王) giấu VÀNG (金).", vocabularies: [{ kanji: "金曜日", reading: "きんようび (kinyoubi)", meaning: "Thứ sáu" }, { kanji: "お金", reading: "おかね (okane)", meaning: "Tiền bạc" }] },
    { id: "tsuchi", kanji: "土", hanviet: "Thổ", meaning: "Đất", onyomi: "ド (do)", kunyomi: "つち (tsuchi)", level: "N5", components: [{ kanji: "土", meaning: "Thổ" }], mnemonic: "Một mầm cây mọc nhô lên từ mặt ĐẤT.", vocabularies: [{ kanji: "土曜日", reading: "どようび (doyoubi)", meaning: "Thứ bảy" }, { kanji: "土地", reading: "とち (tochi)", meaning: "Đất đai" }] },

    { id: "yama", kanji: "山", hanviet: "Sơn", meaning: "Núi", onyomi: "サン (san)", kunyomi: "やま (yama)", level: "N5", components: [{ kanji: "山", meaning: "Sơn" }], mnemonic: "Hình ảnh 3 ngọn núi xếp cạnh nhau.", vocabularies: [{ kanji: "山", reading: "やま (yama)", meaning: "Núi" }, { kanji: "富士山", reading: "ふじさん (fujisan)", meaning: "Núi Phú Sĩ" }] },
    { id: "kawa", kanji: "川", hanviet: "Xuyên", meaning: "Sông", onyomi: "セン (sen)", kunyomi: "かわ (kawa)", level: "N5", components: [{ kanji: "川", meaning: "Xuyên" }], mnemonic: "Hình ảnh dòng sông chảy uốn lượn.", vocabularies: [{ kanji: "川", reading: "かわ (kawa)", meaning: "Dòng sông" }, { kanji: "天の川", reading: "あまのがわ (amanogawa)", meaning: "Dải Ngân Hà" }] },
    { id: "ue", kanji: "上", hanviet: "Thượng", meaning: "Phía trên", onyomi: "ジョウ (jou)", kunyomi: "うえ (ue)", level: "N5", components: [{ kanji: "一", meaning: "Nhất" }, { kanji: "卜", meaning: "Bốc" }], mnemonic: "Một gạch thẳng đứng nằm TRÊN gạch ngang.", vocabularies: [{ kanji: "上", reading: "うえ (ue)", meaning: "Phía trên" }, { kanji: "上がる", reading: "あがる (agaru)", meaning: "Đi lên, tăng lên" }] },
    { id: "shita", kanji: "下", hanviet: "Hạ", meaning: "Phía dưới", onyomi: "カ (ka)", kunyomi: "した (shita)", level: "N5", components: [{ kanji: "一", meaning: "Nhất" }, { kanji: "卜", meaning: "Bốc" }], mnemonic: "Một gạch thẳng đứng đâm XUỐNG DƯỚI gạch ngang.", vocabularies: [{ kanji: "下", reading: "した (shita)", meaning: "Phía dưới" }, { kanji: "下がる", reading: "さがる (sagaru)", meaning: "Đi xuống, giảm" }] },
    
    { id: "gaku", kanji: "学", hanviet: "Học", meaning: "Học tập", onyomi: "ガク (gaku)", kunyomi: "まな.ぶ (mana.bu)", level: "N5", components: [{ kanji: "⺍", meaning: "Tóc búi" }, { kanji: "冖", meaning: "Trùm" }, { kanji: "子", meaning: "Tử (Con)" }], mnemonic: "Đứa TRẺ (子) được TRÙM (冖) khăn, búi TÓC gọn để đi HỌC.", vocabularies: [{ kanji: "学校", reading: "がっこう (gakkou)", meaning: "Trường học" }, { kanji: "学生", reading: "がくせい (gakusei)", meaning: "Học sinh" }] },
    { id: "kou", kanji: "校", hanviet: "Hiệu", meaning: "Trường học", onyomi: "コウ (kou)", kunyomi: "Không có", level: "N5", components: [{ kanji: "木", meaning: "Mộc" }, { kanji: "交", meaning: "Giao" }], mnemonic: "Trường học bằng GỖ (木) là nơi học sinh GIAO (交) lưu.", vocabularies: [{ kanji: "学校", reading: "がっこう (gakkou)", meaning: "Trường học" }, { kanji: "校長", reading: "こうちょう (kouchou)", meaning: "Hiệu trưởng" }] },
    { id: "shoku", kanji: "食", hanviet: "Thực", meaning: "Ăn", onyomi: "ショク (shoku)", kunyomi: "た.べる (ta.beru)", level: "N5", components: [{ kanji: "𠆢", meaning: "Nhân" }, { kanji: "良", meaning: "Lương (Tốt)" }], mnemonic: "NGƯỜI (𠆢) đang ĂN những thức ăn RẤT NGON (良).", vocabularies: [{ kanji: "食べる", reading: "たべる (taberu)", meaning: "Ăn" }, { kanji: "食事", reading: "しょくじ (shokuji)", meaning: "Bữa ăn" }] },
    { id: "in", kanji: "飲", hanviet: "Ẩm", meaning: "Uống", onyomi: "イン (in)", kunyomi: "の.む (no.mu)", level: "N5", components: [{ kanji: "食", meaning: "Thực" }, { kanji: "欠", meaning: "Khiếm" }], mnemonic: "ĂN (食) xong thấy THIẾU (欠) nước thì phải UỐNG.", vocabularies: [{ kanji: "飲む", reading: "のむ (nomu)", meaning: "Uống" }, { kanji: "飲み物", reading: "のみもの (nomimono)", meaning: "Đồ uống" }] },
    { id: "mi", kanji: "見", hanviet: "Kiến", meaning: "Nhìn, Xem", onyomi: "ケン (ken)", kunyomi: "み.る (mi.ru)", level: "N5", components: [{ kanji: "目", meaning: "Mục (Mắt)" }, { kanji: "儿", meaning: "Nhân (Chân người)" }], mnemonic: "MẮT (目) mọc đôi CHÂN (儿) chạy đi XEM mọi thứ.", vocabularies: [{ kanji: "見る", reading: "みる (miru)", meaning: "Xem, nhìn" }, { kanji: "見せる", reading: "みせる (miseru)", meaning: "Cho xem" }] },
    { id: "kiku", kanji: "聞", hanviet: "Văn", meaning: "Nghe", onyomi: "ブン (bun)", kunyomi: "き.く (ki.ku)", level: "N5", components: [{ kanji: "門", meaning: "Môn (Cửa)" }, { kanji: "耳", meaning: "Nhĩ (Tai)" }], mnemonic: "Áp TAI (耳) vào CỬA (門) để NGHE lén.", vocabularies: [{ kanji: "聞く", reading: "きく (kiku)", meaning: "Nghe, hỏi" }, { kanji: "新聞", reading: "しんぶん (shinbun)", meaning: "Tờ báo" }] },
    { id: "kaku", kanji: "書", hanviet: "Thư", meaning: "Viết, Sách", onyomi: "ショ (sho)", kunyomi: "か.く (ka.ku)", level: "N5", components: [{ kanji: "聿", meaning: "Duật (Cây bút)" }, { kanji: "日", meaning: "Nhật" }], mnemonic: "Cầm BÚT (聿) VIẾT sách suốt cả NGÀY (日).", vocabularies: [{ kanji: "書く", reading: "かく (kaku)", meaning: "Viết" }, { kanji: "辞書", reading: "じしょ (jisho)", meaning: "Từ điển" }] },
    ...n5Part2Data,
    ...n5Part3Data,
    ...n5Part4Data,
    ...n5Part5Data,

    // ==========================================
    // N4 KANJI (15 KANJI)
    // ==========================================
    { id: "ken", kanji: "研", hanviet: "Nghiên", meaning: "Nghiên cứu, mài", onyomi: "ケン (ken)", kunyomi: "と.ぐ (to.gu)", level: "N4", components: [{ kanji: "石", meaning: "Thạch" }, { kanji: "幵", meaning: "Kiên" }], mnemonic: "Dùng ĐÁ mài cho BẰNG PHẲNG là quá trình NGHIÊN cứu.", vocabularies: [{ kanji: "研究", reading: "けんきゅう (kenkyuu)", meaning: "Nghiên cứu" }, { kanji: "研修", reading: "けんしゅう (kenshuu)", meaning: "Thực tập" }] },
    { id: "kyuu_study", kanji: "究", hanviet: "Cứu", meaning: "Nghiên cứu", onyomi: "キュウ (kyuu)", kunyomi: "きわ.める (kiwa.meru)", level: "N4", components: [{ kanji: "穴", meaning: "Huyệt (Cái hang)" }, { kanji: "九", meaning: "Cửu (Số 9)" }], mnemonic: "Chui vào HANG (穴) CỨU 9 (九) người.", vocabularies: [{ kanji: "研究", reading: "けんきゅう (kenkyuu)", meaning: "Nghiên cứu" }] },
    { id: "ben", kanji: "勉", hanviet: "Miễn", meaning: "Cố gắng, học", onyomi: "ベン (ben)", kunyomi: "つと.める (tsuto.meru)", level: "N4", components: [{ kanji: "免", meaning: "Miễn (Tránh)" }, { kanji: "力", meaning: "Lực (Sức mạnh)" }], mnemonic: "Dùng SỨC LỰC (力) ép bản thân HỌC để MIỄN (免) thi trượt.", vocabularies: [{ kanji: "勉強", reading: "べんきょう (benkyou)", meaning: "Học tập" }] },
    { id: "kyou", kanji: "強", hanviet: "Cường", meaning: "Khỏe, mạnh", onyomi: "キョウ (kyou)", kunyomi: "つよ.い (tsuyo.i)", level: "N4", components: [{ kanji: "弓", meaning: "Cung" }, { kanji: "虫", meaning: "Trùng (Côn trùng)" }], mnemonic: "Con CÔN TRÙNG (虫) bắn CUNG (弓) rất MẠNH (Cường).", vocabularies: [{ kanji: "強い", reading: "つよい (tsuyoi)", meaning: "Mạnh mẽ" }, { kanji: "勉強", reading: "べんきょう (benkyou)", meaning: "Học tập" }] },
    { id: "shirabe", kanji: "調", hanviet: "Điều", meaning: "Điều tra, âm điệu", onyomi: "チョウ (chou)", kunyomi: "しら.べる (shira.beru)", level: "N4", components: [{ kanji: "言", meaning: "Ngôn (Lời nói)" }, { kanji: "周", meaning: "Chu (Chu vi)" }], mnemonic: "Dùng LỜI NÓI (言) ĐIỀU tra một vòng XUNG QUANH (周).", vocabularies: [{ kanji: "調べる", reading: "しらべる (shiraberu)", meaning: "Điều tra, tra cứu" }, { kanji: "体調", reading: "たいちょう (taichou)", meaning: "Tình trạng sức khỏe" }] },
    { id: "hatara", kanji: "働", hanviet: "Động", meaning: "Làm việc", onyomi: "ドウ (dou)", kunyomi: "はたら.く (hatara.ku)", level: "N4", components: [{ kanji: "亻", meaning: "Nhân (Người)" }, { kanji: "動", meaning: "Động (Chuyển động)" }], mnemonic: "NGƯỜI (亻) phải CHUYỂN ĐỘNG (動) mới là ĐANG LÀM VIỆC.", vocabularies: [{ kanji: "働く", reading: "はたらく (hataraku)", meaning: "Làm việc" }, { kanji: "労働", reading: "ろうどう (roudou)", meaning: "Lao động" }] },
    { id: "tomo", kanji: "友", hanviet: "Hữu", meaning: "Bạn bè", onyomi: "ユウ (yuu)", kunyomi: "とも (tomo)", level: "N4", components: [{ kanji: "ナ", meaning: "Bàn tay" }, { kanji: "又", meaning: "Hựu (Lại)" }], mnemonic: "Hai bàn TAY đan vào nhau thể hiện tình BẠN BÈ.", vocabularies: [{ kanji: "友達", reading: "ともだち (tomodachi)", meaning: "Bạn bè" }, { kanji: "親友", reading: "しんゆう (shinyuu)", meaning: "Bạn thân" }] },
    { id: "in_hospital", kanji: "院", hanviet: "Viện", meaning: "Viện, tòa nhà", onyomi: "イン (in)", kunyomi: "Không có", level: "N4", components: [{ kanji: "阝", meaning: "Phụ (Gò đất)" }, { kanji: "完", meaning: "Hoàn (Hoàn thành)" }], mnemonic: "Trèo qua GÒ ĐẤT (阝) để hoàn thành (完) việc xây BỆNH VIỆN.", vocabularies: [{ kanji: "病院", reading: "びょういん (byouin)", meaning: "Bệnh viện" }, { kanji: "大学院", reading: "だいがくいん (daigakuin)", meaning: "Cao học" }] },
    { id: "byou", kanji: "病", hanviet: "Bệnh", meaning: "Ốm, Bệnh", onyomi: "ビョウ (byou)", kunyomi: "やまい (yamai)", level: "N4", components: [{ kanji: "疒", meaning: "Nạch (Giường bệnh)" }, { kanji: "丙", meaning: "Bính" }], mnemonic: "Nằm trên GIƯỜNG BỆNH (疒) là đang bị BỆNH.", vocabularies: [{ kanji: "病院", reading: "びょういん (byouin)", meaning: "Bệnh viện" }, { kanji: "病気", reading: "びょうき (byouki)", meaning: "Ốm đau" }] },
    { id: "i", kanji: "医", hanviet: "Y", meaning: "Y học", onyomi: "イ (i)", kunyomi: "Không có", level: "N4", components: [{ kanji: "匚", meaning: "Hệ (Cái hộp)" }, { kanji: "矢", meaning: "Thỉ (Mũi tên)" }], mnemonic: "Đựng MŨI TÊN (矢) trong HỘP (匚) của bác sĩ Y KHOA.", vocabularies: [{ kanji: "医者", reading: "いしゃ (isha)", meaning: "Bác sĩ" }, { kanji: "医学", reading: "いがく (igaku)", meaning: "Y học" }] },
    { id: "mono", kanji: "者", hanviet: "Giả", meaning: "Người", onyomi: "シャ (sha)", kunyomi: "もの (mono)", level: "N4", components: [{ kanji: "老", meaning: "Lão (Già)" }, { kanji: "日", meaning: "Nhật" }], mnemonic: "NGƯỜI GIÀ (老) phơi nắng mỗi NGÀY (日).", vocabularies: [{ kanji: "医者", reading: "いしゃ (isha)", meaning: "Bác sĩ" }, { kanji: "若者", reading: "わかもの (wakamono)", meaning: "Người trẻ" }] },
    { id: "nori", kanji: "乗", hanviet: "Thừa", meaning: "Lên xe", onyomi: "ジョウ (jou)", kunyomi: "の.る (no.ru)", level: "N4", components: [{ kanji: "禾", meaning: "Hòa (Lúa)" }, { kanji: "北", meaning: "Bắc" }], mnemonic: "LÊN XE chở lúa (禾) đi về hướng BẮC (北).", vocabularies: [{ kanji: "乗る", reading: "のる (noru)", meaning: "Lên xe" }, { kanji: "乗り物", reading: "のりもの (norimono)", meaning: "Phương tiện đi lại" }] },
    { id: "ori", kanji: "降", hanviet: "Giáng", meaning: "Xuống xe, rơi xuống", onyomi: "コウ (kou)", kunyomi: "お.りる (o.riru)", level: "N4", components: [{ kanji: "阝", meaning: "Phụ (Gò đất)" }, { kanji: "夂", meaning: "Trĩ (Bám theo)" }, { kanji: "牛", meaning: "Ngưu (Bò)" }], mnemonic: "XUỐNG XE đi theo (夂) con bò (牛) ở gò đất (阝).", vocabularies: [{ kanji: "降りる", reading: "おりる (oriru)", meaning: "Xuống xe" }, { kanji: "降る", reading: "ふる (furu)", meaning: "Rơi (Mưa, tuyết)" }] },
    { id: "uta", kanji: "歌", hanviet: "Ca", meaning: "Bài hát", onyomi: "カ (ka)", kunyomi: "うた (uta)", level: "N4", components: [{ kanji: "可", meaning: "Khả (Có thể)" }, { kanji: "欠", meaning: "Khiếm (Thiếu)" }], mnemonic: "CÓ THỂ (可) HÁT dù đang THIẾU (欠) hơi.", vocabularies: [{ kanji: "歌", reading: "うた (uta)", meaning: "Bài hát" }, { kanji: "歌う", reading: "うたう (utau)", meaning: "Hát" }] },
    { id: "oto", kanji: "音", hanviet: "Âm", meaning: "Âm thanh", onyomi: "オン (on)", kunyomi: "おと (oto)", level: "N4", components: [{ kanji: "立", meaning: "Lập (Đứng)" }, { kanji: "日", meaning: "Nhật (Mặt trời)" }], mnemonic: "ĐỨNG (立) dưới MẶT TRỜI (日) phát ra ÂM THANH.", vocabularies: [{ kanji: "音", reading: "おと (oto)", meaning: "Âm thanh" }, { kanji: "音楽", reading: "おんがく (ongaku)", meaning: "Âm nhạc" }] },
    ...n4Part1Data,
    ...n4Part2Data,
    ...n4Part3Data,
    ...n4Part4Data,
    ...n4Part5Data,
    ...n4Part6Data,
    ...n4Part7Data,
    ...n4Part8Data,
    ...n4Part9Data,
    ...n4Part10Data,
    ...n4Part11Data,
    ...jlptAdditions,
];

const coreOrder = new Map(
    [...JLPT_N5_CORE_ORDER, ...JLPT_N4_CORE_ORDER].map((kanji, index) => [kanji, index]),
);

// Hợp nhất các bản ghi trùng Kanji. Nếu một chữ có nhiều bản ghi, ưu tiên bản
// được gắn đúng cấp độ lõi; các chữ ngoài bộ lõi vẫn được giữ làm nội dung bổ sung.
const normalizedByKanji = new Map<string, KanjiInfo>();
for (const item of rawKanjiData) {
    const existing = normalizedByKanji.get(item.kanji);
    const coreLevel = getJlptCoreLevel(item.kanji);
    const shouldReplace = !existing || (coreLevel === item.level && existing.level !== coreLevel);
    if (shouldReplace) normalizedByKanji.set(item.kanji, item);
}

const usedIds = new Set<string>();
export const kanjiData: KanjiInfo[] = [...normalizedByKanji.values()]
    .map((item) => {
        const coreLevel = getJlptCoreLevel(item.kanji);
        let id = item.id;
        if (usedIds.has(id)) {
            id = `${item.id}-${item.kanji.codePointAt(0)?.toString(16)}`;
        }
        usedIds.add(id);

        return {
            ...item,
            id,
            level: coreLevel ?? item.level,
            isSupplemental: coreLevel === null,
        };
    })
    .sort((a, b) => {
        const aOrder = coreOrder.get(a.kanji);
        const bOrder = coreOrder.get(b.kanji);
        if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
        if (aOrder !== undefined) return -1;
        if (bOrder !== undefined) return 1;
        return a.kanji.localeCompare(b.kanji, 'ja');
    });
