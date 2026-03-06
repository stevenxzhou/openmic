import { useContext, useState } from "react";
import { PerformanceStatus, PerformanceUser } from "@/hooks/usePerformances";
import { GlobalContext } from "@/context/useGlobalContext";
import PerformancesListViewContainer from "@/components/views/PerformancesListViewContainer";

type Props = {
  performances: PerformanceUser[];
  title: string;
  onDelete?: (performance: PerformanceUser) => void;
};

const formatSongs = (songs: PerformanceUser["songs"]) => {
  if (Array.isArray(songs)) return songs.join(", ");
  if (typeof songs === "string") {
    try {
      const parsed = JSON.parse(songs);
      return Array.isArray(parsed) ? parsed.join(", ") : songs;
    } catch {
      return songs;
    }
  }
  return "";
};

export default function PerformancesCompactView({
  performances,
  title,
  onDelete,
}: Props) {
  const { user } = useContext(GlobalContext);
  const isAdmin = user.role?.toLowerCase() === "admin";

  const [sortConfig, setSortConfig] = useState<{
    key: "performer" | "songs" | "likes" | null;
    direction: "asc" | "desc";
  }>({ key: "likes", direction: "desc" });

  const handleSort = (key: "performer" | "songs" | "likes") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  let sortedPerformances = [...performances].filter(
    (performance) => performance.status === PerformanceStatus.COMPLETED,
  );

  if (sortConfig.key) {
    sortedPerformances.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortConfig.key) {
        case "performer":
          aVal = a.performers || "";
          bVal = b.performers || "";
          break;
        case "songs":
          aVal = formatSongs(a.songs);
          bVal = formatSongs(b.songs);
          break;
        case "likes":
          aVal = a.likes ?? 0;
          bVal = b.likes ?? 0;
          break;
        default:
          return 0;
      }

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const SortIndicator = ({ column }: { column: string }) => {
    if (sortConfig.key !== column)
      return <span className="text-gray-300 ml-1">⇅</span>;
    return (
      <span className="text-gray-900 ml-1 font-bold">
        {sortConfig.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const csvValue = (value: unknown) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const csvEscape = (value: unknown) => {
    const stringValue = csvValue(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const handleExportCsv = () => {
    const excludedKeys = new Set([
      "performance_id",
      "event_id",
      "performance_index",
      "status",
    ]);

    const allKeys = Array.from(
      new Set(
        sortedPerformances.flatMap((performance) =>
          Object.keys(performance as Record<string, unknown>),
        ),
      ),
    ).filter((key) => !excludedKeys.has(key));

    const headers = [...allKeys];

    const rows = sortedPerformances.map((performance) => {
      const performanceRecord = performance as Record<string, unknown>;
      return [...allKeys.map((key) => performanceRecord[key])];
    });

    const csvContent = [
      headers.map(csvEscape).join(","),
      ...rows.map((row) => row.map(csvEscape).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "completed-performances.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <PerformancesListViewContainer
      title={title}
      hasItems={sortedPerformances.length > 0}
      emptyState={
        <div className="border p-4 rounded text-center text-gray-500">
          No completed performances
        </div>
      }
    >
      <div className="border rounded overflow-hidden overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th
                className="px-3 py-2 text-left border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("performer")}
              >
                <div className="flex items-center whitespace-nowrap">
                  Performer
                  <SortIndicator column="performer" />
                </div>
              </th>
              <th
                className="px-3 py-2 text-left border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("songs")}
              >
                <div className="flex items-center whitespace-nowrap">
                  Songs
                  <SortIndicator column="songs" />
                </div>
              </th>
              <th
                className="px-3 py-2 text-right border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("likes")}
              >
                <div className="flex items-center justify-end whitespace-nowrap">
                  Likes
                  <SortIndicator column="likes" />
                </div>
              </th>
              {isAdmin && onDelete && (
                <th className="px-3 py-2 text-right">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedPerformances.map((performance) => {
              const songsText = formatSongs(performance.songs);
              return (
                <tr
                  key={performance.performance_id}
                  className="border-t border-gray-100"
                >
                  <td className="px-3 py-2 font-medium text-gray-900">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>{performance.performers || "Guest"}</span>
                    </div>
                  </td>
                  <td
                    className="px-3 py-2 text-gray-700 truncate"
                    title={songsText}
                  >
                    {songsText || "-"}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700">
                    {performance.likes || 0}
                  </td>
                  {isAdmin && onDelete && (
                    <td className="px-3 py-2 text-right">
                      <button
                        className="rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                        aria-label="Delete performance"
                        title="Delete"
                        onClick={() => onDelete(performance)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={sortedPerformances.length === 0}
          className="rounded bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Export CSV
        </button>
      </div>
    </PerformancesListViewContainer>
  );
}
