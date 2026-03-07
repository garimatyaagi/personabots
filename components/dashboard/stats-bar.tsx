"use client";

import { Bot, MessageSquare, Eye, TrendingUp } from "lucide-react";

interface StatsBarProps {
  botCount: number;
  totalConversations: number;
}

const STATS_CONFIG = [
  {
    key: "bots",
    label: "Active bots",
    icon: Bot,
    getValue: (props: StatsBarProps) => props.botCount,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "conversations",
    label: "Conversations",
    icon: MessageSquare,
    getValue: (props: StatsBarProps) => props.totalConversations,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "views",
    label: "Bot views",
    icon: Eye,
    getValue: () => null as number | null,
    color: "text-amber-600",
    bg: "bg-amber-50",
    comingSoon: true,
  },
  {
    key: "growth",
    label: "This week",
    icon: TrendingUp,
    getValue: () => null as number | null,
    color: "text-green-600",
    bg: "bg-green-50",
    comingSoon: true,
  },
];

export function StatsBar(props: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STATS_CONFIG.map((stat) => {
        const value = stat.getValue(props);
        return (
          <div
            key={stat.key}
            className="group rounded-xl border border-border bg-white/60 backdrop-blur-sm p-4 transition-all duration-200 hover:shadow-soft-hover"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <stat.icon
                  className={`h-3 w-3 ${stat.color}`}
                  strokeWidth={1.75}
                />
              </div>
              <span className="text-xs text-muted-fg">{stat.label}</span>
            </div>
            {stat.comingSoon ? (
              <p className="text-xs text-muted-fg/50 italic">Coming soon</p>
            ) : (
              <p className="text-2xl font-bold tracking-tight">{value ?? 0}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
