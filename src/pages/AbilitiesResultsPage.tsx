import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAssessment } from "@/contexts/AssessmentContext";

export function AbilitiesResultsPage() {
  const navigate = useNavigate();
  const { currentAssessment } = useAssessment();

  if (!currentAssessment) {
    navigate("/");
    return null;
  }

  const selected = currentAssessment.abilities.selected;

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="Abilities Results" backTo="/assessment" />

      <div className="flex-1 px-4 py-6">
        <section className="mb-8">
          <h2 className="mb-4 text-center text-lg font-bold text-gray-900 dark:text-white">
            Your Top 5 Abilities
          </h2>
          <div className="space-y-3">
            {selected.map((ability, index) => (
              <div
                key={ability}
                className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 dark:border-primary/30 dark:bg-primary/10"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {ability}
                </h3>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            to="/assessment/abilities"
            className="w-full rounded-lg border border-primary px-6 py-3 text-center font-medium text-primary shadow-md hover:bg-primary/5 dark:hover:bg-primary/10"
          >
            Edit Selections
          </Link>
          <Link
            to="/assessment"
            className="w-full rounded-lg bg-primary px-6 py-3 text-center font-medium text-white shadow-md hover:opacity-90"
          >
            Back to Assessment
          </Link>
        </div>
      </div>
    </div>
  );
}
