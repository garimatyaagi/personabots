import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const botId = formData.get("botId") as string;

    if (!file || !botId) {
      return NextResponse.json(
        { error: "File and botId are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image must be under 5MB" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify bot ownership
    const { data: bot } = await supabase
      .from("bots")
      .select("user_id, avatar_url")
      .eq("id", botId)
      .single();

    if (!bot || bot.user_id !== userId) {
      return NextResponse.json(
        { error: "Bot not found or unauthorized" },
        { status: 404 }
      );
    }

    // Upload to Supabase storage
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${botId}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

    // Update bot avatar_url
    await supabase
      .from("bots")
      .update({ avatar_url: publicUrl })
      .eq("id", botId);

    // Delete old avatar if it was in our bucket
    if (bot.avatar_url && bot.avatar_url.includes("/avatars/")) {
      try {
        const oldPath = bot.avatar_url.split("/avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("avatars").remove([oldPath]);
        }
      } catch {
        // Non-critical, ignore
      }
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
