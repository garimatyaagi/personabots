"use client";

import { Sparkles } from "lucide-react";

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  loading?: boolean;
}

export function FollowUpSuggestions({
  suggestions,
  onSelect,
  loading = false,
}: FollowUpSuggestionsProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 animate-fade-in px-1">
        <Sparkles className="h-3 w-3 text-muted-fg animate-pulse" strokeWidth={1.75} />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-24 rounded-full bg-[var(--surface,rgba(255,255,255,0.6))] border border-border animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 animate-fade-in px-1">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelect(suggestion)}
          className="rounded-full border border-border bg-[var(--surface,rgba(255,255,255,0.6))] px-3.5 py-1.5 text-xs text-text transition-all hover:border-primary/30 hover:bg-accent/20 hover:shadow-sm"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
