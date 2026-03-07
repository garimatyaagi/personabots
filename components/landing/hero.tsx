"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatMockup } from "./chat-mockup";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/40 via-accent/20 to-bg" />
      <div className="absolute inset-0 bg-grid opacity-50" />

      <div className="relative">
        {/* Text content */}
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-12 sm:pt-28 sm:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 animate-fade-in">
              AI-powered resume chatbots
            </Badge>

            <h1 className="text-display lg:text-display-lg font-bold text-balance animate-fade-in">
              Your resume, but
              <span className="text-gradient"> it talks back</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-fg leading-relaxed sm:text-xl animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              Upload your resume. Get a personal AI chatbot. Share one link.
              Now recruiters, clients, and collaborators can ask your bot
              anything about your work.
            </p>

            <div
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center animate-fade-in"
              style={{ animationDelay: "200ms" }}
            >
              <Link href="/sign-up">
                <Button size="lg" className="gap-2 text-base">
                  Get started free
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Button>
              </Link>
              <Link href="#product-demo">
                <Button variant="secondary" size="lg" className="gap-2 text-base">
                  <Play className="h-3.5 w-3.5" strokeWidth={2} />
                  See it in action
                </Button>
              </Link>
            </div>

            <p
              className="mt-4 text-sm text-muted-fg/70 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              Starting at &#8377;99/month. Takes 2 minutes to set up.
            </p>
          </div>
        </div>

        {/* Chat mockup */}
        <div id="product-demo" className="relative mx-auto max-w-6xl px-4 pb-20 sm:pb-28">
          {/* Glow behind mockup */}
          <div className="absolute inset-0 glow-accent pointer-events-none" />
          <ChatMockup />
        </div>
      </div>
    </section>
  );
}
