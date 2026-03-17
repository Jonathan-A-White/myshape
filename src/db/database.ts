import Dexie, { type Table } from "dexie";
import type { Assessment } from "@/contracts/types";

class MySHAPEDatabase extends Dexie {
  assessments!: Table<Assessment, string>;

  constructor() {
    super("MySHAPE");
    this.version(1).stores({
      assessments: "id, status, updatedAt",
    });
  }
}

export const db = new MySHAPEDatabase();
