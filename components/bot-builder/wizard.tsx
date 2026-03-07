"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepBasics } from "./step-basics";
import { StepMemory } from "./step-memory";
import { StepUseCase } from "./step-usecase";
import { StepPreview } from "./step-preview";
import { cn } from "@/lib/utils/cn";
import { ArrowLeft, ArrowRight, Rocket, Loader2 } from "lucide-react";
import type { BotBuilderState, AccessLevel } from "@/types";

const STEPS = ["Basics", "Memory", "Use Case", "Preview"];

const initialState: BotBuilderState = {
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
  const [state, setState] = useState<BotBuilderState>(initialState);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  function goNext() {
    if (state.step < 4) {
      setState((s) => ({ ...s, step: (s.step + 1) as 1 | 2 | 3 | 4 }));
    }
  }

  function goBack() {
    if (state.step > 1) {
      setState((s) => ({ ...s, step: (s.step - 1) as 1 | 2 | 3 | 4 }));
    }
  }

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
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create bot");
      }

      const { bot } = await res.json();

      // 2. Save notes and Q&A as memory
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

      // 3. Upload files as memory
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

      // 4. Save links as memory
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

      router.push("/dashboard");
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

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <button
              onClick={() =>
                setState((s) => ({ ...s, step: (i + 1) as 1 | 2 | 3 | 4 }))
              }
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all",
                state.step === i + 1
                  ? "bg-primary text-[#f8faed]"
                  : state.step > i + 1
                    ? "bg-accent text-text"
                    : "bg-[rgba(24,23,23,0.08)] text-muted-fg"
              )}
            >
              {i + 1}
            </button>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                state.step === i + 1
                  ? "font-medium"
                  : "text-muted-fg"
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="h-px w-6 bg-border sm:w-10" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="animate-fade-in">
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
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="ghost"
          onClick={goBack}
          disabled={state.step === 1}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back
        </Button>

        {state.step < 4 ? (
          <Button onClick={goNext} disabled={!canProceed} className="gap-2">
            Next
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        ) : (
          <Button
            onClick={handlePublish}
            isLoading={publishing}
            className="gap-2"
          >
            <Rocket className="h-4 w-4" strokeWidth={1.75} />
            Publish Bot
          </Button>
        )}
      </div>
    </div>
  );
}
