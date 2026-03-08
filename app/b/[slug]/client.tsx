"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar } from "@/components/ui/avatar";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { ProfileSidebar } from "@/components/bot/profile-sidebar";
import { FollowUpSuggestions } from "@/components/chat/follow-up-suggestions";
import { useChatPersistence } from "@/lib/hooks/use-chat-persistence";
import { getThemeById, getThemeCSSVars } from "@/lib/themes";
import {
  Bot,
  Sparkles,
  ChevronDown,
  PanelRight,
  User,
  Calendar,
  MessageSquare,
  Briefcase,
  Lightbulb,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import type { ChatMessage, SocialLinks, CustomLink, BotTheme } from "@/types";

type BotMode = "default" | "hiring" | "consulting";

const MODE_CONFIG: Record<BotMode, {
  label: string;
  icon: React.ElementType;
  description: string;
  starterPrompts: string[];
}> = {
  default: {
    label: "General",
    icon: MessageSquare,
    description: "General conversation",
    starterPrompts: [],
  },
  hiring: {
    label: "Hiring",
    icon: Briefcase,
    description: "Recruiter & interview mode",
    starterPrompts: [
      "Tell me about yourself",
      "Walk me through your resume",
      "What are your key strengths?",
      "Why should we consider you for this role?",
    ],
  },
  consulting: {
    label: "Consulting",
    icon: Lightbulb,
    description: "Problem-solving & advisory mode",
    starterPrompts: [
      "What's your approach to solving complex problems?",
      "Tell me about a challenging project you led",
      "How do you approach strategic planning?",
      "What frameworks do you use for decision-making?",
    ],
  },
};

interface PublicBotClientProps {
  bot: {
    name: string;
    slug: string;
    description: string | null;
    avatar_url: string | null;
    tone: number;
    headline: string | null;
    social_links: SocialLinks;
    skills: string[];
    about: string | null;
    theme: BotTheme;
    custom_links: CustomLink[];
    highlights: string[];
    calendar_url?: string | null;
  };
  capabilities: string[];
  suggestedPrompts: string[];
  useCaseType: string;
  initialMode?: BotMode;
}

export function PublicBotClient({
  bot,
  capabilities,
  suggestedPrompts,
  useCaseType,
  initialMode = "default",
}: PublicBotClientProps) {
  // Chat persistence
  const {
    initialMessages,
    initialConversationId,
    restored,
    saveMessages,
  } = useChatPersistence(bot.slug);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId] = useState(() => {
    // Persist visitor ID across page refreshes
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(`personal_visitor_${bot.slug}`);
      if (stored) return stored;
      const newId = uuidv4();
      sessionStorage.setItem(`personal_visitor_${bot.slug}`, newId);
      return newId;
    }
    return uuidv4();
  });
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [mode, setMode] = useState<BotMode>(initialMode);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  // Get mode-appropriate prompts
  const modeConfig = MODE_CONFIG[mode];
  const activePrompts =
    mode !== "default" && modeConfig.starterPrompts.length > 0
      ? modeConfig.starterPrompts
      : suggestedPrompts;

  // Compute theme CSS variables
  const themePreset = getThemeById(bot.theme);
  const themeVars = getThemeCSSVars(themePreset);

  // Restore persisted messages
  useEffect(() => {
    if (restored && initialMessages.length > 0) {
      setMessages(initialMessages);
      setConversationId(initialConversationId);
      setMessageCount(initialMessages.length);
    }
  }, [restored, initialMessages, initialConversationId]);

  // Save messages whenever they change (debounced by non-streaming state)
  useEffect(() => {
    if (!isStreaming && messages.length > 0) {
      saveMessages(messages, conversationId);
    }
  }, [messages, isStreaming, conversationId, saveMessages]);

  // Default sidebar open on desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setSidebarOpen(mq.matches);
  }, []);

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

  // Fetch follow-up suggestions after assistant response
  const fetchFollowUps = useCallback(
    async (lastMessage: string) => {
      // For first 2 exchanges (4 messages = 2 user + 2 assistant), use static playbook prompts
      if (messageCount <= 4 && activePrompts.length > 0) {
        const shuffled = [...activePrompts].sort(() => Math.random() - 0.5);
        setFollowUps(shuffled.slice(0, 3));
        return;
      }

      // For later exchanges, use AI-generated suggestions
      setFollowUpsLoading(true);
      try {
        const res = await fetch("/api/chat/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            botSlug: bot.slug,
            lastAssistantMessage: lastMessage,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setFollowUps(data.suggestions || []);
        }
      } catch {
        // Fail silently
      } finally {
        setFollowUpsLoading(false);
      }
    },
    [bot.slug, messageCount, activePrompts]
  );

  async function sendMessage(content: string) {
    if (isStreaming) return;

    // Clear follow-ups when sending new message
    setFollowUps([]);

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
    setMessageCount((c) => c + 2);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botSlug: bot.slug,
          message: content,
          conversationId,
          visitorId,
          mode: mode !== "default" ? mode : undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        const errorMsg = error.error || "Chat failed";
        // Provide user-friendly messages for common errors
        const friendlyMsg =
          res.status === 429
            ? "You're sending messages too quickly. Please wait a moment and try again."
            : errorMsg;
        throw new Error(friendlyMsg);
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

      // Fetch follow-up suggestions after stream completes
      if (fullContent) {
        fetchFollowUps(fullContent);
      }
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

  // Retry failed messages
  function handleRetry(errorMessage: ChatMessage) {
    // Find the user message that preceded this error
    const idx = messages.findIndex((m) => m.id === errorMessage.id);
    if (idx > 0) {
      const userMsg = messages[idx - 1];
      if (userMsg.role === "user") {
        // Remove the error message and the user message, then resend
        setMessages((prev) => prev.filter((m) => m.id !== errorMessage.id && m.id !== userMsg.id));
        setMessageCount((c) => c - 2);
        sendMessage(userMsg.content);
      }
    }
  }

  // Find last assistant message for feedback
  const lastAssistantIdx = messages.reduce((last, m, i) => {
    if (m.role === "assistant" && !m.isStreaming) return i;
    return last;
  }, -1);

  return (
    <div
      className="flex h-dvh bg-bg"
      style={themeVars as React.CSSProperties}
    >
      {/* Chat column */}
      <div className="relative flex flex-1 min-w-0 flex-col">
        {/* Sticky header with glass effect */}
        <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-bg/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-3">
              <Avatar name={bot.name} src={bot.avatar_url} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold text-sm">{bot.name}</h1>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                </div>
                <p className="text-xs text-muted-fg line-clamp-1">
                  {bot.headline || `${useCaseType} assistant`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Mode selector */}
              <div className="hidden sm:flex items-center gap-0.5 rounded-lg border border-border bg-accent/30 p-0.5">
                {(Object.keys(MODE_CONFIG) as BotMode[]).map((m) => {
                  const config = MODE_CONFIG[m];
                  const Icon = config.icon;
                  const isActive = mode === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-bg text-fg shadow-sm"
                          : "text-muted-fg hover:text-fg"
                      }`}
                      title={config.description}
                    >
                      <Icon className="h-3 w-3" strokeWidth={1.75} />
                      {config.label}
                    </button>
                  );
                })}
              </div>

              {/* Calendar booking button */}
              {bot.calendar_url && (
                <a
                  href={bot.calendar_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-all press-effect"
                  title="Book a meeting"
                >
                  <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span className="hidden sm:inline">Book time</span>
                </a>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-fg hover:text-text hover:bg-accent/40 transition-all"
                title={sidebarOpen ? "Close profile" : "View profile"}
                aria-label={sidebarOpen ? "Close profile sidebar" : "Open profile sidebar"}
              >
                {sidebarOpen ? (
                  <PanelRight className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <User className="h-4 w-4" strokeWidth={1.75} />
                )}
              </button>
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-fg hover:text-text hover:bg-accent/40 transition-all"
                aria-label="Go to Personal homepage"
              >
                <Bot className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Personal</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Chat area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            /* Welcome screen */
            <div className="flex h-full flex-col items-center justify-center px-4 py-12">
              <div className="flex flex-col items-center gap-5 max-w-md text-center">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent shadow-sm">
                    <Avatar name={bot.name} src={bot.avatar_url} size="lg" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 ring-2 ring-bg">
                    <Sparkles className="h-3 w-3 text-white" strokeWidth={2} />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold">{bot.name}</h2>
                  {bot.headline && (
                    <p className="mt-1 text-sm text-muted-fg">
                      {bot.headline}
                    </p>
                  )}
                  {bot.description && (
                    <p className="mt-2 text-sm text-muted-fg/80 leading-relaxed">
                      {bot.description}
                    </p>
                  )}
                </div>

                {/* Mode indicator when non-default */}
                {mode !== "default" && (
                  <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 border border-primary/10 rounded-full px-3 py-1">
                    {(() => {
                      const Icon = modeConfig.icon;
                      return <Icon className="h-3 w-3" strokeWidth={1.75} />;
                    })()}
                    {modeConfig.description}
                  </div>
                )}

                {/* Mobile mode selector */}
                <div className="flex sm:hidden items-center gap-1 rounded-lg border border-border bg-accent/30 p-0.5">
                  {(Object.keys(MODE_CONFIG) as BotMode[]).map((m) => {
                    const config = MODE_CONFIG[m];
                    const Icon = config.icon;
                    const isActive = mode === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                          isActive
                            ? "bg-bg text-fg shadow-sm"
                            : "text-muted-fg hover:text-fg"
                        }`}
                      >
                        <Icon className="h-3 w-3" strokeWidth={1.75} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                {/* Calendar booking CTA */}
                {bot.calendar_url && (
                  <a
                    href={bot.calendar_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-all press-effect"
                  >
                    <Calendar className="h-4 w-4" strokeWidth={1.75} />
                    Book a meeting with {bot.name.split(" ")[0]}
                  </a>
                )}

                {/* Inline suggested prompts for welcome */}
                {activePrompts.length > 0 && (
                  <div className="mt-2 w-full max-w-sm flex flex-col gap-2">
                    <p className="text-xs font-medium text-muted-fg flex items-center justify-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Start a conversation
                    </p>
                    <div className="flex flex-col gap-2">
                      {activePrompts.slice(0, 4).map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(prompt)}
                          className="group/prompt rounded-xl border border-border bg-[var(--surface,rgba(255,255,255,0.6))] px-4 py-3 text-left text-sm text-text transition-all hover:border-primary/30 hover:bg-accent/20 hover:shadow-sm press-effect"
                          style={{
                            animationDelay: `${i * 80}ms`,
                            animationFillMode: "backwards",
                          }}
                        >
                          <span className="flex items-center justify-between gap-2">
                            {prompt}
                            <Sparkles className="h-3 w-3 text-muted-fg/30 group-hover/prompt:text-primary transition-colors shrink-0" strokeWidth={1.75} />
                          </span>
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
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  botName={bot.name}
                  botAvatarUrl={bot.avatar_url}
                  onRetry={handleRetry}
                  isLastAssistant={i === lastAssistantIdx}
                />
              ))}

              {/* Follow-up suggestions */}
              {!isStreaming && (followUps.length > 0 || followUpsLoading) && (
                <div className="pt-1">
                  <FollowUpSuggestions
                    suggestions={followUps}
                    onSelect={sendMessage}
                    loading={followUpsLoading}
                  />
                </div>
              )}

              {/* Calendar CTA after 3+ exchanges */}
              {bot.calendar_url && messageCount >= 6 && !isStreaming && (
                <div className="flex justify-center pt-2 animate-fade-in">
                  <a
                    href={bot.calendar_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-all press-effect"
                  >
                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Want to continue this conversation live? Book a meeting
                  </a>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollBtn && hasMessages && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={scrollToBottom}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-[var(--surface,rgba(255,255,255,0.9))] shadow-lg transition-all hover:bg-accent/30 hover:shadow-xl press-effect"
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="h-4 w-4 text-text" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Input bar */}
        <div className="shrink-0 border-t border-border bg-bg/80 backdrop-blur-xl">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <ChatInput
              onSend={sendMessage}
              disabled={isStreaming}
              placeholder={`Ask ${bot.name} anything...`}
            />
            <p className="mt-2 text-center text-[10px] text-muted-fg/50">
              Powered by{" "}
              <Link
                href="/"
                className="underline hover:text-muted-fg transition-colors"
              >
                Personal
              </Link>
              {" | "}
              <Link
                href="/pricing"
                className="underline hover:text-muted-fg transition-colors"
              >
                Create yours
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Profile sidebar */}
      <ProfileSidebar
        bot={bot}
        capabilities={capabilities}
        suggestedPrompts={activePrompts}
        onPromptSelect={sendMessage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        mode={mode}
      />
    </div>
  );
}
