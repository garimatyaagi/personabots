"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Settings,
  MessageSquare,
  Share2,
  Check,
} from "lucide-react";
import type { BotWithUseCase } from "@/types";

interface BotCardProps {
  bot: BotWithUseCase;
}

export function BotCard({ bot }: BotCardProps) {
  const [copied, setCopied] = useState(false);
  const useCase = bot.use_cases?.[0];
  const shareLink = bot.share_links?.[0];
  const isPublic = shareLink?.access !== "private";

  function handleShare() {
    const url = `${window.location.origin}/b/${bot.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={bot.name} src={bot.avatar_url} size="md" />
            <div>
              <h3 className="font-semibold">{bot.name}</h3>
              <p className="text-xs text-muted-fg">/b/{bot.slug}</p>
            </div>
          </div>
          <Badge variant={isPublic ? "default" : "muted"}>
            {shareLink?.access || "private"}
          </Badge>
        </div>

        {bot.description && (
          <p className="text-sm text-muted-fg line-clamp-2">
            {bot.description}
          </p>
        )}

        {useCase && (
          <Badge variant="outline" className="w-fit capitalize">
            {useCase.type}
          </Badge>
        )}

        <div className="flex gap-2 pt-1">
          {/* Share button — prominent first */}
          {isPublic && (
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5"
              onClick={handleShare}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
              ) : (
                <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
              {copied ? "Copied!" : "Share"}
            </Button>
          )}
          {isPublic && (
            <Link href={`/b/${bot.slug}`} target="_blank">
              <Button variant="secondary" size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                View
              </Button>
            </Link>
          )}
          <Link href={`/bot/${bot.id}`}>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Settings className="h-3.5 w-3.5" strokeWidth={1.75} />
              Settings
            </Button>
          </Link>
          <Link href={`/bot/${bot.id}/conversations`}>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
              Chats
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
