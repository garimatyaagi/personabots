import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      console.error("Missing webhook signature or secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify signature
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload;

    const supabase = createServerClient();

    switch (eventType) {
      case "subscription.activated": {
        const sub = payload.subscription?.entity;
        if (!sub) break;

        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_start: sub.current_start
              ? new Date(sub.current_start * 1000).toISOString()
              : null,
            current_period_end: sub.current_end
              ? new Date(sub.current_end * 1000).toISOString()
              : null,
          })
          .eq("razorpay_subscription_id", sub.id);

        console.log(`Subscription activated: ${sub.id}`);
        break;
      }

      case "subscription.charged": {
        const sub = payload.subscription?.entity;
        const payment = payload.payment?.entity;
        if (!sub || !payment) break;

        // Update subscription period
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_start: sub.current_start
              ? new Date(sub.current_start * 1000).toISOString()
              : null,
            current_period_end: sub.current_end
              ? new Date(sub.current_end * 1000).toISOString()
              : null,
          })
          .eq("razorpay_subscription_id", sub.id);

        // Get our subscription row for the FK
        const { data: dbSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("razorpay_subscription_id", sub.id)
          .single();

        if (dbSub) {
          // Record payment
          await supabase.from("payments").upsert(
            {
              subscription_id: dbSub.id,
              razorpay_payment_id: payment.id,
              amount: payment.amount,
              currency: payment.currency || "INR",
              status: payment.status || "captured",
              method: payment.method || null,
            },
            { onConflict: "razorpay_payment_id" }
          );
        }

        console.log(`Subscription charged: ${sub.id}, payment: ${payment.id}`);
        break;
      }

      case "subscription.cancelled": {
        const sub = payload.subscription?.entity;
        if (!sub) break;

        await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("razorpay_subscription_id", sub.id);

        console.log(`Subscription cancelled: ${sub.id}`);
        break;
      }

      case "subscription.expired": {
        const sub = payload.subscription?.entity;
        if (!sub) break;

        await supabase
          .from("subscriptions")
          .update({ status: "expired" })
          .eq("razorpay_subscription_id", sub.id);

        console.log(`Subscription expired: ${sub.id}`);
        break;
      }

      case "payment.failed": {
        const payment = payload.payment?.entity;
        if (!payment) break;

        console.error(`Payment failed: ${payment.id}`, payment.error_code);
        // Don't change subscription status — Razorpay handles retries
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ received: true }); // Always return 200 to avoid retries
  }
}
