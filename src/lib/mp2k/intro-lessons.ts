import {
  formatNum,
  formatPct,
  inventoryFillRate,
  kingmanCTnorm,
  KINGMAN_V_LEVELS,
  KINGMAN_Y_MAX,
  buildWipThCtChart,
} from "@/lib/mp2k/ops-science";

export type IntroCurve = "little" | "kingman" | "inventory" | "control";

export const INTRO_CURVES: {
  id: IntroCurve;
  n: string;
  label: string;
  question: string;
}[] = [
  {
    id: "little",
    n: "1",
    label: "Grafik Little's Law",
    question: "Di sistem yang stabil, dua diketahui — yang ketiga wajib berapa?",
  },
  {
    id: "kingman",
    n: "2",
    label: "Grafik Kingman's Equation",
    question: "Mengapa CT meledak dekat kapasitas, dan mengapa V memperparah?",
  },
  {
    id: "inventory",
    n: "3",
    label: "Grafik Inventory & Fill Rate",
    question: "Berapa stok supaya tidak kosong — dan kapan stok tambahan sia-sia?",
  },
  {
    id: "control",
    n: "4",
    label: "Control & CONWIP",
    question: "Berapa WIP yang boleh hidup di sistem — dan apa akibatnya pada TH dan CT?",
  },
];

export type LittlePoint = { wip: number; th: number; ct: number };

export const LITTLE_BASE: LittlePoint = { wip: 8, th: 2, ct: 4 };

export type IntroScenario<T> = {
  id: string;
  label: string;
  say: string;
  valid: boolean;
  apply: T;
};

export const LITTLE_SCENARIOS: IntroScenario<LittlePoint>[] = [
  {
    id: "L1",
    label: "TH tetap, WIP menjadi 2×",
    say: "Lebih banyak yang mengendap, lama di sistem ikut naik.",
    valid: true,
    apply: { wip: 16, th: 2, ct: 8 },
  },
  {
    id: "L2",
    label: "WIP tetap, TH naik",
    say: "Kalau stok di sistem dikunci, aliran lebih kencang mempersingkat waktu.",
    valid: true,
    apply: { wip: 8, th: 4, ct: 2 },
  },
  {
    id: "L3",
    label: "TH dan CT tetap, WIP diturunkan",
    say: "Tidak boleh menurunkan WIP tanpa mengubah TH atau CT.",
    valid: false,
    apply: { wip: 8, th: 2, ct: 4 },
  },
];

export const LITTLE_ATTEMPT: LittlePoint = { wip: 4, th: 2, ct: 4 };

export function littleLine(th: number): { wip: number; ct: number }[] {
  const t = Math.max(th, 0.25);
  const out: { wip: number; ct: number }[] = [];
  for (let w = 0; w <= 20; w += 0.5) out.push({ wip: w, ct: w / t });
  return out;
}

export type KingmanPoint = { u: number; v: number };

export const KINGMAN_BASE: KingmanPoint = { u: 0.7, v: 0.5 };

export const KINGMAN_SCENARIOS: IntroScenario<KingmanPoint>[] = [
  {
    id: "K1",
    label: "ū 0,70 → 0,90 · V tetap 0,5",
    say: "Mendekati 100% sibuk, antrian meledak — bukan linier.",
    valid: true,
    apply: { u: 0.9, v: 0.5 },
  },
  {
    id: "K2",
    label: "V 0,25 → 1,0 · ū tetap 0,80",
    say: "Variability lebih besar = kurva yang lebih jelek, ū yang sama.",
    valid: true,
    apply: { u: 0.8, v: 1 },
  },
  {
    id: "K3",
    label: "V = 0 · ū 0,70 → 0,90",
    say: "Tanpa variability, utilisasi tinggi masih jinak. V yang membuatnya buas.",
    valid: true,
    apply: { u: 0.9, v: 0 },
  },
];

export function kingmanFrom(p: KingmanPoint): { u: number; v: number; ratio: number } {
  const raw = p.v <= 0 ? 1 : kingmanCTnorm(p.u, p.v);
  const ratio = !Number.isFinite(raw) || raw > KINGMAN_Y_MAX ? KINGMAN_Y_MAX : raw;
  return { u: p.u, v: p.v, ratio };
}

export { KINGMAN_V_LEVELS, KINGMAN_Y_MAX };

export const INV_BASE = { demandRate: 2, leadTime: 4, demandCv: 0.35, z: 1 };

function stockOf(p: typeof INV_BASE): number {
  return inventoryFillRate(p).baseStock;
}

export function fillAtStock(
  demandRate: number,
  leadTime: number,
  demandCv: number,
  stock: number,
) {
  const sigma = demandRate * demandCv * Math.sqrt(Math.max(leadTime, 1e-9));
  const ddlt = demandRate * leadTime;
  const z = (stock - ddlt) / Math.max(sigma, 1e-9);
  return inventoryFillRate({ demandRate, leadTime, demandCv, z });
}

export type InvApply = {
  leadTime: number;
  demandCv: number;
  z: number;
  multiples?: boolean;
};

export const INV_SCENARIOS: IntroScenario<InvApply>[] = [
  {
    id: "I1",
    label: "Buffer 1× → 2× → 3×",
    say: "Stok tambahan makin tidak sebanding.",
    valid: true,
    apply: { leadTime: 4, demandCv: 0.35, z: 1.85, multiples: true },
  },
  {
    id: "I2",
    label: "CV naik, stok tetap",
    say: "Permintaan lebih liar, stok yang sama tidak cukup.",
    valid: true,
    apply: { leadTime: 4, demandCv: 0.8, z: 1 },
  },
  {
    id: "I3",
    label: "Lead time memanjang, stok tetap",
    say: "Pasokan lebih lama = stok lama ketinggalan.",
    valid: true,
    apply: { leadTime: 9, demandCv: 0.35, z: 1 },
  },
];

export const INV_Z_STEPS = [0.4, 1.05, 1.85] as const;

export function invCurve(leadTime: number, demandCv: number) {
  const series: { inv: number; fr: number }[] = [];
  for (let i = 0; i <= 36; i++) {
    const z = -0.4 + (3.4 * i) / 36;
    const r = inventoryFillRate({
      demandRate: INV_BASE.demandRate,
      leadTime,
      demandCv,
      z,
    });
    series.push({
      inv: Math.max(0, r.avgInventory),
      fr: r.fillRate * 100,
    });
  }
  return series;
}

export function invPoint(leadTime: number, demandCv: number, z: number) {
  const r = inventoryFillRate({
    demandRate: INV_BASE.demandRate,
    leadTime,
    demandCv,
    z,
  });
  return { inv: Math.max(0, r.avgInventory), fr: r.fillRate * 100, baseStock: r.baseStock };
}

export function invFixedStockPoint(leadTime: number, demandCv: number) {
  const S = stockOf(INV_BASE);
  const r = fillAtStock(INV_BASE.demandRate, leadTime, demandCv, S);
  return {
    inv: Math.max(0, r.avgInventory),
    fr: r.fillRate * 100,
    baseStock: r.baseStock,
    S,
  };
}

/* ── Control & CONWIP ──
   Demo line: 4 stasiun seimbang, te=2 → T0=8, rb=0.5 → W0=4
   V=0.5 → W_opt ≈ 4·(1+√0.5) ≈ 6.83
*/

export const CONTROL_DEMO = {
  te: 2,
  m: 1,
  stations: 4,
  thDemand: 0.45,
  ca: Math.sqrt(0.5),
  ce: Math.sqrt(0.5),
  conwipBase: 7,
} as const;

export type ControlApply = { conwip: number };

export const CONTROL_SCENARIOS: IntroScenario<ControlApply>[] = [
  {
    id: "C1",
    label: "CONWIP di bawah W₀",
    say: "Sistem kelaparan — TH belum penuh, CT masih dekat T₀. Menambah WIP masih menambah output.",
    valid: true,
    apply: { conwip: 2 },
  },
  {
    id: "C2",
    label: "CONWIP ≈ W_opt",
    say: "Zona kerja seimbang — TH mendekati kapasitas, CT masih terkendali. Ini Control yang baik.",
    valid: true,
    apply: { conwip: 7 },
  },
  {
    id: "C3",
    label: "CONWIP jauh di atas W₀",
    say: "WIP berlebih hanya memperpanjang waktu tinggal. TH hampir tidak naik, CT naik tajam.",
    valid: true,
    apply: { conwip: 18 },
  },
];

export function controlChart(conwip: number) {
  return buildWipThCtChart({
    te: CONTROL_DEMO.te,
    m: CONTROL_DEMO.m,
    stations: CONTROL_DEMO.stations,
    thDemand: CONTROL_DEMO.thDemand,
    ca: CONTROL_DEMO.ca,
    ce: CONTROL_DEMO.ce,
    conwip,
  });
}

export function formatTriple(p: LittlePoint): string {
  return `WIP=${formatNum(p.wip)} · TH=${formatNum(p.th)} · CT=${formatNum(p.ct)}`;
}

export function formatKingman(p: KingmanPoint): string {
  const r = kingmanFrom(p);
  return `ū=${formatPct(p.u)} · V=${formatNum(p.v)} · CT/te=${formatNum(r.ratio)}`;
}

export { formatNum, formatPct };
