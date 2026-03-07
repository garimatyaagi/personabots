"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SkillsInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
}

export function SkillsInput({
  skills,
  onChange,
  maxSkills = 20,
}: SkillsInputProps) {
  const [input, setInput] = useState("");

  function addSkill(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (trimmed.length > 50) return;
    if (skills.length >= maxSkills) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;

    onChange([...skills, trimmed]);
    setInput("");
  }

  function removeSkill(index: number) {
    onChange(skills.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(input);
    }
    if (e.key === "Backspace" && !input && skills.length > 0) {
      removeSkill(skills.length - 1);
    }
  }

  return (
    <div>
      <label className="text-sm font-medium">Skills / Tags</label>
      <p className="text-xs text-muted-fg mb-2">
        Press Enter or comma to add. Max {maxSkills} skills.
      </p>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-input-bg px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
        {skills.map((skill, i) => (
          <Badge key={i} variant="default" className="gap-1 pr-1">
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(i)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
            >
              <X className="h-2.5 w-2.5" strokeWidth={2.5} />
            </button>
          </Badge>
        ))}
        {skills.length < maxSkills && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => addSkill(input)}
            placeholder={skills.length === 0 ? "e.g., React, Python, Product Management" : "Add more..."}
            className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-fg/50"
          />
        )}
      </div>
    </div>
  );
}
