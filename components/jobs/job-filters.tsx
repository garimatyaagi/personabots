"use client";

import { Bookmark } from "lucide-react";

interface JobFiltersProps {
  sortBy: "match" | "date" | "company";
  onSortChange: (sort: "match" | "date" | "company") => void;
  showSaved: boolean;
  onShowSavedChange: (show: boolean) => void;
}

export function JobFilters({
  sortBy,
  onSortChange,
  showSaved,
  onShowSavedChange,
}: JobFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <select
        value={sortBy}
        onChange={(e) =>
          onSortChange(e.target.value as "match" | "date" | "company")
        }
        className="rounded-lg border border-border bg-white/60 px-3 py-1.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="match">Match score</option>
        <option value="date">Newest first</option>
        <option value="company">Company A-Z</option>
      </select>

      <button
        type="button"
        onClick={() => onShowSavedChange(!showSaved)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          showSaved
            ? "bg-primary/10 text-primary"
            : "bg-transparent text-fg hover:bg-[rgba(24,23,23,0.05)]"
        }`}
      >
        <Bookmark
          className="h-4 w-4"
          strokeWidth={1.75}
          fill={showSaved ? "currentColor" : "none"}
        />
        Saved only
      </button>
    </div>
  );
}
