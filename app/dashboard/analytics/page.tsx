"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/shared/loading";
import { MessageSquare, Bot, Users, TrendingUp } from "lucide-react";
import type { BotWithUseCase } from "@/types";

export default function AnalyticsPage() {
  const [bots, setBots] = useState<BotWithUseCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/bots");
        const data = await res.json();
        setBots(data.bots || []);
      } catch (error) {
        console.error("Failed to load:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-heading mb-6">
        Analytics
      </h1>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <Bot className="h-5 w-5 text-text" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-2xl font-semibold">{bots.length}</p>
              <p className="text-xs text-muted-fg">Total bots</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <Users className="h-5 w-5 text-text" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {bots.filter((b) => b.is_public).length}
              </p>
              <p className="text-xs text-muted-fg">Public bots</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <TrendingUp className="h-5 w-5 text-text" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {bots.reduce((acc, b) => acc + (b.use_cases?.length || 0), 0)}
              </p>
              <p className="text-xs text-muted-fg">Active use cases</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bot list */}
      <Card>
        <CardHeader>
          <CardTitle>Bot overview</CardTitle>
        </CardHeader>
        <CardContent>
          {bots.length === 0 ? (
            <p className="text-sm text-muted-fg">No bots yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium text-muted-fg">Name</th>
                    <th className="pb-2 font-medium text-muted-fg">Use Case</th>
                    <th className="pb-2 font-medium text-muted-fg">Status</th>
                    <th className="pb-2 font-medium text-muted-fg">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {bots.map((bot) => (
                    <tr key={bot.id} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium">{bot.name}</td>
                      <td className="py-3">
                        <Badge variant="outline" className="capitalize">
                          {bot.use_cases?.[0]?.type || "—"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge variant={bot.is_public ? "default" : "muted"}>
                          {bot.is_public ? "Public" : "Private"}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-fg">
                        {new Date(bot.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
