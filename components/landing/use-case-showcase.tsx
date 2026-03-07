"use client";

import { SectionReveal } from "./section-reveal";
import { MiniChatMockup } from "./chat-mockup";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, TrendingUp } from "lucide-react";

const USE_CASES = [
  {
    icon: Briefcase,
    badge: "Job Seeker",
    title: "Stand out from 500 other applicants",
    stat: "10x",
    statLabel: "more engagement",
    tint: "from-blue-50 to-transparent",
    mockup: {
      botName: "Sarah Chen",
      botRole: "Product Designer",
      userLabel: "Recruiter",
      userQuestion:
        "Why is Sarah a good fit for a senior design role?",
      botAnswer:
        "Sarah has 6 years of product design experience, led cross-functional teams of 8+, and shipped redesigns that improved conversion by 34%. She specializes in design systems and user research.",
    },
  },
  {
    icon: Users,
    badge: "Freelancer",
    title: "Close leads while you sleep",
    stat: "24/7",
    statLabel: "availability",
    tint: "from-green-50 to-transparent",
    mockup: {
      botName: "Marcus Rivera",
      botRole: "Full-Stack Developer",
      userLabel: "Potential Client",
      userQuestion:
        "What's Marcus's hourly rate and availability?",
      botAnswer:
        "Marcus charges $150/hr for full-stack development. He's currently available for projects starting next month. His stack includes React, Node.js, and AWS with 40+ production apps shipped.",
    },
  },
  {
    icon: TrendingUp,
    badge: "Founder",
    title: "Let your story pitch for you",
    stat: "100%",
    statLabel: "your voice",
    tint: "from-purple-50 to-transparent",
    mockup: {
      botName: "Priya Patel",
      botRole: "CEO & Co-founder",
      userLabel: "Investor",
      userQuestion:
        "Tell me about Priya's traction and fundraising history",
      botAnswer:
        "Priya's startup reached $2M ARR in 18 months with a team of 12. She previously raised a $1.5M seed round. Before founding, she was a PM at Google for 4 years.",
    },
  },
];

export function UseCaseShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <SectionReveal>
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-primary mb-3">
            Use cases
          </p>
          <h2 className="text-3xl font-semibold tracking-heading-tight sm:text-4xl text-balance">
            Built for people who want to stand out
          </h2>
          <p className="mt-3 text-muted-fg text-lg">
            Your bot works for you while you focus on what matters.
          </p>
        </div>
      </SectionReveal>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {USE_CASES.map((useCase, i) => (
          <SectionReveal key={useCase.badge} delay={i * 200}>
            <div className="flex flex-col gap-5 h-full">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                  <useCase.icon
                    className="h-5 w-5 text-primary"
                    strokeWidth={1.75}
                  />
                </div>
                <div>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                    {useCase.badge}
                  </Badge>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-2xl font-bold text-primary">
                    {useCase.stat}
                  </span>
                  <span className="ml-1 text-[11px] text-muted-fg">
                    {useCase.statLabel}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold">{useCase.title}</h3>

              {/* Mini chat mockup */}
              <div className={`relative rounded-xl bg-gradient-to-b ${useCase.tint} p-3`}>
                <MiniChatMockup
                  botName={useCase.mockup.botName}
                  botRole={useCase.mockup.botRole}
                  userLabel={useCase.mockup.userLabel}
                  userQuestion={useCase.mockup.userQuestion}
                  botAnswer={useCase.mockup.botAnswer}
                />
              </div>
            </div>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
