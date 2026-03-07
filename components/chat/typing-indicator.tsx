"use client";

interface TypingIndicatorProps {
  botName: string;
}

export function TypingIndicator({ botName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        <span
          className="h-1.5 w-1.5 rounded-full bg-muted-fg/50 animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1s" }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-muted-fg/50 animate-bounce"
          style={{ animationDelay: "150ms", animationDuration: "1s" }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-muted-fg/50 animate-bounce"
          style={{ animationDelay: "300ms", animationDuration: "1s" }}
        />
      </div>
      <span className="text-xs text-muted-fg">{botName} is typing</span>
    </div>
  );
}
