"use client";

import type { ProfileDimensions } from "@/types";

interface ScoreDisplayProps {
  overallScore: number;
  dimensions: ProfileDimensions;
  analyzedAt: string | null;
}

const DIMENSION_LABELS: Record<keyof ProfileDimensions, string> = {
  clarity: "Clarity",
  credibility: "Credibility",
  proof: "Proof",
  role_relevance: "Role relevance",
  keyword_coverage: "Keywords",
  differentiation: "Differentiation",
  completeness: "Completeness",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function getBarColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export function ScoreDisplay({
  overallScore,
  dimensions,
  analyzedAt,
}: ScoreDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Overall Score Circle */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-32 w-32 items-center justify-center">
          {/* Background ring */}
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 128 128"
          >
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-border"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${(overallScore / 100) * 352} 352`}
              strokeLinecap="round"
              className={getScoreColor(overallScore)}
              style={{
                transition: "stroke-dasharray 1s ease-out",
              }}
            />
          </svg>
          <div className="text-center">
            <span
              className={`text-3xl font-bold ${getScoreColor(overallScore)}`}
            >
              {overallScore}
            </span>
            <span className="text-sm text-muted-fg block">/ 100</span>
          </div>
        </div>
        <p className="text-sm text-muted-fg">Profile Strength</p>
        {analyzedAt && (
          <p className="text-xs text-muted-fg/70">
            Last analyzed{" "}
            {new Date(analyzedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Dimension Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-fg">Breakdown</h3>
        {(
          Object.entries(dimensions) as [keyof ProfileDimensions, number][]
        ).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-fg">
                {DIMENSION_LABELS[key]}
              </span>
              <span className={`text-xs font-semibold ${getScoreColor(value)}`}>
                {value}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border/50">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(value)}`}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
