// ============================================================================
// Poll Detail Page
// ============================================================================

"use client";

import { use } from "react";
import { usePoll } from "@/hooks/use-polls";
import { PollDetailView } from "@/components/polls/poll-detail-view";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { ErrorState } from "@/components/ui/error-state";
import { ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function PollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pollId = parseInt(id, 10);
  const { data: poll, isLoading, isError, error, refetch } = usePoll(pollId);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <Link
        href="/polls"
        className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Polls
      </Link>

      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-6 text-xs text-[var(--color-text-secondary)]">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>Live results — refreshing every 5 seconds</span>
        <span className="relative flex h-1.5 w-1.5 ml-1">
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-success)]" />
        </span>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="space-y-4">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-64" />
        </div>
      )}

      {isError && (
        <ErrorState
          message={error?.message || "Failed to load poll"}
          onRetry={refetch}
        />
      )}

      {poll && <PollDetailView poll={poll} />}
    </div>
  );
}
