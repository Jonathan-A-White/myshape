import { useState } from "react";

interface ChipGridProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxCount: number;
  allowOther?: boolean;
}

export function ChipGrid({ options, selected, onChange, maxCount, allowOther = false }: ChipGridProps) {
  const [otherText, setOtherText] = useState("");

  const isMaxReached = selected.length >= maxCount;

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter(s => s !== item));
    } else if (!isMaxReached) {
      onChange([...selected, item]);
    }
  };

  const addOther = () => {
    if (otherText.trim() && !isMaxReached && !selected.includes(otherText.trim())) {
      onChange([...selected, otherText.trim()]);
      setOtherText("");
    }
  };

  return (
    <div>
      <p className="mb-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
        {selected.length} of {maxCount} selected
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map(option => {
          const isSelected = selected.includes(option);
          const isDisabled = !isSelected && isMaxReached;
          return (
            <button
              key={option}
              onClick={() => toggle(option)}
              disabled={isDisabled}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? "bg-primary text-white shadow-md"
                  : isDisabled
                    ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {option}
            </button>
          );
        })}
        {/* Show custom "Other" items that aren't in the options list */}
        {selected.filter(s => !options.includes(s)).map(custom => (
          <button
            key={custom}
            onClick={() => toggle(custom)}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-md"
          >
            {custom} ✕
          </button>
        ))}
      </div>
      {allowOther && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={otherText}
            onChange={e => setOtherText(e.target.value)}
            placeholder="Other..."
            disabled={isMaxReached}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            onKeyDown={e => { if (e.key === "Enter") addOther(); }}
          />
          <button
            onClick={addOther}
            disabled={isMaxReached || !otherText.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
