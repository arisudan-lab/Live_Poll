// ============================================================================
// Skeleton Card Component
// ============================================================================

import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-4 animate-pulse",
        className
      )}
    >
      <div className="h-5 bg-white/[0.08] rounded-lg w-3/4" />
      <div className="h-3 bg-white/[0.06] rounded w-full" />
      <div className="h-3 bg-white/[0.06] rounded w-2/3" />
      <div className="space-y-2 pt-2">
        <div className="h-8 bg-white/[0.05] rounded-lg" />
        <div className="h-8 bg-white/[0.05] rounded-lg" />
        <div className="h-8 bg-white/[0.05] rounded-lg" />
      </div>
      <div className="flex justify-between pt-2">
        <div className="h-4 bg-white/[0.06] rounded w-20" />
        <div className="h-4 bg-white/[0.06] rounded w-16" />
      </div>
    </div>
  );
}

export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-4 bg-white/[0.08] rounded animate-pulse", className)}
    />
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] animate-pulse"
        >
          <div className="w-8 h-8 rounded-full bg-white/[0.08]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/[0.08] rounded w-3/4" />
            <div className="h-2 bg-white/[0.06] rounded w-1/2" />
          </div>
          <div className="h-5 w-16 bg-white/[0.06] rounded-full" />
        </div>
      ))}
    </div>
  );
}
