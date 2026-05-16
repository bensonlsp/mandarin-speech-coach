import { TONE_HEX, TONE_LABEL_ZH } from '@/lib/toneColors';
import type { Tone } from '@/lib/types';

const DISPLAY_TONES: Tone[] = [1, 2, 3, 4, 5];

export function ToneLegend() {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {DISPLAY_TONES.map(tone => (
        <div key={tone} className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: TONE_HEX[tone] }}
          />
          <span className="text-xs text-slate-400">{TONE_LABEL_ZH[tone]}</span>
        </div>
      ))}
    </div>
  );
}
