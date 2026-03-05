"use client";

import React, { Suspense } from "react";
import PerformanceCreatePage from "./PerformanceCreatePageContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PerformanceCreatePage />
    </Suspense>
  );
}
