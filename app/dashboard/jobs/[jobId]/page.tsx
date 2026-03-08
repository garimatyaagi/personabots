"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchBadge } from "@/components/jobs/match-badge";
import { TailoringPanel } from "@/components/tailoring/tailoring-panel";
import {
  ArrowLeft,
  MapPin,
  Building2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Loader2,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import type { Job, TailoredContent, MatchAnalysis, Application } from "@/types";

interface JobDetail extends Job {
  application: Application | null;
  tailored_content: TailoredContent[];
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) {
        router.push("/dashboard/jobs");
        return;
      }
      const data = await res.json();
      setJob(data.job);
    } catch {
      router.push("/dashboard/jobs");
    } finally {
      setLoading(false);
    }
  }, [jobId, router]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleScoreMatch = async () => {
    setScoring(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/match`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setJob((prev) =>
          prev
            ? {
                ...prev,
                match_score: data.match_score,
                match_analysis: data.match_analysis,
              }
            : prev
        );
      }
    } catch {
      // Silently fail
    } finally {
      setScoring(false);
    }
  };

  const handleSave = async () => {
    if (!job) return;
    setSaving(true);

    const currentStage = job.application?.stage;
    const newStage = currentStage === "saved" ? "discovered" : "saved";

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, stage: newStage }),
      });

      if (res.ok) {
        const data = await res.json();
        setJob((prev) =>
          prev
            ? {
                ...prev,
                application: data.application,
              }
            : prev
        );
      }
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-border/50 rounded-lg" />
          <div className="h-10 w-72 bg-border/50 rounded-lg" />
          <div className="h-5 w-48 bg-border/50 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
            <div className="lg:col-span-3 space-y-4">
              <div className="h-64 bg-border/50 rounded-2xl" />
              <div className="h-40 bg-border/50 rounded-2xl" />
            </div>
            <div className="lg:col-span-2">
              <div className="h-96 bg-border/50 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const isSaved =
    job.application?.stage === "saved" ||
    job.application?.stage === "tailored";
  const analysis = job.match_analysis;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Back Button */}
      <div className="mb-6 animate-fade-in">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-fg hover:text-fg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back to jobs
        </Link>
      </div>

      {/* Header */}
      <div
        className="mb-8 animate-fade-in"
        style={{ animationDelay: "60ms", animationFillMode: "backwards" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight text-fg truncate">
                {job.title}
              </h1>
              <MatchBadge score={job.match_score} size="md" />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-fg">
              {job.company && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" strokeWidth={1.5} />
                  {job.company}
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" strokeWidth={1.5} />
                  {job.location}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleScoreMatch}
              isLoading={scoring}
              className="gap-1.5"
            >
              {scoring ? (
                "Scoring..."
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  {job.match_score !== null ? "Re-score" : "Score match"}
                </>
              )}
            </Button>
            <Button
              variant={isSaved ? "primary" : "ghost"}
              size="sm"
              onClick={handleSave}
              isLoading={saving}
              className="gap-1.5"
            >
              <Bookmark
                className="h-3.5 w-3.5"
                strokeWidth={1.75}
                fill={isSaved ? "currentColor" : "none"}
              />
              {isSaved ? "Saved" : "Save"}
            </Button>
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Original
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Job Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Description */}
          <div
            className="rounded-2xl border border-border bg-white/70 backdrop-blur-sm p-6 animate-fade-in"
            style={{ animationDelay: "120ms", animationFillMode: "backwards" }}
          >
            <h2 className="text-sm font-semibold text-fg mb-3">
              Job Description
            </h2>
            <div className="text-sm text-muted-fg leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements.length > 0 && (
            <div
              className="rounded-2xl border border-border bg-white/70 backdrop-blur-sm p-6 animate-fade-in"
              style={{
                animationDelay: "180ms",
                animationFillMode: "backwards",
              }}
            >
              <h2 className="text-sm font-semibold text-fg mb-3">
                Requirements
              </h2>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-fg"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-border shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Match Analysis */}
          {analysis && (analysis.strengths.length > 0 || analysis.gaps.length > 0 || analysis.missing_skills.length > 0) && (
            <div
              className="space-y-4 animate-fade-in"
              style={{
                animationDelay: "240ms",
                animationFillMode: "backwards",
              }}
            >
              <h2 className="text-sm font-semibold text-fg">Match Analysis</h2>

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <div className="rounded-2xl border border-green-200 bg-green-50/70 backdrop-blur-sm p-5">
                  <h3 className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-2.5">
                    Strengths
                  </h3>
                  <ul className="space-y-1.5">
                    {analysis.strengths.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-green-700"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {analysis.gaps.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 backdrop-blur-sm p-5">
                  <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2.5">
                    Gaps to Address
                  </h3>
                  <ul className="space-y-1.5">
                    {analysis.gaps.map((g, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-amber-700"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Skills */}
              {analysis.missing_skills.length > 0 && (
                <div className="rounded-2xl border border-border bg-white/70 backdrop-blur-sm p-5">
                  <h3 className="text-xs font-semibold text-fg uppercase tracking-wide mb-2.5">
                    Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis Notes */}
              {analysis.notes && (
                <p className="text-xs text-muted-fg leading-relaxed px-1">
                  {analysis.notes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Tailoring Panel */}
        <div
          className="lg:col-span-2 animate-fade-in"
          style={{ animationDelay: "180ms", animationFillMode: "backwards" }}
        >
          <TailoringPanel jobId={jobId} jobTitle={job.title} />
        </div>
      </div>
    </div>
  );
}
