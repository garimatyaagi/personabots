"use client";

import { useInView } from "@/lib/hooks/use-in-view";
import { SectionReveal } from "./section-reveal";
import { cn } from "@/lib/utils/cn";
import { Upload, Bot, Share2 } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Upload,
    title: "Upload your resume",
    description:
      "Drop your resume, LinkedIn profile, portfolio links, or any document. Personal reads and understands it all.",
  },
  {
    step: "02",
    icon: Bot,
    title: "Your AI bot is ready",
    description:
      "In seconds, you get a personal AI that knows your work history, skills, projects, and achievements inside out.",
  },
  {
    step: "03",
    icon: Share2,
    title: "Share your link",
    description:
      "Add your Personal link to your resume, LinkedIn, or portfolio. Anyone can now chat with your bot about you.",
  },
];

function ConnectorLine({ isInView }: { isInView: boolean }) {
  return (
    <div className="hidden sm:flex items-center flex-1 max-w-[80px] mx-2">
      <div className="relative h-px w-full bg-border/30">
        <div
          className={cn(
            "absolute inset-y-0 left-0 bg-primary/30 transition-all duration-1000 ease-out",
            isInView ? "w-full" : "w-0"
          )}
          style={{ height: "1px" }}
        />
      </div>
    </div>
  );
}

export function HowItWorks() {
  const { ref, isInView } = useInView({ threshold: 0.15 });

  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-24">
      <SectionReveal>
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-primary mb-3">
            How it works
          </p>
          <h2 className="text-3xl font-semibold tracking-heading-tight sm:text-4xl text-balance">
            Three steps. Two minutes. One powerful link.
          </h2>
          <p className="mt-3 text-muted-fg text-lg">
            Go from resume PDF to a chatbot anyone can talk to.
          </p>
        </div>
      </SectionReveal>

      <div
        ref={ref}
        className="mt-16 flex flex-col sm:flex-row sm:items-start sm:justify-center gap-8 sm:gap-0"
      >
        {STEPS.map((step, i) => (
          <div key={step.step} className="contents">
            <SectionReveal
              delay={i * 250}
              className="relative text-center max-w-xs mx-auto sm:mx-0"
            >
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                <step.icon
                  className="h-7 w-7 text-primary"
                  strokeWidth={1.75}
                />
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-[#f8faed]">
                  {step.step}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-fg">
                {step.description}
              </p>
            </SectionReveal>
            {i < STEPS.length - 1 && <ConnectorLine isInView={isInView} />}
          </div>
        ))}
      </div>
    </section>
  );
}
