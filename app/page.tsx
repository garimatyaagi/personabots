import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  MessageCircle,
  Link2,
  ArrowRight,
  Upload,
  Bot,
  Share2,
  Briefcase,
  Users,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

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

const WHAT_IT_ANSWERS = [
  "Tell me about their experience with React and TypeScript",
  "What projects have they led?",
  "Why are they a good fit for a senior engineer role?",
  "What's their management style and team experience?",
  "Walk me through their most impactful project",
  "What are their salary expectations and availability?",
];

const USE_CASES = [
  {
    icon: Briefcase,
    title: "Job seekers",
    description:
      "Stand out from 500 other applicants. Recruiters can instantly get answers about your experience without scheduling a call.",
    stat: "10x",
    statLabel: "more engagement",
  },
  {
    icon: Users,
    title: "Freelancers & consultants",
    description:
      "Let potential clients explore your skills and past work through a conversation. Close leads while you sleep.",
    stat: "24/7",
    statLabel: "availability",
  },
  {
    icon: TrendingUp,
    title: "Founders & builders",
    description:
      "Share your story with investors, partners, and collaborators. Your bot pitches you exactly how you would.",
    stat: "100%",
    statLabel: "your voice",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/30" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6">Add an AI to your resume</Badge>
            <h1 className="text-4xl font-bold tracking-heading sm:text-5xl lg:text-6xl">
              Let recruiters
              <span className="text-primary"> chat with your resume</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-fg sm:text-xl">
              Upload your resume. Get a personal AI bot. Add the link to your
              resume, LinkedIn, or portfolio. Now anyone — recruiters, clients,
              collaborators — can ask your bot anything about your work.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="gap-2 text-base">
                  Get started
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="secondary" size="lg" className="text-base">
                  See how it works
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-fg/70">
              Starting at &#8377;99/month. Takes 2 minutes to set up.
            </p>
          </div>
        </div>
      </section>

      {/* Social proof / value prop bar */}
      <section className="border-y border-border bg-bg">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 px-4 py-8 sm:flex-row sm:gap-12">
          <div className="flex items-center gap-2 text-sm text-muted-fg">
            <FileText className="h-4 w-4 text-primary" strokeWidth={1.75} />
            Upload any document
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-fg">
            <MessageCircle
              className="h-4 w-4 text-primary"
              strokeWidth={1.75}
            />
            Real-time AI chat
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-fg">
            <Link2 className="h-4 w-4 text-primary" strokeWidth={1.75} />
            One shareable link
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-fg">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} />
            Powered by GPT-4o
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-heading sm:text-3xl">
            Three steps. Two minutes. One powerful link.
          </h2>
          <p className="mt-3 text-muted-fg">
            Go from resume PDF to a chatbot anyone can talk to.
          </p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.step} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                <step.icon
                  className="h-6 w-6 text-primary"
                  strokeWidth={1.75}
                />
              </div>
              <span className="mt-4 block text-xs font-bold uppercase tracking-widest text-primary">
                Step {step.step}
              </span>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-fg">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What recruiters can ask */}
      <section className="bg-accent/40">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-heading sm:text-3xl">
              What can a recruiter ask your bot?
            </h2>
            <p className="mt-3 text-muted-fg">
              Anything they&apos;d ask you in a first call — except your bot
              answers instantly, 24/7.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
            {WHAT_IT_ANSWERS.map((question) => (
              <div
                key={question}
                className="flex items-start gap-3 rounded-xl border border-border bg-bg p-4"
              >
                <MessageCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  strokeWidth={1.75}
                />
                <span className="text-sm leading-relaxed">{question}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-fg">
            Your bot pulls answers directly from your resume and uploaded
            documents. No hallucination — only what you&apos;ve shared.
          </p>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-heading sm:text-3xl">
            Built for people who want to stand out
          </h2>
          <p className="mt-3 text-muted-fg">
            Your bot works for you while you focus on what matters.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {USE_CASES.map((useCase) => (
            <Card key={useCase.title}>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <useCase.icon
                      className="h-5 w-5 text-primary"
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      {useCase.stat}
                    </span>
                    <span className="ml-1 text-xs text-muted-fg">
                      {useCase.statLabel}
                    </span>
                  </div>
                </div>
                <h3 className="text-base font-semibold">{useCase.title}</h3>
                <p className="text-sm leading-relaxed text-muted-fg">
                  {useCase.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Personal */}
      <section className="border-y border-border bg-accent/20">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <h2 className="text-center text-2xl font-semibold tracking-heading sm:text-3xl">
            Why add Personal to your resume?
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              "Recruiters get instant answers — no scheduling needed",
              "Your bot speaks in your voice, not generic AI",
              "Works 24/7 across every timezone",
              "Grounded in your actual experience — zero hallucination",
              "One link for your resume, LinkedIn, portfolio, email signature",
              "Control what's shared — keep private info private",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  strokeWidth={1.75}
                />
                <span className="text-sm leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-2xl bg-primary p-10 text-center sm:p-14">
          <h2 className="text-2xl font-semibold tracking-heading text-[#f8faed] sm:text-3xl">
            Your resume is static. Make it interactive.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[#f8faed]/80">
            Upload your resume, get a shareable AI bot, and let recruiters chat
            with your experience. It takes 2 minutes.
          </p>
          <Link href="/sign-up" className="mt-8 inline-block">
            <Button
              size="lg"
              className="gap-2 border-2 border-[#f8faed] bg-[#f8faed] text-base text-primary hover:bg-[#f8faed]/90"
            >
              Create your Personal bot
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-center text-sm text-muted-fg">
            Personal &mdash; let recruiters chat with your resume.
          </p>
        </div>
      </footer>
    </div>
  );
}
