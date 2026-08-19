/**
 * MP2K Discrete Event Simulation
 * Fixed: product design + process design (case)
 * Tunable levers: Capacity · Variability · Inventory
 */

import {
  type ElementStatus,
  type Floor,
  type ZoneId,
  COL_ROWS,
  COL_COLS,
  columnKey,
  beamKey,
  panelKey,
  panelsForZone,
  stairKey,
  c3StructureReady,
  WAVE_PAIRS,
  STAIR_COL,
  TOTALS,
} from "../model";
import { mulberry32, sampleProcessTime, sampleInterarrival } from "./rng";

export type ResourceId = "column" | "beam" | "panel" | "stair";

export type DesParams = {
  // Capacity
  mColumn: number;
  mBeam: number;
  mPanel: number;
  mStair: number;
  teColumn: number;
  teBeam: number;
  tePanel: number;
  teStair: number;
  // Variability
  ca: number;
  ce: number;
  seed: number;
  // Inventory
  conwip: number;
  panelLeadTime: number;
  panelBufferInitial: number;
};

export const DEFAULT_DES_PARAMS: DesParams = {
  mColumn: 2,
  mBeam: 2,
  mPanel: 1,
  mStair: 1,
  teColumn: 0.5,
  teBeam: 0.35,
  tePanel: 0.25,
  teStair: 4,
  ca: 0.4,
  ce: 0.6,
  seed: 42,
  conwip: 12,
  panelLeadTime: 3,
  panelBufferInitial: 4,
};

export type JobKind = "column" | "beam" | "panel" | "stair";

export type Job = {
  id: string;
  kind: JobKind;
  resource: ResourceId;
  te: number;
  /** element key in visual store */
  elementKey: string;
  floor?: Floor;
  zone?: ZoneId;
  colKey?: string; // for columnFloor
  story?: 1 | 2;
  deps: string[]; // job ids
  status: "pending" | "ready" | "running" | "done";
  startT?: number;
  endT?: number;
  ct?: number;
};

export type DesEventType =
  | "RELEASE"
  | "START"
  | "END"
  | "ORDER_PANEL"
  | "PANEL_ARRIVE"
  | "CHECK";

export type DesEvent = {
  t: number;
  type: DesEventType;
  jobId?: string;
  panelKey?: string;
  seq: number;
  note?: string;
};

/** Jejak waktu lab DES — untuk chart Utilization/WIP over Time (bukan kalender proyek). */
export type DesTracePoint = {
  t: number;
  wip: number;
  /** Manual: column + stair */
  utilM: number;
  /** Near-site: beam */
  utilN: number;
  /** Far-supply: panel */
  utilF: number;
};

export type DesMetrics = {
  simTime: number;
  eventsProcessed: number;
  completed: number;
  totalJobs: number;
  wip: number;
  avgWip: number;
  th: number; // completions / simTime
  avgCt: number;
  utilColumn: number;
  utilBeam: number;
  utilPanel: number;
  utilStair: number;
  panelOrders: number;
  panelArrivals: number;
  panelStockouts: number;
  fillRate: number;
  busyTime: Record<ResourceId, number>;
};

export type VisualPatch = {
  columns?: Record<string, ElementStatus>;
  columnFloor?: Record<string, 0 | 1 | 2>;
  beams?: Record<string, ElementStatus>;
  panels?: Record<string, ElementStatus>;
  stairs?: Record<string, ElementStatus>;
};

export type DesSnapshot = {
  t: number;
  params: DesParams;
  jobs: Job[];
  eventLog: string[];
  lastMessage: string;
  complete: boolean;
  metrics: DesMetrics;
  panelBuffer: number;
  panelInTransit: number;
  wip: number;
  /** Deret waktu lab (downsampled) */
  trace: DesTracePoint[];
  visual: {
    columns: Record<string, ElementStatus>;
    columnFloor: Record<string, 0 | 1 | 2>;
    beams: Record<string, ElementStatus>;
    panels: Record<string, ElementStatus>;
    stairs: Record<string, ElementStatus>;
  };
};

function teFor(kind: JobKind, p: DesParams): number {
  if (kind === "column") return p.teColumn;
  if (kind === "beam") return p.teBeam;
  if (kind === "panel") return p.tePanel;
  return p.teStair;
}

function mFor(r: ResourceId, p: DesParams): number {
  if (r === "column") return p.mColumn;
  if (r === "beam") return p.mBeam;
  if (r === "panel") return p.mPanel;
  return p.mStair;
}

function buildJobs(params: DesParams): Job[] {
  const jobs: Job[] = [];
  // Columns L1 then L2
  for (let fl = 1; fl <= 2; fl++) {
    for (let r = 0; r < COL_ROWS; r++) {
      for (let c = 0; c < COL_COLS; c++) {
        const ck = columnKey(r, c);
        const id = `job-${ck}-L${fl}`;
        const deps: string[] = fl === 2 ? [`job-${ck}-L1`] : [];
        jobs.push({
          id,
          kind: "column",
          resource: "column",
          te: params.teColumn,
          elementKey: ck,
          floor: fl as Floor,
          colKey: ck,
          story: fl as 1 | 2,
          deps,
          status: "pending",
        });
      }
    }
  }

  const beamJobs: Job[] = [];
  for (let fl = 1; fl <= 2; fl++) {
    // horizontal beams along rows
    for (let r = 0; r < COL_ROWS; r++) {
      for (let c = 0; c < COL_COLS - 1; c++) {
        const a = columnKey(r, c);
        const b = columnKey(r, c + 1);
        const bk = beamKey(fl as Floor, a, b);
        beamJobs.push({
          id: `job-${bk}`,
          kind: "beam",
          resource: "beam",
          te: params.teBeam,
          elementKey: bk,
          floor: fl as Floor,
          deps: [`job-${a}-L${fl}`, `job-${b}-L${fl}`],
          status: "pending",
        });
      }
    }
    // vertical beams along cols
    for (let r = 0; r < COL_ROWS - 1; r++) {
      for (let c = 0; c < COL_COLS; c++) {
        const a = columnKey(r, c);
        const b = columnKey(r + 1, c);
        const bk = beamKey(fl as Floor, a, b);
        beamJobs.push({
          id: `job-${bk}`,
          kind: "beam",
          resource: "beam",
          te: params.teBeam,
          elementKey: bk,
          floor: fl as Floor,
          deps: [`job-${a}-L${fl}`, `job-${b}-L${fl}`],
          status: "pending",
        });
      }
    }
  }
  jobs.push(...beamJobs);

  // Panels per zone — panelsForZone returns COUNT, keys via panelKey
  for (let fl = 1; fl <= 2; fl++) {
    for (let z = 1; z <= 8; z++) {
      const n = panelsForZone(z as ZoneId, fl as Floor);
      for (let i = 0; i < n; i++) {
        const pk = panelKey(fl as Floor, z as ZoneId, i);
        const colDeps: string[] = [];
        for (let r = 0; r < COL_ROWS; r++) {
          for (let c = 0; c < COL_COLS; c++) {
            colDeps.push(`job-${columnKey(r, c)}-L${fl}`);
          }
        }
        jobs.push({
          id: `job-${pk}`,
          kind: "panel",
          resource: "panel",
          te: params.tePanel,
          elementKey: pk,
          floor: fl as Floor,
          zone: z as ZoneId,
          deps: colDeps.slice(0, 6),
          status: "pending",
        });
      }
    }
  }

  // Stair L1
  const stairDeps: string[] = [];
  for (let r = 0; r < COL_ROWS; r++) {
    stairDeps.push(`job-${columnKey(r, STAIR_COL)}-L1`);
  }
  jobs.push({
    id: `job-${stairKey()}`,
    kind: "stair",
    resource: "stair",
    te: params.teStair,
    elementKey: stairKey(),
    floor: 1,
    deps: stairDeps.slice(0, 3),
    status: "pending",
  });

  return jobs;
}

function emptyVisual(): DesSnapshot["visual"] {
  return {
    columns: {},
    columnFloor: {},
    beams: {},
    panels: {},
    stairs: {},
  };
}

export class DesEngine {
  params: DesParams;
  jobs: Job[];
  t = 0;
  seq = 0;
  rng: () => number;
  heap: DesEvent[] = [];
  busy: Record<ResourceId, number> = { column: 0, beam: 0, panel: 0, stair: 0 };
  busyTime: Record<ResourceId, number> = { column: 0, beam: 0, panel: 0, stair: 0 };
  lastBusyMark = 0;
  panelBuffer: number;
  panelInTransit = 0;
  panelOrders = 0;
  panelArrivals = 0;
  panelStockouts = 0;
  panelDemandAttempts = 0;
  orderedPanels = new Set<string>();
  eventLog: string[] = [];
  lastMessage = "";
  complete = false;
  eventsProcessed = 0;
  /** integral of WIP over time for avg WIP */
  wipArea = 0;
  lastWipT = 0;
  ctSum = 0;
  ctCount = 0;
  /** time series for lab charts (Phase 1 logger) */
  trace: DesTracePoint[] = [];
  lastSampleT = -1;
  static readonly TRACE_MAX = 200;
  visual: DesSnapshot["visual"];
  /** job release stagger for ca */
  nextReleaseT = 0;

  constructor(params: DesParams = DEFAULT_DES_PARAMS) {
    this.params = { ...params };
    this.rng = mulberry32(params.seed);
    this.jobs = buildJobs(params);
    this.panelBuffer = params.panelBufferInitial;
    this.visual = emptyVisual();
    this.lastMessage =
      "DES siap. Product & process fixed · putar Capacity / Variability / Inventory.";
    this.eventLog = [
      "Fondasi & sloof siap. DES multi-moda: M kolom · N balok · F panel · M stair.",
      `Seed=${params.seed} · CONWIP=${params.conwip} · L_panel=${params.panelLeadTime}`,
    ];
    this.scheduleInitial();
  }

  private pushLog(line: string) {
    this.eventLog = [line, ...this.eventLog].slice(0, 50);
  }

  private schedule(ev: DesEvent) {
    this.heap.push(ev);
    this.heap.sort((a, b) => a.t - b.t || a.seq - b.seq);
  }

  private scheduleInitial() {
    this.schedule({ t: 0, type: "CHECK", seq: this.seq++ });
  }

  private currentWip(): number {
    return this.jobs.filter((j) => j.status === "running").length;
  }

  private markWip(t: number) {
    const w = this.currentWip();
    this.wipArea += w * Math.max(0, t - this.lastWipT);
    this.lastWipT = t;
  }

  /** Instantaneous util by moda + WIP; downsample to TRACE_MAX points. */
  private sampleTrace(t: number) {
    if (t < this.lastSampleT) return;
    if (this.trace.length > 0 && t === this.lastSampleT) return;

    const mC = mFor("column", this.params);
    const mS = mFor("stair", this.params);
    const mB = mFor("beam", this.params);
    const mP = mFor("panel", this.params);
    const denM = Math.max(1, mC + mS);
    const utilM = Math.min(1, (this.busy.column + this.busy.stair) / denM);
    const utilN = mB > 0 ? Math.min(1, this.busy.beam / mB) : 0;
    const utilF = mP > 0 ? Math.min(1, this.busy.panel / mP) : 0;

    this.trace.push({
      t,
      wip: this.currentWip(),
      utilM,
      utilN,
      utilF,
    });
    this.lastSampleT = t;

    if (this.trace.length > DesEngine.TRACE_MAX * 1.2) {
      const keep: DesTracePoint[] = [];
      const n = this.trace.length;
      const cut = Math.floor(n * 0.7);
      for (let i = 0; i < cut; i++) {
        if (i % 2 === 0) keep.push(this.trace[i]);
      }
      for (let i = cut; i < n; i++) keep.push(this.trace[i]);
      this.trace =
        keep.length > DesEngine.TRACE_MAX ? keep.slice(-DesEngine.TRACE_MAX) : keep;
    }
  }

  private accumulateBusy(t: number) {
    const dt = Math.max(0, t - this.lastBusyMark);
    if (dt > 0) {
      (Object.keys(this.busy) as ResourceId[]).forEach((r) => {
        this.busyTime[r] += this.busy[r] * dt;
      });
    }
    this.lastBusyMark = t;
  }

  private tryStartJobs() {
    // CONWIP + resource first; only then take panel stock (avoids stolen-buffer deadlock)
    for (const job of this.jobs) {
      if (job.status !== "pending" && job.status !== "ready") continue;
      const depsOk = job.deps.every(
        (d) => this.jobs.find((j) => j.id === d)?.status === "done",
      );
      if (!depsOk) continue;
      job.status = "ready";

      const wip = this.jobs.filter((j) => j.status === "running").length;
      if (wip >= this.params.conwip) continue;

      const m = mFor(job.resource, this.params);
      if (this.busy[job.resource] >= m) continue;

      if (job.kind === "panel") {
        if (this.panelBuffer <= 0 && this.panelInTransit === 0) {
          this.orderedPanels.delete(job.elementKey);
        }
        if (this.panelBuffer <= 0) {
          this.panelDemandAttempts++;
          this.panelStockouts++;
          if (!this.orderedPanels.has(job.elementKey)) {
            this.orderedPanels.add(job.elementKey);
            const L = sampleInterarrival(
              this.params.panelLeadTime,
              this.params.ca * 0.5,
              this.rng,
            );
            this.panelOrders++;
            this.panelInTransit++;
            this.schedule({
              t: this.t + L,
              type: "PANEL_ARRIVE",
              panelKey: job.elementKey,
              seq: this.seq++,
            });
          }
          continue;
        }
        this.panelDemandAttempts++;
        this.panelBuffer--;
      }

      this.busy[job.resource]++;
      job.status = "running";
      job.startT = this.t;
      const pt = sampleProcessTime(job.te, this.params.ce, this.rng);
      job.endT = this.t + pt;
      this.schedule({
        t: job.endT,
        type: "END",
        jobId: job.id,
        seq: this.seq++,
      });
    }
  }

  step(): boolean {
    if (this.complete) return false;
    if (this.heap.length === 0) {
      this.tryStartJobs();
      if (this.heap.length === 0) {
        this.checkComplete();
        return false;
      }
    }
    const ev = this.heap.shift()!;
    this.t = ev.t;
    this.eventsProcessed++;
    this.accumulateBusy(ev.t);
    this.markWip(ev.t);
    this.sampleTrace(ev.t);

    if (ev.type === "PANEL_ARRIVE") {
      this.panelArrivals++;
      this.panelInTransit = Math.max(0, this.panelInTransit - 1);
      this.panelBuffer++;
      this.pushLog(`PANEL_ARRIVE t=${this.t.toFixed(2)}`);
    } else if (ev.type === "END" && ev.jobId) {
      const job = this.jobs.find((j) => j.id === ev.jobId);
      if (job && job.status === "running") {
        job.status = "done";
        job.ct = (job.endT ?? this.t) - (job.startT ?? 0);
        this.ctSum += job.ct;
        this.ctCount++;
        this.busy[job.resource] = Math.max(0, this.busy[job.resource] - 1);
        this.pushLog(`END ${job.kind} t=${this.t.toFixed(2)}`);
        // visual updates
        if (job.kind === "column" && job.colKey && job.story) {
          this.visual.columnFloor[job.colKey] = job.story;
          this.visual.columns[job.colKey] = "installed";
        } else if (job.kind === "beam") {
          this.visual.beams[job.elementKey] = "installed";
        } else if (job.kind === "panel") {
          this.visual.panels[job.elementKey] = "installed";
        } else if (job.kind === "stair") {
          this.visual.stairs[job.elementKey] = "installed";
        }
      }
    }

    this.tryStartJobs();
    this.checkComplete();
    return !this.complete || this.eventsProcessed > 0;
  }

  run(maxEvents = 5000): void {
    let n = 0;
    while (!this.complete && n < maxEvents) {
      if (!this.step()) break;
      n++;
    }
  }

  private checkComplete() {
    if (this.jobs.every((j) => j.status === "done")) {
      this.complete = true;
      this.markWip(this.t);
      this.accumulateBusy(this.t);
      this.sampleTrace(this.t);
      this.lastMessage = `DES selesai · T=${this.t.toFixed(2)} hari · ${this.jobs.length} jobs`;
      this.pushLog(`COMPLETE t=${this.t.toFixed(2)}`);
    }
  }

  metrics(): DesMetrics {
    const completed = this.jobs.filter((j) => j.status === "done").length;
    const T = Math.max(this.t, 1e-6);
    const avgWip = this.wipArea / T;
    const util = (r: ResourceId) => {
      const m = mFor(r, this.params);
      return m > 0 ? Math.min(1, this.busyTime[r] / (T * m)) : 0;
    };
    const fillRate =
      this.panelDemandAttempts > 0
        ? 1 - this.panelStockouts / this.panelDemandAttempts
        : 1;

    return {
      simTime: this.t,
      eventsProcessed: this.eventsProcessed,
      completed,
      totalJobs: this.jobs.length,
      wip: this.jobs.filter((j) => j.status === "running").length,
      avgWip,
      th: completed / T,
      avgCt: this.ctCount > 0 ? this.ctSum / this.ctCount : 0,
      utilColumn: util("column"),
      utilBeam: util("beam"),
      utilPanel: util("panel"),
      utilStair: util("stair"),
      panelOrders: this.panelOrders,
      panelArrivals: this.panelArrivals,
      panelStockouts: this.panelStockouts,
      fillRate,
      busyTime: { ...this.busyTime },
    };
  }

  snapshot(): DesSnapshot {
    return {
      t: this.t,
      params: { ...this.params },
      jobs: this.jobs.map((j) => ({ ...j, deps: [...j.deps] })),
      eventLog: [...this.eventLog],
      lastMessage: this.lastMessage,
      complete: this.complete,
      metrics: this.metrics(),
      panelBuffer: this.panelBuffer,
      panelInTransit: this.panelInTransit,
      wip: this.jobs.filter((j) => j.status === "running").length,
      trace: this.trace.map((p) => ({ ...p })),
      visual: {
        columns: { ...this.visual.columns },
        columnFloor: { ...this.visual.columnFloor },
        beams: { ...this.visual.beams },
        panels: { ...this.visual.panels },
        stairs: { ...this.visual.stairs },
      },
    };
  }
}

export function desJobTotals() {
  return {
    columns: TOTALS.columns * 2,
    beams: TOTALS.beams,
    panels: TOTALS.panels,
    stairs: 1,
    all: TOTALS.columns * 2 + TOTALS.beams + TOTALS.panels + 1,
  };
}

// silence unused import warning for c3 if tree-shaken differently
void c3StructureReady;
void WAVE_PAIRS;
