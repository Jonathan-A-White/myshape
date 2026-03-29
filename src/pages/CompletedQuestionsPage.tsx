import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAssessment } from "@/contexts/AssessmentContext";
import {
  spiritualGiftQuestions,
  heartReflectionQuestions,
  experienceQuestions,
  personalityTraitGroups,
} from "@/core/staticData";
import { discMapping } from "@/core/disc";
import type { Assessment, SectionStatus } from "@/contracts/types";

type SectionKey = "spiritual-gifts" | "heart" | "abilities" | "personality" | "experiences";

const sectionTabs: { key: SectionKey; label: string; statusField: string }[] = [
  { key: "spiritual-gifts", label: "Spiritual Gifts", statusField: "spiritualGifts" },
  { key: "heart", label: "Heart", statusField: "heart" },
  { key: "abilities", label: "Abilities", statusField: "abilities" },
  { key: "personality", label: "Personality", statusField: "personality" },
  { key: "experiences", label: "Experiences", statusField: "experiences" },
];

const scaleLabels: Record<number, string> = {
  1: "Never true",
  2: "Rarely true",
  3: "Sometimes true",
  4: "Often true",
  5: "Always true",
};

const discTypeLabels: Record<string, string> = {
  D: "Dominant",
  I: "Influencing",
  S: "Steady",
  C: "Conscientious",
};

function SpiritualGiftsSection({ assessment }: { assessment: Assessment }) {
  const answers = assessment.spiritualGifts.answers;

  return (
    <div className="space-y-3">
      {spiritualGiftQuestions.map((q) => {
        const value = answers[String(q.id)];
        return (
          <div
            key={q.id}
            className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
          >
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <span className="font-medium text-gray-500 dark:text-gray-400">
                Q{q.id}.{" "}
              </span>
              {q.text}
            </p>
            <p className="mt-1 text-sm font-semibold text-primary dark:text-blue-400">
              {value !== undefined ? `${value} — ${scaleLabels[value]}` : "Not answered"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function HeartSection({ assessment }: { assessment: Assessment }) {
  const heart = assessment.heart;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase dark:text-gray-400">
          Reflection Questions
        </h3>
        <div className="space-y-3">
          {heartReflectionQuestions.map((q) => {
            const value =
              heart.reflectionQuestions[
                q.id as keyof typeof heart.reflectionQuestions
              ];
            return (
              <div
                key={q.id}
                className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {q.label}
                </p>
                <p className="mt-1 text-sm text-primary dark:text-blue-400">
                  {value || "Not answered"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase dark:text-gray-400">
          People to Serve
        </h3>
        <div className="flex flex-wrap gap-2">
          {heart.peopleToServe.map((p) => (
            <span
              key={p}
              className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary dark:bg-blue-900/30 dark:text-blue-300"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase dark:text-gray-400">
          Issues & Causes
        </h3>
        <div className="flex flex-wrap gap-2">
          {heart.issuesAndCauses.map((i) => (
            <span
              key={i}
              className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary dark:bg-blue-900/30 dark:text-blue-300"
            >
              {i}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AbilitiesSection({ assessment }: { assessment: Assessment }) {
  return (
    <div>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Your top 5 selected abilities:
      </p>
      <div className="space-y-2">
        {assessment.abilities.selected.map((ability, index) => (
          <div
            key={ability}
            className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {ability}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonalitySection({ assessment }: { assessment: Assessment }) {
  const groups = assessment.personality.groups;

  return (
    <div className="space-y-3">
      {personalityTraitGroups.map((group) => {
        const selection = groups[String(group.id)];
        const mapping = discMapping[String(group.id)];

        return (
          <div
            key={group.id}
            className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
          >
            <p className="mb-2 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
              Group {group.id}
            </p>
            <div className="space-y-1">
              {group.traits.map((trait, idx) => {
                const isMost = selection?.most === idx;
                const isLeast = selection?.least === idx;
                const discType = mapping?.[idx];

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded px-2 py-1 text-sm ${
                      isMost
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : isLeast
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="flex-1">{trait}</span>
                    <span className="ml-2 flex items-center gap-2">
                      {discType && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {discType} — {discTypeLabels[discType]}
                        </span>
                      )}
                      {isMost && (
                        <span className="rounded bg-green-200 px-1.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-800 dark:text-green-200">
                          MOST
                        </span>
                      )}
                      {isLeast && (
                        <span className="rounded bg-red-200 px-1.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-800 dark:text-red-200">
                          LEAST
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExperiencesSection({ assessment }: { assessment: Assessment }) {
  const experiences = assessment.experiences;

  return (
    <div className="space-y-3">
      {experienceQuestions.map((q) => {
        const value = experiences[q.id as keyof typeof experiences] as string;
        return (
          <div
            key={q.id}
            className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
          >
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {q.label}
            </p>
            <p className="mt-1 text-sm text-primary dark:text-blue-400">
              {value || "Not answered"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function getSectionStatus(assessment: Assessment, field: string): SectionStatus {
  return (assessment[field as keyof Assessment] as { status: SectionStatus }).status;
}

function NotStartedMessage() {
  return (
    <div className="py-12 text-center text-gray-500 dark:text-gray-400">
      <p>This section hasn't been started yet.</p>
    </div>
  );
}

export function CompletedQuestionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentAssessment } = useAssessment();

  const activeSection = (searchParams.get("section") as SectionKey) || "spiritual-gifts";
  const backTo = searchParams.get("from") === "hub" ? "/assessment" : "/assessment/results";

  if (!currentAssessment) {
    navigate("/");
    return null;
  }

  const assessment = currentAssessment;

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="Review Answers" backTo={backTo} />

      {/* Section tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto px-2">
          {sectionTabs.map((tab) => {
            const status = getSectionStatus(assessment, tab.statusField);
            return (
              <button
                key={tab.key}
                onClick={() => setSearchParams({ section: tab.key, ...(searchParams.get("from") ? { from: searchParams.get("from")! } : {}) })}
                className={`relative whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors ${
                  activeSection === tab.key
                    ? "border-b-2 border-primary text-primary dark:text-blue-400"
                    : status === "not_started"
                      ? "text-gray-400 dark:text-gray-500"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {tab.label}
                {status === "complete" && (
                  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                )}
                {status === "in_progress" && (
                  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section content */}
      <div className="flex-1 p-4">
        {activeSection === "spiritual-gifts" && (
          assessment.spiritualGifts.status === "not_started"
            ? <NotStartedMessage />
            : <SpiritualGiftsSection assessment={assessment} />
        )}
        {activeSection === "heart" && (
          assessment.heart.status === "not_started"
            ? <NotStartedMessage />
            : <HeartSection assessment={assessment} />
        )}
        {activeSection === "abilities" && (
          assessment.abilities.status === "not_started"
            ? <NotStartedMessage />
            : <AbilitiesSection assessment={assessment} />
        )}
        {activeSection === "personality" && (
          assessment.personality.status === "not_started"
            ? <NotStartedMessage />
            : <PersonalitySection assessment={assessment} />
        )}
        {activeSection === "experiences" && (
          assessment.experiences.status === "not_started"
            ? <NotStartedMessage />
            : <ExperiencesSection assessment={assessment} />
        )}
      </div>
    </div>
  );
}
