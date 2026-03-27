import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { TextArea } from "@/components/forms/TextArea";
import { ChipGrid } from "@/components/forms/ChipGrid";
import { ProgressBar } from "@/components/data-display/ProgressBar";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useAutoSave } from "@/hooks/useAutoSave";
import {
  heartReflectionQuestions,
  peopleToServeOptions,
  issuesAndCausesOptions,
} from "@/core/staticData";
import type { HeartData } from "@/contracts/types";

const TOTAL_STEPS = 6;

const stepTitles = [
  ...heartReflectionQuestions.map(q => q.label),
  "People to Serve",
  "Issues & Causes",
];

export function HeartPage() {
  const navigate = useNavigate();
  const { currentAssessment } = useAssessment();
  const { save, saveImmediate } = useAutoSave(currentAssessment?.id);

  const heart = currentAssessment?.heart;
  const heartRef = useRef(heart);
  heartRef.current = heart;

  const [step, setStep] = useState(0);

  // Local state for the current text input to decouple typing from DB round-trips
  const [localText, setLocalText] = useState("");
  const currentQuestionId = step < 4 ? heartReflectionQuestions[step].id : null;

  // Sync local text when step changes or when heart data loads initially
  const prevStepRef = useRef(step);
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!heart) return;
    if (!initializedRef.current || prevStepRef.current !== step) {
      const qId = step < 4 ? heartReflectionQuestions[step].id : null;
      if (qId) {
        setLocalText(
          heart.reflectionQuestions[qId as keyof typeof heart.reflectionQuestions] ?? "",
        );
      }
      prevStepRef.current = step;
      initializedRef.current = true;
    }
  }, [step, heart]);

  const handleTextChange = useCallback(
    (value: string) => {
      setLocalText(value);
      const h = heartRef.current;
      if (!h || !currentQuestionId) return;
      const updated: HeartData = {
        ...h,
        status: "in_progress",
        reflectionQuestions: {
          ...h.reflectionQuestions,
          [currentQuestionId]: value,
        },
      };
      save({ heart: updated });
    },
    [currentQuestionId, save],
  );

  const updatePeopleToServe = useCallback(
    (selected: string[]) => {
      const h = heartRef.current;
      if (!h) return;
      const updated: HeartData = {
        ...h,
        status: "in_progress",
        peopleToServe: selected,
      };
      save({ heart: updated });
    },
    [save],
  );

  const updateIssuesAndCauses = useCallback(
    (selected: string[]) => {
      const h = heartRef.current;
      if (!h) return;
      const updated: HeartData = {
        ...h,
        status: "in_progress",
        issuesAndCauses: selected,
      };
      save({ heart: updated });
    },
    [save],
  );

  const progress = useMemo(() => {
    if (!heart) return 0;
    let filled = 0;
    for (const q of heartReflectionQuestions) {
      if (heart.reflectionQuestions[q.id as keyof typeof heart.reflectionQuestions]?.trim()) {
        filled++;
      }
    }
    if (heart.peopleToServe.length === 3) filled++;
    if (heart.issuesAndCauses.length === 3) filled++;
    return filled;
  }, [heart]);

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    if (!heart) return;
    const updated: HeartData = {
      ...heart,
      status: "complete",
    };
    saveImmediate({ heart: updated });
    navigate("/assessment");
  };

  if (!currentAssessment) {
    return (
      <div>
        <PageHeader title="Heart" backTo="/assessment" />
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300">No assessment in progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Heart" backTo="/assessment" />

      <div className="flex-1 p-4">
        {/* Progress */}
        <div className="mb-6">
          <ProgressBar current={progress} total={TOTAL_STEPS} label={`Step ${step + 1} of ${TOTAL_STEPS}`} />
        </div>

        {/* Step title */}
        <h2 className="mb-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
          {stepTitles[step]}
        </h2>

        {/* Steps 0-3: Reflection questions */}
        {step < 4 && (
          <div className="mx-auto max-w-lg">
            <TextArea
              value={localText}
              onChange={handleTextChange}
              placeholder="Type your answer here..."
            />
          </div>
        )}

        {/* Step 4: People to Serve */}
        {step === 4 && (
          <div className="mx-auto max-w-lg">
            <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Select exactly 3 groups of people you feel called to serve.
            </p>
            <ChipGrid
              options={peopleToServeOptions}
              selected={heart?.peopleToServe ?? []}
              onChange={updatePeopleToServe}
              maxCount={3}
              allowOther
            />
          </div>
        )}

        {/* Step 5: Issues & Causes */}
        {step === 5 && (
          <div className="mx-auto max-w-lg">
            <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Select exactly 3 issues or causes you are passionate about.
            </p>
            <ChipGrid
              options={issuesAndCausesOptions}
              selected={heart?.issuesAndCauses ?? []}
              onChange={updateIssuesAndCauses}
              maxCount={3}
              allowOther
            />
          </div>
        )}

        {/* Navigation */}
        <div className="mx-auto mt-8 flex max-w-lg justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:invisible dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Back
          </button>

          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={handleNext}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={progress !== TOTAL_STEPS}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Complete Section
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
