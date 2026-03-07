"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getPlaybook, getPlaybookDescription } from "@/lib/playbooks";
import { Globe, Lock, Eye, Linkedin, Twitter, Github } from "lucide-react";
import type { BotBuilderState, AccessLevel, SocialLinks } from "@/types";

interface StepPreviewProps {
  state: BotBuilderState;
  onAccessChange: (access: AccessLevel) => void;
}

const ACCESS_OPTIONS: { value: AccessLevel; label: string; icon: React.ElementType; desc: string }[] = [
  { value: "public", label: "Public", icon: Globe, desc: "Anyone with the link + discoverable" },
  { value: "unlisted", label: "Unlisted", icon: Eye, desc: "Only people with the link" },
  { value: "private", label: "Private", icon: Lock, desc: "Only you can access" },
];

export function StepPreview({ state, onAccessChange }: StepPreviewProps) {
  const [selectedAccess, setSelectedAccess] = useState(state.access);
  const playbook = getPlaybook(state.useCase.type);
  const ucInfo = getPlaybookDescription(state.useCase.type);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-heading">
          Preview & publish
        </h2>
        <p className="text-sm text-muted-fg">
          Review your bot and choose how to share it.
        </p>
      </div>

      {/* Bot preview card */}
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar name={state.basics.name || "Bot"} size="lg" />
            <div>
              <h3 className="text-lg font-semibold">{state.basics.name || "Untitled Bot"}</h3>
              <p className="text-sm text-muted-fg">/b/{state.basics.slug || "..."}</p>
            </div>
          </div>

          {state.basics.headline && (
            <p className="text-sm text-muted-fg">{state.basics.headline}</p>
          )}

          {state.basics.description && (
            <p className="text-sm">{state.basics.description}</p>
          )}

          {/* Social links */}
          {hasSocialLinks(state.basics.social_links) && (
            <div className="flex items-center gap-2">
              {state.basics.social_links.linkedin && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/50">
                  <Linkedin className="h-3.5 w-3.5 text-text" strokeWidth={1.75} />
                </div>
              )}
              {state.basics.social_links.twitter && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/50">
                  <Twitter className="h-3.5 w-3.5 text-text" strokeWidth={1.75} />
                </div>
              )}
              {state.basics.social_links.github && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/50">
                  <Github className="h-3.5 w-3.5 text-text" strokeWidth={1.75} />
                </div>
              )}
              {state.basics.social_links.website && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/50">
                  <Globe className="h-3.5 w-3.5 text-text" strokeWidth={1.75} />
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {state.basics.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {state.basics.skills.map((skill, i) => (
                <Badge key={i} variant="default" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">
              {ucInfo.label}
            </Badge>
            <Badge variant="muted">
              Tone: {state.basics.tone <= 40 ? "Formal" : state.basics.tone <= 60 ? "Balanced" : "Casual"}
            </Badge>
          </div>

          {/* Capabilities */}
          <div>
            <p className="text-xs font-medium text-muted-fg mb-2">
              What this bot can help with:
            </p>
            <div className="flex flex-col gap-1">
              {(playbook.capabilities || []).map((cap, i) => (
                <p key={i} className="text-sm text-muted-fg">
                  &bull; {cap}
                </p>
              ))}
            </div>
          </div>

          {/* Suggested prompts */}
          <div>
            <p className="text-xs font-medium text-muted-fg mb-2">
              Example prompts:
            </p>
            <div className="flex flex-wrap gap-2">
              {(playbook.suggested_prompts || []).slice(0, 4).map((p, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          </div>

          {/* Memory summary */}
          <div className="rounded-xl bg-accent/30 p-3">
            <p className="text-xs font-medium mb-1">Memory loaded:</p>
            <div className="flex gap-3 text-xs text-muted-fg">
              <span>{state.memory.uploads.length} file(s)</span>
              <span>{state.memory.links.length} link(s)</span>
              <span>
                {Object.values(state.memory.qa_answers).filter(Boolean).length} Q&A answers
              </span>
              {state.memory.notes && <span>+ notes</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access level */}
      <div>
        <label className="text-sm font-medium">Access level</label>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {ACCESS_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              onClick={() => {
                setSelectedAccess(value);
                onAccessChange(value);
              }}
              className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition-all ${
                selectedAccess === value
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-border-strong"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <p className="text-xs text-muted-fg">{desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function hasSocialLinks(links: SocialLinks): boolean {
  return !!(links.linkedin || links.twitter || links.github || links.website);
}
