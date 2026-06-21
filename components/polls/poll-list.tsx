// ============================================================================
// Poll List Component
// ============================================================================

"use client";

import { Poll, PollStatus } from "@/types";
import { PollCard } from "./poll-card";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { BarChart3, Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PollListProps {
  polls: Poll[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch?: () => void;
}

const filters = [
  { value: "all", label: "All" },
  { value: PollStatus.Active, label: "Active" },
  { value: PollStatus.Closed, label: "Closed" },
];

export function PollList({
  polls,
  isLoading,
  isError,
  error,
  refetch,
}: PollListProps) {
  const [filter, setFilter] = useState<string>("all");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.message || "Failed to load polls"}
        onRetry={refetch}
      />
    );
  }

  const filteredPolls =
    filter === "all"
      ? polls || []
      : (polls || []).filter((p) => p.status === filter);

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-zinc-500" />
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              filter === f.value
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "bg-white/[0.04] text-zinc-400 border border-transparent hover:bg-white/[0.06] hover:text-white"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredPolls.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="w-7 h-7 text-violet-400" />}
          title="No polls found"
          description={
            filter === "all"
              ? "No polls have been created yet. Be the first to create one!"
              : `No ${filter} polls found. Try a different filter.`
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPolls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}
