import { pinyin, customPinyin } from 'pinyin-pro';
import type { ProcessedChar, ProcessedParagraph, ProcessedSentence, ProcessedText, Tone } from './types';

// Unicode ranges for CJK Unified Ideographs (BMP only for ES5 compat)
const CHINESE_REGEX = /[一-鿿㐀-䶿]/;

function isChinese(char: string): boolean {
  return CHINESE_REGEX.test(char);
}

function extractToneFromNum(num: number): Tone {
  if (num >= 1 && num <= 4) return num as Tone;
  if (num === 5) return 5;
  return 0;
}

function processSentence(
  raw: string,
  paraIdx: number,
  sentIdx: number,
  globalOffset: number
): ProcessedChar[] {
  if (!raw.trim()) return [];

  // Pass full sentence for context-aware polyphonic disambiguation
  // Use type: 'all' which returns AllData[] with origin, pinyin, num fields
  const results = pinyin(raw, {
    type: 'all',
    toneType: 'num',
    nonZh: 'consecutive',
  });

  let globalIndex = globalOffset;
  const chars: ProcessedChar[] = [];

  results.forEach((result, i) => {
    const origin = result.origin;
    const chinese = isChinese(origin);

    // 'consecutive' may group non-Chinese chars; split them individually
    if (!chinese && origin.length > 1) {
      origin.split('').forEach((ch, j) => {
        chars.push({
          char: ch,
          pinyin: ch,
          pinyinNum: ch,
          tone: 0,
          isChinese: false,
          globalIndex: globalIndex++,
          sentenceIndex: i + j,
          paraIndex: paraIdx,
          sentIdx,
        });
      });
    } else {
      // result.num is the tone number (1-5), result.pinyin is like "ni3" when toneType:'num'
      // Get tone-marked pinyin by processing just this char separately
      const pinyinMarked = chinese
        ? pinyin(origin, { toneType: 'symbol', type: 'string' })
        : origin;

      // result.num from AllData is a number (1-5)
      const toneNum = (result as unknown as { num: number }).num;
      const tone: Tone = chinese ? extractToneFromNum(toneNum) : 0;

      chars.push({
        char: origin,
        pinyin: pinyinMarked,
        pinyinNum: result.pinyin, // e.g. "ni3" when toneType: 'num'
        tone,
        isChinese: chinese,
        globalIndex: globalIndex++,
        sentenceIndex: i,
        paraIndex: paraIdx,
        sentIdx,
      });
    }
  });

  return chars;
}

export function processText(rawText: string): ProcessedText {
  const paragraphs = rawText.split(/\n\n+/).filter(p => p.trim());
  const result: ProcessedText = [];
  let globalIndex = 0;

  paragraphs.forEach((paraRaw, paraIdx) => {
    // Split by sentence-ending punctuation
    const sentenceRaws = paraRaw
      .split(/(?<=[。！？…\n])/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // If no sentence-ending punctuation, treat whole paragraph as one sentence
    const finalSentences = sentenceRaws.length > 0 ? sentenceRaws : [paraRaw];

    const sentences: ProcessedSentence[] = [];

    finalSentences.forEach((sentRaw, sentIdx) => {
      const startGlobalIndex = globalIndex;
      const chars = processSentence(sentRaw, paraIdx, sentIdx, globalIndex);
      globalIndex += chars.length;

      sentences.push({
        chars,
        raw: sentRaw,
        sentIdx,
        paraIdx,
        startGlobalIndex,
        endGlobalIndex: globalIndex - 1,
      });
    });

    result.push({
      sentences,
      paraIdx,
      startGlobalIndex: sentences[0]?.startGlobalIndex ?? globalIndex,
      endGlobalIndex: sentences[sentences.length - 1]?.endGlobalIndex ?? globalIndex - 1,
    });
  });

  return result;
}

export function flattenChars(processedText: ProcessedText): ProcessedChar[] {
  return processedText.flatMap(para =>
    para.sentences.flatMap(sent => sent.chars)
  );
}

export function buildTextFromIndices(
  processedText: ProcessedText,
  selectedIndices: Set<number>
): string {
  const all = flattenChars(processedText);
  // Keep punctuation in the output so the TTS engine produces natural
  // sentence-level pauses; filtering to isChinese would strip them.
  return all
    .filter(c => selectedIndices.has(c.globalIndex))
    .map(c => c.char)
    .join('');
}

export { customPinyin };
