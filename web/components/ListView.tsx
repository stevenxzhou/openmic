import React, {useState} from "react"
import Draggable from "react-draggable"
import { useGlobalContext } from "@/context/useGlobalContext"

type ListViewProps = {
  setView: (view: "status" | "signup") => void
}

const ListView: React.FC<ListViewProps> = ({
  setView,
}) => {

  // Drag and drop state
  const [ draggedIndex, setDraggedIndex ] = useState<number | null>(null)
  const { performances, currentPerformanceIndex, setPerformances, updateCurrentPerformanceIndex, calculateWaitTime} = useGlobalContext()
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [performerToDelete, setPerformerToDelete] = useState<number>(-1)

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  // Handle drag over
  const handleDragOver = (index: number) => {
    console.log("draggedIndex", draggedIndex)
    console.log("index", index)
    //e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    // Create a copy of the performances array
    const newPerformances = [...performances]
    const draggedPerformer = newPerformances[draggedIndex]

    // Regular reordering logic
    newPerformances.splice(draggedIndex, 1)
    newPerformances.splice(index, 0, draggedPerformer)

    setPerformances(newPerformances)
    setDraggedIndex(index)
  }

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Handle delete performer
  const handleDeletePerformer = (id: number) => {
    setPerformerToDelete(id)
    setShowDeleteConfirm(true)
  }

  // Confirm delete performer
  const confirmDeletePerformer = (id: number) => {
    if (!performerToDelete) return

    const index = performances.findIndex((p) => p.performance_id === id)
    const newPerformances = [...performances]

    // If skipping the current performer, move to the next one
    if (index === currentPerformanceIndex && performances.length > currentPerformanceIndex + 1) {
      // Just remove the current performer, the next one becomes current
      newPerformances.splice(index, 1)
      // No need to adjust currentPerformerIndex as the next performer will slide into position
    } else if (index === currentPerformanceIndex) {
      // This is the last performer, remove it
      newPerformances.splice(index, 1)
      // If this was the last performer, adjust the index
      if (currentPerformanceIndex > 0) {
        updateCurrentPerformanceIndex(currentPerformanceIndex - 1)
      }
    } else {
      // Not the current performer
      newPerformances.splice(index, 1)
      // Adjust current performer index if needed
      if (index < currentPerformanceIndex) {
        updateCurrentPerformanceIndex(currentPerformanceIndex - 1)
      }
    }

    setPerformances(newPerformances)
    setShowDeleteConfirm(false)
    setPerformerToDelete(-1)
  }

  // Cancel delete performer
  const cancelDeletePerformer = () => {
    setShowDeleteConfirm(false)
    setPerformerToDelete(-1)
  }

  return (
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
      {performances.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No performers signed up yet</div>
      ) : (
        <div className="space-y-4">
          {performances.map((performer, index) => (
            <Draggable onDrag={() => handleDragOver(index)} key={performer.performance_id} axis="y" grid={[160, 160]} onStart={() => handleDragStart(index)} onStop={handleDragEnd}>
            <div
              key={performer.performance_id}
              className={`p-4 rounded relative ${
                index === currentPerformanceIndex
                  ? "bg-yellow-100 border-l-4 border-yellow-500 cursor-move"
                  : index < currentPerformanceIndex
                    ? "bg-gray-100 opacity-60 cursor-move"
                    : "bg-white border cursor-move"
              } ${draggedIndex === index ? "border-2 border-dashed border-yellow-400" : ""}`}
            >
              <div className="flex justify-between mb-8">
                <div>
                  <h3 className="font-medium">
                    {performer.username}, {index}, {performer.performance_index}
                    {index === currentPerformanceIndex && (
                      <span className="ml-2 text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full">Now</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">{performer.social_media_alias}</p>
                  <div className="mt-2">
                    {performer.songs.map((song, i) => (
                      <span
                        key={i}
                        className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded"
                      >
                        {song}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-500">{calculateWaitTime(index)}</div>
              </div>

              <div className="absolute bottom-2 right-2">
                <button
                  onClick={() => handleDeletePerformer(performer.performance_id)}
                  className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded"
                  aria-label="Skip performer"
                >
                  Skip
                </button>
              </div>
            </div>
            </Draggable>
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
              onClick={() => confirmDeletePerformer(performances[currentPerformanceIndex].performance_id)}
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

export default ListView