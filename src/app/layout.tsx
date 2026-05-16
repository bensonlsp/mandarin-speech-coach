import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '普通話演講教練',
  description: '幫助您練習普通話演講，生成拼音音調標注，支援 TTS 朗讀及錄音核對',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-HK">
      <body>{children}</body>
    </html>
  );
}
