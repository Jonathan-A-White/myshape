import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChipGrid } from "@/components/forms/ChipGrid";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useAutoSave } from "@/hooks/useAutoSave";
import { abilitiesOptions } from "@/core/staticData";

export function AbilitiesPage() {
  const navigate = useNavigate();
  const { currentAssessment } = useAssessment();
  const { save, saveImmediate } = useAutoSave(currentAssessment?.id);

  if (!currentAssessment) {
    navigate("/");
    return null;
  }

  const abilities = currentAssessment.abilities;
  const isComplete = abilities.selected.length === 5;

  const handleChange = (selected: string[]) => {
    const updatedAbilities = {
      ...abilities,
      selected,
      status: selected.length === 0 ? ("not_started" as const) : selected.length === 5 ? ("complete" as const) : ("in_progress" as const),
    };
    save({ abilities: updatedAbilities });
  };

  const handleComplete = () => {
    const updatedAbilities = { ...abilities, status: "complete" as const };
    saveImmediate({ abilities: updatedAbilities });
    navigate("/assessment/abilities/results");
  };

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="Abilities" backTo="/assessment" />
      <div className="flex-1 p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Your Top 5 Abilities
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Choose the 5 abilities that best describe you.
          </p>
        </div>

        <ChipGrid
          options={abilitiesOptions}
          selected={abilities.selected}
          onChange={handleChange}
          maxCount={5}
        />

        {isComplete && (
          <div className="mt-6">
            <button
              onClick={handleComplete}
              className="w-full rounded-lg bg-primary py-3 text-center font-semibold text-white shadow-md hover:bg-primary-light"
            >
              Complete Section
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
