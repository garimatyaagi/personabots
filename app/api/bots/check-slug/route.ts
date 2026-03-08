import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");

  if (!slug || slug.length < 2) {
    return NextResponse.json({ available: false, reason: "Slug must be at least 2 characters" });
  }

  // Validate slug format
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug) && slug.length > 1) {
    return NextResponse.json({
      available: false,
      reason: "Only lowercase letters, numbers, and hyphens allowed",
    });
  }

  // Reserved slugs
  const reserved = ["new", "admin", "api", "bot", "settings", "dashboard", "explore", "pricing", "sign-in", "sign-up"];
  if (reserved.includes(slug)) {
    return NextResponse.json({ available: false, reason: "This slug is reserved" });
  }

  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("bots")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    return NextResponse.json({
      available: !data,
      reason: data ? "This slug is already taken" : undefined,
    });
  } catch {
    return NextResponse.json({ available: true }); // Fail open
  }
}
