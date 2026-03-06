import { useState } from "react";
import Modal from "@/components/layouts/Modal";
import QRCode from "@/components/utilities/QRCode";
import { Event } from "@/hooks/useEvents";
import { type PerformanceUser } from "@/hooks/usePerformances";

type EventDetailsCardProps = {
  eventDetails: Event;
  eventId: number;
  performances?: PerformanceUser[];
};

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

const getTopPerformer = (performances?: PerformanceUser[]) => {
  if (!performances || performances.length === 0) return null;

  let topPerformer = performances[0];
  for (const perf of performances) {
    if ((perf.likes || 0) > (topPerformer.likes || 0)) {
      topPerformer = perf;
    }
  }

  return (topPerformer.likes || 0) > 0 ? topPerformer : null;
};

export default function EventDetailsCard({
  eventDetails,
  eventId,
  performances,
}: EventDetailsCardProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const topPerformer = getTopPerformer(performances);

  return (
    <>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-row gap-2 sm:gap-4 items-start justify-between">
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
              {eventDetails.host_names?.trim() && (
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
                      d="M12 1a3 3 0 00-3 3v7a3 3 0 006 0V4a3 3 0 00-3-3zm7 10a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.92V21H8a1 1 0 000 2h8a1 1 0 100-2h-3v-3.08A7 7 0 0019 11z"
                    />
                  </svg>
                  <span className="break-words">{eventDetails.host_names}</span>
                </div>
              )}
            </div>
          </div>
          {topPerformer && (
            <div className="flex-shrink-0 text-right">
              <div className="text-2xl mb-1">🏅</div>
              <div className="text-xs sm:text-sm font-semibold text-gray-900 break-words max-w-[120px]">
                {topPerformer.performers}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {topPerformer.likes}{" "}
                {topPerformer.likes === 1 ? "like" : "likes"}
              </div>
            </div>
          )}
        </div>
      </div>

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
    </>
  );
}
