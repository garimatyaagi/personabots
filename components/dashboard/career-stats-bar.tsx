"use client";

import {
  Briefcase,
  Bookmark,
  FileText,
  Activity,
} from "lucide-react";

interface CareerStatsBarProps {
  jobsFound: number;
  jobsSaved: number;
  applicationsInProgress: number;
  profileStrength: number | null;
}

const STATS_CONFIG = [
  {
    key: "jobs_found",
    label: "Jobs found",
    icon: Briefcase,
    getValue: (p: CareerStatsBarProps) => p.jobsFound,
    color: "text-primary",
    bg: "bg-primary/10",
    ring: "ring-primary/5",
  },
  {
    key: "jobs_saved",
    label: "Jobs saved",
    icon: Bookmark,
    getValue: (p: CareerStatsBarProps) => p.jobsSaved,
    color: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-50",
  },
  {
    key: "applications",
    label: "In progress",
    icon: FileText,
    getValue: (p: CareerStatsBarProps) => p.applicationsInProgress,
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-50",
  },
  {
    key: "profile",
    label: "Profile strength",
    icon: Activity,
    getValue: (p: CareerStatsBarProps) => p.profileStrength,
    color: "text-green-600",
    bg: "bg-green-50",
    ring: "ring-green-50",
    suffix: "%",
  },
];

export function CareerStatsBar(props: CareerStatsBarProps) {
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
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${stat.bg} pointer-events-none`}
              style={{ opacity: 0 }}
            />
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
                <span className="text-xs text-muted-fg font-medium">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight">
                {value !== null ? `${value}${("suffix" in stat && stat.suffix) || ""}` : "--"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
