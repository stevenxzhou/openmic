import { type User } from "@/api/user"
import { type Event } from "@/api/event"

export enum PerformanceStatus {
    COMPLETED = "COMPLETED",
    PENDING = "PENDING"
}

export type Performance = {
    event_id: number;
    performance_id: number;
    user_id: number;
    performance_index: number;
    songs: string[];
    status: string;
};

export type PerformanceUser = Event & Performance & User;
export type PerformanceGuest = Event & Performance;

const openmicApiBase = process.env.NEXT_PUBLIC_OPEN_MIC_API_BASE_URL || 'https://stevenxzhou.com';

async function getPerformanceData(event_id: number) {
    const response = await fetch(`${openmicApiBase}/api/events/${event_id}/performances`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
}

// Function to add new performance data
async function addPerformanceData(event_id: number, newPerformance: Performance) {
    const response = await fetch(`${openmicApiBase}/api/events/${event_id}/performances`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPerformance),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
}

// Function to update performance data
async function updatePerformanceData(event_id: number, performance: Performance) {
    const response = await fetch(`${openmicApiBase}/api/events/${event_id}/performances/${performance.performance_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(performance),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
}

// Function to update performance data
async function removePerformanceData(event_id: number, performance: Performance) {
    const response = await fetch(`${openmicApiBase}/api/events/${event_id}/performances/${performance.performance_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(performance),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
}

export { getPerformanceData, addPerformanceData, updatePerformanceData, removePerformanceData };