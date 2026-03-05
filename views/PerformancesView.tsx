import React, { useState } from "react";
import { PerformanceStatus, PerformanceUser } from "@/api/performance";
import usePerformances from "@/hooks/usePerformances";
import PerformanceCard from "@/components/PerformanceCard";
import CurrentPerformanceCard from "@/components/CurrentPerformanceCard";
import Header from "@/components/Header";
import Link from "next/link";
import ErrorView from "./ErrorView";
import PerformanceList from "@/components/PerformanceList";

const PerformancesView = ({ eventId }: { eventId: number }) => {
  const { performances, error, pendingPerformances, updatePerformance } =
    usePerformances(eventId);

  const [currentPerformanceIndex] = useState<number>(0);
  const [showSkipConfirm, toggleSkipConfirmModal] = useState(false);

  const skipPerformanceConfirmHandler = (performance: PerformanceUser) => {
    updatePerformance(eventId, {
      ...performance,
      status: PerformanceStatus.COMPLETED,
    });
    toggleSkipConfirmModal(false);
  };

  if (error) {
    return (
      <>
        <ErrorView errorMessage={error} />
      </>
    );
  }

  return (
    <>
      <Header backBtnLink="/events" />
      <div className="p-4 pb-20 relative">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Now Performing
          </h2>
          {pendingPerformances[currentPerformanceIndex] ? (
            <CurrentPerformanceCard
              performance={pendingPerformances[currentPerformanceIndex]}
              toggleSkipConfirmModal={toggleSkipConfirmModal}
            />
          ) : (
            <div className="border p-4 rounded text-center text-gray-500">
              No performers yet
            </div>
          )}
        </div>

        <PerformanceList
          performances={performances}
          currentPerformanceIndex={currentPerformanceIndex}
          title="Up Next"
          performanceStatus={PerformanceStatus.COMPLETED}
          eventId={eventId}
          toggleSkipConfirmModal={toggleSkipConfirmModal}
          cardBtnText="Up"
        ></PerformanceList>

        <PerformanceList
          performances={performances}
          currentPerformanceIndex={currentPerformanceIndex}
          title="Completed"
          performanceStatus={PerformanceStatus.COMPLETED}
          eventId={eventId}
          toggleSkipConfirmModal={toggleSkipConfirmModal}
          cardBtnText="Activate"
        ></PerformanceList>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <Link
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-center block"
            href={`/events/${eventId}/signup/`}
          >
            Sign Up to Perform
          </Link>
        </div>

        {/* Delete Confirmation Modal - Updated text to reflect "Skip" instead of "Delete" */}
        {showSkipConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4">Confirm Skip</h3>
              <p className="mb-6">
                Are you sure you want to skip this performer?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => toggleSkipConfirmModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    skipPerformanceConfirmHandler(
                      pendingPerformances[currentPerformanceIndex]
                    )
                  }
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PerformancesView;
