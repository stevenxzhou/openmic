// get event data for a specific event
import { useState, useEffect } from "react"
import type { Event } from "../api/event"
import { getEventData, getEventsData, postEventData } from "../api/event"

export const useEvent = (event_id: number) => {

    const [event, setEvent] = useState<Event | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch event data once after component mounts
    useEffect(() => {
        getEventData(event_id)
            .then((data) => {
                setEvent(data);
            })
            .catch((error) => {
                setError(`There was a problem with the fetch operation:${error}`);
            });
    }, [event_id]); // Empty dependency array ensures this runs only once

    return { event, setEvent, error }
}

export const useEvents = () => {

    const [events, setEvents] = useState<Event[]>();
    const [error, setError] = useState<string | null>(null);

    // Fetch event data once after component mounts
    useEffect(() => {
        getEvents();
    }, []); // Empty dependency array ensures this runs only once

    const getEvents = async ()=> {
        getEventsData()
            .then((data) => {
                setEvents(data);
            })
            .catch((error) => {
                setError(`There was a problem with the fetch operation:${error}`);
            });
    }

    const createEvent = async (newEvent: Event) => {
        try {
            await postEventData(newEvent);
            // Fetch the updated list of performances
            getEvents();
        } catch (error) {
            setError(`There was a problem with the fetch operation:${error}`);
        }
    };

    return { events, setEvents, createEvent, error }
}