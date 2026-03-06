import React, { useState, useEffect } from "react";
import { useEvents, type Event } from "@/hooks/useEvents";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Modal from "@/components/Modal";

type CreateEventViewProps = {
  isModal?: boolean;
  createEvent?: (
    event: Event,
  ) => Promise<{ success: boolean; error?: string; eventId?: number }>;
  updateEvent?: (
    eventId: number,
    event: Event,
  ) => Promise<{ success: boolean; error?: string; eventId?: number }>;
  editingEvent?: Event | null;
  onClose?: () => void;
  onAdded?: () => void;
};

const CreateEventView = ({
  isModal = false,
  createEvent: createEventProp,
  updateEvent: updateEventProp,
  editingEvent,
  onClose,
  onAdded,
}: CreateEventViewProps) => {
  const router = useRouter();
  const {
    createEvent: createEventHook,
    updateEvent: updateEventHook,
    events,
    setError: setHookError,
  } = useEvents();
  const createEvent = createEventProp || createEventHook;
  const updateEvent = updateEventProp || updateEventHook;

  // Calculate next Saturday at 7:00 PM
  const getNextSaturday7PM = () => {
    const now = new Date();
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7; // 6 = Saturday
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    nextSaturday.setHours(19, 0, 0, 0); // 7:00 PM

    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const year = nextSaturday.getFullYear();
    const month = String(nextSaturday.getMonth() + 1).padStart(2, "0");
    const day = String(nextSaturday.getDate()).padStart(2, "0");
    const hours = String(nextSaturday.getHours()).padStart(2, "0");
    const minutes = String(nextSaturday.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const toDateTimeLocalInput = (dateValue: string) => {
    // Parse UTC datetime and convert to local time for datetime-local input
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      return getNextSaturday7PM();
    }

    // Get local date/time components
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    const hours = String(parsed.getHours()).padStart(2, "0");
    const minutes = String(parsed.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const toUTCIso = (localDateTime: string) => {
    // Convert local datetime-local input to UTC ISO format
    const normalized =
      localDateTime.length === 16 ? `${localDateTime}:00` : localDateTime;
    return new Date(normalized).toISOString();
  };

  // Events Form
  const [title, setTitle] = useState(editingEvent?.title || "SAMA Open Mic");
  const [description, setDescription] = useState(
    editingEvent?.description || "",
  );
  const [startTime, setStartTime] = useState(
    editingEvent
      ? toDateTimeLocalInput(editingEvent.start_date)
      : getNextSaturday7PM(),
  );
  const [location, setLocation] = useState(
    editingEvent?.location || "Story Coffee",
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [displayError, setDisplayError] = useState<string | null>(null);
  const [duplicateEventId, setDuplicateEventId] = useState<number | null>(null);

  // Clear error when user modifies the form
  const clearError = () => {
    setDisplayError(null);
    setDuplicateEventId(null);
  };

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || "");
      setDescription(editingEvent.description || "");
      setStartTime(toDateTimeLocalInput(editingEvent.start_date));
      setLocation(editingEvent.location || "");
      return;
    }

    setTitle("SAMA Open Mic");
    setDescription("");
    setStartTime(getNextSaturday7PM());
    setLocation("Story Coffee");
  }, [editingEvent]);

  // Add/edit event handler
  const addEventHandler = async () => {
    if (!title || !startTime || !location) {
      alert("Please fill all required fields");
      return;
    }

    const startDateTimeUTC = toUTCIso(startTime);
    console.log("EventCreateView.addEventHandler - UTC conversion:", {
      localInput: startTime,
      convertedUTC: startDateTimeUTC,
    });

    let newEvent = {
      event_id: editingEvent?.event_id || 0,
      title: title,
      description: description,
      start_date: startDateTimeUTC,
      end_date: startDateTimeUTC,
      location: location,
    };

    console.log(
      "EventCreateView.addEventHandler - Submitting event:",
      newEvent,
    );

    // Clear any previous errors
    clearError();
    setHookError(null);

    let result;
    if (editingEvent?.event_id) {
      console.log("Updating existing event:", editingEvent.event_id);
      result = await updateEvent(editingEvent.event_id, newEvent);
    } else {
      console.log("Creating new event");
      result = await createEvent(newEvent);
    }

    // Only proceed if there was no error
    if (!result.success) {
      console.log("Error occurred, staying on form:", result.error);
      // Clear hook error so parent doesn't show error screen
      setHookError(null);
      if (result.error) {
        setDisplayError(result.error);
        if (result.eventId) {
          setDuplicateEventId(result.eventId);
        }
      }
      return;
    }

    // Success - clear hook error and proceed
    setHookError(null);
    onAdded?.();

    if (isModal) {
      setShowConfirmation(true);
      return;
    }
    router.push(`/events/`);
  };

  const closeModal = () => {
    setShowConfirmation(false);
    setTitle("SAMA Open Mic");
    setDescription("");
    setStartTime(getNextSaturday7PM());
    setLocation("Story Coffee");
    setHookError(null);
    onClose?.();
  };

  return (
    <>
      {!isModal && <Header showBackButton />}
      {isModal ? (
        <Modal
          onClose={showConfirmation || displayError ? undefined : closeModal}
        >
          {showConfirmation ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                {editingEvent ? "Event Updated!" : "Event Created!"}
              </h2>
              <p className="text-gray-600">
                {title} has been {editingEvent ? "updated" : "added"} in the
                events list.
              </p>
              <button
                onClick={closeModal}
                className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {displayError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm space-y-2">
                  <p>{displayError}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={clearError}
                      className="text-xs font-semibold hover:underline"
                    >
                      Try Again
                    </button>
                    {duplicateEventId && (
                      <a
                        href={`/openmic/performances?event_id=${duplicateEventId}`}
                        className="text-xs font-semibold hover:underline"
                      >
                        View Performances
                      </a>
                    )}
                  </div>
                </div>
              )}
              <div>
                <label className="block mb-1 font-medium">Event Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearError();
                  }}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                  placeholder="Enter Event Name"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearError();
                  }}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                  placeholder="Enter Event Description"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Date & Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    clearError();
                  }}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    clearError();
                  }}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                  placeholder="Story Coffee"
                />
              </div>

              <button
                onClick={addEventHandler}
                disabled={!!displayError}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded"
              >
                {editingEvent ? "Save Changes" : "Create Event"}
              </button>
            </>
          )}
        </Modal>
      ) : (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white border rounded-lg shadow-xl p-4 sm:p-6 space-y-4">
            {displayError && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm space-y-2">
                <p>{displayError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={clearError}
                    className="text-xs font-semibold hover:underline"
                  >
                    Try Again
                  </button>
                  {duplicateEventId && (
                    <a
                      href={`/openmic/performances?event_id=${duplicateEventId}`}
                      className="text-xs font-semibold hover:underline"
                    >
                      View Performances
                    </a>
                  )}
                </div>
              </div>
            )}
            <div>
              <label className="block mb-1 font-medium">Event Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearError();
                }}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                placeholder="Enter Event Name"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError();
                }}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                placeholder="Enter Event Description"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Date & Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  clearError();
                }}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  clearError();
                }}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                placeholder="Story Coffee"
              />
            </div>

            <button
              onClick={addEventHandler}
              disabled={!!displayError}
              className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded"
            >
              {editingEvent ? "Save Changes" : "Add"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateEventView;
