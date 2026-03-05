import React, { useEffect, useState } from "react";
import { PerformanceStatus, PerformanceUser } from "@/hooks/usePerformances";
import usePerformances from "@/hooks/usePerformances";
import Header from "@/components/Header";
import ErrorView from "./ErrorView";
import PerformanceList from "@/components/PerformanceList";
import PerformanceCreateView from "./PerformanceCreateView";

const PerformancesView = ({ eventId }: { eventId: number }) => {
  const {
    performances,
    error,
    updatePerformance,
    removePerformance,
    fetchPerformances,
  } = usePerformances(eventId);

  const [currentPerformanceIndex] = useState<number>(0);
  const [showSkipConfirm, toggleSkipConfirmModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [highlightLastPending, setHighlightLastPending] = useState(false);
  const [scrollToBottomSignal, setScrollToBottomSignal] = useState(0);
  const [pendingHighlightAfterAdd, setPendingHighlightAfterAdd] =
    useState(false);

  useEffect(() => {
    if (!pendingHighlightAfterAdd) return;

    const pendingList = performances
      .filter((p) => p.status === PerformanceStatus.PENDING)
      .sort((a, b) => (a.performance_index ?? 0) - (b.performance_index ?? 0));

    if (pendingList.length === 0) {
      setPendingHighlightAfterAdd(false);
      return;
    }

    setHighlightLastPending(true);
    setScrollToBottomSignal((prev) => prev + 1);
    setPendingHighlightAfterAdd(false);

    const timeoutId = setTimeout(() => {
      setHighlightLastPending(false);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [performances, pendingHighlightAfterAdd]);

  const handlePerformanceAdded = async () => {
    setPendingHighlightAfterAdd(true);
    await fetchPerformances(eventId);
  };

  const skipPerformanceConfirmHandler = (performance: PerformanceUser) => {
    updatePerformance(eventId, {
      ...performance,
      status: PerformanceStatus.COMPLETED,
    });
    toggleSkipConfirmModal(false);
  };

  const handleComplete = (performance: PerformanceUser) => {
    updatePerformance(eventId, {
      ...performance,
      status: PerformanceStatus.COMPLETED,
    });
  };

  const handleDelete = (performance: PerformanceUser) => {
    if (confirm("Are you sure you want to delete this performance?")) {
      removePerformance(eventId, performance);
    }
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
      <Header showBackButton={false} />
      <div className="p-4 pb-20 relative">
        <PerformanceList
          performances={performances}
          currentPerformanceIndex={currentPerformanceIndex}
          title="Line up"
          performanceStatus={PerformanceStatus.PENDING}
          eventId={eventId}
          toggleSkipConfirmModal={toggleSkipConfirmModal}
          defaultCollapsed={false}
          onComplete={handleComplete}
          onDelete={handleDelete}
          highlightLastCard={highlightLastPending}
          scrollToBottomSignal={scrollToBottomSignal}
        />

        <PerformanceList
          performances={performances}
          currentPerformanceIndex={currentPerformanceIndex}
          title="Completed"
          performanceStatus={PerformanceStatus.COMPLETED}
          eventId={eventId}
          toggleSkipConfirmModal={toggleSkipConfirmModal}
          defaultCollapsed={true}
          onDelete={handleDelete}
        />

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-center block"
            onClick={() => setShowSignupModal(true)}
          >
            Sign Up
          </button>
        </div>

        {showSignupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md">
              <PerformanceCreateView
                eventId={eventId}
                isModal={true}
                onAdded={handlePerformanceAdded}
                onClose={() => setShowSignupModal(false)}
              />
            </div>
          </div>
        )}

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
                  onClick={() => {
                    const pendingList = performances.filter(
                      (p) => p.status === PerformanceStatus.PENDING,
                    );
                    if (pendingList[currentPerformanceIndex]) {
                      skipPerformanceConfirmHandler(
                        pendingList[currentPerformanceIndex],
                      );
                    }
                  }}
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
