import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useAutoSave } from "@/hooks/useAutoSave";

export function ParticipantInfoPage() {
  const navigate = useNavigate();
  const { currentAssessment } = useAssessment();
  const { saveImmediate } = useAutoSave(currentAssessment?.id);

  const [name, setName] = useState(currentAssessment?.participant.name || "");
  const [email, setEmail] = useState(currentAssessment?.participant.email || "");
  const [church, setChurch] = useState(currentAssessment?.participant.church || "");
  const [date, setDate] = useState(
    currentAssessment?.participant.date || new Date().toISOString().split("T")[0],
  );

  if (!currentAssessment) {
    navigate("/");
    return null;
  }

  const handleSave = () => {
    saveImmediate({
      participant: { name, email, church, date },
    });
    navigate("/assessment");
  };

  const isValid = name.trim().length > 0;

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="Participant Info" backTo="/assessment" />
      <div className="flex-1 space-y-4 p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Church
          </label>
          <input
            type="text"
            value={church}
            onChange={(e) => setChurch(e.target.value)}
            placeholder="Your church name"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!isValid}
          className="mt-6 w-full rounded-lg bg-primary py-3 text-center font-semibold text-white shadow-md disabled:opacity-50"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
