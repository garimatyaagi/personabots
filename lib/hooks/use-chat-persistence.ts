"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChatMessage } from "@/types";

const STORAGE_PREFIX = "personal_chat_";
const MAX_STORED_CONVERSATIONS = 20;

interface StoredConversation {
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  conversationId: string | null;
  updatedAt: string;
}

/**
 * Persists chat messages to sessionStorage so conversations survive page refreshes.
 * Uses sessionStorage (not localStorage) so conversations are tab-scoped.
 */
export function useChatPersistence(botSlug: string) {
  const storageKey = `${STORAGE_PREFIX}${botSlug}`;

  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [initialConversationId, setInitialConversationId] = useState<
    string | null
  >(null);
  const [restored, setRestored] = useState(false);

  // Restore on mount
  useEffect(() => {
    if (typeof window === "undefined") {
      setRestored(true);
      return;
    }

    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed: StoredConversation = JSON.parse(stored);
        // Only restore if less than 1 hour old
        const age =
          Date.now() - new Date(parsed.updatedAt).getTime();
        if (age < 60 * 60 * 1000) {
          const msgs: ChatMessage[] = parsed.messages.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp),
            isStreaming: false,
          }));
          setInitialMessages(msgs);
          setInitialConversationId(parsed.conversationId);
        } else {
          sessionStorage.removeItem(storageKey);
        }
      }
    } catch {
      // Fail silently
    }
    setRestored(true);
  }, [storageKey]);

  // Save function
  const saveMessages = useCallback(
    (messages: ChatMessage[], conversationId: string | null) => {
      if (typeof window === "undefined") return;
      if (messages.length === 0) {
        sessionStorage.removeItem(storageKey);
        return;
      }

      // Only save completed (non-streaming) messages
      const completedMessages = messages
        .filter((m) => !m.isStreaming)
        .map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.toISOString(),
        }));

      if (completedMessages.length === 0) return;

      const data: StoredConversation = {
        messages: completedMessages,
        conversationId,
        updatedAt: new Date().toISOString(),
      };

      try {
        sessionStorage.setItem(storageKey, JSON.stringify(data));
        cleanupOldConversations();
      } catch {
        // Storage full - clear old entries
        cleanupOldConversations();
      }
    },
    [storageKey]
  );

  return {
    initialMessages,
    initialConversationId,
    restored,
    saveMessages,
  };
}

function cleanupOldConversations() {
  if (typeof window === "undefined") return;

  const entries: Array<{ key: string; updatedAt: number }> = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      try {
        const data = JSON.parse(sessionStorage.getItem(key) || "{}");
        entries.push({
          key,
          updatedAt: new Date(data.updatedAt || 0).getTime(),
        });
      } catch {
        sessionStorage.removeItem(key!);
      }
    }
  }

  // Keep only the most recent conversations
  if (entries.length > MAX_STORED_CONVERSATIONS) {
    entries.sort((a, b) => b.updatedAt - a.updatedAt);
    entries.slice(MAX_STORED_CONVERSATIONS).forEach((e) => {
      sessionStorage.removeItem(e.key);
    });
  }
}
