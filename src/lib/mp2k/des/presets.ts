import { DEFAULT_DES_PARAMS, type DesParams } from "./engine";

export type DesPresetId = "dasar" | "var_tinggi" | "inv_ketat" | "cap_longgar";

export type DesPreset = {
  id: DesPresetId;
  label: string;
  short: string;
  /** Which lever this scenario emphasizes */
  lever: "baseline" | "variability" | "inventory" | "capacity";
  question: string;
  hint: string;
  params: DesParams;
};

/**
 * Guided experiment presets for the Simulasi lab.
 * Product & process design stay fixed; only C / V / I change.
 */
export const DES_PRESETS: DesPreset[] = [
  {
    id: "dasar",
    label: "Dasar",
    short: "Baseline seimbang",
    lever: "baseline",
    question: "Catat TH, CT rata-rata, WIP rata-rata, dan fill rate panel sebagai titik acuan.",
    hint: "Jalankan Run all, lalu bandingkan skenario lain ke angka ini.",
    params: { ...DEFAULT_DES_PARAMS },
  },
  {
    id: "var_tinggi",
    label: "Variability tinggi",
    short: "ce & ca naik",
    lever: "variability",
    question: "Naikkan variability: apa yang terjadi pada CT rata-rata dibanding Dasar? TH naik atau turun?",
    hint: "Kingman: CT membengkak saat utilisasi × V tinggi — lihat juga utilisasi resource.",
    params: {
      ...DEFAULT_DES_PARAMS,
      ca: 1.0,
      ce: 1.2,
      seed: 42,
    },
  },
  {
    id: "inv_ketat",
    label: "Inventory ketat",
    short: "CONWIP & buffer rendah",
    lever: "inventory",
    question: "CONWIP dan buffer panel diperketat: fill rate dan stockout berubah bagaimana? WIP rata-rata?",
    hint: "Inventory tuas: buffer kurang → stockout / FR turun; CONWIP ketat → WIP turun, bisa tekan TH.",
    params: {
      ...DEFAULT_DES_PARAMS,
      conwip: 5,
      panelBufferInitial: 1,
      panelLeadTime: 5,
      seed: 42,
    },
  },
  {
    id: "cap_longgar",
    label: "Capacity longgar",
    short: "m naik, te turun",
    lever: "capacity",
    question: "Capacity ditambah: T (sim time) dan TH berubah ke arah mana dibanding Dasar? Utilisasi turun?",
    hint: "Capacity tuas: lebih banyak resource / te lebih pendek → biasanya T turun, utilisasi per resource lebih rendah.",
    params: {
      ...DEFAULT_DES_PARAMS,
      mColumn: 3,
      mBeam: 3,
      mPanel: 2,
      teColumn: 0.35,
      teBeam: 0.25,
      tePanel: 0.18,
      seed: 42,
    },
  },
];

export function presetById(id: DesPresetId): DesPreset {
  return DES_PRESETS.find((p) => p.id === id) ?? DES_PRESETS[0];
}

/** True if current params match a preset (ignoring floating noise). */
export function matchPresetId(params: DesParams): DesPresetId | null {
  for (const p of DES_PRESETS) {
    if (paramsClose(params, p.params)) return p.id;
  }
  return null;
}

function paramsClose(a: DesParams, b: DesParams): boolean {
  const keys = Object.keys(b) as (keyof DesParams)[];
  return keys.every((k) => Math.abs(Number(a[k]) - Number(b[k])) < 1e-6);
}
