"use client";

import { Linkedin, Twitter, Github, Globe } from "lucide-react";
import type { SocialLinks } from "@/types";

interface SocialLinksInputProps {
  links: SocialLinks;
  onChange: (links: SocialLinks) => void;
}

const PLATFORMS = [
  { key: "linkedin" as const, label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/yourname" },
  { key: "twitter" as const, label: "Twitter / X", icon: Twitter, placeholder: "https://x.com/yourhandle" },
  { key: "github" as const, label: "GitHub", icon: Github, placeholder: "https://github.com/yourname" },
  { key: "website" as const, label: "Website", icon: Globe, placeholder: "https://yoursite.com" },
];

export function SocialLinksInput({ links, onChange }: SocialLinksInputProps) {
  return (
    <div>
      <label className="text-sm font-medium">Social links</label>
      <p className="text-xs text-muted-fg mb-3">
        Add links to your profiles. These will appear on your bot page.
      </p>

      <div className="flex flex-col gap-2.5">
        {PLATFORMS.map(({ key, label, icon: Icon, placeholder }) => (
          <div key={key} className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/50">
              <Icon className="h-4 w-4 text-text" strokeWidth={1.75} />
            </div>
            <input
              type="url"
              value={links[key] || ""}
              onChange={(e) =>
                onChange({ ...links, [key]: e.target.value })
              }
              placeholder={placeholder}
              aria-label={label}
              className="flex-1 rounded-xl border border-border bg-input-bg px-3 py-2 text-sm outline-none placeholder:text-muted-fg/50 focus:ring-2 focus:ring-accent transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
