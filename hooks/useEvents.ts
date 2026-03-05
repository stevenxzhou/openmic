// get event data for a specific event
import { useState, useEffect } from "react"
import { apiUrl } from "@/lib/utils";

export type Event = {
    id?: number;
    event_id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
}

const normalizeEvent = (event: Event): Event => ({
    ...event,
    event_id: event.event_id ?? event.id ?? 0,
});

export const useEvent = (event_id: number) => {

    const [event, setEvent] = useState<Event | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch event data once after component mounts
    useEffect(() => {
        fetch(apiUrl(`/api/events/${event_id}`))
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => {
                setEvent(normalizeEvent(data));
            })
            .catch((error) => {
                setError(`There was a problem with the fetch operation:${error}`);
            });
    }, [event_id]);

    return { event, setEvent, error }
}

export const useEvents = () => {

    const [events, setEvents] = useState<Event[]>();
    const [error, setError] = useState<string | null>(null);

    // Fetch event data once after component mounts
    useEffect(() => {
        getEvents();
    }, []);

    const getEvents = async ()=> {
        fetch(apiUrl('/api/events'))
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => {
                setEvents(data.map((event: Event) => normalizeEvent(event)));
            })
            .catch((error) => {
                setError(`There was a problem with the fetch operation:${error}`);
            });
    }

    const createEvent = async (newEvent: Event) => {
        try {
            const response = await fetch(apiUrl('/api/events'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEvent),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            // Fetch the updated list of events
            getEvents();
        } catch (error) {
            setError(`There was a problem with the fetch operation:${error}`);
        }
    };

    return { events, setEvents, createEvent, error }
}