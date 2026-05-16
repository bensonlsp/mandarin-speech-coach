'use client';

import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';
import type { TimerStatus } from '@/lib/types';

interface SpeechTimerProps {
  display: string;
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function SpeechTimer({ display, status, onStart, onPause, onReset }: SpeechTimerProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-300">演講計時</span>
        {status === 'running' && (
          <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        )}
      </div>

      <div
        className="text-5xl font-mono font-bold text-white tabular-nums text-center py-4"
        aria-live="polite"
        aria-label={`計時 ${display}`}
      >
        {display}
      </div>

      <div className="flex gap-2 justify-center">
        {status !== 'running' ? (
          <Button variant="primary" size="md" onClick={onStart}>
            <Play size={16} />
            {status === 'paused' ? '繼續' : '開始'}
          </Button>
        ) : (
          <Button variant="secondary" size="md" onClick={onPause}>
            <Pause size={16} />
            暫停
          </Button>
        )}

        <Button variant="ghost" size="md" onClick={onReset} disabled={status === 'idle'}>
          <RotateCcw size={16} />
          重置
        </Button>
      </div>
    </div>
  );
}
