"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { SkillsInput } from "@/components/bot-builder/skills-input";
import { CustomLinksInput } from "@/components/bot-builder/custom-links-input";
import { HighlightsInput } from "@/components/bot-builder/highlights-input";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { migrateSocialLinksToCustomLinks } from "@/lib/utils/migrate-links";
import { QRCode } from "@/components/ui/qr-code";
import { CalendarSettings } from "@/components/bot-builder/calendar-settings";
import {
  Save,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Share2,
  Twitter,
  Linkedin,
  QrCode,
} from "lucide-react";
import type { Bot, MemoryItem, CustomLink, BotTheme } from "@/types";

export default function BotSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const botId = params.botId as string;
  const { toast } = useToast();

  const [bot, setBot] = useState<Bot | null>(null);
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState(50);
  const [isPublic, setIsPublic] = useState(false);
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [theme, setTheme] = useState<BotTheme>("default");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [calendarUrl, setCalendarUrl] = useState("");

  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState<string>("");

  const getCurrentValues = useCallback(() => {
    return JSON.stringify({
      name,
      description,
      tone,
      isPublic,
      headline,
      about,
      skills,
      customLinks,
      highlights,
      theme,
      avatarUrl,
      calendarUrl,
    });
  }, [name, description, tone, isPublic, headline, about, skills, customLinks, highlights, theme, avatarUrl, calendarUrl]);

  useEffect(() => {
    if (originalValues) {
      setHasUnsavedChanges(getCurrentValues() !== originalValues);
    }
  }, [getCurrentValues, originalValues]);

  useEffect(() => {
    async function load() {
      try {
        const [botRes, memRes] = await Promise.all([
          fetch(`/api/bots/${botId}`),
          fetch(`/api/memory?botId=${botId}`),
        ]);
        const botData = await botRes.json();
        const memData = await memRes.json();

        if (botData.bot) {
          setBot(botData.bot);
          setName(botData.bot.name);
          setDescription(botData.bot.description || "");
          setTone(botData.bot.tone);
          setIsPublic(botData.bot.is_public);
          setHeadline(botData.bot.headline || "");
          setAbout(botData.bot.about || "");
          setSkills(botData.bot.skills || []);
          setTheme(botData.bot.theme || "default");
          setAvatarUrl(botData.bot.avatar_url || null);
          setHighlights(botData.bot.highlights || []);
          setCalendarUrl(botData.bot.calendar_url || "");
          // Auto-migrate social_links to custom_links if needed
          const cl = botData.bot.custom_links || [];
          if (cl.length === 0 && botData.bot.social_links) {
            setCustomLinks(migrateSocialLinksToCustomLinks(botData.bot.social_links));
          } else {
            setCustomLinks(cl);
          }

          // Set original values after a tick (to let state settle)
          setTimeout(() => {
            const vals = JSON.stringify({
              name: botData.bot.name,
              description: botData.bot.description || "",
              tone: botData.bot.tone,
              isPublic: botData.bot.is_public,
              headline: botData.bot.headline || "",
              about: botData.bot.about || "",
              skills: botData.bot.skills || [],
              customLinks: cl.length === 0 && botData.bot.social_links
                ? migrateSocialLinksToCustomLinks(botData.bot.social_links)
                : cl,
              highlights: botData.bot.highlights || [],
              theme: botData.bot.theme || "default",
              avatarUrl: botData.bot.avatar_url || null,
              calendarUrl: botData.bot.calendar_url || "",
            });
            setOriginalValues(vals);
          }, 100);
        }
        setMemoryItems(memData.items || []);
      } catch (error) {
        console.error("Failed to load bot:", error);
        toast("Failed to load bot settings", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [botId, toast]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/bots/${botId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          tone,
          is_public: isPublic,
          headline,
          about,
          skills,
          custom_links: customLinks,
          highlights,
          theme,
          avatar_url: avatarUrl,
          calendar_url: calendarUrl || null,
        }),
      });
      if (res.ok) {
        toast("Changes saved successfully");
        setOriginalValues(getCurrentValues());
        setHasUnsavedChanges(false);
      } else {
        toast("Failed to save changes", "error");
      }
    } catch {
      toast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this bot?")) return;
    await fetch(`/api/bots/${botId}`, { method: "DELETE" });
    toast("Bot deleted", "info");
    router.push("/dashboard");
  }

  async function handleDeleteMemory(itemId: string) {
    await fetch(`/api/memory/${itemId}`, { method: "DELETE" });
    setMemoryItems((prev) => prev.filter((m) => m.id !== itemId));
    toast("Memory item removed");
  }

  async function toggleShareable(itemId: string, current: boolean) {
    await fetch(`/api/memory/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_shareable: !current }),
    });
    setMemoryItems((prev) =>
      prev.map((m) =>
        m.id === itemId ? { ...m, is_shareable: !current } : m
      )
    );
    toast(!current ? "Item now visible to visitors" : "Item hidden from visitors");
  }

  function copyLink() {
    const url = `${window.location.origin}/b/${bot?.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast("Bot link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <SettingsSkeleton />
        </main>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-bg">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-muted-fg">Bot not found.</p>
            <Button variant="secondary" onClick={() => router.push("/dashboard")} className="press-effect">
              Back to dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const botUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/b/${bot.slug}`;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 page-enter">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-heading">
              Settings
            </h1>
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 unsaved-dot" />
                Unsaved
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={copyLink} className="gap-1.5 press-effect">
              {copied ? (
                <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
              ) : (
                <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
              {copied ? "Copied" : "Copy link"}
            </Button>
            <a href={`/b/${bot.slug}`} target="_blank">
              <Button variant="secondary" className="gap-1.5 press-effect">
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                Preview
              </Button>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Bot details */}
          <Card>
            <CardHeader>
              <CardTitle>Bot details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Avatar upload */}
              <AvatarUpload
                name={name || "Bot"}
                currentUrl={avatarUrl}
                botId={botId}
                onUpload={(url) => setAvatarUrl(url)}
                onRemove={() => setAvatarUrl(null)}
              />

              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., Full-Stack Developer | 5 Years at Google"
              />
              <Textarea
                label="Short bio"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <Textarea
                label="About (extended bio)"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="A longer bio about yourself..."
                rows={4}
              />
              <Slider
                label="Tone"
                value={tone}
                onChange={setTone}
                leftLabel="Formal"
                rightLabel="Casual"
              />
              <Toggle
                checked={isPublic}
                onChange={setIsPublic}
                label="Public bot"
                description="Allow anyone to chat with this bot"
              />
            </CardContent>
          </Card>

          {/* Theme */}
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeSelector value={theme} onChange={setTheme} />
            </CardContent>
          </Card>

          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <SkillsInput skills={skills} onChange={setSkills} />
              <HighlightsInput highlights={highlights} onChange={setHighlights} />
              <CustomLinksInput links={customLinks} onChange={setCustomLinks} />
              <CalendarSettings
                calendarUrl={calendarUrl}
                onChange={setCalendarUrl}
              />
            </CardContent>
          </Card>

          {/* Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>Sharing</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="rounded-xl border border-border bg-accent/20 p-3">
                <p className="text-sm font-mono text-text break-all">{botUrl}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm" onClick={copyLink} className="gap-1.5 press-effect">
                  {copied ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                  ) : (
                    <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  )}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my personal AI bot: ${name}`)}&url=${encodeURIComponent(botUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm" className="gap-1.5 press-effect">
                    <Twitter className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Twitter
                  </Button>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(botUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm" className="gap-1.5 press-effect">
                    <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />
                    LinkedIn
                  </Button>
                </a>
              </div>

              {/* QR Code */}
              <div className="mt-2 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="h-4 w-4 text-muted-fg" strokeWidth={1.75} />
                  <span className="text-sm font-medium text-muted-fg">QR Code</span>
                </div>
                <div className="flex justify-center">
                  <QRCode url={botUrl} label={bot.slug} size={140} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save button - sticky on mobile */}
          <div className="sticky bottom-4 z-10">
            <Button
              onClick={handleSave}
              isLoading={saving}
              className="w-full sm:w-fit gap-2 press-effect shadow-lg"
              disabled={!hasUnsavedChanges && !saving}
            >
              <Save className="h-4 w-4" strokeWidth={1.75} />
              {saving ? "Saving..." : hasUnsavedChanges ? "Save changes" : "Saved"}
            </Button>
          </div>

          {/* Memory */}
          <Card>
            <CardHeader>
              <CardTitle>Memory items ({memoryItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {memoryItems.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <FileText className="h-8 w-8 text-muted-fg/30" strokeWidth={1.5} />
                  <p className="text-sm text-muted-fg">
                    No memory items yet. Upload documents when creating your bot.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {memoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-accent/10"
                    >
                      <FileText
                        className="h-4 w-4 shrink-0 text-muted-fg"
                        strokeWidth={1.75}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-fg capitalize">
                          {item.source_type} &bull;{" "}
                          {item.raw_text.length.toLocaleString()} chars
                        </p>
                      </div>
                      <Toggle
                        checked={item.is_shareable}
                        onChange={() =>
                          toggleShareable(item.id, item.is_shareable)
                        }
                        label="Public"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMemory(item.id)}
                        className="h-8 w-8 shrink-0 text-muted-fg hover:text-primary"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Danger zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="danger" onClick={handleDelete} className="gap-2 press-effect">
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                Delete bot
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-white/60 p-5">
          <Skeleton className="h-5 w-24 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <SkeletonText lines={2} />
          </div>
        </div>
      ))}
    </div>
  );
}
