"use client";

import Link from "next/link";
import { ClipboardPaste, UserCheck, Bookmark } from "lucide-react";

const ACTIONS = [
  {
    label: "Paste a job",
    description: "Add a job description and get match analysis",
    icon: ClipboardPaste,
    href: "/dashboard/jobs",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Improve profile",
    description: "Get AI suggestions to strengthen your profile",
    icon: UserCheck,
    href: "/dashboard/profile",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "View saved jobs",
    description: "Review your saved jobs and tailored content",
    icon: Bookmark,
    href: "/dashboard/jobs?stage=saved",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ACTIONS.map((action, i) => (
        <Link key={action.label} href={action.href}>
          <div
            className="group rounded-2xl border border-border bg-white/70 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-soft-hover hover:border-border/80 cursor-pointer animate-fade-in"
            style={{
              animationDelay: `${i * 80}ms`,
              animationFillMode: "backwards",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${action.bg} transition-transform duration-200 group-hover:scale-110`}
              >
                <action.icon
                  className={`h-4 w-4 ${action.color}`}
                  strokeWidth={1.75}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-fg group-hover:text-primary transition-colors">
                  {action.label}
                </p>
                <p className="text-xs text-muted-fg mt-0.5 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
