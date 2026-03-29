import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { useTheme } from "@/hooks/useTheme";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useToast } from "@/contexts/ToastContext";
import { exportAll } from "@/services/exportService";
import {
  readFileAsJson,
  validateExport,
  importData,
} from "@/services/importService";

const EMAIL_KEY = "myshape-recipient-email";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { deleteAllAssessments } = useAssessment();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) || "");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<ReturnType<typeof validateExport> | null>(null);

  function handleEmailChange(value: string) {
    setEmail(value);
    localStorage.setItem(EMAIL_KEY, value);
  }

  async function handleExportAll() {
    try {
      await exportAll();
      addToast("success", "Data exported successfully");
    } catch {
      addToast("error", "Failed to export data");
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be selected again
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

  async function handleClearAll() {
    setShowClearConfirm(false);
    try {
      await deleteAllAssessments();
      addToast("success", "All data cleared");
    } catch {
      addToast("error", "Failed to clear data");
    }
  }

  return (
    <div>
      <PageHeader title="Settings" backTo="/" />
      <div className="space-y-6 p-6">
        {/* Appearance */}
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Appearance
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                theme === "dark" ? "bg-primary" : "bg-gray-300"
              }`}
              role="switch"
              aria-checked={theme === "dark"}
              aria-label="Toggle dark mode"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === "dark" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {theme === "light" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 7.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.005 9.005 0 0012 21a9.005 9.005 0 008.354-5.646z" />
              </svg>
            )}
            <span>Toggle between light and dark themes</span>
          </div>
        </div>

        {/* Email */}
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Pastor/leader email for sending results
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="pastor@example.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Data Management */}
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
            Data Management
          </h3>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleExportAll}
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light"
            >
              Export All Data
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Import Data
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <hr className="border-gray-200 dark:border-gray-600" />
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Clear All Data
            </button>
          </div>
        </div>

        {/* About */}
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">About</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            MySHAPE v1.0.0
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Offline-first &bull; IndexedDB &bull; No data leaves your device
          </p>
        </div>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear All Data"
        message="This will permanently delete all assessments. This action cannot be undone."
        confirmLabel="Clear All"
        danger
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
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
