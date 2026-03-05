"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChatWindow } from "@/components/chat/chat-window";
import { Bot } from "lucide-react";
import Link from "next/link";

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
  const welcomeMessage = `Hi! I'm ${bot.name}. ${bot.description || "How can I help you today?"}`;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar name={bot.name} src={bot.avatar_url} size="md" />
            <div>
              <h1 className="font-semibold">{bot.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {useCaseType}
                </Badge>
                <span className="text-xs text-muted-fg">
                  AI-powered persona
                </span>
              </div>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-muted-fg hover:text-text transition-colors">
            <Bot className="h-3.5 w-3.5" strokeWidth={1.75} />
            PersonaBots
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        {/* Capabilities bar */}
        {capabilities.length > 0 && (
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-medium text-muted-fg mb-2">
              What I can help with:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {capabilities.map((cap, i) => (
                <Badge key={i} variant="muted" className="text-xs">
                  {cap}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="flex-1">
          <ChatWindow
            botSlug={bot.slug}
            botName={bot.name}
            suggestedPrompts={suggestedPrompts}
            welcomeMessage={welcomeMessage}
          />
        </div>
      </div>
    </div>
  );
}
