"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { SkillsInput } from "@/components/bot-builder/skills-input";
import { CustomLinksInput } from "@/components/bot-builder/custom-links-input";
import { HighlightsInput } from "@/components/bot-builder/highlights-input";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { ThemeSelector } from "@/components/ui/theme-selector";
import type { BotBuilderState } from "@/types";

interface StepBasicsProps {
  state: BotBuilderState;
  onChange: (updates: Partial<BotBuilderState["basics"]>) => void;
}

const PERSONALITY_TRAITS = [
  { key: "friendly", label: "Friendly & warm" },
  { key: "concise", label: "Concise & direct" },
  { key: "humorous", label: "Witty & humorous" },
  { key: "professional", label: "Professional & polished" },
  { key: "technical", label: "Technical & detailed" },
  { key: "empathetic", label: "Empathetic & understanding" },
];

export function StepBasics({ state, onChange }: StepBasicsProps) {
  const { basics } = state;

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-heading">
          Bot basics
        </h2>
        <p className="text-sm text-muted-fg">
          Give your bot a name, personality, and voice.
        </p>
      </div>

      {/* Avatar upload */}
      <AvatarUpload
        name={basics.name || "Bot"}
        onFileSelect={(file) => onChange({ avatar_file: file })}
      />

      <Input
        id="bot-name"
        label="Bot name"
        placeholder="e.g., Career Bot, My Networking Agent"
        value={basics.name}
        onChange={(e) => {
          const name = e.target.value;
          onChange({
            name,
            slug: basics.slug || generateSlug(name),
          });
        }}
      />

      <Input
        id="bot-slug"
        label="URL slug"
        placeholder="my-bot-name"
        value={basics.slug}
        onChange={(e) => onChange({ slug: e.target.value })}
      />
      <p className="text-xs text-muted-fg -mt-4">
        Your bot will be at: /b/{basics.slug || "your-slug"}
      </p>

      <Input
        id="bot-headline"
        label="Headline"
        placeholder="e.g., Full-Stack Developer | 5 Years at Google"
        value={basics.headline}
        onChange={(e) => onChange({ headline: e.target.value })}
      />

      <Textarea
        id="bot-description"
        label="Short bio"
        placeholder="A brief description of what this bot does and who it represents..."
        value={basics.description}
        onChange={(e) => onChange({ description: e.target.value })}
        rows={3}
      />

      <Textarea
        id="bot-about"
        label="About (extended bio)"
        placeholder="A longer bio about yourself, your experience, achievements, and what you're looking for..."
        value={basics.about}
        onChange={(e) => onChange({ about: e.target.value })}
        rows={4}
      />

      <Slider
        label="Tone"
        value={basics.tone}
        onChange={(value) => onChange({ tone: value })}
        min={0}
        max={100}
        leftLabel="Formal"
        rightLabel="Casual"
      />

      <div>
        <label className="text-sm font-medium">
          Personality traits
        </label>
        <p className="text-xs text-muted-fg mb-3">
          Select traits that match your voice.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PERSONALITY_TRAITS.map(({ key, label }) => (
            <Toggle
              key={key}
              checked={basics.personality_traits[key] || false}
              onChange={(checked) =>
                onChange({
                  personality_traits: {
                    ...basics.personality_traits,
                    [key]: checked,
                  },
                })
              }
              label={label}
            />
          ))}
        </div>
      </div>

      <SkillsInput
        skills={basics.skills}
        onChange={(skills) => onChange({ skills })}
      />

      <HighlightsInput
        highlights={basics.highlights}
        onChange={(highlights) => onChange({ highlights })}
      />

      <CustomLinksInput
        links={basics.custom_links}
        onChange={(custom_links) => onChange({ custom_links })}
      />

      <ThemeSelector
        value={basics.theme}
        onChange={(theme) => onChange({ theme })}
      />
    </div>
  );
}
