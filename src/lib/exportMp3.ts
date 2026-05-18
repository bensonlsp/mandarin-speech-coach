function makeFilename(text: string): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);
  const slug = text.replace(/\s+/g, '').slice(0, 12);
  return `speech_${slug}_${stamp}.mp3`;
}

export async function exportMp3(text: string, rate = 0.85): Promise<void> {
  if (!text.trim()) return;
  const ratePercent = Math.round((rate - 1) * 100);

  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, rate: ratePercent }),
  });
  if (!res.ok) throw new Error(`TTS export failed: ${res.status}`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = makeFilename(text);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
