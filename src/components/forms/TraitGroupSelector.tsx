import { useState } from "react";

interface TraitGroupSelectorProps {
  traits: string[];
  most: number | undefined;
  least: number | undefined;
  onChange: (most: number | undefined, least: number | undefined) => void;
}

export function TraitGroupSelector({ traits, most: initialMost, least: initialLeast, onChange }: TraitGroupSelectorProps) {
  const [most, setMost] = useState<number | undefined>(initialMost);
  const [least, setLeast] = useState<number | undefined>(initialLeast);

  const handleClick = (index: number) => {
    let newMost = most;
    let newLeast = least;

    if (most === undefined) {
      newMost = index;
    } else if (least === undefined && index !== most) {
      newLeast = index;
    } else if (index === most) {
      newMost = undefined;
    } else if (index === least) {
      newLeast = undefined;
    } else {
      newMost = index;
      newLeast = undefined;
    }

    setMost(newMost);
    setLeast(newLeast);
    onChange(newMost, newLeast);
  };

  return (
    <div className="space-y-3">
      <div className="mb-2 rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900/30">
        {most === undefined ? (
          <>
            <p className="text-base font-semibold text-blue-800 dark:text-blue-200">
              Select the trait MOST like you
            </p>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              You must pick both a MOST and a LEAST to continue
            </p>
          </>
        ) : least === undefined ? (
          <>
            <p className="text-base font-semibold text-blue-800 dark:text-blue-200">
              Now select the trait LEAST like you
            </p>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              You must pick both a MOST and a LEAST to continue
            </p>
          </>
        ) : (
          <p className="text-base font-semibold text-green-700 dark:text-green-300">
            Both selected! Tap to change.
          </p>
        )}
      </div>
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
