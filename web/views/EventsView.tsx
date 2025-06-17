import { type Event } from "@/api/event"
import { EventCard } from "@/components/EventCard";
import { useEvents } from "@/hooks/useEvents"; // Adjust the path based on your project structure
import React from "react";
import ErrorView from "./ErrorView";
import Header from "@/components/Header";
import Link from "next/link";
  
const EventsView = () => {
    const { events, error } = useEvents();

    if (error) {
        return (
            <>
                <ErrorView errorMessage={error}/>
            </>
        );
    } 

    return (
        <>
            <Header />
            <div className="space-y-4">
                {/* <!-- Event Card --> */}
                {events?.map((event: Event) => (
                    <React.Fragment key={event.id}>
                        <EventCard {...event} />
                    </React.Fragment>
                ))}
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                <Link
                    className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-center block"
                    href={`/events/new/`}
                >
                    Create New Event
                </Link>
            </div>
        </>
    )
}

export default EventsView