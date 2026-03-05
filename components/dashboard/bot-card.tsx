"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ExternalLink, Settings, MessageSquare } from "lucide-react";
import type { BotWithUseCase } from "@/types";

interface BotCardProps {
  bot: BotWithUseCase;
}

export function BotCard({ bot }: BotCardProps) {
  const useCase = bot.use_cases?.[0];
  const shareLink = bot.share_links?.[0];
  const isPublic = shareLink?.access !== "private";

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
