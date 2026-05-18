'use client';

import { useEffect, useState } from 'react';
import type { ProcessedText } from '@/lib/types';

interface PrintViewProps {
  processedText: ProcessedText | null;
  appName: string;
}

function formatNow(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function PrintView({ processedText, appName }: PrintViewProps) {
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
      <div className="print-header">{appName}</div>

      <div className="print-body">
        {processedText.map(para => (
          <div className="print-paragraph" key={para.paraIdx}>
            {para.sentences.flatMap(sent => sent.chars).map(c => (
              <span
                className={`print-char-block${c.isChinese ? '' : ' print-char-block-punc'}`}
                key={c.globalIndex}
              >
                <span className="print-pinyin">{c.isChinese ? c.pinyin : ' '}</span>
                <span className="print-char">{c.char}</span>
              </span>
            ))}
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
