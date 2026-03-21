// filepath: /Users/steven/Coding/fun/apps/openmic/web/app/layout.tsx

import "./globals.css"; // Adjust the path if needed
import { GlobalContextProvider } from "@/context/useGlobalContext";
import { SessionProviderWrapper } from "./SessionProviderWrapper";

export const metadata = {
  title: "Open Mic App",
  description: "Manage performances for open mic events",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GlobalContextProvider>
          <SessionProviderWrapper>{children}</SessionProviderWrapper>
        </GlobalContextProvider>
      </body>
    </html>
  );
}
