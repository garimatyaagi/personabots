"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { detectPlatformIcon } from "@/lib/utils/migrate-links";
import {
  Plus,
  X,
  Linkedin,
  Twitter,
  Github,
  Globe,
  Youtube,
  Instagram,
  ExternalLink,
} from "lucide-react";
import type { CustomLink } from "@/types";

interface CustomLinksInputProps {
  links: CustomLink[];
  onChange: (links: CustomLink[]) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  youtube: Youtube,
  instagram: Instagram,
  website: Globe,
};

function getIcon(link: CustomLink): React.ElementType {
  const detected = link.icon || (link.url ? detectPlatformIcon(link.url) : undefined);
  return ICON_MAP[detected || ""] || ExternalLink;
}

export function CustomLinksInput({ links, onChange }: CustomLinksInputProps) {
  function addLink() {
    if (links.length >= 10) return;
    onChange([...links, { label: "", url: "" }]);
  }

  function updateLink(index: number, field: "label" | "url", value: string) {
    const updated = links.map((link, i) => {
      if (i !== index) return link;
      const newLink = { ...link, [field]: value };
      if (field === "url") {
        newLink.icon = detectPlatformIcon(value);
      }
      return newLink;
    });
    onChange(updated);
  }

  function removeLink(index: number) {
    onChange(links.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="text-sm font-medium">Links</label>
      <p className="text-xs text-muted-fg mb-2">
        Add links to your resume, social profiles, portfolio, etc.
      </p>

      <div className="flex flex-col gap-2">
        {links.map((link, i) => {
          const Icon = getIcon(link);
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/50">
                <Icon className="h-4 w-4 text-text" strokeWidth={1.75} />
              </div>
              <Input
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                placeholder="Label (e.g. Resume, LinkedIn)"
                className="flex-1"
              />
              <Input
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLink(i)}
                className="h-8 w-8 shrink-0 text-muted-fg hover:text-primary"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Button>
            </div>
          );
        })}
      </div>

      {links.length < 10 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className="mt-2 gap-1.5 text-muted-fg"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Add link
        </Button>
      )}
    </div>
  );
}
