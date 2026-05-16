'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RecordingStatus } from '@/lib/types';

// SpeechRecognition types (not yet in all TypeScript lib versions)
type SpeechRecognitionAPI = {
  new(): SpeechRecognitionInstance;
};
type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventCompat) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type SpeechRecognitionEventCompat = {
  results: { [index: number]: { [index: number]: { transcript: string } } };
};

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionAPI;
    webkitSpeechRecognition: SpeechRecognitionAPI;
  }
}

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setIsSupported(!!API);
  }, []);

  const startRecording = useCallback(() => {
    if (typeof window === 'undefined') return;
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!API) return;

    recognitionRef.current?.abort();

    const rec = new API();
    rec.lang = 'zh-CN';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setStatus('recording');

    rec.onresult = (event: SpeechRecognitionEventCompat) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setStatus('done');
    };

    rec.onerror = () => setStatus('error');

    rec.onend = () => {
      setStatus(prev => (prev === 'recording' ? 'processing' : prev));
    };

    recognitionRef.current = rec;
    setTranscript('');
    setStatus('recording');
    rec.start();
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus('processing');
  }, []);

  const reset = useCallback(() => {
    recognitionRef.current?.abort();
    setTranscript('');
    setStatus('idle');
  }, []);

  useEffect(() => () => { recognitionRef.current?.abort(); }, []);

  return { transcript, status, isSupported, startRecording, stopRecording, reset };
}
