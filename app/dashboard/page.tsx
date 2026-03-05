"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotCard } from "@/components/dashboard/bot-card";
import { Loading } from "@/components/shared/loading";
import { Plus, Bot } from "lucide-react";
import type { BotWithUseCase } from "@/types";

export default function DashboardPage() {
  const [bots, setBots] = useState<BotWithUseCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBots() {
      try {
        const res = await fetch("/api/bots");
        const data = await res.json();
        setBots(data.bots || []);
      } catch (error) {
        console.error("Failed to fetch bots:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBots();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-heading">
            Your Bots
          </h1>
          <p className="text-sm text-muted-fg">
            Create and manage your personal AI chatbots.
          </p>
        </div>
        <Link href="/bot/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            New Bot
          </Button>
        </Link>
      </div>

      {loading ? (
        <Loading text="Loading your bots..." />
      ) : bots.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
            <Bot className="h-8 w-8 text-text" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold">No bots yet</h2>
          <p className="max-w-sm text-sm text-muted-fg">
            Create your first bot to start sharing your AI-powered persona with
            the world.
          </p>
          <Link href="/bot/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              Create your first bot
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      )}
    </div>
  );
}
