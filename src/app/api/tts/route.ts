import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import type { Readable } from 'stream';
import { NextRequest } from 'next/server';

// zh-CN-XiaoxiaoNeural: natural female Mandarin (China)
const VOICE = 'zh-CN-XiaoxiaoNeural';

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

    // toStream returns { audioStream: Readable, metadataStream: Readable | null }
    const { audioStream } = tts.toStream(text, { rate: rateStr });

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
