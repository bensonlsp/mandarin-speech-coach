'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TTSStatus } from '@/lib/types';

// Safari detection (excludes Chrome which also has "Safari" in UA)
function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(ua);
}

function isLikelyMandarin(v: SpeechSynthesisVoice): boolean {
  const lang = v.lang.toLowerCase();
  const name = v.name.toLowerCase();
  if (lang === 'zh-hk' || lang.includes('hant-hk')) return false;
  if (name.includes('sin-ji') || name.includes('cantonese')) return false;
  return true;
}

function pickDefaultMandarin(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const mandarin = voices.filter(isLikelyMandarin);
  return (
    mandarin.find(v => v.lang === 'zh-CN' && v.name.toLowerCase().includes('google')) ??
    mandarin.find(v => v.lang === 'zh-CN') ??
    mandarin.find(v => v.lang === 'zh-TW' && v.name.toLowerCase().includes('google')) ??
    mandarin.find(v => v.lang === 'zh-TW') ??
    mandarin[0] ??
    null
  );
}

// Safari lists voices that are NOT installed — detect by checking if local=true
// or if the voice is likely a real installed voice (heuristic)
function isInstalledVoice(v: SpeechSynthesisVoice): boolean {
  // On Safari, uninstalled voices have localService=false
  // On Chrome all Google voices have localService=false but still work
  if (isSafari()) return v.localService === true;
  return true;
}

export function useTTS() {
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [zhVoices, setZhVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedURI, setSelectedURI] = useState<string | null>(null);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const safari = useRef(false);

  useEffect(() => {
    safari.current = isSafari();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices();
      const zh = all.filter(v => v.lang.startsWith('zh'));
      setZhVoices(zh);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const getActiveVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (selectedURI) {
      return zhVoices.find(v => v.voiceURI === selectedURI) ?? null;
    }
    // On Safari prefer installed voices to avoid silent fallback to Cantonese
    const candidates = safari.current
      ? zhVoices.filter(isInstalledVoice)
      : zhVoices;
    return pickDefaultMandarin(candidates.length > 0 ? candidates : zhVoices);
  }, [zhVoices, selectedURI]);

  // True if active voice is likely uninstalled on Safari (will fall back to Cantonese)
  const activeVoiceUninstalled = useCallback((): boolean => {
    if (!safari.current) return false;
    const v = getActiveVoice();
    if (!v) return false;
    return !v.localService;
  }, [getActiveVoice]);

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
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getActiveVoice();

    if (safari.current) {
      // Safari: only set voice if it's a locally installed one;
      // otherwise just set lang and let macOS pick — setting an
      // uninstalled voice causes silent Cantonese fallback
      if (voice && voice.localService) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'zh-CN';
      }
    } else {
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'zh-CN';
      }
    }

    utterance.onstart = () => setStatus('speaking');
    utterance.onend = () => { setStatus('idle'); clearKeepAlive(); };
    utterance.onerror = () => { setStatus('error'); clearKeepAlive(); };

    synth.speak(utterance);
    setStatus('speaking');

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
    isSafariBrowser: safari.current,
    activeVoiceUninstalled: activeVoiceUninstalled(),
  };
}
