import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PerformanceStatus, PerformanceUser } from "@/hooks/usePerformances";
import usePerformances from "@/hooks/usePerformances";
import Header from "@/components/layouts/Header";
import ErrorPage from "./ErrorPage";
import PerformancesListViewLive from "@/components/views/PerformancesListViewPending";
import PerformancesListViewCompact from "@/components/views/PerformancesListViewCompleted";
import PerformancesCreateView from "../views/PerformancesCreateView";
import Modal from "@/components/layouts/Modal";
import { apiUrl } from "@/lib/utils";
import { Event } from "@/hooks/useEvents";
import EventDetailsCard from "@/components/cards/EventDetailsCard";
import { GlobalContext } from "@/context/useGlobalContext";

const PerformancesView = ({ eventId: propEventId }: { eventId?: number }) => {
  const router = useRouter();
  const { user } = useContext(GlobalContext);
  const isAdminOrHost =
    user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "host";
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
  const [highlightLastPending, setHighlightLastPending] = useState(false);
  const [scrollToBottomSignal, setScrollToBottomSignal] = useState(0);
  const [pendingHighlightAfterAdd, setPendingHighlightAfterAdd] =
    useState(false);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<PerformanceUser | null>(null);
  const [completeConfirmation, setCompleteConfirmation] =
    useState<PerformanceUser | null>(null);
  const [isStartingEvent, setIsStartingEvent] = useState(false);
  const [activeView, setActiveView] = useState<"lineup" | "completed">(
    "lineup",
  );

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

  const handleStartEvent = async () => {
    if (!eventId || !eventDetails || isStartingEvent) return;

    setIsStartingEvent(true);
    try {
      const response = await fetch(apiUrl(`/api/events/${eventId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...eventDetails,
          status: "IN_PROGRESS",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start event");
      }

      const updatedEvent = await response.json();
      setEventDetails(updatedEvent);
    } catch {
      setEventValidationError(
        "Unable to start event right now. Please try again.",
      );
    } finally {
      setIsStartingEvent(false);
    }
  };

  if (error) {
    return (
      <>
        <ErrorPage errorMessage={error} />
      </>
    );
  }

  if (eventValidationError) {
    return (
      <>
        <ErrorPage errorMessage={eventValidationError} />
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

  return (
    <>
      <Header showBackButton={false} />
      <div className="p-4 pb-20 relative">
        {eventDetails && (
          <EventDetailsCard eventDetails={eventDetails} eventId={eventId!} />
        )}

        {activeView === "lineup" && (
          <PerformancesListViewLive
            performances={performances}
            currentPerformanceIndex={currentPerformanceIndex}
            title=""
            eventId={eventId!}
            toggleSkipConfirmModal={toggleSkipConfirmModal}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onMoveNext={handleMoveNext}
            highlightLastCard={highlightLastPending}
            scrollToBottomSignal={scrollToBottomSignal}
            eventStatus={eventDetails?.status}
            isAdminOrHost={isAdminOrHost}
            onStartEvent={handleStartEvent}
            isStartingEvent={isStartingEvent}
          />
        )}

        {activeView === "completed" && (
          <PerformancesListViewCompact
            performances={performances}
            title=""
            onDelete={handleDelete}
          />
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t space-y-2">
          {isAdminOrHost && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView("lineup")}
                className={`flex-1 py-2 rounded font-medium transition-colors ${
                  activeView === "lineup"
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Live
              </button>
              <button
                onClick={() => setActiveView("completed")}
                className={`flex-1 py-2 rounded font-medium transition-colors ${
                  activeView === "completed"
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Finshed
              </button>
            </div>
          )}
          <button
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-center block"
            onClick={() => setShowSignupModal(true)}
          >
            Add New
          </button>
        </div>

        {showSignupModal && (
          <PerformancesCreateView
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
      </div>
    </>
  );
};

export default PerformancesView;
