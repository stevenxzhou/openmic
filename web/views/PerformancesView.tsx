import React, { useState } from "react"
import { Performance, PerformanceStatus, PerformanceUser } from "@/api/performance"
import usePerformances from '@/hooks/usePerformances';
import PerformanceCard from "@/components/PerformanceCard";
import CurrentPerformanceCard from "@/components/CurrentPerformanceCard";
import Link from "next/link";
import ErrorView from "./ErrorView";

const PerformancesView = ({...props}) => {

  const eventId = parseInt(props.eventId, 10);
  const { performances, updatePerformance, error } = usePerformances(eventId);

  const [ currentPerformanceIndex ] = useState<number>(0);

  const pendingPerformances = performances.filter((performance) => performance.status === PerformanceStatus.PENDING);
  const completedPerformances = performances.filter((performance) => performance.status === PerformanceStatus.COMPLETED);

  const [showSkipConfirm, toggleSkipConfirmModal] = useState(false);

  const moveUpPerformanceHandler = (performance: PerformanceUser, index: number) => {

    let performanceAboveIndex = index - 1;
    let performanceAbove: Performance = pendingPerformances[performanceAboveIndex];

    if (performanceAboveIndex > 0) {
      updatePerformance({...performanceAbove, performance_index: performance.performance_index});
      updatePerformance({...performance, performance_index:performanceAbove.performance_index});
    }
  }

  const activatePerformanceHandler = (performance: Performance, index: number) => {
    let performance_index = 0;
    if (pendingPerformances.length > 0) {
      performance_index = pendingPerformances[pendingPerformances.length-1].performance_index + 1;
    }
    updatePerformance({...performance, status: PerformanceStatus.PENDING, performance_index: performance_index});
  }

  const skipPerformanceConfirmHandler = (performance: Performance) => {
    updatePerformance({...performance, status: PerformanceStatus.COMPLETED})
    toggleSkipConfirmModal(false);
  }

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

if (error) {
  return (
      <>
          <ErrorView errorMessage={error}/>
      </>
  );
} 

  // https://play.tailwindcss.com/Kivr97EoHt
return (
  <div className="p-4 pb-20 relative min-h-screen">
      <div className="flex items-center mb-6">
        <Link href="/events" className="mr-2 text-yellow-600 hover:text-yellow-800">
          ← Back
        </Link>
      </div>
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-600 mb-2">Now Performing</h2>
      {pendingPerformances[currentPerformanceIndex] ? (
        <CurrentPerformanceCard
          performance={pendingPerformances[currentPerformanceIndex]} 
          toggleSkipConfirmModal={toggleSkipConfirmModal} />
      ) : (
        <div className="border p-4 rounded text-center text-gray-500">No performers yet</div>
      )}
    </div>

    <div>
      <h2 className="text-lg font-semibold text-gray-600 mb-2">Up Next</h2>
      <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
        {pendingPerformances.slice(currentPerformanceIndex + 1).length > 0 ? (
          <div className="space-y-4">
            {pendingPerformances.slice(currentPerformanceIndex + 1).map((performance, idx) => {
              const index = currentPerformanceIndex + 1 + idx
              return (
                <PerformanceCard 
                  performance={performance} 
                  index={index} 
                  performanceHandler={moveUpPerformanceHandler} 
                  calculateWaitTime={calculateWaitTime} 
                  showCardBtn={index > 1}
                  cardBtnText="Up"/>
              )
            })}
          </div>
        ) : (
          <div className="border p-4 rounded text-center text-gray-500">No one in queue</div>
        )}
      </div>
    </div>

    <div>
      <h2 className="text-lg font-semibold text-gray-600 mb-2">Completed</h2>
      <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
        {completedPerformances.slice(currentPerformanceIndex + 1).length > 0 ? (
          <div className="space-y-4">
            {completedPerformances.slice(currentPerformanceIndex + 1).filter((performance) => performance.status === PerformanceStatus.COMPLETED).map((performance, idx) => {
              const index = currentPerformanceIndex + 1 + idx
              return (
                <PerformanceCard 
                  performance={performance} 
                  index={index} 
                  performanceHandler={activatePerformanceHandler} 
                  calculateWaitTime={calculateWaitTime} 
                  showCardBtn={true}
                  cardBtnText="Activate"/>
              )
            })}
          </div>
        ) : (
          <div className="border p-4 rounded text-center text-gray-500">No one in queue</div>
        )}
      </div>
    </div>

    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
      <a
        className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-center block"
        href={`/openmic/events/${eventId}/signup/`}
      >
        Sign Up to Perform
      </a>
    </div>

    {/* Delete Confirmation Modal - Updated text to reflect "Skip" instead of "Delete" */}
    {showSkipConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <h3 className="text-lg font-bold mb-4">Confirm Skip</h3>
          <p className="mb-6">Are you sure you want to skip this performer?</p>
          <div className="flex justify-end space-x-2">
            <button onClick={() => toggleSkipConfirmModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={() => skipPerformanceConfirmHandler(pendingPerformances[currentPerformanceIndex])}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}

export default PerformancesView