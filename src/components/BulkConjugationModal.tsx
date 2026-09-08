"use client";

import { useEffect, useMemo, useState } from 'react';
import type { JLPTLevel } from '@/data/jlptCore';
import type { VocabularyInfo } from '@/data/vocabulary';
import {
  conjugationFormOptions,
  defaultConjugationDrillConfig,
  getEligibleConjugationVerbs,
  type ConjugationDrillConfig,
  type ConjugationFormKey,
  type ConjugationLevel,
  type ConjugationQuestionCount,
} from '@/lib/conjugationDrill';
import { verbGroupLabels, type VerbGroup } from '@/lib/japaneseGrammar';

type Props = {
  initialLevel: JLPTLevel;
  pool: VocabularyInfo[];
  onClose: () => void;
  onStart: (config: ConjugationDrillConfig) => void;
};

const levels: { value: ConjugationLevel; label: string }[] = [
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' },
  { value: 'all', label: 'Tất cả' },
];

const groups: { value: VerbGroup; label: string; description: string }[] = [
  { value: 'godan', label: 'Nhóm 1', description: 'Godan' },
  { value: 'ichidan', label: 'Nhóm 2', description: 'Ichidan' },
  { value: 'irregular', label: 'Nhóm 3', description: 'Bất quy tắc' },
];

const questionCounts: { value: ConjugationQuestionCount; label: string }[] = [
  { value: 10, label: '10 câu' },
  { value: 20, label: '20 câu' },
  { value: 'endless', label: 'Luyện vô hạn' },
];

const toggleValue = <T,>(values: T[], value: T) => (
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
);

export function BulkConjugationModal({ initialLevel, pool, onClose, onStart }: Props) {
  const [config, setConfig] = useState<ConjugationDrillConfig>(() => defaultConjugationDrillConfig(initialLevel));
  const eligibleVerbs = useMemo(() => getEligibleConjugationVerbs(pool, config), [config, pool]);
  const availablePairs = eligibleVerbs.length * config.forms.length;
  const canStart = config.groups.length > 0 && config.forms.length > 0 && eligibleVerbs.length > 0;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-slate-950/65 p-0 sm:p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="bulk-conjugation-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="w-full max-w-3xl max-h-[94dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-5 py-4 sm:px-7 backdrop-blur">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Luyện phản xạ tổng hợp</div>
            <h1 id="bulk-conjugation-title" className="mt-1 text-xl sm:text-2xl font-black">Đấu trường biến đổi Động từ</h1>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng cài đặt" className="h-11 w-11 shrink-0 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"><i className="fas fa-xmark"></i></button>
        </header>

        <div className="space-y-7 p-5 sm:p-7">
          <fieldset>
            <legend className="mb-3 font-black">1. Cấp độ</legend>
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5">
              {levels.map((level) => <button key={level.value} type="button" onClick={() => setConfig((current) => ({ ...current, level: level.value }))} className={`rounded-xl px-3 py-2.5 font-black transition-colors ${config.level === level.value ? 'bg-white dark:bg-slate-700 text-orange-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`} aria-pressed={config.level === level.value}>{level.label}</button>)}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 font-black">2. Nhóm động từ</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {groups.map((group) => {
                const checked = config.groups.includes(group.value);
                return <label key={group.value} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${checked ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/20' : 'border-slate-200 dark:border-slate-700'}`}>
                  <input type="checkbox" checked={checked} onChange={() => setConfig((current) => ({ ...current, groups: toggleValue(current.groups, group.value) }))} className="h-5 w-5 accent-orange-500" />
                  <span><b className="block">{group.label}</b><span className="text-xs text-slate-500 dark:text-slate-400">{group.description}</span></span>
                </label>;
              })}
            </div>
            {config.groups.length === 0 && <p className="mt-2 text-sm font-bold text-red-600">Hãy chọn ít nhất một nhóm động từ.</p>}
          </fieldset>

          <fieldset>
            <legend className="mb-3 font-black">3. Các thể cần luyện</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {conjugationFormOptions.map((form) => {
                const checked = config.forms.includes(form.key);
                return <label key={form.key} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${checked ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-700'}`}>
                  <input type="checkbox" checked={checked} onChange={() => setConfig((current) => ({ ...current, forms: toggleValue<ConjugationFormKey>(current.forms, form.key) }))} className="h-5 w-5 accent-blue-500" />
                  <span className="font-bold">{form.label}</span>
                </label>;
              })}
            </div>
            {config.forms.length === 0 && <p className="mt-2 text-sm font-bold text-red-600">Hãy chọn ít nhất một thể cần luyện.</p>}
          </fieldset>

          <fieldset>
            <legend className="mb-3 font-black">4. Số lượng câu</legend>
            <div className="grid grid-cols-3 gap-2">
              {questionCounts.map((count) => <button key={String(count.value)} type="button" onClick={() => setConfig((current) => ({ ...current, questionCount: count.value }))} className={`rounded-xl border px-2 py-3 text-sm font-black transition-colors ${config.questionCount === count.value ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`} aria-pressed={config.questionCount === count.value}>{count.label}</button>)}
            </div>
          </fieldset>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-bold text-slate-500 dark:text-slate-400">Kho phù hợp</span><span className="font-black text-lg">{eligibleVerbs.length} động từ · {availablePairs} cặp luyện</span></div>
            {eligibleVerbs.length > 0 && <p className="mt-1 text-xs text-slate-500">Gồm {config.groups.map((group) => verbGroupLabels[group]).join(' · ')}.</p>}
            {config.groups.length > 0 && config.forms.length > 0 && eligibleVerbs.length === 0 && <p className="mt-2 font-bold text-red-600">Không có động từ phù hợp với bộ lọc này.</p>}
          </div>

          <button type="button" disabled={!canStart} onClick={() => onStart(config)} className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4 text-lg font-black text-white shadow-lg shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40"><i className="fas fa-fire mr-2"></i>Bắt đầu luyện tập</button>
        </div>
      </section>
    </div>
  );
}
