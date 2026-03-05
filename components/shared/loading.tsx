import { Loader2 } from "lucide-react";

export function Loading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="h-6 w-6 animate-spin text-primary" strokeWidth={1.75} />
      <p className="text-sm text-muted-fg">{text}</p>
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loading />
    </div>
  );
}
