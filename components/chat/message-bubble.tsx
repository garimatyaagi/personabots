"use client";

import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { MarkdownContent } from "@/components/chat/markdown-content";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { CopyButton } from "@/components/chat/copy-button";
import { formatRelativeTime } from "@/lib/utils/format-time";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  botName: string;
}

export function MessageBubble({ message, botName }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isTyping = message.isStreaming && !message.content;

  return (
    <div
      className={cn(
        "group flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isUser && <Avatar name={botName} size="sm" />}

      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className={cn(
            "relative rounded-xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-[#f8faed]"
              : "bg-white/80 border border-border"
          )}
        >
          {isTyping ? (
            <TypingIndicator botName={botName} />
          ) : isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : message.isStreaming ? (
            <>
              <div className="whitespace-pre-wrap">{message.content}</div>
              <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5 -mb-0.5" />
            </>
          ) : (
            <>
              <MarkdownContent content={message.content} />
              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <CopyButton text={message.content} />
              </div>
            </>
          )}
        </div>

        {/* Timestamp */}
        <span
          className={cn(
            "text-[10px] text-muted-fg/40 px-1",
            isUser ? "text-right" : "text-left"
          )}
        >
          {formatRelativeTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
