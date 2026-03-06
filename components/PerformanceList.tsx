import { useEffect, useRef, useState } from "react";
import PerformanceCard from "@/components/PerformanceCard";
import { PerformanceStatus, PerformanceUser } from "@/hooks/usePerformances";
import useHelpers from "@/hooks/useHelpers";

export default function PerformanceList({
  performances,
  currentPerformanceIndex,
  title,
  performanceStatus,
  eventId,
  toggleSkipConfirmModal,
  defaultCollapsed = false,
  onComplete,
  onDelete,
  onMoveToFirst,
  highlightLastCard,
  scrollToBottomSignal,
}: {
  performances: PerformanceUser[];
  currentPerformanceIndex: number;
  title: string;
  performanceStatus: PerformanceStatus;
  eventId: number;
  toggleSkipConfirmModal: any;
  defaultCollapsed?: boolean;
  onComplete?: (performance: PerformanceUser) => void;
  onDelete?: (performance: PerformanceUser) => void;
  onMoveToFirst?: (performance: PerformanceUser) => void;
  highlightLastCard?: boolean;
  scrollToBottomSignal?: number;
}) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const listRef = useRef<HTMLDivElement | null>(null);
  const lastCardRef = useRef<HTMLDivElement | null>(null);

  let filteredPerformances = performances.filter(
    (performance) => performance.status === performanceStatus,
  );
  const sortedPerformances = [...filteredPerformances].sort(
    (a, b) => (a.performance_index ?? 0) - (b.performance_index ?? 0),
  );

  const { calculateWaitTime } = useHelpers({
    currentPerformanceIndex,
    eventId,
    toggleSkipConfirmModal,
  });

  const showActions = Boolean(onComplete || onDelete);
  const showWaitTime = performanceStatus !== PerformanceStatus.COMPLETED;

  useEffect(() => {
    if (
      performanceStatus !== PerformanceStatus.PENDING ||
      isCollapsed ||
      scrollToBottomSignal === undefined
    ) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (lastCardRef.current) {
        lastCardRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      } else if (listRef.current) {
        listRef.current.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [performanceStatus, isCollapsed, scrollToBottomSignal]);

  return (
    <>
      <div className="mb-6">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex justify-between items-center text-lg font-semibold text-gray-600 mb-2 hover:text-gray-800"
        >
          <span>{title}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-transform ${
              isCollapsed ? "" : "rotate-180"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {!isCollapsed && (
          <div
            ref={listRef}
            className="max-h-[calc(100vh-350px)] overflow-y-auto"
          >
            {sortedPerformances.slice(currentPerformanceIndex).length > 0 ? (
              <div className="space-y-4">
                {sortedPerformances.map((performance, idx) => {
                  const index = currentPerformanceIndex + idx;
                  const isLastPendingCard =
                    performanceStatus === PerformanceStatus.PENDING &&
                    idx === sortedPerformances.length - 1;
                  return (
                    <div
                      key={performance.performance_id}
                      ref={isLastPendingCard ? lastCardRef : null}
                    >
                      <PerformanceCard
                        performance={performance}
                        index={index}
                        calculateWaitTime={calculateWaitTime}
                        showWaitTime={showWaitTime}
                        showActions={showActions}
                        isHighlighted={
                          Boolean(highlightLastCard) && isLastPendingCard
                        }
                        onComplete={onComplete}
                        onDelete={onDelete}
                        onMoveToFirst={onMoveToFirst}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border p-4 rounded text-center text-gray-500">
                No one in queue
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
