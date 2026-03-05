"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { Bot, Sparkles, ChevronDown } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import type { ChatMessage } from "@/types";

interface PublicBotClientProps {
  bot: {
    name: string;
    slug: string;
    description: string | null;
    avatar_url: string | null;
    tone: number;
  };
  capabilities: string[];
  suggestedPrompts: string[];
  useCaseType: string;
}

export function PublicBotClient({
  bot,
  capabilities,
  suggestedPrompts,
  useCaseType,
}: PublicBotClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId] = useState(() => uuidv4());
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    function handleScroll() {
      if (!container) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    }
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  async function sendMessage(content: string) {
    if (isStreaming) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botSlug: bot.slug,
          message: content,
          conversationId,
          visitorId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Chat failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, content: fullContent }
                    : m
                )
              );
            }
            if (parsed.conversationId && !conversationId) {
              setConversationId(parsed.conversationId);
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: fullContent, isStreaming: false }
            : m
        )
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Something went wrong";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? {
                ...m,
                content: `Sorry, I encountered an error: ${errorMsg}`,
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="relative flex h-dvh flex-col bg-bg">
      {/* Compact header */}
      <header className="shrink-0 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <Avatar name={bot.name} src={bot.avatar_url} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-sm">{bot.name}</h1>
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
              <p className="text-xs text-muted-fg capitalize">
                {useCaseType} assistant
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-fg hover:text-text hover:bg-accent/40 transition-all"
          >
            <Bot className="h-3.5 w-3.5" strokeWidth={1.75} />
            PersonaBots
          </Link>
        </div>
      </header>

      {/* Chat area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          /* Welcome screen */
          <div className="flex h-full flex-col items-center justify-center px-4 py-12">
            <div className="flex flex-col items-center gap-4 max-w-md text-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent">
                  <Avatar name={bot.name} src={bot.avatar_url} size="lg" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 ring-2 ring-bg">
                  <Sparkles className="h-3 w-3 text-white" strokeWidth={2} />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold">{bot.name}</h2>
                {bot.description && (
                  <p className="mt-1.5 text-sm text-muted-fg leading-relaxed">
                    {bot.description}
                  </p>
                )}
              </div>

              {capabilities.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                  {capabilities.map((cap, i) => (
                    <Badge key={i} variant="muted" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              )}

              {suggestedPrompts.length > 0 && (
                <div className="mt-4 w-full max-w-sm flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted-fg flex items-center justify-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Try asking
                  </p>
                  <div className="flex flex-col gap-2">
                    {suggestedPrompts.slice(0, 4).map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(prompt)}
                        className="rounded-xl border border-border bg-white/60 px-4 py-3 text-left text-sm text-text transition-all hover:border-primary/30 hover:bg-accent/20 hover:shadow-sm"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="mx-auto max-w-3xl px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} botName={bot.name} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollBtn && hasMessages && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={scrollToBottom}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white shadow-md transition-all hover:bg-accent/30"
          >
            <ChevronDown className="h-4 w-4 text-text" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 border-t border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <ChatInput
            onSend={sendMessage}
            disabled={isStreaming}
            placeholder={`Ask ${bot.name} anything...`}
          />
          <p className="mt-2 text-center text-[10px] text-muted-fg/60">
            Powered by PersonaBots &mdash; AI responses may not always be
            accurate
          </p>
        </div>
      </div>
    </div>
  );
}
