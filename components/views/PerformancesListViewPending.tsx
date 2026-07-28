import { useMemo, useContext, useEffect, useState } from "react";
import PerformanceCard from "@/components/cards/PerformanceCard";
import { PerformanceStatus, PerformanceUser } from "@/hooks/usePerformances";
import PerformancesListViewContainer from "@/components/views/PerformancesListViewContainer";
import { GlobalContext } from "@/context/useGlobalContext";
import { SortableContainer, SortableElement } from "react-sortable-hoc";

const moveArrayItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const updatedItems = [...items];
  const [movedItem] = updatedItems.splice(fromIndex, 1);
  updatedItems.splice(toIndex, 0, movedItem);
  return updatedItems;
};

type SortablePerformanceItemProps = {
  performance: PerformanceUser;
  cardIndex: number;
  displayNumber: number;
  showActions: boolean;
  onComplete?: (performance: PerformanceUser) => void;
  onDelete?: (performance: PerformanceUser) => void;
  onEdit?: (performance: PerformanceUser) => void;
};

const SortablePerformanceItem = SortableElement<SortablePerformanceItemProps>(
  (props: SortablePerformanceItemProps) => {
    const {
      performance,
      cardIndex,
      displayNumber,
      showActions,
      onComplete,
      onDelete,
      onEdit,
    } = props;

    return (
      <div>
        <PerformanceCard
          performance={performance}
          index={cardIndex}
          displayNumber={displayNumber}
          showWaitTime={true}
          showActions={showActions}
          onComplete={onComplete}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </div>
    );
  },
);

type SortablePerformanceListProps = {
  items: PerformanceUser[];
  currentPerformanceIndex: number;
  eventStatus?: string;
  showActions: boolean;
  onComplete?: (performance: PerformanceUser) => void;
  onDelete?: (performance: PerformanceUser) => void;
  onEdit?: (performance: PerformanceUser) => void;
};

const SortablePerformanceList = SortableContainer<SortablePerformanceListProps>(
  (props: SortablePerformanceListProps) => {
    const {
      items,
      currentPerformanceIndex,
      eventStatus,
      showActions,
      onComplete,
      onDelete,
      onEdit,
    } = props;

    return (
      <div className="space-y-4">
        {items.map((performance: PerformanceUser, idx: number) => {
          const indexOffset = eventStatus === "NEW" ? 1 : 0;
          const cardIndex = currentPerformanceIndex + idx + indexOffset;

          return (
            <SortablePerformanceItem
              key={performance.performance_id}
              index={idx}
              performance={performance}
              cardIndex={cardIndex}
              displayNumber={currentPerformanceIndex + idx + 1}
              showActions={showActions}
              onComplete={onComplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          );
        })}
      </div>
    );
  },
);

type Props = {
  performances: PerformanceUser[];
  currentPerformanceIndex: number;
  title: string;
  eventId: number;
  toggleSkipConfirmModal: any;
  onComplete?: (performance: PerformanceUser) => void;
  onDelete?: (performance: PerformanceUser) => void;
  onEdit?: (performance: PerformanceUser) => void;
  onReorder?: (
    oldIndex: number,
    newIndex: number,
    orderedPerformanceIds: number[],
  ) => Promise<void> | void;
  eventStatus?: string;
  isAdminOrHost?: boolean;
  onStartEvent?: () => void;
  isStartingEvent?: boolean;
  isReordering?: boolean;
};

export default function PerformancesView({
  performances,
  currentPerformanceIndex,
  title,
  eventId,
  toggleSkipConfirmModal,
  onComplete,
  onDelete,
  onEdit,
  onReorder,
  eventStatus,
  isAdminOrHost,
  onStartEvent,
  isStartingEvent,
  isReordering,
}: Props) {
  const { t } = useContext(GlobalContext);

  const sortedPerformances = useMemo(
    () =>
      [...performances]
        .filter(
          (performance) => performance.status === PerformanceStatus.PENDING,
        )
        .sort(
          (a, b) => (a.performance_index ?? 0) - (b.performance_index ?? 0),
        ),
    [performances],
  );

  const [orderedPerformances, setOrderedPerformances] =
    useState<PerformanceUser[]>(sortedPerformances);

  useEffect(() => {
    setOrderedPerformances(sortedPerformances);
  }, [sortedPerformances]);

  const showActions = Boolean(onComplete || onDelete);
  const canSort = Boolean(
    isAdminOrHost &&
    onReorder &&
    orderedPerformances.length > 1 &&
    !isReordering,
  );

  const handleSortEnd = async ({
    oldIndex,
    newIndex,
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    if (oldIndex === newIndex) return;

    const reorderedItems = moveArrayItem(
      orderedPerformances,
      oldIndex,
      newIndex,
    );
    setOrderedPerformances(reorderedItems);

    if (!onReorder) return;

    const orderedPerformanceIds = orderedPerformances.map(
      (performance) => performance.performance_id ?? -1,
    );

    try {
      await onReorder(oldIndex, newIndex, orderedPerformanceIds);
    } catch {
      setOrderedPerformances(sortedPerformances);
    }
  };

  return (
    <PerformancesListViewContainer
      title={title}
      hasItems={sortedPerformances.slice(currentPerformanceIndex).length > 0}
      emptyState={
        <div className="border p-4 rounded text-center text-gray-500">
          {t("performances.noQueue")}
        </div>
      }
    >
      <div className="space-y-4">
        {eventStatus === "NEW" && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-center font-semibold text-yellow-800">
                  {t("performances.eventNotStarted")}
                </p>
              </div>
              {isAdminOrHost && (
                <button
                  type="button"
                  onClick={onStartEvent}
                  disabled={Boolean(isStartingEvent)}
                  className="rounded bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isStartingEvent
                    ? t("performances.starting")
                    : t("performances.startEvent")}
                </button>
              )}
            </div>
          </div>
        )}

        {canSort ? (
          <SortablePerformanceList
            items={orderedPerformances}
            currentPerformanceIndex={currentPerformanceIndex}
            eventStatus={eventStatus}
            showActions={showActions}
            onComplete={onComplete}
            onDelete={onDelete}
            onEdit={onEdit}
            onSortEnd={handleSortEnd}
            axis="y"
            lockAxis="y"
            pressDelay={120}
            helperClass="z-50"
          />
        ) : (
          orderedPerformances.map((performance, idx) => {
            const indexOffset = eventStatus === "NEW" ? 1 : 0;
            const index = currentPerformanceIndex + idx + indexOffset;
            return (
              <div key={performance.performance_id}>
                <PerformanceCard
                  performance={performance}
                  index={index}
                  displayNumber={currentPerformanceIndex + idx + 1}
                  showWaitTime={true}
                  showActions={showActions}
                  onComplete={onComplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              </div>
            );
          })
        )}
      </div>
    </PerformancesListViewContainer>
  );
}
