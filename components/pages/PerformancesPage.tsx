import React, { useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PerformanceStatus, PerformanceUser } from "@/hooks/usePerformances";
import usePerformances from "@/hooks/usePerformances";
import Header from "@/components/layouts/Header";
import ErrorPage from "./ErrorPage";
import PerformancesListViewLive from "@/components/views/PerformancesListViewPending";
import PerformancesListViewCompact from "@/components/views/PerformancesListViewCompleted";
import PerformancesListViewCompletedCollapsed from "@/components/views/PerformancesListViewCompletedCollapsed";
import PerformancesCreateView from "../views/PerformancesCreateView";
import PerformancesChecklistView from "../views/PerformancesChecklistView";
import EventsCreateView from "../views/EventsCreateView";
import Modal from "@/components/layouts/Modal";
import { apiUrl } from "@/lib/utils";
import { Event } from "@/hooks/useEvents";
import EventDetailsCard from "@/components/cards/EventDetailsCard";
import { GlobalContext } from "@/context/useGlobalContext";

const PerformancesView = ({ eventId: propEventId }: { eventId?: number }) => {
  const router = useRouter();
  const { user, t } = useContext(GlobalContext);
  const isAdminOrHost =
    user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "host";
  const isAdmin = user.role?.toLowerCase() === "admin";
  const isHost = user.role?.toLowerCase() === "host";
  const [eventId] = useState<number | null>(propEventId ?? null);
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
  const [showPerformanceAddedToast, setShowPerformanceAddedToast] =
    useState(false);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<PerformanceUser | null>(null);
  const [completeConfirmation, setCompleteConfirmation] =
    useState<PerformanceUser | null>(null);
  const [isStartingEvent, setIsStartingEvent] = useState(false);
  const [showStartChecklistModal, setShowStartChecklistModal] = useState(false);
  const [showEventEditModal, setShowEventEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showPerformanceEditModal, setShowPerformanceEditModal] =
    useState(false);
  const [editingPerformance, setEditingPerformance] =
    useState<PerformanceUser | null>(null);
  const [isCompletingEvent, setIsCompletingEvent] = useState(false);
  const [showCompleteEventConfirmModal, setShowCompleteEventConfirmModal] =
    useState(false);
  const [activeView, setActiveView] = useState<"lineup" | "completed">(
    "lineup",
  );
  const normalizedEventStatus = eventDetails?.status?.toUpperCase();
  const firstPerformanceIdRef = useRef<number | null>(null);
  const performancesRef = useRef<PerformanceUser[]>([]);
  const [firstPerformanceLikes, setFirstPerformanceLikes] = useState<{
    performanceId: number;
    likes: number;
  } | null>(null);

  // Keep performances ref updated
  useEffect(() => {
    performancesRef.current = performances;
  }, [performances]);

  useEffect(() => {
    if (eventId === null) {
      router.replace("/");
    }
  }, [eventId, router]);

  // Validate event when page is accessed with event_id in URL
  useEffect(() => {
    if (!eventId) return;

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
  }, [eventId]);

  // Poll event details every 15 seconds while event is NEW
  useEffect(() => {
    if (!eventId || normalizedEventStatus !== "NEW") return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(apiUrl(`/api/events/${eventId}`));
        if (!response.ok) return;

        const eventData = await response.json();
        setEventDetails(eventData);
      } catch {
        // Keep existing state on polling failures.
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [eventId, normalizedEventStatus]);

  // Poll performances every 15 seconds while event is IN_PROGRESS
  useEffect(() => {
    if (!eventId || normalizedEventStatus !== "IN_PROGRESS") return;

    const interval = setInterval(() => {
      fetchPerformances(eventId);
    }, 15000);

    return () => clearInterval(interval);
  }, [eventId, normalizedEventStatus]);

  // Poll likes for the first performance every 1 second
  useEffect(() => {
    if (
      !eventId ||
      normalizedEventStatus !== "IN_PROGRESS" ||
      !isHost ||
      !isAdmin
    )
      return;

    const interval = setInterval(async () => {
      // Get first performance ID from current performances state
      const pendingPerformances = performances
        .filter((p) => p.status === PerformanceStatus.PENDING)
        .sort(
          (a, b) => (a.performance_index ?? 0) - (b.performance_index ?? 0),
        );

      const firstPerformance = pendingPerformances[0];
      const performanceId = firstPerformance?.performance_id;

      if (!performanceId) return;

      try {
        const response = await fetch(
          apiUrl(`/api/performances/${performanceId}`),
        );
        if (!response.ok) return;

        const updatedPerformance = await response.json();

        // Update local likes state instead of calling updatePerformance
        setFirstPerformanceLikes({
          performanceId,
          likes: updatedPerformance.likes ?? 0,
        });
      } catch {
        // Keep existing state on polling failures
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [eventId, normalizedEventStatus]);

  useEffect(() => {
    if (!showPerformanceAddedToast) return;

    const timeoutId = setTimeout(() => {
      setShowPerformanceAddedToast(false);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [showPerformanceAddedToast]);

  const handlePerformanceAdded = async () => {
    setShowSignupModal(false);
    setShowPerformanceAddedToast(true);
    await fetchPerformances(eventId!);
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

  const handleEdit = (performance: PerformanceUser) => {
    if (!isAdminOrHost) return;
    setEditingPerformance(performance);
    setShowPerformanceEditModal(true);
  };

  const handlePerformanceUpdated = async () => {
    if (!eventId) return;

    setShowPerformanceEditModal(false);
    setEditingPerformance(null);

    await fetchPerformances(eventId);
  };

  const handleStartEvent = async (): Promise<boolean> => {
    if (!eventId || !eventDetails || isStartingEvent) return false;

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
      return true;
    } catch {
      setEventValidationError(
        "Unable to start event right now. Please try again.",
      );
      return false;
    } finally {
      setIsStartingEvent(false);
    }
  };

  const openStartChecklistModal = () => {
    setShowStartChecklistModal(true);
  };

  const openEditEventModal = () => {
    if (!eventDetails || !isAdmin) return;
    setEditingEvent(eventDetails);
    setShowEventEditModal(true);
  };

  const handleEventUpdated = async () => {
    if (!eventId) return;

    setShowEventEditModal(false);
    setEditingEvent(null);

    try {
      const response = await fetch(apiUrl(`/api/events/${eventId}`));
      if (response.ok) {
        const refreshedEvent = await response.json();
        setEventDetails(refreshedEvent);
      }
      await fetchPerformances(eventId);
    } catch {
      setEventValidationError(
        "Unable to refresh event right now. Please try again.",
      );
    }
  };

  const handleCompleteEvent = async (): Promise<boolean> => {
    if (!eventId || isCompletingEvent) return false;

    setIsCompletingEvent(true);
    try {
      const response = await fetch(apiUrl(`/api/events/${eventId}/complete`), {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to complete event");
      }

      const result = await response.json();
      if (result?.event) {
        setEventDetails(result.event);
      }

      await fetchPerformances(eventId);
      return true;
    } catch {
      setEventValidationError(
        "Unable to complete event right now. Please try again.",
      );
      return false;
    } finally {
      setIsCompletingEvent(false);
    }
  };

  const openCompleteEventConfirmModal = () => {
    if (isCompletingEvent) return;
    setShowCompleteEventConfirmModal(true);
  };

  const handleCompleteEventFromModal = async () => {
    const completed = await handleCompleteEvent();
    if (completed) {
      setShowCompleteEventConfirmModal(false);
    }
  };

  const handleStartEventFromChecklist = async () => {
    const started = await handleStartEvent();
    if (started) {
      setShowStartChecklistModal(false);
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

  if (eventId === null) return null;
  const isCompletedEvent = normalizedEventStatus === "COMPLETED";

  // Merge polled likes data into performances array
  const performancesWithLikes = performances.map((perf) => {
    if (
      firstPerformanceLikes &&
      perf.performance_id === firstPerformanceLikes.performanceId
    ) {
      return { ...perf, likes: firstPerformanceLikes.likes };
    }
    return perf;
  });

  return (
    <>
      <Header showBackButton={false} />
      {showPerformanceAddedToast && (
        <div className="fixed top-[52px] left-1/2 z-50 -translate-x-1/2 px-4">
          <div className="rounded border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 shadow">
            {t("performances.added")}
          </div>
        </div>
      )}
      <div
        className={`p-4 relative ${
          isCompletedEvent ? "" : isAdminOrHost ? "pb-36" : "pb-24"
        }`}
      >
        {eventDetails && (
          <EventDetailsCard
            eventDetails={eventDetails}
            eventId={eventId!}
            performances={performancesWithLikes}
            canEdit={isAdmin}
            canComplete={
              (isAdmin || isHost) && normalizedEventStatus === "IN_PROGRESS"
            }
            isCompleting={isCompletingEvent}
            onEdit={openEditEventModal}
            onComplete={openCompleteEventConfirmModal}
          />
        )}

        {!isCompletedEvent && activeView === "lineup" && (
          <PerformancesListViewLive
            performances={performancesWithLikes}
            currentPerformanceIndex={currentPerformanceIndex}
            title=""
            eventId={eventId!}
            toggleSkipConfirmModal={toggleSkipConfirmModal}
            onComplete={handleComplete}
            onDelete={handleDelete}
            onMoveNext={handleMoveNext}
            onEdit={handleEdit}
            eventStatus={eventDetails?.status}
            isAdminOrHost={isAdminOrHost}
            onStartEvent={openStartChecklistModal}
            isStartingEvent={isStartingEvent}
          />
        )}

        {!isCompletedEvent && activeView === "lineup" && (
          <PerformancesListViewCompletedCollapsed
            performances={performancesWithLikes}
            title=""
          />
        )}

        {(isCompletedEvent || activeView === "completed") && (
          <PerformancesListViewCompact
            performances={performancesWithLikes}
            title=""
            onDelete={handleDelete}
          />
        )}

        {!isCompletedEvent && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t space-y-2">
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveView("lineup")}
                  className={`flex-1 py-2 rounded font-medium transition-colors ${
                    activeView === "lineup"
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  {t("performances.live")}
                </button>
                <button
                  onClick={() => setActiveView("completed")}
                  className={`flex-1 py-2 rounded font-medium transition-colors ${
                    activeView === "completed"
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  {t("performances.finished")}
                </button>
              </div>
            )}
            <button
              className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-center block"
              onClick={() => setShowSignupModal(true)}
            >
              {t("common.addNew")}
            </button>
          </div>
        )}

        {!isCompletedEvent && showSignupModal && (
          <PerformancesCreateView
            eventId={eventId!}
            isModal={true}
            onAdded={handlePerformanceAdded}
            onClose={() => setShowSignupModal(false)}
          />
        )}

        {showPerformanceEditModal && editingPerformance && (
          <PerformancesCreateView
            eventId={eventId!}
            isModal={true}
            editingPerformance={editingPerformance}
            onClose={() => {
              setShowPerformanceEditModal(false);
              setEditingPerformance(null);
            }}
            onAdded={handlePerformanceUpdated}
          />
        )}

        {showStartChecklistModal && (
          <Modal
            onClose={() => {
              if (!isStartingEvent) {
                setShowStartChecklistModal(false);
              }
            }}
          >
            <PerformancesChecklistView
              onCancel={() => setShowStartChecklistModal(false)}
              onConfirm={handleStartEventFromChecklist}
              isStartingEvent={isStartingEvent}
            />
          </Modal>
        )}

        {showEventEditModal && editingEvent && (
          <EventsCreateView
            isModal={true}
            editingEvent={editingEvent}
            onClose={() => {
              setShowEventEditModal(false);
              setEditingEvent(null);
            }}
            onAdded={handleEventUpdated}
          />
        )}

        {showCompleteEventConfirmModal && (
          <Modal
            onClose={() => {
              if (!isCompletingEvent) {
                setShowCompleteEventConfirmModal(false);
              }
            }}
          >
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {t("eventDetails.completeConfirmTitle")}
              </h2>
              <p className="text-gray-600">
                {t("eventDetails.completeConfirmBody")}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowCompleteEventConfirmModal(false)}
                  className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded"
                  disabled={isCompletingEvent}
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleCompleteEventFromModal}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isCompletingEvent}
                >
                  {isCompletingEvent
                    ? t("eventDetails.completing")
                    : t("eventDetails.completeEvent")}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal - Updated text to reflect "Skip" instead of "Delete" */}
        {showSkipConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4">
                {t("performances.confirmSkip")}
              </h3>
              <p className="mb-6">{t("performances.confirmSkipBody")}</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => toggleSkipConfirmModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  {t("common.cancel")}
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
                  {t("performances.skip")}
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
                {t("performances.markCompleted")}
              </h2>
              <p className="text-gray-600">
                {t("performances.markCompletedBody", {
                  name: completeConfirmation.performers || "",
                })}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setCompleteConfirmation(null)}
                  className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={() => confirmComplete(completeConfirmation)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  {t("performances.markDone")}
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
                {t("performances.deleteTitle")}
              </h2>
              <p className="text-gray-600">
                {t("performances.deleteBody", {
                  name: deleteConfirmation.performers || "",
                })}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={() => confirmDelete(deleteConfirmation)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  {t("common.delete")}
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
