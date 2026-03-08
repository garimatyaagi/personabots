"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepBasics } from "./step-basics";
import { StepMemory } from "./step-memory";
import { StepUseCase } from "./step-usecase";
import { StepPreview } from "./step-preview";
import { PublishSuccessModal } from "./publish-success-modal";
import { useWizardPersistence } from "@/lib/hooks/use-wizard-persistence";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, ArrowRight, Rocket, Check, FileText } from "lucide-react";
import type { BotBuilderState, AccessLevel } from "@/types";

const STEPS = ["Basics", "Memory", "Use Case", "Preview"];

const defaultState: BotBuilderState = {
  step: 1,
  basics: {
    name: "",
    slug: "",
    description: "",
    tone: 50,
    personality_traits: {},
    headline: "",
    social_links: {},
    skills: [],
    about: "",
    avatar_file: null,
    theme: "default",
    custom_links: [],
    highlights: [],
    calendar_url: "",
  },
  memory: {
    uploads: [],
    links: [],
    notes: "",
    qa_answers: {},
  },
  useCase: {
    type: "hiring",
    config: {},
  },
  access: "public",
};

export function BotBuilderWizard() {
  const router = useRouter();
  const { initialState, hasDraft, saveDraft, clearDraft } =
    useWizardPersistence(defaultState);
  const [state, setState] = useState<BotBuilderState>(defaultState);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [publishedBot, setPublishedBot] = useState<{
    name: string;
    slug: string;
  } | null>(null);

  // Restore draft on mount
  useEffect(() => {
    if (hasDraft && initialState.basics.name) {
      setState(initialState);
      setDraftLoaded(true);
    }
  }, [hasDraft, initialState]);

  // Auto-save state changes
  useEffect(() => {
    if (state.basics.name.trim()) {
      saveDraft(state);
    }
  }, [state, saveDraft]);

  // Step transition animation state
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  function updateBasics(updates: Partial<BotBuilderState["basics"]>) {
    setState((s) => ({
      ...s,
      basics: { ...s.basics, ...updates },
    }));
  }

  function updateMemory(updates: Partial<BotBuilderState["memory"]>) {
    setState((s) => ({
      ...s,
      memory: { ...s.memory, ...updates },
    }));
  }

  function updateUseCase(updates: Partial<BotBuilderState["useCase"]>) {
    setState((s) => ({
      ...s,
      useCase: { ...s.useCase, ...updates },
    }));
  }

  function updateAccess(access: AccessLevel) {
    setState((s) => ({ ...s, access }));
  }

  function animateStep(newStep: number) {
    const direction = newStep > state.step ? "left" : "right";
    setSlideDirection(direction);
    setIsTransitioning(true);

    // After exit animation, change step and enter
    setTimeout(() => {
      setState((s) => ({ ...s, step: newStep as 1 | 2 | 3 | 4 }));
      setIsTransitioning(false);
    }, 180);
  }

  function goNext() {
    if (state.step < 4) {
      animateStep(state.step + 1);
    }
  }

  function goBack() {
    if (state.step > 1) {
      animateStep(state.step - 1);
    }
  }

  function goToStep(step: number) {
    if (step !== state.step) {
      animateStep(step);
    }
  }

  // Scroll to top of step content on step change
  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [state.step]);

  async function handlePublish() {
    if (!state.basics.name || !state.basics.slug) {
      setError("Name and slug are required.");
      return;
    }

    setPublishing(true);
    setError(null);

    try {
      // 1. Create the bot
      const res = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.basics.name,
          slug: state.basics.slug,
          description: state.basics.description,
          tone: state.basics.tone,
          personality_traits: state.basics.personality_traits,
          headline: state.basics.headline,
          social_links: state.basics.social_links,
          skills: state.basics.skills,
          about: state.basics.about,
          is_public: state.access !== "private",
          use_case_type: state.useCase.type,
          use_case_config: state.useCase.config,
          access: state.access,
          theme: state.basics.theme,
          custom_links: state.basics.custom_links,
          highlights: state.basics.highlights,
          calendar_url: state.basics.calendar_url || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create bot");
      }

      const { bot } = await res.json();

      // 2. Upload avatar if selected
      if (state.basics.avatar_file) {
        try {
          const formData = new FormData();
          formData.append("file", state.basics.avatar_file);
          formData.append("botId", bot.id);
          await fetch("/api/upload/avatar", {
            method: "POST",
            body: formData,
          });
        } catch (avatarErr) {
          console.error("Avatar upload error:", avatarErr);
        }
      }

      // 3. Save notes and Q&A as memory
      if (state.memory.notes.trim()) {
        const formData = new FormData();
        formData.append("type", "text");
        formData.append("title", "About me / Notes");
        formData.append("content", state.memory.notes);
        formData.append("sourceType", "note");
        formData.append("botId", bot.id);
        formData.append("isShareable", "true");
        await fetch("/api/memory/upload", { method: "POST", body: formData });
      }

      // Save Q&A answers
      const qaEntries = Object.entries(state.memory.qa_answers).filter(
        ([, v]) => v.trim()
      );
      if (qaEntries.length > 0) {
        const qaText = qaEntries
          .map(([q, a]) => `Q: ${q}\nA: ${a}`)
          .join("\n\n");
        const formData = new FormData();
        formData.append("type", "text");
        formData.append("title", "Q&A Onboarding Answers");
        formData.append("content", qaText);
        formData.append("sourceType", "qa");
        formData.append("botId", bot.id);
        formData.append("isShareable", "true");
        await fetch("/api/memory/upload", { method: "POST", body: formData });
      }

      // 4. Upload files as memory
      for (const file of state.memory.uploads) {
        try {
          const formData = new FormData();
          formData.append("type", "file");
          formData.append("file", file);
          formData.append("botId", bot.id);
          formData.append("isShareable", "true");
          const uploadRes = await fetch("/api/memory/upload", {
            method: "POST",
            body: formData,
          });
          if (!uploadRes.ok) {
            const errData = await uploadRes.json().catch(() => ({}));
            console.error(`File upload failed (${file.name}):`, errData);
          }
        } catch (uploadErr) {
          console.error(`File upload error (${file.name}):`, uploadErr);
        }
      }

      // 5. Save links as memory
      for (const link of state.memory.links) {
        const formData = new FormData();
        formData.append("type", "text");
        formData.append("title", `Link: ${link}`);
        formData.append("content", `External link: ${link}`);
        formData.append("sourceType", "linkedin");
        formData.append("botId", bot.id);
        formData.append("isShareable", "true");
        await fetch("/api/memory/upload", { method: "POST", body: formData });
      }

      // Clear draft and show success modal
      clearDraft();
      setPublishedBot({ name: bot.name, slug: bot.slug });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPublishing(false);
    }
  }

  const canProceed =
    state.step === 1
      ? state.basics.name.trim() && state.basics.slug.trim()
      : true;

  // Calculate overall progress for the progress bar
  const progressPercent = (state.step / STEPS.length) * 100;

  return (
    <div className="mx-auto max-w-2xl" ref={contentRef}>
      {/* Success modal */}
      {publishedBot && (
        <PublishSuccessModal
          botName={publishedBot.name}
          botSlug={publishedBot.slug}
          onClose={() => router.push("/dashboard")}
        />
      )}

      {/* Draft restored banner */}
      {draftLoaded && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-sm animate-fade-in">
          <span className="flex items-center gap-2 text-amber-800">
            <FileText className="h-4 w-4" strokeWidth={1.75} />
            Draft restored. Pick up where you left off!
          </span>
          <button
            onClick={() => {
              clearDraft();
              setState(defaultState);
              setDraftLoaded(false);
            }}
            className="text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors"
          >
            Start fresh
          </button>
        </div>
      )}

      {/* Step indicator with progress bar */}
      <div className="mb-8">
        {/* Progress bar */}
        <div className="h-1 w-full rounded-full bg-border/30 mb-6 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                onClick={() => goToStep(i + 1)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300",
                  state.step === i + 1
                    ? "bg-primary text-[#f8faed] shadow-sm scale-110"
                    : state.step > i + 1
                      ? "bg-green-100 text-green-700"
                      : "bg-[rgba(24,23,23,0.08)] text-muted-fg"
                )}
              >
                {state.step > i + 1 ? (
                  <Check className="h-4 w-4" strokeWidth={2} />
                ) : (
                  i + 1
                )}
              </button>
              <span
                className={cn(
                  "hidden text-sm sm:inline transition-colors",
                  state.step === i + 1
                    ? "font-medium text-text"
                    : "text-muted-fg"
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px w-6 sm:w-10 transition-colors duration-300",
                    state.step > i + 1 ? "bg-green-300" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content with transition */}
      <div
        className={cn(
          "transition-all duration-200 ease-out",
          isTransitioning
            ? slideDirection === "left"
              ? "opacity-0 -translate-x-4"
              : "opacity-0 translate-x-4"
            : "opacity-100 translate-x-0"
        )}
      >
        {state.step === 1 && (
          <StepBasics state={state} onChange={updateBasics} />
        )}
        {state.step === 2 && (
          <StepMemory state={state} onChange={updateMemory} />
        )}
        {state.step === 3 && (
          <StepUseCase state={state} onChange={updateUseCase} />
        )}
        {state.step === 4 && (
          <StepPreview state={state} onAccessChange={updateAccess} />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary animate-fade-in">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="ghost"
          onClick={goBack}
          disabled={state.step === 1}
          className="gap-2 press-effect"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back
        </Button>

        {state.step < 4 ? (
          <Button
            onClick={goNext}
            disabled={!canProceed}
            className="gap-2 press-effect"
          >
            Next
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        ) : (
          <Button
            onClick={handlePublish}
            isLoading={publishing}
            className="gap-2 press-effect"
          >
            <Rocket className="h-4 w-4" strokeWidth={1.75} />
            Publish Bot
          </Button>
        )}
      </div>
    </div>
  );
}
