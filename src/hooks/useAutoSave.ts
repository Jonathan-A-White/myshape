import { useRef, useEffect, useCallback } from "react";
import { assessmentRepo } from "@/db/repositories/assessmentRepo";
import type { Assessment } from "@/contracts/types";

export function useAutoSave(assessmentId: string | undefined, delay = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const save = useCallback(
    (changes: Partial<Assessment>) => {
      if (!assessmentId) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        assessmentRepo.update(assessmentId, changes);
      }, delay);
    },
    [assessmentId, delay],
  );

  const saveImmediate = useCallback(
    (changes: Partial<Assessment>) => {
      if (!assessmentId) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      assessmentRepo.update(assessmentId, changes);
    },
    [assessmentId],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { save, saveImmediate };
}
