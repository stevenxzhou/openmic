"use client";

import { Event } from "@/hooks/useEvents";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { GlobalContext } from "@/context/useGlobalContext";

type EventCardProps = Event & {
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
};

export const EventCard = (props: EventCardProps) => {
  const router = useRouter();
  const { user } = useContext(GlobalContext);
  const isAdmin = user.role?.toLowerCase() === "admin";
  const normalizedStatus = String(props.status || "NEW").toUpperCase();
  const isStarted = normalizedStatus === "IN_PROGRESS";

  const statusBadge = (() => {
    if (normalizedStatus === "IN_PROGRESS") {
      return {
        label: "Started",
        className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      };
    }

    if (normalizedStatus === "COMPLETED") {
      return {
        label: "Completed",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      };
    }

    return {
      label: "Not Started",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    };
  })();

  const convertDateFormat = (datestr: string): string => {
    if (!datestr) return "Invalid date";

    // Parse UTC datetime string (ISO format with Z)
    const date = new Date(datestr);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    // Format in user's local timezone
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  const handleCardClick = () => {
    router.push(`/performances/?event_id=${props.event_id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onEdit?.(props);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onDelete?.(props);
  };

  return (
    <div
      className="relative bg-white rounded-lg shadow-xl border-gray-200 p-4 sm:p-6 hover:shadow-2xl transition-shadow text-sm cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          {/* <!-- Date --> */}
          <p className="text-sm font-medium text-yellow-600">
            {convertDateFormat(props.start_date)}
          </p>

          {/* <!-- Event Title --> */}
          <h2 className="mt-2 text-sm font-semibold text-gray-900">
            {props.title}
          </h2>
          <span className="text-xs text-gray-400 mb-1">
            Event #{props.event_id}
          </span>

          {/* <!-- Event Brief --> */}
          <p className="mt-2 text-gray-600">{props.description}</p>

          {/* <!-- Event Details --> */}
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>{props.location}</span>
          </div>
        </div>
        <div
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold whitespace-nowrap ${statusBadge.className}`}
          title={`Event status: ${normalizedStatus}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isStarted ? "bg-emerald-600" : "bg-amber-600"
            }`}
          />
          {statusBadge.label}
        </div>
      </div>

      {/* Admin action buttons - bottom right corner */}
      {isAdmin && (props.onEdit || props.onDelete) && (
        <div className="absolute bottom-2 right-4 flex gap-2">
          {props.onEdit && (
            <button
              className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
              aria-label="Edit event"
              onClick={handleEditClick}
              title="Edit"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {props.onDelete && (
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
          )}
        </div>
      )}
    </div>
  );
};
