'use client';

import { useState } from 'react';
import { Wand2, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';

const SAMPLE_TEXT = `各位評委老師、同學們，大家好！

今天，我要演講的題目是《努力與堅持》。

每一個成功的人，背後都有無數次的失敗與堅持。我們不應該害怕困難，而應該勇敢地面對挑戰。只要我們努力不懈，就一定能夠實現自己的夢想。

謝謝大家！`;

interface TextInputProps {
  onProcess: (text: string) => void;
  onReset: () => void;
  hasProcessedText: boolean;
  isProcessing: boolean;
}

export function TextInput({ onProcess, onReset, hasProcessedText, isProcessing }: TextInputProps) {
  const [text, setText] = useState('');

  const handleProcess = () => {
    if (text.trim()) onProcess(text);
  };

  const handleSample = () => {
    setText(SAMPLE_TEXT);
    onProcess(SAMPLE_TEXT);
  };

  const handleReset = () => {
    setText('');
    onReset();
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-medium text-slate-300" htmlFor="speech-input">
        輸入演講稿
      </label>
      <textarea
        id="speech-input"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="在此貼上或輸入中文演講稿…&#10;&#10;提示：段落之間請留一空行，程式會按句號自動分句。"
        className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                   placeholder:text-slate-600 resize-none focus:outline-none focus:ring-2
                   focus:ring-blue-500/50 transition-all duration-150 text-sm font-chinese leading-relaxed"
        spellCheck={false}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="md"
          onClick={handleProcess}
          disabled={!text.trim() || isProcessing}
        >
          <Wand2 size={16} />
          {isProcessing ? '處理中…' : '生成拼音'}
        </Button>

        <Button variant="secondary" size="sm" onClick={handleSample}>
          載入示例
        </Button>

        {hasProcessedText && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <Trash2 size={14} />
            清除
          </Button>
        )}
      </div>
    </div>
  );
}
