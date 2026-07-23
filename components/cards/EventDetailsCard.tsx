import { useState, useMemo, memo, useContext } from "react";
import Modal from "@/components/layouts/Modal";
import QRCode from "@/components/utilities/QRCode";
import { Event } from "@/hooks/useEvents";
import { type PerformanceUser } from "@/hooks/usePerformances";
import { GlobalContext } from "@/context/useGlobalContext";
import { InstagramIcon } from "@/components/utilities/SocialMediaIcons";
import { apiUrl } from "@/lib/utils";
import { CalendarDays, Check, MapPin, Mic2, Pencil, Share2 } from "lucide-react";

type EventDetailsCardProps = {
  eventDetails: Event;
  eventId: number;
  performances?: PerformanceUser[];
  canEdit?: boolean;
  canComplete?: boolean;
  isCompleting?: boolean;
  onEdit?: () => void;
  onComplete?: () => void;
};

const formatEventDateTime = (dateString: string, language: "en" | "zh") => {
  const date = new Date(dateString);
  return date.toLocaleString(language === "zh" ? "zh-CN" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

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

export default memo(function EventDetailsCard({
  eventDetails,
  eventId,
  performances,
  canEdit = false,
  canComplete = false,
  isCompleting = false,
  onEdit,
  onComplete,
}: EventDetailsCardProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const { language, t } = useContext(GlobalContext);

  const topPerformer = useMemo(() => {
    if (!performances || performances.length === 0) return null;

    // Only consider performers with at least one like
    const performersWithLikes = performances.filter(
      (perf) => (perf.likes || 0) > 0,
    );
    if (performersWithLikes.length === 0) return null;

    // Find performer with most likes (first one wins in case of tie)
    let maxPerformer = performersWithLikes[0];
    for (const perf of performersWithLikes) {
      if ((perf.likes || 0) > (maxPerformer.likes || 0)) {
        maxPerformer = perf;
      }
    }

    return maxPerformer;
  }, [performances]);

  const topPerformerSocialMedia = useMemo(() => {
    if (!topPerformer?.social_medias) return "";

    if (typeof topPerformer.social_medias === "string") {
      return topPerformer.social_medias.trim();
    }

    if (
      typeof topPerformer.social_medias === "object" &&
      topPerformer.social_medias !== null
    ) {
      return (Object.values(topPerformer.social_medias)[0] as string) || "";
    }

    return "";
  }, [topPerformer]);

  const showTopPerformerIg =
    topPerformerSocialMedia && isInstagramHandle(topPerformerSocialMedia);

  return (
    <>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 sm:gap-4 items-start">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                {eventDetails.title}
              </h1>
              <button
                onClick={() => setShowQRModal(true)}
                className="p-1 hover:opacity-70 transition-opacity flex-shrink-0"
                title={t("eventDetails.share")}
                aria-label={t("eventDetails.share")}
              >
                <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-1 text-xs sm:text-sm text-gray-700">
              <div className="flex items-start">
                <CalendarDays className="mr-2 h-4 w-4 flex-shrink-0 text-gray-500 sm:h-5 sm:w-5" aria-hidden="true" />
                <span className="break-words">
                  {formatEventDateTime(eventDetails.start_date, language)}
                </span>
              </div>
              <div className="flex items-start">
                <MapPin className="mr-2 h-4 w-4 flex-shrink-0 text-gray-500 sm:h-5 sm:w-5" aria-hidden="true" />
                <span className="break-words">{eventDetails.location}</span>
              </div>
              {eventDetails.host_names?.trim() && (
                <div className="flex items-start">
                  <Mic2 className="mr-2 h-4 w-4 flex-shrink-0 text-gray-500 sm:h-5 sm:w-5" aria-hidden="true" />
                  <span className="break-words">{eventDetails.host_names}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 min-w-[44px]">
            {topPerformer && (
              <div className="text-right">
                <div className="text-2xl mb-1">🏅</div>
                <div className="flex items-center justify-end gap-1 mb-1">
                  {showTopPerformerIg ? (
                    <a
                      href={`https://instagram.com/${topPerformerSocialMedia}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-semibold text-pink-600 hover:text-pink-700 hover:underline break-words max-w-[120px]"
                    >
                      @{topPerformerSocialMedia}
                    </a>
                  ) : (
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 break-words max-w-[120px]">
                      {topPerformer.performers}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {topPerformer.likes}{" "}
                  {topPerformer.likes === 1
                    ? t("eventDetails.like")
                    : t("eventDetails.likes")}
                </div>
              </div>
            )}

            {(canEdit || canComplete) && (
              <div className="flex gap-2">
                {canComplete && (
                  <button
                    type="button"
                    onClick={onComplete}
                    disabled={isCompleting}
                    className="p-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={t("eventDetails.completeEvent")}
                    title={
                      isCompleting
                        ? t("eventDetails.completing")
                        : t("eventDetails.completeEvent")
                    }
                  >
                    <Check className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
                {canEdit && (
                  <button
                    type="button"
                    onClick={onEdit}
                    className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                    aria-label={t("common.edit")}
                    title={t("common.edit")}
                  >
                    <Pencil className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showQRModal && (
        <Modal>
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {t("eventDetails.qrTitle")}
            </h2>
            <p className="text-gray-600">{t("eventDetails.qrBody")}</p>
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <QRCode
                  url={`${typeof window !== "undefined" ? window.location.origin : ""}${apiUrl(`/performances?event_id=${eventId}`)}`}
                  size={256}
                />
              </div>
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
            >
              {t("eventDetails.close")}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
});
