import type { Assessment, ExportEnvelope } from "@/contracts/types";
import { assessmentRepo } from "@/db/repositories/assessmentRepo";

interface ImportResult {
  added: number;
  skipped: number;
  errors: number;
}

function hasProperty<K extends string>(
  obj: unknown,
  key: K,
): obj is Record<K, unknown> {
  return typeof obj === "object" && obj !== null && key in obj;
}

function detectAndNormalize(raw: unknown): ExportEnvelope {
  if (hasProperty(raw, "$schema") && raw.$schema === "shape-assessment-v1") {
    return transformLegacyFormat(raw);
  }
  return raw as ExportEnvelope;
}

function transformLegacyFormat(
  raw: Record<string, unknown>,
): ExportEnvelope {
  // Bridge migration from pre-scaffold format
  const assessment: Assessment = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "complete",
    participant: {
      name:
        (raw.participant as Record<string, string>)?.name || "",
      email:
        (raw.participant as Record<string, string>)?.email || "",
      church:
        (raw.participant as Record<string, string>)?.church || "",
      date:
        (raw.participant as Record<string, string>)?.date ||
        new Date().toISOString().split("T")[0],
    },
    spiritualGifts: {
      status: "complete",
      answers:
        ((raw.spiritualGifts as Record<string, unknown>)
          ?.answers as Record<string, number>) || {},
    },
    heart: {
      status: "complete",
      reflectionQuestions: {
        whatDrivesYou: "",
        whoToHelp: "",
        needsDrawnTo: "",
        passionateCause: "",
      },
      peopleToServe:
        ((raw.heart as Record<string, unknown>)
          ?.peopleToServe as string[]) || [],
      issuesAndCauses:
        ((raw.heart as Record<string, unknown>)
          ?.issuesAndCauses as string[]) || [],
    },
    abilities: {
      status: "complete",
      selected:
        ((raw.abilities as Record<string, unknown>)
          ?.selected as string[]) || [],
    },
    personality: {
      status: "complete",
      groups:
        ((raw.personality as Record<string, unknown>)
          ?.groups as Record<
          string,
          { most: number; least: number }
        >) || {},
    },
    experiences: {
      status: "complete",
      studiedInSchool: "",
      occupation: "",
      hobbies: "",
      churchServing: "",
      painfulExperience: "",
    },
  };
  return {
    appName: "MySHAPE",
    version: 1,
    exportedAt: Date.now(),
    type: "single",
    data: { assessments: [assessment] },
  };
}

function migrateExport(data: ExportEnvelope): ExportEnvelope {
  // v1 is current, no migration needed yet
  return data;
}

export function validateExport(
  raw: unknown,
): { valid: boolean; error?: string; data?: ExportEnvelope } {
  if (!raw || typeof raw !== "object") {
    return { valid: false, error: "Invalid JSON structure" };
  }

  const envelope = detectAndNormalize(raw);

  if (envelope.appName !== "MySHAPE") {
    return {
      valid: false,
      error: `Invalid app: expected "MySHAPE", got "${envelope.appName}"`,
    };
  }

  if (typeof envelope.version !== "number" || envelope.version > 1) {
    return {
      valid: false,
      error:
        "This file was created by a newer version. Please update the app.",
    };
  }

  if (
    !envelope.data?.assessments ||
    !Array.isArray(envelope.data.assessments)
  ) {
    return {
      valid: false,
      error: "Invalid data structure: missing assessments array",
    };
  }

  const migrated = migrateExport(envelope);
  return { valid: true, data: migrated };
}

export async function importData(
  envelope: ExportEnvelope,
): Promise<ImportResult> {
  const result: ImportResult = { added: 0, skipped: 0, errors: 0 };

  for (const assessment of envelope.data.assessments) {
    try {
      const existing = await assessmentRepo.getById(assessment.id);
      if (existing) {
        result.skipped++;
        continue;
      }
      await assessmentRepo.create({
        status: assessment.status,
        participant: assessment.participant,
        spiritualGifts: assessment.spiritualGifts,
        heart: assessment.heart,
        abilities: assessment.abilities,
        personality: assessment.personality,
        experiences: assessment.experiences,
      });
      result.added++;
    } catch {
      result.errors++;
    }
  }

  return result;
}

export function readFileAsJson(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch {
        reject(new Error("Invalid JSON file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
