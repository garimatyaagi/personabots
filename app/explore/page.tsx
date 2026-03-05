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
} from "lucide-react";

interface ExplorBot {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  tone: number;
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

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-heading">
            Explore
          </h1>
          <p className="mt-2 text-muted-fg max-w-lg mx-auto">
            Discover AI-powered personal bots. Chat with anyone&apos;s bot to
            learn about them, explore their work, or start a conversation.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative max-w-md mx-auto w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-fg" />
            <Input
              placeholder="Search bots..."
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
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  category === value
                    ? "bg-primary text-[#f8faed]"
                    : "bg-accent/40 text-text hover:bg-accent"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </div>
        </div>

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
                ? "No bots match your search. Try a different query."
                : "No public bots yet. Be the first to create one!"}
            </p>
            <Link href="/bot/new">
              <Button size="sm" className="gap-1.5 mt-2">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                Create a bot
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bots.map((bot) => {
              const useCaseType = bot.use_cases?.[0]?.type || "custom";
              return (
                <Link key={bot.id} href={`/b/${bot.slug}`}>
                  <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 group cursor-pointer">
                    <CardContent className="flex flex-col gap-3 py-5">
                      <div className="flex items-start gap-3">
                        <Avatar name={bot.name} src={bot.avatar_url} size="md" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                            {bot.name}
                          </h3>
                          <Badge
                            variant="muted"
                            className="text-[10px] capitalize mt-0.5"
                          >
                            {useCaseType}
                          </Badge>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-fg opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                      </div>

                      {bot.description && (
                        <p className="text-xs text-muted-fg line-clamp-2 leading-relaxed">
                          {bot.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-1">
                        <span className="text-[10px] text-muted-fg/60">
                          {new Date(bot.created_at).toLocaleDateString()}
                        </span>
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
        )}
      </main>
    </div>
  );
}
