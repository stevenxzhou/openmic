import { ReactNode } from "react";
import { useGlobalContext } from "@/context/useGlobalContext";

type PerformancesViewContainerProps = {
  title: string;
  children: ReactNode;
  emptyState?: ReactNode;
  hasItems: boolean;
};

export default function PerformancesViewContainer({
  title,
  children,
  emptyState,
  hasItems,
}: PerformancesViewContainerProps) {
  const { t } = useGlobalContext();

  return (
    <div className="mb-6">
      <div className="w-full text-lg font-semibold text-gray-600 mb-2">
        <span>{title}</span>
      </div>
      <div>
        {hasItems
          ? children
          : emptyState || (
              <div className="border p-4 rounded text-center text-gray-500">
                {t("performances.noQueue")}
              </div>
            )}
      </div>
    </div>
  );
}
