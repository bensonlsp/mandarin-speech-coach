'use client';

import { startTransition, useCallback, useState } from 'react';
import { processText } from '@/lib/pinyinProcessor';
import type { ProcessedText } from '@/lib/types';

export function usePinyin() {
  const [processedText, setProcessedText] = useState<ProcessedText | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const process = useCallback((rawText: string) => {
    if (!rawText.trim()) {
      setProcessedText(null);
      return;
    }
    setIsProcessing(true);
    startTransition(() => {
      const result = processText(rawText);
      setProcessedText(result);
      setIsProcessing(false);
    });
  }, []);

  const reset = useCallback(() => {
    setProcessedText(null);
  }, []);

  return { processedText, isProcessing, process, reset };
}
