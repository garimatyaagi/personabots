"use client";

import { Lightbulb, AlertTriangle, Info } from "lucide-react";
import type { ProfileSuggestion, ProfileDimensions } from "@/types";

interface SuggestionCardProps {
  suggestion: ProfileSuggestion;
  index: number;
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

const PRIORITY_CONFIG = {
  high: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    label: "High priority",
  },
  medium: {
    icon: Lightbulb,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    label: "Medium priority",
  },
  low: {
    icon: Info,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    label: "Nice to have",
  },
};

export function SuggestionCard({ suggestion, index }: SuggestionCardProps) {
  const config = PRIORITY_CONFIG[suggestion.priority];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-xl border ${config.border} ${config.bg}/50 p-4 transition-all duration-300 hover:shadow-sm animate-fade-in`}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: "backwards",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
        >
          <Icon className={`h-4 w-4 ${config.color}`} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-fg">
              {DIMENSION_LABELS[suggestion.dimension]}
            </span>
            <span className={`text-[10px] font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-muted-fg leading-relaxed">
            {suggestion.suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}
