'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TTSStatus } from '@/lib/types';

function isLikelyMandarin(v: SpeechSynthesisVoice): boolean {
  const lang = v.lang.toLowerCase();
  const name = v.name.toLowerCase();
  // Exclude Cantonese
  if (lang === 'zh-hk' || lang.includes('hant-hk')) return false;
  if (name.includes('sin-ji') || name.includes('cantonese')) return false;
  return true;
}

function pickDefaultMandarin(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const mandarin = voices.filter(isLikelyMandarin);
  return (
    // Prefer Google zh-CN (most reliable in Chrome)
    mandarin.find(v => v.lang === 'zh-CN' && v.name.toLowerCase().includes('google')) ??
    mandarin.find(v => v.lang === 'zh-CN') ??
    mandarin.find(v => v.lang === 'zh-TW' && v.name.toLowerCase().includes('google')) ??
    mandarin.find(v => v.lang === 'zh-TW') ??
    mandarin[0] ??
    null
  );
}

export function useTTS() {
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [zhVoices, setZhVoices] = useState<SpeechSynthesisVoice[]>([]);
  // User-selected voice URI; null = auto-pick
  const [selectedURI, setSelectedURI] = useState<string | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices();
      // Show all zh-* voices in the picker (don't filter Cantonese out here — user sees all)
      setZhVoices(all.filter(v => v.lang.startsWith('zh')));
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const getActiveVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (selectedURI) {
      return zhVoices.find(v => v.voiceURI === selectedURI) ?? null;
    }
    return pickDefaultMandarin(zhVoices);
  }, [zhVoices, selectedURI]);

  const clearKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const speak = useCallback((text: string, rate = 0.85) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    clearKeepAlive();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getActiveVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang; // match lang to voice to avoid override
    }

    utterance.onstart = () => setStatus('speaking');
    utterance.onend = () => { setStatus('idle'); clearKeepAlive(); };
    utterance.onerror = () => { setStatus('error'); clearKeepAlive(); };

    synth.speak(utterance);
    setStatus('speaking');

    // Chrome bug: speechSynthesis pauses after ~15s
    keepAliveRef.current = setInterval(() => {
      if (synth.speaking) { synth.pause(); synth.resume(); }
      else clearKeepAlive();
    }, 14000);
  }, [getActiveVoice, clearKeepAlive]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    clearKeepAlive();
    setStatus('idle');
  }, [clearKeepAlive]);

  useEffect(() => () => clearKeepAlive(), [clearKeepAlive]);

  const activeVoice = getActiveVoice();

  return {
    speak,
    stop,
    status,
    zhVoices,
    activeVoice,
    selectedURI,
    setSelectedURI,
  };
}
