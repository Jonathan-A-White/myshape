import { memo } from "react";

type GroupStatus = "completed" | "skipped" | "current" | "pending";

interface GroupDotIndicatorProps {
  total: number;
  currentIndex: number;
  completedKeys: Set<string>;
  groupIds: string[];
}

export const GroupDotIndicator = memo(function GroupDotIndicator({
  total,
  currentIndex,
  completedKeys,
  groupIds,
}: GroupDotIndicatorProps) {
  const getStatus = (index: number): GroupStatus => {
    if (index === currentIndex) return "current";
    if (completedKeys.has(groupIds[index])) return "completed";
    if (index < currentIndex) return "skipped";
    return "pending";
  };

  const dotClass: Record<GroupStatus, string> = {
    completed: "bg-primary",
    skipped: "bg-amber-400 dark:bg-amber-500",
    current: "bg-white border-2 border-primary",
    pending: "bg-gray-300 dark:bg-gray-600",
  };

  const skippedCount = groupIds.filter(
    (id, i) => i < currentIndex && !completedKeys.has(id),
  ).length;

  return (
    <div className="mt-3">
      <div className="flex justify-center gap-1.5 flex-wrap">
        {Array.from({ length: total }, (_, i) => {
          const status = getStatus(i);
          return (
            <div
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${dotClass[status]}`}
              title={`Group ${i + 1}: ${status}`}
            />
          );
        })}
      </div>
      {skippedCount > 0 && (
        <p className="mt-2 text-center text-xs text-amber-500 dark:text-amber-400">
          {skippedCount} skipped {skippedCount === 1 ? "group" : "groups"}
        </p>
      )}
    </div>
  );
});
