"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import PerformanceSignUpView from "@/views/PerformanceCreateView";
import ErrorView from "@/views/ErrorView";

export default function PerformanceCreatePageContent() {
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get("event_id");
  const eventId = eventIdParam ? parseInt(eventIdParam, 10) : null;

  if (!eventId || isNaN(eventId)) {
    return (
      <ErrorView errorMessage="Missing or invalid event_id query parameter. Usage: ?event_id=102" />
    );
  }

  return <PerformanceSignUpView eventId={eventId} />;
}
