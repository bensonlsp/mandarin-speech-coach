import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import type { Readable } from 'stream';
import { NextRequest } from 'next/server';

// zh-CN-XiaoxiaoNeural: natural female Mandarin (China)
const VOICE = 'zh-CN-XiaoxiaoNeural';

// The public Edge TTS endpoint silently returns 0 bytes for any SSML
// markup (<break>, <mstts:silence>, <emphasis>...). To get longer pauses
// at punctuation we split the text, synthesise each segment separately,
// and stitch the resulting MP3 frames together with copies of a 100 ms
// silent MP3 chunk. Each extra pause is ON TOP of the natural pause that
// Edge TTS produces at the punctuation that ends each chunk.
const EXTRA_PAUSE_100MS_UNITS: Record<string, number> = {
  '，': 3,
  '、': 2,
  '；': 4,
  '：': 3,
  '。': 5,
  '！': 5,
  '？': 5,
  '…': 7,
  ',': 3,
  ';': 4,
  ':': 3,
  '.': 5,
  '!': 5,
  '?': 5,
};

// 100 ms of silence at 24 kHz / 48 kbps mono MPEG-2 LSF — generated
// once by ffmpeg, inlined here to survive Next.js standalone builds
// that don't include arbitrary src/ assets.
const SILENCE_100MS_B64 =
  '//NkxAAAAANIAAAAAExBTUVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  '//NkxHwAAANIAAAAAFVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  '//NkxHwAAANIAAAAAFVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  '//NkxHwAAANIAAAAAFVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  '//NkxHwAAANIAAAAAFVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  '//NkxHwAAANIAAAAAFVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV' +
  '//NkxHwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

const SILENCE_100MS = Buffer.from(SILENCE_100MS_B64, 'base64');

interface Segment {
  text: string;
  pauseUnits: number;
}

function splitByPunctuation(text: string): Segment[] {
  const segments: Segment[] = [];
  let cur = '';
  for (const ch of text) {
    cur += ch;
    const units = EXTRA_PAUSE_100MS_UNITS[ch];
    if (units !== undefined) {
      segments.push({ text: cur, pauseUnits: units });
      cur = '';
    }
  }
  if (cur.trim()) segments.push({ text: cur, pauseUnits: 0 });
  return segments;
}

async function synthesise(text: string, rateStr: string): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  const { audioStream } = tts.toStream(text, { rate: rateStr });
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    (audioStream as Readable).on('data', (c: Buffer) => chunks.push(Buffer.from(c)));
    (audioStream as Readable).on('end', resolve);
    (audioStream as Readable).on('error', reject);
  });
  tts.close();
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  try {
    const { text, rate = 0 } = await req.json() as { text: string; rate?: number };

    if (!text?.trim()) {
      return new Response('Missing text', { status: 400 });
    }

    const rateStr = `${rate >= 0 ? '+' : ''}${rate}%`;
    const segments = splitByPunctuation(text);

    // Fast path: nothing to stitch
    if (segments.length === 1 && segments[0].pauseUnits === 0) {
      const audio = await synthesise(segments[0].text, rateStr);
      return new Response(new Uint8Array(audio), {
        headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
      });
    }

    const audios = await Promise.all(segments.map(s => synthesise(s.text, rateStr)));

    const parts: Buffer[] = [];
    for (let i = 0; i < segments.length; i++) {
      parts.push(audios[i]);
      for (let k = 0; k < segments[i].pauseUnits; k++) parts.push(SILENCE_100MS);
    }

    return new Response(new Uint8Array(Buffer.concat(parts)), {
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[TTS]', err);
    return new Response('TTS error', { status: 500 });
  }
}
