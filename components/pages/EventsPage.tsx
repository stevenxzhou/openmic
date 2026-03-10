"use client";

import { type Event } from "@/hooks/useEvents";
import { EventCard } from "@/components/cards/EventCard";
import { useEvents } from "@/hooks/useEvents";
import React, { useState, useContext, useEffect } from "react";
import ErrorPage from "./ErrorPage";
import Header from "@/components/layouts/Header";
import Modal from "@/components/layouts/Modal";
import { GlobalContext } from "@/context/useGlobalContext";
import EventsCreateView from "../views/EventsCreateView";
import { useRouter } from "next/navigation";
import CarouselSlider from "../utilities/CarouselSlider";

const EventsView = () => {
  const router = useRouter();
  const { events, createEvent, updateEvent, deleteEvent, error } = useEvents();
  const { user, language, t } = useContext(GlobalContext);
  const [deleteConfirmation, setDeleteConfirmation] = useState<Event | null>(
    null,
  );
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventsView, setEventsView] = useState<"future" | "past">("future");

  const isAdmin = user.role?.toLowerCase() === "admin";
  const isHost = user.role?.toLowerCase() === "host";
  const isAdminOrHost = isAdmin || user.role?.toLowerCase() === "host";

  const parseEventDate = (dateValue: string) => {
    const value = String(dateValue || "").trim();
    if (!value) return null;

    // Parse UTC ISO datetime string
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatEventDate = (dateValue: string) => {
    const parsed = parseEventDate(dateValue);
    if (!parsed) return t("events.invalidDate");
    return parsed.toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const isCompletedStatus = (status?: string) =>
    String(status || "").toUpperCase() === "COMPLETED";

  const futureEvents = (events || [])
    .filter((event) => {
      if (isCompletedStatus(event.status)) return false;
      const eventDate = parseEventDate(event.start_date || event.end_date);
      return eventDate ? eventDate >= twentyFourHoursAgo : false;
    })
    .sort((a, b) => {
      const dateA = parseEventDate(a.start_date || a.end_date);
      const dateB = parseEventDate(b.start_date || b.end_date);
      return (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
    });

  const pastEvents = (events || []).filter((event) => {
    if (isCompletedStatus(event.status)) return true;
    const eventDate = parseEventDate(event.start_date || event.end_date);
    return eventDate ? eventDate < twentyFourHoursAgo : false;
  });

  useEffect(() => {
    if (!events || isAdmin || isHost) return;
    if (futureEvents.length !== 1) return;

    router.push(`/performances?event_id=${futureEvents[0].event_id}`);
  }, [events, futureEvents, isAdmin, isHost, router]);

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowCreateModal(true);
  };

  const handleDelete = (event: Event) => {
    setDeleteConfirmation(event);
  };

  const handlePastRowClick = (eventId: number) => {
    router.push(`/performances?event_id=${eventId}`);
  };

  const handlePastEditClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    event: Event,
  ) => {
    e.stopPropagation();
    handleEdit(event);
  };

  const handlePastDeleteClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    event: Event,
  ) => {
    e.stopPropagation();
    handleDelete(event);
  };

  const csvEscape = (value: unknown) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const handleExportPastEventsCsv = () => {
    const headers = [
      "title",
      "description",
      "date",
      "location",
      "hosts",
      "performances",
    ];

    const rows = pastEvents.map((event) => [
      event.title || "",
      event.description || "",
      // Export date in the browser's local timezone
      (() => {
        const parsed = parseEventDate(event.start_date || event.end_date);
        return parsed
          ? parsed.toLocaleString(language === "zh" ? "zh-CN" : "en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "";
      })(),
      event.location || "",
      event.host_names || "",
      event.completed_performances ?? 0,
    ]);

    const csvContent = [
      headers.map(csvEscape).join(","),
      ...rows.map((row) => row.map(csvEscape).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "events-past.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const confirmDelete = async (event: Event) => {
    await deleteEvent(event.event_id);
    setDeleteConfirmation(null);
  };

  const handleEventAdded = () => {
    // Events will be refetched automatically by useEvents
    setEditingEvent(null);
    setShowCreateModal(false);
  };

  if (error) {
    return (
      <>
        <ErrorPage errorMessage={error} />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className={`p-4 space-y-4 ${isAdminOrHost ? "pb-32" : ""}`}>
        {(eventsView === "future" || !isAdminOrHost) && (
          <>
            {futureEvents.map((event: Event) => (
              <EventCard
                key={event.event_id}
                {...event}
                onEdit={isAdmin ? handleEdit : undefined}
                onDelete={isAdmin ? handleDelete : undefined}
              />
            ))}
          </>
        )}

        {isAdminOrHost && eventsView === "past" && (
          <>
            {pastEvents.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          {t("events.table.date")}
                        </th>
                        <th className="px-4 py-3 text-left">
                          {t("events.table.title")}
                        </th>
                        <th className="px-4 py-3 text-left">
                          {t("events.table.location")}
                        </th>
                        <th className="px-4 py-3 text-right">
                          {t("events.table.performances")}
                        </th>
                        {isAdmin && (
                          <th className="px-4 py-3 text-right">
                            {t("events.table.actions")}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pastEvents.map((event: Event) => (
                        <tr
                          key={event.event_id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handlePastRowClick(event.event_id)}
                        >
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                            {formatEventDate(event.start_date)}
                          </td>
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            {event.title}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {event.location}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 font-medium">
                            {event.completed_performances ?? 0}
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={(e) => handlePastEditClick(e, event)}
                                  className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                                  aria-label={t("common.edit")}
                                  title={t("common.edit")}
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
                                <button
                                  onClick={(e) =>
                                    handlePastDeleteClick(e, event)
                                  }
                                  className="p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                                  aria-label={t("common.delete")}
                                  title={t("common.delete")}
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
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleExportPastEventsCsv}
                    className="rounded bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                  >
                    {t("events.exportCsv")}
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
                {t("events.noPast")}
              </div>
            )}
          </>
        )}
      </div>
      {isAdminOrHost && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setEventsView("future")}
              className={`flex-1 py-2 rounded font-medium transition-colors ${
                eventsView === "future"
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {t("events.future")}
            </button>
            <button
              onClick={() => setEventsView("past")}
              className={`flex-1 py-2 rounded font-medium transition-colors ${
                eventsView === "past"
                  ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {t("events.past")}
            </button>
          </div>
          <button
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-center block"
            onClick={() => setShowCreateModal(true)}
          >
            {t("common.addNew")}
          </button>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <EventsCreateView
          isModal={true}
          createEvent={createEvent}
          updateEvent={updateEvent}
          editingEvent={editingEvent}
          onAdded={handleEventAdded}
          onClose={() => {
            setEditingEvent(null);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <Modal>
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {t("events.deleteTitle")}
            </h2>
            <p className="text-gray-600">
              {t("events.deleteBody", { title: deleteConfirmation.title })}
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
    </>
  );
};

export default EventsView;
