"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import PerformancesView from "@/views/PerformancesView";
import ErrorView from "@/views/ErrorView";

export default function PerformancesPage() {
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get("event_id");
  const eventId = eventIdParam ? parseInt(eventIdParam, 10) : null;

  if (!eventId || isNaN(eventId)) {
    return (
      <ErrorView errorMessage="Missing or invalid event_id query parameter. Usage: ?event_id=102" />
    );
  }

  return <PerformancesView eventId={eventId} />;
}
