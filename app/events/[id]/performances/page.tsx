"use client";

import React from "react";
import PerformancesView from "@/views/PerformancesView";


export default function PerformancesPage({ params }: { params: { id: string } }) {
    return <PerformancesView eventId={params.id} />;
}