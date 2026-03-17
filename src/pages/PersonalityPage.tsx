import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProgressBar } from "@/components/data-display/ProgressBar";
import { TraitGroupSelector } from "@/components/forms/TraitGroupSelector";
import { personalityTraitGroups } from "@/core/staticData";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useAutoSave } from "@/hooks/useAutoSave";

const TOTAL_GROUPS = personalityTraitGroups.length;

export function PersonalityPage() {
  const navigate = useNavigate();
  const { currentAssessment } = useAssessment();
  const { save, saveImmediate } = useAutoSave(currentAssessment?.id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const groups = useMemo(() => currentAssessment?.personality?.groups ?? {}, [currentAssessment?.personality?.groups]);

  if (currentAssessment && currentAssessment.personality.status === "not_started") {
    saveImmediate({ personality: { ...currentAssessment.personality, status: "in_progress" } });
  }

  const currentGroup = personalityTraitGroups[currentIndex];
  const groupKey = String(currentGroup.id);

  const currentSelection = groups[groupKey] as { most: number; least: number } | undefined;
  const currentMost = currentSelection?.most;
  const currentLeast = currentSelection?.least;

  // Count completed groups
  const completedCount = Object.keys(groups).length;

  const handleChange = useCallback(
    (most: number | undefined, least: number | undefined) => {
      if (most !== undefined && least !== undefined) {
        const updated = { ...groups, [groupKey]: { most, least } };
        save({ personality: { status: "in_progress" as const, groups: updated } });

        // Auto-advance after 300ms
        setTimeout(() => {
          if (currentIndex < TOTAL_GROUPS - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            // All groups done - check completion
            const allDone = Object.keys(updated).length >= TOTAL_GROUPS;
            if (allDone) {
              saveImmediate({ personality: { status: "complete", groups: updated } });
              navigate("/assessment/personality/results");
            }
          }
        }, 300);
      } else {
        // Partial selection or deselection - remove from groups if incomplete
        if (most === undefined || least === undefined) {
          const updated = { ...groups };
          delete updated[groupKey];
          save({ personality: { status: "in_progress" as const, groups: updated } });
        }
      }
    },
    [groups, groupKey, currentIndex, save, saveImmediate, navigate],
  );

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goForward = () => {
    if (currentIndex < TOTAL_GROUPS - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!currentAssessment) {
    return (
      <div>
        <PageHeader title="Personality" backTo="/assessment" />
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No active assessment found.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Personality" backTo="/assessment" />
      <div className="p-4">
        <ProgressBar current={completedCount} total={TOTAL_GROUPS} label={`Group ${currentIndex + 1} of ${TOTAL_GROUPS}`} />

        <div className="mt-2 mb-4 text-center text-xs text-gray-400 dark:text-gray-500">
          {completedCount} of {TOTAL_GROUPS} completed
        </div>

        <div className="mx-auto max-w-lg">
          <TraitGroupSelector
            key={currentGroup.id}
            traits={currentGroup.traits}
            most={currentMost}
            least={currentLeast}
            onChange={handleChange}
          />
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={goBack}
            disabled={currentIndex === 0}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 dark:text-gray-400 dark:hover:text-white"
          >
            Previous
          </button>
          <button
            onClick={goForward}
            disabled={currentIndex === TOTAL_GROUPS - 1}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 dark:text-gray-400 dark:hover:text-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
