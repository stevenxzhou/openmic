
import usePerformances, { Performance, PerformanceUser, PerformanceStatus } from "./usePerformances";

export type helperParams = {currentPerformanceIndex: number, eventId: number, toggleSkipConfirmModal: any};

export default function useHelpers({currentPerformanceIndex, eventId, toggleSkipConfirmModal}: helperParams) {

    const { performances, updatePerformance, error } = usePerformances(eventId);

    const pendingPerformances: Performance[] = performances.filter((performance) => performance.status === PerformanceStatus.PENDING);

    // Calculate wait time based on number of songs
    const calculateWaitTime = (index: number) => {
        if (index <= currentPerformanceIndex) return "Now"

        let totalMinutes = 0
        // Count songs for all performers from current to this one
        for (let i = currentPerformanceIndex; i < index; i++) {
            const performance = performances[i]
            const songCount = performance?.songs?.length ?? 0
            totalMinutes += songCount * 5
        }

        if (totalMinutes < 60) {
            return `${totalMinutes} min`
        } else {
            const hours = Math.floor(totalMinutes / 60)
            const minutes = totalMinutes % 60
            return `${hours}h ${minutes}m`
        }
    }

    const moveUpPerformanceHandler = (performance: PerformanceUser, index: number) => {

        let performanceAboveIndex = index - 1;
        let performanceAbove: Performance = pendingPerformances[performanceAboveIndex];

        if (performanceAboveIndex > 0) {
            updatePerformance(eventId, {...performanceAbove, performance_index: performance.performance_index});
            updatePerformance(eventId, {...performance, performance_index: performanceAbove.performance_index});
        }
    }

    const activatePerformanceHandler = (performance: Performance, index: number) => {
        let performance_index = 0;
        if (pendingPerformances.length > 0) {
            performance_index = pendingPerformances[pendingPerformances.length-1].performance_index + 1;
        }
        updatePerformance(eventId, {...performance, status: PerformanceStatus.PENDING, performance_index: performance_index});
    }

    return {
        calculateWaitTime, 
        moveUpPerformanceHandler,
        activatePerformanceHandler
    }
}