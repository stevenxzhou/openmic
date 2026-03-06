import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PerformanceStatus, PerformanceUser } from "@/hooks/usePerformances";
import usePerformances from "@/hooks/usePerformances";
import Header from "@/components/Header";
import ErrorView from "./ErrorView";
import PerformanceList from "@/components/PerformanceList";
import PerformanceCreateView from "./PerformanceCreateView";
import Modal from "@/components/Modal";
import { apiUrl } from "@/lib/utils";
import { Event } from "@/hooks/useEvents";
import QRCode from "@/components/QRCode";

const PerformancesView = ({ eventId: propEventId }: { eventId?: number }) => {
  const router = useRouter();
  const [eventId, setEventId] = useState<number | null>(propEventId ?? null);
  const [eventIdInput, setEventIdInput] = useState("");
  const [showEventIdModal, setShowEventIdModal] = useState(!propEventId);
  const [eventIdError, setEventIdError] = useState("");
  const [eventValidationError, setEventValidationError] = useState("");
  const [eventDetails, setEventDetails] = useState<Event | null>(null);

  const {
    performances,
    error,
    updatePerformance,
    removePerformance,
    fetchPerformances,
    moveNext,
  } = usePerformances(eventId ?? 0);

  const [currentPerformanceIndex] = useState<number>(0);
  const [showSkipConfirm, toggleSkipConfirmModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [highlightLastPending, setHighlightLastPending] = useState(false);
  const [scrollToBottomSignal, setScrollToBottomSignal] = useState(0);
  const [pendingHighlightAfterAdd, setPendingHighlightAfterAdd] =
    useState(false);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<PerformanceUser | null>(null);
  const [completeConfirmation, setCompleteConfirmation] =
    useState<PerformanceUser | null>(null);

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

  // Validate event when page is accessed with event_id in URL
  useEffect(() => {
    if (!eventId || showEventIdModal) return;

    const validateEvent = async () => {
      try {
        const response = await fetch(apiUrl(`/api/events/${eventId}`));

        if (!response.ok) {
          if (response.status === 404) {
            setEventValidationError(`Event ${eventId} does not exist.`);
          } else {
            setEventValidationError(
              "Unable to validate event right now. Please try again.",
            );
          }
          return;
        }

        const eventData = await response.json();
        setEventDetails(eventData);
        setEventValidationError("");
      } catch {
        setEventValidationError(
          "Unable to validate event right now. Please try again.",
        );
      }
    };

    validateEvent();
  }, [eventId, showEventIdModal]);

  // Poll for performance updates every 15 seconds
  useEffect(() => {
    if (!eventId) return;

    const interval = setInterval(() => {
      fetchPerformances(eventId);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handlePerformanceAdded = async () => {
    setPendingHighlightAfterAdd(true);
    await fetchPerformances(eventId!);
  };

  const handleEventIdSubmit = async () => {
    const parsedEventId = parseInt(eventIdInput, 10);
    if (isNaN(parsedEventId) || parsedEventId <= 0) {
      setEventIdError("Please enter a valid event ID.");
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/events/${parsedEventId}`));

      if (!response.ok) {
        if (response.status === 404) {
          setEventIdError(`Event ${parsedEventId} does not exist.`);
        } else {
          setEventIdError(
            "Unable to validate event right now. Please try again.",
          );
        }
        return;
      }

      const eventData = await response.json();
      setEventDetails(eventData);
      setEventIdError("");
      setEventId(parsedEventId);
      setShowEventIdModal(false);
      router.push(`/performances?event_id=${parsedEventId}`);
    } catch {
      setEventIdError("Unable to validate event right now. Please try again.");
    }
  };

  const skipPerformanceConfirmHandler = (performance: PerformanceUser) => {
    updatePerformance(eventId!, {
      ...performance,
      status: PerformanceStatus.COMPLETED,
    });
    toggleSkipConfirmModal(false);
  };

  const handleComplete = (performance: PerformanceUser) => {
    setCompleteConfirmation(performance);
  };

  const confirmComplete = (performance: PerformanceUser) => {
    updatePerformance(eventId!, {
      ...performance,
      status: PerformanceStatus.COMPLETED,
    });
    setCompleteConfirmation(null);
  };

  const handleDelete = (performance: PerformanceUser) => {
    setDeleteConfirmation(performance);
  };

  const confirmDelete = (performance: PerformanceUser) => {
    removePerformance(eventId!, performance);
    setDeleteConfirmation(null);
  };

  const handleMoveNext = (performance: PerformanceUser) => {
    if (performance.performance_id) {
      moveNext(eventId!, performance.performance_id);
    }
  };

  if (error) {
    return (
      <>
        <ErrorView errorMessage={error} />
      </>
    );
  }

  if (eventValidationError) {
    return (
      <>
        <ErrorView errorMessage={eventValidationError} />
      </>
    );
  }

  // Show event ID input modal if no eventId is set
  if (showEventIdModal || eventId === null) {
    return (
      <Modal>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Enter Event ID
          </h2>
          <p className="text-gray-600">
            Please enter the event ID to view performances.
          </p>
          <input
            type="number"
            value={eventIdInput}
            onChange={(e) => {
              setEventIdInput(e.target.value);
              if (eventIdError) {
                setEventIdError("");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleEventIdSubmit();
              }
            }}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
            placeholder="Event ID"
            autoFocus
          />
          {eventIdError && (
            <p className="text-sm text-red-600">{eventIdError}</p>
          )}
          <button
            onClick={handleEventIdSubmit}
            className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
          >
            Submit
          </button>
        </div>
      </Modal>
    );
  }

  const formatEventDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <>
      <Header showBackButton={false} />
      <div className="p-4 pb-20 relative">
        {eventDetails && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-row gap-2 sm:gap-4 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                    {eventDetails.title}
                  </h1>
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="p-1 hover:opacity-70 transition-opacity flex-shrink-0"
                    title="Share event"
                    aria-label="Share event"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700"
                      viewBox="0 0 122.88 122.88"
                    >
                      <path
                        fill="currentColor"
                        d="M61.44,0A61.46,61.46,0,1,1,18,18,61.21,61.21,0,0,1,61.44,0ZM64.5,75.82,50,69.15A11.82,11.82,0,1,1,49,52.71l15.4-6.43a12.7,12.7,0,0,1-.14-1.85A11.81,11.81,0,0,1,76,32.62h0A11.82,11.82,0,1,1,68.45,53.5L52.76,60q.08.68.09,1.35L69.16,68.9a11.76,11.76,0,1,1-5,9.6,12.11,12.11,0,0,1,.31-2.68ZM97.89,25A51.54,51.54,0,1,0,113,61.44,51.38,51.38,0,0,0,97.89,25Z"
                      />
                    </svg>
                  </button>
                </div>
                <div className="space-y-1 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="break-words">
                      {formatEventDateTime(eventDetails.start_date)}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="break-words">{eventDetails.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <PerformanceList
          performances={performances}
          currentPerformanceIndex={currentPerformanceIndex}
          title="Line up"
          performanceStatus={PerformanceStatus.PENDING}
          eventId={eventId!}
          toggleSkipConfirmModal={toggleSkipConfirmModal}
          defaultCollapsed={false}
          onComplete={handleComplete}
          onDelete={handleDelete}
          onMoveNext={handleMoveNext}
          highlightLastCard={highlightLastPending}
          scrollToBottomSignal={scrollToBottomSignal}
        />

        <PerformanceList
          performances={performances}
          currentPerformanceIndex={currentPerformanceIndex}
          title="Completed"
          performanceStatus={PerformanceStatus.COMPLETED}
          eventId={eventId!}
          toggleSkipConfirmModal={toggleSkipConfirmModal}
          defaultCollapsed={true}
          onDelete={handleDelete}
        />

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-center block"
            onClick={() => setShowSignupModal(true)}
          >
            Add New
          </button>
        </div>

        {showSignupModal && (
          <PerformanceCreateView
            eventId={eventId!}
            isModal={true}
            onAdded={handlePerformanceAdded}
            onClose={() => setShowSignupModal(false)}
          />
        )}

        {/* Delete Confirmation Modal - Updated text to reflect "Skip" instead of "Delete" */}
        {showSkipConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
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

        {/* Complete Confirmation Modal */}
        {completeConfirmation && (
          <Modal>
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Mark as Completed?
              </h2>
              <p className="text-gray-600">
                Are you sure you want to mark {completeConfirmation.performers}{" "}
                as completed?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setCompleteConfirmation(null)}
                  className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmComplete(completeConfirmation)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  Yes, Mark Done
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <Modal>
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Delete Performance?
              </h2>
              <p className="text-gray-600">
                Are you sure you want to delete {deleteConfirmation.performers}?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(deleteConfirmation)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* QR Code Modal */}
        {showQRModal && (
          <Modal>
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Event QR Code
              </h2>
              <p className="text-gray-600">
                Scan this code to view event performances
              </p>
              <div className="flex justify-center">
                <div className="w-64 h-64">
                  <QRCode
                    url={`${typeof window !== "undefined" ? window.location.origin : ""}/openmic/performances?event_id=${eventId}`}
                    size={256}
                  />
                </div>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Close
              </button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

export default PerformancesView;
