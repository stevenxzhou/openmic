"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import PerformancesPage from "@/components/pages/PerformancesPage";

export default function PerformancesPageContent() {
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get("event_id");
  const eventId = eventIdParam ? parseInt(eventIdParam, 10) : null;

  if (!eventId || isNaN(eventId)) {
    return <PerformancesPage />;
  }

  return <PerformancesPage eventId={eventId} />;
}
