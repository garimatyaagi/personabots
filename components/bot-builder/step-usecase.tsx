"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { getPlaybookDescription } from "@/lib/playbooks";
import {
  Briefcase,
  Users,
  TrendingUp,
  Heart,
  Headphones,
  Sparkles,
} from "lucide-react";
import type { BotBuilderState, UseCaseType } from "@/types";

const ICONS: Record<string, React.ElementType> = {
  Briefcase,
  Users,
  TrendingUp,
  Heart,
  Headphones,
  Sparkles,
};

const USE_CASE_TYPES: UseCaseType[] = [
  "hiring",
  "networking",
  "investor",
  "dating",
  "support",
  "custom",
];

interface StepUseCaseProps {
  state: BotBuilderState;
  onChange: (updates: Partial<BotBuilderState["useCase"]>) => void;
}

export function StepUseCase({ state, onChange }: StepUseCaseProps) {
  const selected = state.useCase.type;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-heading">
          Choose a use case
        </h2>
        <p className="text-sm text-muted-fg">
          Pick a playbook that defines what your bot can do.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {USE_CASE_TYPES.map((type) => {
          const info = getPlaybookDescription(type);
          const Icon = ICONS[info.icon] || Sparkles;
          const isSelected = selected === type;

          return (
            <Card
              key={type}
              className={cn(
                "cursor-pointer transition-all",
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "hover:border-border-strong"
              )}
              onClick={() => onChange({ type })}
            >
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      isSelected ? "bg-primary" : "bg-accent"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isSelected ? "text-[#f8faed]" : "text-text"
                      )}
                      strokeWidth={1.75}
                    />
                  </div>
                  <span className="font-medium">{info.label}</span>
                  {(type === "hiring" || type === "networking") && (
                    <Badge>Ready</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-fg">{info.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
