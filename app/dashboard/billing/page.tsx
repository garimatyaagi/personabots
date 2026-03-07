"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, CreditCard } from "lucide-react";
import Link from "next/link";
import type { Payment } from "@/types";

interface SubStatus {
  isActive: boolean;
  subscription: {
    status: string;
    current_period_end: string | null;
    cancelled_at: string | null;
  } | null;
}

export default function BillingPage() {
  const [sub, setSub] = useState<SubStatus | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/subscription/status").then((r) => r.json()),
      fetch("/api/subscription/payments").then((r) => r.json()),
    ]).then(([subData, payData]) => {
      setSub(subData);
      setPayments(payData.payments || []);
      setLoading(false);
    });
  }, []);

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSub((prev) =>
          prev
            ? {
                ...prev,
                subscription: prev.subscription
                  ? {
                      ...prev.subscription,
                      cancelled_at: new Date().toISOString(),
                    }
                  : null,
              }
            : null
        );
        setCancelConfirm(false);
        alert(data.message);
      }
    } catch {
      alert("Failed to cancel. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-fg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-fg hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold">Billing</h1>

        {/* Current Plan */}
        <Card className="mt-6">
          <CardContent className="flex items-center justify-between gap-4 p-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Pro Plan</h2>
                <Badge>
                  {sub?.subscription?.cancelled_at
                    ? "Cancelling"
                    : sub?.isActive
                      ? "Active"
                      : "Inactive"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-fg">
                &#8377;99/month
                {sub?.subscription?.current_period_end && (
                  <>
                    {" "}
                    &middot;{" "}
                    {sub.subscription.cancelled_at ? "Ends" : "Renews"}{" "}
                    {new Date(
                      sub.subscription.current_period_end
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </>
                )}
              </p>
            </div>

            {sub?.isActive && !sub.subscription?.cancelled_at && (
              <div>
                {cancelConfirm ? (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCancelConfirm(false)}
                    >
                      Keep
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="text-primary"
                    >
                      {cancelling ? "Cancelling..." : "Confirm cancel"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCancelConfirm(true)}
                  >
                    Cancel plan
                  </Button>
                )}
              </div>
            )}

            {!sub?.isActive && (
              <Link href="/pricing">
                <Button size="sm">Subscribe</Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <h2 className="mt-10 text-lg font-semibold">Payment History</h2>
        {payments.length === 0 ? (
          <p className="mt-4 text-sm text-muted-fg">No payments yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-fg" />
                  <div>
                    <p className="text-sm font-medium">
                      &#8377;{(p.amount / 100).toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-fg">
                      {new Date(p.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {p.method && ` via ${p.method}`}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    p.status === "captured"
                      ? "bg-green-100 text-green-800"
                      : ""
                  }
                >
                  {p.status === "captured" ? "Paid" : p.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
