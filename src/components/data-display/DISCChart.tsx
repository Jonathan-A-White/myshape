import type { DISCScores } from "@/core/disc";

interface DISCChartProps {
  scores: DISCScores;
}

const colors = {
  D: { bg: "bg-disc-d", text: "text-disc-d" },
  I: { bg: "bg-disc-i", text: "text-disc-i" },
  S: { bg: "bg-disc-s", text: "text-disc-s" },
  C: { bg: "bg-disc-c", text: "text-disc-c" },
};

export function DISCChart({ scores }: DISCChartProps) {
  const maxVal = 24;
  return (
    <div className="space-y-4">
      {(["D", "I", "S", "C"] as const).map((type) => (
        <div key={type}>
          <div className="mb-1 flex items-center justify-between">
            <span className={`text-lg font-bold ${colors[type].text}`}>{type}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              M:{scores[type].most} L:{scores[type].least} Diff:{scores[type].difference}
            </span>
          </div>
          <div className="h-6 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full rounded-full ${colors[type].bg} transition-all`}
              style={{ width: `${(scores[type].most / maxVal) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
