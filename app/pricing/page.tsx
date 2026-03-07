"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  Bot,
  MessageCircle,
  Share2,
  BarChart3,
  Shield,
} from "lucide-react";

const FEATURES = [
  { icon: Bot, text: "Unlimited AI bots" },
  { icon: MessageCircle, text: "GPT-4o powered chat" },
  { icon: Share2, text: "Shareable public links" },
  { icon: BarChart3, text: "Conversation analytics" },
  { icon: Shield, text: "Privacy controls" },
  { icon: Sparkles, text: "Resume, PDF & doc uploads" },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/subscription/create", { method: "POST" });
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

      const options: RazorpayOptions = {
        key: keyId,
        subscription_id: data.subscription_id,
        name: "Personal",
        description: "Monthly Subscription — Rs. 99/month",
        handler: function () {
          // Payment succeeded on client side, webhook confirms server-side
          router.push("/dashboard?subscribed=1");
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        theme: { color: "#a91b18" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Navbar />

      <div className="mx-auto max-w-lg px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-heading sm:text-4xl">
            Start building your bot
          </h1>
          <p className="mt-3 text-muted-fg">
            One simple plan. Everything you need.
          </p>
        </div>

        <Card className="mt-10">
          <CardContent className="flex flex-col gap-6 p-8">
            {/* Price */}
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">&#8377;99</span>
                <span className="text-muted-fg">/month</span>
              </div>
              <p className="mt-1 text-sm text-muted-fg">
                Cancel anytime. No lock-in.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {FEATURES.map((feature) => (
                <div key={feature.text} className="flex items-center gap-3">
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-primary"
                    strokeWidth={1.75}
                  />
                  <span className="text-sm">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button
              size="lg"
              className="w-full gap-2 text-base"
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                  Subscribe &amp; Start Building
                </>
              )}
            </Button>

            {error && (
              <p className="text-center text-sm text-primary">{error}</p>
            )}

            <p className="text-center text-xs text-muted-fg">
              Secure payment via Razorpay. Supports UPI, cards, and net banking.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
