"use client";

import { SessionProvider } from "next-auth/react";
const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider basePath={`${baseUrl}/api/auth`}>
      {children}
    </SessionProvider>
  );
}
