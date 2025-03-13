// get event data for a specific event
import { useState, useEffect } from "react"
import type { Event } from "../api/event"
import getEventData from "../api/event"

const useEvent = (event_id: number) => {

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

export default useEvent