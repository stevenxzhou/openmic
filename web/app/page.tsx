"use client"

import type React from "react"
import PerformancesView from "../views/PerformancesView"
import SignUpView from "../views/SignUpView"
import EventsView from "../views/EventsView"
import { useRoutes, BrowserRouter } from 'react-router-dom';

export default function OpenMicApp() {
  // Basic state
  const AppRoutes = () => {
    const routes = useRoutes([
        { path: "/", element: <EventsView /> },
        { path: "/events/:id/signup", element: <SignUpView /> },
        { path: "/events/:id/performances", element: <PerformancesView /> },
    ]);
    return routes;
};
  // Main render
  return (
      <main className="max-w-md mx-auto min-h-screen bg-white">
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </main>
  )}

