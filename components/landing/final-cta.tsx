"use client";

import Link from "next/link";
import { SectionReveal } from "./section-reveal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <SectionReveal animation="scale-in">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 text-center sm:p-16">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-grid opacity-[0.04]" />
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(248,250,237,0.1)_0%,transparent_70%)]" />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-heading-tight text-[#f8faed] sm:text-4xl lg:text-5xl text-balance">
              Your resume is static.
              <br className="hidden sm:block" />
              Make it conversational.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[#f8faed]/80 text-lg leading-relaxed">
              Upload your resume, get a shareable AI bot, and let recruiters
              chat with your experience. It takes 2 minutes.
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
        </div>
      </SectionReveal>
    </section>
  );
}
