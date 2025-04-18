// get event data for a specific event
import { useState, useEffect } from "react"
import type { Event } from "../api/event"
import { getEventData, getEventsData } from "../api/event"

export const useEvent = (event_id: number) => {

    const [event, setEvent] = useState<Event | null>(null);

    // Fetch event data once after component mounts
    useEffect(() => {
        getEventData(event_id)
            .then((data) => {
                setEvent(data);
            })
            .catch((error) => {
                console.error("There was a problem with the fetch operation:", error);
            });
    }, [event_id]); // Empty dependency array ensures this runs only once

    return { event, setEvent }
}

export const useEvents = () => {

    const [events, setEvents] = useState<Event[]>();

    // Fetch event data once after component mounts
    useEffect(() => {
        getEventsData()
            .then((data) => {
                setEvents(data);
            })
            .catch((error) => {
                console.error("There was a problem with the fetch operation:", error);
            });
    }, []); // Empty dependency array ensures this runs only once

    return { events, setEvents }
}