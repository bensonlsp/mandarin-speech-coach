export type Tone = 0 | 1 | 2 | 3 | 4 | 5;

export interface ProcessedChar {
  char: string;
  pinyin: string;
  pinyinNum: string;
  tone: Tone;
  isChinese: boolean;
  globalIndex: number;
  sentenceIndex: number;
  paraIndex: number;
  sentIdx: number;
}

export interface ProcessedSentence {
  chars: ProcessedChar[];
  raw: string;
  sentIdx: number;
  paraIdx: number;
  startGlobalIndex: number;
  endGlobalIndex: number;
}

export interface ProcessedParagraph {
  sentences: ProcessedSentence[];
  paraIdx: number;
  startGlobalIndex: number;
  endGlobalIndex: number;
}

export type ProcessedText = ProcessedParagraph[];

export interface CharAlignment {
  char: string;
  status: 'correct' | 'missed' | 'extra';
}

export interface ComparisonResult {
  accuracy: number;
  alignment: CharAlignment[];
  expectedText: string;
  recognizedText: string;
}

export type TTSStatus = 'idle' | 'loading' | 'speaking' | 'paused' | 'error';
export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'done' | 'error';
export type TimerStatus = 'idle' | 'running' | 'paused';
