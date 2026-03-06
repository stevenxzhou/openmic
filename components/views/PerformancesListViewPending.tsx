import { useRef, useEffect } from "react";
import PerformanceCard from "@/components/cards/PerformanceCard";
import { PerformanceStatus, PerformanceUser } from "@/hooks/usePerformances";
import useHelpers from "@/hooks/useHelpers";
import PerformancesListViewContainer from "@/components/views/PerformancesListViewContainer";

type Props = {
  performances: PerformanceUser[];
  currentPerformanceIndex: number;
  title: string;
  eventId: number;
  toggleSkipConfirmModal: any;
  onComplete?: (performance: PerformanceUser) => void;
  onDelete?: (performance: PerformanceUser) => void;
  onMoveNext?: (performance: PerformanceUser) => void;
  highlightLastCard?: boolean;
  scrollToBottomSignal?: number;
  eventStatus?: string;
  isAdminOrHost?: boolean;
  onStartEvent?: () => void;
  isStartingEvent?: boolean;
};

export default function PerformancesView({
  performances,
  currentPerformanceIndex,
  title,
  eventId,
  toggleSkipConfirmModal,
  onComplete,
  onDelete,
  onMoveNext,
  highlightLastCard,
  scrollToBottomSignal,
  eventStatus,
  isAdminOrHost,
  onStartEvent,
  isStartingEvent,
}: Props) {
  const lastCardRef = useRef<HTMLDivElement | null>(null);

  const sortedPerformances = [...performances]
    .filter((performance) => performance.status === PerformanceStatus.PENDING)
    .sort((a, b) => (a.performance_index ?? 0) - (b.performance_index ?? 0));

  const { calculateWaitTime } = useHelpers({
    currentPerformanceIndex,
    eventId,
    toggleSkipConfirmModal,
  });

  const showActions = Boolean(onComplete || onDelete);

  useEffect(() => {
    if (scrollToBottomSignal === undefined || !lastCardRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      lastCardRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [scrollToBottomSignal]);

  return (
    <PerformancesListViewContainer
      title={title}
      hasItems={sortedPerformances.slice(currentPerformanceIndex).length > 0}
      scrollToBottomSignal={scrollToBottomSignal}
      enableAutoScrollToBottom={true}
    >
      <div className="space-y-4">
        {eventStatus === "NEW" && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  Event has not started yet
                </p>
                <p className="text-sm text-yellow-700">
                  Start the event to begin the live performance queue.
                </p>
              </div>
              {isAdminOrHost && (
                <button
                  type="button"
                  onClick={onStartEvent}
                  disabled={Boolean(isStartingEvent)}
                  className="rounded bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isStartingEvent ? "Starting..." : "Start Event"}
                </button>
              )}
            </div>
          </div>
        )}

        {sortedPerformances.map((performance, idx) => {
          const indexOffset = eventStatus === "NEW" ? 1 : 0;
          const index = currentPerformanceIndex + idx + indexOffset;
          const isLastPendingCard = idx === sortedPerformances.length - 1;
          return (
            <div
              key={performance.performance_id}
              ref={isLastPendingCard ? lastCardRef : null}
            >
              <PerformanceCard
                performance={performance}
                index={index}
                displayNumber={currentPerformanceIndex + idx + 1}
                calculateWaitTime={calculateWaitTime}
                showWaitTime={true}
                showActions={showActions}
                isHighlighted={Boolean(highlightLastCard) && isLastPendingCard}
                onComplete={onComplete}
                onDelete={onDelete}
                onMoveNext={onMoveNext}
              />
            </div>
          );
        })}
      </div>
    </PerformancesListViewContainer>
  );
}
