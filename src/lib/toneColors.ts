import type { Tone } from './types';

export const TONE_TEXT_CLASS: Record<Tone, string> = {
  0: 'text-slate-500',
  1: 'text-blue-400',
  2: 'text-green-400',
  3: 'text-amber-400',
  4: 'text-red-400',
  5: 'text-slate-400',
};

export const TONE_HEX: Record<Tone, string> = {
  0: '#64748b',
  1: '#60a5fa',
  2: '#4ade80',
  3: '#fbbf24',
  4: '#f87171',
  5: '#94a3b8',
};

export const TONE_LABEL_ZH: Record<Tone, string> = {
  0: '無聲調',
  1: '一聲（陰平）ā',
  2: '二聲（陽平）á',
  3: '三聲（上聲）ǎ',
  4: '四聲（去聲）à',
  5: '輕聲',
};

export const TONE_BG_CLASS: Record<Tone, string> = {
  0: 'bg-slate-500/20',
  1: 'bg-blue-400/20',
  2: 'bg-green-400/20',
  3: 'bg-amber-400/20',
  4: 'bg-red-400/20',
  5: 'bg-slate-400/20',
};
