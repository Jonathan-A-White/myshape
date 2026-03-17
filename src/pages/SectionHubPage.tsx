import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { useAssessment } from "@/contexts/AssessmentContext";
import { spiritualGiftQuestions } from "@/core/staticData";
import type { SectionStatus } from "@/contracts/types";

interface SectionCard {
  letter: string;
  name: string;
  path: string;
  status: SectionStatus;
  detail: string;
}

function statusBadge(status: SectionStatus) {
  const styles: Record<SectionStatus, string> = {
    not_started: "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300",
    in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    complete: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  };
  const labels: Record<SectionStatus, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    complete: "Complete",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function SectionHubPage() {
  const navigate = useNavigate();
  const { currentAssessment, isLoading } = useAssessment();

  useEffect(() => {
    if (!isLoading && !currentAssessment) {
      navigate("/", { replace: true });
    }
  }, [isLoading, currentAssessment, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentAssessment) {
    return null;
  }

  const sgAnswers = currentAssessment.spiritualGifts.answers;
  const firstUnansweredSg = spiritualGiftQuestions.findIndex(
    (q) => sgAnswers[String(q.id)] === undefined,
  );
  const answerCount = firstUnansweredSg === -1 ? spiritualGiftQuestions.length : firstUnansweredSg;
  const selectedCount = currentAssessment.abilities.selected.length;
  const groupCount = Object.keys(currentAssessment.personality.groups).length;

  const sections: SectionCard[] = [
    {
      letter: "S",
      name: "Spiritual Gifts",
      path: "/assessment/spiritual-gifts",
      status: currentAssessment.spiritualGifts.status,
      detail: `${answerCount} / 95 answers`,
    },
    {
      letter: "H",
      name: "Heart",
      path: "/assessment/heart",
      status: currentAssessment.heart.status,
      detail: currentAssessment.heart.status === "complete" ? "Complete" : currentAssessment.heart.status === "in_progress" ? "In Progress" : "Not Started",
    },
    {
      letter: "A",
      name: "Abilities",
      path: "/assessment/abilities",
      status: currentAssessment.abilities.status,
      detail: `${selectedCount} / 5 selected`,
    },
    {
      letter: "P",
      name: "Personality",
      path: "/assessment/personality",
      status: currentAssessment.personality.status,
      detail: `${groupCount} / 24 groups`,
    },
    {
      letter: "E",
      name: "Experiences",
      path: "/assessment/experiences",
      status: currentAssessment.experiences.status,
      detail: currentAssessment.experiences.status === "complete" ? "Complete" : currentAssessment.experiences.status === "in_progress" ? "In Progress" : "Not Started",
    },
  ];

  const allComplete = sections.every((s) => s.status === "complete");

  return (
    <div>
      <PageHeader title="Assessment" backTo="/" />
      <div className="space-y-4 p-6">
        {sections.map((section) => (
          <Link
            key={section.letter}
            to={section.path}
            className="flex items-center gap-4 rounded-lg bg-white p-4 shadow transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
              {section.letter}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {section.name}
                </h3>
                {statusBadge(section.status)}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {section.detail}
              </p>
            </div>
          </Link>
        ))}

        <Link
          to="/assessment/results"
          className={`mt-6 block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold text-white transition-colors ${
            allComplete
              ? "bg-primary hover:bg-primary-light"
              : "pointer-events-none bg-gray-300 dark:bg-gray-600"
          }`}
          aria-disabled={!allComplete}
        >
          View Results
        </Link>
      </div>
    </div>
  );
}
