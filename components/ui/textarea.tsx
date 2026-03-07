import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            "min-h-[100px] w-full rounded-xl border border-border bg-input-bg px-3 py-2 text-sm text-text",
            "placeholder:text-muted-fg/60",
            "transition-all duration-200 resize-y",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent/50 focus:bg-white",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-primary ring-1 ring-primary/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-primary">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
