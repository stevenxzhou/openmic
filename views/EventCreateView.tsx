import React, { useState } from "react";
import { useEvents, type Event } from "@/hooks/useEvents";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Modal from "@/components/Modal";

type CreateEventViewProps = {
  isModal?: boolean;
  createEvent?: (event: Event) => Promise<void>;
  onClose?: () => void;
  onAdded?: () => void;
};

const CreateEventView = ({
  isModal = false,
  createEvent: createEventProp,
  onClose,
  onAdded,
}: CreateEventViewProps) => {
  const router = useRouter();
  const { createEvent: createEventHook } = useEvents();
  const createEvent = createEventProp || createEventHook;

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

  // Events Form
  const [title, setTitle] = useState("SAMA Open Mic");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(getNextSaturday7PM());
  const [location, setLocation] = useState("Story Coffee");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Add event handler
  const addEventHandler = async () => {
    if (!title || !startTime || !location) {
      alert("Please fill all required fields");
      return;
    }

    let newEvent = {
      event_id: 0,
      title: title,
      description: description,
      start_date: startTime,
      end_date: startTime,
      location: location,
    };

    await createEvent(newEvent);
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
    onClose?.();
  };

  return (
    <>
      {!isModal && <Header showBackButton />}
      {isModal ? (
        <Modal onClose={showConfirmation ? undefined : closeModal}>
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
                Event Created!
              </h2>
              <p className="text-gray-600">
                {title} has been added to the events list.
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
              <div>
                <label className="block mb-1 font-medium">Event Name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                  placeholder="Enter Event Description"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Date & Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                  placeholder="Story Coffee"
                />
              </div>

              <button
                onClick={addEventHandler}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Create Event
              </button>
            </>
          )}
        </Modal>
      ) : (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white border rounded-lg p-4 sm:p-6 space-y-4">
            <div>
              <label className="block mb-1 font-medium">Event Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                placeholder="Enter Event Description"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Date & Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                placeholder="Story Coffee"
              />
            </div>

            <button
              onClick={addEventHandler}
              className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateEventView;
