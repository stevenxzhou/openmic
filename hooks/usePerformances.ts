import { useState, useEffect } from "react"
import type { Performance, PerformanceUser } from "../api/performance"
import { getPerformanceData, addPerformanceData, updatePerformanceData, removePerformanceData, PerformanceStatus } from "../api/performance"

const usePerformances = (eventId: number) => {
    const [performances, setPerformances] = useState<PerformanceUser[]>([]);
    const [pendingPerformances, setPendingPerformances] = useState<PerformanceUser[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Fetch performances data once after component mounts
    useEffect(() => {
        fetchPerformances(eventId);
    }, []);

    const fetchPerformances = async (event_id: number) => {
        try {
            const data: PerformanceUser[] = await getPerformanceData(event_id) as PerformanceUser[];
            setPerformances(data);
            setPendingPerformances(data.filter((performance) => {performance.status === PerformanceStatus.PENDING}))
        } catch (error) {
            setError(`There was a problem with the fetch operation:${error}`);
        }
    };

    const addPerformance = async (eventId: number, newPerformance: Performance) => {
        try {
            await addPerformanceData(eventId, newPerformance);
            // Fetch the updated list of performances
            fetchPerformances(eventId);
        } catch (error) {
            setError(`There was a problem with the fetch operation:${error}`);
        }
    };

    const updatePerformance = async (eventId: number, performance: Performance) => {
        try {
            await updatePerformanceData(eventId, performance);
            // Fetch the updated list of performances
            fetchPerformances(eventId);
        } catch (error) {
            setError(`There was a problem with the fetch operation:${error}`);
        }
    };

    const removePerformance = async (eventId: number, performance: Performance) => {
        try {
            await removePerformanceData(eventId, performance);
            // Fetch the updated list of performances
            fetchPerformances(eventId);
        } catch (error) {
            setError(`There was a problem with the fetch operation:${error}`);
        }
    };

    return { performances, pendingPerformances, addPerformance, setPerformances, updatePerformance, removePerformance, error };
};

export default usePerformances;