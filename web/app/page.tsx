"use client"

import type React from "react"
import { useState } from "react"
import StatusView from "../components/StatusView"
import SignUpView from "../components/SignUpView"
import ListView from "../components/ListView"
import usePerformances from "@/hooks/usePerformance"

export default function OpenMicApp() {
  // Basic state
  const [view, setView] = useState<"status" | "signup" | "list">("status")
  const { performances, addPerformance, setPerformances} = usePerformances()
  const [currentPerformerIndex, setCurrentPerformerIndex] = useState(0)

  // Form state
  const [name, setName] = useState("")
  const [socialMedia, setSocialMedia] = useState("")
  const [song1, setSong1] = useState("")
  const [song2, setSong2] = useState("")

  // Add performance handler
  const addPerformanceHandler = () => {
    if (!name || !song1 || !song2) {
      alert("Please fill in all fields")
      return
    }
    const newPerformance = {
      event_id: 1,
      event_title: "Summer Festival",
      performance_id: performances.length + 1,
      songs: [song1, song2],
      status: "Upcoming",
      user_id: 1,
      username: name,
      social_media_alias: socialMedia,
    }
    addPerformance(newPerformance)
    setName("")
    setSocialMedia("")
    setSong1("")
    setSong2("")
    setView("status")
  }

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [performerToDelete, setPerformerToDelete] = useState<number>(-1)

  // Calculate wait time based on number of songs
  const calculateWaitTime = (index: number) => {
    if (index <= currentPerformerIndex) return "Now"

    let totalMinutes = 0
    // Count songs for all performers from current to this one
    for (let i = currentPerformerIndex; i < index; i++) {
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

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    // Create a copy of the performances array
    const newPerformances = [...performances]
    const draggedPerformer = newPerformances[draggedIndex]

    // Special handling for when the current performer is being moved to a later position
    if (draggedIndex === currentPerformerIndex && index > currentPerformerIndex) {
      // Remove the current performer
      newPerformances.splice(draggedIndex, 1)

      // Insert the performer at the new position
      newPerformances.splice(index, 0, draggedPerformer)

      // The next performer becomes the current performer
      // We keep currentPerformerIndex the same since the next performer slides up
      setPerformances(newPerformances)
      setDraggedIndex(index)
      return
    }

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
    if (index === currentPerformerIndex && performances.length > currentPerformerIndex + 1) {
      // Just remove the current performer, the next one becomes current
      newPerformances.splice(index, 1)
      // No need to adjust currentPerformerIndex as the next performer will slide into position
    } else if (index === currentPerformerIndex) {
      // This is the last performer, remove it
      newPerformances.splice(index, 1)
      // If this was the last performer, adjust the index
      if (currentPerformerIndex > 0) {
        setCurrentPerformerIndex(currentPerformerIndex - 1)
      }
    } else {
      // Not the current performer
      newPerformances.splice(index, 1)
      // Adjust current performer index if needed
      if (index < currentPerformerIndex) {
        setCurrentPerformerIndex(currentPerformerIndex - 1)
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

  // Main render
  return (
    <main className="max-w-md mx-auto min-h-screen bg-white">
      {view === "status" && (
        <StatusView
          performances={performances}
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
          addPerformanceHandler={addPerformanceHandler}
          setView={setView}
        />
      )}
      {view === "list" && (
        <ListView
          performances={performances}
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

