import React, { useState } from "react";
import usePerformances from "@/hooks/usePerformances";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

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

  // Form state
  const [performer, setPerformer] = useState("");
  const [songs, setSongs] = useState("");
  const { performances, addPerformance } = usePerformances(eventId);

  // Add performance handler
  const addPerformanceHandler = async () => {
    if (!performer || !songs) {
      alert("Please fill all fields");
      return;
    }

    const songList = songs
      .split(",")
      .map((song) => song.trim())
      .filter(Boolean);

    if (songList.length === 0) {
      alert("Please enter at least one song");
      return;
    }

    let newPerformance = {
      event_id: eventId,
      performance_index: (performances.length + 1) * 10,
      songs: songList,
      status: "PENDING",
      first_name: performer,
      last_name: "",
      social_media_alias: "",
    };

    const isAdded = await addPerformance(eventId, newPerformance);
    if (!isAdded) return;

    onAdded?.();

    if (isModal && onClose) {
      onClose();
      return;
    }
    router.back();
  };

  return (
    <>
      {!isModal && <Header showBackButton />}
      <div
        className={`${
          isModal ? "min-h-0" : "min-h-[calc(100vh-64px)]"
        } flex items-center justify-center p-0 sm:p-4`}
      >
        <div className="w-full max-w-md bg-white border rounded-lg p-4 sm:p-6 space-y-4">
          <div>
            <label className="block mb-1 font-medium">Performers</label>
            <input
              type="text"
              value={performer}
              onChange={(e) => setPerformer(e.target.value)}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
              placeholder="Performer name"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Songs</label>
            <input
              type="text"
              value={songs}
              onChange={(e) => setSongs(e.target.value)}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 outline-none"
              placeholder="Song 1, Song 2"
            />
          </div>

          {isModal && (
            <button
              onClick={onClose}
              className="w-full py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded"
            >
              Cancel
            </button>
          )}

          <button
            onClick={addPerformanceHandler}
            className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
          >
            Add
          </button>
        </div>
      </div>
    </>
  );
};

export default SignUpView;
