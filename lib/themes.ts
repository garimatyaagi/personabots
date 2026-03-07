import type { BotTheme } from "@/types";

export interface ThemePreset {
  id: BotTheme;
  name: string;
  bg: string;
  text: string;
  primary: string;
  accent: string;
  surface: string;
  primaryHover: string;
  accentHover: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "Default",
    bg: "#f8faed",
    text: "#181717",
    primary: "#a91b18",
    accent: "#cee7f3",
    surface: "rgba(255,255,255,0.6)",
    primaryHover: "#8e1614",
    accentHover: "#b8d9ea",
  },
  {
    id: "ocean",
    name: "Ocean",
    bg: "#f0f7ff",
    text: "#1a2332",
    primary: "#2563eb",
    accent: "#dbeafe",
    surface: "rgba(255,255,255,0.6)",
    primaryHover: "#1d4ed8",
    accentHover: "#bfdbfe",
  },
  {
    id: "forest",
    name: "Forest",
    bg: "#f0fdf4",
    text: "#1a2e1a",
    primary: "#16a34a",
    accent: "#dcfce7",
    surface: "rgba(255,255,255,0.6)",
    primaryHover: "#15803d",
    accentHover: "#bbf7d0",
  },
  {
    id: "sunset",
    name: "Sunset",
    bg: "#fff7ed",
    text: "#2a1a0a",
    primary: "#ea580c",
    accent: "#fed7aa",
    surface: "rgba(255,255,255,0.6)",
    primaryHover: "#c2410c",
    accentHover: "#fdba74",
  },
  {
    id: "midnight",
    name: "Midnight",
    bg: "#1e1e2e",
    text: "#e4e4ef",
    primary: "#818cf8",
    accent: "#2d2d44",
    surface: "rgba(255,255,255,0.08)",
    primaryHover: "#6366f1",
    accentHover: "#3d3d5c",
  },
  {
    id: "lavender",
    name: "Lavender",
    bg: "#faf5ff",
    text: "#2e1a4a",
    primary: "#9333ea",
    accent: "#e9d5ff",
    surface: "rgba(255,255,255,0.6)",
    primaryHover: "#7e22ce",
    accentHover: "#d8b4fe",
  },
  {
    id: "rose",
    name: "Rose",
    bg: "#fff1f2",
    text: "#2a1a1a",
    primary: "#e11d48",
    accent: "#ffe4e6",
    surface: "rgba(255,255,255,0.6)",
    primaryHover: "#be123c",
    accentHover: "#fecdd3",
  },
];

export function getThemeById(id: string): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === id) || THEME_PRESETS[0];
}

function computeAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function getThemeCSSVars(theme: ThemePreset): Record<string, string> {
  return {
    "--bg": theme.bg,
    "--text": theme.text,
    "--primary": theme.primary,
    "--accent": theme.accent,
    "--surface": theme.surface,
    "--surface-strong": theme.id === "midnight" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.8)",
    "--primary-hover": theme.primaryHover,
    "--accent-hover": theme.accentHover,
    "--border": computeAlpha(theme.text, 0.1),
    "--border-strong": computeAlpha(theme.text, 0.18),
    "--muted": computeAlpha(theme.text, 0.05),
    "--muted-fg": computeAlpha(theme.text, 0.5),
    "--input-bg": theme.id === "midnight" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)",
  };
}
