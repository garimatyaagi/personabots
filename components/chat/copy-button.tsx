"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-border/50 text-muted-fg/60 shadow-sm transition-all hover:bg-white hover:text-muted-fg hover:shadow-md press-effect"
      title="Copy message"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-600" strokeWidth={2} />
      ) : (
        <Copy className="h-3 w-3" strokeWidth={2} />
      )}
    </button>
  );
}
