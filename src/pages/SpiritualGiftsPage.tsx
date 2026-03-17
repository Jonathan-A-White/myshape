import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScaleSelector } from "@/components/forms/ScaleSelector";
import { ProgressBar } from "@/components/data-display/ProgressBar";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useAutoSave } from "@/hooks/useAutoSave";
import { spiritualGiftQuestions } from "@/core/staticData";

const TOTAL_QUESTIONS = spiritualGiftQuestions.length;

export function SpiritualGiftsPage() {
  const navigate = useNavigate();
  const { currentAssessment } = useAssessment();
  const { saveImmediate } = useAutoSave(currentAssessment?.id);

  const answers = useMemo(() => currentAssessment?.spiritualGifts.answers ?? {}, [currentAssessment?.spiritualGifts.answers]);
  const answeredCount = Object.keys(answers).length;

  // Find the first unanswered question index, or last question if all answered
  const firstUnanswered = spiritualGiftQuestions.findIndex(
    (q) => answers[String(q.id)] === undefined,
  );
  const sequentialProgress = firstUnanswered === -1 ? TOTAL_QUESTIONS : firstUnanswered;
  const initialIndex = firstUnanswered === -1 ? TOTAL_QUESTIONS - 1 : firstUnanswered;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Clean up advance timer on unmount
  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const question = spiritualGiftQuestions[currentIndex];
  const currentValue = question ? answers[String(question.id)] : undefined;

  const handleSelect = useCallback(
    (value: number) => {
      if (!question) return;

      const newAnswers = { ...answers, [String(question.id)]: value };
      const newAnsweredCount = Object.keys(newAnswers).length;
      const isComplete = newAnsweredCount >= TOTAL_QUESTIONS;

      const newStatus = isComplete ? "complete" : "in_progress";

      // Save every answer immediately so nothing is lost on app close
      saveImmediate({
        spiritualGifts: {
          status: newStatus,
          answers: newAnswers,
        },
      });

      // Auto-advance after 300ms
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        if (currentIndex < TOTAL_QUESTIONS - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else if (isComplete) {
          navigate("/assessment/spiritual-gifts/results");
        }
      }, 300);
    },
    [question, answers, currentIndex, saveImmediate, navigate],
  );

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleForward = useCallback(() => {
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex]);

  if (!currentAssessment) {
    return (
      <div>
        <PageHeader title="Spiritual Gifts" backTo="/assessment" />
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300">
            No assessment in progress. Please start a new assessment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Spiritual Gifts" backTo="/assessment" />

      <div className="flex flex-1 flex-col px-4 py-6">
        {/* Progress section */}
        <div className="mb-6">
          <ProgressBar
            current={sequentialProgress}
            total={TOTAL_QUESTIONS}
            label={`Question ${currentIndex + 1} of ${TOTAL_QUESTIONS}`}
          />
        </div>

        {/* Question */}
        {question && (
          <div className="flex flex-1 flex-col items-center justify-center">
            <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Q{question.id}
            </p>
            <p className="mb-8 max-w-md text-center text-lg font-medium text-gray-900 dark:text-white">
              {question.text}
            </p>

            <ScaleSelector value={currentValue} onChange={handleSelect} />
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-gray-300 dark:hover:bg-gray-700 dark:disabled:hover:bg-transparent"
          >
            Previous
          </button>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {answeredCount} / {TOTAL_QUESTIONS} answered
          </span>

          <button
            type="button"
            onClick={handleForward}
            disabled={currentIndex === TOTAL_QUESTIONS - 1}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent dark:text-gray-300 dark:hover:bg-gray-700 dark:disabled:hover:bg-transparent"
          >
            Next
          </button>
        </div>

        {/* View Results button when all answered */}
        {answeredCount >= TOTAL_QUESTIONS && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => {
                saveImmediate({
                  spiritualGifts: {
                    status: "complete",
                    answers,
                  },
                });
                navigate("/assessment/spiritual-gifts/results");
              }}
              className="rounded-lg bg-primary px-6 py-3 font-medium text-white shadow-md hover:opacity-90"
            >
              View Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
