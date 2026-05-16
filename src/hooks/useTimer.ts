'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TimerStatus } from '@/lib/types';

export function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(() => {
    if (status === 'running') return;
    setStatus('running');
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const delta = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(accumulatedRef.current + delta);
    }, 250);
  }, [status]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    clearTimer();
    accumulatedRef.current = elapsed;
    setStatus('paused');
  }, [status, elapsed]);

  const reset = useCallback(() => {
    clearTimer();
    accumulatedRef.current = 0;
    setElapsed(0);
    setStatus('idle');
  }, []);

  useEffect(() => () => clearTimer(), []);

  const format = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return { elapsed, status, display: format(elapsed), start, pause, reset };
}
