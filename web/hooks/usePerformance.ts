import { useState, useEffect } from "react"
import type { Performance } from "../api/performance"
import { getPerformanceData, addPerformanceData } from "../api/performance"

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

    return { performances, addPerformance, setPerformances};
};

export default usePerformances;