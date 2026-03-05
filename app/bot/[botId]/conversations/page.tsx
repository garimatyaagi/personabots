"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/shared/loading";
import { MessageSquare, Clock } from "lucide-react";

interface ConversationSummary {
  id: string;
  visitor_id: string | null;
  title: string;
  message_count: number;
  created_at: string;
  preview: string;
}

export default function ConversationsPage() {
  const params = useParams();
  const botId = params.botId as string;
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-heading mb-2">
          Conversations
        </h1>
        <p className="text-sm text-muted-fg mb-6">
          Recent chats with your bot.
        </p>

        {loading ? (
          <Loading />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
              <MessageSquare className="h-6 w-6 text-text" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-fg">
              No conversations yet. Share your bot link to get started.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {conversations.map((conv) => (
              <Card key={conv.id}>
                <CardContent className="flex items-start gap-3 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent">
                    <MessageSquare
                      className="h-4 w-4 text-text"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-fg line-clamp-2 mt-0.5">
                      {conv.preview}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="muted">{conv.message_count} msgs</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-fg">
                      <Clock className="h-3 w-3" strokeWidth={1.75} />
                      {new Date(conv.created_at).toLocaleDateString()}
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
