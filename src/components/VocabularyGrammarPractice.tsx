"use client";

import { useEffect, useMemo, useState } from 'react';
import type { VocabularyInfo } from '@/data/vocabulary';
import { useJapaneseSpeech } from '@/hooks/useJapaneseSpeech';
import { analyzeJapaneseAnswer, commitRomajiInput, convertRomajiInput } from '@/lib/japaneseInput';
import { getAdjectiveForms, getNounParticleExercise, getTransitivityPair, getVerbForms } from '@/lib/japaneseGrammar';
import type { StudySettings } from '@/lib/study';
import { JapaneseAnswerFeedback } from './JapaneseAnswerFeedback';

type Props = {
  item: VocabularyInfo;
  settings: StudySettings;
};

const particles = ['は', 'が', 'を', 'に', 'で', 'へ'];

export function VocabularyGrammarPractice({ item, settings }: Props) {
  const forms = useMemo(() => item.partOfSpeech === 'verb' ? getVerbForms(item) : getAdjectiveForms(item), [item]);
  const particleExercise = useMemo(() => getNounParticleExercise(item), [item]);
  const [formIndex, setFormIndex] = useState(0);
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [result, setResult] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [particleValue, setParticleValue] = useState('');
  const [particleResult, setParticleResult] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [revealParticle, setRevealParticle] = useState(false);
  const speak = useJapaneseSpeech(settings.speechRate);
  const activeForm = forms[formIndex] ?? forms[0];
  const transitivity = forms.length > 0 ? getTransitivityPair(forms[0].value) : null;

  const resetForm = (nextIndex = formIndex) => {
    setFormIndex(nextIndex);
    setValue('');
    setSubmitted('');
    setResult('idle');
    setRevealAnswer(false);
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      resetForm(0);
      setParticleValue('');
      setParticleResult('idle');
      setRevealParticle(false);
      setShowReference(false);
    });
    return () => cancelAnimationFrame(frame);
  // The vocabulary id is the intentional reset boundary.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const checkForm = () => {
    if (!activeForm || !value.trim()) return;
    const committed = commitRomajiInput(value);
    const analysis = analyzeJapaneseAnswer(committed, [activeForm.value, activeForm.reading]);
    setValue(committed);
    setSubmitted(committed);
    setResult(analysis.correct ? 'correct' : 'incorrect');
  };

  const checkParticle = (candidate = particleValue) => {
    if (!particleExercise || !candidate.trim()) return;
    const normalized = candidate.trim();
    setParticleValue(normalized);
    setParticleResult(particleExercise.answers.includes(normalized) ? 'correct' : 'incorrect');
  };

  if (forms.length === 0 && !particleExercise) return null;

  if (particleExercise) {
    return (
      <section className="mb-5 rounded-2xl border border-violet-100 dark:border-violet-900/40 bg-violet-50/60 dark:bg-violet-900/10 p-4 sm:p-5">
        <h3 className="font-black"><i className="fas fa-puzzle-piece text-violet-500 mr-2"></i>Luyện danh từ với trợ từ</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chọn hoặc nhập は・が・を・に・で・へ để hoàn thành cụm.</p>
        <div className="mt-4 rounded-xl bg-white dark:bg-slate-800 p-4">
          <div className="font-japanese text-2xl font-black">{particleExercise.sentence}</div>
          <div className="text-xs text-slate-500 mt-1">{particleExercise.reading}</div>
          <div className="text-sm font-bold mt-2">{particleExercise.meaning}</div>
        </div>
        <div className="grid grid-cols-6 gap-2 mt-3">{particles.map((particle) => <button key={particle} type="button" disabled={particleResult === 'correct' || revealParticle} onClick={() => { setParticleValue(particle); checkParticle(particle); }} className={`py-2 rounded-xl border font-japanese text-lg font-black ${particleValue === particle ? 'border-violet-500 bg-violet-500 text-white' : 'border-violet-100 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>{particle}</button>)}</div>
        <form onSubmit={(event) => { event.preventDefault(); checkParticle(); }} className="mt-3 flex gap-2">
          <input value={particleValue} disabled={particleResult === 'correct' || revealParticle} onChange={(event) => { setParticleValue(event.target.value); setParticleResult('idle'); }} maxLength={1} aria-label="Nhập trợ từ" className="w-20 rounded-xl border border-violet-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-center font-japanese text-xl" />
          <button className="px-4 py-2 rounded-xl bg-violet-600 text-white font-black">Kiểm tra</button>
        </form>
        {particleResult === 'correct' && <div className="mt-3 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-3 font-bold"><i className="fas fa-circle-check mr-2"></i>Đúng! Trợ từ {particleValue} phù hợp với câu này.</div>}
        {particleResult === 'incorrect' && <div className="mt-3 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3"><b>Bạn đã chọn:</b> <span className="font-japanese text-xl">{particleValue}</span><div className="mt-3 flex gap-2"><button type="button" onClick={() => { setParticleValue(''); setParticleResult('idle'); setRevealParticle(false); }} className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold">Thử lại</button>{!revealParticle && <button type="button" onClick={() => setRevealParticle(true)} className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 font-bold">Xem đáp án</button>}</div>{revealParticle && <div className="mt-3 font-bold">Đáp án: <span className="font-japanese text-xl">{particleExercise.answers.join(' hoặc ')}</span></div>}</div>}
      </section>
    );
  }

  return (
    <section className="mb-5 rounded-2xl border border-orange-100 dark:border-orange-900/40 bg-orange-50/60 dark:bg-orange-900/10 p-4 sm:p-5">
      <h3 className="font-black"><i className="fas fa-table-cells text-orange-500 mr-2"></i>{item.partOfSpeech === 'verb' ? 'Luyện biến đổi động từ' : `Luyện tính từ ${item.adjectiveType === 'na' ? 'な' : 'い'}`}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chọn một dạng rồi tự gõ đáp án trước khi mở bảng tham khảo.</p>
      {transitivity && <div className="mt-3 inline-flex rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-black text-orange-700 dark:text-orange-300">{transitivity.type} · Cặp tương ứng: <span className="font-japanese ml-1">{transitivity.counterpart}</span></div>}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">{forms.map((form, index) => <button key={form.key} type="button" onClick={() => resetForm(index)} className={`shrink-0 px-3 py-2 rounded-lg text-xs font-black ${formIndex === index ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700'}`}>{form.label}</button>)}</div>
      {activeForm && <div className="mt-2 rounded-xl bg-white dark:bg-slate-800 p-4"><div className="text-xs uppercase tracking-wider font-black text-orange-500">Hãy nhập: {activeForm.label}</div><div className="mt-1 font-bold">{item.meaning}</div><form onSubmit={(event) => { event.preventDefault(); checkForm(); }} className="mt-3 flex flex-col sm:flex-row gap-2"><input value={value} disabled={result === 'correct' || revealAnswer} onChange={(event) => { setValue(convertRomajiInput(event.target.value)); setResult('idle'); }} placeholder="Kanji, Kana hoặc Romaji" className="min-w-0 flex-1 rounded-xl border border-orange-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 px-4 py-3 font-japanese" /><button className="px-5 py-3 rounded-xl bg-orange-500 text-white font-black">Kiểm tra</button></form></div>}
      {result === 'correct' && activeForm && <div className="mt-3 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-3 font-bold"><i className="fas fa-circle-check mr-2"></i>Chính xác: <span className="font-japanese text-xl">{activeForm.value}</span></div>}
      {result === 'incorrect' && activeForm && <JapaneseAnswerFeedback input={submitted} acceptedAnswers={[activeForm.value, activeForm.reading]} revealAnswer={revealAnswer} onRetry={() => resetForm(formIndex)} onReveal={() => setRevealAnswer(true)} />}
      <button type="button" onClick={() => setShowReference((current) => !current)} className="mt-4 w-full flex items-center justify-between rounded-xl border border-orange-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 font-bold"><span>Bảng tham khảo</span><i className={`fas fa-chevron-${showReference ? 'up' : 'down'}`}></i></button>
      {showReference && <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">{forms.map((form) => <button key={form.key} type="button" onClick={() => speak(form.value)} className="text-left bg-white dark:bg-slate-800 border border-orange-100 dark:border-slate-700 rounded-xl p-3"><span className="block text-[11px] uppercase font-black text-orange-500">{form.label}</span><span className="font-japanese text-xl font-black">{form.value}</span><span className="block text-xs text-slate-400">{form.reading}</span></button>)}</div>}
    </section>
  );
}
