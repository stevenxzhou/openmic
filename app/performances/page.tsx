"use client";

import React, { Suspense } from "react";
import PerformancesPage from "./PerformancesPageContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PerformancesPage />
    </Suspense>
  );
}
