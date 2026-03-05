import { PerformanceUser } from "@/api/performance";
import { ReactNode } from "react";

export default function PerformanceCardContainer({
  children,
  performance,
}: {
  children: ReactNode;
  performance: PerformanceUser;
}) {
  return (
    <div className="border-2 border-yellow-500 p-4 rounded">
      <h3 className="font-bold">{performance.first_name}</h3>
      <p className="text-gray-600">{performance.primary_social_media_alias}</p>
      <p className="mt-2">{performance.songs.toString()}</p>

      {children}
    </div>
  );
}
