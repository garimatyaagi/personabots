"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Clock, Search, ArrowLeft, Users } from "lucide-react";

interface ConversationSummary {
  id: string;
  visitor_id: string | null;
  title: string;
  message_count: number;
  created_at: string;
  preview: string;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ConversationsPage() {
  const params = useParams();
  const botId = params.botId as string;
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/conversations?botId=${botId}`);
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [botId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 page-enter">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Link href={`/bot/${botId}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 press-effect">
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-heading">
                Conversations
              </h1>
              <p className="text-sm text-muted-fg">
                {conversations.length} total conversation{conversations.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {!loading && conversations.length > 0 && (
          <div className="mt-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-fg" strokeWidth={1.75} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-xl border border-border bg-white/60 py-2.5 pl-10 pr-4 text-sm text-text placeholder:text-muted-fg/60 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
            </div>
          </div>
        )}

        {loading ? (
          <ConversationsSkeleton />
        ) : conversations.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center gap-4 py-16 text-center animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent/40">
              <Users className="h-7 w-7 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">No conversations yet</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-fg leading-relaxed">
                Share your bot link to start receiving conversations. Each chat
                will appear here with a preview and message count.
              </p>
            </div>
            <Link href={`/bot/${botId}`}>
              <Button variant="secondary" className="gap-2 press-effect">
                Go to bot settings
              </Button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          /* No search results */
          <div className="flex flex-col items-center gap-3 py-12 text-center animate-fade-in">
            <Search className="h-8 w-8 text-muted-fg/30" strokeWidth={1.5} />
            <p className="text-sm text-muted-fg">
              No conversations match &quot;{search}&quot;
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearch("")}
              className="press-effect"
            >
              Clear search
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-fade-in">
            {filtered.map((conv, i) => (
              <Card
                key={conv.id}
                className="card-hover animate-fade-in"
                style={{
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <CardContent className="flex items-start gap-3 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/60">
                    <MessageSquare
                      className="h-4 w-4 text-primary"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-fg line-clamp-2 mt-0.5 leading-relaxed">
                      {conv.preview}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge variant="muted" className="text-xs">
                      {conv.message_count} msg{conv.message_count !== 1 ? "s" : ""}
                    </Badge>
                    <span className="flex items-center gap-1 text-[11px] text-muted-fg/60">
                      <Clock className="h-3 w-3" strokeWidth={1.75} />
                      {formatRelativeDate(conv.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ConversationsSkeleton() {
  return (
    <div className="flex flex-col gap-3 mt-4 animate-fade-in">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-white/60 p-4 flex items-start gap-3"
        >
          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-3 w-full" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}
