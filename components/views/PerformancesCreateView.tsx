import React, { useState, useEffect, useContext } from "react";
import usePerformances from "@/hooks/usePerformances";
import { useRouter } from "next/navigation";
import Header from "@/components/layouts/Header";
import Modal from "@/components/layouts/Modal";
import { SocialIcon } from "react-social-icons";
import { GlobalContext } from "@/context/useGlobalContext";

type SignUpViewProps = {
  eventId: number | string;
  isModal?: boolean;
  onClose?: () => void;
  onAdded?: () => void;
};

const SignUpView = ({
  eventId: rawEventId,
  isModal = false,
  onClose,
  onAdded,
}: SignUpViewProps) => {
  const router = useRouter();
  const eventId = parseInt(String(rawEventId), 10);
  const { user, t } = useContext(GlobalContext);

  // Check if user is admin or host
  const isAdminOrHost =
    user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "host";
  const storageKey = `performance_draft_${eventId}`;

  // Form state
  const [performer, setPerformer] = useState("");
  const [songs, setSongs] = useState("");
  const [inputs, setInputs] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [socialMediaError, setSocialMediaError] = useState("");
  const { performances, addPerformance } = usePerformances(eventId);

  // Load saved data from sessionStorage on mount (only for non-admin/non-host users)
  useEffect(() => {
    if (!isAdminOrHost && typeof window !== "undefined") {
      const savedData = sessionStorage.getItem(storageKey);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setPerformer(parsed.performer || "");
          setInputs(parsed.inputs || "");
          setSocialMedia(parsed.socialMedia || "");
          // Note: songs field is intentionally not loaded
        } catch (error) {
          console.error("Error loading saved performance data:", error);
        }
      }
    }
  }, [isAdminOrHost, storageKey]);

  // Save data to sessionStorage when form fields change (except songs)
  useEffect(() => {
    if (!isAdminOrHost && typeof window !== "undefined") {
      // Only save if at least one field has a value
      if (performer || inputs || socialMedia) {
        const dataToSave = {
          performer,
          inputs,
          socialMedia,
        };
        sessionStorage.setItem(storageKey, JSON.stringify(dataToSave));
      }
    }
  }, [performer, inputs, socialMedia, isAdminOrHost, storageKey]);

  // Validate Instagram handle format
  const isValidInstagramHandle = (value: string): boolean => {
    if (!value) return true; // Empty is okay (optional field)
    // Instagram handles: 1-30 characters, letters, numbers, periods, underscores
    // Can't start with a number
    const instagramRegex = /^[a-zA-Z_][a-zA-Z0-9_.]{0,29}$/;
    return instagramRegex.test(value);
  };

  // Handle social media input change
  const handleSocialMediaChange = (value: string) => {
    setSocialMedia(value);
    if (value && !isValidInstagramHandle(value)) {
      setSocialMediaError(t("signupView.invalidInstagram"));
    } else {
      setSocialMediaError("");
    }
  };

  // Add performance handler
  const addPerformanceHandler = async () => {
    if (!performer || !songs) {
      alert(t("signupView.fillAll"));
      return;
    }

    // Validate Instagram handle if provided
    if (socialMedia && !isValidInstagramHandle(socialMedia)) {
      alert(t("signupView.invalidInstagramBody"));
      return;
    }

    const songList = songs
      .split(",")
      .map((song) => song.trim())
      .filter(Boolean);

    if (songList.length === 0) {
      alert(t("signupView.oneSong"));
      return;
    }

    let newPerformance = {
      event_id: eventId,
      performance_index: (performances.length + 1) * 10,
      songs: songList,
      status: "PENDING",
      performers: performer,
      inputs: inputs,
      social_medias: socialMedia,
    };

    const isAdded = await addPerformance(eventId, newPerformance);
    if (!isAdded) return;

    onAdded?.();

    if (isModal) {
      return;
    }
    router.back();
  };

  const closeModal = () => {
    setSongs("");
    onClose?.();
  };

  return (
    <>
      {!isModal && <Header showBackButton />}
      {isModal ? (
        <Modal onClose={closeModal}>
          <>
            <div>
              <label className="block mb-1 font-medium">
                {t("signupView.performers")}
              </label>
              <input
                type="text"
                value={performer}
                onChange={(e) => setPerformer(e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                placeholder={t("signupView.placeholder.performer")}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                {t("signupView.songs")}
              </label>
              <input
                type="text"
                value={songs}
                onChange={(e) => setSongs(e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                placeholder={t("signupView.placeholder.songs")}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                {t("signupView.inputs")}
              </label>
              <input
                type="text"
                value={inputs}
                onChange={(e) => setInputs(e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                placeholder={t("signupView.placeholder.inputs")}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                {t("signupView.instagram")}
              </label>
              <div className="relative">
                {socialMedia && isValidInstagramHandle(socialMedia) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-pink-600">
                    <SocialIcon
                      url={`https://instagram.com/${socialMedia}`}
                      style={{ height: 20, width: 20 }}
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={socialMedia}
                  onChange={(e) => handleSocialMediaChange(e.target.value)}
                  className={`w-full p-3 pr-10 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none ${socialMediaError ? "border-red-500" : ""}`}
                  placeholder={t("signupView.placeholder.instagram")}
                />
              </div>
              {socialMediaError && (
                <p className="text-red-500 text-sm mt-1">{socialMediaError}</p>
              )}
            </div>

            <button
              onClick={addPerformanceHandler}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              {t("signupView.add")}
            </button>
          </>
        </Modal>
      ) : (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white border rounded-lg shadow-xl p-4 sm:p-6 space-y-4">
            <div>
              <label className="block mb-1 font-medium">
                {t("signupView.performers")}
              </label>
              <input
                type="text"
                value={performer}
                onChange={(e) => setPerformer(e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                placeholder={t("signupView.placeholder.performer")}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                {t("signupView.songs")}
              </label>
              <input
                type="text"
                value={songs}
                onChange={(e) => setSongs(e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                placeholder={t("signupView.placeholder.songs")}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                {t("signupView.inputs")}
              </label>
              <input
                type="text"
                value={inputs}
                onChange={(e) => setInputs(e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
                placeholder={t("signupView.placeholder.inputs")}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">
                {t("signupView.instagram")}
              </label>
              <div className="relative">
                {socialMedia && isValidInstagramHandle(socialMedia) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-pink-600">
                    <SocialIcon
                      url={`https://instagram.com/${socialMedia}`}
                      style={{ height: 20, width: 20 }}
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={socialMedia}
                  onChange={(e) => handleSocialMediaChange(e.target.value)}
                  className={`w-full p-3 pr-10 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none ${socialMediaError ? "border-red-500" : ""}`}
                  placeholder={t("signupView.placeholder.instagram")}
                />
              </div>
              {socialMediaError && (
                <p className="text-red-500 text-sm mt-1">{socialMediaError}</p>
              )}
            </div>

            <button
              onClick={addPerformanceHandler}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              {t("signupView.add")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SignUpView;
