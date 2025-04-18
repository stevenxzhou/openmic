"use client"

import type React from "react"
import { useState } from "react"
import StatusView from "../components/StatusView"
import SignUpView from "../components/SignUpView"
import ListView from "../components/ListView"
import usePerformances from "@/hooks/usePerformance"
import { GlobalContextProvider } from "@/context/useGlobalContext"

export default function OpenMicApp() {
  // Basic state
  const [view, setView] = useState<"status" | "signup">("status")

  // Main render
  return (
    <GlobalContextProvider>
      <main className="max-w-md mx-auto min-h-screen bg-white">
      {view === "status" && (
        <StatusView
          setView={setView}
        />
      )}
      {view === "signup" && (
        <SignUpView
          setView={setView}
        />
      )}
    </main>
  </GlobalContextProvider>
  )}

