import React, { useState } from "react"
import { useGlobalContext } from "@/context/useGlobalContext"
import { Performance, PerformanceStatus } from "@/api/performance"

const StatusView = () => {

  const { pendingPerformances, completedPerformances, currentPerformanceIndex, updatePerformance, calculateWaitTime} = useGlobalContext()

  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const moveUpPerformanceHandler = (performance: Performance, index: number) => {

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
    setShowSkipConfirm(false);
  }

  // https://play.tailwindcss.com/Kivr97EoHt
return (
  <div className="p-4 pb-20 relative min-h-screen">
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-600 mb-2">Now Performing</h2>
      {pendingPerformances[currentPerformanceIndex] ? (
        <div className="border-2 border-yellow-500 p-4 rounded">
          <h3 className="font-bold">{pendingPerformances[currentPerformanceIndex].username}</h3>
          <p className="text-gray-600">{pendingPerformances[currentPerformanceIndex].social_media_alias}</p>
          <p className="mt-2">{pendingPerformances[currentPerformanceIndex].songs.toString()}</p>
          <div className="bottom-2 right-2 text-right">
          <button
            className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded"
            aria-label="Moveup performer"
            onClick={() => setShowSkipConfirm(true)}
          >
            Skip
          </button>
          </div>
        </div>
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
                <div key={performance.performance_id} className="border p-4 rounded">
                  <h3 className="font-bold">{performance.username}</h3>
                  <p className="text-gray-600">{performance.social_media_alias}</p>
                  <p className="mt-2">{performance.songs.toString()}</p>
                  <p className="text-sm text-gray-500 mt-1">Est. wait: {calculateWaitTime(index)}</p>
                  {index > 1 ? (
                    <div className="bottom-2 right-2 text-right">
                    <button
                      className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded"
                      aria-label="Moveup performer"
                      onClick={() => moveUpPerformanceHandler(performance, index)}
                    >
                      Up
                    </button>
                  </div>
                  ) : (
                    <></>
                  )}

                </div>           
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
                <div key={performance.performance_id} className="border p-4 rounded">
                  <h3 className="font-bold">{performance.username}</h3>
                  <p className="text-gray-600">{performance.social_media_alias}</p>
                  <p className="mt-2">{performance.songs.toString()}</p>
                  <div className="bottom-2 right-2 text-right">
                    <button
                      className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded"
                      aria-label="Moveup performer"
                      onClick={() => activatePerformanceHandler(performance, index)}
                    >
                      Activate
                    </button>
                  </div>
                </div>           
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
        href="/signup"
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
            <button onClick={() => setShowSkipConfirm(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
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

export default StatusView