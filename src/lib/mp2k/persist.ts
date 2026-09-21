/** localStorage helpers for classroom continuity (intro progress, case mode, worksheet). */

import type { IntroCurve } from "./nav";

const INTRO_KEY = "mp2k.intro.done.v1";
const CASE_MODE_KEY = "mp2k.case.mode.v1";
const WORKSHEET_KEY = "mp2k.worksheet.v1";
const COHORT_KEY = "mp2k.cohort.label.v1";

export type IntroDone = Record<IntroCurve, string[]>;

export const EMPTY_INTRO_DONE: IntroDone = {
  little: [],
  kingman: [],
  ctwip: [],
  inventory: [],
  control: [],
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadIntroDone(): IntroDone {
  if (!canUseStorage()) return { ...EMPTY_INTRO_DONE, little: [], kingman: [], ctwip: [], inventory: [], control: [] };
  try {
    const raw = window.localStorage.getItem(INTRO_KEY);
    if (!raw) return { ...EMPTY_INTRO_DONE };
    const parsed = JSON.parse(raw) as Partial<IntroDone>;
    return {
      little: Array.isArray(parsed.little) ? parsed.little.filter((x) => typeof x === "string") : [],
      kingman: Array.isArray(parsed.kingman) ? parsed.kingman.filter((x) => typeof x === "string") : [],
      ctwip: Array.isArray(parsed.ctwip) ? parsed.ctwip.filter((x) => typeof x === "string") : [],
      inventory: Array.isArray(parsed.inventory) ? parsed.inventory.filter((x) => typeof x === "string") : [],
      control: Array.isArray(parsed.control) ? parsed.control.filter((x) => typeof x === "string") : [],
    };
  } catch {
    return { ...EMPTY_INTRO_DONE };
  }
}

export function saveIntroDone(done: IntroDone) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(INTRO_KEY, JSON.stringify(done));
  } catch {
    /* quota / private mode */
  }
}

export function clearIntroDone() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(INTRO_KEY);
}

export type CaseMode = "ringkas" | "lengkap";

export function loadCaseMode(): CaseMode {
  if (!canUseStorage()) return "lengkap";
  const v = window.localStorage.getItem(CASE_MODE_KEY);
  return v === "ringkas" ? "ringkas" : "lengkap";
}

export function saveCaseMode(mode: CaseMode) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(CASE_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export type WorksheetAnswers = {
  nama: string;
  kelompok: string;
  presetNotes: Record<string, string>;
  deltaExplain: string;
  updatedAt: string;
};

export const EMPTY_WORKSHEET: WorksheetAnswers = {
  nama: "",
  kelompok: "",
  presetNotes: {},
  deltaExplain: "",
  updatedAt: "",
};

export function loadWorksheet(): WorksheetAnswers {
  if (!canUseStorage()) return { ...EMPTY_WORKSHEET };
  try {
    const raw = window.localStorage.getItem(WORKSHEET_KEY);
    if (!raw) return { ...EMPTY_WORKSHEET };
    const p = JSON.parse(raw) as Partial<WorksheetAnswers>;
    return {
      nama: typeof p.nama === "string" ? p.nama : "",
      kelompok: typeof p.kelompok === "string" ? p.kelompok : "",
      presetNotes:
        p.presetNotes && typeof p.presetNotes === "object"
          ? Object.fromEntries(
              Object.entries(p.presetNotes).filter(([, v]) => typeof v === "string") as [string, string][],
            )
          : {},
      deltaExplain: typeof p.deltaExplain === "string" ? p.deltaExplain : "",
      updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : "",
    };
  } catch {
    return { ...EMPTY_WORKSHEET };
  }
}

export function saveWorksheet(w: WorksheetAnswers) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(
      WORKSHEET_KEY,
      JSON.stringify({ ...w, updatedAt: new Date().toISOString() }),
    );
  } catch {
    /* ignore */
  }
}

export function loadCohortLabel(): string {
  if (!canUseStorage()) return "";
  return window.localStorage.getItem(COHORT_KEY) ?? "";
}

export function saveCohortLabel(label: string) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(COHORT_KEY, label.slice(0, 80));
  } catch {
    /* ignore */
  }
}
