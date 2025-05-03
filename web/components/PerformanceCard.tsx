import { type PerformanceUser } from "@/api/performance";

type PerformanceCardProps = { 
    performance: PerformanceUser; 
    index: number; 
    calculateWaitTime: (index: number) => string; 
    performanceHandler: (performance: PerformanceUser, index: number) => void; 
    showCardBtn: boolean;
    cardBtnText: string;
};

const PerformanceCard: React.FC<PerformanceCardProps> = ({ performance, index, calculateWaitTime, performanceHandler, showCardBtn, cardBtnText }) => {
    return (
        <div key={performance.performance_id} className="border p-4 rounded">
            <h3 className="font-bold">{performance.first_name}</h3>
            <p className="text-gray-600">{performance.social_media_alias}</p>
            <p className="mt-2">{performance.songs.toString()}</p>
            <p className="text-sm text-gray-500 mt-1">Est. wait: {calculateWaitTime(index)}</p>
            {showCardBtn ? (
            <div className="bottom-2 right-2 text-right">
                <button
                    className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded"
                    aria-label="Moveup performer"
                    onClick={() => performanceHandler(performance, index)}
                >
                    { cardBtnText }
                </button>
            </div>
            ) : (
            <></>
            )}
        </div>        
    );
}

export default PerformanceCard;