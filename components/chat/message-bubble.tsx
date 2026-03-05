"use client";

import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  botName: string;
}

export function MessageBubble({ message, botName }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isUser && <Avatar name={botName} size="sm" />}

      <div
        className={cn(
          "max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-[#f8faed]"
            : "bg-white/80 border border-border"
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5 -mb-0.5" />
        )}
      </div>
    </div>
  );
}
