import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/conversations?botId=... — list conversations for a bot
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const botId = searchParams.get("botId");

  if (!botId) {
    return NextResponse.json({ error: "botId is required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Verify bot ownership
  const { data: bot } = await supabase
    .from("bots")
    .select("user_id")
    .eq("id", botId)
    .single();

  if (!bot || bot.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch conversations with message count and latest message
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      messages(content, role, created_at)
    `
    )
    .eq("bot_id", botId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  // Format response
  const formatted = (conversations || []).map((conv) => {
    const msgs = conv.messages || [];
    const userMessages = msgs.filter((m: { role: string }) => m.role === "user");
    const firstUserMsg = userMessages[0]?.content || "New conversation";

    return {
      id: conv.id,
      visitor_id: conv.visitor_id,
      title: conv.title || firstUserMsg.slice(0, 100),
      message_count: msgs.length,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      preview: firstUserMsg.slice(0, 200),
    };
  });

  return NextResponse.json({ conversations: formatted });
}
