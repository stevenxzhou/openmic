export type Event = {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    description: string;
    location: string;
}

const openmicApiBase = process.env.NEXT_PUBLIC_OPEN_MIC_API_BASE_URL || 'https://stevenxzhou.com:5124';

export async function getEventData(event_id: number) {
    const response = await fetch(`${openmicApiBase}/api/events` + `/${event_id}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}

export async function getEventsData() {
    const response = await fetch(`${openmicApiBase}/api/events`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}