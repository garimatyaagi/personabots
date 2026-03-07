"use client";

import Link from "next/link";
import { SectionReveal } from "./section-reveal";
import { Button } from "@/components/ui/button";
import {
  Bot,
  MessageCircle,
  Share2,
  BarChart3,
  Shield,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  { icon: Bot, text: "Unlimited AI bots" },
  { icon: MessageCircle, text: "GPT-4o powered chat" },
  { icon: Share2, text: "Shareable public links" },
  { icon: BarChart3, text: "Conversation analytics" },
  { icon: Shield, text: "Privacy controls" },
  { icon: Sparkles, text: "Resume, PDF & doc uploads" },
];

export function PricingSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <SectionReveal>
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-primary mb-3">
            Simple pricing
          </p>
          <h2 className="text-3xl font-semibold tracking-heading-tight sm:text-4xl text-balance">
            One plan. Everything you need.
          </h2>
        </div>
      </SectionReveal>

      <SectionReveal delay={200} animation="scale-in">
        <div className="mx-auto mt-12 max-w-md">
          <div className="rounded-2xl border border-border bg-bg p-8 shadow-soft transition-all duration-300 hover:shadow-soft-hover">
            {/* Price */}
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold">&#8377;99</span>
                <span className="text-muted-fg text-lg">/month</span>
              </div>
              <p className="mt-2 text-sm text-muted-fg">
                Cancel anytime. No lock-in.
              </p>
            </div>

            {/* Divider */}
            <div className="my-6 h-px bg-border" />

            {/* Features */}
            <div className="space-y-3">
              {FEATURES.map((feature) => (
                <div key={feature.text} className="flex items-center gap-3">
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-primary"
                    strokeWidth={1.75}
                  />
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link href="/pricing" className="block mt-8">
              <Button size="lg" className="w-full gap-2 text-base">
                Get started
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            </Link>

            <p className="mt-3 text-center text-xs text-muted-fg">
              Secure payment via Razorpay. Supports UPI, cards, and net banking.
            </p>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
