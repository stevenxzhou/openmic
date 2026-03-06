import { useState, useEffect } from "react"
import type { Event } from "./useEvents"
import type { User } from "./useUser"
import { apiUrl } from "@/lib/utils";

export enum PerformanceStatus {
    COMPLETED = "COMPLETED",
    PENDING = "PENDING"
}

export type Performance = {
    event_id: number;
    performance_id?: number;
    performance_index: number;
    songs: string[];
    status: string;
    performers?: string;
    inputs?: string;
    social_medias?: string;
    likes?: number;
};

export type PerformanceUser = Performance;

const usePerformances = (eventId: number) => {
    const [performances, setPerformances] = useState<PerformanceUser[]>([]);
    const [pendingPerformances, setPendingPerformances] = useState<PerformanceUser[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Fetch performances data when component mounts or eventId changes
    useEffect(() => {
        if (eventId) {
            fetchPerformances(eventId);
        }
    }, [eventId]);

    const fetchPerformances = async (event_id: number) => {
        try {
            const response = await fetch(apiUrl(`/api/performances?event_id=${event_id}`));
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Network response was not ok' }));
                throw new Error(errorData.error || 'Network response was not ok');
            }
            const data: PerformanceUser[] = await response.json();
            // Normalize status from backend to match enum (Completed -> COMPLETED, Pending -> PENDING)
            const normalizedData = data.map((performance) => ({
                ...performance,
                status: performance.status?.toUpperCase() ?? performance.status
            }));
            setPerformances(normalizedData);
            setPendingPerformances(normalizedData.filter((performance) => performance.status === PerformanceStatus.PENDING))
        } catch (error) {
            setError(`There was a problem with the fetch operation:${error}`);
        }
    };

    const addPerformance = async (eventId: number, newPerformance: Performance) => {
        try {
            const response = await fetch(apiUrl(`/api/performances`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPerformance),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            // Fetch the updated list of performances
            await fetchPerformances(eventId);
            return true;
        } catch (error) {
            setError(`There was a problem with the fetch operation:${error}`);
            return false;
        }
    };

    const updatePerformance = async (eventId: number, performance: Performance) => {
        try {
            const response = await fetch(apiUrl(`/api/performances/${performance.performance_id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(performance),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            // Fetch the updated list of performances
            fetchPerformances(eventId);
        } catch (error) {
            setError(`There was a problem with the fetch operation:${error}`);
        }
    };

    const removePerformance = async (eventId: number, performance: Performance) => {
        try {
            const response = await fetch(apiUrl(`/api/performances/${performance.performance_id}`), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(performance),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            // Fetch the updated list of performances
            fetchPerformances(eventId);
        } catch (error) {
            setError(`There was a problem with the fetch operation:${error}`);
        }
    };

    const moveNext = async (eventId: number, performanceId: number) => {
        try {
            const response = await fetch(apiUrl(`/api/performances/${performanceId}/move-next`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ event_id: eventId }),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            // Fetch the updated list of performances
            await fetchPerformances(eventId);
        } catch (error) {
            setError(`There was a problem with the fetch operation:${error}`);
        }
    };

    return { performances, pendingPerformances, addPerformance, fetchPerformances, setPerformances, updatePerformance, removePerformance, moveNext, error };
};

export default usePerformances;