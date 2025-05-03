"use client"

import type React from "react"
import PerformancesView from "../views/PerformancesView"
import SignUpView from "../views/PerformanceSignUpView"
import EventsView from "../views/EventsView"
import { useRoutes, BrowserRouter } from 'react-router-dom';
import UserLoginView from "@/views/UserLoginView"
import UserSignupView from "@/views/UserSignupView"

export default function OpenMicApp() {
  // Basic state
  const AppRoutes = () => {
    const routes = useRoutes([
        { path: "/", element: <EventsView /> },
        { path: "/login", element: <UserLoginView /> },
        { path: "/signup", element: <UserSignupView /> },
        { path: "/events/:id/signup", element: <SignUpView /> },
        { path: "/events/:id/performances", element: <PerformancesView /> },
    ]);
    return routes;
};
  // Main render
  return (
      <div className="bg-gray-50">
        <main className="max-w-xl mx-auto min-h-screen ">
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </main>
      </div>
  )}

