import { useContext, useState, useRef, useEffect } from "react";
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

const getInstagramHandle = (socialMedias: PerformanceUser["social_medias"]) => {
  if (!socialMedias) return "";

  if (typeof socialMedias === "string") {
    return socialMedias.trim();
  }

  if (typeof socialMedias === "object") {
    const firstValue = Object.values(socialMedias)[0];
    return typeof firstValue === "string" ? firstValue.trim() : "";
  }

  return "";
};

const isInstagramHandle = (value: string): boolean => {
  if (!value) return false;
  return (
    !value.startsWith("http://") &&
    !value.startsWith("https://") &&
    !value.includes(".com") &&
    !value.includes(".net") &&
    !value.includes(".org") &&
    /^[a-zA-Z_][a-zA-Z0-9_.]{0,29}$/.test(value)
  );
};

export default function PerformancesCompactView({
  performances,
  title,
  onDelete,
}: Props) {
  const { user } = useContext(GlobalContext);
  const isAdminOrHost =
    user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "host";

  const [sortConfig, setSortConfig] = useState<{
    key: "performer" | "songs" | "inputs" | "likes" | null;
    direction: "asc" | "desc";
  }>({ key: "likes", direction: "desc" });

  const [columnWidths, setColumnWidths] = useState({
    index: 40,
    performer: 200,
    songs: 220,
    inputs: 150,
    likes: 80,
    action: 100,
  });

  const resizeRef = useRef<{
    column: keyof typeof columnWidths;
    startX: number;
  } | null>(null);

  const handleSort = (key: "performer" | "songs" | "inputs" | "likes") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleMouseDown = (
    column: keyof typeof columnWidths,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    resizeRef.current = { column, startX: e.clientX };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;

      const currentResize = resizeRef.current;
      const delta = e.clientX - currentResize.startX;
      setColumnWidths((prev) => ({
        ...prev,
        [currentResize.column]: Math.max(
          50,
          prev[currentResize.column] + delta,
        ),
      }));
      currentResize.startX = e.clientX;
    };

    const handleMouseUp = () => {
      resizeRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

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
        case "inputs":
          aVal = a.inputs || "";
          bVal = b.inputs || "";
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

  const ResizeHandle = ({ column }: { column: keyof typeof columnWidths }) => (
    <div
      onMouseDown={(e) => {
        e.stopPropagation();
        handleMouseDown(column, e);
      }}
      className="absolute right-0 top-0 bottom-0 w-1 bg-gray-300 hover:bg-yellow-500 cursor-col-resize opacity-0 hover:opacity-100 transition-opacity"
    />
  );

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
        <table className="text-sm border-collapse">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th
                className="px-3 py-2 text-left relative border-r border-gray-200"
                style={{
                  width: `${columnWidths.index}px`,
                  minWidth: `${columnWidths.index}px`,
                }}
              >
                #
                <ResizeHandle column="index" />
              </th>
              <th
                className="px-3 py-2 text-left relative border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("performer")}
                style={{
                  width: `${columnWidths.performer}px`,
                  minWidth: `${columnWidths.performer}px`,
                }}
              >
                <div className="flex items-center whitespace-nowrap">
                  Performer
                  <SortIndicator column="performer" />
                </div>
                <ResizeHandle column="performer" />
              </th>
              <th
                className="px-3 py-2 text-left relative border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("songs")}
                style={{
                  width: `${columnWidths.songs}px`,
                  minWidth: `${columnWidths.songs}px`,
                }}
              >
                <div className="flex items-center whitespace-nowrap">
                  Songs
                  <SortIndicator column="songs" />
                </div>
                <ResizeHandle column="songs" />
              </th>
              <th
                className="px-3 py-2 text-left relative border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("inputs")}
                style={{
                  width: `${columnWidths.inputs}px`,
                  minWidth: `${columnWidths.inputs}px`,
                }}
              >
                <div className="flex items-center whitespace-nowrap">
                  Inputs
                  <SortIndicator column="inputs" />
                </div>
                <ResizeHandle column="inputs" />
              </th>
              <th
                className="px-3 py-2 text-right relative border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("likes")}
                style={{
                  width: `${columnWidths.likes}px`,
                  minWidth: `${columnWidths.likes}px`,
                }}
              >
                <div className="flex items-center justify-end whitespace-nowrap">
                  Likes
                  <SortIndicator column="likes" />
                </div>
                <ResizeHandle column="likes" />
              </th>
              {isAdminOrHost && onDelete && (
                <th
                  className="px-3 py-2 text-right"
                  style={{
                    width: `${columnWidths.action}px`,
                    minWidth: `${columnWidths.action}px`,
                  }}
                >
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedPerformances.map((performance, idx) => {
              const songsText = formatSongs(performance.songs);
              const instagramHandle = getInstagramHandle(
                performance.social_medias,
              );
              const hasInstagram = isInstagramHandle(instagramHandle);
              return (
                <tr
                  key={performance.performance_id}
                  className="border-t border-gray-100"
                >
                  <td
                    className="px-3 py-2 text-gray-500"
                    style={{
                      width: `${columnWidths.index}px`,
                      minWidth: `${columnWidths.index}px`,
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td
                    className="px-3 py-2 font-medium text-gray-900"
                    style={{
                      width: `${columnWidths.performer}px`,
                      minWidth: `${columnWidths.performer}px`,
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>{performance.performers || "Guest"}</span>
                      {hasInstagram && (
                        <a
                          href={`https://instagram.com/${instagramHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700 hover:underline text-xs font-medium"
                        >
                          @{instagramHandle}
                        </a>
                      )}
                    </div>
                  </td>
                  <td
                    className="px-3 py-2 text-gray-700 truncate"
                    title={songsText}
                    style={{
                      width: `${columnWidths.songs}px`,
                      minWidth: `${columnWidths.songs}px`,
                    }}
                  >
                    {songsText || "-"}
                  </td>
                  <td
                    className="px-3 py-2 text-gray-700"
                    style={{
                      width: `${columnWidths.inputs}px`,
                      minWidth: `${columnWidths.inputs}px`,
                    }}
                  >
                    {performance.inputs || "-"}
                  </td>
                  <td
                    className="px-3 py-2 text-right text-gray-700"
                    style={{
                      width: `${columnWidths.likes}px`,
                      minWidth: `${columnWidths.likes}px`,
                    }}
                  >
                    {performance.likes || 0}
                  </td>
                  {isAdminOrHost && onDelete && (
                    <td
                      className="px-3 py-2 text-right"
                      style={{
                        width: `${columnWidths.action}px`,
                        minWidth: `${columnWidths.action}px`,
                      }}
                    >
                      <button
                        className="text-red-600 hover:text-red-700 text-xs font-semibold"
                        onClick={() => onDelete(performance)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PerformancesListViewContainer>
  );
}
