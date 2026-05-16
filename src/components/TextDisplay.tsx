'use client';

import { useEffect } from 'react';
import { ParagraphBlock } from './ParagraphBlock';
import type { ProcessedParagraph, ProcessedSentence, ProcessedText } from '@/lib/types';

interface TextDisplayProps {
  processedText: ProcessedText;
  selectedIndices: Set<number>;
  onPointerDown: (index: number) => void;
  onPointerEnter: (index: number) => void;
  onPointerUp: () => void;
  onCharClick: (index: number, event: React.MouseEvent) => void;
  onSentenceDoubleClick: (sentence: ProcessedSentence) => void;
  onSentenceLongPress: (sentence: ProcessedSentence) => void;
  onParagraphTripleClick: (para: ProcessedParagraph) => void;
}

export function TextDisplay({
  processedText,
  selectedIndices,
  onPointerDown,
  onPointerEnter,
  onPointerUp,
  onCharClick,
  onSentenceDoubleClick,
  onSentenceLongPress,
  onParagraphTripleClick,
}: TextDisplayProps) {
  useEffect(() => {
    window.addEventListener('pointerup', onPointerUp);
    return () => window.removeEventListener('pointerup', onPointerUp);
  }, [onPointerUp]);

  return (
    <div className="space-y-6" onPointerUp={onPointerUp}>
      {processedText.map(para => (
        <ParagraphBlock
          key={para.paraIdx}
          paragraph={para}
          selectedIndices={selectedIndices}
          onPointerDown={onPointerDown}
          onPointerEnter={onPointerEnter}
          onCharClick={onCharClick}
          onSentenceDoubleClick={onSentenceDoubleClick}
          onSentenceLongPress={onSentenceLongPress}
          onParagraphTripleClick={onParagraphTripleClick}
        />
      ))}
    </div>
  );
}
