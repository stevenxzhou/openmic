"use client";

import { Event } from "@/hooks/useEvents";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { GlobalContext } from "@/context/useGlobalContext";

type EventCardProps = Event & {
  onDelete?: (event: Event) => void;
};

export const EventCard = (props: EventCardProps) => {
  const router = useRouter();
  const { user } = useContext(GlobalContext);
  const isAdmin = user.role?.toLowerCase() === "admin";
  const convertDateFormat = (datestr: string): string => {
    if (!datestr) return "Invalid date";

    // Ensure datestr is a string
    const dateStrValue = String(datestr).trim();
    if (!dateStrValue) return "Invalid date";

    // Handle various date formats
    let date: Date;

    // Try to parse the date string
    // Handle format: "2025-04-20" or "2025-04-20 14:30:00" or ISO format
    if (dateStrValue.includes("T") || dateStrValue.includes(" ")) {
      // ISO format or MySQL datetime format
      date = new Date(dateStrValue);
    } else if (dateStrValue.includes("-")) {
      // Date only format (YYYY-MM-DD), add time to avoid timezone issues
      date = new Date(dateStrValue + "T00:00:00Z");
    } else {
      date = new Date(dateStrValue);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    // Format the date into "Apr 20, 2025"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const date = new Date(props.end_date);
  const todayDate = new Date();

  const handleCardClick = () => {
    router.push(`/performances/?event_id=${props.event_id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onDelete?.(props);
  };

  return (
    <div
      className="relative bg-white rounded-lg shadow-lg border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow text-sm cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {/* Event ID */}
          <p className="text-xs text-gray-400 mb-1">Event #{props.event_id}</p>
          {/* <!-- Date --> */}
          <p className="text-sm font-medium text-yellow-600">
            {convertDateFormat(props.start_date)}
          </p>

          {/* <!-- Event Title --> */}
          <h2 className="mt-2 text-sm font-semibold text-gray-900">
            {props.title}
          </h2>

          {/* <!-- Event Brief --> */}
          <p className="mt-2 text-gray-600">{props.description}</p>

          {/* <!-- Event Details --> */}
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{props.location}</span>
          </div>
        </div>
      </div>

      {/* Delete button - bottom right corner */}
      {props.onDelete && isAdmin && (
        <div className="absolute bottom-2 right-2">
          <button
            className="p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
            aria-label="Delete event"
            onClick={handleDeleteClick}
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
