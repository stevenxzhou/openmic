import { useState, useEffect } from "react"
import type { Performance, PerformanceUser } from "../api/performance"
import { getPerformanceData, addPerformanceData, updatePerformanceData, removePerformanceData } from "../api/performance"

const usePerformances = (eventId: number) => {
    const [performances, setPerformances] = useState<PerformanceUser[]>([]);

    // Fetch performances data once after component mounts
    useEffect(() => {
        fetchPerformances(eventId);
    }, []);

    const fetchPerformances = async (event_id: number) => {
        try {
            const data = await getPerformanceData(event_id);
            setPerformances(data);
        } catch (error) {
            console.error("There was a problem with the fetch operation:", error);
        }
    };

    const addPerformance = async (newPerformance: Performance) => {
        try {
            await addPerformanceData(newPerformance);
            // Fetch the updated list of performances
            fetchPerformances(eventId);
        } catch (error) {
            console.error("There was a problem with the fetch operation:", error);
        }
    };

    const updatePerformance = async (performance: Performance) => {
        try {
            await updatePerformanceData(performance);
            // Fetch the updated list of performances
            fetchPerformances(eventId);
        } catch (error) {
            console.error("There was a problem with the fetch operation:", error);
        }
    };

    const removePerformance = async (performance: Performance) => {
        try {
            await removePerformanceData(performance);
            // Fetch the updated list of performances
            fetchPerformances(eventId);
        } catch (error) {
            console.error("There was a problem with the fetch operation:", error);
        }
    };

    return { performances, addPerformance, setPerformances, updatePerformance, removePerformance };
};

export default usePerformances;