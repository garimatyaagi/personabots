import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@/lib/supabase/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { botSlug, lastAssistantMessage } = await req.json();

    if (!botSlug || !lastAssistantMessage) {
      return NextResponse.json(
        { error: "botSlug and lastAssistantMessage required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { data: bot } = await supabase
      .from("bots")
      .select("name, description, headline")
      .eq("slug", botSlug)
      .single();

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content: `You generate follow-up questions for a chatbot named "${bot.name}" (${bot.headline || bot.description || "personal AI assistant"}). Given the last assistant response, suggest 2-3 short, specific follow-up questions the visitor might ask next. Keep them conversational and under 60 characters each. Return ONLY a JSON array of strings.`,
        },
        {
          role: "user",
          content: `Last response: "${lastAssistantMessage.slice(0, 500)}"`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "[]";
    let suggestions: string[] = [];
    try {
      suggestions = JSON.parse(raw);
      if (!Array.isArray(suggestions)) suggestions = [];
      suggestions = suggestions
        .filter((s): s is string => typeof s === "string")
        .slice(0, 3);
    } catch {
      suggestions = [];
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
