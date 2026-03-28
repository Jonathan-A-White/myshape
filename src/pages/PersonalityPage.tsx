import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProgressBar } from "@/components/data-display/ProgressBar";
import { TraitGroupSelector } from "@/components/forms/TraitGroupSelector";
import { personalityTraitGroups } from "@/core/staticData";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useAutoSave } from "@/hooks/useAutoSave";

const TOTAL_GROUPS = personalityTraitGroups.length;

function findResumeIndex(groups: Record<string, { most: number; least: number }>): number {
  const completedCount = Object.keys(groups).length;
  if (completedCount === 0) return 0;
  // Find the first incomplete group
  for (let i = 0; i < TOTAL_GROUPS; i++) {
    if (!groups[String(personalityTraitGroups[i].id)]) return i;
  }
  // All done, stay on last group
  return TOTAL_GROUPS - 1;
}

export function PersonalityPage() {
  const navigate = useNavigate();
  const { currentAssessment } = useAssessment();
  const { save, saveImmediate } = useAutoSave(currentAssessment?.id);

  // Track groups in local state to avoid stale reads from the DB during rapid selections
  const [groups, setGroups] = useState<Record<string, { most: number; least: number }>>(
    () => currentAssessment?.personality?.groups ?? {},
  );
  const groupsRef = useRef(groups);
  groupsRef.current = groups;

  // Sync from DB on first load (when assessment becomes available)
  const initializedRef = useRef(false);
  useEffect(() => {
    if (currentAssessment && !initializedRef.current) {
      const dbGroups = currentAssessment.personality?.groups ?? {};
      setGroups(dbGroups);
      groupsRef.current = dbGroups;
      initializedRef.current = true;
    }
  }, [currentAssessment]);

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  // Initialize currentIndex to resume position once groups are loaded
  useEffect(() => {
    if (currentIndex === null && initializedRef.current) {
      setCurrentIndex(findResumeIndex(groupsRef.current));
    }
  }, [currentIndex, groups]);

  if (currentAssessment && currentAssessment.personality.status === "not_started") {
    saveImmediate({ personality: { ...currentAssessment.personality, status: "in_progress" } });
  }

  // Show loading until index is ready
  if (currentIndex === null || !currentAssessment) {
    return (
      <div>
        <PageHeader title="Personality" backTo="/assessment" />
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          {currentAssessment ? "Loading..." : "No active assessment found."}
        </div>
      </div>
    );
  }

  const currentGroup = personalityTraitGroups[currentIndex];
  const groupKey = String(currentGroup.id);

  const currentSelection = groups[groupKey] as { most: number; least: number } | undefined;
  const currentMost = currentSelection?.most;
  const currentLeast = currentSelection?.least;

  // Count completed groups
  const completedCount = Object.keys(groups).length;

  const handleChange = (most: number | undefined, least: number | undefined) => {
    if (most !== undefined && least !== undefined) {
      const updated = { ...groupsRef.current, [groupKey]: { most, least } };
      setGroups(updated);
      groupsRef.current = updated;
      save({ personality: { status: "in_progress" as const, groups: updated } });

      // Auto-advance after 300ms
      setTimeout(() => {
        if (currentIndex < TOTAL_GROUPS - 1) {
          setCurrentIndex((prev) => (prev ?? 0) + 1);
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
        const updated = { ...groupsRef.current };
        delete updated[groupKey];
        setGroups(updated);
        groupsRef.current = updated;
        save({ personality: { status: "in_progress" as const, groups: updated } });
      }
    }
  };

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
