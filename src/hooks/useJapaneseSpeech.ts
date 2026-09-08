"use client";

import { useCallback, useEffect, useRef } from 'react';

const selectJapaneseVoice = (voices: SpeechSynthesisVoice[]) => {
  const japaneseVoices = voices.filter((voice) => voice.lang.toLocaleLowerCase().startsWith('ja'));
  return japaneseVoices.find((voice) => voice.lang.toLocaleLowerCase() === 'ja-jp' && voice.localService)
    ?? japaneseVoices.find((voice) => voice.lang.toLocaleLowerCase() === 'ja-jp')
    ?? japaneseVoices.find((voice) => /nanami|haruka|ayumi|google.*日本語|japanese/i.test(voice.name))
    ?? japaneseVoices[0]
    ?? null;
};

export function useJapaneseSpeech(rate: number) {
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const pendingTextRef = useRef<string | null>(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const refreshVoices = () => {
      const voices = synth.getVoices();
      if (voices.length === 0) return;
      voicesRef.current = voices;
      if (pendingTextRef.current) {
        const text = pendingTextRef.current;
        pendingTextRef.current = null;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = rate;
        utterance.voice = selectJapaneseVoice(voices);
        synth.cancel();
        synth.resume();
        synth.speak(utterance);
      }
    };

    refreshVoices();
    synth.addEventListener('voiceschanged', refreshVoices);
    return () => synth.removeEventListener('voiceschanged', refreshVoices);
  }, [rate]);

  return useCallback((text: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    if (voices.length > 0) voicesRef.current = voices;

    if (voicesRef.current.length === 0) {
      pendingTextRef.current = text;
      synth.getVoices();
      window.setTimeout(() => {
        if (pendingTextRef.current !== text) return;
        pendingTextRef.current = null;
        const fallback = new SpeechSynthesisUtterance(text);
        fallback.lang = 'ja-JP';
        fallback.rate = rate;
        synth.cancel();
        synth.resume();
        synth.speak(fallback);
      }, 800);
      return;
    }

    pendingTextRef.current = null;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = rate;
    utterance.voice = selectJapaneseVoice(voicesRef.current);
    synth.cancel();
    synth.resume();
    synth.speak(utterance);
  }, [rate]);
}
