"use client";

import { useState, useEffect, useCallback } from "react";
import { ScoreDisplay } from "@/components/profile/score-display";
import { SuggestionCard } from "@/components/profile/suggestion-card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import type { ProfileScore } from "@/types";

export default function ProfilePage() {
  const [score, setScore] = useState<ProfileScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchScore = useCallback(async () => {
    try {
      const res = await fetch("/api/profile/score");
      const data = await res.json();
      if (data.score) {
        setScore(data.score);
      }
    } catch {
      // Silently fail, show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/profile/score", { method: "POST" });
      const data = await res.json();
      if (data.score) {
        setScore({
          ...data.score,
          id: score?.id || "",
          user_id: score?.user_id || "",
          bot_id: score?.bot_id || null,
          created_at: score?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch {
      // Show error state
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-border/50 rounded-lg" />
          <div className="h-40 bg-border/50 rounded-2xl" />
          <div className="h-20 bg-border/50 rounded-2xl" />
          <div className="h-20 bg-border/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Profile Strength
          </h1>
          <p className="text-sm text-muted-fg mt-1">
            AI-powered analysis of your professional profile
          </p>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={analyzing}
          size="sm"
          className="gap-2"
        >
          {analyzing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {analyzing ? "Analyzing..." : score ? "Re-analyze" : "Analyze profile"}
        </Button>
      </div>

      {!score ? (
        /* Empty State */
        <div className="rounded-2xl border border-border bg-white/70 backdrop-blur-sm p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Sparkles className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold mb-2">
            Analyze your profile
          </h2>
          <p className="text-sm text-muted-fg max-w-md mx-auto mb-6 leading-relaxed">
            Get AI-powered insights on your profile strength across 7
            dimensions: clarity, credibility, proof, relevance, keywords,
            differentiation, and completeness.
          </p>
          <Button onClick={runAnalysis} disabled={analyzing} className="gap-2">
            {analyzing ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {analyzing ? "Analyzing..." : "Run analysis"}
          </Button>
        </div>
      ) : (
        /* Score Display */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Score Panel */}
          <div className="rounded-2xl border border-border bg-white/70 backdrop-blur-sm p-6">
            <ScoreDisplay
              overallScore={score.overall_score}
              dimensions={score.dimensions}
              analyzedAt={score.analyzed_at}
            />
          </div>

          {/* Suggestions Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Suggestions</h2>
              <span className="text-xs text-muted-fg">
                {score.suggestions.length} improvement
                {score.suggestions.length !== 1 ? "s" : ""} found
              </span>
            </div>

            {score.suggestions.length > 0 ? (
              <div className="space-y-3">
                {score.suggestions.map((suggestion, i) => (
                  <SuggestionCard
                    key={`${suggestion.dimension}-${i}`}
                    suggestion={suggestion}
                    index={i}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-green-100 bg-green-50/50 p-8 text-center">
                <p className="text-sm font-semibold text-green-700">
                  Your profile is looking great!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  All dimensions are scoring well. Keep your profile updated.
                </p>
              </div>
            )}

            {/* Memory count info */}
            <p className="text-xs text-muted-fg/70 pt-2">
              Analyzed {score.analyzed_memory_count} document
              {score.analyzed_memory_count !== 1 ? "s" : ""} from your profile
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
