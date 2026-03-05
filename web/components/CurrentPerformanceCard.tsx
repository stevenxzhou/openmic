import { type PerformanceUser } from "@/api/performance";
import PerformanceCardContainer from "./PerformanceCardContainer";

type CurrentPerformanceCardProps = {
  performance: PerformanceUser;
  toggleSkipConfirmModal: (isShow: boolean) => void;
};

const CurrentPerformanceCard: React.FC<CurrentPerformanceCardProps> = ({
  performance,
  toggleSkipConfirmModal,
}) => {
  return (
    <PerformanceCardContainer performance={performance}>
      <button
        className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded"
        aria-label="Moveup performer"
        onClick={() => toggleSkipConfirmModal(true)}
      >
        Skip
      </button>
    </PerformanceCardContainer>
  );
};

export default CurrentPerformanceCard;
