/**
 * Expected DES metric ranges for classroom answer keys + regression checks.
 * Measured with seed from each preset (default seed 42), Run maxEvents=8000.
 * Tolerances are wide enough for teaching discussion, tight enough to catch engine breaks.
 */

import { DesEngine, type DesMetrics, type DesParams } from "./engine";
import { DES_PRESETS, type DesPresetId } from "./presets";

export type MetricRange = {
  th: [number, number];
  ct: [number, number];
  wip: [number, number];
  fr: [number, number];
  /** sim time days */
  T: [number, number];
  note: string;
};

/** Seed-42 snapshot ranges (approx ±12–20% around measured point). */
export const PRESET_EXPECTED: Record<DesPresetId, MetricRange> = {
  dasar: {
    th: [5.5, 8.5],
    ct: [0.28, 0.48],
    wip: [1.8, 3.5],
    fr: [0.05, 0.2],
    T: [14, 22],
    note: "Acuan seimbang. FR panel sering rendah (stockout) — kesempatan diskusi Inventory.",
  },
  var_tinggi: {
    th: [6.5, 9.5],
    ct: [0.28, 0.5],
    wip: [2.2, 4.0],
    fr: [0.08, 0.25],
    T: [12, 20],
    note: "ce/ca tinggi → utilisasi panel naik; Δ Kingman sering membesar (wajar).",
  },
  inv_ketat: {
    th: [4.2, 7.0],
    ct: [0.28, 0.5],
    wip: [1.4, 3.0],
    fr: [0.1, 0.35],
    T: [17, 28],
    note: "CONWIP=5 + buffer rendah → T naik, TH turun relatif Dasar.",
  },
  cap_longgar: {
    th: [12, 20],
    ct: [0.18, 0.35],
    wip: [3.0, 5.5],
    fr: [0.01, 0.1],
    T: [5, 11],
    note: "m naik / te turun → T jauh lebih pendek, TH naik kuat.",
  },
  wip_bebas: {
    th: [5.5, 8.5],
    ct: [0.28, 0.48],
    wip: [1.8, 3.5],
    fr: [0.05, 0.2],
    T: [14, 22],
    note: "CONWIP=40 ≫ WIP aktual — plafon Control praktis off; angka mirip Dasar.",
  },
  conwip_ketat: {
    th: [4.5, 7.2],
    ct: [0.28, 0.5],
    wip: [1.4, 3.0],
    fr: [0.2, 0.55],
    T: [16, 28],
    note: "CONWIP=4 menekan pelepasan job → T naik, TH turun vs WIP bebas.",
  },
};

export type VerifyOk = { id: DesPresetId; ok: true; metrics: DesMetrics };
export type VerifyFail = {
  id: DesPresetId;
  ok: false;
  metrics: DesMetrics;
  failures: string[];
};
export type VerifyResult = VerifyOk | VerifyFail;

function inRange(v: number, [lo, hi]: [number, number]): boolean {
  return Number.isFinite(v) && v >= lo && v <= hi;
}

export function checkMetricsAgainstRange(
  id: DesPresetId,
  m: DesMetrics,
): VerifyResult {
  const r = PRESET_EXPECTED[id];
  const failures: string[] = [];
  if (!inRange(m.th, r.th)) failures.push(`th=${m.th.toFixed(3)} not in [${r.th}]`);
  if (!inRange(m.avgCt, r.ct)) failures.push(`ct=${m.avgCt.toFixed(3)} not in [${r.ct}]`);
  if (!inRange(m.avgWip, r.wip)) failures.push(`wip=${m.avgWip.toFixed(3)} not in [${r.wip}]`);
  if (!inRange(m.fillRate, r.fr)) failures.push(`fr=${m.fillRate.toFixed(3)} not in [${r.fr}]`);
  if (!inRange(m.simTime, r.T)) failures.push(`T=${m.simTime.toFixed(3)} not in [${r.T}]`);
  if (m.completed < 100) failures.push(`completed=${m.completed} (expected ~122)`);
  if (failures.length) return { id, ok: false, metrics: m, failures };
  return { id, ok: true, metrics: m };
}

export function runPresetOnce(params: DesParams): DesMetrics {
  const eng = new DesEngine({ ...params });
  eng.run(8000);
  return eng.metrics();
}

/** Run all guided presets; returns failures for CI / instructor check. */
export function verifyAllPresets(): VerifyResult[] {
  return DES_PRESETS.map((p) => {
    const m = runPresetOnce(p.params);
    return checkMetricsAgainstRange(p.id, m);
  });
}
