"use client";

import React from "react";
import PerformanceSignUpView from "@/views/PerformanceSignUpView";

const PerformanceSignupPage = ({ params }: { params: { id: string } }) => {
    return <PerformanceSignUpView eventId={params.id}/>;
};

export default PerformanceSignupPage;