import { PerformanceUser } from "@/hooks/usePerformances";
import { ReactNode } from "react";

export default function PerformanceCardContainer({
  children,
  performance,
  className = "",
}: {
  children: ReactNode;
  performance: PerformanceUser;
  className?: string;
}) {
  return (
    <div
      className={`border-2 border-yellow-500 p-3 rounded transition-all ${className}`}
    >
      <h3 className="font-bold text-sm">
        {performance.first_name} {performance.last_name}
      </h3>
      <p className="mt-1 text-sm">{performance.songs.toString()}</p>

      {children}
    </div>
  );
}
