import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Clerk webhook to sync user data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    const supabase = createServerClient();

    switch (type) {
      case "user.created":
      case "user.updated": {
        const { id, email_addresses, first_name, last_name, image_url } = data;
        const email = email_addresses?.[0]?.email_address || "";
        const displayName = [first_name, last_name].filter(Boolean).join(" ");

        await supabase.from("users").upsert(
          {
            id,
            email,
            display_name: displayName || null,
            avatar_url: image_url || null,
          },
          { onConflict: "id" }
        );
        break;
      }
      case "user.deleted": {
        await supabase.from("users").delete().eq("id", data.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
