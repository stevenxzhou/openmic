import React, { createContext, useContext, useState } from 'react';
import { PerformanceStatus, type Performance } from '@/api/performance';
import usePerformances from '@/hooks/usePerformance';

interface GlobalContextType {
    pendingPerformances: Performance[];
    completedPerformances: Performance[];
    currentPerformanceIndex: number;
    addPerformance: (performance: Performance) => void;
    setPerformances: (performances: Performance[]) => void;
    updatePerformance: (performance: Performance) => void;
    removePerformance: (performance: Performance) => void;
    updateCurrentPerformanceIndex: (id: number) => void;
    calculateWaitTime: (index: number) => string;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalContextProvider");
    }
    return context;
};

export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
    const { performances, addPerformance, setPerformances, updatePerformance, removePerformance} = usePerformances();
    const [ currentPerformanceIndex, setCurrentPerformanceIndex] = useState<number>(0);

    const updateCurrentPerformanceIndex = (id: number) => {
        setCurrentPerformanceIndex(id);
    };

    // Calculate wait time based on number of songs
    const calculateWaitTime = (index: number) => {
        if (index <= currentPerformanceIndex) return "Now"

        let totalMinutes = 0
        // Count songs for all performers from current to this one
        for (let i = currentPerformanceIndex; i < index; i++) {
            totalMinutes += performances[i].songs.length * 5
        }

        if (totalMinutes < 60) {
            return `${totalMinutes} min`
        } else {
            const hours = Math.floor(totalMinutes / 60)
            const minutes = totalMinutes % 60
            return `${hours}h ${minutes}m`
        }
    }

    const pendingPerformances = performances.filter((performance) => performance.status === PerformanceStatus.PENDING);
    const completedPerformances = performances.filter((performance) => performance.status === PerformanceStatus.COMPLETED);

    return (
        <GlobalContext.Provider
            value={{
                pendingPerformances,
                completedPerformances,
                currentPerformanceIndex,
                addPerformance,
                setPerformances,
                updatePerformance,
                removePerformance,
                updateCurrentPerformanceIndex,
                calculateWaitTime
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};