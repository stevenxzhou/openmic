import { type Performance } from "@/api/performance";

type CurrentPerformanceCardProps = { 
    performance: Performance; 
    toggleSkipConfirmModal: (isShow: boolean) => void; 
};

const CurrentPerformanceCard: React.FC<CurrentPerformanceCardProps> = ({ performance, toggleSkipConfirmModal }) => {
    return (
        <div className="border-2 border-yellow-500 p-4 rounded">
          <h3 className="font-bold">{performance.username}</h3>
          <p className="text-gray-600">{performance.social_media_alias}</p>
          <p className="mt-2">{performance.songs.toString()}</p>
          <div className="bottom-2 right-2 text-right">
            <button
              className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded"
              aria-label="Moveup performer"
              onClick={() => toggleSkipConfirmModal(true)}
            >
              Skip
            </button>
          </div>
        </div>
    )}

export default CurrentPerformanceCard;