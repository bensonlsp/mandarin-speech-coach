'use client';

import { Play, Square, X, AlignJustify, Gauge, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import type { TTSStatus } from '@/lib/types';

interface ControlBarProps {
  hasSelection: boolean;
  ttsStatus: TTSStatus;
  speechRate: number;
  onPlaySelected: () => void;
  onPlayAll: () => void;
  onStop: () => void;
  onClearSelection: () => void;
  onRateChange: (rate: number) => void;
}

export function ControlBar({
  hasSelection,
  ttsStatus,
  speechRate,
  onPlaySelected,
  onPlayAll,
  onStop,
  onClearSelection,
  onRateChange,
}: ControlBarProps) {
  const isSpeaking = ttsStatus === 'speaking';
  const isLoading = ttsStatus === 'loading';
  const isBusy = isSpeaking || isLoading;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        onClick={onPlaySelected}
        disabled={!hasSelection || isBusy}
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
        播放選取
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={onPlayAll}
        disabled={isBusy}
      >
        <AlignJustify size={14} />
        播放全文
      </Button>

      {isBusy && (
        <Button variant="danger" size="sm" onClick={onStop}>
          <Square size={14} />
          停止
        </Button>
      )}

      {hasSelection && !isBusy && (
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X size={14} />
          清除
        </Button>
      )}

      {/* Speed slider */}
      <div className="flex items-center gap-1.5 ml-auto">
        <Gauge size={13} className="text-slate-400" />
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.1}
          value={speechRate}
          onChange={e => onRateChange(parseFloat(e.target.value))}
          className="w-20 accent-blue-400"
          aria-label="語速調節"
        />
        <span className="text-xs text-slate-400 w-7 tabular-nums">{speechRate.toFixed(1)}x</span>
      </div>
    </div>
  );
}
