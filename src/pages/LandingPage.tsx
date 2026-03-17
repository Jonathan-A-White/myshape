import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useToast } from "@/contexts/ToastContext";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import {
  readFileAsJson,
  validateExport,
  importData,
} from "@/services/importService";
import type { CreateAssessmentInput } from "@/contracts/types";

const defaultAssessment: CreateAssessmentInput = {
  status: "in_progress",
  participant: {
    name: "",
    email: "",
    church: "",
    date: new Date().toISOString().split("T")[0],
  },
  spiritualGifts: { status: "not_started", answers: {} },
  heart: {
    status: "not_started",
    reflectionQuestions: {
      whatDrivesYou: "",
      whoToHelp: "",
      needsDrawnTo: "",
      passionateCause: "",
    },
    peopleToServe: [],
    issuesAndCauses: [],
  },
  abilities: { status: "not_started", selected: [] },
  personality: { status: "not_started", groups: {} },
  experiences: {
    status: "not_started",
    studiedInSchool: "",
    occupation: "",
    hobbies: "",
    churchServing: "",
    painfulExperience: "",
  },
};

export function LandingPage() {
  const navigate = useNavigate();
  const { currentAssessment, createAssessment, deleteAssessment } =
    useAssessment();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<ReturnType<
    typeof validateExport
  > | null>(null);

  async function startNewAssessment() {
    if (currentAssessment) {
      setShowOverwriteConfirm(true);
      return;
    }
    await doCreate();
  }

  async function doCreate() {
    const id = await createAssessment({
      ...defaultAssessment,
      participant: {
        ...defaultAssessment.participant,
        date: new Date().toISOString().split("T")[0],
      },
    });
    if (id) {
      navigate("/assessment");
    }
  }

  async function handleOverwriteConfirm() {
    setShowOverwriteConfirm(false);
    if (currentAssessment) {
      await deleteAssessment(currentAssessment.id);
    }
    await doCreate();
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    try {
      const raw = await readFileAsJson(file);
      const result = validateExport(raw);
      if (!result.valid) {
        addToast("error", result.error || "Invalid file");
        return;
      }
      setPendingImport(result);
      setShowImportConfirm(true);
    } catch {
      addToast("error", "Failed to read file");
    }
  }

  async function handleImportConfirm() {
    setShowImportConfirm(false);
    if (!pendingImport?.data) return;
    try {
      const result = await importData(pendingImport.data);
      addToast(
        "success",
        `Import complete: ${result.added} added, ${result.skipped} skipped, ${result.errors} errors`,
      );
    } catch {
      addToast("error", "Import failed");
    }
    setPendingImport(null);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center dark:bg-gray-900">
      <h1 className="mb-4 text-4xl font-bold text-primary dark:text-white">
        Welcome to MySHAPE
      </h1>
      <p className="mb-8 max-w-md text-lg text-gray-600 dark:text-gray-300">
        Discover how God has shaped you through your Spiritual Gifts, Heart,
        Abilities, Personality, and Experiences.
      </p>

      <div className="flex w-full max-w-xs flex-col gap-4">
        {currentAssessment && (
          <button
            onClick={() => navigate("/assessment")}
            className="w-full rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-primary-light"
          >
            Resume Assessment
          </button>
        )}

        <button
          onClick={startNewAssessment}
          className={`w-full rounded-lg px-8 py-4 text-lg font-semibold shadow-lg transition-colors ${
            currentAssessment
              ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              : "bg-primary text-white hover:bg-primary-light"
          }`}
        >
          Start New Assessment
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-lg border border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 shadow-lg transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Import Assessment
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <ConfirmDialog
        open={showOverwriteConfirm}
        title="Start New Assessment"
        message="You have an assessment in progress. Starting a new one will delete it. Continue?"
        confirmLabel="Start New"
        danger
        onConfirm={handleOverwriteConfirm}
        onCancel={() => setShowOverwriteConfirm(false)}
      />

      <ConfirmDialog
        open={showImportConfirm}
        title="Import Data"
        message={`Import ${pendingImport?.data?.data.assessments.length || 0} assessment(s)? Existing assessments with the same ID will be skipped.`}
        confirmLabel="Import"
        onConfirm={handleImportConfirm}
        onCancel={() => {
          setShowImportConfirm(false);
          setPendingImport(null);
        }}
      />
    </div>
  );
}
