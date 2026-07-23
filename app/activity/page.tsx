// ============================================================================
// Activity Feed Page
// ============================================================================

"use client";

import { useEvents } from "@/hooks/use-events";
import { EventFeed } from "@/components/activity/event-feed";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity, Radio } from "lucide-react";

export default function ActivityPage() {
  const { events, isPolling } = useEvents();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] flex items-center justify-center border border-[var(--color-border-subtle)]">
          <Activity className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Activity Feed</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Real-time contract events from the blockchain
          </p>
        </div>
      </div>

      {/* Events */}
      {events.length > 0 ? (
        <EventFeed events={events} isPolling={isPolling} />
      ) : isPolling ? (
        <div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-subtle)] mb-6">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]" />
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              Listening for events...
            </span>
          </div>
          <EmptyState
            icon={<Radio className="w-7 h-7 text-[var(--color-text-secondary)]" />}
            title="Waiting for events"
            description="Events will appear here as users interact with polls on the blockchain. Create a poll or cast a vote to generate events."
          />
        </div>
      ) : (
        <EmptyState
          icon={<Activity className="w-7 h-7 text-[var(--color-text-secondary)]" />}
          title="No events yet"
          description="Contract events from poll creation, voting, and closing will appear here in real-time."
        />
      )}
    </div>
  );
}
