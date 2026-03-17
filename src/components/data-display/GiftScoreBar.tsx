interface GiftScoreBarProps {
  letter: string;
  name: string;
  total: number;
  maxScore: number;
  isTop3: boolean;
}

export function GiftScoreBar({
  letter,
  name,
  total,
  maxScore,
  isTop3,
}: GiftScoreBarProps) {
  const percentage = (total / maxScore) * 100;
  return (
    <div
      className={`flex items-center gap-3 rounded-lg p-2 ${isTop3 ? "bg-green-50 dark:bg-green-900/20" : ""}`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isTop3
            ? "bg-gift-high text-white"
            : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {letter}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between text-sm">
          <span
            className={`truncate font-medium ${isTop3 ? "text-gift-high" : "text-gray-700 dark:text-gray-300"}`}
          >
            {name}
          </span>
          <span
            className={`ml-2 shrink-0 font-bold ${isTop3 ? "text-gift-high" : "text-gray-500 dark:text-gray-400"}`}
          >
            {total}
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full rounded-full transition-all ${isTop3 ? "bg-gift-high" : "bg-gray-400 dark:bg-gray-500"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
