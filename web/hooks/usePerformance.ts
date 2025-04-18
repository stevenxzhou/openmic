import { useState, useEffect } from "react"
import type { Performance } from "../api/performance"
import { getPerformanceData, addPerformanceData, updatePerformanceData, removePerformanceData } from "../api/performance"

const usePerformances = () => {
    const [performances, setPerformances] = useState<Performance[]>([]);

    // Fetch performances data once after component mounts
    useEffect(() => {
        fetchPerformances();
    }, []);

    const fetchPerformances = async () => {
        try {
            const data = await getPerformanceData();
            setPerformances(data);
        } catch (error) {
            console.error("There was a problem with the fetch operation:", error);
        }
    };

    const addPerformance = async (newPerformance: Performance) => {
        try {
            await addPerformanceData(newPerformance);
            // Fetch the updated list of performances
            fetchPerformances();
        } catch (error) {
            console.error("There was a problem with the fetch operation:", error);
        }
    };

    const updatePerformance = async (performance: Performance) => {
        try {
            await updatePerformanceData(performance);
            // Fetch the updated list of performances
            fetchPerformances();
        } catch (error) {
            console.error("There was a problem with the fetch operation:", error);
        }
    };

    const removePerformance = async (performance: Performance) => {
        try {
            await removePerformanceData(performance);
            // Fetch the updated list of performances
            fetchPerformances();
        } catch (error) {
            console.error("There was a problem with the fetch operation:", error);
        }
    };

    return { performances, addPerformance, setPerformances, updatePerformance, removePerformance};
};

export default usePerformances;