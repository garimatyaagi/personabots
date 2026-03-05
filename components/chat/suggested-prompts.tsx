"use client";

import { Button } from "@/components/ui/button";

interface SuggestedPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ prompts, onSelect }: SuggestedPromptsProps) {
  if (prompts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt, i) => (
        <Button
          key={i}
          variant="secondary"
          size="sm"
          onClick={() => onSelect(prompt)}
          className="text-xs"
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
}
