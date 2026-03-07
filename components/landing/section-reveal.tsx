"use client";

import { useInView } from "@/lib/hooks/use-in-view";
import { cn } from "@/lib/utils/cn";

interface SectionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: "fade-up" | "fade-in" | "scale-in" | "slide-left" | "slide-right";
}

const hiddenClasses: Record<string, string> = {
  "fade-up": "translate-y-8 opacity-0",
  "fade-in": "opacity-0",
  "scale-in": "scale-95 opacity-0",
  "slide-left": "-translate-x-8 opacity-0",
  "slide-right": "translate-x-8 opacity-0",
};

export function SectionReveal({
  children,
  className,
  delay = 0,
  animation = "fade-up",
}: SectionRevealProps) {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isInView
          ? "translate-y-0 translate-x-0 scale-100 opacity-100"
          : hiddenClasses[animation],
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
