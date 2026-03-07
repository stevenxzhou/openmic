import { useContext, useMemo, useState } from "react";
import { GlobalContext } from "@/context/useGlobalContext";

type PerformancesChecklistViewProps = {
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  isStartingEvent: boolean;
};

export default function PerformancesChecklistView({
  onCancel,
  onConfirm,
  isStartingEvent,
}: PerformancesChecklistViewProps) {
  const { t } = useContext(GlobalContext);
  const checklistItems = useMemo(
    () => [
      t("performances.checklist.item1"),
      t("performances.checklist.item2"),
      t("performances.checklist.item3"),
      t("performances.checklist.item4"),
      t("performances.checklist.item5"),
    ],
    [t],
  );

  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    checklistItems.map(() => false),
  );

  const allChecked = checkedItems.every(Boolean);

  const toggleItem = (index: number) => {
    setCheckedItems((prev) =>
      prev.map((isChecked, itemIndex) =>
        itemIndex === index ? !isChecked : isChecked,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">
          {t("performances.checklist.title")}
        </h2>
        <p className="text-sm text-gray-600">
          {t("performances.checklist.body")}
        </p>
      </div>

      <div className="space-y-3">
        {checklistItems.map((item, index) => (
          <label
            key={item}
            className="flex items-start gap-3 rounded border border-gray-200 p-3 hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={checkedItems[index]}
              onChange={() => toggleItem(index)}
              className="mt-1 h-4 w-4"
              disabled={isStartingEvent}
            />
            <span className="text-sm text-gray-700">{item}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 justify-center pt-1">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded"
          disabled={isStartingEvent}
        >
          {t("common.cancel")}
        </button>
        <button
          onClick={onConfirm}
          disabled={!allChecked || isStartingEvent}
          className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStartingEvent
            ? t("performances.starting")
            : t("performances.startEvent")}
        </button>
      </div>
    </div>
  );
}
