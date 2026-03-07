"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Trophy } from "lucide-react";

interface HighlightsInputProps {
  highlights: string[];
  onChange: (highlights: string[]) => void;
}

export function HighlightsInput({ highlights, onChange }: HighlightsInputProps) {
  const [inputValue, setInputValue] = useState("");

  function addHighlight() {
    const trimmed = inputValue.trim();
    if (!trimmed || highlights.length >= 10 || trimmed.length > 200) return;
    onChange([...highlights, trimmed]);
    setInputValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addHighlight();
    }
  }

  function removeHighlight(index: number) {
    onChange(highlights.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="text-sm font-medium flex items-center gap-1.5">
        <Trophy className="h-3.5 w-3.5 text-muted-fg" strokeWidth={1.75} />
        Highlights & Achievements
      </label>
      <p className="text-xs text-muted-fg mb-2">
        Top accomplishments, stats, or quick facts visitors should know
      </p>

      {highlights.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-2">
          {highlights.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
            >
              <span className="text-sm flex-1">{item}</span>
              <button
                type="button"
                onClick={() => removeHighlight(i)}
                className="text-muted-fg hover:text-primary transition-colors"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      )}

      {highlights.length < 10 && (
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., 10+ years in product design"
            maxLength={200}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addHighlight}
            disabled={!inputValue.trim()}
            className="shrink-0 gap-1"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
