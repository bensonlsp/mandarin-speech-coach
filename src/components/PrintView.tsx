'use client';

import { useEffect, useState } from 'react';
import type { ProcessedText, Tone } from '@/lib/types';

// Darker tone palette tuned for print on white paper
const TONE_PRINT_HEX: Record<Tone, string> = {
  0: '#475569',
  1: '#1d4ed8',
  2: '#15803d',
  3: '#b45309',
  4: '#b91c1c',
  5: '#64748b',
};

interface PrintViewProps {
  processedText: ProcessedText | null;
}

function formatNow(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function PrintView({ processedText }: PrintViewProps) {
  const [printedAt, setPrintedAt] = useState('');

  useEffect(() => {
    const update = () => setPrintedAt(formatNow(new Date()));
    update();
    const before = () => update();
    window.addEventListener('beforeprint', before);
    return () => window.removeEventListener('beforeprint', before);
  }, []);

  if (!processedText) return null;

  return (
    <div className="print-view" aria-hidden="true">
      <div className="print-body">
        {processedText.map(para => (
          <div className="print-paragraph" key={para.paraIdx}>
            {para.sentences.flatMap(sent => sent.chars).map(c => {
              const colorStyle = c.isChinese ? { color: TONE_PRINT_HEX[c.tone] } : undefined;
              return (
                <span
                  className={`print-char-block${c.isChinese ? '' : ' print-char-block-punc'}`}
                  key={c.globalIndex}
                >
                  <span className="print-pinyin" style={colorStyle}>
                    {c.isChinese ? c.pinyin : ' '}
                  </span>
                  <span className="print-char" style={colorStyle}>
                    {c.char}
                  </span>
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <div className="print-footer">
        <span className="print-footer-date">列印時間：{printedAt}</span>
        <span className="print-footer-sign">Benson LO</span>
      </div>
    </div>
  );
}

export function exportPdf() {
  window.print();
}
