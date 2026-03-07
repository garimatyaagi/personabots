"use client";

import { SectionReveal } from "./section-reveal";
import { MessageCircle } from "lucide-react";

const QUESTIONS = [
  "Tell me about their experience with React and TypeScript",
  "What projects have they led?",
  "Why are they a good fit for a senior engineer role?",
  "What's their management style and team experience?",
  "Walk me through their most impactful project",
  "What are their salary expectations and availability?",
];

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-orange-100 text-orange-600",
  "bg-pink-100 text-pink-600",
  "bg-teal-100 text-teal-600",
];

export function RecruiterQuestions() {
  return (
    <section className="bg-accent/20">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <SectionReveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-primary mb-3">
              Smart conversations
            </p>
            <h2 className="text-3xl font-semibold tracking-heading-tight sm:text-4xl text-balance">
              Real questions your bot can answer
            </h2>
            <p className="mt-3 text-muted-fg text-lg">
              Anything they&apos;d ask you in a first call, except your bot
              answers instantly, 24/7.
            </p>
          </div>
        </SectionReveal>

        <div className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2">
          {QUESTIONS.map((question, i) => (
            <SectionReveal key={question} delay={i * 80}>
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-bg p-4 transition-all duration-300 hover:shadow-soft-hover hover:border-primary/20">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${AVATAR_COLORS[i]}`}
                >
                  <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                </div>
                <span className="text-sm leading-relaxed pt-1">
                  {question}
                </span>
              </div>
            </SectionReveal>
          ))}
        </div>

        <SectionReveal delay={500}>
          <p className="mt-8 text-center text-sm text-muted-fg">
            Your bot pulls answers directly from your resume and uploaded
            documents. No hallucination, only what you&apos;ve shared.
          </p>
        </SectionReveal>
      </div>
    </section>
  );
}
