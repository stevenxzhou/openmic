import React from "react"

// Simple performer type
export type Performer = {
    id: string
    name: string
    socialMedia: string
    songs: string[]
  }

type ListViewProps = {
  performers: Performer[]
  currentPerformerIndex: number
  draggedIndex: number | null
  handleDragStart: (index: number) => void
  handleDragOver: (e: React.DragEvent, index: number) => void
  handleDragEnd: () => void
  handleDeletePerformer: (id: string) => void
  showDeleteConfirm: boolean
  cancelDeletePerformer: () => void
  confirmDeletePerformer: () => void
  setView: (view: "status" | "signup" | "list") => void
  calculateWaitTime: (index: number) => string
}

const ListView: React.FC<ListViewProps> = ({
  performers,
  currentPerformerIndex,
  draggedIndex,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDeletePerformer,
  showDeleteConfirm,
  cancelDeletePerformer,
  confirmDeletePerformer,
  setView,
  calculateWaitTime,
}) => (
  <div className="p-4">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        <button onClick={() => setView("status")} className="mr-2 text-yellow-600 hover:text-yellow-800">
          ← Back
        </button>
        {/* <h1 className="text-2xl font-bold">Performer List</h1> */}
      </div>
      <button
        onClick={() => setView("signup")}
        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
      >
        + Sign Up
      </button>
    </div>

    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
      <p>Drag and drop performers to reorder the queue. Use the Skip button to remove a performer.</p>
    </div>

    <div>
      {performers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No performers signed up yet</div>
      ) : (
        <div className="space-y-4">
          {performers.map((performer, index) => (
            <div
              key={performer.id}
              draggable={true}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`p-4 rounded relative ${
                index === currentPerformerIndex
                  ? "bg-yellow-100 border-l-4 border-yellow-500 cursor-move"
                  : index < currentPerformerIndex
                    ? "bg-gray-100 opacity-60 cursor-move"
                    : "bg-white border cursor-move"
              } ${draggedIndex === index ? "border-2 border-dashed border-yellow-400" : ""}`}
            >
              <div className="flex justify-between mb-8">
                <div>
                  <h3 className="font-medium">
                    {performer.name}
                    {index === currentPerformerIndex && (
                      <span className="ml-2 text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full">Now</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{performer.socialMedia}</p>
                  <div className="mt-2">
                    {performer.songs.map((song, songIndex) => (
                      <p key={songIndex} className="text-sm">
                        {songIndex + 1}. {song}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-500">{calculateWaitTime(index)}</div>
              </div>

              <div className="absolute bottom-2 right-2">
                <button
                  onClick={() => handleDeletePerformer(performer.id)}
                  className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded"
                  aria-label="Skip performer"
                >
                  Skip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Delete Confirmation Modal - Updated text to reflect "Skip" instead of "Delete" */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <h3 className="text-lg font-bold mb-4">Confirm Skip</h3>
          <p className="mb-6">Are you sure you want to skip this performer?</p>
          <div className="flex justify-end space-x-2">
            <button onClick={cancelDeletePerformer} className="px-4 py-2 border rounded hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={confirmDeletePerformer}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)

export default ListView