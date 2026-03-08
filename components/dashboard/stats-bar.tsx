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
    ring: "ring-primary/5",
  },
  {
    key: "conversations",
    label: "Conversations",
    icon: MessageSquare,
    getValue: (props: StatsBarProps) => props.totalConversations,
    color: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-50",
  },
  {
    key: "views",
    label: "Bot views",
    icon: Eye,
    getValue: () => null as number | null,
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-50",
    comingSoon: true,
  },
  {
    key: "growth",
    label: "This week",
    icon: TrendingUp,
    getValue: () => null as number | null,
    color: "text-green-600",
    bg: "bg-green-50",
    ring: "ring-green-50",
    comingSoon: true,
  },
];

export function StatsBar(props: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STATS_CONFIG.map((stat, i) => {
        const value = stat.getValue(props);
        return (
          <div
            key={stat.key}
            className="group relative rounded-2xl border border-border bg-white/70 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-soft-hover hover:border-border/80 animate-fade-in overflow-hidden"
            style={{
              animationDelay: `${i * 60}ms`,
              animationFillMode: "backwards",
            }}
          >
            {/* Subtle gradient overlay on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${stat.bg} pointer-events-none`} style={{ opacity: 0 }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${stat.bg} ring-2 ${stat.ring} transition-transform duration-200 group-hover:scale-110`}
                >
                  <stat.icon
                    className={`h-3.5 w-3.5 ${stat.color}`}
                    strokeWidth={1.75}
                  />
                </div>
                <span className="text-xs text-muted-fg font-medium">{stat.label}</span>
              </div>
              {stat.comingSoon ? (
                <p className="text-xs text-muted-fg/50 italic">Coming soon</p>
              ) : (
                <p className="text-2xl font-bold tracking-tight">{value ?? 0}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
