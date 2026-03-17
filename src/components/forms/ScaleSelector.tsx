interface ScaleSelectorProps {
  value: number | undefined;
  onChange: (value: number) => void;
}

export function ScaleSelector({ value, onChange }: ScaleSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold transition-all ${
              value === n
                ? "bg-primary text-white scale-110 shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex w-full justify-between px-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Never true</span>
        <span>Sometimes true</span>
        <span>Always true</span>
      </div>
    </div>
  );
}
