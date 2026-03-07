"use client";

import { SectionReveal } from "./section-reveal";
import {
  FileText,
  MessageCircle,
  Link2,
  Sparkles,
} from "lucide-react";

const ITEMS = [
  { icon: FileText, label: "Upload any document" },
  { icon: MessageCircle, label: "Real-time AI chat" },
  { icon: Link2, label: "One shareable link" },
  { icon: Sparkles, label: "Powered by GPT-4o" },
];

export function SocialProofBar() {
  return (
    <section className="border-y border-border bg-bg">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 px-4 py-8 sm:flex-row sm:gap-12">
        {ITEMS.map((item, i) => (
          <SectionReveal key={item.label} delay={i * 100} animation="fade-up">
            <div className="flex items-center gap-2.5 text-sm text-muted-fg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/50">
                <item.icon
                  className="h-4 w-4 text-primary"
                  strokeWidth={1.75}
                />
              </div>
              {item.label}
            </div>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
