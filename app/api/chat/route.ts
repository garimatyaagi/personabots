import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createChatStream, storeAssistantMessage } from "@/lib/chat/runtime";
import { rateLimit } from "@/lib/utils/rate-limit";
import { checkModeration } from "@/lib/utils/moderation";

export const dynamic = "force-dynamic";
import { v4 as uuidv4 } from "uuid";

// POST /api/chat — streaming chat endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { botSlug, message, conversationId, visitorId, mode } = body;

    if (!botSlug || !message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "botSlug and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Message too long (max 5000 chars)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rate limit by visitor
    const rateLimitKey = visitorId || req.headers.get("x-forwarded-for") || "anonymous";
    const rl = rateLimit(`chat:${rateLimitKey}`, {
      maxRequests: 30,
      windowMs: 60 * 1000,
    });

    if (!rl.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many messages. Please slow down." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Moderation check
    const moderation = await checkModeration(message);
    if (moderation.flagged) {
      return new Response(
        JSON.stringify({
          error: "Your message was flagged for inappropriate content.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createServerClient();

    // Fetch bot
    const { data: bot } = await supabase
      .from("bots")
      .select("*")
      .eq("slug", botSlug)
      .single();

    if (!bot) {
      return new Response(
        JSON.stringify({ error: "Bot not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check access
    const { data: shareLink } = await supabase
      .from("share_links")
      .select("access")
      .eq("bot_id", bot.id)
      .single();

    const isPublicAccess = shareLink?.access !== "private";

    if (!isPublicAccess) {
      return new Response(
        JSON.stringify({ error: "This bot is private" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const { data: conv } = await supabase
        .from("conversations")
        .insert({
          bot_id: bot.id,
          visitor_id: visitorId || uuidv4(),
        })
        .select("id")
        .single();
      convId = conv?.id;
    }

    if (!convId) {
      return new Response(
        JSON.stringify({ error: "Failed to create conversation" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get use case
    const { data: useCases } = await supabase
      .from("bot_use_cases")
      .select("*")
      .eq("bot_id", bot.id)
      .eq("is_active", true)
      .limit(1);

    const useCase = useCases?.[0] || null;

    // Validate mode if provided
    const validModes = ["default", "hiring", "consulting"];
    const chatMode = validModes.includes(mode) ? mode : undefined;

    // Create streaming response
    const stream = await createChatStream({
      bot,
      useCase,
      conversationId: convId,
      userMessage: message,
      isPublic: isPublicAccess,
      mode: chatMode,
    });

    // Stream the response
    const encoder = new TextEncoder();
    let fullContent = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullContent += content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content, conversationId: convId })}\n\n`)
              );
            }
          }

          // Store complete assistant message
          if (fullContent) {
            await storeAssistantMessage(convId, fullContent);
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
