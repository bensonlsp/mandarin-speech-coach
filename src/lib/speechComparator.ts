import type { CharAlignment, ComparisonResult } from './types';

function normalizeChinese(text: string): string {
  return text.replace(/[^一-鿿㐀-䶿]/g, '');
}

function lcs(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function buildAlignment(expected: string, recognized: string): CharAlignment[] {
  const alignment: CharAlignment[] = [];
  const m = expected.length, n = recognized.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = expected[i - 1] === recognized[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);

  let i = m, j = n;
  const result: CharAlignment[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && expected[i - 1] === recognized[j - 1]) {
      result.push({ char: expected[i - 1], status: 'correct' });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({ char: recognized[j - 1], status: 'extra' });
      j--;
    } else {
      result.push({ char: expected[i - 1], status: 'missed' });
      i--;
    }
  }

  return result.reverse();
}

export function compareSpeech(expected: string, recognized: string): ComparisonResult {
  const normExpected = normalizeChinese(expected);
  const normRecognized = normalizeChinese(recognized);

  if (!normExpected) {
    return { accuracy: 0, alignment: [], expectedText: expected, recognizedText: recognized };
  }

  const commonLen = lcs(normExpected, normRecognized);
  const accuracy = Math.round((commonLen / normExpected.length) * 100);
  const alignment = buildAlignment(normExpected, normRecognized);

  return { accuracy, alignment, expectedText: normExpected, recognizedText: normRecognized };
}
