import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1B2D",
          soft: "#16263D",
          line: "#26344A",
        },
        canvas: "#F6F7FB",
        card: "#FFFFFF",
        border: "#E4E7EF",
        muted: "#647088",
        hr: {
          DEFAULT: "#0E9F77",
          soft: "#E4F6EE",
        },
        payroll: {
          DEFAULT: "#D97B1F",
          soft: "#FBEADB",
        },
        danger: "#D6453D",
      },
      fontFamily: {
        display: ["var(--font-display)", "Sora", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15, 27, 45, 0.04), 0 1px 8px -2px rgba(15, 27, 45, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
