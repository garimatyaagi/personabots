"use client";

interface TypingIndicatorProps {
  botName: string;
}

export function TypingIndicator({ botName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2.5 py-0.5">
      <div className="flex gap-[5px]">
        <span
          className="h-[6px] w-[6px] rounded-full bg-muted-fg/40"
          style={{
            animation: "typing-dot 1.2s ease-in-out infinite",
            animationDelay: "0ms",
          }}
        />
        <span
          className="h-[6px] w-[6px] rounded-full bg-muted-fg/40"
          style={{
            animation: "typing-dot 1.2s ease-in-out infinite",
            animationDelay: "200ms",
          }}
        />
        <span
          className="h-[6px] w-[6px] rounded-full bg-muted-fg/40"
          style={{
            animation: "typing-dot 1.2s ease-in-out infinite",
            animationDelay: "400ms",
          }}
        />
      </div>
      <span className="text-xs text-muted-fg/60 font-medium">
        {botName} is thinking
      </span>
    </div>
  );
}
