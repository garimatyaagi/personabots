"use client";

import { useInView } from "@/lib/hooks/use-in-view";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  PanelRight,
  Sparkles,
} from "lucide-react";

const DEMO_MESSAGES = [
  {
    role: "user" as const,
    content: "What design tools and methodologies does Sarah use?",
    delay: 400,
  },
  {
    role: "assistant" as const,
    content:
      "Sarah is proficient in Figma, Sketch, and Adobe Creative Suite. She follows a user-centered design process with deep expertise in:",
    bullets: [
      { bold: "Design Systems", text: "Built and maintained component libraries at two startups" },
      { bold: "User Research", text: "Led 50+ user interviews and usability studies" },
      { bold: "Prototyping", text: "Rapid prototyping with Figma and Principle" },
    ],
    delay: 1000,
  },
  {
    role: "user" as const,
    content: "Has she led any cross-functional teams?",
    delay: 2000,
  },
  {
    role: "assistant" as const,
    content:
      "Yes! At her previous role, Sarah led a cross-functional pod of 8 people (3 engineers, 2 PMs, 1 researcher, 2 designers) to redesign the merchant onboarding flow, reducing drop-off by 34%.",
    delay: 2600,
  },
];

const FOLLOW_UPS = [
  "What's her leadership style?",
  "Tell me about her portfolio",
  "Salary expectations?",
];

const SKILLS = ["Figma", "Design Systems", "User Research", "Prototyping", "Leadership"];

function DemoAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-text",
        className
      )}
    >
      {initials}
    </div>
  );
}

export function ChatMockup({ className }: { className?: string }) {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full max-w-[920px] mx-auto rounded-2xl border border-border/60 overflow-hidden transition-all duration-700",
        isInView ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]",
        className
      )}
      style={{ boxShadow: "var(--mockup-shadow-lg)" }}
    >
      {/* Browser chrome bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(24,23,23,0.03)] border-b border-border/40">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[rgba(24,23,23,0.12)]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[rgba(24,23,23,0.12)]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[rgba(24,23,23,0.12)]" />
        </div>
        <div className="ml-3 flex-1 rounded-md bg-[rgba(24,23,23,0.04)] px-3 py-1">
          <span className="text-[11px] text-muted-fg font-mono">
            mypersonal.ink/b/sarah-chen
          </span>
        </div>
      </div>

      {/* App layout */}
      <div className="flex bg-bg" style={{ height: "480px" }}>
        {/* Main chat area */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/40 bg-bg/80">
            <div className="flex items-center gap-2.5">
              <DemoAvatar name="Sarah Chen" className="h-8 w-8" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold">Sarah Chen</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                </div>
                <p className="text-[11px] text-muted-fg">Senior Product Designer</p>
              </div>
            </div>
            <div className="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg text-muted-fg">
              <PanelRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden px-4 py-4 space-y-3">
            {DEMO_MESSAGES.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2.5 opacity-0",
                  msg.role === "user" ? "justify-end" : "justify-start",
                  isInView && "animate-message-appear"
                )}
                style={{
                  animationDelay: isInView ? `${msg.delay}ms` : "0ms",
                }}
              >
                {msg.role === "assistant" && (
                  <DemoAvatar name="Sarah Chen" className="h-7 w-7 mt-0.5" />
                )}
                <div
                  className={cn(
                    "rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed max-w-[80%]",
                    msg.role === "user"
                      ? "bg-primary text-[#f8faed]"
                      : "border border-border/60 bg-[var(--surface,rgba(255,255,255,0.6))]"
                  )}
                >
                  <p>{msg.content}</p>
                  {msg.bullets && (
                    <ul className="mt-2 space-y-1">
                      {msg.bullets.map((b, j) => (
                        <li key={j} className="text-[12px]">
                          <strong>{b.bold}:</strong> {b.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            {/* Follow-up suggestions */}
            <div
              className={cn(
                "flex flex-wrap gap-1.5 pt-1 opacity-0",
                isInView && "animate-message-appear"
              )}
              style={{ animationDelay: isInView ? "3200ms" : "0ms" }}
            >
              {FOLLOW_UPS.map((text, i) => (
                <span
                  key={i}
                  className="rounded-full border border-border/60 bg-[var(--surface,rgba(255,255,255,0.6))] px-3 py-1.5 text-[11px] text-muted-fg"
                >
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Input bar */}
          <div className="border-t border-border/40 px-4 py-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-[var(--surface,rgba(255,255,255,0.6))] px-3 py-2">
              <span className="flex-1 text-[12px] text-muted-fg/50">
                Ask Sarah Chen anything...
              </span>
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                <Send className="h-3 w-3 text-primary/40" strokeWidth={1.75} />
              </div>
            </div>
          </div>
        </div>

        {/* Mini sidebar (desktop only) */}
        <div className="hidden lg:flex w-52 flex-col border-l border-border/40 bg-bg/50 p-4 gap-3 overflow-hidden">
          <div className="flex flex-col items-center text-center gap-2">
            <DemoAvatar name="Sarah Chen" className="h-12 w-12 text-sm" />
            <div>
              <p className="text-sm font-semibold">Sarah Chen</p>
              <p className="text-[11px] text-muted-fg leading-snug mt-0.5">
                Senior Product Designer
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-1">
            {SKILLS.map((skill, i) => (
              <Badge key={i} variant="default" className="text-[10px] px-2 py-0.5">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="h-px bg-border/40" />

          <div>
            <p className="text-[10px] font-medium text-muted-fg mb-1.5 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" strokeWidth={1.75} />
              Try asking
            </p>
            <div className="flex flex-col gap-1">
              {["Design process?", "Team experience?", "Notable projects?"].map(
                (q, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-border/40 px-2 py-1.5 text-[10px] text-muted-fg"
                  >
                    {q}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini version for use case cards
interface MiniChatMockupProps {
  botName: string;
  botRole: string;
  userLabel: string;
  userQuestion: string;
  botAnswer: string;
  className?: string;
}

export function MiniChatMockup({
  botName,
  botRole,
  userLabel,
  userQuestion,
  botAnswer,
  className,
}: MiniChatMockupProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/40 overflow-hidden bg-bg",
        className
      )}
      style={{ boxShadow: "var(--mockup-shadow)" }}
    >
      {/* Mini header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30 bg-bg/80">
        <DemoAvatar name={botName} className="h-6 w-6 text-[10px]" />
        <div>
          <p className="text-xs font-semibold leading-none">{botName}</p>
          <p className="text-[10px] text-muted-fg leading-none mt-0.5">{botRole}</p>
        </div>
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-green-500" />
      </div>

      {/* Mini messages */}
      <div className="p-3 space-y-2">
        {/* User message */}
        <div className="flex justify-end">
          <div className="rounded-lg bg-primary text-[#f8faed] px-2.5 py-1.5 text-[11px] leading-relaxed max-w-[85%]">
            <p className="text-[9px] text-[#f8faed]/60 font-medium mb-0.5">
              {userLabel}
            </p>
            {userQuestion}
          </div>
        </div>

        {/* Bot message */}
        <div className="flex gap-2">
          <DemoAvatar name={botName} className="h-5 w-5 text-[8px] mt-0.5" />
          <div className="rounded-lg border border-border/40 bg-[var(--surface,rgba(255,255,255,0.6))] px-2.5 py-1.5 text-[11px] leading-relaxed max-w-[85%]">
            {botAnswer}
          </div>
        </div>
      </div>
    </div>
  );
}
