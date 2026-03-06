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

    const createEvent = async (newEvent: Event): Promise<{success: boolean, error?: string, eventId?: number}> => {
        try {
            console.log('useEvents.createEvent - Sending:', newEvent);
            const response = await fetch(apiUrl('/api/events'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEvent),
            });
            
            console.log('useEvents.createEvent - Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.log('useEvents.createEvent - Error data:', errorData);
                const errorMessage = errorData.error || 'Network response was not ok';
                
                // Don't set global error for 409 (duplicate) - let the form component handle it
                if (response.status !== 409) {
                    setError(errorMessage);
                }
                return { success: false, error: errorMessage, eventId: errorData.eventId };
            }
            
            console.log('useEvents.createEvent - Success, fetching updated events');
            setError(null);
            // Fetch the updated list of events
            getEvents();
            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : `There was a problem with the fetch operation:${error}`;
            console.log('useEvents.createEvent - Setting error:', message);
            setError(message);
            return { success: false, error: message };
        }
    };

    const updateEvent = async (eventId: number, updatedEvent: Event): Promise<{success: boolean, error?: string, eventId?: number}> => {
        try {
            console.log('useEvents.updateEvent - Event ID:', eventId, 'Data:', updatedEvent);
            const response = await fetch(apiUrl(`/api/events/${eventId}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEvent),
            });
            
            console.log('useEvents.updateEvent - Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.log('useEvents.updateEvent - Error data:', errorData);
                const errorMessage = errorData.error || 'Network response was not ok';
                
                // Don't set global error for 409 (duplicate) - let the form component handle it
                if (response.status !== 409) {
                    setError(errorMessage);
                }
                return { success: false, error: errorMessage, eventId: errorData.eventId };
            }
            
            console.log('useEvents.updateEvent - Success, fetching updated events');
            setError(null);
            // Fetch the updated list of events
            getEvents();
            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : `There was a problem with the fetch operation:${error}`;
            console.log('useEvents.updateEvent - Setting error:', message);
            setError(message);
            return { success: false, error: message };
        }
    };

    const deleteEvent = async (eventId: number) => {
        try {
            const response = await fetch(apiUrl(`/api/events/${eventId}`), {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Network response was not ok');
            // Fetch the updated list of events
            getEvents();
        } catch (error) {
            setError(`There was a problem with the fetch operation:${error}`);
        }
    };

    return { events, setEvents, createEvent, updateEvent, deleteEvent, error, setError }
}