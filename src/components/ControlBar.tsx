'use client';

import { Play, Square, X, AlignJustify, Gauge, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';
import type { TTSStatus } from '@/lib/types';

interface ControlBarProps {
  hasSelection: boolean;
  ttsStatus: TTSStatus;
  speechRate: number;
  zhVoices: SpeechSynthesisVoice[];
  activeVoice: SpeechSynthesisVoice | null;
  selectedURI: string | null;
  isSafariBrowser: boolean;
  activeVoiceUninstalled: boolean;
  onPlaySelected: () => void;
  onPlayAll: () => void;
  onStop: () => void;
  onClearSelection: () => void;
  onRateChange: (rate: number) => void;
  onVoiceChange: (uri: string) => void;
}

function voiceLabel(v: SpeechSynthesisVoice): string {
  const lang = v.lang;
  const tag =
    lang === 'zh-CN' ? '普通話(中國)' :
    lang === 'zh-TW' ? '普通話(台灣)' :
    lang === 'zh-HK' ? '廣東話' : lang;
  // Mark uninstalled voices on Safari so user knows
  const installed = v.localService ? '' : ' ⬇';
  return `${v.name}${installed} — ${tag}`;
}

export function ControlBar({
  hasSelection,
  ttsStatus,
  speechRate,
  zhVoices,
  activeVoice,
  isSafariBrowser,
  activeVoiceUninstalled,
  onPlaySelected,
  onPlayAll,
  onStop,
  onClearSelection,
  onRateChange,
  onVoiceChange,
}: ControlBarProps) {
  const isSpeaking = ttsStatus === 'speaking';
  const isCantonese =
    activeVoice?.lang === 'zh-HK' ||
    activeVoice?.lang?.includes('Hant-HK') ||
    activeVoice?.name?.toLowerCase().includes('sin-ji');

  const showSafariWarning = isSafariBrowser && (isCantonese || activeVoiceUninstalled);

  return (
    <div className="flex flex-col gap-2">
      {/* Safari install warning */}
      {showSafariWarning && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-300 leading-relaxed">
          <strong>Safari 需要安裝普通話語音：</strong>
          系統設定 → 輔助使用 → 朗讀內容 → 系統語音 → 管理語音，
          下載「<strong>婷婷</strong>」(中國大陸) 或「<strong>美佳</strong>」(台灣)，
          然後重新整理頁面。語音名稱後面有 ⬇ 符號代表尚未安裝。
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {/* Playback buttons */}
        <Button
          variant="primary"
          size="sm"
          onClick={onPlaySelected}
          disabled={!hasSelection || isSpeaking}
        >
          <Play size={14} />
          播放選取
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onPlayAll}
          disabled={isSpeaking}
        >
          <AlignJustify size={14} />
          播放全文
        </Button>

        {isSpeaking && (
          <Button variant="danger" size="sm" onClick={onStop}>
            <Square size={14} />
            停止
          </Button>
        )}

        {hasSelection && !isSpeaking && (
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X size={14} />
            清除
          </Button>
        )}

        {/* Voice selector + speed */}
        <div className="flex items-center gap-3 ml-auto flex-wrap justify-end">
          <div className="flex flex-col gap-0.5">
            {isCantonese && !isSafariBrowser && (
              <span className="text-xs text-amber-400 leading-none">⚠ 目前是廣東話，請改選普通話</span>
            )}
            <div className="relative flex items-center">
              <select
                value={activeVoice?.voiceURI ?? ''}
                onChange={e => onVoiceChange(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="appearance-none bg-slate-700 border border-slate-500 text-white text-xs
                           rounded-lg pl-2 pr-6 py-1.5 cursor-pointer focus:outline-none
                           focus:ring-1 focus:ring-blue-500/60 transition-all min-w-[180px]"
                aria-label="選擇語音"
              >
                {zhVoices.length === 0 && (
                  <option value="">載入語音中…</option>
                )}
                {zhVoices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {voiceLabel(v)}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-1.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

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
    </div>
  );
}
