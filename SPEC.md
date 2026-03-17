# MySHAPE — Specification

**Version:** 1.1.0
**Author:** Jonathan (via Claude spec session)
**Date:** 2026-03-17
**Status:** Ready for implementation
**Scaffold:** Based on PWA App Scaffold Specification (see `scaffold.md`)

---

## 1. Overview

A Progressive Web App (MySHAPE) that digitizes the church SHAPE Assessment — a tool that helps believers discover how God has shaped them through their **S**piritual Gifts, **H**eart, **A**bilities, **P**ersonality, and **E**xperiences.

The app presents each assessment section one question/prompt at a time, calculates all scores, generates a PDF that closely matches the original paper layout, and allows the user to download or email the completed assessment to a pastor/leader.

### 1.1 Key Constraints

- **Offline-first PWA** — must work without network after initial load
- **No backend** — all logic client-side; email via `mailto:` link
- **Persistent progress** — IndexedDB (Dexie.js) for save/resume
- **Import/Export** — versioned JSON format for data portability
- **PDF generation** — client-side, matching original paper layout
- **Hosting:** GitHub Pages (static)
- **Scaffold compliance** — follows all patterns from `scaffold.md`

---

## 2. Tech Stack

Per scaffold specification — do NOT deviate from these versions:

| Layer | Technology | Version | Notes |
|---|---|---|---|
| UI framework | React | 19+ | Functional components, hooks only |
| Language | TypeScript | 5+ | Strict mode, no `any`, no unused vars/params |
| Build tool | Vite | 7+ | Fast HMR, ESM-native |
| Styling | Tailwind CSS | 4+ | Via `@tailwindcss/vite` plugin, utility-first |
| Routing | React Router | 7+ | Client-side, `createBrowserRouter` |
| Local database | Dexie (IndexedDB) | 4+ | Offline-first, no backend |
| Reactive queries | dexie-react-hooks | — | `useLiveQuery` for live UI updates |
| PWA | vite-plugin-pwa | 1+ | Workbox service worker, auto-update |
| PDF generation | jsPDF | latest | Client-side PDF creation |
| Testing | Vitest + Testing Library | — | Unit/component tests with `fake-indexeddb` |
| Linting | ESLint | 9+ | Flat config, React Hooks rules |

---

## 3. Project Structure

Per scaffold. MySHAPE-specific files noted with `# ←`:

```
src/
├── components/
│   ├── data-display/        # ResultsCard, GiftScoreBar, DISCChart, ProgressBar
│   ├── feedback/            # Toast, LoadingSpinner, ConfirmDialog, ErrorBoundary
│   ├── forms/               # ScaleSelector, ChipGrid, TraitGroupSelector, TextArea
│   └── layout/              # AppShell, BottomNav, PageHeader, SectionHub
├── contracts/
│   └── types.ts             # All TypeScript interfaces and types (single source of truth)
├── contexts/
│   ├── ThemeContext.tsx
│   └── AssessmentContext.tsx # ← current assessment state + navigation
├── core/                    # Pure business logic (no React, no side effects)
│   ├── scoring.ts           # ← Spiritual Gift scoring engine
│   ├── disc.ts              # ← DISC personality scoring engine
│   ├── giftMap.ts           # ← Question-to-gift mapping data
│   ├── staticData.ts        # ← All 95 questions, 24 trait groups, lists
│   └── validation.ts        # ← Import validation + migration chain
├── db/
│   ├── database.ts          # Dexie DB class, schema, singleton export
│   └── repositories/
│       └── assessmentRepo.ts # ← CRUD for assessment records
├── hooks/
│   ├── useAutoSave.ts       # ← debounced save hook
│   ├── useTheme.ts
│   └── useNavigationGuard.ts
├── pages/
│   ├── LandingPage.tsx
│   ├── SectionHubPage.tsx   # ← shows all 5 sections with status
│   ├── SpiritualGiftsPage.tsx
│   ├── SpiritualGiftsResultsPage.tsx
│   ├── HeartPage.tsx
│   ├── AbilitiesPage.tsx
│   ├── PersonalityPage.tsx
│   ├── PersonalityResultsPage.tsx
│   ├── ExperiencesPage.tsx
│   ├── FinalResultsPage.tsx # ← PDF download + email
│   ├── SettingsPage.tsx
│   └── NotFoundPage.tsx
├── services/
│   ├── exportService.ts     # ← JSON export
│   ├── importService.ts     # ← JSON import + validation + migration
│   └── pdfService.ts        # ← jsPDF generation
├── test/
│   └── setup.ts             # fake-indexeddb, jest-dom matchers
├── App.tsx                  # Router config + provider tree
├── index.css                # Tailwind import, CSS custom properties, safe-area padding
├── main.tsx                 # Entry point with PWA SW registration
└── vite-env.d.ts            # Vite + PWA type references
```

**Conventions (from scaffold):**
- Test files co-located: `scoring.test.ts` next to `scoring.ts`
- Named exports for components; default exports acceptable for pages
- One component per file
- Group components by function (data-display, feedback, forms, layout), not by feature
- All imports use `@/` path alias (`@/*` → `src/*`)

---

## 4. PWA Configuration

### 4.1 Manifest & Plugin (vite.config.ts)

```ts
VitePWA({
  registerType: "autoUpdate",
  includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm}"],
    navigateFallback: "index.html",
    navigateFallbackAllowlist: [/^(?!\/__).*/],
  },
  manifest: {
    name: "MySHAPE",
    short_name: "MySHAPE",
    description: "Discover how God has shaped you",
    theme_color: "#1a1a2e",
    background_color: "#ffffff",
    display: "fullscreen",
    display_override: ["fullscreen", "standalone"],
    orientation: "portrait",
    scope: "/",
    start_url: "/",
    icons: [
      { src: "icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  },
})
```

### 4.2 Meta Tags (index.html)

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#1a1a2e" />
<link rel="apple-touch-icon" href="icon-192.png" />
```

Also include the SPA routing redirect script per scaffold Section 12.3.

### 4.3 Fullscreen CSS (index.css)

```css
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#root {
  height: 100svh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 4.4 Service Worker Registration (main.tsx)

```tsx
import { registerSW } from "virtual:pwa-register";
registerSW({ immediate: true });
```

### 4.5 Icon

Generate a MySHAPE-specific icon (192px + 512px + maskable). Concept: a pentagon/shield shape (5 sides for S-H-A-P-E) with a subtle cross element. Colors should use the app's primary theme color.

### 4.6 Target Devices

Primary: Android tablets (Amazon Fire), Android phones
Secondary: iOS Safari, desktop Chrome/Firefox

---

## 5. App Shell & Navigation

### 5.1 Navigation Pattern: Bottom Tabs

MySHAPE uses **bottom tabs** with 3 tabs:

| Tab | Icon | Label | Route | Content |
|-----|------|-------|-------|---------|
| Home | house | Home | `/` | Landing page (start new, resume, import) |
| Assessment | clipboard | SHAPE | `/assessment` | Section hub → individual sections |
| Settings | gear | Settings | `/settings` | Appearance, data, about |

The Assessment tab is the primary workspace. When an assessment is in progress, this tab opens to the Section Hub. When no assessment exists, it redirects to Home.

### 5.2 Provider Tree (App.tsx)

```
ErrorBoundary
  └── ThemeProvider
        └── AssessmentProvider
              └── ToastProvider
                    └── RouterProvider
```

### 5.3 PageHeader Component

Every sub-page uses a consistent sticky header:

```tsx
interface PageHeaderProps {
  title: string;
  backTo?: string;       // Route path for back button (omit on top-level pages)
  rightAction?: ReactNode; // Optional action button(s)
}
```

- Sticky (`sticky top-0 z-10`)
- Dark mode aware
- Back arrow navigates via `<Link to={backTo}>` (not `history.back()`)

### 5.4 Navigation Guard

Implement `useNavigationGuard` hook using React Router's `useBlocker` + `beforeunload` listener. Warn before navigating away from in-progress questions with unsaved changes.

### 5.5 404 Route

Catch-all `path: "*"` renders NotFoundPage with a link home.

---

## 6. Dark Mode / Theming

### 6.1 Implementation

- **CSS strategy:** Tailwind class-based dark mode with `@custom-variant dark (&:where(.dark, .dark *));`
- **Toggle:** Add/remove `dark` class on `document.documentElement`
- **Persistence:** `localStorage` with key `myshape-theme`
- **Initial theme:** Check localStorage → fall back to `prefers-color-scheme: dark` → default `light`

### 6.2 Theme Context

```ts
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}
```

### 6.3 Semantic Colors (index.css)

```css
@theme {
  --color-primary: #1a1a2e;
  --color-primary-light: #16213e;
  --color-surface: #f8f9fa;
  --color-danger: #dc2626;
  --color-gift-high: #059669;    /* top spiritual gift scores */
  --color-gift-mid: #d97706;
  --color-gift-low: #6b7280;
  --color-disc-d: #ef4444;
  --color-disc-i: #f59e0b;
  --color-disc-s: #10b981;
  --color-disc-c: #3b82f6;
}
```

Every component must support both light and dark variants.

---

## 7. Data Model

### 7.1 Core Types (contracts/types.ts)

All types live in `src/contracts/types.ts` — single source of truth.

```typescript
// --- Entity types (stored in IndexedDB) ---

interface Assessment {
  id: string;                    // UUID via crypto.randomUUID()
  createdAt: number;             // epoch ms
  updatedAt: number;             // epoch ms
  status: AssessmentStatus;
  participant: Participant;
  spiritualGifts: SpiritualGiftsData;
  heart: HeartData;
  abilities: AbilitiesData;
  personality: PersonalityData;
  experiences: ExperiencesData;
}

type AssessmentStatus = "in_progress" | "complete";
type SectionStatus = "not_started" | "in_progress" | "complete";

interface Participant {
  name: string;
  email: string;
  church: string;
  date: string; // ISO date string
}

// --- Input types ---

type CreateAssessmentInput = Omit<Assessment, "id" | "createdAt" | "updatedAt">;
```

### 7.2 Spiritual Gifts Data

```typescript
interface SpiritualGiftsData {
  status: SectionStatus;
  answers: Record<string, number>; // keys "1"-"95", values 1-5
}
```

### 7.3 Heart Data

```typescript
interface HeartData {
  status: SectionStatus;
  reflectionQuestions: {
    whatDrivesYou: string;
    whoToHelp: string;
    needsDrawnTo: string;
    passionateCause: string;
  };
  peopleToServe: string[];       // exactly 3 from predefined list
  issuesAndCauses: string[];     // exactly 3 from predefined list
}
```

### 7.4 Abilities Data

```typescript
interface AbilitiesData {
  status: SectionStatus;
  selected: string[];            // exactly 5 from predefined list
}
```

### 7.5 Personality Data (DISC)

```typescript
interface PersonalityData {
  status: SectionStatus;
  groups: Record<string, { most: number; least: number }>;
  // keys "1"-"24", most/least = row index (0-3) within group
}
```

### 7.6 Experiences Data

```typescript
interface ExperiencesData {
  status: SectionStatus;
  studiedInSchool: string;
  occupation: string;
  hobbies: string;
  churchServing: string;
  painfulExperience: string;
}
```

---

## 8. Data Layer (Dexie)

### 8.1 Database (db/database.ts)

```ts
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
```

**Schema migration rules (from scaffold):**
- Never modify an existing `version()` call
- Add a new `this.version(N).stores({})` for schema changes
- Use `.upgrade(tx => ...)` for data migrations

### 8.2 Repository (db/repositories/assessmentRepo.ts)

```ts
class AssessmentRepository {
  async getAll(): Promise<Assessment[]>
  async getById(id: string): Promise<Assessment | undefined>
  async getInProgress(): Promise<Assessment | undefined>
  async create(input: CreateAssessmentInput): Promise<string>
  async update(id: string, changes: Partial<Assessment>): Promise<void>
  async delete(id: string): Promise<void>
  async deleteAll(): Promise<void>
}
```

- IDs: `string` type via `crypto.randomUUID()`
- Timestamps: `number` (epoch ms) via `Date.now()`

### 8.3 Reactive Queries

Use `useLiveQuery` from `dexie-react-hooks` in components:

```tsx
const assessment = useLiveQuery(() =>
  db.assessments.where("status").equals("in_progress").first()
);
```

### 8.4 Auto-Save

Custom `useAutoSave` hook:
- Debounced 500ms writes to IndexedDB on every answer/selection change
- Updates `updatedAt` timestamp on every save
- Section status transitions save immediately (no debounce)

### 8.5 Single Active Assessment

For v1, only one assessment is active at a time. Starting a new assessment when one exists prompts a confirmation dialog: "You have an unfinished assessment. Start fresh or resume?"

---

## 9. Import / Export

### 9.1 Export Format (versioned envelope per scaffold)

```json
{
  "appName": "MySHAPE",
  "version": 1,
  "exportedAt": 1710000000000,
  "type": "full",
  "data": {
    "assessments": [
      { "/* full Assessment object */" : "" }
    ]
  }
}
```

- `version` is an integer schema version (increment on breaking format changes)
- `exportedAt` is epoch milliseconds
- `type`: `"full"` (all assessments) or `"single"` (one assessment)
- Filename: `myshape-full-2026-03-17.json` or `myshape-single-2026-03-17.json`
- Triggers browser download via `Blob` + `URL.createObjectURL` + programmatic anchor click

### 9.2 Import with Migration

```ts
function migrateExport(data: ExportEnvelope): ExportEnvelope {
  let current = data;
  if (current.version === 1) {
    // current version, no migration needed
  }
  // future: if (current.version === 1) { current = migrateV1toV2(current); }
  return current;
}
```

**Import rules (from scaffold):**
- Validate JSON structure before import (required keys: `appName`, `version`, `data`)
- Reject if `appName` !== `"MySHAPE"` with clear error
- Reject if `version` > supported with: "This file was created by a newer version. Please update."
- Show **confirmation dialog** before importing (warn about data replacement)
- Skip records that already exist (match by `id`) or let user choose overwrite
- Show **success summary** (added count, skipped count, error count)
- Show clear error message if validation fails — do NOT partially import
- Validate all answer values are within expected ranges (1-5 for spiritual gifts, etc.)

### 9.3 Backward Compatibility with Pre-Scaffold Format

The import service should also recognize the `$schema: "shape-assessment-v1"` format used in the initial `jonathan_shape_data.json` file. When detected, transform it into the scaffold envelope format before processing. This is a one-time bridge migration.

```ts
function detectAndNormalize(raw: unknown): ExportEnvelope {
  if (hasProperty(raw, "$schema") && raw.$schema === "shape-assessment-v1") {
    return transformLegacyFormat(raw);
  }
  return raw as ExportEnvelope;
}
```

---

## 10. Spiritual Gifts — Scoring Engine

Located in `src/core/scoring.ts` — pure functions, no React, no side effects.

### 10.1 Question-to-Gift Mapping (core/giftMap.ts)

The 95 questions map to 19 spiritual gifts. Each gift has 5 questions. The answer key grid on page 6 defines the mapping by row:

| Row | Q col 1 | Q col 2 | Q col 3 | Q col 4 | Total slot | Gift Letter | Gift Name |
|-----|---------|---------|---------|---------|------------|-------------|-----------|
| 1 | 1 | 20 | 39 | 58 | 77 | A | Administration |
| 2 | 2 | 21 | 40 | 59 | 78 | B | Apostleship |
| 3 | 3 | 22 | 41 | 60 | 79 | C | Craftsmanship |
| 4 | 4 | 23 | 42 | 61 | 80 | D | Creative Communication |
| 5 | 5 | 24 | 43 | 62 | 81 | E | Discernment |
| 6 | 6 | 25 | 44 | 63 | 82 | F | Encouragement |
| 7 | 7 | 26 | 45 | 64 | 83 | G | Evangelism |
| 8 | 8 | 27 | 46 | 65 | 84 | H | Faith |
| 9 | 9 | 28 | 47 | 66 | 85 | I | Giving |
| 10 | 10 | 29 | 48 | 67 | 86 | J | Helps |
| 11 | 11 | 30 | 49 | 68 | 87 | K | Hospitality |
| 12 | 12 | 31 | 50 | 69 | 88 | L | Intercession |
| 13 | 13 | 32 | 51 | 70 | 89 | M | Knowledge |
| 14 | 14 | 33 | 52 | 71 | 90 | N | Leadership |
| 15 | 15 | 34 | 53 | 72 | 91 | O | Mercy |
| 16 | 16 | 35 | 54 | 73 | 92 | P | Prophecy |
| 17 | 17 | 36 | 55 | 74 | 93 | Q | Shepherding |
| 18 | 18 | 37 | 56 | 75 | 94 | R | Teaching |
| 19 | 19 | 38 | 57 | 76 | 95 | S | Wisdom |

**Scoring:** Total for each gift = sum of the 4 question scores (each 1-5). Max = 20, Min = 4.

### 10.2 Gift Descriptions

| Gift | Description |
|------|-------------|
| Administration | Organizing people, tasks, and events to achieve goals efficiently |
| Apostleship | Starting new churches or ministries where they do not yet exist |
| Craftsmanship | Working creatively with hands — wood, cloth, metal, glass, etc. |
| Creative Communication | Communicating God's truth through art, drama, music, writing |
| Discernment | Distinguishing between spiritual truth and error, good and evil |
| Encouragement | Strengthening and reassuring those who are discouraged |
| Evangelism | Communicating the gospel with clarity and effectiveness |
| Faith | Trusting God to answer prayer and accomplish great things |
| Giving | Contributing resources generously to support God's work |
| Helps | Working behind the scenes to support the work of others |
| Hospitality | Creating welcoming environments and caring for others' needs |
| Intercession | Praying consistently and faithfully on behalf of others |
| Knowledge | Seeking, studying, and understanding Biblical truth deeply |
| Leadership | Motivating and guiding others to accomplish goals and vision |
| Mercy | Empathizing with hurting people and helping in their healing |
| Prophecy | Boldly speaking truth that confronts and calls for change |
| Shepherding | Nurturing and providing long-term care and guidance for others |
| Teaching | Communicating Scripture so others can understand and apply it |
| Wisdom | Applying Biblical truth practically to life's complex situations |

### 10.3 Top 3 Identification

After scoring, identify the top 3 gifts by total score. Handle ties by preserving alphabetical order of gift letter.

---

## 11. Personality Section — DISC Scoring

Located in `src/core/disc.ts` — pure functions, no React, no side effects.

### 11.1 Structure

24 groups of 4 traits each (page 11 of source PDF). For each group, the user selects exactly 1 trait as **M** (Most) and exactly 1 trait as **L** (Least).

### 11.2 DISC Mapping

Each row position within every group maps to a DISC type. The standard mapping for this instrument:

| Row position (within group) | DISC Type |
|---|---|
| 1st (top) | D — Dominant/Driver |
| 2nd | I — Influencing/Inspiring |
| 3rd | S — Steady/Supportive |
| 4th | C — Conscientious/Cautious |

> **RESEARCH TASK FOR AGENT TEAM:** Verify this mapping against the specific trait words on page 11. Cross-reference group 1 traits ("Kind, softhearted, sweet" / "Influencing, convincing" / "Unassuming, composed, self-controlled" / "Independent, resourceful, one-of-a-kind") with known DISC instruments. The example row at the top of page 11 may provide clues — L on row 1, M on row 3.

### 11.3 DISC Scoring Algorithm

```
For each DISC type (D, I, S, C):
  M_count = number of times that type's row was selected as Most
  L_count = number of times that type's row was selected as Least

  "Most" graph value = M_count  (range 0-24)
  "Least" graph value = L_count (range 0-24)
  "Difference" = M_count - L_count
```

Primary personality type = highest M_count. Secondary = second-highest. Display as profile like "SI" or "DC".

### 11.4 DISC Type Descriptions

| Type | Name | Characteristics |
|------|------|-----------------|
| D | Dominant | Direct, decisive, competitive, results-oriented, enjoys challenges |
| I | Influencing | Enthusiastic, optimistic, collaborative, expressive, people-oriented |
| S | Steady | Patient, reliable, team-oriented, calm, values stability and harmony |
| C | Conscientious | Analytical, detail-oriented, accurate, systematic, quality-focused |

---

## 12. Static Content (core/staticData.ts)

All predefined lists. See Appendices A-D for full data.

### 12.1 People to Serve (Heart — select exactly 3)

Children, College Students, Disabled, Divorced, Elderly, Empty Nesters, Homeless, Hospitalized, Infants, Men, Parents, Poor, Prisoners, Single Parents, Singles, Teen Moms, Unemployed, Widowed, Women, Young Married, Youth, Other (free text)

### 12.2 Issues and Causes (Heart — select exactly 3)

Abuse/Violence, Alcoholism, At-risk Children, Compulsive Behavior, Deafness, Disabilities, Divorce, Drug Abuse, Education, Environment, Ethics, Finances, Health/Fitness, Terminal Sickness, Homelessness, Injustice Issues, Law/Justice System, Marriage/Family, Parenting, Policy/Politics, Poverty/Hunger, Sanctity of Life, Sexuality, Spiritual Apathy, Other (free text)

### 12.3 Abilities (select exactly 5)

Adapting, Administrating, Analyzing, Building, Coaching, Communicating, Competing, Computing, Connecting, Consulting, Cooking, Coordination, Counseling, Decorating, Designing, Developing, Directing, Editing, Encouraging, Engineering, Excelling, Facilitating, Forecasting, Implementing, Improving, Influencing, Landscaping, Leading, Learning, Managing, Mentoring, Motivating, Negotiating, Operating, Organizing, Performing, Persevering, Pioneering, Planning, Promoting, Recruiting, Repairing, Researching, Resourcing, Serving, Shopping, Strategizing, Teaching, Traveling, Visualizing, Welcoming, Writing

---

## 13. User Flow

### 13.1 Route Structure

```
/                              → LandingPage (start new, resume, import)
/assessment                    → SectionHubPage (5 sections with status)
/assessment/participant        → ParticipantInfoPage
/assessment/spiritual-gifts    → SpiritualGiftsPage (95 questions)
/assessment/spiritual-gifts/results → SpiritualGiftsResultsPage
/assessment/heart              → HeartPage (reflections + selections)
/assessment/abilities          → AbilitiesPage
/assessment/personality        → PersonalityPage (24 groups)
/assessment/personality/results → PersonalityResultsPage
/assessment/experiences        → ExperiencesPage
/assessment/results            → FinalResultsPage (PDF + email)
/settings                      → SettingsPage
*                              → NotFoundPage
```

### 13.2 Section Hub

Central navigation for the 5 SHAPE sections. Shows each section as a card with:
- Section letter and name (S, H, A, P, E)
- Status indicator: not started (gray), in progress (amber), complete (green checkmark)
- Progress detail (e.g., "42 of 95 answered")
- Tap to enter section

User is NOT forced to complete linearly — can jump between sections from the hub.

"View Results" button at the bottom, enabled only when all 5 sections are complete.

### 13.3 Question Presentation

**Spiritual Gifts (1-5 scale):**
- Display question text prominently
- 5 tappable buttons labeled 1-5 with anchors: "Never true" (1), "Sometimes true" (3), "Always true" (5)
- Selecting a value auto-advances after 300ms delay
- Back button to revisit previous question
- Progress bar + "Question X of 95"

**Heart — Reflection Questions:**
- One free-text question per screen
- Text area with generous height
- "Next" button (enabled even if blank — optional questions)

**Heart — Circle Selections:**
- Grid of tappable chips/cards
- Counter: "X of 3 selected"
- Once 3 selected, unselected items become disabled; tap a selected item to deselect
- "Other" option includes inline text field

**Abilities:**
- Same chip/card grid as Heart
- Counter: "X of 5 selected"

**Personality:**
- Display all 4 traits in current group
- Two-step selection: tap to mark "M" (Most), tap another for "L" (Least)
- M = solid green highlight, L = outline red highlight
- Cannot select same trait for both
- Must select both before advancing
- "Group X of 24" progress

**Experiences:**
- One free-text question per screen
- Generous text area
- "Next" button

---

## 14. PDF Generation (services/pdfService.ts)

### 14.1 Library

**jsPDF** for client-side PDF creation.

### 14.2 PDF Structure (13 pages)

| Page | Content |
|------|---------|
| 1 | Cover — "SHAPE ASSESSMENT" title, participant name, date, church |
| 2 | Spiritual Gifts intro — about, directions, scale |
| 3 | Questions 1-25 with filled answers |
| 4 | Questions 26-65 with filled answers |
| 5 | Questions 66-95 with filled answers + scale reminder |
| 6 | Answer Key grid — all answers, row totals, gift letters, Top 3 identified |
| 7 | Heart — reflection answers, People to Serve selections |
| 8 | Heart — Issues/Causes + Abilities with selections marked |
| 9-10 | Abilities list (continued) + Personality intro |
| 11 | Personality — 24 groups with M/L marked |
| 12 | Experiences — all 5 answers |
| 13 | **Results Summary** (extra page): Top 3 Gifts w/ scores + descriptions, DISC profile, Top 5 Abilities, Heart passions |

### 14.3 PDF Styling

- **Font:** Helvetica/Arial (built into jsPDF)
- **Layout:** Letter size (8.5" × 11")
- **Answer rendering:** Numbers in boxes for spiritual gifts, circles around selected items for Heart/Abilities, M/L letters for Personality, text blocks for free-text
- **Page numbers:** Bottom right, "Page X of 13"

### 14.4 Download

Triggers browser download: `myshape-{participantName}-{date}.pdf`

---

## 15. Email Integration

### 15.1 mailto: Link (v1)

- Recipient email configured in Settings (persisted in localStorage)
- "Email to Pastor/Leader" button on FinalResultsPage:
  1. Generates the PDF (same as download)
  2. Triggers PDF download
  3. Opens `mailto:` link:
     - **To:** configured recipient
     - **Subject:** "MySHAPE Assessment — {Name}"
     - **Body:** "Hi,\n\nPlease find my completed SHAPE Assessment attached.\n\n— {Name}"
  4. Toast: "PDF downloaded. Please attach it to the email that just opened."

---

## 16. Settings Page

Per scaffold Section 8:

| Section | Contents |
|---|---|
| **Appearance** | Dark/light mode toggle (sun/moon icons) |
| **Email** | Configure pastor/leader recipient email address |
| **Storage** | Display estimated storage usage via `navigator.storage.estimate()` with visual bar |
| **Data Management** | Export button, Import button, Clear All Data (danger zone) |
| **About** | "MySHAPE v1.0.0", "Offline-first • IndexedDB • No data leaves your device" |

### 16.1 Danger Zone

- "Clear All Data" button styled destructive (red, `text-danger`)
- Requires confirmation dialog: "This will permanently delete all assessments. This cannot be undone."
- Clears all Dexie tables
- Resets app to initial state (redirects to Landing)

---

## 17. Error Handling

### 17.1 Error Boundary

Class component wrapping entire app (per scaffold Section 9.1):
- Catches rendering errors via `getDerivedStateFromError`
- Logs to console via `componentDidCatch`
- Friendly error UI: error icon, message, "Try Again" button
- Dark mode aware

### 17.2 Toast Feedback System

App-wide toast notifications via `ToastProvider` context:
- States: success (green), error (red), info (blue), warning (amber)
- Auto-dismiss after 3 seconds
- Accessible (ARIA `role="status"`)
- Dark mode aware
- Used for: save confirmations, import results, validation errors, PDF generation status

---

## 18. CI/CD & Deployment

### 18.1 CI Workflow (`.github/workflows/ci.yml`)

Runs on push to `main` and PRs:

```
changes → detect modified paths (skip if no src changes)
  ├── lint (npm run lint) ─────────┐
  ├── typecheck (npx tsc -b) ──────┼── all three in parallel
  └── test (npm test) ─────────────┘
                                    ↓
                              build (npm run build)
```

### 18.2 Deploy Workflow (`.github/workflows/deploy.yml`)

Deploys to GitHub Pages on push to `main`:
- `npm ci` → `npm run build` → `upload-pages-artifact` (dist/) → `deploy-pages`
- Permissions: `contents: read`, `pages: write`, `id-token: write`
- Concurrency group: `pages` (cancel in-progress)

### 18.3 GitHub Pages SPA Routing

1. `public/404.html` — redirect script storing path in sessionStorage
2. `index.html` — inline script reading sessionStorage and replacing URL
3. Dynamic base URL in `vite.config.ts`:
   ```ts
   base: process.env.GITHUB_ACTIONS ? "/myshape/" : "/",
   ```
   Also set `scope` and `start_url` in manifest conditionally.

---

## 19. Testing Strategy

### 19.1 BDD Feature Files (`tests/features/`)

Gherkin `.feature` files as acceptance criteria:

```
tests/features/
├── pwa.feature                 # Installability, offline, fullscreen
├── navigation.feature          # Bottom nav, back button, 404
├── settings.feature            # Dark mode, storage, data management
├── export-import.feature       # All flows including legacy format bridge
├── dark-mode.feature           # Toggle, persistence, OS preference
├── spiritual-gifts.feature     # 95 questions, scoring, top 3
├── heart.feature               # Reflections, people, causes (enforce 3)
├── abilities.feature           # Selection (enforce 5)
├── personality.feature         # 24 groups, M/L enforcement, DISC scoring
├── experiences.feature         # Free text capture
├── pdf-generation.feature      # Layout, content, download
└── email.feature               # mailto flow
```

### 19.2 Unit Tests (Vitest)

**Setup (`src/test/setup.ts`):**
```ts
import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
```

**Priority test targets:**
- `core/scoring.ts` — gift totals, top 3, tie breaking
- `core/disc.ts` — M/L counting, profile type derivation
- `core/validation.ts` — import validation, migration chain
- `services/importService.ts` — legacy format bridge, envelope validation
- `db/repositories/assessmentRepo.ts` — CRUD operations

### 19.3 npm Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "test": "vitest run",
  "preview": "vite preview"
}
```

---

## 20. Code Conventions

Per scaffold Section 13:

| Rule | Detail |
|---|---|
| TypeScript strict mode | No `any`, no unused locals/params |
| Functional components | Hooks only, no class components (except ErrorBoundary) |
| Named exports | For all components; default exports acceptable for pages |
| Tailwind utility classes | No CSS modules, no styled-components, no inline styles |
| IDs | `string` (UUID via `crypto.randomUUID()`) |
| Timestamps | `number` (epoch ms) — never `Date` objects in storage |
| Imports | Always use `@/` path alias |
| ESLint | Flat config (`eslint.config.js`), includes `react-hooks/exhaustive-deps` |
| No over-engineering | No abstractions for single-use logic; no feature flags |

---

## 21. Workstreams

Structured for parallel agent implementation. Dependencies noted.

### WS-1: Project Scaffolding & PWA Shell
**Priority:** P0 (blocks all others)
**Scope:**
- Vite 7 + React 19 + TypeScript 5 project initialization
- Tailwind CSS 4 via `@tailwindcss/vite`
- Path alias `@/` → `src/` in tsconfig + vite config
- ESLint 9 flat config with React Hooks plugin
- Full project directory structure (Section 3)
- vite-plugin-pwa with manifest, service worker, meta tags, fullscreen CSS
- **Generate MySHAPE icon** (192px + 512px + maskable)
- React Router 7 with `createBrowserRouter` and routes from Section 13.1
- Dexie database class + initial schema (Section 8.1)
- `contracts/types.ts` with all interfaces (Section 7)
- ThemeContext with localStorage persistence + OS preference detection
- `@custom-variant dark` + semantic color theme in `index.css`
- ErrorBoundary component
- ToastProvider for user feedback
- AppShell layout with bottom tabs (Section 5.1)
- PageHeader component with `backTo` navigation
- `useNavigationGuard` hook (`useBlocker` + `beforeunload`)
- 404 catch-all route + NotFoundPage
- Provider tree wired in App.tsx (Section 5.2)
- `public/404.html` + SPA redirect script for GitHub Pages
- Dynamic `base` URL for GitHub Pages
- CI workflow (`.github/workflows/ci.yml`)
- Deploy workflow (`.github/workflows/deploy.yml`)
- Vitest config with `fake-indexeddb` + Testing Library
- Scaffold BDD feature files (pwa, navigation, settings, dark-mode)
- npm scripts (dev, build, lint, test, preview)

**Deliverable:** Deployable shell with navigation, theming, error handling, CI/CD

### WS-2: Data Layer & Import/Export
**Priority:** P0 (blocks WS-3 through WS-7)
**Depends on:** WS-1 (types + database)
**Scope:**
- `AssessmentRepository` with full CRUD (Section 8.2)
- `useAutoSave` hook — debounced 500ms, immediate on status transitions
- `useLiveQuery` integration for reactive UI
- Export service — scaffold envelope format (Section 9.1)
- Import service — validation, migration chain, confirmation flow (Section 9.2)
- Legacy `$schema: "shape-assessment-v1"` bridge migration (Section 9.3)
- Settings page: Appearance, Email config, Storage usage, Data Management, About, Danger Zone (Section 16)
- BDD feature files: `export-import.feature`, `settings.feature`
- Unit tests for validation + migration

**Deliverable:** Fully testable data layer with import/export and settings page

### WS-3: Spiritual Gifts UI + Scoring
**Priority:** P1
**Depends on:** WS-1, WS-2
**Scope:**
- All 95 questions as static data in `core/staticData.ts` (Appendix A)
- Question-to-gift mapping in `core/giftMap.ts` (Section 10.1)
- Scoring engine in `core/scoring.ts` (pure functions)
- `ScaleSelector` form component (1-5 with auto-advance)
- `SpiritualGiftsPage` — question-by-question with progress bar
- `SpiritualGiftsResultsPage` — top 3 gifts + all scores + descriptions
- `GiftScoreBar` data-display component
- Gift descriptions (Section 10.2)
- BDD feature file: `spiritual-gifts.feature`
- Unit tests for `scoring.ts`

**Deliverable:** Complete S section, playable end-to-end

### WS-4: Heart Section UI
**Priority:** P1
**Depends on:** WS-1, WS-2
**Scope:**
- Predefined lists in `core/staticData.ts` (Sections 12.1, 12.2)
- 4 reflection question screens (free text, `TextArea` component)
- `ChipGrid` form component — tappable chips with counter and "Other" inline text
- People to Serve selection (enforce exactly 3)
- Issues & Causes selection (enforce exactly 3)
- `HeartPage` with sub-navigation between reflections and selections
- BDD feature file: `heart.feature`

**Deliverable:** Complete H section

### WS-5: Abilities Section UI
**Priority:** P1
**Depends on:** WS-1, WS-2 (and `ChipGrid` from WS-4 if shared)
**Scope:**
- Full abilities list in `core/staticData.ts` (Section 12.3)
- `AbilitiesPage` — reuses `ChipGrid` with enforce-exactly-5
- Brief definition subtitle for each ability (from source PDF pages 8-10)
- BDD feature file: `abilities.feature`

**Deliverable:** Complete A section

### WS-6: Personality Section UI + DISC Scoring
**Priority:** P1
**Depends on:** WS-1, WS-2
**Scope:**
- All 24 trait groups in `core/staticData.ts` (Appendix B)
- **RESEARCH SUB-TASK:** Verify DISC row mapping against trait words (Section 11.2)
- DISC scoring engine in `core/disc.ts` (pure functions)
- `TraitGroupSelector` form component — M/L two-step selection with enforcement
- `PersonalityPage` — group-by-group with progress
- `PersonalityResultsPage` — DISC profile type, chart, descriptions
- `DISCChart` data-display component (color-coded bar chart per type)
- BDD feature file: `personality.feature`
- Unit tests for `disc.ts`

**Deliverable:** Complete P section

### WS-7: Experiences Section UI
**Priority:** P1
**Depends on:** WS-1, WS-2
**Scope:**
- 5 free-text question screens (Appendix C)
- `ExperiencesPage` — one question per screen, "Next" button
- BDD feature file: `experiences.feature`

**Deliverable:** Complete E section

### WS-8: PDF Generation + Email
**Priority:** P2
**Depends on:** WS-3, WS-4, WS-5, WS-6, WS-7
**Scope:**
- jsPDF integration in `services/pdfService.ts`
- 13-page layout matching original document (Section 14)
- Answer rendering for all section types
- Calculated totals on answer key page
- Results summary page (page 13)
- `FinalResultsPage` — results overview + Download PDF + Email to Pastor buttons
- `mailto:` integration using configured recipient (Section 15)
- BDD feature files: `pdf-generation.feature`, `email.feature`

**Deliverable:** Downloadable/emailable PDF from completed assessment

### WS-9: Polish & Testing
**Priority:** P2
**Depends on:** All above
**Scope:**
- Complete all remaining unit tests
- Integration tests: import → fill → export → reimport roundtrip
- Responsive design audit (phone, tablet, desktop, Amazon Fire)
- Accessibility audit (keyboard nav, screen readers, ARIA, color contrast)
- Offline testing (service worker, all features work disconnected)
- Edge cases: incomplete imports, mid-section resume, tie-breaking, overwrite prompts
- Lighthouse PWA score ≥ 90
- Verify fullscreen mode on mobile
- Verify dark mode across all pages
- Performance: first paint < 2s, bundle < 500KB gzipped (excl. jsPDF)

**Deliverable:** Production-ready app

---

## 22. Acceptance Criteria

### 22.1 Functional

- [ ] All 95 spiritual gift questions presented one at a time with 1-5 scale
- [ ] Spiritual gift scoring matches hand-calculated totals
- [ ] Top 3 gifts correctly identified with descriptions
- [ ] Heart section enforces exactly 3 selections for each list
- [ ] Abilities section enforces exactly 5 selections
- [ ] Personality section enforces exactly 1 M and 1 L per group
- [ ] DISC profile computed and displayed
- [ ] All free-text fields captured and rendered in PDF
- [ ] PDF generated with 13 pages matching original layout
- [ ] PDF download works on Android Chrome and iOS Safari
- [ ] mailto: link opens with correct recipient, subject, body
- [ ] Import loads valid JSON (both scaffold envelope + legacy format)
- [ ] Import shows confirmation dialog before replacing data
- [ ] Import shows success summary (added/skipped/errors)
- [ ] Import rejects invalid/future-version files with clear errors
- [ ] Export produces valid, re-importable JSON
- [ ] Progress auto-saves; closing and reopening resumes
- [ ] App works fully offline after initial load
- [ ] App installable as PWA on Android
- [ ] Dark mode toggle works and persists across sessions
- [ ] Settings page shows storage usage
- [ ] Clear All Data requires confirmation and resets app
- [ ] 404 page renders for unknown routes
- [ ] Navigation guard warns on unsaved changes

### 22.2 Non-Functional

- [ ] First meaningful paint < 2 seconds
- [ ] Total bundle size < 500KB gzipped (excluding jsPDF)
- [ ] Works on Amazon Fire tablet (Android WebView)
- [ ] Lighthouse PWA score ≥ 90
- [ ] All CI checks pass (lint, typecheck, test, build)
- [ ] Deploys to GitHub Pages via Actions

---

## Appendix A: Spiritual Gift Assessment Questions

Transcribed exactly from pages 3-5. Questions 1-95, rated on 1-5 scale.

```
1. I like to organize people, tasks, and events.
2. I would like to start churches in places where they do not presently exist.
3. I enjoy working creatively with wood, cloth, paints, metal, glass, or other materials.
4. I enjoy challenging people's perspective of God by using various forms of art.
5. I can readily distinguish between spiritual truth and error, good and evil.
6. I tend to see the potential in people.
7. I communicate the gospel to others with clarity and effectiveness.
8. I find it natural and easy to trust God to answer my prayers.
9. I give liberally and joyfully to people in financial need or to projects requiring support.
10. I enjoy working behind the scenes to support the work of others.
11. I view my home as a place to minister to people in need.
12. I take prayer requests from others and consistently pray for them.
13. I am asked by people who want to know my perspective on a particular passage or biblical truth.
14. I am able to motivate others to accomplish a goal.
15. I empathize with hurting people and desire to help in their healing process.
16. I can speak in a way that results in conviction and change in the lives of others.
17. I enjoy spending time nurturing and caring for others.
18. I am able to communicate God's work effectively.
19. I am often sought out by others for advice about spiritual or personal matters.
20. I am careful, thorough, and skilled at managing details.
21. I am attracted to the idea of serving in another country or ethnic community.
22. I am skilled in working with different kinds of tools.
23. I enjoy developing and using my artistic skills. (art, drama, music, photography, etc.)
24. I frequently am able to judge a person's character based upon first impressions.
25. I enjoy reassuring and strengthening those who are discouraged.
26. I consistently look for opportunities to build relationships with non-Christians.
27. I have confidence in God's continuing provision and help, even in difficult times.
28. I give more than a tithe so that kingdom work can be accomplished.
29. I enjoy doing routine tasks that support the ministry.
30. I enjoy meeting new people and helping them to feel welcomed.
31. I enjoy praying for long periods of time and always feel impressed on what to pray for.
32. I receive information from the Spirit that I did not acquire through natural means.
33. I am able to influence others to achieve a vision.
34. I can patiently support those going through painful experiences as they try to stabilize their lives.
35. I feel responsible to confront others with the truth.
36. I have compassion for wandering believers and want to protect them.
37. I can spend time in study knowing that presenting truth will make a difference in people's lives.
38. I can often find simple, practical solutions in the midst of conflict or confusion.
39. I can clarify goals and develop strategies or plans to accomplish them.
40. I am willing to take an active part in starting a new church.
41. I enjoy making things for use in ministry.
42. I help people understand themselves, others and God better through artistic expression.
43. I can see through phoniness or deceit before it is evident to others.
44. I give hope to others by directing them to the promises of God.
45. I am effective at adapting the gospel message so that it connects with an individual's felt needs.
46. I believe that God will help me to accomplish great things.
47. I manage my money well in order to free more of it for giving.
48. I willingly take on a variety of odd jobs around the church to meet the needs of others.
49. I genuinely believe the Lord directs strangers to me who need to get connected to others.
50. I am conscious of ministering to others as I pray.
51. I am committed to reading and studying Scripture, to understand Biblical truth fully.
52. I can adjust my leadership style to bring out the best in others.
53. I enjoy helping people sometimes regarded as undeserving or beyond help.
54. I boldly expose cultural trends, teachings, or events, which contradict Biblical principles.
55. I like to provide guidance for the whole person – relationally, emotionally, spiritually, etc...
56. I devote considerable time to learning new Biblical truths in order to communicate them to others.
57. I can easily select the most effective course of action from among several alternatives.
58. I can identify and effectively use the resources needed to accomplish tasks.
59. I can adapt well to different cultures and surroundings.
60. I can visualize how something should be constructed before I build it.
61. I like finding new and fresh ways of communicating God's truth.
62. I tend to see rightness or wrongness in situations.
63. I reassure those who need to take courageous action in their faith, family, or life.
64. I invite unbelievers to accept Christ as their Savior.
65. I trust God in circumstances where success cannot be guaranteed by human effort alone.
66. I am challenged to limit my lifestyle in order to give away higher percentages of my income.
67. I see spiritual significance in doing practical tasks.
68. I like to create a place where people do not feel that they are alone.
69. I pray with confidence because I know that God works in response to prayer.
70. I have insight or just know something to be true.
71. I set goals and manage people and resources effectively to accomplish them.
72. I have great compassion for hurting people.
73. I see most actions as right or wrong, and feel the need to correct the wrong.
74. I can faithfully provide long-term support and concern for others.
75. I like to take a systematic approach to my study of the Bible.
76. I can anticipate the likely consequences of an individual's or a group's action.
77. I like to help organizations or groups become more efficient.
78. I can relate to others in culturally sensitive ways.
79. I honor God with my handcrafted gifts.
80. I apply various artistic expressions to communicate God's truth.
81. I receive affirmation from others concerning the reliability of my insights or perceptions.
82. I strengthen those who are wavering in their faith.
83. I openly tell people that I am a Christian and want them to ask me about my faith.
84. I am convinced of God's daily Presence and action in my life.
85. I like knowing that my financial support makes a real difference in the lives of God's people.
86. I like to find small things that need to be done and often do them without being asked.
87. I enjoy entertaining people and opening my home to others.
88. When I hear about needy situations, I feel burdened to pray.
89. I have suddenly known some things about others, but did not know how I knew them.
90. I influence others to perform to the best of their capability.
91. I can look beyond a person's handicaps or problems to see a life that matters to God.
92. I like people who are honest and will speak the truth.
93. I enjoy giving guidance and practical support to a small group of people.
94. I can communicate Scripture in ways that motivate others to study and want to learn more.
95. I give practical advice to help others through complicated situations.
```

---

## Appendix B: Personality Trait Groups

Transcribed from page 11. 24 groups of 4 traits. Row order is significant for DISC scoring.

```
Group 1:
  1. Kind, softhearted, sweet
  2. Influencing, convincing
  3. Unassuming, composed, self-controlled
  4. Independent, resourceful, one-of-a-kind

Group 2:
  1. Likeable, fascinating, fun
  2. Reasonable, fair
  3. Willful, firm, decision-maker
  4. Supportive, pleasant, warm

Group 3:
  1. Observant, careful
  2. Brave, unafraid, likes a challenge
  3. Faithful, steadfast
  4. Appealing, refreshing, lively

Group 4:
  1. Objective, balanced, open-minded
  2. Willing to help, thoughtful
  3. Determined, unbending, stubborn
  4. Lighthearted, upbeat

Group 5:
  1. Humorous, funny
  2. Specific, exact, correct
  3. Gutsy, daring, bold
  4. Relaxed, content, not excitable

Group 6:
  1. Aggressive, driven, wants to win
  2. Accommodating, considers others, caring
  3. Excitable, fun-seeking
  4. Conforming, cooperative

Group 7:
  1. Particular, choosy
  2. Devoted, loyal, attends to duties
  3. Tough-minded, unyielding, purposeful
  4. Animated, fun-loving, joking

Group 8:
  1. Confident, courageous, fearless
  2. Inspiring, influential, enthusiastic
  3. Does not resist, submits easily
  4. Avoids attention, modest

Group 9:
  1. Outgoing, makes friends easily
  2. Patient, lenient, shows mercy, stable
  3. Self-sufficient, goal achieving
  4. Private, subdued, appropriate

Group 10:
  1. Risk-taking, thrill-seeking, daring
  2. Teachable, willing to be convinced
  3. Sociable, big-hearted, personable
  4. Agreeable, easygoing, not extreme

Group 11:
  1. Expressive, likes to talk
  2. Moderate, easily swayed
  3. Follows routine, decides carefully
  4. Self-confident, makes decisions quickly and easily

Group 12:
  1. Persuasive, smooth, at ease with people
  2. Adventurous, unflinching
  3. Courteous, respectful, tactful
  4. Contented, easily pleased

Group 13:
  1. Enjoys competition, persistent, entrepreneur
  2. Life of the party, entertaining, draws attention
  3. Vulnerable, gullible, easily influenced
  4. Anxious, apprehensive, hesitant

Group 14:
  1. Watchful, cautious, weighs risks
  2. Ambitious, takes charge
  3. Wholeheartedly convinced, talks others into
  4. Comfortable, good-natured, welcoming

Group 15:
  1. Ready to help, goes along with, trusting
  2. Easily excited, high strung
  3. Compliant, follows rules, not argumentative
  4. Vibrant, enterprising, energetic

Group 16:
  1. Self-assured, positive, optimistic
  2. Kindhearted, sentimental, responsive
  3. Evaluating, examining, questioning
  4. Assertive, forceful, alert

Group 17:
  1. Self-disciplined, controlled, methodical
  2. Unselfish, concerned for others
  3. Demonstrates feelings and emotions outwardly
  4. Committed, not easily defeated nor discouraged

Group 18:
  1. Commendable, desires recognition
  2. Pleasing, sharing, gracious
  3. Selective, chooses carefully
  4. Emphatic, insistent, demanding

Group 19:
  1. Formal, shows proper respect, restrained
  2. Innovative, pioneering, tries new things
  3. Happy, expects good things to happen
  4. Harmonious, obliging, helpful

Group 20:
  1. Confronting, challenging
  2. Adjustable, able to change
  3. Unruffled, indifferent, casual
  4. Cheerful, unworried, playful

Group 21:
  1. Believes in others, open, trustful
  2. At peace, pleased, satisfied
  3. Unquestionable confidence, certain
  4. Even-tempered, level-headed, unhurried

Group 22:
  1. Compatible, enjoys people, popular
  2. Informed, refined, perceptive
  3. Dynamic, powerful, spirited
  4. Tolerant, compassionate, merciful

Group 23:
  1. Fun to be with, sociable
  2. Precise, factual, accurate
  3. Direct, speaks frankly
  4. Quiet, soft-spoken, reserved

Group 24:
  1. Restless, fidgety, easily bored
  2. Peaceable, helps others, friendly
  3. Well-liked, impulsive, charming
  4. Systematic, tidy, attentive to details
```

---

## Appendix C: Experience Questions

From page 12:

```
1. What did you study in school?
2. What do you do for a living? If retired, what did you do?
3. What hobbies do you enjoy?
4. Within the church, where have you enjoyed serving in the past?
5. Many times, your passion will come out of your pain in life. If you are able & willing, please share the most painful experience that you have been through in your life.
```

---

## Appendix D: Scaffold Checklist

All scaffold items must be completed in WS-1 before domain work begins:

- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS 4 via `@tailwindcss/vite`
- [ ] Set up path alias (`@/` → `src/`)
- [ ] Set up ESLint flat config with React Hooks plugin
- [ ] Create project structure (all directories from Section 3)
- [ ] Configure PWA plugin with MySHAPE name, description, colors
- [ ] **Generate MySHAPE icon** (192px + 512px + maskable)
- [ ] Add favicon.svg
- [ ] Configure `index.html` meta tags
- [ ] Add fullscreen CSS (safe areas, `100svh`, overflow handling)
- [ ] Register service worker in `main.tsx`
- [ ] Create Dexie database class with initial schema version
- [ ] Create `contracts/types.ts` with all entity types
- [ ] Implement ThemeContext with localStorage persistence + OS preference
- [ ] Add `@custom-variant dark` and semantic color theme to `index.css`
- [ ] Implement ErrorBoundary component
- [ ] Implement toast feedback system
- [ ] Create AppShell layout with bottom tabs
- [ ] Create PageHeader component with back navigation
- [ ] Implement navigation guard hook
- [ ] Set up React Router with catch-all 404 route
- [ ] Wire up provider tree in `App.tsx`
- [ ] Build Settings page (appearance, email, storage, data, about)
- [ ] Implement versioned JSON export
- [ ] Implement JSON import with validation, confirmation, migration
- [ ] Add `public/404.html` for GitHub Pages SPA routing
- [ ] Add SPA redirect script to `index.html`
- [ ] Configure dynamic `base` URL for GitHub Pages
- [ ] Set up CI workflow
- [ ] Set up deploy workflow
- [ ] Configure Vitest with `fake-indexeddb` and Testing Library
- [ ] Write scaffold BDD feature files
- [ ] Verify PWA installability
- [ ] Verify fullscreen mode on mobile
- [ ] Verify dark mode toggle + persistence + OS preference fallback
- [ ] Verify export → import round-trip
