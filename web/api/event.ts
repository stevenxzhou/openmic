export type Event = {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
}

export async function getEventData(event_id: number) {
    const response = await fetch('http://127.0.0.1:5001/api/events' + `/${event_id}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}

export async function getEventsData() {
    const response = await fetch('http://127.0.0.1:5001/api/events');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}