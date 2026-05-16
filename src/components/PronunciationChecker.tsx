'use client';

import { Mic, MicOff, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './ui/Button';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { compareSpeech } from '@/lib/speechComparator';
import type { CharAlignment } from '@/lib/types';

interface PronunciationCheckerProps {
  targetText: string;
}

function AccuracyBadge({ accuracy }: { accuracy: number }) {
  const color =
    accuracy >= 90 ? 'text-green-400 bg-green-400/10' :
    accuracy >= 70 ? 'text-amber-400 bg-amber-400/10' :
    'text-red-400 bg-red-400/10';

  return (
    <span className={clsx('text-2xl font-bold px-3 py-1 rounded-lg', color)}>
      {accuracy}%
    </span>
  );
}

function AlignmentDisplay({ alignment }: { alignment: CharAlignment[] }) {
  return (
    <div className="flex flex-wrap gap-1 mt-3">
      {alignment.map((a, i) => (
        <span
          key={i}
          className={clsx(
            'px-1.5 py-0.5 rounded text-sm font-chinese',
            a.status === 'correct' && 'bg-green-400/20 text-green-300',
            a.status === 'missed' && 'bg-red-400/20 text-red-300 line-through',
            a.status === 'extra' && 'bg-amber-400/20 text-amber-300 italic',
          )}
          title={
            a.status === 'correct' ? '正確' :
            a.status === 'missed' ? '缺漏' : '多讀'
          }
        >
          {a.char}
        </span>
      ))}
    </div>
  );
}

export function PronunciationChecker({ targetText }: PronunciationCheckerProps) {
  const { transcript, status, isSupported, startRecording, stopRecording, reset } =
    useSpeechRecognition();

  const result = status === 'done' && transcript
    ? compareSpeech(targetText, transcript)
    : null;

  if (!isSupported) {
    const isIOS = typeof navigator !== 'undefined' &&
      /iPad|iPhone|iPod/.test(navigator.userAgent);
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-slate-300">錄音核對</p>
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
          <p className="text-sm text-amber-300">
            {isIOS
              ? '📱 iOS Safari 暫不支援語音識別。請改用 Chrome 或 Android 裝置。'
              : '⚠ 您的瀏覽器不支援語音識別。請使用 Chrome 瀏覽器。'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-300">錄音核對</span>
        {!targetText && (
          <span className="text-xs text-slate-500">（請先選取文字）</span>
        )}
      </div>

      {targetText && (
        <div className="text-xs text-slate-400 bg-white/5 rounded-lg px-3 py-2 font-chinese leading-relaxed">
          目標：{targetText.slice(0, 60)}{targetText.length > 60 ? '…' : ''}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {status === 'idle' || status === 'done' || status === 'error' ? (
          <Button
            variant="primary"
            size="md"
            onClick={startRecording}
            disabled={!targetText}
          >
            <Mic size={16} />
            開始錄音
          </Button>
        ) : status === 'recording' ? (
          <Button variant="danger" size="md" onClick={stopRecording}>
            <MicOff size={16} />
            停止錄音
          </Button>
        ) : (
          <Button variant="secondary" size="md" disabled>
            處理中…
          </Button>
        )}

        {(status === 'done' || status === 'error') && (
          <Button variant="ghost" size="md" onClick={reset}>
            <RotateCcw size={16} />
            重試
          </Button>
        )}
      </div>

      {status === 'recording' && (
        <div className="flex items-center gap-2">
          <span className="inline-flex gap-1">
            {[1, 2, 3, 4].map(i => (
              <span
                key={i}
                className="w-1 bg-red-400 rounded-full animate-pulse"
                style={{
                  height: `${8 + i * 4}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </span>
          <span className="text-sm text-red-400">錄音中…</span>
        </div>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-400">識別失敗，請重試。</p>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">準確率</span>
            <AccuracyBadge accuracy={result.accuracy} />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">識別結果：{result.recognizedText}</p>
            <AlignmentDisplay alignment={result.alignment} />
            <p className="text-xs text-slate-600 mt-2">
              <span className="text-green-400">■</span> 正確 &nbsp;
              <span className="text-red-400">■</span> 缺漏 &nbsp;
              <span className="text-amber-400">■</span> 多讀
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
