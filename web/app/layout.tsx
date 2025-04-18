// filepath: /Users/steven/Coding/fun/apps/openmic/web/app/layout.tsx
import "./globals.css"; // Adjust the path if needed
import { GlobalContextProvider } from "@/context/useGlobalContext";

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
        <GlobalContextProvider>{children}</GlobalContextProvider>
      </body>
    </html>
  );
}