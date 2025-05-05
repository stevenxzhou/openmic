import { type Event } from "@/api/event"
import { EventCard } from "@/components/EventCard";
import { useEvents } from "@/hooks/useEvents"; // Adjust the path based on your project structure
import React from "react";
import ErrorView from "./ErrorView";
import { useGlobalContext } from "@/context/useGlobalContext";
  
const EventsView = () => {
    const { events, error } = useEvents();
    const { user }  = useGlobalContext();

    if (!user.authenticated) {
        return (
            <>
                {typeof window !== "undefined" && window.location.replace("/login")}
            </>
        );
    }

    if (error) {
        return (
            <>
                <ErrorView errorMessage={error}/>
            </>
        );
    } 

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