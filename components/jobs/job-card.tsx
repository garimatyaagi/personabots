"use client";

import { Bookmark, X, ArrowRight, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JobWithApplication } from "@/types";

interface JobCardProps {
  job: JobWithApplication;
  onSave: (jobId: string) => void;
  onDismiss: (jobId: string) => void;
  onTailor: (jobId: string) => void;
  index: number;
}

function getMatchColor(score: number | null): {
  text: string;
  bg: string;
  ring: string;
} {
  if (score === null) return { text: "text-muted-fg", bg: "bg-muted/10", ring: "ring-border" };
  if (score >= 80) return { text: "text-green-700", bg: "bg-green-50", ring: "ring-green-100" };
  if (score >= 60) return { text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-100" };
  if (score >= 40) return { text: "text-orange-700", bg: "bg-orange-50", ring: "ring-orange-100" };
  return { text: "text-red-700", bg: "bg-red-50", ring: "ring-red-100" };
}

export function JobCard({ job, onSave, onDismiss, onTailor, index }: JobCardProps) {
  const matchColors = getMatchColor(job.match_score);
  const isSaved = job.application?.stage === "saved" || job.application?.stage === "tailored";
  const missingSkills = job.match_analysis?.missing_skills || [];

  return (
    <div
      className="group rounded-2xl border border-border bg-white/70 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-soft-hover hover:border-border/80 animate-fade-in"
      style={{
        animationDelay: `${index * 60}ms`,
        animationFillMode: "backwards",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Job Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-fg truncate">
              {job.title}
            </h3>
            {/* Match Score Badge */}
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${matchColors.bg} ${matchColors.text} ${matchColors.ring}`}
            >
              {job.match_score !== null ? `${Math.round(job.match_score)}% match` : "Analyzing..."}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-fg mb-3">
            {job.company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" strokeWidth={1.5} />
                {job.company}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" strokeWidth={1.5} />
                {job.location}
              </span>
            )}
            {typeof job.metadata?.seniority === "string" && (
              <span className="capitalize">
                {job.metadata.seniority}
              </span>
            )}
          </div>

          {/* Missing Skills */}
          {missingSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {missingSkills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-red-100"
                >
                  {skill}
                </span>
              ))}
              {missingSkills.length > 4 && (
                <span className="text-[10px] text-muted-fg self-center">
                  +{missingSkills.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Requirements preview */}
          {job.requirements.length > 0 && missingSkills.length === 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {job.requirements.slice(0, 3).map((req) => (
                <span
                  key={req}
                  className="inline-flex items-center rounded-md bg-muted/30 px-2 py-0.5 text-[10px] text-muted-fg"
                >
                  {req}
                </span>
              ))}
              {job.requirements.length > 3 && (
                <span className="text-[10px] text-muted-fg self-center">
                  +{job.requirements.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSave(job.id)}
            className={`h-8 w-8 p-0 ${isSaved ? "text-blue-600" : ""}`}
            title={isSaved ? "Saved" : "Save job"}
          >
            <Bookmark
              className="h-4 w-4"
              strokeWidth={1.75}
              fill={isSaved ? "currentColor" : "none"}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(job.id)}
            className="h-8 w-8 p-0 text-muted-fg hover:text-red-600"
            title="Dismiss"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onTailor(job.id)}
            className="gap-1 text-xs h-8"
          >
            Tailor
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
