'use client';

import { CharacterCard } from './CharacterCard';
import type { ProcessedSentence } from '@/lib/types';

interface SentenceRowProps {
  sentence: ProcessedSentence;
  selectedIndices: Set<number>;
  onPointerDown: (index: number) => void;
  onPointerEnter: (index: number) => void;
  onCharClick: (index: number, event: React.MouseEvent) => void;
  onDoubleClick: (sentence: ProcessedSentence) => void;
  onLongPress: (sentence: ProcessedSentence) => void;
}

export function SentenceRow({
  sentence,
  selectedIndices,
  onPointerDown,
  onPointerEnter,
  onCharClick,
  onDoubleClick,
  onLongPress,
}: SentenceRowProps) {
  return (
    <span
      className="inline-flex flex-wrap items-end gap-x-0.5 gap-y-2 cursor-default"
      onDoubleClick={() => onDoubleClick(sentence)}
    >
      {sentence.chars.map(char => (
        <CharacterCard
          key={char.globalIndex}
          char={char}
          isSelected={selectedIndices.has(char.globalIndex)}
          onPointerDown={onPointerDown}
          onPointerEnter={onPointerEnter}
          onClick={onCharClick}
          onLongPress={() => onLongPress(sentence)}
        />
      ))}
    </span>
  );
}
