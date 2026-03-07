import Link from "next/link";
import { Bot } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-3.5 w-3.5 text-[#f8faed]" strokeWidth={1.75} />
            </div>
            <span className="text-sm font-semibold">Personal</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm text-muted-fg transition-colors hover:text-text"
            >
              Pricing
            </Link>
            <Link
              href="/explore"
              className="text-sm text-muted-fg transition-colors hover:text-text"
            >
              Explore
            </Link>
            <Link
              href="/sign-up"
              className="text-sm text-muted-fg transition-colors hover:text-text"
            >
              Get started
            </Link>
          </nav>

          <p className="text-xs text-muted-fg/60">
            &copy; {new Date().getFullYear()} Personal. Let recruiters chat with
            your resume.
          </p>
        </div>
      </div>
    </footer>
  );
}
