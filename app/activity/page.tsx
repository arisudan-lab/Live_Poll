// ============================================================================
// Activity Feed Page
// ============================================================================

"use client";

import { useEvents } from "@/hooks/use-events";
import { EventFeed } from "@/components/activity/event-feed";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonList } from "@/components/ui/skeleton-card";
import { Activity, Radio } from "lucide-react";

export default function ActivityPage() {
  const { events, isPolling } = useEvents();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-white/[0.08]">
          <Activity className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Feed</h1>
          <p className="text-sm text-zinc-400">
            Real-time contract events from the blockchain
          </p>
        </div>
      </div>

      {/* Events */}
      {events.length > 0 ? (
        <EventFeed events={events} isPolling={isPolling} />
      ) : isPolling ? (
        <div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-xs text-emerald-400">
              Listening for events...
            </span>
          </div>
          <EmptyState
            icon={<Radio className="w-7 h-7 text-emerald-400" />}
            title="Waiting for events"
            description="Events will appear here as users interact with polls on the blockchain. Create a poll or cast a vote to generate events."
          />
        </div>
      ) : (
        <EmptyState
          icon={<Activity className="w-7 h-7 text-zinc-400" />}
          title="No events yet"
          description="Contract events from poll creation, voting, and closing will appear here in real-time."
        />
      )}
    </div>
  );
}
