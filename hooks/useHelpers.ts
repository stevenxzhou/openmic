
import usePerformances, { Performance, PerformanceUser, PerformanceStatus } from "./usePerformances";

export type helperParams = {eventId: number, toggleSkipConfirmModal: any};

export default function useHelpers({eventId, toggleSkipConfirmModal}: helperParams) {

    const { performances, updatePerformance, error } = usePerformances(eventId);

    const pendingPerformances: Performance[] = performances.filter((performance) => performance.status === PerformanceStatus.PENDING);

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
        moveUpPerformanceHandler,
        activatePerformanceHandler
    }
}