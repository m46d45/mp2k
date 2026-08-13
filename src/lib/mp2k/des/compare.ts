/**
 * Compare DES empirical metrics to Operations Science predictions.
 * Teaching approximation: system-level, not per-job exact match.
 */

import type { DesMetrics, DesParams } from "./engine";
import {
  kingmanVut,
  inventoryFillRate,
  zFromServiceLevel,
  formatNum,
  formatPct,
} from "../ops-science";

export type CompareRow = {
  id: "little" | "kingman" | "fillrate";
  law: string;
  metric: string;
  empiric: string;
  theory: string;
  delta: string;
  note: string;
};

export type DesCompare = {
  rows: CompareRow[];
  summary: string;
  bottleneck: "column" | "beam" | "panel" | null;
  littleOk: boolean;
};

function relDelta(emp: number, thy: number): string {
  if (!Number.isFinite(emp) || !Number.isFinite(thy)) return "—";
  if (Math.abs(thy) < 1e-9) return emp === 0 ? "0%" : "∞";
  const d = ((emp - thy) / Math.abs(thy)) * 100;
  const sign = d > 0 ? "+" : "";
  return `${sign}${d.toFixed(0)}%`;
}

function bottleneckOf(m: DesMetrics): "column" | "beam" | "panel" {
  const entries: ["column" | "beam" | "panel", number][] = [
    ["column", m.utilColumn],
    ["beam", m.utilBeam],
    ["panel", m.utilPanel],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function teMFor(
  bot: "column" | "beam" | "panel",
  p: DesParams,
): { te: number; m: number; label: string } {
  if (bot === "column") return { te: p.teColumn, m: p.mColumn, label: "kolom" };
  if (bot === "beam") return { te: p.teBeam, m: p.mBeam, label: "balok" };
  return { te: p.tePanel, m: p.mPanel, label: "panel" };
}

/**
 * Build comparison after DES has metrics (best after complete run).
 */
export function compareDesToTheory(params: DesParams, des: DesMetrics): DesCompare {
  const th = Math.max(des.th, 1e-9);
  const ctEmp = des.avgCt;
  const wipEmp = des.avgWip;
  const runReady = des.completed > 0 && des.simTime > 1e-6;

  // Little identity on DES averages: WIP ≟ TH × CT
  const wipLittle = th * ctEmp;
  const littleRel =
    wipLittle > 1e-9 ? Math.abs(wipEmp - wipLittle) / wipLittle : 0;
  const littleOk = littleRel < 0.15;

  // Kingman on empirical bottleneck resource
  const bot = bottleneckOf(des);
  const { te, m, label } = teMFor(bot, params);
  const k = kingmanVut({
    te,
    th: Math.min(th, (m / te) * 0.98),
    m,
    ca: params.ca,
    ce: params.ce,
  });
  const ctThy = Number.isFinite(k.ct) ? k.ct : te;

  // Inventory / FR for panel far-supply
  const z = zFromServiceLevel(0.95);
  const inv = inventoryFillRate({
    demandRate: th,
    leadTime: params.panelLeadTime,
    demandCv: Math.max(params.ca, params.ce, 0.2),
    z,
  });

  const rows: CompareRow[] = [
    {
      id: "little",
      law: "Little",
      metric: "WIP rata-rata",
      empiric: formatNum(wipEmp),
      theory: formatNum(wipLittle),
      delta: relDelta(wipEmp, wipLittle),
      note: littleOk
        ? "DES konsisten: WIP ≈ TH × CT (rata-rata). Identitas Little berlaku pada sistem stabil — titik oranye di kurva WIP–TH–CT harus dekat garis teori."
        : "Selisih ke TH×CT — cek horizon run / transient awal. Perpanjang Run atau abaikan fase warm-up agar rata-rata mendekati steady state.",
    },
    {
      id: "kingman",
      law: "Kingman",
      metric: `CT (bottleneck ${label})`,
      empiric: formatNum(ctEmp),
      theory: formatNum(ctThy),
      delta: relDelta(ctEmp, ctThy),
      note: Number.isFinite(k.ct)
        ? `Prediksi CT resource ${label}: ū=${formatPct(k.u)}, V=${formatNum(k.v)}. CT sistem DES = rata-rata semua job (multi-moda); Kingman fokus bottleneck saja — Δ besar sering wajar, bukan bug.`
        : "Utilisasi prediksi tidak stabil (ū≈1). Turunkan TH atau naikkan m/te agar ū < 1 sebelum membandingkan.",
    },
    {
      id: "fillrate",
      law: "Inventory/FR",
      metric: "Fill rate panel",
      empiric: formatPct(des.fillRate),
      theory: formatPct(inv.fillRate),
      delta: relDelta(des.fillRate, inv.fillRate),
      note: `Teori base-stock: L=${formatNum(params.panelLeadTime)} hari, buffer awal=${params.panelBufferInitial}, stockout DES=${des.panelStockouts}. FR rendah → longgarkan buffer/L/CONWIP di Simulasi lalu Run ulang.`,
    },
  ];

  let worst = rows[0];
  let worstAbs = 0;
  for (const r of rows) {
    const n = parseFloat(r.delta);
    if (!Number.isFinite(n)) continue;
    if (Math.abs(n) >= worstAbs) {
      worstAbs = Math.abs(n);
      worst = r;
    }
  }

  let summary: string;
  if (!runReady) {
    summary = "Jalankan DES (Run all) dulu untuk membandingkan empiris vs teori.";
  } else if (worst.id === "kingman" && worstAbs > 25) {
    summary =
      "CT sistem vs Kingman bottleneck sering beda: DES merata-ratakan kolom+balok+panel+stair; Kingman fokus resource tersibuk saja. Variability tinggi dan ū mendekati 1 membesarkan selisih — gunakan sebagai bahan diskusi, bukan indikasi error model.";
  } else if (worst.id === "fillrate" && worstAbs > 15) {
    summary =
      "Fill rate empiris vs teori: lead time / buffer / CONWIP di DES mengatur stockout nyata; kurva FR adalah model base-stock ideal (kontinu). Coba naikkan buffer atau longgarkan L di Simulasi, Run ulang, lalu bandingkan lagi.";
  } else if (worst.id === "little" && !littleOk) {
    summary =
      "Little belum rapat (WIP ≉ TH×CT) — perpanjang run atau abaikan fase awal (transient). Setelah stabil, Δ Little biasanya kecil.";
  } else {
    summary =
      "Empiris dekat prediksi pada skala lab ini. Selisih sisa = multi-moda, gate tangga Z6, dan transient — wajar di model didaktik (bukan digital twin). Lanjut ke Analitik untuk melihat marker oranye di ketiga kurva.";
  }

  return { rows, summary, bottleneck: bot, littleOk };
}
