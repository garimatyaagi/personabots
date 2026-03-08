"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardPaste, Loader2, Sparkles } from "lucide-react";

interface JobInputProps {
  onSubmit: (text: string) => Promise<void>;
}

export function JobInput({ onSubmit }: JobInputProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || text.trim().length < 20) return;
    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText("");
      setExpanded(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full rounded-2xl border border-dashed border-border bg-white/50 p-6 text-center transition-all duration-300 hover:border-primary/30 hover:bg-white/70 cursor-pointer group"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 group-hover:scale-110">
            <ClipboardPaste
              className="h-5 w-5 text-primary"
              strokeWidth={1.5}
            />
          </div>
          <p className="text-sm font-medium text-fg">Paste a job description</p>
          <p className="text-xs text-muted-fg">
            Add a job posting to get match analysis and tailored content
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white/70 backdrop-blur-sm p-5 space-y-3 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} />
        <h3 className="text-sm font-semibold">Paste a job description</h3>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the full job description here. Include the title, company, requirements, and responsibilities for the best analysis..."
        className="w-full rounded-xl border border-border bg-white p-4 text-sm text-fg placeholder:text-muted-fg/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 resize-none transition-colors min-h-[160px]"
        autoFocus
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-fg">
          {text.trim().length < 20
            ? `${20 - text.trim().length} more characters needed`
            : "Ready to analyze"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setText("");
              setExpanded(false);
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || text.trim().length < 20}
            className="gap-1.5"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {submitting ? "Analyzing..." : "Add job"}
          </Button>
        </div>
      </div>
    </div>
  );
}
