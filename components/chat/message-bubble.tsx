"use client";

import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { MarkdownContent } from "@/components/chat/markdown-content";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { CopyButton } from "@/components/chat/copy-button";
import { MessageFeedback } from "@/components/chat/message-feedback";
import { formatRelativeTime } from "@/lib/utils/format-time";
import { RefreshCw } from "lucide-react";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  botName: string;
  botAvatarUrl?: string | null;
  onRetry?: (message: ChatMessage) => void;
  isLastAssistant?: boolean;
}

export function MessageBubble({
  message,
  botName,
  botAvatarUrl,
  onRetry,
  isLastAssistant = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isTyping = message.isStreaming && !message.content;
  const isError = message.content.startsWith("Sorry, I encountered an error");

  return (
    <div
      className={cn(
        "group flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {!isUser && (
        <div className="shrink-0 mt-0.5">
          <Avatar name={botName} src={botAvatarUrl} size="sm" />
        </div>
      )}

      <div
        className={cn("flex flex-col gap-1 max-w-[80%]", isUser && "items-end")}
      >
        <div
          className={cn(
            "relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-[#f8faed] rounded-tr-md"
              : "bg-[var(--surface-strong,rgba(255,255,255,0.8))] border border-border rounded-tl-md",
            isError && !isUser && "border-red-200 bg-red-50/50"
          )}
        >
          {isTyping ? (
            <TypingIndicator botName={botName} />
          ) : isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : message.isStreaming ? (
            <>
              <div className="whitespace-pre-wrap">{message.content}</div>
              <span className="inline-block w-[3px] h-[14px] bg-primary/60 rounded-full ml-0.5 -mb-0.5 animate-pulse" />
            </>
          ) : (
            <>
              <MarkdownContent content={message.content} />
              {/* Action bar: visible on mobile, hover-reveal on desktop */}
              <div className="absolute -top-1 -right-1 flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <CopyButton text={message.content} />
              </div>
            </>
          )}
        </div>

        {/* Bottom row: timestamp + feedback + retry */}
        <div
          className={cn(
            "flex items-center gap-2 px-1",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-[11px] text-muted-fg/50">
            {formatRelativeTime(message.timestamp)}
          </span>

          {/* Feedback for assistant messages */}
          {!isUser && !message.isStreaming && !isError && isLastAssistant && (
            <MessageFeedback messageId={message.id} />
          )}

          {/* Retry button for error messages */}
          {isError && onRetry && (
            <button
              onClick={() => onRetry(message)}
              className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={2} />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
