import { useState, useContext } from "react";
import PerformanceCard from "@/components/cards/PerformanceCard";
import { PerformanceStatus, PerformanceUser } from "@/hooks/usePerformances";
import PerformancesListViewContainer from "@/components/views/PerformancesListViewContainer";
import { GlobalContext } from "@/context/useGlobalContext";

type Props = {
  performances: PerformanceUser[];
  title: string;
};

export default function PerformancesListViewCompletedCollapsed({
  performances,
  title,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useContext(GlobalContext);

  const completedPerformances = [...performances]
    .filter((performance) => performance.status === PerformanceStatus.COMPLETED)
    .sort((a, b) => (a.performance_index ?? 0) - (b.performance_index ?? 0));

  return (
    <PerformancesListViewContainer
      title={title}
      hasItems={completedPerformances.length > 0}
      emptyState={
        <div className="border p-4 rounded text-center text-gray-500">
          {t("performances.noCompleted")}
        </div>
      }
    >
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
          aria-expanded={isExpanded}
          aria-label="Toggle completed performances"
        >
          <span className="mr-2 inline-block w-4">
            {isExpanded ? "-" : "+"}
          </span>
          {t("performances.completedSection", {
            count: completedPerformances.length,
          })}
        </button>

        {isExpanded && (
          <div className="space-y-4">
            {completedPerformances.map((performance, idx) => (
              <PerformanceCard
                key={performance.performance_id}
                performance={performance}
                index={idx + 1}
                displayNumber={idx + 1}
                calculateWaitTime={() => ""}
                showWaitTime={false}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
    </PerformancesListViewContainer>
  );
}
