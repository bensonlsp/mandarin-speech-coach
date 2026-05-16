'use client';

import { useCallback, useRef, useState } from 'react';
import type { TTSStatus } from '@/lib/types';

export function useTTS() {
  const [status, setStatus] = useState<TTSStatus>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const revokeBlobUrl = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    revokeBlobUrl();
    setStatus('idle');
  }, []);

  // rate: 0.5–1.5 slider value → convert to % change for Edge TTS
  const speak = useCallback(async (text: string, rate = 0.85) => {
    stop();
    setStatus('loading');

    try {
      // Map slider 0.5–1.5 → percentage -50 to +50
      const ratePercent = Math.round((rate - 1) * 100);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, rate: ratePercent }),
      });

      if (!res.ok) throw new Error(`TTS API ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => setStatus('speaking');
      audio.onended = () => { setStatus('idle'); revokeBlobUrl(); };
      audio.onerror = () => { setStatus('error'); revokeBlobUrl(); };

      await audio.play();
    } catch (err) {
      console.error('[TTS]', err);
      setStatus('error');
      revokeBlobUrl();
    }
  }, [stop]);

  return { speak, stop, status };
}
