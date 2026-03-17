import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { assessmentRepo } from "@/db/repositories/assessmentRepo";
import type { Assessment, CreateAssessmentInput } from "@/contracts/types";

interface AssessmentContextType {
  currentAssessment: Assessment | undefined;
  isLoading: boolean;
  createAssessment: (input: CreateAssessmentInput) => Promise<string>;
  updateAssessment: (id: string, changes: Partial<Assessment>) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  deleteAllAssessments: () => Promise<void>;
}

const AssessmentContext = createContext<AssessmentContextType | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const currentAssessment = useLiveQuery(() => assessmentRepo.getInProgress());
  const isLoading = currentAssessment === undefined;

  const createAssessment = useCallback(async (input: CreateAssessmentInput) => {
    return assessmentRepo.create(input);
  }, []);

  const updateAssessment = useCallback(
    async (id: string, changes: Partial<Assessment>) => {
      return assessmentRepo.update(id, changes);
    },
    [],
  );

  const deleteAssessment = useCallback(async (id: string) => {
    return assessmentRepo.delete(id);
  }, []);

  const deleteAllAssessments = useCallback(async () => {
    return assessmentRepo.deleteAll();
  }, []);

  return (
    <AssessmentContext.Provider
      value={{
        currentAssessment,
        isLoading,
        createAssessment,
        updateAssessment,
        deleteAssessment,
        deleteAllAssessments,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context)
    throw new Error("useAssessment must be used within AssessmentProvider");
  return context;
}
