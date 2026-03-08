"use client";

interface MatchBadgeProps {
  score: number | null;
  size?: "sm" | "md";
}

function getMatchColors(score: number | null): {
  bg: string;
  text: string;
  border: string;
} {
  if (score === null) {
    return { bg: "bg-gray-50", text: "text-gray-500", border: "border-gray-200" };
  }
  if (score >= 80) {
    return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
  }
  if (score >= 60) {
    return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
  }
  if (score >= 40) {
    return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" };
  }
  return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
}

export function MatchBadge({ score, size = "sm" }: MatchBadgeProps) {
  const colors = getMatchColors(score);

  const sizeClasses =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${colors.bg} ${colors.text} ${colors.border}`}
    >
      {score !== null ? `${Math.round(score)}% match` : "\u2014"}
      {score === null && (
        <span className="sr-only">Not scored</span>
      )}
    </span>
  );
}
