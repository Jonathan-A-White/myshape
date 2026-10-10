# MySHAPE module map

Written for the factory's planners and Builders: which module owns what, which files stories keep colliding on, and which splits would let two stories change two modules at once. It follows the rule "Draw the boundaries so two stories can change two modules at once" in the Builder's PWA best practices (27-modular-boundaries.md) and the library rules in its library best practices.

Status: a description of the code at commit 5953c38 (v1.0.8). Nothing has been moved; every proposal below is a future story.

Convention: a path in backticks exists in the repo today. A module or file that is only proposed is written without backticks and is marked "new".

Sections: [1 Modules](#1-modules), [2 Collisions](#2-collisions), [3 Proposed refactors](#3-proposed-refactors), [4 Rule breaks](#4-rule-breaks), [5 Library candidates](#5-library-candidates).

## 1. Modules

The app is a client-only React 19 / Vite PWA with five questionnaire sections (S, H, A, P, E), a results view, a PDF and a JSON export/import. All imports use the alias `@` for `src`. There are about 4,700 lines under `src`, 15 of them page files that hold most of the logic.

Dependencies run downward: pages -> contexts / hooks / services / components -> db / core / contracts. Two upward edges exist and are named in section 4.

| Module | One responsibility | Entry file and exported API | Imports |
|---|---|---|---|
| App shell: `src/main.tsx`, `src/App.tsx` | Start the app, register the service worker, declare every route and the provider stack | `src/main.tsx` renders `App`; `src/App.tsx` exports `App()` | react, react-router-dom, `virtual:pwa-register`, every page, the three contexts, `src/components/layout/AppShell.tsx`, `src/components/feedback/ErrorBoundary.tsx` |
| Contracts: `src/contracts/` | The shared TypeScript types | `src/contracts/types.ts`: `Assessment`, `Participant`, `SpiritualGiftsData`, `HeartData`, `AbilitiesData`, `PersonalityData`, `ExperiencesData`, `CreateAssessmentInput`, `SectionStatus`, `AssessmentStatus`, `ExportEnvelope`, plus UI types `ThemeContextType`, `ToastMessage`, `PageHeaderProps` | react (types only) |
| Database: `src/db/` | Open the IndexedDB database and offer typed CRUD on assessments | `src/db/repositories/assessmentRepo.ts`: `assessmentRepo` (`getAll`, `getById`, `getInProgress`, `create`, `update`, `delete`, `deleteAll`); `src/db/database.ts`: `db` (Dexie, store "MySHAPE" version 1) | dexie, contracts |
| Assessment context: `src/contexts/AssessmentContext.tsx` | Hold the one in-progress assessment as a live query and expose create / update / delete to screens | `AssessmentProvider`, `useAssessment()` returning `{ currentAssessment, isLoading, createAssessment, updateAssessment, deleteAssessment, deleteAllAssessments }` | dexie-react-hooks, assessmentRepo, contracts |
| Autosave: `src/hooks/useAutoSave.ts` | Debounce section edits into the repository and flush them on unmount | `useAutoSave(assessmentId, delay = 500)` returning `{ save, saveImmediate }` | react, assessmentRepo, contracts |
| Theme: `src/contexts/ThemeContext.tsx`, `src/hooks/useTheme.ts` | Light / dark theme, stored in localStorage and applied to the document | `ThemeProvider`, `ThemeContext`, `useTheme()` returning `{ theme, toggleTheme }` | contracts, localStorage, document |
| Toasts: `src/contexts/ToastContext.tsx`, `src/components/feedback/Toast.tsx` | Queue and show transient messages | `ToastProvider`, `useToast()` returning `{ toasts, addToast(type, message), removeToast }`; `Toast` renders the queue | contracts |
| Navigation guard: `src/hooks/useNavigationGuard.ts` | Confirm before leaving a page with unsaved changes | `useNavigationGuard(when, message?)` (no caller in `src`; see section 4) | react-router-dom |
| Core data and rules: `src/core/` | The SHAPE content (questions, options, trait groups), the gift-to-question map, and the scoring maths | `src/core/staticData.ts` (`spiritualGiftQuestions`, `heartReflectionQuestions`, `peopleToServeOptions`, `issuesAndCausesOptions`, `abilitiesOptions`, `personalityTraitGroups`, `experienceQuestions`, `TraitGroup`); `src/core/giftMap.ts` (`giftMap`, `GiftMapping`); `src/core/scoring.ts` (`calculateGiftScores`, `getTop3Gifts`, `GiftScore`); `src/core/disc.ts` (`discMapping`, `discDescriptions`, `calculateDISCScores`, `DISCScores`, `DISCProfile`); `src/core/validation.ts` (a one-line re-export of `validateExport`) | scoring imports giftMap; validation imports `src/services/importService.ts`; the rest import nothing |
| Data portability: `src/services/exportService.ts`, `src/services/importService.ts` | Write and read the versioned JSON envelope, including the legacy "shape-assessment-v1" format | `exportAll()`, `exportSingle(id)`; `validateExport(raw)`, `importData(envelope)`, `readFileAsJson(file)` | assessmentRepo, contracts, Blob / FileReader / document |
| PDF: `src/services/pdfService.ts` | Draw the 13-page SHAPE PDF with jsPDF | `generatePDF(assessment)` returning a `jsPDF`, `downloadPDF(assessment)` | jspdf, scoring, disc, giftMap, staticData, contracts |
| Layout components: `src/components/layout/` | Page chrome | `AppShell`, `BottomNav`, `PageHeader` | react-router-dom, Toast, contracts |
| Feedback components: `src/components/feedback/` | Dialogs, spinner, error boundary, toast view | `ConfirmDialog`, `LoadingSpinner`, `ErrorBoundary`, `Toast` | ToastContext (Toast only) |
| Form components: `src/components/forms/` | Answer inputs | `ScaleSelector`, `ChipGrid`, `TraitGroupSelector`, `TextArea` | react |
| Data-display components: `src/components/data-display/` | Progress and result visuals | `ProgressBar`, `GroupDotIndicator`, `GiftScoreBar`, `DISCChart` | react; `DISCChart` imports the `DISCScores` type from core |
| Section pages (the questionnaire): `src/pages/SectionHubPage.tsx`, `src/pages/ParticipantInfoPage.tsx`, `src/pages/SpiritualGiftsPage.tsx`, `src/pages/HeartPage.tsx`, `src/pages/AbilitiesPage.tsx`, `src/pages/PersonalityPage.tsx`, `src/pages/ExperiencesPage.tsx` | One screen per SHAPE section plus the hub that shows their status; each page owns its own step state, resume position and saving | each exports a single `...Page()` component | contexts, `useAutoSave`, form / display components, `src/core/staticData.ts` |
| Result pages: `src/pages/SpiritualGiftsResultsPage.tsx`, `src/pages/AbilitiesResultsPage.tsx`, `src/pages/PersonalityResultsPage.tsx`, `src/pages/FinalResultsPage.tsx`, `src/pages/CompletedQuestionsPage.tsx` | Show per-section and overall results, send the PDF by mail link, review given answers | each exports a single `...Page()` component | contexts, scoring, disc, `pdfService`, display components |
| App pages: `src/pages/LandingPage.tsx`, `src/pages/SettingsPage.tsx`, `src/pages/NotFoundPage.tsx` | Start / resume / import, settings (theme, recipient email, export, import, clear), 404 | each exports a single `...Page()` component | contexts, `src/hooks/useTheme.ts`, portability services |
| Tests: `src/test/`, `tests/features/` | Smoke tests (3 cases in `src/test/app.test.tsx`) and Gherkin feature files that no runner executes | vitest setup in `src/test/setup.ts` | |
| Build and deploy: `vite.config.ts`, `.github/workflows/` | PWA manifest, service worker config, CI, GitHub Pages deploy, version bump | not code a story edits; workflows are off limits to Builders | |

## 2. Collisions

The question: which source files do most stories change, so that two stories in the same rig wait for each other?

Command, run at the base commit 5953c38:

```
git log --since=30.days --name-only --format= -- src | sort | uniq -c | sort -rn | head -15
```

**Result today: no lines.** The newest commit in the repo is dated 2026-04-07, the first is 2026-03-17, and the map was written on 2026-10-10, so no commit falls in the last 30 days. The app has been quiet since v1.0.8.

To still see the pattern, the same command is anchored on the last commit instead of on today. `--since=2026-03-08` is 30 days before 2026-04-07 and covers the whole history (75 commits, 47 not counting merges):

```
git log --since=2026-03-08 --name-only --format= -- src | sort | uniq -c | sort -rn | head -15
```

Counts are the number of commits that touched the file (merge commits list no files). Line counts are `wc -l` at the base commit.

| Commits | File | Lines |
|---|---|---|
| 10 | `src/pages/PersonalityPage.tsx` | 229 |
| 8 | `src/pages/SectionHubPage.tsx` | 172 |
| 7 | `src/pages/HeartPage.tsx` | 282 |
| 5 | `src/pages/SpiritualGiftsPage.tsx` | 172 |
| 5 | `src/pages/ExperiencesPage.tsx` | 157 |
| 4 | `src/pages/SettingsPage.tsx` | 216 |
| 3 | `src/pages/SpiritualGiftsResultsPage.tsx` | 101 |
| 3 | `src/contracts/types.ts` | 95 |
| 3 | `src/components/forms/TraitGroupSelector.tsx` | 92 |
| 3 | `src/App.tsx` | 73 |
| 2 | `src/vite-env.d.ts` | 4 |
| 2 | `src/pages/NotFoundPage.tsx` | 20 |
| 2 | `src/pages/LandingPage.tsx` | 189 |
| 2 | `src/pages/FinalResultsPage.tsx` | 219 |
| 2 | `src/pages/CompletedQuestionsPage.tsx` | 337 |

The cut at 15 splits a tie: 14 files were changed by exactly two commits, and the list shows five of them (the others include `src/hooks/useAutoSave.ts`, `src/core/scoring.ts`, `src/components/forms/TextArea.tsx` and `src/components/feedback/ErrorBoundary.tsx`).

What the table says:

- **The four questionnaire pages and the hub are the collision zone.** Personality, hub, Heart, Gifts and Experiences account for 35 of the commits in the list. They are the five files a story about "how a section saves or resumes" has to edit, and a story about one section's content or flow edits one while a story about the hub edits another.
- **Most of that churn was one repeated bug.** Of the 47 non-merge commits, at least 10 are fixes to saving, resuming or step position inside those pages (abc2901, e07f33e, 7b799e4, 1ed8b64, 9f1a2a8, 9a60760, f6afd99, cbdf817, a5d1c3e, f2880a7), and two more fix typing lag caused by saving through the database on every keystroke (f2a08d1, 40b819f). Each page re-implements the same "sync from the database during render, keep a local copy, remember the position, autosave" logic, so each fix was made, or missed, page by page. See refactor 1.
- **`src/pages/SectionHubPage.tsx` and `src/pages/CompletedQuestionsPage.tsx` each hold their own list of the five sections** (letters, names, routes, status field names), and so does `src/App.tsx` for the routes. A new or renamed section edits all three.
- **`src/contracts/types.ts` mixes data types with UI types** (`ThemeContextType`, `ToastMessage`, `PageHeaderProps`), so a toast change and a data-shape change both edit the file every module imports.
- **`src/services/pdfService.ts` (478 lines, one 400-line function) and `src/pages/CompletedQuestionsPage.tsx` (337 lines) are the largest files** and are under the 500-line line in the rule, but each already combines five concerns. They were not hot in the first three weeks, so they rank lower.

## 3. Proposed refactors

Ranked by how much parallel work each frees. All are "no behaviour change" stories: the existing smoke tests and feature files must pass before and after, and each story should add the unit tests the extracted module lacks (the app has 3 test cases today). New modules live under `src`; each has one entry file (index.ts) that exports the API and hides the rest. Size: "one story" means a Builder can finish it in one session; "split" says into how many.

### Refactor 1. One draft hook for the four step-by-step sections

- **Responsibility to carve out:** reading a section's saved data, keeping a local copy while the user types, remembering the position (step or index), saving, and marking the section complete. Today `src/pages/HeartPage.tsx`, `src/pages/PersonalityPage.tsx`, `src/pages/SpiritualGiftsPage.tsx` and `src/pages/ExperiencesPage.tsx` each carry their own copy (a `syncedId` set-state-during-render block, a ref mirror, a `lastStep` or `lastIndex` field, calls to `useAutoSave`).
- **New module:** sections/ (new), with entry sections/index.ts and the hook in sections/useSectionDraft.ts. It replaces direct use of `src/hooks/useAutoSave.ts` in pages.
- **API:**

```ts
export type SectionKey = "spiritualGifts" | "heart" | "abilities" | "personality" | "experiences";

export interface SectionDraft<K extends SectionKey> {
  data: Assessment[K] | undefined;            // saved section, undefined while loading
  position: number;                           // step or index, restored on re-entry
  setPosition(position: number): void;
  update(patch: Partial<Assessment[K]>, opts?: { immediate?: boolean }): void;
  markComplete(): void;
}

export function useSectionDraft<K extends SectionKey>(key: K): SectionDraft<K>;
```

- **Files it touches:** `src/pages/HeartPage.tsx`, `src/pages/PersonalityPage.tsx`, `src/pages/SpiritualGiftsPage.tsx`, `src/pages/ExperiencesPage.tsx`, `src/hooks/useAutoSave.ts` (kept as the writer behind the hook), `src/contracts/types.ts` (the `lastStep` / `lastIndex` fields become one `position`, which is a stored-data change; see the risk).
- **Frees:** after this, a story on Heart's questions, a story on Personality's selection rule and a story on Gifts' scale each edit only their own page and nothing shared. It also removes the single biggest source of fix commits.
- **Risk:** medium to high. The duplicated code is the code that was fixed at least ten times to stop lost answers and wrong resume positions, and it is subtle (debounce vs immediate save, stale reads, state set during render). Keep stored data unchanged: keep reading and writing `lastStep` and `lastIndex` inside the hook, do not rename them, so existing IndexedDB records and the export format stay valid. Do the hook and one page first and compare behaviour by test before moving the other three.
- **Size:** does not fit one story. Split in three: (a) the hook with unit tests (fake-indexeddb) plus Heart and Experiences, (b) Spiritual Gifts, (c) Personality, which has the extra partial-selection logic and auto-advance timer.

### Refactor 2. A section registry

- **Responsibility to carve out:** the list of the five sections and what is known about each one (letter, name, routes, how to count its progress, how to read its status). Today `src/pages/SectionHubPage.tsx` builds it inline with the totals hard-coded (95 answers, 5 selected, 24 groups), `src/pages/CompletedQuestionsPage.tsx` has its own `sectionTabs`, and `src/App.tsx` repeats the routes.
- **New module:** sections/registry.ts (new), next to the draft hook above.
- **API:**

```ts
export interface SectionInfo {
  key: SectionKey;
  letter: "S" | "H" | "A" | "P" | "E";
  name: string;
  path: string;                              // the questionnaire route
  resultsPath?: string;                      // omitted for Heart and Experiences
  status(a: Assessment): SectionStatus;
  progress(a: Assessment): { done: number; total: number };
}

export const sections: readonly SectionInfo[];
export function getSection(key: SectionKey): SectionInfo;
export function allSectionsComplete(a: Assessment): boolean;
```

- **Files it touches:** `src/pages/SectionHubPage.tsx` (172 lines, second most changed), `src/pages/CompletedQuestionsPage.tsx`, `src/App.tsx`, `src/core/staticData.ts` (totals read from the data, not typed in).
- **Frees:** the hub, the review page and the route table stop changing together; adding a section becomes one registry entry plus its page.
- **Risk:** low. Pure data and derivations, covered by a unit test per section.
- **Size:** fits one story.

### Refactor 3. A content module with the language as an argument

- **Responsibility to carve out:** the SHAPE text (95 questions, trait groups, option lists, scale labels, gift descriptions, DISC descriptions), read through one function instead of by direct imports.
- **New module:** content/ (new), with entry content/index.ts and one file per language under content/en/ (new). It takes over `src/core/staticData.ts`, `src/core/giftMap.ts` and the data half of `src/core/disc.ts`; the scoring functions stay in `src/core/`.
- **API:**

```ts
export interface ShapeContent {
  locale: string;
  scaleLabels: Record<1 | 2 | 3 | 4 | 5, string>;
  spiritualGifts: { questions: { id: number; text: string }[]; gifts: GiftMapping[] };
  heart: { reflections: { id: string; label: string }[]; peopleToServe: string[]; issuesAndCauses: string[] };
  abilities: { options: string[]; maxSelected: number };
  personality: { groups: TraitGroup[]; discMapping: Record<string, DISCType[]>; discDescriptions: Record<DISCType, { name: string; characteristics: string }> };
  experiences: { questions: { id: string; label: string }[] };
}

export function getContent(locale?: string): ShapeContent;   // default "en"
export const availableLocales: readonly string[];
```

- **Files it touches:** `src/core/staticData.ts`, `src/core/giftMap.ts`, `src/core/disc.ts`, `src/core/scoring.ts`, `src/services/pdfService.ts`, `src/components/forms/ScaleSelector.tsx`, `src/pages/CompletedQuestionsPage.tsx`, `src/pages/HeartPage.tsx`, `src/pages/PersonalityPage.tsx`, `src/pages/SpiritualGiftsPage.tsx`, `src/pages/AbilitiesPage.tsx`, `src/pages/ExperiencesPage.tsx`, `src/pages/SectionHubPage.tsx`.
- **Frees:** a content or translation story (a different Bible wording of a question, a Spanish edition) touches only content/ and never a screen. Fixes the rule break on constants in section 4 (the scale labels exist three times).
- **Risk:** low to medium. Mostly moving imports; the risk is the many importers conflicting with whichever other story is editing a page. Schedule it after refactor 1, or as a first step that re-points imports only, with the locale argument added in a later story.
- **Size:** does not fit one story. Split in two: (a) move the data behind getContent and re-point the imports with the default locale, (b) add the locale setting and a second language file.

### Refactor 4. Data portability as one module with one import flow

- **Responsibility to carve out:** building, validating, migrating, downloading and importing the versioned JSON envelope, and the pick-file, confirm, import flow that `src/pages/LandingPage.tsx` and `src/pages/SettingsPage.tsx` each re-implement line for line (file select, validate, pending state, confirm dialog, import, result toast).
- **New module:** portability/ (new), with entry portability/index.ts; it takes over `src/services/exportService.ts`, `src/services/importService.ts` and `src/core/validation.ts`.
- **API:**

```ts
export type ParseResult = { ok: true; envelope: ExportEnvelope } | { ok: false; error: string };
export interface ImportResult { added: number; skipped: number; errors: number }

export function buildEnvelope(type: "full" | "single", assessments: Assessment[]): ExportEnvelope;
export function parseEnvelope(raw: unknown): ParseResult;       // includes the legacy v1 transform
export function importEnvelope(envelope: ExportEnvelope): Promise<ImportResult>;
export function downloadJson(content: string, filename: string): void;  // browser-only
export function useImportFlow(): {
  pickFile(file: File): Promise<void>;
  pending: { count: number } | null;     // set after a valid file was read
  confirm(): Promise<ImportResult>;
  cancel(): void;
};
```

- **Files it touches:** `src/services/exportService.ts`, `src/services/importService.ts`, `src/core/validation.ts` (deleted), `src/pages/LandingPage.tsx`, `src/pages/SettingsPage.tsx`, `src/contracts/types.ts` (`ExportEnvelope` moves with it).
- **Frees:** an export-format story (version 2, a CSV, a new field) no longer waits for a story on the landing or settings screens. It also removes a core -> services import (section 4).
- **Risk:** low. The envelope is the stable contract; keep `appName: "MySHAPE"` and `version: 1` byte-identical and add a test with a file made by the old code.
- **Size:** fits one story.

### Refactor 5. A settings store, and one panel per setting

- **Responsibility to carve out:** reading and writing the user's settings (theme, recipient email, later the language) in one place, and letting the Settings screen be a list of panels rather than one 216-line component.
- **New module:** settings/ (new), with entry settings/index.ts. It absorbs the localStorage code now in `src/contexts/ThemeContext.tsx`, `src/pages/SettingsPage.tsx` and `src/pages/FinalResultsPage.tsx`, which each hard-code the key strings.
- **API:**

```ts
export interface Settings { theme: "light" | "dark"; recipientEmail: string; locale: string }

export function useSetting<K extends keyof Settings>(key: K): [Settings[K], (value: Settings[K]) => void];

export interface SettingsPanel { id: string; title: string; Component: () => JSX.Element }
export const settingsPanels: readonly SettingsPanel[];   // Appearance, Email, Data, About
```

- **Files it touches:** `src/contexts/ThemeContext.tsx`, `src/hooks/useTheme.ts`, `src/pages/SettingsPage.tsx`, `src/pages/FinalResultsPage.tsx`, `src/contracts/types.ts`.
- **Frees:** a new option (language, text size) becomes a new panel file, not another block in `src/pages/SettingsPage.tsx`; the theme story and the email story stop colliding.
- **Risk:** low, with one trap: keep the current storage keys ("myshape-theme", "myshape-recipient-email") so existing users keep their settings.
- **Size:** does not fit one story. Split in two: (a) the store and the three readers, (b) the panels.

### Refactor 6. The PDF as one renderer per page

- **Responsibility to carve out:** drawing each of the 13 pages. `generatePDF` in `src/services/pdfService.ts` is one 400-line function with a hard-coded `totalPages = 13` and English text inline.
- **New module:** pdf/ (new), with entry pdf/index.ts, one file per page group (cover, gifts, heart, abilities, personality, experiences, summary).
- **API:**

```ts
export interface PdfContext { doc: jsPDF; pageWidth: number; pageHeight: number; margin: number; content: ShapeContent }
export interface PdfPage { id: string; render(ctx: PdfContext, assessment: Assessment): void }

export const pdfPages: readonly PdfPage[];
export function generatePDF(assessment: Assessment, content?: ShapeContent): jsPDF;
export function downloadPDF(assessment: Assessment): void;
```

- **Files it touches:** `src/services/pdfService.ts`, `src/pages/FinalResultsPage.tsx` (import path only).
- **Frees:** a layout story for the Heart page and one for the cover no longer edit the same function; page numbers come from `pdfPages.length`.
- **Risk:** medium. There are no tests on the PDF; pixel output cannot be compared in jsdom. Before the move, add a test that records the sequence of jsPDF text calls for a fixed assessment, and require it to be identical after.
- **Size:** fits one story if the text-call test is written first; otherwise split the test from the move.

### Refactor 7. One results module

- **Responsibility to carve out:** turning an assessment into its results (all gift scores, top three, DISC profile) once, so no screen calls the maths itself. `src/pages/FinalResultsPage.tsx`, `src/pages/SpiritualGiftsResultsPage.tsx`, `src/pages/PersonalityResultsPage.tsx` and `src/services/pdfService.ts` each call `calculateGiftScores`, `getTop3Gifts` or `calculateDISCScores` on their own.
- **New module:** results/ (new), with entry results/index.ts. The pure maths in `src/core/scoring.ts` and `src/core/disc.ts` stays where it is and is wrapped.
- **API:**

```ts
export interface ShapeResults {
  gifts: GiftScore[];          // all 19, highest first
  top3: GiftScore[];
  disc: DISCProfile;
}

export function buildResults(assessment: Assessment): ShapeResults;
export function GiftResultsList(props: { results: ShapeResults; showAll?: boolean }): JSX.Element;
export function DiscResultsCard(props: { results: ShapeResults }): JSX.Element;
```

- **Files it touches:** `src/pages/FinalResultsPage.tsx`, `src/pages/SpiritualGiftsResultsPage.tsx`, `src/pages/PersonalityResultsPage.tsx`, `src/services/pdfService.ts`, `src/core/scoring.ts`.
- **Frees:** the same results component renders in the section view and the final view (the rule "render the same text in two places through one component"), so a change to how scores are shown is one story, not three.
- **Risk:** low. Snapshot the rendered text of the three pages before moving.
- **Size:** fits one story.

### Refactor 8. Make the app shell a clean island, and split the types file

- **Responsibility to carve out:** the generic app pieces (toasts, theme provider, confirm dialog, error boundary, spinner, navigation guard) that carry no SHAPE knowledge, and the UI types currently kept in the domain contracts file.
- **New module:** shell/ (new), with entry shell/index.ts, holding the moved files; `src/contracts/types.ts` splits into contracts/assessment.ts and contracts/export.ts (both new), with `ThemeContextType`, `ToastMessage` and `PageHeaderProps` moving next to the components that own them.
- **API:** the existing signatures, unchanged, re-exported from one place:

```ts
export { ToastProvider, useToast } from "./toast";
export { ThemeProvider, useTheme } from "./theme";
export { ConfirmDialog, LoadingSpinner, ErrorBoundary } from "./feedback";
export { useNavigationGuard } from "./navigationGuard";
```

- **Files it touches:** `src/contexts/ThemeContext.tsx`, `src/contexts/ToastContext.tsx`, `src/hooks/useTheme.ts`, `src/hooks/useNavigationGuard.ts`, `src/components/feedback/` (all four files), `src/contracts/types.ts`, and every importer of those (most of the pages, `src/App.tsx`, `src/components/layout/PageHeader.tsx`).
- **Frees:** it is the prerequisite for the library lift in section 5 (the shell must import nothing from the SHAPE domain), and it stops a toast change from editing the file every data module imports.
- **Risk:** low per file, but it touches the most importers, so it conflicts with every other story in flight. Do it last, when no other story is open on this rig, or do it as import re-exports first (move nothing, add the entry file) and move the files after.
- **Size:** does not fit one story. Split in two: (a) the contracts split, (b) the shell move.

**Order of work.** Wave A, in parallel because their file sets do not overlap: 1 (the four questionnaire pages), 2 (hub, review page, routes) and 4 (the two services, `src/pages/LandingPage.tsx`, `src/pages/SettingsPage.tsx`). Wave B: 6 (the PDF, keeping `src/services/pdfService.ts` as a re-export so no screen changes) in parallel with 7 then 5, which run one after the other because both edit `src/pages/FinalResultsPage.tsx` (5 also edits `src/pages/SettingsPage.tsx`, so it follows 4). Wave C: 3, which touches the most pages. Wave D: 8, which touches every importer.

## 4. Rule breaks

Against 27-modular-boundaries.md, and the library rule "common code lives once". Each item names the file.

1. **A screen reads content directly instead of through an interface.** Seven screens and the PDF import `src/core/staticData.ts` or `src/core/giftMap.ts` by path: `src/pages/HeartPage.tsx`, `src/pages/PersonalityPage.tsx`, `src/pages/SpiritualGiftsPage.tsx`, `src/pages/AbilitiesPage.tsx`, `src/pages/ExperiencesPage.tsx`, `src/pages/SectionHubPage.tsx`, `src/pages/CompletedQuestionsPage.tsx`, `src/services/pdfService.ts` (the scoring module also imports `src/core/giftMap.ts`). The rule: content is read "through a repository, never by a screen reading JSON paths". Fix: refactor 3.
2. **Language is a constant.** Every label, question and message is an English literal in a screen or in `src/core/staticData.ts`; the PDF text is inline in `src/services/pdfService.ts`; the five scale labels ("Never true" ... "Always true") are typed three times (`src/components/forms/ScaleSelector.tsx`, `src/pages/CompletedQuestionsPage.tsx`, `src/services/pdfService.ts`). There is no language setting, so a second language means editing every screen. Fix: refactor 3.
3. **A screen talks to the browser store directly, and the key is typed twice.** `src/pages/SettingsPage.tsx` and `src/pages/FinalResultsPage.tsx` both read or write localStorage with the string "myshape-recipient-email" (the rule says one settings store); `src/contexts/ThemeContext.tsx` keeps its own key. Fix: refactor 5.
4. **A screen builds the mail link itself.** `src/pages/FinalResultsPage.tsx` assembles the `mailto:` link and calls window.open; the PDF-and-mail hand-off has no interface. It is small today and belongs with refactor 7's results or with a share module when a second way to send (share sheet) is added.
5. **Magic numbers that live in the data.** `src/pages/SectionHubPage.tsx` types 95, 5 and 24 where the data has the counts; `src/pages/HeartPage.tsx` types `TOTAL_STEPS = 6`; `src/services/pdfService.ts` types `totalPages = 13`. Fix: refactors 2 and 6.
6. **The same code in two places.** The file-pick / validate / confirm / import handlers are copied between `src/pages/LandingPage.tsx` and `src/pages/SettingsPage.tsx` (refactor 4). The section list is copied between `src/pages/SectionHubPage.tsx`, `src/pages/CompletedQuestionsPage.tsx` and `src/App.tsx` (refactor 2). The "sync from the database during render" block is copied across four pages (refactor 1).
7. **A lower layer imports a higher one.** `src/core/validation.ts` (core) re-exports from `src/services/importService.ts` (services). Nothing imports `src/core/validation.ts` (both screens import `validateExport` from the service), so it can simply go (refactor 4).
8. **UI types in the domain contracts.** `ThemeContextType`, `ToastMessage` and `PageHeaderProps` sit in `src/contracts/types.ts` with the data model (refactor 8).
9. **A module with no caller.** `src/hooks/useNavigationGuard.ts` is exported and imported nowhere in `src`. Either use it where a section can lose input, or let the library lift in section 5 take it.
10. **A copy of bsv-kit code: none.** No file under `src` mentions bsv, Postern or grist, so the "duplicate of bsv-kit" rule is not broken. The duplicates that do exist are of the scaffold pieces the other apps copied too (section 5).
11. **Nothing personal in code:** the one default that names the owner's world is the settings placeholder text "pastor@example.com", which is an example address. No key or hostname was found. The PWA scope names the repo path "/myshape/" in `vite.config.ts` by design.

## 5. Library candidates

The factory's rule (library best practices 01) is that code a second app also has goes into a public shared library, not a second file. The scaffold (`scaffold.md`) produced the same set of pieces in MySHAPE and in the trade-tracker app, which has its own copies in trade-tracker/src/contexts/toast-context.tsx, trade-tracker/src/contexts/theme-context.tsx, trade-tracker/src/components/feedback/confirm-dialog.tsx, trade-tracker/src/components/feedback/error-boundary.tsx, trade-tracker/src/components/feedback/loading-spinner.tsx, trade-tracker/src/hooks/use-navigation-guard.ts, trade-tracker/src/services/export-service.ts and trade-tracker/src/services/import-service.ts. The copies are the same idea with different signatures (for example `addToast(type, message)` here and `showToast(message, variant)` there; `ConfirmDialog` takes `danger` here and `variant="danger"` there), so adopting a library is a breaking change for at least one of the two apps. Lampas has its own ErrorBoundary.tsx (at the top of its src) and Postern its own toast (src/ui/toast.tsx). These were checked by listing the files and diffing the five pairs above; the other apps were not read further.

None of it belongs in bsv-kit: its four libraries are bsv (keys, door client, licence), grist (the mill client), tips (one-time tips through an injected storage) and composer (Postern's message composer), and none is general app chrome. The proposal is **one new public library, named pwa-kit** (a repo under the owner's GitHub account), with the entry points listed below; per library rule 02 each entry point is separate so an app takes only what it uses.

| Candidate (today's file) | Library and entry point | Proposed public API | Notes for versioning and trust |
|---|---|---|---|
| Debounced save with flush on unmount: `src/hooks/useAutoSave.ts` | pwa-kit, entry pwa-kit/react | `useDebouncedSave<T>(persist: (changes: T) => Promise<void> \| void, delayMs?: number): { save(changes: T): void; saveNow(changes: T): void; flush(): void }` | Today it is welded to `assessmentRepo`; the library version takes the writer as an argument. Highest value: the lost-answer bugs (e07f33e, 7b799e4) were exactly this logic. Needs a test for "flush on unmount" and "rapid saves keep the last". |
| Navigation guard: `src/hooks/useNavigationGuard.ts` | pwa-kit/react | `useNavigationGuard(when: boolean, message?: string): void` | Peer dependency on react-router. trade-tracker's copy differs in the router import (react-router vs react-router-dom); the library names one. |
| Theme provider: `src/contexts/ThemeContext.tsx`, `src/hooks/useTheme.ts` | pwa-kit/react | `ThemeProvider({ storageKey: string; children })`, `useTheme(): { theme: "light" \| "dark"; toggleTheme(): void }` | The storage key becomes an argument (nothing app-specific in the library). Keeps the "no side effects at import" rule: the document class is touched only inside the provider. |
| Toasts: `src/contexts/ToastContext.tsx`, `src/components/feedback/Toast.tsx` | pwa-kit/ui | `ToastProvider({ max?: number; autoDismissMs?: number; children })`, `useToast(): { show(message: string, variant?: "success" \| "error" \| "info" \| "warning"): void }` | The one API change that breaks both apps: pick a single signature, document it as breaking in the CHANGELOG, and give each app a one-line adapter during a window. Styled with Tailwind classes, so the README states Tailwind 4 as a peer requirement. |
| Confirm dialog, loading spinner, error boundary: `src/components/feedback/ConfirmDialog.tsx`, `src/components/feedback/LoadingSpinner.tsx`, `src/components/feedback/ErrorBoundary.tsx` | pwa-kit/ui | `ConfirmDialog({ open; title; message; confirmLabel?; cancelLabel?; variant?: "default" \| "danger"; onConfirm; onCancel })`, `LoadingSpinner({ size?: "sm" \| "md" \| "lg" })`, `ErrorBoundary({ children })` (a `fallback` prop is the one addition worth making) | All three exist in MySHAPE and trade-tracker, and Lampas has an error boundary of its own. UI entry point is declared DOM and React in its README; the no-DOM test of library rule 02 applies to the other entry points only. |
| Versioned JSON export / import envelope: `src/services/exportService.ts`, `src/services/importService.ts` | pwa-kit, entry pwa-kit/portability (pure) and pwa-kit/portability/browser (download, file read) | `buildEnvelope<T>(opts: { appName: string; version: number; type: "full" \| "single"; items: T[] }): Envelope<T>`, `parseEnvelope<T>(raw: unknown, opts: { appName: string; currentVersion: number; migrate?: Record<number, (data: unknown) => unknown> }): { ok: true; envelope: Envelope<T> } \| { ok: false; error: string }`, and in the browser entry `downloadJson(content: string, filename: string): void`, `readFileAsJson(file: File): Promise<unknown>` | Wire format: the envelope is a stored file format, so changes follow library rule 05 (accept old and new for a window; an upgrade message, not a generic failure, as `validateExport` already does for "created by a newer version"). The legacy "shape-assessment-v1" transform stays in the app; only the envelope and migration hook go to the library. The pure entry has a no-DOM test; the file / blob code is isolated in the browser entry. Do this after refactor 4 so the cut is already clean. |
| Section scoring (gift tally, DISC): `src/core/scoring.ts`, `src/core/disc.ts` | stays in the app | | Only MySHAPE has it; there is no second copy, so rule 01's "do not wait" test is not met. Revisit if a second assessment app appears. |
| PDF page renderers: `src/services/pdfService.ts` | stays in the app | | Entirely MySHAPE layout. Only a generic "wrap text at a width and add page numbers" helper could be shared, and no second app needs it yet. |

**Versioning every lifted package needs** (library best practices 04, 05, 07, 09):

- Public repo with nothing personal: no storage keys, e-mail addresses or app names in code, tests, fixtures or history; every such value is an argument. Grep before the first push.
- Semver from 0.1.0, a tag at the first release an app depends on, `package.json` version equal to the tag, and apps pin the tag or a full commit, never a branch. In 0.x a breaking change is a minor bump; once 1.0.0 is released it is a major bump.
- A CHANGELOG.md, newest first, with "breaking" first. The toast and confirm-dialog signature unification is the first breaking change and must be called out with its migration.
- A README with an install line that works, one short runnable example per entry point, and a licence file (MIT, library best practices 09).
- Tests that run in CI: unit tests for each hook and the envelope, a consumer smoke test that imports the built package the way an app does, and one contract test in each adopting app.
- Moving the apps is one story per app, deleting the app's copy in the same story, and the app's gate must pass (library rule 08). Order: build the library from MySHAPE's version of each piece after refactors 1, 4, 5 and 8 have made the cut clean; adopt it in MySHAPE first, then trade-tracker.
