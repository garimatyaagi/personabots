"use client";

import { SectionReveal } from "./section-reveal";
import {
  Clock,
  Mic,
  Globe,
  Shield,
  Link2,
  Lock,
} from "lucide-react";

const BENEFITS = [
  {
    icon: Clock,
    text: "Instant answers for recruiters, no scheduling needed",
  },
  {
    icon: Mic,
    text: "Your voice, not generic AI",
  },
  {
    icon: Globe,
    text: "Works 24/7 across every timezone",
  },
  {
    icon: Shield,
    text: "Grounded in your actual experience, zero hallucination",
  },
  {
    icon: Link2,
    text: "One link for your resume, LinkedIn, portfolio, and email signature",
  },
  {
    icon: Lock,
    text: "You control what's shared and keep private info private",
  },
];

export function WhyPersonal() {
  return (
    <section className="border-y border-border bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-start">
          {/* Left column */}
          <SectionReveal animation="slide-left">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-medium uppercase tracking-wide text-primary mb-3">
                Why Personal
              </p>
              <h2 className="text-3xl font-semibold tracking-heading-tight sm:text-4xl text-balance">
                Why add Personal to your resume?
              </h2>
              <p className="mt-4 text-muted-fg text-lg leading-relaxed">
                In a world of identical resumes, give recruiters a reason to
                remember you. Your bot speaks in your voice, knows your work,
                and is always available.
              </p>
            </div>
          </SectionReveal>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {BENEFITS.map((benefit, i) => (
              <SectionReveal key={benefit.text} delay={i * 120} animation="slide-right">
                <div className="flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-accent/20">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/60">
                    <benefit.icon
                      className="h-5 w-5 text-primary"
                      strokeWidth={1.75}
                    />
                  </div>
                  <span className="text-base leading-relaxed pt-2">
                    {benefit.text}
                  </span>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
