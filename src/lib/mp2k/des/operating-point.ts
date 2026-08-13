import type { DesMetrics, DesParams } from "./engine";

/** Shared visual tokens — same on Simulasi metrics & Analitik strip/charts */
export const DES_METRIC_COLORS = {
  th: "#2563eb",
  ct: "#dc2626",
  wip: "#7c3aed",
  fr: "#0f766e",
  util: "#ca8a04",
  des: "#ea580c",
  desFill: "#ea580c",
} as const;

export type DesOperatingPoint = {
  ready: boolean;
  complete: boolean;
  th: number;
  ct: number;
  wip: number;
  fillRate: number;
  utilColumn: number;
  utilBeam: number;
  utilPanel: number;
  utilBot: number;
  bottleneck: "column" | "beam" | "panel";
  simTime: number;
  params: DesParams;
  /** For Kingman chart: CT/te at bottleneck */
  ctRatioBot: number;
  teBot: number;
  mBot: number;
  V: number;
  /** Inventory chart proxy */
  invProxy: number;
};

export function emptyOperatingPoint(params: DesParams): DesOperatingPoint {
  return {
    ready: false,
    complete: false,
    th: 0,
    ct: 0,
    wip: 0,
    fillRate: 1,
    utilColumn: 0,
    utilBeam: 0,
    utilPanel: 0,
    utilBot: 0,
    bottleneck: "panel",
    simTime: 0,
    params: { ...params },
    ctRatioBot: 1,
    teBot: params.tePanel,
    mBot: params.mPanel,
    V: (params.ca * params.ca + params.ce * params.ce) / 2,
    invProxy: params.panelBufferInitial,
  };
}

export function buildOperatingPoint(
  params: DesParams,
  des: DesMetrics | null,
  complete: boolean,
  panelBuffer: number,
): DesOperatingPoint {
  if (!des || des.simTime <= 0 || des.completed <= 0) {
    return emptyOperatingPoint(params);
  }

  const entries: ["column" | "beam" | "panel", number, number, number][] = [
    ["column", des.utilColumn, params.teColumn, params.mColumn],
    ["beam", des.utilBeam, params.teBeam, params.mBeam],
    ["panel", des.utilPanel, params.tePanel, params.mPanel],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  const [bottleneck, utilBot, teBot, mBot] = entries[0];
  const V = (params.ca * params.ca + params.ce * params.ce) / 2;
  const ctRatioBot = teBot > 1e-9 ? des.avgCt / teBot : 1;

  return {
    ready: true,
    complete,
    th: des.th,
    ct: des.avgCt,
    wip: des.avgWip,
    fillRate: des.fillRate,
    utilColumn: des.utilColumn,
    utilBeam: des.utilBeam,
    utilPanel: des.utilPanel,
    utilBot,
    bottleneck,
    simTime: des.simTime,
    params: { ...params },
    ctRatioBot: Math.min(ctRatioBot, 5.5),
    teBot,
    mBot,
    V,
    invProxy: Math.max(panelBuffer, des.avgWip * 0.15, 0.5),
  };
}
