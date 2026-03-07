import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="animate-fade-in">
      {/* Stats bar skeleton */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-white/60 p-4"
          >
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Bot cards skeleton */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <BotCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function BotCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-white/60 p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1.5" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="mt-4">
        <SkeletonText lines={2} />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-16 rounded-xl" />
        <Skeleton className="h-8 w-14 rounded-xl" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
}
