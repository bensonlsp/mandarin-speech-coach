import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "text-blue-400",
    "text-green-400",
    "text-amber-400",
    "text-red-400",
    "text-slate-400",
    "text-slate-500",
    "bg-blue-400/20",
    "bg-green-400/20",
    "bg-amber-400/20",
    "bg-red-400/20",
    "ring-blue-400",
    "ring-green-400",
    "ring-amber-400",
    "ring-red-400",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["PingFang SC", "Noto Sans SC", "Microsoft YaHei", "system-ui", "sans-serif"],
        chinese: ["PingFang SC", "Noto Sans SC", "Microsoft YaHei", "sans-serif"],
      },
      colors: {
        tone: {
          1: "#60a5fa",
          2: "#4ade80",
          3: "#fbbf24",
          4: "#f87171",
          neutral: "#94a3b8",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
