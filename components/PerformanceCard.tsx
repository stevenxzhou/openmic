import { type PerformanceUser } from "@/hooks/usePerformances";
import PerformanceCardContainer from "./PerformanceCardContainer";

type PerformanceCardProps = {
  performance: PerformanceUser;
  index: number;
  calculateWaitTime: (index: number) => string;
  showWaitTime?: boolean;
  showActions?: boolean;
  isHighlighted?: boolean;
  onComplete?: (performance: PerformanceUser) => void;
  onDelete?: (performance: PerformanceUser) => void;
};

const PerformanceCard: React.FC<PerformanceCardProps> = ({
  performance,
  index,
  calculateWaitTime,
  showWaitTime = true,
  showActions = false,
  isHighlighted = false,
  onComplete,
  onDelete,
}) => {
  return (
    <>
      <PerformanceCardContainer
        performance={performance}
        className={isHighlighted ? "blink-once-bg" : ""}
      >
        {showWaitTime && (
          <p className="text-sm text-gray-500 mt-1">
            Est. wait: {calculateWaitTime(index)}
          </p>
        )}

        {showActions && (onComplete || onDelete) && (
          <div className="bottom-2 right-2 text-right flex gap-2 justify-end mt-2">
            {onComplete && (
              <button
                className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded"
                aria-label="Complete performance"
                onClick={() => onComplete(performance)}
                title="Complete"
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded"
                aria-label="Delete performance"
                onClick={() => onDelete(performance)}
                title="Delete"
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
            )}
          </div>
        )}
      </PerformanceCardContainer>
    </>
  );
};

export default PerformanceCard;
