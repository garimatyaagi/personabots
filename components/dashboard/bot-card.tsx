"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BotCompleteness } from "@/components/dashboard/bot-completeness";
import {
  ExternalLink,
  Settings,
  MessageSquare,
  Check,
  Copy,
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
    <Card className="card-hover group">
      <CardContent className="flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar name={bot.name} src={bot.avatar_url} size="md" />
              {isPublic && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold leading-tight">{bot.name}</h3>
              <p className="text-xs text-muted-fg">/b/{bot.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BotCompleteness bot={bot} size="sm" />
            <Badge variant={isPublic ? "default" : "muted"}>
              {isPublic ? "Live" : "Private"}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {bot.description && (
          <p className="text-sm text-muted-fg line-clamp-2 leading-relaxed">
            {bot.description}
          </p>
        )}

        {/* Tags row */}
        {useCase && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize text-xs">
              {useCase.type}
            </Badge>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          {isPublic && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs press-effect"
              onClick={handleShare}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-600" strokeWidth={2} />
              ) : (
                <Copy className="h-3 w-3" strokeWidth={1.75} />
              )}
              {copied ? "Copied!" : "Copy link"}
            </Button>
          )}
          {isPublic && (
            <Link href={`/b/${bot.slug}`} target="_blank">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs press-effect">
                <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                Preview
              </Button>
            </Link>
          )}
          <div className="flex-1" />
          <Link href={`/bot/${bot.id}/conversations`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs press-effect">
              <MessageSquare className="h-3 w-3" strokeWidth={1.75} />
              Chats
            </Button>
          </Link>
          <Link href={`/bot/${bot.id}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs press-effect">
              <Settings className="h-3 w-3" strokeWidth={1.75} />
              Edit
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
