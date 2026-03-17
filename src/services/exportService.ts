import type { ExportEnvelope } from "@/contracts/types";
import { assessmentRepo } from "@/db/repositories/assessmentRepo";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportAll(): Promise<void> {
  const assessments = await assessmentRepo.getAll();
  const envelope: ExportEnvelope = {
    appName: "MySHAPE",
    version: 1,
    exportedAt: Date.now(),
    type: "full",
    data: { assessments },
  };
  const filename = `myshape-full-${formatDate(new Date())}.json`;
  triggerDownload(JSON.stringify(envelope, null, 2), filename);
}

export async function exportSingle(id: string): Promise<void> {
  const assessment = await assessmentRepo.getById(id);
  if (!assessment) throw new Error("Assessment not found");
  const envelope: ExportEnvelope = {
    appName: "MySHAPE",
    version: 1,
    exportedAt: Date.now(),
    type: "single",
    data: { assessments: [assessment] },
  };
  const filename = `myshape-single-${formatDate(new Date())}.json`;
  triggerDownload(JSON.stringify(envelope, null, 2), filename);
}
