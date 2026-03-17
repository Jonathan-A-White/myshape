import { db } from "@/db/database";
import type { Assessment, CreateAssessmentInput } from "@/contracts/types";

export class AssessmentRepository {
  async getAll(): Promise<Assessment[]> {
    return db.assessments.toArray();
  }

  async getById(id: string): Promise<Assessment | undefined> {
    return db.assessments.get(id);
  }

  async getInProgress(): Promise<Assessment | undefined> {
    return db.assessments.where("status").equals("in_progress").first();
  }

  async create(input: CreateAssessmentInput): Promise<string> {
    const id = crypto.randomUUID();
    const now = Date.now();
    await db.assessments.add({ ...input, id, createdAt: now, updatedAt: now });
    return id;
  }

  async update(id: string, changes: Partial<Assessment>): Promise<void> {
    await db.assessments.update(id, { ...changes, updatedAt: Date.now() });
  }

  async delete(id: string): Promise<void> {
    await db.assessments.delete(id);
  }

  async deleteAll(): Promise<void> {
    await db.assessments.clear();
  }
}

export const assessmentRepo = new AssessmentRepository();
