"use client";

import { useMemo, useState } from 'react';
import type { KanjiInfo } from '@/data/kanji';

type Props = {
  open: boolean;
  data: KanjiInfo[];
  favorites: string[];
  onClose: () => void;
  onOpenKanji: (kanji: KanjiInfo) => void;
  onToggleFavorite: (id: string) => void;
};

export function SearchModal({ open, data, favorites, onClose, onOpenKanji, onToggleFavorite }: Props) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return data.filter((item) => item.kanji.includes(query.trim())
      || item.hanviet.toLowerCase().includes(normalized)
      || item.meaning.toLowerCase().includes(normalized)
      || item.onyomi.toLowerCase().includes(normalized)
      || item.kunyomi.toLowerCase().includes(normalized)
      || item.vocabularies.some((vocabulary) => vocabulary.kanji.includes(query.trim()) || vocabulary.meaning.toLowerCase().includes(normalized)))
      .slice(0, 30);
  }, [data, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm p-4 sm:p-8 flex items-start justify-center" onClick={onClose}>
      <section role="dialog" aria-modal="true" aria-label="Tra cứu Kanji" onClick={(event) => event.stopPropagation()} className="w-full max-w-3xl max-h-[88vh] overflow-hidden bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700"><i className="fas fa-search text-slate-400"></i><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kanji, Hán Việt, nghĩa, cách đọc hoặc từ vựng..." aria-label="Từ khóa tra cứu" className="flex-1 bg-transparent outline-none text-lg" /><button onClick={onClose} aria-label="Đóng tra cứu" className="w-9 h-9"><i className="fas fa-xmark"></i></button></div>
        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4">
          {!query.trim() && <div className="text-center text-slate-400 py-16"><i className="fas fa-book-open text-4xl mb-3"></i><p>Tra cứu trong {data.length} chữ Kanji và từ vựng liên quan.</p></div>}
          {query.trim() && results.length === 0 && <div className="text-center text-slate-400 py-16">Không tìm thấy kết quả phù hợp.</div>}
          <div className="space-y-2">{results.map((item) => <article key={item.id} className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3"><button onClick={() => onOpenKanji(item)} className="flex-1 text-left flex items-center gap-4 min-w-0"><span className="w-16 h-16 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-japanese text-4xl font-black">{item.kanji}</span><span className="min-w-0"><span className="flex items-center gap-2"><b className="uppercase">{item.hanviet}</b><span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{item.level}</span>{item.isSupplemental && <span className="text-xs text-orange-500">Mở rộng</span>}</span><span className="block text-sm text-slate-600 dark:text-slate-300 truncate">{item.meaning}</span><span className="block text-xs text-slate-400 truncate mt-1">{item.onyomi} • {item.kunyomi}</span></span></button><button onClick={() => onToggleFavorite(item.id)} aria-label={`Yêu thích ${item.kanji}`} className={`w-10 h-10 rounded-full ${favorites.includes(item.id) ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}><i className={`${favorites.includes(item.id) ? 'fas' : 'far'} fa-heart`}></i></button></article>)}</div>
        </div>
      </section>
    </div>
  );
}
