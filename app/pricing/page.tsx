"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  Bot,
  MessageCircle,
  Share2,
  BarChart3,
  Shield,
  Search,
  Crown,
  Calendar,
  Star,
  Users,
  Zap,
} from "lucide-react";

const CREATOR_FEATURES = [
  { icon: Bot, text: "Unlimited AI bots" },
  { icon: MessageCircle, text: "GPT-4o powered chat" },
  { icon: Share2, text: "Shareable public links" },
  { icon: Calendar, text: "Calendar booking integration" },
  { icon: BarChart3, text: "Conversation analytics" },
  { icon: Shield, text: "Privacy controls & themes" },
  { icon: Sparkles, text: "Resume, PDF & doc uploads" },
];

const RECRUITER_FEATURES = [
  { icon: Search, text: "Browse all public profiles" },
  { icon: Star, text: "Top recommended profiles" },
  { icon: MessageCircle, text: "Unlimited chat with any bot" },
  { icon: Users, text: "Talent discovery by category" },
  { icon: Zap, text: "Priority chat (no rate limits)" },
  { icon: Crown, text: "Early access to new profiles" },
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(planType: "creator" | "recruiter") {
    setLoadingPlan(planType);
    setError(null);

    try {
      const res = await fetch("/api/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_type: planType }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      if (data.already_active) {
        router.push("/dashboard");
        return;
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId) {
        throw new Error("Payment configuration missing");
      }

      const price = planType === "creator" ? "99" : "499";

      const options: RazorpayOptions = {
        key: keyId,
        subscription_id: data.subscription_id,
        name: "Personal",
        description: `${planType === "creator" ? "Creator" : "Recruiter"} Plan | Rs. ${price}/month`,
        handler: function () {
          router.push("/dashboard?subscribed=1");
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null);
          },
        },
        theme: { color: planType === "creator" ? "#a91b18" : "#7c3aed" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24 page-enter">
        <div className="text-center">
          <Badge className="mb-4">Simple pricing</Badge>
          <h1 className="text-3xl font-bold tracking-heading sm:text-4xl">
            Choose your plan
          </h1>
          <p className="mt-3 text-muted-fg max-w-lg mx-auto">
            Whether you&apos;re building your personal brand or discovering talent,
            we have a plan for you.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {/* Creator Plan */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
            <CardContent className="flex flex-col gap-6 p-7">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-semibold">Creator</h3>
                </div>
                <p className="text-sm text-muted-fg mt-1">
                  Build AI bots that represent you
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">&#8377;99</span>
                <span className="text-muted-fg">/month</span>
              </div>

              <div className="space-y-3">
                {CREATOR_FEATURES.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3">
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-primary"
                      strokeWidth={1.75}
                    />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="w-full gap-2 press-effect"
                onClick={() => handleSubscribe("creator")}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === "creator" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                    Get Started
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-fg">
                Cancel anytime. No lock-in.
              </p>
            </CardContent>
          </Card>

          {/* Recruiter Plan */}
          <Card className="relative overflow-hidden border-2 border-violet-200">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            <div className="absolute top-3 right-3">
              <Badge className="bg-violet-100 text-violet-700 border-violet-200">
                Popular
              </Badge>
            </div>
            <CardContent className="flex flex-col gap-6 p-7">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                    <Crown className="h-4 w-4 text-violet-600" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-semibold">Recruiter</h3>
                </div>
                <p className="text-sm text-muted-fg mt-1">
                  Discover and connect with top talent
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">&#8377;499</span>
                <span className="text-muted-fg">/month</span>
              </div>

              <div className="space-y-3">
                {RECRUITER_FEATURES.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3">
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-violet-600"
                      strokeWidth={1.75}
                    />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="w-full gap-2 press-effect bg-violet-600 hover:bg-violet-700 text-white"
                onClick={() => handleSubscribe("recruiter")}
                disabled={loadingPlan !== null}
              >
                {loadingPlan === "recruiter" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" strokeWidth={1.75} />
                    Start Recruiting
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-fg">
                Cancel anytime. No lock-in.
              </p>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mt-6 text-center">
            <p className="text-sm text-primary">{error}</p>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-fg">
          Secure payment via Razorpay. Supports UPI, cards, and net banking.
        </p>
      </div>
    </div>
  );
}
