"use client"

import type React from "react"
import { useState } from "react"
import StatusView from "../components/StatusView"
import SignUpView from "../components/SignUpView"
import ListView from "../components/ListView"

// Simple performer type
export type Performer = {
  id: string
  name: string
  socialMedia: string
  songs: string[]
}

export default function OpenMicApp() {
  // Basic state
  const [view, setView] = useState<"status" | "signup" | "list">("status")
  const [performers, setPerformers] = useState<Performer[]>([
    {
      id: "1",
      name: "Alex Johnson",
      socialMedia: "@alexjmusic",
      songs: ["Wonderwall", "Hallelujah"],
    },
    {
      id: "2",
      name: "Sam Rivera",
      socialMedia: "@samrivera",
      songs: ["Creep"],
    },
    {
      id: "3",
      name: "Taylor Kim",
      socialMedia: "@taylork",
      songs: ["Someone Like You", "Stay With Me"],
    },
    {
      id: "4",
      name: "Jordan Smith",
      socialMedia: "@jsmith",
      songs: ["Shape of You", "Thinking Out Loud"],
    },
    {
      id: "5",
      name: "Casey Williams",
      socialMedia: "@caseyw",
      songs: ["Bohemian Rhapsody"],
    },
    {
      id: "6",
      name: "Morgan Lee",
      socialMedia: "@morganlee",
      songs: ["Shallow", "Always Remember Us This Way"],
    },
  ])
  const [currentPerformerIndex, setCurrentPerformerIndex] = useState(0)

  // Form state
  const [name, setName] = useState("")
  const [socialMedia, setSocialMedia] = useState("")
  const [song1, setSong1] = useState("")
  const [song2, setSong2] = useState("")

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [performerToDelete, setPerformerToDelete] = useState<string | null>(null)

  // Calculate wait time based on number of songs
  const calculateWaitTime = (index: number) => {
    if (index <= currentPerformerIndex) return "Now"

    let totalMinutes = 0
    // Count songs for all performers from current to this one
    for (let i = currentPerformerIndex; i < index; i++) {
      totalMinutes += performers[i].songs.length * 5
    }

    if (totalMinutes < 60) {
      return `${totalMinutes} min`
    } else {
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return `${hours}h ${minutes}m`
    }
  }

  // Add a new performer
  const addPerformer = () => {
    if (!name || !socialMedia || !song1) return

    const songs = [song1]
    if (song2) songs.push(song2)

    setPerformers([
      ...performers,
      {
        id: Date.now().toString(),
        name,
        socialMedia,
        songs,
      },
    ])

    // Reset form
    setName("")
    setSocialMedia("")
    setSong1("")
    setSong2("")

    // Go to list view
    setView("list")
  }

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    // // Only allow reordering performers who haven't performed yet
    // if (draggedIndex < currentPerformerIndex && index < currentPerformerIndex) return

    // Create a copy of the performers array
    const newPerformers = [...performers]
    const draggedPerformer = newPerformers[draggedIndex]

    // Special handling for when the current performer is being moved to a later position
    if (draggedIndex === currentPerformerIndex && index > currentPerformerIndex) {
      // Remove the current performer
      newPerformers.splice(draggedIndex, 1)

      // Insert the performer at the new position
      newPerformers.splice(index, 0, draggedPerformer)

      // The next performer becomes the current performer
      // We keep currentPerformerIndex the same since the next performer slides up
      setPerformers(newPerformers)
      setDraggedIndex(index)
      return
    }

    // Regular reordering logic
    newPerformers.splice(draggedIndex, 1)
    newPerformers.splice(index, 0, draggedPerformer)

    // If we're moving a performer to before the current and the current is being pushed down
    // if (index <= currentPerformerIndex && draggedIndex > currentPerformerIndex) {
    //   setCurrentPerformerIndex(currentPerformerIndex + 1)
    // }
    // // If we're moving a performer from before the current to after it
    // else if (draggedIndex < currentPerformerIndex && index >= currentPerformerIndex) {
    //   setCurrentPerformerIndex(currentPerformerIndex - 1)
    // }

    setPerformers(newPerformers)
    setDraggedIndex(index)
  }

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Handle delete performer
  const handleDeletePerformer = (id: string) => {
    setPerformerToDelete(id)
    setShowDeleteConfirm(true)
  }

  // Confirm delete performer
  const confirmDeletePerformer = () => {
    if (!performerToDelete) return

    const index = performers.findIndex((p) => p.id === performerToDelete)
    const newPerformers = [...performers]

    // If skipping the current performer, move to the next one
    if (index === currentPerformerIndex && performers.length > currentPerformerIndex + 1) {
      // Just remove the current performer, the next one becomes current
      newPerformers.splice(index, 1)
      // No need to adjust currentPerformerIndex as the next performer will slide into position
    } else if (index === currentPerformerIndex) {
      // This is the last performer, remove it
      newPerformers.splice(index, 1)
      // If this was the last performer, adjust the index
      if (currentPerformerIndex > 0) {
        setCurrentPerformerIndex(currentPerformerIndex - 1)
      }
    } else {
      // Not the current performer
      newPerformers.splice(index, 1)
      // Adjust current performer index if needed
      if (index < currentPerformerIndex) {
        setCurrentPerformerIndex(currentPerformerIndex - 1)
      }
    }

    setPerformers(newPerformers)
    setShowDeleteConfirm(false)
    setPerformerToDelete(null)
  }

  // Cancel delete performer
  const cancelDeletePerformer = () => {
    setShowDeleteConfirm(false)
    setPerformerToDelete(null)
  }

  // Main render
  return (
    <main className="max-w-md mx-auto min-h-screen bg-white">
      {view === "status" && (
        <StatusView
          performers={performers}
          currentPerformerIndex={currentPerformerIndex}
          setView={setView}
          calculateWaitTime={calculateWaitTime}
        />
      )}
      {view === "signup" && (
        <SignUpView
          name={name}
          setName={setName}
          socialMedia={socialMedia}
          setSocialMedia={setSocialMedia}
          song1={song1}
          setSong1={setSong1}
          song2={song2}
          setSong2={setSong2}
          addPerformer={addPerformer}
          setView={setView}
        />
      )}
      {view === "list" && (
        <ListView
          performers={performers}
          currentPerformerIndex={currentPerformerIndex}
          draggedIndex={draggedIndex}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDragEnd={handleDragEnd}
          handleDeletePerformer={handleDeletePerformer}
          showDeleteConfirm={showDeleteConfirm}
          cancelDeletePerformer={cancelDeletePerformer}
          confirmDeletePerformer={confirmDeletePerformer}
          setView={setView}
          calculateWaitTime={calculateWaitTime}
        />
      )}
    </main>
  )
}

