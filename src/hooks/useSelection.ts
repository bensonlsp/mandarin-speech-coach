'use client';

import { useCallback, useRef, useState } from 'react';
import type { ProcessedParagraph, ProcessedSentence, ProcessedText } from '@/lib/types';

export function useSelection(processedText: ProcessedText | null) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<number | null>(null);
  const dragCurrentRef = useRef<number | null>(null);

  const fillRange = (a: number, b: number): Set<number> => {
    const s = new Set<number>();
    const [lo, hi] = a <= b ? [a, b] : [b, a];
    for (let i = lo; i <= hi; i++) s.add(i);
    return s;
  };

  const onPointerDown = useCallback((index: number) => {
    isDraggingRef.current = true;
    dragStartRef.current = index;
    dragCurrentRef.current = index;
    setSelectedIndices(new Set([index]));
  }, []);

  const onPointerEnter = useCallback((index: number) => {
    if (!isDraggingRef.current || dragStartRef.current === null) return;
    dragCurrentRef.current = index;
    setSelectedIndices(fillRange(dragStartRef.current, index));
  }, []);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const onCharClick = useCallback((index: number, event: React.MouseEvent) => {
    if (event.shiftKey && selectedIndices.size > 0) {
      const lastSelected = Math.max(...Array.from(selectedIndices));
      setSelectedIndices(fillRange(lastSelected, index));
    } else if (event.ctrlKey || event.metaKey) {
      setSelectedIndices(prev => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else next.add(index);
        return next;
      });
    } else {
      setSelectedIndices(new Set([index]));
    }
  }, [selectedIndices]);

  const selectSentence = useCallback((sentence: ProcessedSentence) => {
    const indices = new Set<number>();
    sentence.chars.forEach(c => indices.add(c.globalIndex));
    setSelectedIndices(indices);
  }, []);

  const selectParagraph = useCallback((para: ProcessedParagraph) => {
    const indices = new Set<number>();
    para.sentences.forEach(s => s.chars.forEach(c => indices.add(c.globalIndex)));
    setSelectedIndices(indices);
  }, []);

  const selectAll = useCallback(() => {
    if (!processedText) return;
    const indices = new Set<number>();
    processedText.forEach(para =>
      para.sentences.forEach(s => s.chars.forEach(c => indices.add(c.globalIndex)))
    );
    setSelectedIndices(indices);
  }, [processedText]);

  const clearSelection = useCallback(() => {
    setSelectedIndices(new Set());
  }, []);

  return {
    selectedIndices,
    onPointerDown,
    onPointerEnter,
    onPointerUp,
    onCharClick,
    selectSentence,
    selectParagraph,
    selectAll,
    clearSelection,
  };
}
