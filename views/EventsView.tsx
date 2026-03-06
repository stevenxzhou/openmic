"use client";

import { type Event } from "@/hooks/useEvents";
import { EventCard } from "@/components/EventCard";
import { useEvents } from "@/hooks/useEvents";
import React, { useState, useContext } from "react";
import ErrorView from "./ErrorView";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { GlobalContext } from "@/context/useGlobalContext";
import EventCreateView from "./EventCreateView";

const EventsView = () => {
  const { events, createEvent, deleteEvent, error } = useEvents();
  const { user } = useContext(GlobalContext);
  const [deleteConfirmation, setDeleteConfirmation] = useState<Event | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isAdmin = user.role?.toLowerCase() === "admin";
  const isAdminOrHost = isAdmin || user.role?.toLowerCase() === "host";

  const handleDelete = (event: Event) => {
    setDeleteConfirmation(event);
  };

  const confirmDelete = async (event: Event) => {
    await deleteEvent(event.event_id);
    setDeleteConfirmation(null);
  };

  const handleEventAdded = () => {
    // Events will be refetched automatically by useEvents
    setShowCreateModal(false);
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
      <Header />
      <div className="space-y-4">
        {/* <!-- Event Card --> */}
        {events?.map((event: Event) => (
          <EventCard
            key={event.event_id}
            {...event}
            onDelete={isAdmin ? handleDelete : undefined}
          />
        ))}
      </div>
      {isAdminOrHost && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-center block"
            onClick={() => setShowCreateModal(true)}
          >
            Add New
          </button>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <EventCreateView
          isModal={true}
          createEvent={createEvent}
          onAdded={handleEventAdded}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <Modal>
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Delete Event?
            </h2>
            <p className="text-gray-600">
              Are you sure you want to delete "{deleteConfirmation.title}"? This
              will also delete all associated performances.
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
    </>
  );
};

export default EventsView;
