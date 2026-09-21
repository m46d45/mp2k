/** Classroom navigation: deep-linkable door / step / preset / intro curve. */

export type Door = "intro" | "lab";
export type StepId = "case" | "sim" | "analytics" | "manual" | "stats" | "worksheet";
export type IntroCurve = "little" | "kingman" | "ctwip" | "inventory" | "control";

export type LabNav = {
  door: Door;
  step: StepId;
  /** Intro module when door=intro */
  curve?: IntroCurve;
  /** DES preset id when on sim */
  preset?: string;
  /** case density */
  caseMode?: "ringkas" | "lengkap";
};

const DOORS = new Set<Door>(["intro", "lab"]);
const STEPS = new Set<StepId>(["case", "sim", "analytics", "manual", "stats", "worksheet"]);
const CURVES = new Set<IntroCurve>(["little", "kingman", "ctwip", "inventory", "control"]);

export function parseLabNav(search: string): Partial<LabNav> {
  const q = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const out: Partial<LabNav> = {};
  const door = q.get("door");
  const step = q.get("step");
  const curve = q.get("curve");
  const preset = q.get("preset");
  const caseMode = q.get("case");

  if (door && DOORS.has(door as Door)) out.door = door as Door;
  if (step && STEPS.has(step as StepId)) out.step = step as StepId;
  if (curve && CURVES.has(curve as IntroCurve)) out.curve = curve as IntroCurve;
  if (preset && /^[a-z0-9_]+$/.test(preset)) out.preset = preset;
  if (caseMode === "ringkas" || caseMode === "lengkap") out.caseMode = caseMode;
  return out;
}

export function buildLabSearch(nav: LabNav): string {
  const q = new URLSearchParams();
  q.set("door", nav.door);
  if (nav.door === "lab" || nav.step === "manual" || nav.step === "stats" || nav.step === "worksheet") {
    q.set("step", nav.step);
  }
  if (nav.door === "intro" && nav.curve) q.set("curve", nav.curve);
  if (nav.door === "lab" && nav.step === "sim" && nav.preset) q.set("preset", nav.preset);
  if (nav.door === "lab" && nav.step === "case" && nav.caseMode) q.set("case", nav.caseMode);
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** Replace history without scroll jump. */
export function writeLabNav(nav: LabNav) {
  if (typeof window === "undefined") return;
  const next = `${window.location.pathname}${buildLabSearch(nav)}${window.location.hash}`;
  const cur = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next === cur) return;
  window.history.replaceState(window.history.state, "", next);
}

export function readLabNavFromLocation(): Partial<LabNav> {
  if (typeof window === "undefined") return {};
  return parseLabNav(window.location.search);
}
