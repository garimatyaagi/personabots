import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  MessageSquare,
  Zap,
  Shield,
  Brain,
  ArrowRight,
} from "lucide-react";

const USE_CASES = [
  {
    icon: Briefcase,
    title: "Hiring Bot",
    description:
      "Answer recruiter questions, walk through your resume, generate cover letters and interview prep.",
    badge: "Popular",
  },
  {
    icon: Users,
    title: "Networking Bot",
    description:
      "Craft cold DMs, warm intros, follow-ups, and elevator pitches that sound like you.",
    badge: "Popular",
  },
  {
    icon: MessageSquare,
    title: "Customer Support",
    description:
      "Answer customer questions using your knowledge base and product docs.",
    badge: null,
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "Memory Layer",
    description:
      "Upload your resume, notes, and links. Your bot learns from everything and stays consistent.",
  },
  {
    icon: Zap,
    title: "Use-Case Playbooks",
    description:
      "Pre-built playbooks for hiring, networking, and more. Each bot knows what to do.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Control what's shareable. Your private memories stay private, even when your bot is public.",
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
          <div className="mx-auto max-w-2xl text-center">
            <Badge className="mb-4">Now in beta</Badge>
            <h1 className="text-4xl font-bold tracking-heading sm:text-5xl lg:text-6xl">
              Create AI chatbots that
              <span className="text-primary"> sound like you</span>
            </h1>
            <p className="mt-4 text-lg text-muted-fg sm:text-xl">
              Build personal AI bots for hiring, networking, investor outreach,
              and more. Powered by your memory, voice, and style.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="gap-2">
                  Create your first bot
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Button>
              </Link>
              <Link href="#use-cases">
                <Button variant="secondary" size="lg">
                  See examples
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-heading sm:text-3xl">
            How it works
          </h2>
          <p className="mt-2 text-muted-fg">
            Three ingredients for a bot that actually sounds like you.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                  <feature.icon
                    className="h-5 w-5 text-text"
                    strokeWidth={1.75}
                  />
                </div>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-fg">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-heading sm:text-3xl">
            Built for every use case
          </h2>
          <p className="mt-2 text-muted-fg">
            Choose a playbook or build your own custom bot.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {USE_CASES.map((useCase) => (
            <Card key={useCase.title}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <useCase.icon
                      className="h-5 w-5 text-text"
                      strokeWidth={1.75}
                    />
                  </div>
                  {useCase.badge && <Badge>{useCase.badge}</Badge>}
                </div>
                <h3 className="text-base font-semibold">{useCase.title}</h3>
                <p className="text-sm text-muted-fg">{useCase.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-xl bg-accent p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold tracking-heading sm:text-3xl">
            Ready to build your bot?
          </h2>
          <p className="mt-2 text-muted-fg">
            Takes 5 minutes. Upload your resume, pick a use case, and publish.
          </p>
          <Link href="/sign-up" className="mt-6 inline-block">
            <Button size="lg" className="gap-2">
              Get started free
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-center text-sm text-muted-fg">
            PersonaBots — AI chatbots that sound like you.
          </p>
        </div>
      </footer>
    </div>
  );
}
