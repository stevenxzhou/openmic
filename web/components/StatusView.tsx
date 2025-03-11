import React from "react"
import { Performer } from "../app/page"

type StatusViewProps = {
  performers: Performer[]
  currentPerformerIndex: number
  setView: (view: "status" | "signup" | "list") => void
  calculateWaitTime: (index: number) => string
}

const StatusView: React.FC<StatusViewProps> = ({ performers, currentPerformerIndex, setView, calculateWaitTime }) => (
  <div className="p-4 pb-20 relative min-h-screen">
    <div className="flex justify-between mb-6">
      <h1 className="text-2xl font-bold">Event Status</h1>
      <button onClick={() => setView("list")} className="px-3 py-1 border rounded hover:bg-yellow-50">
        Sign Up List
      </button>
    </div>

    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-600 mb-2">Now Performing</h2>
      {performers[currentPerformerIndex] ? (
        <div className="border-2 border-yellow-500 p-4 rounded">
          <h3 className="font-bold">{performers[currentPerformerIndex].name}</h3>
          <p className="text-gray-600">{performers[currentPerformerIndex].socialMedia}</p>
          <p className="mt-2">{performers[currentPerformerIndex].songs.join(", ")}</p>
        </div>
      ) : (
        <div className="border p-4 rounded text-center text-gray-500">No performers yet</div>
      )}
    </div>

    <div>
      <h2 className="text-lg font-semibold text-gray-600 mb-2">Up Next</h2>
      <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
        {performers.slice(currentPerformerIndex + 1).length > 0 ? (
          <div className="space-y-4">
            {performers.slice(currentPerformerIndex + 1).map((performer, idx) => {
              const index = currentPerformerIndex + 1 + idx
              return (
                <div key={performer.id} className="border p-4 rounded">
                  <h3 className="font-bold">{performer.name}</h3>
                  <p className="text-gray-600">{performer.socialMedia}</p>
                  <p className="mt-2">{performer.songs.join(", ")}</p>
                  <p className="text-sm text-gray-500 mt-1">Est. wait: {calculateWaitTime(index)}</p>
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
      <button
        onClick={() => setView("signup")}
        className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
      >
        Sign Up to Perform
      </button>
    </div>
  </div>
)

export default StatusView