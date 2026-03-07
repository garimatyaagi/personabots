"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  X,
  Upload,
  Bot,
  Link2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface OnboardingModalProps {
  firstName: string;
  onDismiss: () => void;
}

const STEPS = [
  {
    icon: Upload,
    title: "Upload your resume or docs",
    description:
      "Drop in your resume, portfolio, or any document. Your bot will learn everything about your experience.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Bot,
    title: "Your AI bot is ready in seconds",
    description:
      "We create a personalized chatbot that can answer questions about your skills, experience, and work.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Link2,
    title: "Share one link with the world",
    description:
      "Add it to your LinkedIn, email signature, or portfolio. Anyone can now chat with your bot.",
    color: "bg-purple-50 text-purple-600",
  },
];

export function OnboardingModal({ firstName, onDismiss }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in after mount
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleDismiss() {
    setVisible(false);
    setTimeout(onDismiss, 200);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-text/20 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div
        className={`relative mx-4 w-full max-w-lg rounded-2xl border border-border bg-bg p-6 sm:p-8 shadow-xl transition-all duration-300 ${
          visible ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
      >
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-muted-fg hover:text-text transition-colors"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/50 px-3 py-1 text-xs font-medium text-text mb-4">
            <Sparkles className="h-3 w-3" strokeWidth={2} />
            Welcome to Personal
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold">
            Hey {firstName}! Let&apos;s build your bot
          </h2>
          <p className="mt-2 text-sm text-muted-fg max-w-sm mx-auto">
            Turn your resume into a shareable AI chatbot in under 2 minutes.
            Here&apos;s how it works:
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3 mb-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            return (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  isActive
                    ? "border-primary/30 bg-accent/20 shadow-sm"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${step.color}`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <span className="text-muted-fg/50 text-xs">
                      {i + 1}.
                    </span>
                    {step.title}
                  </p>
                  {isActive && (
                    <p className="mt-1 text-xs text-muted-fg leading-relaxed animate-fade-in">
                      {step.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/bot/new" className="flex-1" onClick={handleDismiss}>
            <Button className="w-full gap-2 press-effect">
              Create your bot
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="text-muted-fg"
          >
            I&apos;ll explore first
          </Button>
        </div>
      </div>
    </div>
  );
}
