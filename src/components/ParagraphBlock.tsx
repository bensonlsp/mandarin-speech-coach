'use client';

import { SentenceRow } from './SentenceRow';
import type { ProcessedParagraph, ProcessedSentence } from '@/lib/types';

interface ParagraphBlockProps {
  paragraph: ProcessedParagraph;
  selectedIndices: Set<number>;
  onPointerDown: (index: number) => void;
  onPointerEnter: (index: number) => void;
  onCharClick: (index: number, event: React.MouseEvent) => void;
  onSentenceDoubleClick: (sentence: ProcessedSentence) => void;
  onSentenceLongPress: (sentence: ProcessedSentence) => void;
  onParagraphTripleClick: (para: ProcessedParagraph) => void;
}

export function ParagraphBlock({
  paragraph,
  selectedIndices,
  onPointerDown,
  onPointerEnter,
  onCharClick,
  onSentenceDoubleClick,
  onSentenceLongPress,
  onParagraphTripleClick,
}: ParagraphBlockProps) {
  return (
    <p
      className="flex flex-wrap items-end gap-x-1 gap-y-3 leading-loose"
      onClick={e => {
        if (e.detail >= 3) onParagraphTripleClick(paragraph);
      }}
    >
      {paragraph.sentences.map(sentence => (
        <SentenceRow
          key={`${sentence.paraIdx}-${sentence.sentIdx}`}
          sentence={sentence}
          selectedIndices={selectedIndices}
          onPointerDown={onPointerDown}
          onPointerEnter={onPointerEnter}
          onCharClick={onCharClick}
          onDoubleClick={onSentenceDoubleClick}
          onLongPress={onSentenceLongPress}
        />
      ))}
    </p>
  );
}
