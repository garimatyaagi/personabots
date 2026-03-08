"use client";

import { Input } from "@/components/ui/input";
import { Calendar, ExternalLink, Info } from "lucide-react";

interface CalendarSettingsProps {
  calendarUrl: string;
  onChange: (url: string) => void;
}

export function CalendarSettings({
  calendarUrl,
  onChange,
}: CalendarSettingsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary" strokeWidth={1.75} />
        <label className="text-sm font-medium">Calendar booking</label>
      </div>

      <p className="text-xs text-muted-fg leading-relaxed">
        Add your scheduling link so visitors can book time with you directly
        from the chat. Supports Calendly, Cal.com, Google Calendar, or any
        booking URL.
      </p>

      <Input
        id="calendar-url"
        placeholder="https://calendly.com/your-name or https://cal.com/your-name"
        value={calendarUrl}
        onChange={(e) => onChange(e.target.value)}
      />

      {calendarUrl && (
        <div className="flex items-center gap-2 rounded-lg bg-accent/20 px-3 py-2 text-xs text-muted-fg">
          <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span>
            A &quot;Book time&quot; button will appear in your bot&apos;s chat header and
            after extended conversations.
          </span>
        </div>
      )}

      {calendarUrl && (
        <a
          href={calendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline w-fit"
        >
          <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
          Preview booking page
        </a>
      )}
    </div>
  );
}
