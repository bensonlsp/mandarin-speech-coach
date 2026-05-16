'use client';

import { memo, useRef } from 'react';
import { clsx } from 'clsx';
import { TONE_TEXT_CLASS } from '@/lib/toneColors';
import type { ProcessedChar } from '@/lib/types';

interface CharacterCardProps {
  char: ProcessedChar;
  isSelected: boolean;
  onPointerDown: (index: number) => void;
  onPointerEnter: (index: number) => void;
  onClick: (index: number, event: React.MouseEvent) => void;
  onLongPress?: (index: number) => void;
}

const LONG_PRESS_MS = 500;

function CharacterCardInner({
  char,
  isSelected,
  onPointerDown,
  onPointerEnter,
  onClick,
  onLongPress,
}: CharacterCardProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  if (!char.isChinese) {
    return (
      <span className="text-slate-400 text-xl md:text-2xl leading-none self-end pb-0.5 select-none">
        {char.char}
      </span>
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`${char.char} ${char.pinyin}`}
      aria-pressed={isSelected}
      className={clsx(
        // Min 44px touch target height for mobile accessibility
        'inline-flex flex-col items-center cursor-pointer select-none rounded-lg',
        'px-1 py-1 min-h-[44px] justify-center',
        'transition-all duration-150 outline-none',
        isSelected
          ? 'bg-white/15 ring-1 ring-white/30 scale-105'
          : 'hover:bg-white/8 active:bg-white/12'
      )}
      onPointerDown={e => {
        e.preventDefault();
        didLongPress.current = false;
        onPointerDown(char.globalIndex);
        // Long-press to select whole sentence on mobile
        if (onLongPress) {
          longPressTimer.current = setTimeout(() => {
            didLongPress.current = true;
            onLongPress(char.globalIndex);
          }, LONG_PRESS_MS);
        }
      }}
      onPointerUp={cancelLongPress}
      onPointerLeave={cancelLongPress}
      onPointerEnter={() => {
        cancelLongPress();
        onPointerEnter(char.globalIndex);
      }}
      onClick={e => {
        if (didLongPress.current) return; // already handled
        onClick(char.globalIndex, e);
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(char.globalIndex, e as unknown as React.MouseEvent);
        }
      }}
    >
      <span
        className={clsx('text-xs font-medium leading-none mb-1', TONE_TEXT_CLASS[char.tone])}
        aria-hidden="true"
      >
        {char.pinyin || ' '}
      </span>
      <span className="text-white text-xl md:text-2xl leading-none font-chinese">{char.char}</span>
    </span>
  );
}

export const CharacterCard = memo(CharacterCardInner, (prev, next) =>
  prev.char.globalIndex === next.char.globalIndex && prev.isSelected === next.isSelected
);
