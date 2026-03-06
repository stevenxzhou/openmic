"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import PerformancesCreateView from "@/components/views/PerformancesCreateView";
import ErrorPage from "@/components/pages/ErrorPage";

export default function PerformanceCreatePageContent() {
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get("event_id");
  const eventId = eventIdParam ? parseInt(eventIdParam, 10) : null;

  if (!eventId || isNaN(eventId)) {
    return (
      <ErrorPage errorMessage="Missing or invalid event_id query parameter. Usage: ?event_id=102" />
    );
  }

  return <PerformancesCreateView eventId={eventId} />;
}
