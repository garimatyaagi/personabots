"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotCard } from "@/components/dashboard/bot-card";
import { Loading } from "@/components/shared/loading";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { Plus, Bot, Sparkles, CreditCard, RefreshCw, Share2 } from "lucide-react";
import type { BotWithUseCase } from "@/types";

export default function DashboardPage() {
  const [bots, setBots] = useState<BotWithUseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const { isActive: subActive, loading: subLoading, error: subError, retry } = useSubscription();

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

  const isLoading = loading || subLoading;
  const isPaid = subActive === true;

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
        <div className="flex items-center gap-3">
          <Link href="/dashboard/billing">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-fg">
              <CreditCard className="h-4 w-4" strokeWidth={1.75} />
              Billing
            </Button>
          </Link>
          {isPaid && (
            <Link href="/bot/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" strokeWidth={1.75} />
                New Bot
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Subscription error state */}
      {!isLoading && subError && subActive === null && (
        <div className="mt-6 rounded-2xl border border-border bg-muted p-8 text-center">
          <p className="text-sm text-muted-fg">
            Could not verify your subscription status.
          </p>
          <Button onClick={retry} variant="secondary" className="mt-3 gap-2">
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
            Try again
          </Button>
        </div>
      )}

      {/* Paywall banner for unpaid users */}
      {!isLoading && subActive === false && (
        <div className="mt-6 rounded-2xl border-2 border-primary/20 bg-primary/5 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
            <Sparkles className="h-7 w-7 text-primary" strokeWidth={1.75} />
          </div>
          <h2 className="mt-4 text-xl font-semibold">
            Subscribe to start building
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-fg">
            Get unlimited AI bots, GPT-4o powered chat, shareable links, and
            more for just &#8377;99/month.
          </p>
          <Link href="/pricing" className="mt-6 inline-block">
            <Button size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              Subscribe — &#8377;99/month
            </Button>
          </Link>
        </div>
      )}

      {isLoading ? (
        <Loading text="Loading your bots..." />
      ) : isPaid && bots.length === 0 ? (
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
      ) : bots.length > 0 ? (
        <>
          {/* Share encouragement banner */}
          {isPaid && (
            <div className="mt-4 rounded-xl border border-accent bg-accent/20 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <Share2 className="h-4 w-4 text-text" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-medium">Share your bot with the world</p>
                  <p className="text-xs text-muted-fg">
                    Copy your bot link and share it on LinkedIn, Twitter, or anywhere
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bots.map((bot) => (
              <BotCard key={bot.id} bot={bot} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
