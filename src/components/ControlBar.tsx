'use client';

import { useState } from 'react';
import {
  Play,
  Square,
  X,
  AlignJustify,
  Gauge,
  Loader2,
  Download,
  FileText,
  Pause,
  RotateCcw,
  Timer,
} from 'lucide-react';
import { Button } from './ui/Button';
import type { TTSStatus, TimerStatus } from '@/lib/types';

interface ControlBarProps {
  hasSelection: boolean;
  ttsStatus: TTSStatus;
  speechRate: number;
  onPlaySelected: () => void;
  onPlayAll: () => void;
  onStop: () => void;
  onClearSelection: () => void;
  onRateChange: (rate: number) => void;

  // Timer
  timerDisplay: string;
  timerStatus: TimerStatus;
  onTimerStart: () => void;
  onTimerPause: () => void;
  onTimerReset: () => void;

  // Export
  onExportMp3: () => void | Promise<void>;
  onExportPdf: () => void;
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
  timerDisplay,
  timerStatus,
  onTimerStart,
  onTimerPause,
  onTimerReset,
  onExportMp3,
  onExportPdf,
}: ControlBarProps) {
  const isSpeaking = ttsStatus === 'speaking';
  const isLoading = ttsStatus === 'loading';
  const isBusy = isSpeaking || isLoading;

  const [mp3Loading, setMp3Loading] = useState(false);

  const handleExportMp3 = async () => {
    if (mp3Loading) return;
    setMp3Loading(true);
    try {
      await onExportMp3();
    } finally {
      setMp3Loading(false);
    }
  };

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

      <span className="hidden md:inline-block w-px h-5 bg-white/10 mx-0.5" aria-hidden="true" />

      <Button
        variant="secondary"
        size="sm"
        onClick={handleExportMp3}
        disabled={mp3Loading || isBusy}
        title={hasSelection ? '匯出選取內容為 MP3' : '匯出全文為 MP3'}
      >
        {mp3Loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {hasSelection ? '匯出選取MP3' : '匯出全文MP3'}
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={onExportPdf}
        title="匯出帶拼音 PDF"
      >
        <FileText size={14} />
        匯出PDF
      </Button>

      {/* Right side: timer + speed slider */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Timer */}
        <div className="flex items-center gap-1.5">
          <Timer size={13} className="text-slate-400" />
          <span
            className="text-sm font-mono font-semibold tabular-nums text-white min-w-[44px] text-center"
            aria-live="polite"
            aria-label={`計時 ${timerDisplay}`}
          >
            {timerDisplay}
          </span>
          {timerStatus === 'running' && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          )}
          {timerStatus !== 'running' ? (
            <button
              onClick={onTimerStart}
              className="p-1 rounded text-green-400 hover:bg-white/10 transition-colors"
              aria-label={timerStatus === 'paused' ? '繼續計時' : '開始計時'}
              title={timerStatus === 'paused' ? '繼續' : '開始'}
            >
              <Play size={13} />
            </button>
          ) : (
            <button
              onClick={onTimerPause}
              className="p-1 rounded text-amber-400 hover:bg-white/10 transition-colors"
              aria-label="暫停計時"
              title="暫停"
            >
              <Pause size={13} />
            </button>
          )}
          <button
            onClick={onTimerReset}
            disabled={timerStatus === 'idle'}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="重置計時"
            title="重置"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        <span className="hidden md:inline-block w-px h-5 bg-white/10" aria-hidden="true" />

        {/* Speed slider */}
        <div className="flex items-center gap-1.5">
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
    </div>
  );
}
