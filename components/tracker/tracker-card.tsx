"use client";

import { useState } from "react";
import Link from "next/link";
import { MatchBadge } from "@/components/jobs/match-badge";
import { Building2, Clock } from "lucide-react";

const STAGE_OPTIONS = [
  { value: "discovered", label: "Discovered" },
  { value: "saved", label: "Saved" },
  { value: "tailored", label: "Tailored" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "archived", label: "Archived" },
];

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface TrackerCardProps {
  job: {
    id: string;
    title: string;
    company: string | null;
    match_score: number | null;
    application: {
      id: string;
      stage: string;
      notes: string | null;
      applied_at: string | null;
    };
    created_at: string;
  };
  onStageChange: (applicationId: string, newStage: string) => Promise<void>;
}

export function TrackerCard({ job, onStageChange }: TrackerCardProps) {
  const [isChanging, setIsChanging] = useState(false);

  const handleStageChange = async (newStage: string) => {
    if (newStage === job.application.stage) return;
    setIsChanging(true);
    try {
      await onStageChange(job.application.id, newStage);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-white/60 p-3 hover:shadow-sm transition-all">
      {/* Title */}
      <Link
        href={`/dashboard/jobs/${job.id}`}
        className="text-sm font-semibold text-fg hover:text-primary transition-colors line-clamp-2 leading-snug"
      >
        {job.title}
      </Link>

      {/* Company */}
      {job.company && (
        <div className="flex items-center gap-1 mt-1">
          <Building2 className="h-3 w-3 text-muted-fg shrink-0" strokeWidth={1.5} />
          <span className="text-xs text-muted-fg truncate">{job.company}</span>
        </div>
      )}

      {/* Match + Time row */}
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-2">
          {job.match_score !== null && (
            <MatchBadge score={job.match_score} size="sm" />
          )}
        </div>
        <div className="flex items-center gap-1 text-muted-fg">
          <Clock className="h-3 w-3" strokeWidth={1.5} />
          <span className="text-[10px]">{timeAgo(job.created_at)}</span>
        </div>
      </div>

      {/* Stage selector */}
      <div className="mt-2 pt-2 border-t border-border/50">
        <select
          value={job.application.stage}
          onChange={(e) => handleStageChange(e.target.value)}
          disabled={isChanging}
          className="w-full text-xs bg-transparent border border-border/60 rounded-lg px-2 py-1.5 text-fg cursor-pointer hover:border-border focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 8px center",
            paddingRight: "28px",
          }}
        >
          {STAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
