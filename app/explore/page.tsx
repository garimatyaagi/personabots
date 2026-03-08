"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/shared/loading";
import {
  Search,
  Briefcase,
  Users,
  TrendingUp,
  Heart,
  Headphones,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Bot,
  Crown,
  Star,
  Calendar,
} from "lucide-react";

interface ExplorBot {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  tone: number;
  skills?: string[];
  headline?: string | null;
  calendar_url?: string | null;
  created_at: string;
  use_cases: { type: string }[];
  share_links: { access: string }[];
}

const CATEGORIES = [
  { value: "", label: "All", icon: Sparkles },
  { value: "hiring", label: "Hiring", icon: Briefcase },
  { value: "networking", label: "Networking", icon: Users },
  { value: "investor", label: "Investor", icon: TrendingUp },
  { value: "dating", label: "Dating", icon: Heart },
  { value: "support", label: "Support", icon: Headphones },
  { value: "custom", label: "Custom", icon: Bot },
];

export default function ExplorePage() {
  const [bots, setBots] = useState<ExplorBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        if (category) params.set("category", category);
        const res = await fetch(`/api/explore?${params}`);
        const data = await res.json();
        setBots(data.bots || []);
      } catch (error) {
        console.error("Failed to load bots:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, category]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Separate featured/recommended bots (those with skills & headline)
  const featured = bots.filter(
    (b) => b.headline && (b.skills?.length ?? 0) > 0
  );
  const showFeatured = !search && !category && featured.length > 0;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 page-enter">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <h1 className="text-3xl font-semibold tracking-heading">
              Explore
            </h1>
          </div>
          <p className="mt-2 text-muted-fg max-w-lg mx-auto">
            Discover AI-powered personal bots. Chat with anyone&apos;s bot to
            learn about them, explore their work, or start a conversation.
          </p>

          {/* Recruiter CTA */}
          <div className="mt-4 flex justify-center">
            <Link href="/pricing">
              <div className="flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm text-violet-700 hover:bg-violet-100 transition-all press-effect cursor-pointer">
                <Crown className="h-4 w-4" strokeWidth={1.75} />
                <span>Get Recruiter access for unlimited browsing</span>
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
            </Link>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative max-w-md mx-auto w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-fg" />
            <Input
              placeholder="Search profiles..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setCategory(value)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all press-effect ${
                  category === value
                    ? "bg-primary text-[#f8faed] shadow-sm"
                    : "bg-accent/40 text-text hover:bg-accent"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Featured profiles */}
        {showFeatured && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-amber-500" strokeWidth={1.75} />
              <h2 className="text-sm font-semibold">Top Profiles</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 3).map((bot) => (
                <FeaturedBotCard key={bot.id} bot={bot} />
              ))}
            </div>
          </div>
        )}

        {/* Bot Grid */}
        {loading ? (
          <Loading />
        ) : bots.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
              <Bot className="h-7 w-7 text-text" strokeWidth={1.5} />
            </div>
            <p className="text-muted-fg">
              {search || category
                ? "No profiles match your search. Try a different query."
                : "No public profiles yet. Be the first to create one!"}
            </p>
            <Link href="/bot/new">
              <Button size="sm" className="gap-1.5 mt-2 press-effect">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                Create a bot
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {showFeatured && (
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-muted-fg" strokeWidth={1.75} />
                <h2 className="text-sm font-semibold">All Profiles</h2>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bots.map((bot, i) => {
                const useCaseType = bot.use_cases?.[0]?.type || "custom";
                return (
                  <Link key={bot.id} href={`/b/${bot.slug}`}>
                    <Card
                      className="h-full transition-all hover:shadow-md hover:border-primary/20 group cursor-pointer card-hover animate-fade-in"
                      style={{
                        animationDelay: `${i * 50}ms`,
                        animationFillMode: "backwards",
                      }}
                    >
                      <CardContent className="flex flex-col gap-3 py-5">
                        <div className="flex items-start gap-3">
                          <Avatar name={bot.name} src={bot.avatar_url} size="md" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                              {bot.name}
                            </h3>
                            {bot.headline ? (
                              <p className="text-xs text-muted-fg truncate mt-0.5">
                                {bot.headline}
                              </p>
                            ) : (
                              <Badge
                                variant="muted"
                                className="text-[10px] capitalize mt-0.5"
                              >
                                {useCaseType}
                              </Badge>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-fg opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                        </div>

                        {bot.description && (
                          <p className="text-xs text-muted-fg line-clamp-2 leading-relaxed">
                            {bot.description}
                          </p>
                        )}

                        {/* Skills */}
                        {bot.skills && bot.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {bot.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="rounded-md bg-accent/40 px-1.5 py-0.5 text-[10px] text-muted-fg"
                              >
                                {skill}
                              </span>
                            ))}
                            {bot.skills.length > 3 && (
                              <span className="text-[10px] text-muted-fg/50 px-1">
                                +{bot.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-1">
                          <div className="flex items-center gap-2">
                            {bot.calendar_url && (
                              <span className="flex items-center gap-1 text-[10px] text-violet-600">
                                <Calendar className="h-3 w-3" strokeWidth={1.75} />
                                Bookable
                              </span>
                            )}
                          </div>
                          <span className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            <MessageSquare
                              className="h-3 w-3"
                              strokeWidth={1.75}
                            />
                            Chat
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function FeaturedBotCard({ bot }: { bot: ExplorBot }) {
  return (
    <Link href={`/b/${bot.slug}`}>
      <Card className="h-full overflow-hidden group cursor-pointer border-2 border-amber-100 hover:border-amber-200 transition-all hover:shadow-lg">
        <CardContent className="flex flex-col gap-3 py-5 relative">
          <div className="absolute top-3 right-3">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" strokeWidth={1.75} />
          </div>
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar name={bot.name} src={bot.avatar_url} size="md" />
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                {bot.name}
              </h3>
              {bot.headline && (
                <p className="text-xs text-muted-fg truncate mt-0.5">
                  {bot.headline}
                </p>
              )}
            </div>
          </div>
          {bot.description && (
            <p className="text-xs text-muted-fg line-clamp-2 leading-relaxed">
              {bot.description}
            </p>
          )}
          {bot.skills && bot.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bot.skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-amber-50 border border-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <MessageSquare className="h-3 w-3" strokeWidth={1.75} />
              Start chatting
            </span>
            {bot.calendar_url && (
              <span className="flex items-center gap-1 text-[10px] text-violet-600">
                <Calendar className="h-3 w-3" strokeWidth={1.75} />
                Bookable
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
