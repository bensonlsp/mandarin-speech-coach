'use client';

import { useState, useCallback } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TextInput } from '@/components/TextInput';
import { TextDisplay } from '@/components/TextDisplay';
import { ControlBar } from '@/components/ControlBar';
import { SpeechTimer } from '@/components/SpeechTimer';
import { PronunciationChecker } from '@/components/PronunciationChecker';
import { ToneLegend } from '@/components/ToneLegend';
import { usePinyin } from '@/hooks/usePinyin';
import { useSelection } from '@/hooks/useSelection';
import { useTTS } from '@/hooks/useTTS';
import { useTimer } from '@/hooks/useTimer';
import { buildTextFromIndices, flattenChars } from '@/lib/pinyinProcessor';

export default function Home() {
  const { processedText, isProcessing, process, reset } = usePinyin();
  const [speechRate, setSpeechRate] = useState(0.85);

  const {
    selectedIndices,
    onPointerDown,
    onPointerEnter,
    onPointerUp,
    onCharClick,
    selectSentence,
    selectParagraph,
    selectAll,
    clearSelection,
  } = useSelection(processedText);

  const {
    speak, stop,
    status: ttsStatus,
    zhVoices,
    activeVoice,
    selectedURI,
    setSelectedURI,
  } = useTTS();
  const timer = useTimer();

  const getSelectedText = useCallback(() => {
    if (!processedText) return '';
    return buildTextFromIndices(processedText, selectedIndices);
  }, [processedText, selectedIndices]);

  const getAllText = useCallback(() => {
    if (!processedText) return '';
    const all = flattenChars(processedText);
    return all.filter(c => c.isChinese).map(c => c.char).join('');
  }, [processedText]);

  const handlePlaySelected = () => {
    const text = getSelectedText();
    if (text) speak(text, speechRate);
  };

  const handlePlayAll = () => {
    const text = getAllText();
    if (text) speak(text, speechRate);
  };

  const handleReset = () => {
    reset();
    clearSelection();
    stop();
    timer.reset();
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">普通話演講教練</h1>
        <p className="text-slate-400 text-sm mb-4">
          輸入演講稿，生成拼音音調標注，練習發音
        </p>
        <ToneLegend />
      </header>

      {/* Input Section */}
      <GlassCard className="p-6 mb-6">
        <TextInput
          onProcess={process}
          onReset={handleReset}
          hasProcessedText={!!processedText}
          isProcessing={isProcessing}
        />
      </GlassCard>

      {/* Text Display Section */}
      {processedText && (
        <GlassCard className="mb-6 overflow-visible">
          {/* Sticky control bar — stays visible while scrolling through text */}
          <div className="sticky top-2 z-20 mx-1 mt-1 rounded-xl bg-slate-800/95 backdrop-blur-md border border-white/10 shadow-lg px-5 py-3">
            <ControlBar
              hasSelection={selectedIndices.size > 0}
              ttsStatus={ttsStatus}
              speechRate={speechRate}
              zhVoices={zhVoices}
              activeVoice={activeVoice}
              selectedURI={selectedURI}
              onPlaySelected={handlePlaySelected}
              onPlayAll={handlePlayAll}
              onStop={stop}
              onClearSelection={clearSelection}
              onRateChange={setSpeechRate}
              onVoiceChange={setSelectedURI}
            />
          </div>

          {/* Hint + selection count */}
          <div className="flex items-center gap-3 px-6 pt-4 pb-2">
            <span className="text-xs text-slate-500 hidden sm:inline">
              點擊選字 · 雙擊選句 · 三擊選段
            </span>
            <span className="text-xs text-slate-500 sm:hidden">
              點擊選字 · 長按選句
            </span>
            {selectedIndices.size > 0 && (
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                已選 {selectedIndices.size} 字
              </span>
            )}
            <button
              className="text-xs text-slate-500 hover:text-slate-300 ml-auto transition-colors"
              onClick={selectAll}
            >
              全選
            </button>
          </div>

          <div className="px-6 pb-6">
            <TextDisplay
              processedText={processedText}
              selectedIndices={selectedIndices}
              onPointerDown={onPointerDown}
              onPointerEnter={onPointerEnter}
              onPointerUp={onPointerUp}
              onCharClick={onCharClick}
              onSentenceDoubleClick={selectSentence}
              onSentenceLongPress={selectSentence}
              onParagraphTripleClick={selectParagraph}
            />
          </div>
        </GlassCard>
      )}

      {/* Bottom Grid: Timer + Pronunciation Checker */}
      {processedText && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <SpeechTimer
              display={timer.display}
              status={timer.status}
              onStart={timer.start}
              onPause={timer.pause}
              onReset={timer.reset}
            />
          </GlassCard>

          <GlassCard className="p-6">
            <PronunciationChecker targetText={getSelectedText()} />
          </GlassCard>
        </div>
      )}
    </main>
  );
}
