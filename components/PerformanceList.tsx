import { useContext, useEffect, useRef, useState } from "react";
import PerformanceCard from "@/components/PerformanceCard";
import { PerformanceStatus, PerformanceUser } from "@/hooks/usePerformances";
import useHelpers from "@/hooks/useHelpers";
import { GlobalContext } from "@/context/useGlobalContext";

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
  const { user } = useContext(GlobalContext);

  let filteredPerformances = performances.filter(
    (performance) => performance.status === performanceStatus,
  );
  const sortedPerformances = [...filteredPerformances].sort(
    (a, b) => (a.performance_index ?? 0) - (b.performance_index ?? 0),
  );
  const completedPerformancesByLikes = [...filteredPerformances].sort(
    (a, b) => (b.likes ?? 0) - (a.likes ?? 0),
  );

  const { calculateWaitTime } = useHelpers({
    currentPerformanceIndex,
    eventId,
    toggleSkipConfirmModal,
  });

  const showActions = Boolean(onComplete || onDelete);
  const showWaitTime = performanceStatus !== PerformanceStatus.COMPLETED;
  const isAdminOrHost =
    user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "host";

  const formatSongs = (songs: PerformanceUser["songs"]) => {
    if (Array.isArray(songs)) return songs.join(", ");
    if (typeof songs === "string") {
      try {
        const parsed = JSON.parse(songs);
        return Array.isArray(parsed) ? parsed.join(", ") : songs;
      } catch {
        return songs;
      }
    }
    return "";
  };

  const getInstagramHandle = (
    socialMedias: PerformanceUser["social_medias"],
  ) => {
    if (!socialMedias) return "";

    if (typeof socialMedias === "string") {
      return socialMedias.trim();
    }

    if (typeof socialMedias === "object") {
      const firstValue = Object.values(socialMedias)[0];
      return typeof firstValue === "string" ? firstValue.trim() : "";
    }

    return "";
  };

  const isInstagramHandle = (value: string): boolean => {
    if (!value) return false;
    return (
      !value.startsWith("http://") &&
      !value.startsWith("https://") &&
      !value.includes(".com") &&
      !value.includes(".net") &&
      !value.includes(".org") &&
      /^[a-zA-Z_][a-zA-Z0-9_.]{0,29}$/.test(value)
    );
  };

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
              performanceStatus === PerformanceStatus.COMPLETED ? (
                <div className="border rounded overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left w-10">#</th>
                        <th className="px-3 py-2 text-left">Performer</th>
                        <th className="px-3 py-2 text-left">Songs</th>
                        <th className="px-3 py-2 text-left">Inputs</th>
                        <th className="px-3 py-2 text-right w-16">Likes</th>
                        {isAdminOrHost && onDelete && (
                          <th className="px-3 py-2 text-right w-24">Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {completedPerformancesByLikes.map((performance, idx) => {
                        const songsText = formatSongs(performance.songs);
                        const instagramHandle = getInstagramHandle(
                          performance.social_medias,
                        );
                        const hasInstagram = isInstagramHandle(instagramHandle);
                        return (
                          <tr
                            key={performance.performance_id}
                            className="border-t border-gray-100"
                          >
                            <td className="px-3 py-2 text-gray-500">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-2 font-medium text-gray-900">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span>{performance.performers || "Guest"}</span>
                                {hasInstagram && (
                                  <a
                                    href={`https://instagram.com/${instagramHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-600 hover:text-pink-700 hover:underline text-xs font-medium"
                                  >
                                    @{instagramHandle}
                                  </a>
                                )}
                              </div>
                            </td>
                            <td
                              className="px-3 py-2 text-gray-700 max-w-[220px] truncate"
                              title={songsText}
                            >
                              {songsText || "-"}
                            </td>
                            <td className="px-3 py-2 text-gray-700">
                              {performance.inputs || "-"}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-700">
                              {performance.likes || 0}
                            </td>
                            {isAdminOrHost && onDelete && (
                              <td className="px-3 py-2 text-right">
                                <button
                                  className="text-red-600 hover:text-red-700 text-xs font-semibold"
                                  onClick={() => onDelete(performance)}
                                >
                                  Delete
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
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
              )
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
