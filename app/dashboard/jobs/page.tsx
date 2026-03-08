"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { JobCard } from "@/components/jobs/job-card";
import { JobInput } from "@/components/jobs/job-input";
import { Briefcase } from "lucide-react";
import type { JobWithApplication } from "@/types";

export default function JobsPage() {
  const router = useRouter();
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

  const handleAddJob = async (text: string) => {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawInput: text, source: "paste" }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to add job");
    }

    // Refresh the list
    await fetchJobs();
  };

  const handleSave = async (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    const currentStage = job?.application?.stage;
    const newStage = currentStage === "saved" ? "discovered" : "saved";

    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: jobId, stage: newStage }),
    });

    // Optimistic update
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              application: j.application
                ? { ...j.application, stage: newStage }
                : {
                    id: "",
                    user_id: "",
                    job_id: jobId,
                    stage: newStage,
                    notes: null,
                    applied_at: null,
                    metadata: {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
            }
          : j
      )
    );
  };

  const handleDismiss = async (jobId: string) => {
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_dismissed: true }),
    });

    // Optimistic removal
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const handleTailor = (jobId: string) => {
    router.push(`/dashboard/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-border/50 rounded-lg" />
          <div className="h-32 bg-border/50 rounded-2xl" />
          <div className="h-24 bg-border/50 rounded-2xl" />
          <div className="h-24 bg-border/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Job Feed</h1>
        <p className="text-sm text-muted-fg mt-1">
          Add job descriptions to get match scores and tailored content
        </p>
      </div>

      {/* Job Input */}
      <div className="mb-6">
        <JobInput onSubmit={handleAddJob} />
      </div>

      {/* Job List */}
      {jobs.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-fg">
              {jobs.length} job{jobs.length !== 1 ? "s" : ""}
            </h2>
          </div>
          {jobs.map((job, i) => (
            <JobCard
              key={job.id}
              job={job}
              onSave={handleSave}
              onDismiss={handleDismiss}
              onTailor={handleTailor}
              index={i}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-border bg-white/70 backdrop-blur-sm p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Briefcase className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold mb-2">No jobs yet</h2>
          <p className="text-sm text-muted-fg max-w-md mx-auto leading-relaxed">
            Paste a job description above to get started. The AI will analyze
            the role, match it to your profile, and help you tailor your
            application.
          </p>
        </div>
      )}
    </div>
  );
}
