"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
  List,
  Mail,
  MessageSquare,
  HelpCircle,
  Target,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ContentSection } from "./content-section";
import type { TailoredContentType } from "@/types";

const CONTENT_TYPES = [
  { type: "summary" as const, label: "Tailored Summary", icon: FileText, description: "Professional summary for this role" },
  { type: "resume_bullets" as const, label: "Resume Bullets", icon: List, description: "Achievement bullets matching requirements" },
  { type: "cover_note" as const, label: "Cover Note", icon: Mail, description: "Personalized cover letter" },
  { type: "recruiter_pitch" as const, label: "Recruiter Pitch", icon: MessageSquare, description: "LinkedIn/email pitch message" },
  { type: "interview_questions" as const, label: "Interview Prep", icon: HelpCircle, description: "Likely questions with talking points" },
  { type: "proof_points" as const, label: "Proof Points", icon: Target, description: "Evidence matching requirements" },
  { type: "gap_analysis" as const, label: "Gap Analysis", icon: AlertTriangle, description: "Honest assessment of fit gaps" },
  { type: "suggested_framing" as const, label: "Positioning", icon: Lightbulb, description: "How to frame yourself for this role" },
];

interface ContentEntry {
  content: string;
  id: string | null;
  isEdited: boolean;
}

interface TailoringPanelProps {
  jobId: string;
  jobTitle: string;
}

export function TailoringPanel({ jobId, jobTitle }: TailoringPanelProps) {
  const [activeType, setActiveType] = useState<TailoredContentType>("summary");
  const [contents, setContents] = useState<Record<string, ContentEntry>>({});
  const [generating, setGenerating] = useState<TailoredContentType | null>(null);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch existing tailored content on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchExistingContent() {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) return;

        const data = await res.json();
        const tailoredContent = data.job?.tailored_content || [];

        if (cancelled) return;

        const contentMap: Record<string, ContentEntry> = {};
        for (const item of tailoredContent) {
          contentMap[item.content_type] = {
            content: item.content,
            id: item.id,
            isEdited: item.is_edited,
          };
        }
        setContents(contentMap);
      } catch (err) {
        console.error("Failed to fetch tailored content:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchExistingContent();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const handleGenerate = useCallback(
    async (contentType: TailoredContentType) => {
      // Abort any in-progress generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setGenerating(contentType);
      // Clear existing content for this type while generating
      setContents((prev) => ({
        ...prev,
        [contentType]: { content: "", id: null, isEdited: false },
      }));

      try {
        const res = await fetch("/api/tailoring/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, contentType }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Generation request failed");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();

            if (payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload);

              if (parsed.error) {
                console.error("Stream error:", parsed.error);
                continue;
              }

              if (parsed.content) {
                accumulated += parsed.content;
                setContents((prev) => ({
                  ...prev,
                  [contentType]: {
                    content: accumulated,
                    id: prev[contentType]?.id || null,
                    isEdited: false,
                  },
                }));
              }

              if (parsed.done && parsed.contentId) {
                setContents((prev) => ({
                  ...prev,
                  [contentType]: {
                    ...prev[contentType],
                    id: parsed.contentId,
                  },
                }));
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return; // Intentional abort
        }
        console.error("Generation failed:", err);
      } finally {
        if (abortControllerRef.current === controller) {
          setGenerating(null);
          abortControllerRef.current = null;
        }
      }
    },
    [jobId]
  );

  const handleContentChange = useCallback(
    (contentType: string, content: string, id: string | null) => {
      setContents((prev) => ({
        ...prev,
        [contentType]: { content, id, isEdited: true },
      }));
    },
    []
  );

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const activeConfig = CONTENT_TYPES.find((ct) => ct.type === activeType)!;
  const activeContent = contents[activeType];

  return (
    <div className="space-y-4">
      {/* Content type selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
        {CONTENT_TYPES.map(({ type, label, icon: Icon, description }) => {
          const isActive = activeType === type;
          const hasContent = !!contents[type]?.content;
          const isCurrentlyGenerating = generating === type;

          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              title={description}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "border-primary/30 bg-primary/5 text-primary"
                  : "border-border bg-white/60 text-fg hover:bg-white/80",
                isCurrentlyGenerating && "animate-pulse"
              )}
            >
              {isCurrentlyGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="whitespace-nowrap">{label}</span>
              {hasContent && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content section */}
      <div className="rounded-2xl border border-border bg-white/70 backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted" />
          </div>
        ) : (
          <ContentSection
            contentType={activeType}
            label={activeConfig.label}
            content={activeContent?.content || ""}
            contentId={activeContent?.id || null}
            isGenerating={generating === activeType}
            onGenerate={() => handleGenerate(activeType)}
            onContentChange={(content, id) =>
              handleContentChange(activeType, content, id)
            }
          />
        )}
      </div>
    </div>
  );
}
