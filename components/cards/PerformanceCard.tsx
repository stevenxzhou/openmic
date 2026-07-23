import {
  useState,
  useContext,
  useEffect,
  useCallback,
  memo,
  useRef,
} from "react";
import {
  type PerformanceUser,
  PerformanceStatus,
} from "@/hooks/usePerformances";
import { InstagramIcon } from "../utilities/SocialMediaIcons";
import { apiUrl } from "@/lib/utils";
import { GlobalContext } from "@/context/useGlobalContext";
import { useSession, signOut } from "next-auth/react";
import { ArrowUp, Check, Heart, Pencil, Trash2 } from "lucide-react";

const LIKED_PERFORMANCES_KEY = "likedPerformances";
const MAX_LIKES_PER_EVENT = 50;

type PerformanceCardProps = {
  performance: PerformanceUser;
  index: number;
  displayNumber?: number;
  showWaitTime?: boolean;
  showActions?: boolean;
  enableHeartAnimation?: boolean;
  onComplete?: (performance: PerformanceUser) => void;
  onDelete?: (performance: PerformanceUser) => void;
  onMoveNext?: (performance: PerformanceUser) => void;
  onEdit?: (performance: PerformanceUser) => void;
};

const PerformanceCard: React.FC<PerformanceCardProps> = memo(
  ({
    performance,
    index,
    displayNumber,
    showWaitTime = true,
    showActions = false,
    enableHeartAnimation = false,
    onComplete,
    onDelete,
    onMoveNext,
    onEdit,
  }) => {
    const [likes, setLikes] = useState(performance.likes || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [hasUserLiked, setHasUserLiked] = useState(false);
    const [showLikeLimitToast, setShowLikeLimitToast] = useState(false);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const previousLikesRef = useRef(likes);
    const previousHasUserLikedRef = useRef(false);
    const heartAnimationTimeoutRef = useRef<ReturnType<
      typeof setTimeout
    > | null>(null);
    const { data: session, status } = useSession();

    const isAdminOrHost =
      session?.user.role?.toLowerCase() === "admin" ||
      session?.user.role?.toLowerCase() === "host";
    const isAdmin = session?.user.role?.toLowerCase() === "admin";

    // Sync likes whenever performance prop updates
    useEffect(() => {
      setLikes(performance.likes || 0);
    }, [performance.likes]);

    // Load liked state from session storage on mount
    useEffect(() => {
      const likedPerformancesJson = sessionStorage.getItem(
        LIKED_PERFORMANCES_KEY,
      );
      const likedPerformances = likedPerformancesJson
        ? JSON.parse(likedPerformancesJson)
        : {};

      if (!performance.performance_id) return;

      const key = String(performance.performance_id);
      const likedEntry = likedPerformances[key];
      if (likedEntry) {
        setHasUserLiked(true);

        // Migrate legacy boolean value to event_id value for per-event counting.
        if (likedEntry === true && performance.event_id) {
          likedPerformances[key] = performance.event_id;
          sessionStorage.setItem(
            LIKED_PERFORMANCES_KEY,
            JSON.stringify(likedPerformances),
          );
        }
      }
    }, [performance.performance_id, performance.event_id]);

    // Save liked state to session storage whenever it changes
    useEffect(() => {
      const likedPerformancesJson = sessionStorage.getItem(
        LIKED_PERFORMANCES_KEY,
      );
      const likedPerformances = likedPerformancesJson
        ? JSON.parse(likedPerformancesJson)
        : {};

      if (performance.performance_id) {
        const key = String(performance.performance_id);
        if (hasUserLiked) {
          likedPerformances[key] = performance.event_id || true;
        } else {
          delete likedPerformances[key];
        }

        sessionStorage.setItem(
          LIKED_PERFORMANCES_KEY,
          JSON.stringify(likedPerformances),
        );
      }
    }, [hasUserLiked, performance.performance_id, performance.event_id]);

    useEffect(() => {
      if (!showLikeLimitToast) return;

      const timeoutId = setTimeout(() => {
        setShowLikeLimitToast(false);
      }, 2500);

      return () => clearTimeout(timeoutId);
    }, [showLikeLimitToast]);

    useEffect(() => {
      const wasPreviouslyLiked = previousHasUserLikedRef.current;
      previousHasUserLikedRef.current = hasUserLiked;

      // Only show animation when transitioning from not liked to liked, and for completed performances
      if (
        (!enableHeartAnimation && index !== 0) ||
        wasPreviouslyLiked === true ||
        hasUserLiked === false ||
        performance.status?.toUpperCase() !== PerformanceStatus.COMPLETED
      )
        return;

      setShowHeartAnimation(true);
      if (heartAnimationTimeoutRef.current) {
        clearTimeout(heartAnimationTimeoutRef.current);
      }

      heartAnimationTimeoutRef.current = setTimeout(() => {
        setShowHeartAnimation(false);
      }, 700);
    }, [hasUserLiked, index, performance.status, enableHeartAnimation]);

    useEffect(() => {
      return () => {
        if (heartAnimationTimeoutRef.current) {
          clearTimeout(heartAnimationTimeoutRef.current);
        }
      };
    }, []);

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

    const handleLike = useCallback(async () => {
      if (isLiking) return;

      if (!hasUserLiked && performance.event_id) {
        const likedPerformancesJson = sessionStorage.getItem(
          LIKED_PERFORMANCES_KEY,
        );
        const likedPerformances = likedPerformancesJson
          ? JSON.parse(likedPerformancesJson)
          : {};

        const likesInCurrentEvent = Object.values(likedPerformances).reduce(
          (count: number, entry) =>
            Number(entry) === Number(performance.event_id) ? count + 1 : count,
          0,
        );

        if (likesInCurrentEvent >= MAX_LIKES_PER_EVENT) {
          setShowLikeLimitToast(true);
          return;
        }
      }

      setIsLiking(true);
      try {
        const method = hasUserLiked ? "DELETE" : "POST";
        const response = await fetch(
          apiUrl(`/api/performances/${performance.performance_id}/like`),
          {
            method,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (response.ok) {
          const data = await response.json();
          if (typeof data.likes === "number") {
            setLikes(data.likes);
          } else {
            setLikes((prev) =>
              hasUserLiked ? Math.max(prev - 1, 0) : prev + 1,
            );
          }
          setHasUserLiked((prev) => !prev);
        }
      } catch (error) {
        console.error("Error liking performance:", error);
      } finally {
        setIsLiking(false);
      }
    }, [
      isLiking,
      hasUserLiked,
      performance.event_id,
      performance.performance_id,
    ]);

    return (
      <div
        className={`relative isolate overflow-hidden border-2 p-3 rounded transition-all ${
          index === 0 ? "border-yellow-500" : "border-gray-300"
        }`}
      >
        {/* Large background number */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden rounded">
          <span
            className="select-none text-gray-100 font-bold leading-none"
            style={{ fontSize: "120px" }}
          >
            {displayNumber ?? index + 1}
          </span>
        </div>

        <div className="relative z-10">
          {showHeartAnimation &&
            performance.status?.toUpperCase() ===
              PerformanceStatus.COMPLETED && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="relative h-20 w-20">
                  <Heart
                    className="absolute inset-0 h-20 w-20 text-pink-300 opacity-70 heart-glow-ease-out"
                    fill="currentColor"
                    aria-hidden="true"
                  />
                  <Heart
                    className="relative h-20 w-20 text-pink-500 heart-pop-ease-out drop-shadow"
                    fill="currentColor"
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}

          {/* Performer name */}
          <div className="flex items-end justify-between">
            <h1
              className={`font-md leading-tight text-gray-900 mr-2 ${index === 0 ? "text-[2rem]" : "text-lg"}`}
            >
              {performance.performers || "Guest"}
            </h1>

            {/* Social media - Instagram handle only */}
            {showInstagramIcon && index === 0 && (
              <div className="flex-shrink-0 text-pink-600 mb-3">
                <a
                  href={`https://instagram.com/${socialMediaValue}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-semibold text-pink-600 hover:text-pink-700 hover:underline break-words max-w-[120px]"
                >
                  @{socialMediaValue}
                </a>
              </div>
            )}
          </div>

          {/* Like button - top right (only for completed performances) */}
          {(!showWaitTime || index === 0) &&
            performance.status?.toUpperCase() ===
              PerformanceStatus.COMPLETED && (
              <button
                onClick={handleLike}
                aria-disabled={isLiking}
                className={`absolute top-2 right-0 p-2 pr-0 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${isLiking ? "opacity-50" : ""} ${hasUserLiked ? "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0" : ""}`}
                title="Like"
              >
                <Heart
                  className="h-8 w-8"
                  fill={hasUserLiked ? "currentColor" : "none"}
                  stroke={hasUserLiked ? "none" : "currentColor"}
                  strokeWidth={hasUserLiked ? 0 : 2}
                  style={{ color: hasUserLiked ? "#ec4899" : "#d1d5db" }}
                  aria-hidden="true"
                />
              </button>
            )}

          {showLikeLimitToast && (
            <div className="absolute right-0 top-12 z-10 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 shadow">
              You can like up to {MAX_LIKES_PER_EVENT} performances per event.
            </div>
          )}

          {/* Estimated performance time - only show for 2nd card onward in lineup */}
          {showWaitTime && index > 0 && (
            <div className="absolute top-0 right-0 flex items-start">
              <span className="text-sm text-gray-600 font-medium">
                ⏱ {performance.estimatedPerformanceTime}
              </span>
            </div>
          )}

          {/* Songs */}
          <p className="text-sm text-gray-800 font-medium mt-3 line-clamp-2">
            {songs.join(", ")}
          </p>

          {/* Action buttons and inputs */}
          {showActions &&
            isAdminOrHost &&
            (onComplete || onDelete || onMoveNext || onEdit) && (
              <div
                className={`flex flex-wrap items-end gap-2 ${performance.inputs ? "justify-between" : "justify-end"}`}
              >
                {/* Inputs display */}
                {performance.inputs && (
                  <p className="text-xs text-gray-600 mb-1 md:order-2">
                    {performance.inputs}
                  </p>
                )}
                {/* Action buttons */}
                <div className="flex gap-1 flex-wrap justify-end md:order-2">
                  {onDelete && index !== 0 && (
                    <button
                      className="p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                      aria-label="Delete performance"
                      onClick={() => onDelete(performance)}
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}

                  {onMoveNext && index >= 2 && (
                    <button
                      className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                      aria-label="Move next"
                      onClick={() => onMoveNext(performance)}
                      title="Move Next"
                    >
                      <ArrowUp className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}
                  {onComplete && index === 0 && (
                    <button
                      className="p-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                      aria-label="Complete performance"
                      onClick={() => onComplete(performance)}
                      title="Complete"
                    >
                      <Check className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}
                  {onEdit && isAdmin && (
                    <button
                      className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                      aria-label="Edit performance"
                      onClick={() => onEdit(performance)}
                      title="Edit"
                    >
                      <Pencil className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    );
  },
);

export default PerformanceCard;
