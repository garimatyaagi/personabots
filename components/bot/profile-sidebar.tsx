"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Linkedin,
  Twitter,
  Github,
  Globe,
  Youtube,
  Instagram,
  ExternalLink,
  Sparkles,
  X,
  Trophy,
} from "lucide-react";
import type { SocialLinks, CustomLink } from "@/types";
import { detectPlatformIcon, migrateSocialLinksToCustomLinks } from "@/lib/utils/migrate-links";

interface ProfileSidebarProps {
  bot: {
    name: string;
    avatar_url: string | null;
    headline: string | null;
    description: string | null;
    about: string | null;
    social_links: SocialLinks;
    skills: string[];
    custom_links?: CustomLink[];
    highlights?: string[];
  };
  capabilities: string[];
  suggestedPrompts: string[];
  onPromptSelect: (prompt: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  youtube: Youtube,
  instagram: Instagram,
  website: Globe,
};

function getLinkIcon(link: CustomLink): React.ElementType {
  const detected = link.icon || (link.url ? detectPlatformIcon(link.url) : undefined);
  return ICON_MAP[detected || ""] || ExternalLink;
}

export function ProfileSidebar({
  bot,
  capabilities,
  suggestedPrompts,
  onPromptSelect,
  isOpen,
  onClose,
}: ProfileSidebarProps) {
  // Use custom_links if available, otherwise migrate from social_links
  const links: CustomLink[] =
    bot.custom_links && bot.custom_links.length > 0
      ? bot.custom_links
      : migrateSocialLinksToCustomLinks(bot.social_links || {});
  const highlights = bot.highlights || [];

  const hasLinks = links.length > 0;
  const hasProfile =
    bot.headline || bot.about || bot.skills.length > 0 || hasLinks || highlights.length > 0;

  const sidebarContent = (
    <div className="flex flex-col gap-5 p-5">
      {/* Avatar + name + headline */}
      <div className="flex flex-col items-center text-center gap-3">
        <Avatar name={bot.name} src={bot.avatar_url} size="lg" />
        <div>
          <h2 className="text-lg font-semibold">{bot.name}</h2>
          {bot.headline && (
            <p className="mt-0.5 text-sm text-muted-fg leading-snug">
              {bot.headline}
            </p>
          )}
        </div>
      </div>

      {/* Custom links */}
      {hasLinks && (
        <div className="flex flex-col gap-1.5">
          {links.map((link, i) => {
            const Icon = getLinkIcon(link);
            return (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text transition-all hover:bg-accent/30"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/50">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </div>
                <span className="flex-1 truncate">{link.label || link.url}</span>
                <ExternalLink className="h-3 w-3 text-muted-fg shrink-0" strokeWidth={1.75} />
              </a>
            );
          })}
        </div>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-fg mb-2 flex items-center gap-1.5">
            <Trophy className="h-3 w-3" strokeWidth={1.75} />
            Highlights
          </p>
          <div className="flex flex-col gap-1.5">
            {highlights.map((item, i) => (
              <p key={i} className="text-xs text-text/80 pl-4 relative">
                <span className="absolute left-0 text-primary">&bull;</span>
                {item}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {bot.skills.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {bot.skills.map((skill, i) => (
            <Badge key={i} variant="default" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      {/* About */}
      {bot.about && (
        <div>
          <p className="text-xs font-medium text-muted-fg mb-1.5">About</p>
          <p className="text-sm text-text/80 leading-relaxed whitespace-pre-line">
            {bot.about}
          </p>
        </div>
      )}

      {/* Description (if no about) */}
      {!bot.about && bot.description && (
        <p className="text-sm text-text/80 leading-relaxed text-center">
          {bot.description}
        </p>
      )}

      {/* Divider */}
      {(hasProfile || bot.description) &&
        (capabilities.length > 0 || suggestedPrompts.length > 0) && (
          <div className="h-px bg-border" />
        )}

      {/* Capabilities */}
      {capabilities.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-fg mb-2">
            Capabilities
          </p>
          <div className="flex flex-col gap-1">
            {capabilities.map((cap, i) => (
              <p key={i} className="text-xs text-muted-fg">
                &bull; {cap}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Suggested prompts */}
      {suggestedPrompts.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-fg mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" strokeWidth={1.75} />
            Try asking
          </p>
          <div className="flex flex-col gap-1.5">
            {suggestedPrompts.slice(0, 6).map((prompt, i) => (
              <button
                key={i}
                onClick={() => onPromptSelect(prompt)}
                className="rounded-lg border border-border bg-[var(--surface,rgba(255,255,255,0.6))] px-3 py-2 text-left text-xs text-text transition-all hover:border-primary/30 hover:bg-accent/20"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={`hidden md:block shrink-0 border-l border-border bg-bg overflow-y-auto transition-all duration-300 ${
          isOpen ? "w-80" : "w-0 overflow-hidden"
        }`}
      >
        {isOpen && sidebarContent}
      </div>

      {/* Mobile bottom sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-text/20 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl bg-bg border-t border-border overflow-y-auto animate-slide-up">
            {/* Drag handle */}
            <div className="sticky top-0 z-10 flex justify-center py-3 bg-bg">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-accent/50 text-muted-fg hover:text-text transition-colors"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
