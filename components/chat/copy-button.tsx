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
      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-fg/50 transition-all hover:bg-[rgba(24,23,23,0.06)] hover:text-muted-fg"
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
