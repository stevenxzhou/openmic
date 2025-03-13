export type Event = {
    event_id: number;
    event_title: string;
    event_start_datetime: string;
    event_end_datetime: string;
}

async function getEventData(event_id: number) {
    const response = await fetch('http://127.0.0.1:5000/api/events' + `/${event_id}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}

export default getEventData;