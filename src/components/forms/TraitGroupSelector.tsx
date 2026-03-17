interface TraitGroupSelectorProps {
  traits: string[];
  most: number | undefined;
  least: number | undefined;
  onChange: (most: number | undefined, least: number | undefined) => void;
}

export function TraitGroupSelector({ traits, most, least, onChange }: TraitGroupSelectorProps) {
  const handleClick = (index: number) => {
    if (most === undefined) {
      // First pick = Most
      onChange(index, least);
    } else if (least === undefined && index !== most) {
      // Second pick = Least (can't be same as most)
      onChange(most, index);
    } else if (index === most) {
      // Clicking most again deselects it
      onChange(undefined, least);
    } else if (index === least) {
      // Clicking least again deselects it
      onChange(most, undefined);
    } else {
      // Both already set, clicking a third deselects both and starts over
      onChange(index, undefined);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        {most === undefined
          ? "Tap the trait MOST like you"
          : least === undefined
            ? "Now tap the trait LEAST like you"
            : "Both selected! Tap to change."}
      </p>
      {traits.map((trait, i) => {
        const isMost = most === i;
        const isLeast = least === i;
        return (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`w-full rounded-lg border-2 p-4 text-left text-sm font-medium transition-all ${
              isMost
                ? "border-green-500 bg-green-50 text-green-800 dark:border-green-400 dark:bg-green-900/30 dark:text-green-300"
                : isLeast
                  ? "border-red-400 bg-red-50 text-red-800 dark:border-red-400 dark:bg-red-900/30 dark:text-red-300"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{trait}</span>
              {isMost && (
                <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">M</span>
              )}
              {isLeast && (
                <span className="rounded-full bg-red-400 px-2 py-0.5 text-xs font-bold text-white">L</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
