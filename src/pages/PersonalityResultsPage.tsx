import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { DISCChart } from "@/components/data-display/DISCChart";
import { calculateDISCScores, discDescriptions } from "@/core/disc";
import { useAssessment } from "@/contexts/AssessmentContext";

export function PersonalityResultsPage() {
  const { currentAssessment } = useAssessment();

  const groups = currentAssessment?.personality?.groups;
  const profile = groups ? calculateDISCScores(groups) : null;

  if (!currentAssessment || !profile) {
    return (
      <div>
        <PageHeader title="Personality Results" backTo="/assessment" />
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          No personality data available. Please complete the personality assessment first.
        </div>
      </div>
    );
  }

  const primary = discDescriptions[profile.primary];
  const secondary = discDescriptions[profile.secondary];

  return (
    <div>
      <PageHeader title="Personality Results" backTo="/assessment" />
      <div className="mx-auto max-w-lg p-4">
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Your DISC Profile Code</p>
          <p className="mt-1 text-4xl font-bold text-gray-900 dark:text-white">{profile.profileCode}</p>
        </div>

        <DISCChart scores={profile.scores} />

        <div className="mt-8 space-y-6">
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Primary: {profile.primary} - {primary.name}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {primary.characteristics}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Secondary: {profile.secondary} - {secondary.name}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {secondary.characteristics}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/assessment"
            className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            Back to Assessment
          </Link>
        </div>
      </div>
    </div>
  );
}
