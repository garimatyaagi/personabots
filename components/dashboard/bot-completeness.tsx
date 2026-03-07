"use client";

interface BotCompletenessProps {
  bot: {
    name?: string;
    description?: string | null;
    avatar_url?: string | null;
    headline?: string | null;
    about?: string | null;
    skills?: string[];
    highlights?: string[];
    custom_links?: { label: string; url: string }[];
  };
  memoryCount?: number;
  size?: "sm" | "md";
}

interface CheckItem {
  label: string;
  done: boolean;
  weight: number;
}

export function calculateCompleteness(
  bot: BotCompletenessProps["bot"],
  memoryCount = 0
): { score: number; items: CheckItem[]; nextStep: string | null } {
  const items: CheckItem[] = [
    { label: "Bot name", done: !!bot.name?.trim(), weight: 10 },
    { label: "Short bio", done: !!bot.description?.trim(), weight: 10 },
    { label: "Avatar", done: !!bot.avatar_url, weight: 15 },
    { label: "Headline", done: !!bot.headline?.trim(), weight: 10 },
    { label: "About section", done: !!bot.about?.trim(), weight: 10 },
    { label: "Skills", done: (bot.skills || []).length > 0, weight: 10 },
    { label: "Memory/documents", done: memoryCount > 0, weight: 15 },
    { label: "Highlights", done: (bot.highlights || []).length > 0, weight: 10 },
    { label: "Links", done: (bot.custom_links || []).length > 0, weight: 10 },
  ];

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const earnedWeight = items
    .filter((item) => item.done)
    .reduce((sum, item) => sum + item.weight, 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);

  const nextStep = items.find((item) => !item.done)?.label || null;

  return { score, items, nextStep };
}

export function BotCompleteness({
  bot,
  memoryCount = 0,
  size = "sm",
}: BotCompletenessProps) {
  const { score, nextStep } = calculateCompleteness(bot, memoryCount);

  const radius = size === "sm" ? 16 : 22;
  const strokeWidth = size === "sm" ? 3 : 3.5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  // Color based on score
  const color =
    score >= 80
      ? "text-green-500"
      : score >= 50
        ? "text-amber-500"
        : "text-primary";

  const strokeColor =
    score >= 80
      ? "stroke-green-500"
      : score >= 50
        ? "stroke-amber-500"
        : "stroke-primary";

  if (score === 100) return null; // Don't show when fully complete

  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg
          width={svgSize}
          height={svgSize}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border/40"
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={strokeColor}
            style={{
              transition: "stroke-dashoffset 0.6s ease-out",
            }}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${color}`}
        >
          {score}
        </span>
      </div>
      {size === "md" && nextStep && (
        <div className="min-w-0">
          <p className="text-[10px] text-muted-fg/70 leading-tight">
            Add {nextStep.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
}
