import { useRef, useEffect, useCallback } from "react";
import { assessmentRepo } from "@/db/repositories/assessmentRepo";
import type { Assessment } from "@/contracts/types";

export function useAutoSave(assessmentId: string | undefined, delay = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingRef = useRef<{ id: string; changes: Partial<Assessment> } | undefined>(undefined);

  const flush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (pendingRef.current) {
      assessmentRepo.update(pendingRef.current.id, pendingRef.current.changes);
      pendingRef.current = undefined;
    }
  }, []);

  const save = useCallback(
    (changes: Partial<Assessment>) => {
      if (!assessmentId) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      pendingRef.current = { id: assessmentId, changes };
      timerRef.current = setTimeout(() => {
        assessmentRepo.update(assessmentId, changes);
        pendingRef.current = undefined;
      }, delay);
    },
    [assessmentId, delay],
  );

  const saveImmediate = useCallback(
    (changes: Partial<Assessment>) => {
      if (!assessmentId) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      pendingRef.current = undefined;
      assessmentRepo.update(assessmentId, changes);
    },
    [assessmentId],
  );

  // Flush pending changes on unmount instead of discarding them
  useEffect(() => {
    return () => {
      flush();
    };
  }, [flush]);

  return { save, saveImmediate };
}
