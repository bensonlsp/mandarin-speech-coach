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

export type TTSStatus = 'idle' | 'loading' | 'speaking' | 'paused' | 'error';
export type TimerStatus = 'idle' | 'running' | 'paused';
