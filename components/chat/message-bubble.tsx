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
  botAvatarUrl?: string | null;
}

export function MessageBubble({ message, botName, botAvatarUrl }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isTyping = message.isStreaming && !message.content;

  return (
    <div
      className={cn(
        "group flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isUser && <Avatar name={botName} src={botAvatarUrl} size="sm" />}

      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className={cn(
            "relative rounded-xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-[#f8faed]"
              : "bg-[var(--surface-strong,rgba(255,255,255,0.8))] border border-border"
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
              {/* Copy button: visible on mobile, hover-reveal on desktop */}
              <div className="absolute -top-1 -right-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
