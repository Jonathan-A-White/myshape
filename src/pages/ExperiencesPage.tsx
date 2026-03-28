import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProgressBar } from "@/components/data-display/ProgressBar";
import { TextArea } from "@/components/forms/TextArea";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useAutoSave } from "@/hooks/useAutoSave";
import { experienceQuestions } from "@/core/staticData";
import type { ExperiencesData } from "@/contracts/types";

const experienceFields: (keyof Omit<ExperiencesData, "status" | "lastStep">)[] = [
  "studiedInSchool",
  "occupation",
  "hobbies",
  "churchServing",
  "painfulExperience",
];

export function ExperiencesPage() {
  const navigate = useNavigate();
  const { currentAssessment } = useAssessment();
  const { save, saveImmediate } = useAutoSave(currentAssessment?.id);
  const [currentStep, setCurrentStep] = useState(
    () => currentAssessment?.experiences?.lastStep ?? 0,
  );

  // Sync step from DB when assessment first becomes available
  const [syncedId, setSyncedId] = useState<string | undefined>(undefined);
  if (currentAssessment && currentAssessment.id !== syncedId) {
    setCurrentStep(currentAssessment.experiences?.lastStep ?? 0);
    setSyncedId(currentAssessment.id);
  }

  const experiences = currentAssessment?.experiences;
  const experiencesRef = useRef(experiences);
  const field = experienceFields[currentStep];
  const isLastStep = currentStep === experienceQuestions.length - 1;

  // Local state for text input to decouple typing from DB round-trips
  const [localText, setLocalText] = useState("");

  useEffect(() => {
    experiencesRef.current = experiences;
  }, [experiences]);

  // Sync local text when step changes or data loads (adjust state during render)
  const [prevStep, setPrevStep] = useState(currentStep);
  const [initialized, setInitialized] = useState(false);
  if (experiences && (!initialized || prevStep !== currentStep)) {
    const f = experienceFields[currentStep];
    setLocalText((experiences[f] as string) ?? "");
    setPrevStep(currentStep);
    setInitialized(true);
  }

  const handleChange = useCallback(
    (value: string) => {
      setLocalText(value);
      const exp = experiencesRef.current;
      if (!exp) return;
      const updatedExperiences: ExperiencesData = {
        ...exp,
        [field]: value,
        status: "in_progress",
        lastStep: currentStep,
      };
      save({ experiences: updatedExperiences });
    },
    [field, currentStep, save],
  );

  const handleNext = useCallback(() => {
    if (!isLastStep) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const exp = experiencesRef.current;
      if (exp) {
        saveImmediate({ experiences: { ...exp, lastStep: nextStep } });
      }
    } else {
      if (!experiences) return;
      const updatedExperiences: ExperiencesData = {
        ...experiences,
        status: "complete",
      };
      saveImmediate({ experiences: updatedExperiences });
      navigate("/assessment");
    }
  }, [isLastStep, currentStep, experiences, saveImmediate, navigate]);

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep2 = currentStep - 1;
      setCurrentStep(prevStep2);
      const exp = experiencesRef.current;
      if (exp) {
        saveImmediate({ experiences: { ...exp, lastStep: prevStep2 } });
      }
    }
  };

  if (!currentAssessment) {
    navigate("/");
    return null;
  }

  const question = experienceQuestions[currentStep];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Experiences" backTo="/assessment" />

      <div className="flex flex-1 flex-col px-4 py-6">
        <div className="mb-6">
          <ProgressBar
            current={currentStep + 1}
            total={experienceQuestions.length}
            label={`Question ${currentStep + 1} of ${experienceQuestions.length}`}
          />
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {question.label}
          </h2>
        </div>

        <div className="mb-8 flex-1">
          <TextArea
            value={localText}
            onChange={handleChange}
            placeholder="Type your answer here..."
          />
        </div>

        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 rounded-lg bg-primary px-4 py-3 font-medium text-white transition-colors hover:bg-primary/90"
          >
            {isLastStep ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
