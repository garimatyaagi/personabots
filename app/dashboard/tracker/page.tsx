"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrackerBoard } from "@/components/tracker/tracker-board";
import { ClipboardList, Plus } from "lucide-react";
import type { JobWithApplication, ApplicationStage } from "@/types";

const STAGES: Array<{
  key: ApplicationStage;
  label: string;
  color: string;
  bg: string;
}> = [
  { key: "discovered", label: "Discovered", color: "text-slate-600", bg: "bg-slate-50" },
  { key: "saved", label: "Saved", color: "text-blue-600", bg: "bg-blue-50" },
  { key: "tailored", label: "Tailored", color: "text-purple-600", bg: "bg-purple-50" },
  { key: "applied", label: "Applied", color: "text-amber-600", bg: "bg-amber-50" },
  { key: "interview", label: "Interview", color: "text-green-600", bg: "bg-green-50" },
  { key: "offer", label: "Offer", color: "text-emerald-600", bg: "bg-emerald-50" },
];

export default function TrackerPage() {
  const [jobs, setJobs] = useState<JobWithApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleStageChange = async (applicationId: string, newStage: string) => {
    // Optimistic update
    setJobs((prev) =>
      prev.map((j) =>
        j.application?.id === applicationId
          ? {
              ...j,
              application: j.application
                ? { ...j.application, stage: newStage as ApplicationStage }
                : j.application,
            }
          : j
      )
    );

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) {
        // Revert on failure
        await fetchJobs();
      }
    } catch {
      // Revert on error
      await fetchJobs();
    }
  };

  // Filter to only jobs with an application
  const jobsWithApps = jobs.filter((j) => j.application !== null);

  // Group jobs by stage
  const stagesWithJobs = STAGES.map((stage) => ({
    ...stage,
    jobs: jobsWithApps
      .filter((j) => j.application?.stage === stage.key)
      .map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        match_score: j.match_score,
        application: {
          id: j.application!.id,
          stage: j.application!.stage,
          notes: j.application!.notes,
          applied_at: j.application!.applied_at,
        },
        created_at: j.created_at,
      })),
  }));

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-56 bg-border/50 rounded-lg" />
          <div className="h-4 w-80 bg-border/50 rounded-lg" />
          <div className="mt-8 flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[260px] flex-1 space-y-3"
              >
                <div className="h-8 w-full bg-border/50 rounded-xl" />
                <div className="h-24 w-full bg-border/50 rounded-2xl" />
                <div className="h-24 w-full bg-border/50 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Application Tracker
          </h1>
          <p className="text-sm text-muted-fg mt-1">
            Track your job applications from discovery to offer
          </p>
        </div>
        <Link href="/dashboard/jobs">
          <Button variant="secondary" size="sm" className="gap-1.5 press-effect">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Add Jobs
          </Button>
        </Link>
      </div>

      {/* Board or Empty State */}
      {jobsWithApps.length > 0 ? (
        <TrackerBoard
          stages={stagesWithJobs}
          onStageChange={handleStageChange}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-white/70 backdrop-blur-sm p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <ClipboardList className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold mb-2">No applications yet</h2>
          <p className="text-sm text-muted-fg max-w-md mx-auto leading-relaxed">
            Paste a job description to get started. The AI will analyze the role,
            match it to your profile, and create an application you can track
            through every stage.
          </p>
          <Link href="/dashboard/jobs" className="mt-6 inline-block">
            <Button className="gap-2 press-effect shadow-sm">
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              Add your first job
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
