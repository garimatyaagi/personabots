"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface MessageFeedbackProps {
  messageId: string;
}

export function MessageFeedback({ messageId }: MessageFeedbackProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  function handleFeedback(type: "up" | "down") {
    setFeedback(type === feedback ? null : type);
    // Could send to analytics endpoint in the future
  }

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => handleFeedback("up")}
        className={`flex h-6 w-6 items-center justify-center rounded-md transition-all ${
          feedback === "up"
            ? "bg-green-100 text-green-600"
            : "text-muted-fg/40 hover:text-muted-fg hover:bg-accent/30"
        }`}
        title="Helpful"
        aria-label="Mark as helpful"
      >
        <ThumbsUp className="h-3 w-3" strokeWidth={1.75} />
      </button>
      <button
        onClick={() => handleFeedback("down")}
        className={`flex h-6 w-6 items-center justify-center rounded-md transition-all ${
          feedback === "down"
            ? "bg-red-100 text-red-500"
            : "text-muted-fg/40 hover:text-muted-fg hover:bg-accent/30"
        }`}
        title="Not helpful"
        aria-label="Mark as not helpful"
      >
        <ThumbsDown className="h-3 w-3" strokeWidth={1.75} />
      </button>
    </div>
  );
}
