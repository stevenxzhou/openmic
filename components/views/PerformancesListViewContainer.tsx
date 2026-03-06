import { ReactNode, useEffect, useRef } from "react";

type PerformancesViewContainerProps = {
  title: string;
  children: ReactNode;
  scrollToBottomSignal?: number;
  enableAutoScrollToBottom?: boolean;
  emptyState?: ReactNode;
  hasItems: boolean;
};

export default function PerformancesViewContainer({
  title,
  children,
  scrollToBottomSignal,
  enableAutoScrollToBottom = false,
  emptyState,
  hasItems,
}: PerformancesViewContainerProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enableAutoScrollToBottom || scrollToBottomSignal === undefined) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [enableAutoScrollToBottom, scrollToBottomSignal]);

  return (
    <div className="mb-6">
      <div className="w-full text-lg font-semibold text-gray-600 mb-2">
        <span>{title}</span>
      </div>
      <div ref={listRef} className="max-h-[calc(100vh-350px)] overflow-y-auto">
        {hasItems
          ? children
          : emptyState || (
              <div className="border p-4 rounded text-center text-gray-500">
                No one in queue
              </div>
            )}
      </div>
    </div>
  );
}
