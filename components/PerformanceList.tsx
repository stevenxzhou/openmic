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
  cardBtnText,
}: {
  performances: PerformanceUser[];
  currentPerformanceIndex: number;
  title: string;
  performanceStatus: PerformanceStatus;
  eventId: number;
  toggleSkipConfirmModal: any;
  cardBtnText: string;
}) {
  let filteredPerformances = performances.filter(
    (performance) => performance.status === performanceStatus,
  );

  const { activatePerformanceHandler, calculateWaitTime } = useHelpers({
    currentPerformanceIndex,
    eventId,
    toggleSkipConfirmModal,
  });

  return (
    <>
      <div>
        <h2 className="text-lg font-semibold text-gray-600 mb-2">{title}</h2>
        <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
          {filteredPerformances.slice(currentPerformanceIndex).length > 0 ? (
            <div className="space-y-4">
              {filteredPerformances.map((performance, idx) => {
                const index = currentPerformanceIndex + idx;
                return (
                  <PerformanceCard
                    performance={performance}
                    index={index}
                    performanceHandler={activatePerformanceHandler}
                    calculateWaitTime={calculateWaitTime}
                    showCardBtn={true}
                    cardBtnText={cardBtnText}
                  />
                );
              })}
            </div>
          ) : (
            <div className="border p-4 rounded text-center text-gray-500">
              No one in queue
            </div>
          )}
        </div>
      </div>
    </>
  );
}
