// Keeps docs/best-practices-audit.md honest: the shape the audit promises,
// and that every file:line it cites still points at a real line.
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// vitest runs from the repo root (the jsdom environment gives import.meta.url no file path)
const root = `${process.cwd()}/`;
const auditPath = join(root, "docs", "best-practices-audit.md");

// The vault's pwa-best-practices/checklist.md had 31 "[ ]" lines on 2026-10-10.
const CHECKLIST_LINES = 31;
const NEW_RULES = 6;

function readAudit(): string {
  expect(existsSync(auditPath), "docs/best-practices-audit.md must exist").toBe(true);
  return readFileSync(auditPath, "utf-8");
}

interface Row {
  id: string;
  status: string;
  evidence: string;
  fix: string;
  size: string;
}

function rows(md: string, prefix: "C" | "N"): Row[] {
  const out: Row[] = [];
  for (const line of md.split("\n")) {
    const cells = line.split("|").map((c) => c.trim());
    // | id | rule | status | evidence | fix | size |
    if (cells.length < 8 || !new RegExp(`^${prefix}\\d+$`).test(cells[1])) continue;
    out.push({
      id: cells[1],
      status: cells[3],
      evidence: cells[4],
      fix: cells[5],
      size: cells[6],
    });
  }
  return out;
}

describe("docs/best-practices-audit.md", () => {
  it("has one row for each checklist line and for each rule added 2026-10-09", () => {
    const md = readAudit();
    expect(rows(md, "C")).toHaveLength(CHECKLIST_LINES);
    expect(rows(md, "N")).toHaveLength(NEW_RULES);
  });

  it("gives every row a status and evidence, and every fail a fix and a size", () => {
    const md = readAudit();
    for (const row of [...rows(md, "C"), ...rows(md, "N")]) {
      expect(["pass", "fail", "n/a"], `${row.id} status`).toContain(row.status);
      expect(row.evidence.length, `${row.id} evidence`).toBeGreaterThan(10);
      if (row.status === "fail") {
        expect(row.fix.length, `${row.id} fix`).toBeGreaterThan(10);
        expect(["S", "M", "L"], `${row.id} size`).toContain(row.size);
      }
    }
  });

  it("ranks at most 10 fix stories, each with an acceptance check", () => {
    const md = readAudit();
    const section = md.split(/^## Ranked fix stories$/m)[1];
    expect(section, "a '## Ranked fix stories' section").toBeDefined();
    const items = section.split("\n").filter((l) => /^\d+\. /.test(l));
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(10);
    for (const item of items) {
      expect(item, item).toMatch(/Check: .{10,}/);
    }
  });

  it("cites only file:line places that exist", () => {
    const md = readAudit();
    const cite = /`((?:src|public|docs|tests|\.github)\/[\w./-]+|index\.html|vite\.config\.ts|package\.json):(\d+)(?:-(\d+))?`/g;
    let count = 0;
    for (const m of md.matchAll(cite)) {
      count++;
      const file = `${root}${m[1]}`;
      expect(existsSync(file), `${m[1]} exists`).toBe(true);
      const lines = readFileSync(file, "utf-8").split("\n").length;
      const last = Number(m[3] ?? m[2]);
      expect(Number(m[2]), `${m[0]} starts inside the file`).toBeGreaterThanOrEqual(1);
      expect(last, `${m[0]} ends inside the file (${lines} lines)`).toBeLessThanOrEqual(lines);
    }
    expect(count).toBeGreaterThan(20);
  });
});
