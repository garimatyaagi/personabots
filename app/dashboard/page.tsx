"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotCard } from "@/components/dashboard/bot-card";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { CareerStatsBar } from "@/components/dashboard/career-stats-bar";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { OnboardingModal } from "@/components/shared/onboarding-modal";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { useUser } from "@clerk/nextjs";
import {
  Plus,
  Sparkles,
  CreditCard,
  RefreshCw,
  Rocket,
  ArrowRight,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { BotWithUseCase } from "@/types";

const ONBOARDING_KEY = "personal_onboarding_dismissed";

export default function DashboardPage() {
  const [bots, setBots] = useState<BotWithUseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalConversations, setTotalConversations] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBots, setShowBots] = useState(false);
  // Career stats
  const [careerStats, setCareerStats] = useState({
    jobsFound: 0,
    jobsSaved: 0,
    applicationsInProgress: 0,
    profileStrength: null as number | null,
  });
  const {
    isActive: subActive,
    loading: subLoading,
    error: subError,
    retry,
  } = useSubscription();
  const { user } = useUser();

  useEffect(() => {
    async function fetchBots() {
      try {
        const res = await fetch("/api/bots");
        const data = await res.json();
        setBots(data.bots || []);
        // Sum conversation counts if API provides them
        const convCount = (data.bots || []).reduce(
          (sum: number, b: Record<string, unknown>) =>
            sum + ((b.conversation_count as number) || 0),
          0
        );
        setTotalConversations(convCount);

        // Show onboarding for first-time users with no bots
        if (
          (data.bots || []).length === 0 &&
          typeof window !== "undefined" &&
          !localStorage.getItem(ONBOARDING_KEY)
        ) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Failed to fetch bots:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBots();
  }, []);

  // Fetch career stats
  useEffect(() => {
    async function fetchCareerStats() {
      try {
        const [jobsRes, profileRes] = await Promise.all([
          fetch("/api/jobs"),
          fetch("/api/profile/score"),
        ]);
        const jobsData = await jobsRes.json();
        const profileData = await profileRes.json();

        const jobs = jobsData.jobs || [];
        const saved = jobs.filter(
          (j: { application?: { stage: string } }) =>
            j.application?.stage === "saved" || j.application?.stage === "tailored"
        );
        const inProgress = jobs.filter(
          (j: { application?: { stage: string } }) =>
            j.application?.stage === "applied" || j.application?.stage === "interview"
        );

        setCareerStats({
          jobsFound: jobs.length,
          jobsSaved: saved.length,
          applicationsInProgress: inProgress.length,
          profileStrength: profileData.score?.overall_score ?? null,
        });
      } catch {
        // Silently fail, keep defaults
      }
    }
    fetchCareerStats();
  }, []);

  const isLoading = loading || subLoading;
  const isPaid = subActive === true;
  const firstName = user?.firstName || "there";

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  function dismissOnboarding() {
    setShowOnboarding(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, "true");
    }
  }

  return (
    <div className="page-enter">
      {/* Onboarding modal for first-time users */}
      {showOnboarding && isPaid && (
        <OnboardingModal
          firstName={firstName}
          onDismiss={dismissOnboarding}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-heading">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-muted-fg mt-0.5">
            Here&apos;s your career copilot overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/billing">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-fg press-effect"
            >
              <CreditCard className="h-4 w-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Billing</span>
            </Button>
          </Link>
          {isPaid && (
            <Link href="/bot/new">
              <Button className="gap-2 press-effect shadow-sm">
                <Plus className="h-4 w-4" strokeWidth={1.75} />
                New Bot
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Subscription error state */}
      {!isLoading && subError && subActive === null && (
        <div className="mt-6 rounded-2xl border border-border bg-white/60 backdrop-blur-sm p-8 text-center animate-fade-in">
          <p className="text-sm text-muted-fg">
            Could not verify your subscription status.
          </p>
          <Button
            onClick={retry}
            variant="secondary"
            className="mt-3 gap-2 press-effect"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
            Try again
          </Button>
        </div>
      )}

      {/* Paywall banner for unpaid users */}
      {!isLoading && subActive === false && (
        <div className="mt-6 relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-bg to-accent/10 p-8 text-center animate-fade-in">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30">
              <Zap className="h-7 w-7 text-primary" strokeWidth={1.75} />
            </div>
            <h2 className="mt-4 text-xl font-semibold">
              Subscribe to start building
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-fg leading-relaxed">
              Get unlimited AI bots, GPT-4o powered chat, shareable links, calendar
              booking, and more starting at just &#8377;99/month.
            </p>
            <Link href="/pricing" className="mt-6 inline-block">
              <Button size="lg" className="gap-2 press-effect shadow-md">
                <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                View plans
              </Button>
            </Link>
          </div>
        </div>
      )}

      {isLoading ? (
        <DashboardSkeleton />
      ) : isPaid && bots.length === 0 ? (
        /* Rich empty state */
        <div className="mt-12 flex flex-col items-center gap-6 text-center animate-fade-in">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-accent/40 shadow-sm">
              <Rocket className="h-9 w-9 text-primary" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary ring-4 ring-bg shadow-sm">
              <Sparkles
                className="h-3.5 w-3.5 text-[#f8faed]"
                strokeWidth={2}
              />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Create your first bot</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-fg leading-relaxed">
              Upload your resume or any document and get a shareable AI chatbot
              that answers questions about your experience. It takes under
              2 minutes.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/bot/new">
              <Button size="lg" className="gap-2 press-effect shadow-sm">
                <Plus className="h-4 w-4" strokeWidth={1.75} />
                Create your first bot
              </Button>
            </Link>
            <Link href="/explore">
              <Button
                variant="secondary"
                size="lg"
                className="gap-2 press-effect"
              >
                See examples
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            </Link>
          </div>

          {/* Tip cards */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3 max-w-2xl w-full">
            {[
              {
                icon: "\ud83d\udcc4",
                title: "Upload anything",
                desc: "Resumes, PDFs, project docs, portfolios",
              },
              {
                icon: "\ud83e\udd16",
                title: "AI does the rest",
                desc: "Your bot learns your experience instantly",
              },
              {
                icon: "\ud83d\udd17",
                title: "Share one link",
                desc: "LinkedIn, email signature, portfolio",
              },
            ].map((tip, i) => (
              <div
                key={tip.title}
                className="rounded-2xl border border-border bg-white/60 backdrop-blur-sm p-4 text-left transition-all hover:shadow-soft-hover animate-fade-in"
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <span className="text-xl">{tip.icon}</span>
                <p className="mt-2 text-sm font-medium">{tip.title}</p>
                <p className="mt-0.5 text-xs text-muted-fg">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : bots.length > 0 ? (
        <div className="animate-fade-in">
          {/* Career Stats */}
          {isPaid && (
            <div className="mt-6">
              <CareerStatsBar {...careerStats} />
            </div>
          )}

          {/* Quick Actions */}
          {isPaid && (
            <div className="mt-4">
              <QuickActions />
            </div>
          )}

          {/* Collapsible Bot Section */}
          <div className="mt-8">
            <button
              onClick={() => setShowBots(!showBots)}
              className="flex items-center gap-2 text-sm font-semibold text-fg hover:text-primary transition-colors mb-4"
            >
              {showBots ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              Your Bots ({bots.length})
            </button>
            {showBots && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
                {bots.map((bot, i) => (
                  <div
                    key={bot.id}
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${i * 80}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <BotCard bot={bot} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
