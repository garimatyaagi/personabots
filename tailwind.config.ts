import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        text: "var(--text)",
        primary: "var(--primary)",
        accent: "var(--accent)",
        border: "var(--border)",
        muted: "var(--muted)",
        "muted-fg": "var(--muted-fg)",
        "input-bg": "var(--input-bg)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: [
          "3.5rem",
          { lineHeight: "1.1", letterSpacing: "-0.025em" },
        ],
        "display-lg": [
          "4.5rem",
          { lineHeight: "1.05", letterSpacing: "-0.03em" },
        ],
      },
      borderRadius: {
        xl: "16px",
      },
      letterSpacing: {
        heading: "-0.01em",
        "heading-tight": "-0.025em",
        wide: "0.08em",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(24, 23, 23, 0.04)",
        "soft-hover": "0 4px 12px rgba(24, 23, 23, 0.08)",
        mockup:
          "0 25px 50px -12px rgba(24, 23, 23, 0.15), 0 0 0 1px rgba(24, 23, 23, 0.05)",
        "mockup-lg":
          "0 40px 80px -20px rgba(24, 23, 23, 0.2), 0 0 0 1px rgba(24, 23, 23, 0.06)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        "message-appear": {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "typing-dot": {
          "0%, 60%, 100%": { opacity: "0.3", transform: "translateY(0)" },
          "30%": { opacity: "1", transform: "translateY(-4px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "draw-line": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        pulse: "pulse 1.5s ease-in-out infinite",
        "message-appear": "message-appear 0.5s ease-out forwards",
        "typing-dot": "typing-dot 1.2s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "draw-line": "draw-line 0.8s ease-out forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
