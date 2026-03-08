"use client";

import { useState } from "react";
import { TrackerCard } from "@/components/tracker/tracker-card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TrackerBoardProps {
  stages: Array<{
    key: string;
    label: string;
    color: string;
    bg: string;
    jobs: Array<{
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
    }>;
  }>;
  onStageChange: (applicationId: string, newStage: string) => Promise<void>;
}

export function TrackerBoard({ stages, onStageChange }: TrackerBoardProps) {
  // Track which mobile sections are collapsed
  const [collapsedStages, setCollapsedStages] = useState<Set<string>>(
    new Set()
  );

  const toggleCollapse = (key: string) => {
    setCollapsedStages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <>
      {/* Desktop: Horizontal scrollable board */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
        {stages.map((stage) => (
          <div
            key={stage.key}
            className="min-w-[260px] flex-1 flex flex-col"
          >
            {/* Column header */}
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-2 mb-3 ${stage.bg}`}
            >
              <span className={`text-sm font-semibold ${stage.color}`}>
                {stage.label}
              </span>
              <span
                className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold ${stage.color} bg-white/80`}
              >
                {stage.jobs.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-2">
              {stage.jobs.length > 0 ? (
                stage.jobs.map((job, i) => (
                  <div
                    key={job.id}
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${i * 40}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <TrackerCard job={job} onStageChange={onStageChange} />
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 p-4 text-center">
                  <p className="text-xs text-muted-fg">No jobs</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Stacked collapsible sections */}
      <div className="md:hidden space-y-3">
        {stages.map((stage) => {
          const isCollapsed = collapsedStages.has(stage.key);

          return (
            <div
              key={stage.key}
              className="rounded-2xl border border-border bg-white/60 backdrop-blur-sm overflow-hidden"
            >
              {/* Section header (tappable) */}
              <button
                onClick={() => toggleCollapse(stage.key)}
                className={`w-full flex items-center justify-between px-4 py-3 ${stage.bg} transition-colors`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold ${stage.color} bg-white/80`}
                  >
                    {stage.jobs.length}
                  </span>
                </div>
                {isCollapsed ? (
                  <ChevronDown
                    className={`h-4 w-4 ${stage.color}`}
                    strokeWidth={1.75}
                  />
                ) : (
                  <ChevronUp
                    className={`h-4 w-4 ${stage.color}`}
                    strokeWidth={1.75}
                  />
                )}
              </button>

              {/* Cards */}
              {!isCollapsed && (
                <div className="p-3 space-y-2">
                  {stage.jobs.length > 0 ? (
                    stage.jobs.map((job) => (
                      <TrackerCard
                        key={job.id}
                        job={job}
                        onStageChange={onStageChange}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-muted-fg text-center py-3">
                      No jobs in this stage
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
