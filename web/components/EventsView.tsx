import { type Event } from "@/api/event"
import { EventCard } from "./EventCard";
import { useEvents } from "@/hooks/useEvents"; // Adjust the path based on your project structure
import React from "react";
  
const EventsView = () => {
    const { events } = useEvents();

    return (
        // <!-- Event List -->
        <div className="space-y-4">
            {/* <!-- Event Card --> */}
            {events?.map((event: Event) => (
                <React.Fragment key={event.id}>
                    <EventCard {...event} />
                </React.Fragment>
            ))}
        </div>
    )
}

export default EventsView