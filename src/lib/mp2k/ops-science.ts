/**
 * Operations Science for MP2K
 * Charts match Parade / Factory Physics reference:
 * 1) WIP–TH–CT dual-axis + CONWIP
 * 2) Kingman multi-V (0 … 1) — curves break at top (no join)
 * 3) Fill rate (X) vs inventory (Y)
 */

export type SolveFor = "wip" | "th" | "ct";

export function littlesLaw(params: {
  wip?: number;
  th?: number;
  ct?: number;
  solveFor: SolveFor;
}): { wip: number; th: number; ct: number; valid: boolean; note: string } {
  const { solveFor } = params;
  let wip = params.wip ?? NaN;
  let th = params.th ?? NaN;
  let ct = params.ct ?? NaN;

  if (solveFor === "wip") {
    if (!(th > 0 && ct > 0)) {
      return { wip: 0, th, ct, valid: false, note: "Butuh TH > 0 dan CT > 0" };
    }
    wip = th * ct;
    return { wip, th, ct, valid: true, note: "WIP = TH × CT" };
  }
  if (solveFor === "th") {
    if (!(wip > 0 && ct > 0)) {
      return { wip, th: 0, ct, valid: false, note: "Butuh WIP > 0 dan CT > 0" };
    }
    th = wip / ct;
    return { wip, th, ct, valid: true, note: "TH = WIP / CT" };
  }
  if (!(wip > 0 && th > 0)) {
    return { wip, th, ct: 0, valid: false, note: "Butuh WIP > 0 dan TH > 0" };
  }
  ct = wip / th;
  return { wip, th, ct, valid: true, note: "CT = WIP / TH" };
}

export function kingmanVut(params: {
  te: number;
  th: number;
  m: number;
  ca: number;
  ce: number;
}): {
  u: number;
  v: number;
  ctq: number;
  ct: number;
  wip: number;
  capacity: number;
  valid: boolean;
  note: string;
  bottleneck: boolean;
} {
  const te = Math.max(params.te, 1e-9);
  const th = Math.max(params.th, 0);
  const m = Math.max(1, Math.round(params.m));
  const ca = Math.max(0, params.ca);
  const ce = Math.max(0, params.ce);
  const capacity = m / te;
  const u = (th * te) / m;
  const v = (ca * ca + ce * ce) / 2;

  if (u >= 0.999) {
    return {
      u,
      v,
      ctq: Infinity,
      ct: Infinity,
      wip: Infinity,
      capacity,
      valid: false,
      note: "Utilisasi ≥ 100% — tidak stabil.",
      bottleneck: true,
    };
  }
  if (u <= 0) {
    return { u: 0, v, ctq: 0, ct: te, wip: 0, capacity, valid: true, note: "CT ≈ te", bottleneck: false };
  }

  const alpha = Math.pow(2 * (m + 1), 0.5) - 1;
  const uTerm = Math.pow(u, alpha) / (m * (1 - u));
  const ctq = v * uTerm * te;
  const ct = ctq + te;
  return {
    u,
    v,
    ctq,
    ct,
    wip: th * ct,
    capacity,
    valid: true,
    note: "CTq ≈ V · f(u,m) · te ; CT = CTq + te",
    bottleneck: u > 0.85,
  };
}

/** CT/te = 1 + V·u/(1−u)  (G/G/1 teaching) */
export function kingmanCTnorm(u: number, V: number): number {
  if (u <= 0 || V <= 0) return 1;
  if (u >= 0.999) return Number.POSITIVE_INFINITY;
  return 1 + V * (u / (1 - u));
}

export function inventoryFillRate(params: {
  demandRate: number;
  leadTime: number;
  demandCv: number;
  z: number;
}): {
  ddlt: number;
  sigmaDdlt: number;
  safetyStock: number;
  baseStock: number;
  fillRate: number;
  serviceLevel: number;
  turns: number;
  avgInventory: number;
  valid: boolean;
  note: string;
} {
  const d = Math.max(params.demandRate, 0);
  const L = Math.max(params.leadTime, 1e-9);
  const cv = Math.max(params.demandCv, 0);
  const z = params.z;
  const ddlt = d * L;
  const sigmaDdlt = d * cv * Math.sqrt(L);
  const safetyStock = z * sigmaDdlt;
  const baseStock = ddlt + safetyStock;
  const phi = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  const Phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
  const loss = phi(z) - z * (1 - Phi(z));
  const expectedShort = sigmaDdlt * Math.max(loss, 0);
  const fillRate = ddlt > 1e-9 ? Math.max(0, Math.min(1, 1 - expectedShort / ddlt)) : Phi(z);
  const avgInventory = safetyStock + Math.max(ddlt, 1) / 2;
  const turns = avgInventory > 1e-9 ? d / avgInventory : 0;
  return {
    ddlt,
    sigmaDdlt,
    safetyStock,
    baseStock,
    fillRate,
    serviceLevel: Phi(z),
    turns,
    avgInventory,
    valid: d > 0 && L > 0,
    note: "SS = z·σ√L ; FR ≈ 1 − ES/DDLT",
  };
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}

export function zFromServiceLevel(sl: number): number {
  const target = Math.min(0.999, Math.max(0.5, sl));
  let lo = 0;
  let hi = 4;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const p = 0.5 * (1 + erf(mid / Math.SQRT2));
    if (p < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export type OpId = "column" | "beam" | "panel" | "stair" | "system";

export type OpParams = {
  id: OpId;
  name: string;
  mode: "M" | "N" | "F" | "SYS";
  te: number;
  th: number;
  m: number;
  stations: number;
  ca: number;
  ce: number;
  demandCv: number;
  leadTime: number;
  serviceLevel: number;
  conwip: number;
};

export const DEFAULT_OPS: OpParams[] = [
  {
    id: "column",
    name: "Kolom (manual)",
    mode: "M",
    te: 0.5,
    th: 1.6,
    m: 2,
    stations: 1,
    ca: 1.0,
    ce: 1.0,
    demandCv: 0.4,
    leadTime: 3,
    serviceLevel: 0.95,
    conwip: 0,
  },
  {
    id: "beam",
    name: "Balok (near-site)",
    mode: "N",
    te: 0.35,
    th: 2.2,
    m: 2,
    stations: 1,
    ca: 0.7,
    ce: 0.5,
    demandCv: 0.3,
    leadTime: 2,
    serviceLevel: 0.95,
    conwip: 0,
  },
  {
    id: "panel",
    name: "Panel (far supply)",
    mode: "F",
    te: 0.25,
    th: 3.2,
    m: 1,
    stations: 1,
    ca: 1.0,
    ce: 0.5,
    demandCv: 0.35,
    leadTime: 5,
    serviceLevel: 0.98,
    conwip: 0,
  },
  {
    id: "stair",
    name: "Tangga L1→L2 (manual)",
    mode: "M",
    te: 4,
    th: 0.12,
    m: 1,
    stations: 1,
    ca: 1.0,
    ce: 1.0,
    demandCv: 0.5,
    leadTime: 7,
    serviceLevel: 0.9,
    conwip: 0,
  },
  {
    id: "system",
    name: "Sistem zone (agregat)",
    mode: "SYS",
    te: 1,
    th: 0.9,
    m: 1,
    stations: 5,
    ca: 0.01,
    ce: 0.01,
    demandCv: 0.35,
    leadTime: 6,
    serviceLevel: 0.95,
    conwip: 5,
  },
];

export function formatNum(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "∞";
  if (Math.abs(n) >= 1000) return n.toFixed(0);
  if (Math.abs(n) >= 10) return n.toFixed(1);
  return n.toFixed(digits);
}

export function formatPct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

function round3(n: number) {
  return Math.round(n * 1000) / 1000;
}

/* ── Chart 1: WIP–TH–CT ── */

export type WipThCtPoint = {
  wip: number;
  thBest: number;
  thVar: number;
  ctBest: number;
  ctVar: number;
};

export function buildWipThCtChart(params: {
  te: number;
  m: number;
  stations: number;
  thDemand: number;
  ca: number;
  ce: number;
  conwip: number;
}) {
  const teBot = Math.max(params.te, 1e-9);
  const m = Math.max(1, Math.round(params.m));
  const stations = Math.max(1, params.stations);
  const TH_max = m / teBot;
  const T0 = teBot * stations;
  const W_min = TH_max * T0;
  const V = (params.ca * params.ca + params.ce * params.ce) / 2;
  const W_opt = W_min * (1 + Math.sqrt(Math.max(V, 0)));
  const CONWIP = params.conwip > 0 ? params.conwip : Math.max(W_opt, W_min);

  const thOp = Math.min(params.thDemand, TH_max * 0.99);
  const kBot = kingmanVut({
    te: teBot,
    th: thOp,
    m,
    ca: params.ca,
    ce: params.ce,
  });
  const ctOp = Number.isFinite(kBot.ct) ? kBot.ct + (T0 - teBot) : T0;
  const wipOp = thOp * ctOp;

  const wipMax = Math.max(CONWIP, wipOp, W_min) * 2.2;
  const series: WipThCtPoint[] = [];
  const steps = 70;

  for (let i = 0; i <= steps; i++) {
    const w = (wipMax * i) / steps;

    let thBest: number;
    let ctBest: number;
    if (w <= 1e-12) {
      thBest = 0;
      ctBest = T0;
    } else if (w <= W_min) {
      thBest = w / T0;
      ctBest = T0;
    } else {
      thBest = TH_max;
      ctBest = w / TH_max;
    }

    let thVar = 0;
    let ctVar = T0;
    if (w > 1e-12) {
      let lo = 1e-6;
      let hi = 0.999;
      for (let it = 0; it < 45; it++) {
        const mid = (lo + hi) / 2;
        const thAt = TH_max * mid;
        const k = kingmanVut({
          te: teBot,
          th: thAt,
          m,
          ca: params.ca,
          ce: params.ce,
        });
        const ctLine = (Number.isFinite(k.ct) ? k.ct : teBot * 20) + (T0 - teBot);
        const wAt = thAt * ctLine;
        if (wAt < w) lo = mid;
        else hi = mid;
      }
      const u = (lo + hi) / 2;
      thVar = TH_max * u;
      if (thVar > 1e-12) ctVar = w / thVar;
    }

    series.push({
      wip: round3(w),
      thBest: round3(thBest),
      thVar: round3(Math.min(thVar, TH_max)),
      ctBest: round3(ctBest),
      ctVar: round3(ctVar),
    });
  }

  const note =
    wipOp + 0.05 < W_opt
      ? `CONWIP/WIP di bawah W_opt (${formatNum(W_opt)}): inventory lebih ketat → biasanya CT lebih rendah; TH bisa turun jika jauh di bawah W_opt.`
      : wipOp > CONWIP * 1.15
        ? `WIP operasi di atas CONWIP (${formatNum(CONWIP)}): inventory longgar → CT naik (Little).`
        : `WIP operasi dekat CONWIP / W_opt — zona kerja seimbang.`;

  return {
    series,
    meta: { T0, TH_max, W_min, W_opt, CONWIP, V, wipMax, stations },
    point: { wip: wipOp, th: thOp, ct: ctOp },
    note,
  };
}

/* ── Chart 2: Kingman multi-V ──
   Curves must NOT join at the top: once CT/te exceeds yMax,
   remaining points are null so Recharts breaks the stroke.
*/

export const KINGMAN_V_LEVELS = [
  { v: 0, key: "v0", label: "V=0 (tanpa var)", color: "#9ca3af" },
  { v: 0.125, key: "v125", label: "V=0,125 (var rendah)", color: "#38bdf8" },
  { v: 0.25, key: "v25", label: "V=0,25 (var sedang)", color: "#f59e0b" },
  { v: 0.5, key: "v50", label: "V=0,5 (var tinggi)", color: "#ef4444" },
  { v: 1.0, key: "v100", label: "V=1,0 (sangat tinggi)", color: "#8b5cf6" },
] as const;

export const KINGMAN_Y_MAX = 5.5;

export function buildKingmanChart(params: {
  te: number;
  m: number;
  ca: number;
  ce: number;
  th: number;
}) {
  const { te, m, ca, ce, th } = params;
  const Vop = (ca * ca + ce * ce) / 2;
  const uOp = Math.min(0.99, Math.max(0.001, (th * te) / Math.max(m, 1)));
  const yMax = KINGMAN_Y_MAX;

  // Dense near high util so asymptote looks smooth before cut-off
  const us: number[] = [];
  for (let i = 0; i <= 40; i++) us.push(i / 40);
  for (let i = 1; i <= 20; i++) us.push(0.9 + (0.09 * i) / 20); // 0.9045 … 0.99
  // unique sorted
  const uList = [...new Set(us.map((u) => round3(Math.min(u, 0.99))))].sort((a, b) => a - b);

  // Track whether each V-curve already exceeded yMax → stay null (broken)
  const blown = new Map<string, boolean>();
  for (const lv of KINGMAN_V_LEVELS) blown.set(lv.key, false);

  const series: Record<string, number | null>[] = [];

  for (const u of uList) {
    const row: Record<string, number | null> = { u };
    for (const lv of KINGMAN_V_LEVELS) {
      if (blown.get(lv.key)) {
        // Stay disconnected — do not rejoin at the top
        row[lv.key] = null;
        continue;
      }

      let ratio: number;
      if (lv.v <= 0) {
        ratio = 1;
      } else if (m <= 1) {
        ratio = kingmanCTnorm(u, lv.v);
      } else {
        const c = Math.sqrt(lv.v);
        const k = kingmanVut({ te, th: (u * m) / te, m, ca: c, ce: c });
        ratio = Number.isFinite(k.ct) ? k.ct / te : Number.POSITIVE_INFINITY;
      }

      if (!Number.isFinite(ratio) || ratio > yMax) {
        // Last visible point just at the rim, then break
        row[lv.key] = yMax;
        blown.set(lv.key, true);
      } else {
        row[lv.key] = round3(ratio);
      }
    }
    series.push(row);
  }

  const kOp = kingmanVut({ te, th, m, ca, ce });
  let ctRatioOp = Number.isFinite(kOp.ct) ? kOp.ct / te : 1;
  // Keep operating point inside frame
  if (!Number.isFinite(ctRatioOp) || ctRatioOp > yMax) ctRatioOp = yMax;

  return {
    series,
    levels: KINGMAN_V_LEVELS,
    Vop,
    point: {
      u: uOp,
      ctRatio: ctRatioOp,
      ct: Number.isFinite(kOp.ct) ? kOp.ct : te,
    },
    yMax,
  };
}

/* ── Chart 3: FR (X) vs Inventory (Y) ── */

export function buildInventoryChart(params: {
  demandRate: number;
  leadTime: number;
  demandCv: number;
  zOp: number;
}) {
  const d = Math.max(params.demandRate, 1e-9);
  const L = Math.max(params.leadTime, 1e-9);
  const cv = Math.max(params.demandCv, 0.05);

  const series: { fr: number; inv: number; z: number }[] = [];
  for (let i = 0; i <= 60; i++) {
    const z = -0.8 + (4.2 * i) / 60;
    const r = inventoryFillRate({ demandRate: d, leadTime: L, demandCv: cv, z });
    series.push({
      fr: round3(r.fillRate * 100),
      inv: round3(Math.max(r.avgInventory, 0)),
      z: round3(z),
    });
  }
  const byFr = [...series].sort((a, b) => a.fr - b.fr);

  const op = inventoryFillRate({
    demandRate: d,
    leadTime: L,
    demandCv: cv,
    z: params.zOp,
  });

  const buffers = [0.5, 1.0, 1.5, 2.0].map((z, i) => {
    const r = inventoryFillRate({ demandRate: d, leadTime: L, demandCv: cv, z });
    return { id: `B${i + 1}`, z, fr: r.fillRate * 100, inv: r.avgInventory };
  });

  return {
    series: byFr,
    point: { fr: op.fillRate * 100, inv: op.avgInventory, z: params.zOp },
    buffers,
  };
}

export type CalcSnapshot = {
  op: OpParams;
  solveFor: SolveFor;
  littleOverride: { wip: string; th: string; ct: string };
  little: ReturnType<typeof littlesLaw>;
  kingman: ReturnType<typeof kingmanVut>;
  inv: ReturnType<typeof inventoryFillRate>;
  wipThCt: ReturnType<typeof buildWipThCtChart>;
  kingmanChart: ReturnType<typeof buildKingmanChart>;
  invChart: ReturnType<typeof buildInventoryChart>;
  ranAt: number;
};

export function runCalculation(
  op: OpParams,
  solveFor: SolveFor,
  littleOverride: { wip: string; th: string; ct: string },
): CalcSnapshot {
  const kingman = kingmanVut({
    te: op.te,
    th: op.th,
    m: op.m,
    ca: op.ca,
    ce: op.ce,
  });

  const th = littleOverride.th !== "" ? parseFloat(littleOverride.th) : op.th;
  const ct =
    littleOverride.ct !== ""
      ? parseFloat(littleOverride.ct)
      : Number.isFinite(kingman.ct)
        ? kingman.ct + op.te * Math.max(0, op.stations - 1)
        : op.te * op.stations;
  const wip = littleOverride.wip !== "" ? parseFloat(littleOverride.wip) : th * ct;

  const little = littlesLaw({
    wip: solveFor === "wip" ? undefined : wip,
    th: solveFor === "th" ? undefined : th,
    ct: solveFor === "ct" ? undefined : ct,
    solveFor,
  });

  const z = zFromServiceLevel(op.serviceLevel);
  const L =
    Number.isFinite(kingman.ct) && kingman.ct > 0
      ? Math.max(op.leadTime, kingman.ct)
      : op.leadTime;
  const inv = inventoryFillRate({
    demandRate: op.th,
    leadTime: L,
    demandCv: op.demandCv,
    z,
  });

  return {
    op: { ...op },
    solveFor,
    littleOverride: { ...littleOverride },
    little,
    kingman,
    inv,
    wipThCt: buildWipThCtChart({
      te: op.te,
      m: op.m,
      stations: op.stations,
      thDemand: op.th,
      ca: op.ca,
      ce: op.ce,
      conwip: op.conwip,
    }),
    kingmanChart: buildKingmanChart({
      te: op.te,
      m: op.m,
      ca: op.ca,
      ce: op.ce,
      th: op.th,
    }),
    invChart: buildInventoryChart({
      demandRate: op.th,
      leadTime: L,
      demandCv: op.demandCv,
      zOp: z,
    }),
    ranAt: Date.now(),
  };
}
