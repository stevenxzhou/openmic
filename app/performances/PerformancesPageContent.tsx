"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import PerformancesView from "@/views/PerformancesView";
import ErrorView from "@/views/ErrorView";

export default function PerformancesPageContent() {
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get("event_id");
  const eventId = eventIdParam ? parseInt(eventIdParam, 10) : null;

  if (!eventId || isNaN(eventId)) {
    return <PerformancesView />;
  }

  return <PerformancesView eventId={eventId} />;
}
