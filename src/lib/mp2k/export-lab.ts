/** Build classroom export payloads from DES run + compare rows. */

import { matchPresetId } from "./des/presets";
import { compareDesToTheory } from "./des/compare";
import type { DesMetrics, DesParams } from "./des/engine";
import { formatNum, formatPct } from "./ops-science";

export type LabExportInput = {
  desParams: DesParams;
  des: DesMetrics | null;
  desComplete: boolean;
  simTime: number;
  cohort?: string;
  studentNote?: string;
};

export type LabExportPayload = {
  app: "MP2K";
  exportedAt: string;
  cohort: string;
  preset: string | null;
  complete: boolean;
  params: DesParams;
  metrics: {
    T: number;
    th: number | null;
    ct: number | null;
    wip: number | null;
    fr: number | null;
    utilColumn: number | null;
    utilBeam: number | null;
    utilPanel: number | null;
    stockouts: number | null;
    completed: number | null;
  };
  compare: { law: string; metric: string; empiric: string; theory: string; delta: string }[];
  summary: string;
  note: string;
};

export function buildLabExport(input: LabExportInput): LabExportPayload {
  const { desParams, des, desComplete, simTime } = input;
  const preset = matchPresetId(desParams);
  const compare = des && des.completed > 0 ? compareDesToTheory(desParams, des) : null;

  return {
    app: "MP2K",
    exportedAt: new Date().toISOString(),
    cohort: input.cohort?.trim() || "",
    preset,
    complete: desComplete,
    params: { ...desParams },
    metrics: {
      T: simTime,
      th: des?.th ?? null,
      ct: des?.avgCt ?? null,
      wip: des?.avgWip ?? null,
      fr: des?.fillRate ?? null,
      utilColumn: des?.utilColumn ?? null,
      utilBeam: des?.utilBeam ?? null,
      utilPanel: des?.utilPanel ?? null,
      stockouts: des?.panelStockouts ?? null,
      completed: des?.completed ?? null,
    },
    compare: compare
      ? compare.rows.map((r) => ({
          law: r.law,
          metric: r.metric,
          empiric: r.empiric,
          theory: r.theory,
          delta: r.delta,
        }))
      : [],
    summary: compare?.summary ?? "",
    note: input.studentNote?.trim() || "",
  };
}

export function exportToJsonString(payload: LabExportPayload): string {
  return JSON.stringify(payload, null, 2);
}

export function exportToCsvString(payload: LabExportPayload): string {
  const lines: string[] = [];
  lines.push("field,value");
  lines.push(`app,${payload.app}`);
  lines.push(`exportedAt,${payload.exportedAt}`);
  lines.push(`cohort,"${esc(payload.cohort)}"`);
  lines.push(`preset,${payload.preset ?? ""}`);
  lines.push(`complete,${payload.complete}`);
  lines.push(`T,${fmt(payload.metrics.T)}`);
  lines.push(`TH,${fmt(payload.metrics.th)}`);
  lines.push(`CT,${fmt(payload.metrics.ct)}`);
  lines.push(`WIP,${fmt(payload.metrics.wip)}`);
  lines.push(`FR,${fmt(payload.metrics.fr)}`);
  lines.push(`utilColumn,${fmt(payload.metrics.utilColumn)}`);
  lines.push(`utilBeam,${fmt(payload.metrics.utilBeam)}`);
  lines.push(`utilPanel,${fmt(payload.metrics.utilPanel)}`);
  lines.push(`stockouts,${payload.metrics.stockouts ?? ""}`);
  lines.push(`seed,${payload.params.seed}`);
  lines.push(`conwip,${payload.params.conwip}`);
  lines.push(`ca,${payload.params.ca}`);
  lines.push(`ce,${payload.params.ce}`);
  for (const r of payload.compare) {
    lines.push(`compare_${r.law}_empiric,"${esc(r.empiric)}"`);
    lines.push(`compare_${r.law}_theory,"${esc(r.theory)}"`);
    lines.push(`compare_${r.law}_delta,"${esc(r.delta)}"`);
  }
  lines.push(`summary,"${esc(payload.summary)}"`);
  lines.push(`note,"${esc(payload.note)}"`);
  return lines.join("\n");
}

function fmt(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "";
  return String(Number(n.toFixed(6)));
}

function esc(s: string): string {
  return s.replace(/"/g, '""');
}

export function downloadTextFile(filename: string, content: string, mime: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyText(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return Promise.resolve(false);
  return navigator.clipboard.writeText(text).then(
    () => true,
    () => false,
  );
}

/** Human-readable one-pager for paste into LMS. */
export function exportToPlainText(payload: LabExportPayload): string {
  const m = payload.metrics;
  const lines = [
    "MP2K — hasil lab",
    `Waktu ekspor: ${payload.exportedAt}`,
    payload.cohort ? `Cohort/kelas: ${payload.cohort}` : "Cohort/kelas: —",
    `Preset: ${payload.preset ?? "(custom)"} · selesai: ${payload.complete ? "ya" : "belum"}`,
    `Seed: ${payload.params.seed} · CONWIP: ${payload.params.conwip} · ca=${payload.params.ca} · ce=${payload.params.ce}`,
    "",
    `T=${formatNum(m.T ?? 0)} hari`,
    `TH=${m.th != null ? formatNum(m.th) : "—"} job/hari`,
    `CT=${m.ct != null ? formatNum(m.ct) : "—"} hari`,
    `WIP=${m.wip != null ? formatNum(m.wip) : "—"}`,
    `FR=${m.fr != null ? formatPct(m.fr) : "—"}`,
    `ū kolom/balok/panel = ${m.utilColumn != null ? formatPct(m.utilColumn) : "—"} / ${m.utilBeam != null ? formatPct(m.utilBeam) : "—"} / ${m.utilPanel != null ? formatPct(m.utilPanel) : "—"}`,
    "",
    "Banding DES ↔ teori:",
    ...payload.compare.map((r) => `  ${r.law} · ${r.metric}: DES ${r.empiric} | teori ${r.theory} | Δ ${r.delta}`),
    "",
    payload.summary ? `Ringkasan: ${payload.summary}` : "",
    payload.note ? `Catatan: ${payload.note}` : "",
  ];
  return lines.filter((l) => l !== undefined).join("\n");
}
