"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { SuggestedPrompts } from "./suggested-prompts";
import { v4 as uuidv4 } from "uuid";
import type { ChatMessage } from "@/types";

interface ChatWindowProps {
  botSlug: string;
  botName: string;
  suggestedPrompts?: string[];
  welcomeMessage?: string;
}

export function ChatWindow({
  botSlug,
  botName,
  suggestedPrompts = [],
  welcomeMessage,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (welcomeMessage) {
      return [
        {
          id: "welcome",
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ];
    }
    return [];
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId] = useState(() => uuidv4());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
          botSlug,
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

      // Finalize
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

  const showSuggestions = messages.length <= 1 && suggestedPrompts.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} botName={botName} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {showSuggestions && (
        <div className="px-4 pb-2">
          <SuggestedPrompts prompts={suggestedPrompts} onSelect={sendMessage} />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4">
        <ChatInput
          onSend={sendMessage}
          disabled={isStreaming}
          placeholder={`Ask ${botName} anything...`}
        />
      </div>
    </div>
  );
}
