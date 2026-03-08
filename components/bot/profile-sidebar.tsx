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
  Calendar,
  ArrowUpRight,
  Briefcase,
  Target,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import type { SocialLinks, CustomLink } from "@/types";
import { detectPlatformIcon, migrateSocialLinksToCustomLinks } from "@/lib/utils/migrate-links";

type BotMode = "default" | "hiring" | "consulting";

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
    calendar_url?: string | null;
  };
  capabilities: string[];
  suggestedPrompts: string[];
  onPromptSelect: (prompt: string) => void;
  isOpen: boolean;
  onClose: () => void;
  mode?: BotMode;
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
  mode = "default",
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
        <div className="relative">
          <div className="rounded-2xl bg-gradient-to-br from-accent/50 to-accent/20 p-1">
            <Avatar name={bot.name} src={bot.avatar_url} size="lg" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 ring-2 ring-bg flex items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold">{bot.name}</h2>
          {bot.headline && (
            <p className="mt-0.5 text-sm text-muted-fg leading-snug">
              {bot.headline}
            </p>
          )}
        </div>
      </div>

      {/* Calendar booking */}
      {bot.calendar_url && (
        <a
          href={bot.calendar_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-all press-effect"
        >
          <Calendar className="h-4 w-4" strokeWidth={1.75} />
          Book a meeting
          <ArrowUpRight className="h-3 w-3 opacity-50" strokeWidth={2} />
        </a>
      )}

      {/* Hiring mode: Role-fit section */}
      {mode === "hiring" && bot.skills.length > 0 && (
        <div className="rounded-xl bg-blue-50/50 border border-blue-100/50 p-4">
          <p className="text-xs font-semibold text-blue-800 mb-2.5 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" strokeWidth={1.75} />
            Role-Fit Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {bot.skills.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100/70 px-2.5 py-1 text-xs text-blue-800"
              >
                <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hiring mode: Interview suggestion */}
      {mode === "hiring" && (
        <div className="rounded-xl bg-green-50/50 border border-green-100/50 p-4">
          <p className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" strokeWidth={1.75} />
            Interview Tips
          </p>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-green-700/80">
              Ask about specific projects and their impact
            </p>
            <p className="text-xs text-green-700/80">
              Explore leadership and collaboration examples
            </p>
            <p className="text-xs text-green-700/80">
              Discuss problem-solving approaches with real scenarios
            </p>
          </div>
        </div>
      )}

      {/* Consulting mode: Expertise areas */}
      {mode === "consulting" && bot.skills.length > 0 && (
        <div className="rounded-xl bg-purple-50/50 border border-purple-100/50 p-4">
          <p className="text-xs font-semibold text-purple-800 mb-2.5 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" strokeWidth={1.75} />
            Expertise Areas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {bot.skills.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-purple-100/70 px-2.5 py-1 text-xs text-purple-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

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
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-text transition-all hover:bg-accent/30 group/link"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/50 group-hover/link:bg-accent transition-colors">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <span className="flex-1 truncate">{link.label || link.url}</span>
                <ArrowUpRight className="h-3 w-3 text-muted-fg opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" strokeWidth={2} />
              </a>
            );
          })}
        </div>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="rounded-xl bg-amber-50/50 border border-amber-100/50 p-4">
          <p className="text-xs font-semibold text-amber-800 mb-2.5 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" strokeWidth={1.75} />
            {mode === "hiring" ? "Key Achievements" : "Highlights"}
          </p>
          <div className="flex flex-col gap-2">
            {highlights.map((item, i) => (
              <p key={i} className="text-xs text-amber-900/80 pl-4 relative leading-relaxed">
                <span className="absolute left-0 text-amber-400">&bull;</span>
                {item}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Skills (only in default mode — hiring/consulting show them in mode sections) */}
      {mode === "default" && bot.skills.length > 0 && (
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
          <p className="text-xs font-semibold text-muted-fg mb-2">About</p>
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
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        )}

      {/* Capabilities */}
      {capabilities.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-fg mb-2">
            Capabilities
          </p>
          <div className="flex flex-col gap-1.5">
            {capabilities.map((cap, i) => (
              <p key={i} className="text-xs text-muted-fg flex items-start gap-2">
                <span className="text-primary/60 mt-0.5">&#10003;</span>
                {cap}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Suggested prompts */}
      {suggestedPrompts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-fg mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" strokeWidth={1.75} />
            Try asking
          </p>
          <div className="flex flex-col gap-1.5">
            {suggestedPrompts.slice(0, 6).map((prompt, i) => (
              <button
                key={i}
                onClick={() => onPromptSelect(prompt)}
                className="rounded-xl border border-border bg-[var(--surface,rgba(255,255,255,0.6))] px-3 py-2.5 text-left text-xs text-text transition-all hover:border-primary/30 hover:bg-accent/20 hover:shadow-sm press-effect"
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
        className={`hidden md:block shrink-0 border-l border-border bg-bg overflow-y-auto transition-all duration-300 ease-out ${
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
              aria-label="Close profile sidebar"
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
