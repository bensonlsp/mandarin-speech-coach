import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import type { Readable } from 'stream';
import { NextRequest } from 'next/server';

// zh-CN-XiaoxiaoNeural: natural female Mandarin (China)
const VOICE = 'zh-CN-XiaoxiaoNeural';

// Extra pause (ms) inserted AFTER each punctuation, on top of the natural
// pause Edge TTS already produces. Tuned for speech-practice cadence.
const EXTRA_PAUSE_MS: Record<string, number> = {
  '，': 300,
  '、': 200,
  '；': 400,
  '：': 350,
  '。': 550,
  '！': 550,
  '？': 550,
  '…': 750,
  ',': 300,
  ';': 400,
  ':': 350,
  '.': 550,
  '!': 550,
  '?': 550,
};

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function textToSSMLInner(text: string): string {
  let out = '';
  for (const ch of text) {
    out += xmlEscape(ch);
    const pause = EXTRA_PAUSE_MS[ch];
    if (pause) out += `<break time="${pause}ms"/>`;
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const { text, rate = 0 } = await req.json() as { text: string; rate?: number };

    if (!text?.trim()) {
      return new Response('Missing text', { status: 400 });
    }

    // rate is a % change: -20 = 20% slower, +20 = 20% faster
    const rateStr = `${rate >= 0 ? '+' : ''}${rate}%`;

    const tts = new MsEdgeTTS();
    await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // Wrap with <break> tags after punctuation; the library's SSML template
    // interpolates the input verbatim into <prosody>...</prosody>.
    const ssmlInput = textToSSMLInner(text);

    const { audioStream } = tts.toStream(ssmlInput, { rate: rateStr });

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      (audioStream as Readable).on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
      (audioStream as Readable).on('end', resolve);
      (audioStream as Readable).on('error', reject);
    });

    tts.close();

    return new Response(Buffer.concat(chunks), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[TTS]', err);
    return new Response('TTS error', { status: 500 });
  }
}
