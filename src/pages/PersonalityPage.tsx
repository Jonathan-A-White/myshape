import { useState, useEffect, useRef } from "react";
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
  const { saveImmediate } = useAutoSave(currentAssessment?.id);

  // Track groups in local state to avoid stale reads from the DB during rapid selections
  const [groups, setGroups] = useState<Record<string, { most: number; least: number }>>(
    () => currentAssessment?.personality?.groups ?? {},
  );
  const groupsRef = useRef(groups);
  useEffect(() => {
    groupsRef.current = groups;
  }, [groups]);

  const [currentIndex, setCurrentIndex] = useState<number>(
    () => currentAssessment?.personality?.lastIndex ?? 0,
  );

  // Sync from DB when assessment first becomes available (set-state-during-render pattern)
  const [syncedId, setSyncedId] = useState<string | undefined>(undefined);
  if (currentAssessment && currentAssessment.id !== syncedId) {
    const dbGroups = currentAssessment.personality?.groups ?? {};
    setGroups(dbGroups);
    setCurrentIndex(currentAssessment.personality?.lastIndex ?? 0);
    setSyncedId(currentAssessment.id);
  }

  // Mark personality as in_progress once on mount.
  // Uses groupsRef (local state) instead of currentAssessment.personality to avoid
  // overwriting selections if the effect fires after a rapid user interaction.
  const statusInitRef = useRef(false);
  useEffect(() => {
    if (currentAssessment && currentAssessment.personality.status === "not_started" && !statusInitRef.current) {
      statusInitRef.current = true;
      saveImmediate({
        personality: {
          status: "in_progress",
          groups: groupsRef.current,
          lastIndex: currentAssessment.personality?.lastIndex ?? 0,
        },
      });
    }
  }, [currentAssessment, saveImmediate]);

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

      const nextIndex = currentIndex < TOTAL_GROUPS - 1 ? currentIndex + 1 : currentIndex;
      const allDone = Object.keys(updated).length >= TOTAL_GROUPS;

      // Save immediately - selections are discrete events, no need for debouncing
      saveImmediate({
        personality: {
          status: allDone ? "complete" : "in_progress" as const,
          groups: updated,
          lastIndex: nextIndex,
        },
      });

      // Auto-advance after 300ms
      setTimeout(() => {
        if (allDone && currentIndex === TOTAL_GROUPS - 1) {
          navigate("/assessment/personality/results");
        } else if (currentIndex < TOTAL_GROUPS - 1) {
          setCurrentIndex(nextIndex);
        }
      }, 300);
    } else {
      // Partial selection or deselection - update local state immediately
      if (most === undefined || least === undefined) {
        const updated = { ...groupsRef.current };
        const wasComplete = groupKey in updated;
        delete updated[groupKey];
        setGroups(updated);
        groupsRef.current = updated;
        // Only persist to DB when actually removing a previously completed group.
        // Skipping the save on first-tap (MOST) eliminates a race where this
        // empty-groups write could overwrite a subsequent complete-selection save.
        if (wasComplete) {
          saveImmediate({
            personality: {
              status: "in_progress" as const,
              groups: updated,
              lastIndex: currentIndex,
            },
          });
        }
      }
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      saveImmediate({
        personality: {
          status: currentAssessment.personality.status,
          groups: groupsRef.current,
          lastIndex: newIndex,
        },
      });
    }
  };

  const goForward = () => {
    if (currentIndex < TOTAL_GROUPS - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      saveImmediate({
        personality: {
          status: currentAssessment.personality.status,
          groups: groupsRef.current,
          lastIndex: newIndex,
        },
      });
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
