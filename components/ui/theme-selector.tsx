"use client";

import { THEME_PRESETS } from "@/lib/themes";
import { cn } from "@/lib/utils/cn";
import { Check } from "lucide-react";
import type { BotTheme } from "@/types";

interface ThemeSelectorProps {
  value: BotTheme;
  onChange: (theme: BotTheme) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium">Theme</label>
      <p className="text-xs text-muted-fg mb-3">
        Choose a color theme for your public bot page
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
        {THEME_PRESETS.map((theme) => {
          const selected = value === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all",
                selected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-border-strong"
              )}
            >
              <div className="relative">
                <div
                  className="h-8 w-8 rounded-full border border-border/50"
                  style={{ background: `linear-gradient(135deg, ${theme.bg} 50%, ${theme.primary} 50%)` }}
                />
                {selected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-medium text-muted-fg">
                {theme.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
