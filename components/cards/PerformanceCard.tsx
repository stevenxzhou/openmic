import { useState, useContext, useEffect } from "react";
import { type PerformanceUser } from "@/hooks/usePerformances";
import { InstagramIcon } from "../utilities/SocialMediaIcons";
import { apiUrl } from "@/lib/utils";
import { GlobalContext } from "@/context/useGlobalContext";

type PerformanceCardProps = {
  performance: PerformanceUser;
  index: number;
  displayNumber?: number;
  calculateWaitTime: (index: number) => string;
  showWaitTime?: boolean;
  showActions?: boolean;
  onComplete?: (performance: PerformanceUser) => void;
  onDelete?: (performance: PerformanceUser) => void;
  onMoveNext?: (performance: PerformanceUser) => void;
};

const PerformanceCard: React.FC<PerformanceCardProps> = ({
  performance,
  index,
  displayNumber,
  calculateWaitTime,
  showWaitTime = true,
  showActions = false,
  onComplete,
  onDelete,
  onMoveNext,
}) => {
  const [likes, setLikes] = useState(performance.likes || 0);
  const [isLiking, setIsLiking] = useState(false);
  const { user } = useContext(GlobalContext);
  const isAdminOrHost =
    user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "host";

  // Sync likes whenever performance prop updates
  useEffect(() => {
    setLikes(performance.likes || 0);
  }, [performance.likes]);

  const songs = Array.isArray(performance.songs)
    ? performance.songs
    : typeof performance.songs === "string"
      ? JSON.parse(performance.songs)
      : [];

  // Parse social_medias - stored as a plain Instagram handle string
  const socialMediaValue = (() => {
    if (!performance.social_medias) return "";

    // If it's already a string, return it directly
    if (typeof performance.social_medias === "string") {
      return performance.social_medias.trim();
    }

    // For legacy data that might be stored as an object, extract first value
    if (
      typeof performance.social_medias === "object" &&
      performance.social_medias !== null
    ) {
      return (Object.values(performance.social_medias)[0] as string) || "";
    }

    return "";
  })();

  // Check if value is a valid Instagram handle (no URL protocol)
  const isInstagramHandle = (value: string): boolean => {
    if (!value) return false;
    // Valid handles: 1-30 characters, letters, numbers, periods, underscores
    // Can't start with a number, no URLs allowed
    return (
      !value.startsWith("http://") &&
      !value.startsWith("https://") &&
      !value.includes(".com") &&
      !value.includes(".net") &&
      !value.includes(".org") &&
      /^[a-zA-Z_][a-zA-Z0-9_.]{0,29}$/.test(value)
    );
  };

  const showInstagramIcon =
    socialMediaValue && isInstagramHandle(socialMediaValue);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const response = await fetch(
        apiUrl(`/api/performances/${performance.performance_id}/like`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes || likes + 1);
      }
    } catch (error) {
      console.error("Error liking performance:", error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div
      className={`relative border-2 p-3 rounded transition-all ${
        index === 0 ? "border-yellow-500" : "border-gray-300"
      }`}
    >
      {/* Large background number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded -z-10">
        <span
          className="text-gray-100 font-bold leading-none"
          style={{ fontSize: "120px" }}
        >
          {displayNumber ?? index + 1}
        </span>
      </div>

      {/* Performer name */}
      <div className="flex items-end">
        <h1
          className={`font-md leading-tight text-gray-900 mr-2 ${index === 0 ? "text-[2rem]" : "text-lg"}`}
        >
          {performance.performers || "Guest"}
        </h1>

        {/* Social media - Instagram handle only */}
        {showInstagramIcon && index === 0 && (
          <div className="w-5 h-5 flex-shrink-0 text-pink-600 mb-3">
            <InstagramIcon className="w-5" handle={socialMediaValue} />
          </div>
        )}
      </div>

      {/* Like button - top right */}
      {(!showWaitTime || index === 0) && (
        <button
          onClick={handleLike}
          disabled={isLiking || !showWaitTime}
          className="absolute top-2 right-0 p-2 hover:bg-pink-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          title="Like"
        >
          <span className="text-sm font-bold text-gray-800">{likes}</span>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-pink-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      )}

      {/* Wait time - only show for 2nd card onward in lineup */}
      {showWaitTime && index > 0 && (
        <div className="absolute top-2 right-0 p-2 flex items-center">
          <span className="text-sm text-gray-600 font-medium">
            ⏱ {calculateWaitTime(index)}
          </span>
        </div>
      )}

      {/* Songs */}
      <p className="text-sm text-gray-800 font-medium mt-3 line-clamp-2">
        {songs.join(", ")}
      </p>

      {/* Action buttons and inputs - bottom right corner */}
      {showActions &&
        isAdminOrHost &&
        (onComplete || onDelete || onMoveNext) && (
          <div className="absolute mt-10 bottom-2 right-2 flex gap-1 items-end">
            {/* Inputs display */}
            {performance.inputs && (
              <p className="text-xs text-gray-600 mb-1">{performance.inputs}</p>
            )}
            {/* Action buttons */}
            <div className="flex gap-1">
              {onMoveNext && index >= 2 && (
                <button
                  className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                  aria-label="Move next"
                  onClick={() => onMoveNext(performance)}
                  title="Move Next"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </button>
              )}
              {onComplete && index === 0 && (
                <button
                  className="p-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                  aria-label="Complete performance"
                  onClick={() => onComplete(performance)}
                  title="Complete"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
              )}
              {onDelete && index !== 0 && (
                <button
                  className="p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                  aria-label="Delete performance"
                  onClick={() => onDelete(performance)}
                  title="Delete"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
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
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default PerformanceCard;
