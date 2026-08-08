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

function buildJobs(p: DesParams): Job[] {
  const jobs: Job[] = [];
  const colJob = (fl: Floor, ck: string) => `job-col-L${fl}-${ck}`;

  // Columns: 2 stories each
  for (let r = 0; r < COL_ROWS; r++) {
    for (let c = 0; c < COL_COLS; c++) {
      const ck = columnKey(r, c);
      for (const fl of [1, 2] as Floor[]) {
        const id = colJob(fl, ck);
        const deps = fl === 2 ? [colJob(1, ck)] : [];
        jobs.push({
          id,
          kind: "column",
          resource: "column",
          te: p.teColumn,
          elementKey: ck,
          floor: fl,
          colKey: ck,
          story: fl,
          deps,
          status: "pending",
        });
      }
    }
  }

  // Beams
  const beamJobs: Job[] = [];
  for (const fl of [1, 2] as Floor[]) {
    for (let r = 0; r < COL_ROWS; r++) {
      for (let c = 0; c < COL_COLS - 1; c++) {
        const a = columnKey(r, c);
        const b = columnKey(r, c + 1);
        const bk = beamKey(fl, a, b);
        beamJobs.push({
          id: `job-${bk}`,
          kind: "beam",
          resource: "beam",
          te: p.teBeam,
          elementKey: bk,
          floor: fl,
          deps: [colJob(fl, a), colJob(fl, b)],
          status: "pending",
        });
      }
    }
    for (let c = 0; c < COL_COLS; c++) {
      for (let r = 0; r < COL_ROWS - 1; r++) {
        const a = columnKey(r, c);
        const b = columnKey(r + 1, c);
        const bk = beamKey(fl, a, b);
        beamJobs.push({
          id: `job-${bk}`,
          kind: "beam",
          resource: "beam",
          te: p.teBeam,
          elementKey: bk,
          floor: fl,
          deps: [colJob(fl, a), colJob(fl, b)],
          status: "pending",
        });
      }
    }
  }
  jobs.push(...beamJobs);

  // Panels — depend on zone's 4 beams
  for (const fl of [1, 2] as Floor[]) {
    for (let z = 1; z <= 8; z++) {
      const n = panelsForZone(z as ZoneId, fl);
      const bayRow = z <= 4 ? 0 : 1;
      const bayCol = z <= 4 ? z - 1 : z - 5;
      const tl = columnKey(bayRow, bayCol);
      const tr = columnKey(bayRow, bayCol + 1);
      const bl = columnKey(bayRow + 1, bayCol);
      const br = columnKey(bayRow + 1, bayCol + 1);
      const beamDeps = [
        `job-${beamKey(fl, tl, tr)}`,
        `job-${beamKey(fl, bl, br)}`,
        `job-${beamKey(fl, tl, bl)}`,
        `job-${beamKey(fl, tr, br)}`,
      ];
      for (let i = 0; i < n; i++) {
        const pk = panelKey(fl, z as ZoneId, i);
        jobs.push({
          id: `job-${pk}`,
          kind: "panel",
          resource: "panel",
          te: p.tePanel,
          elementKey: pk,
          floor: fl,
          zone: z as ZoneId,
          deps: beamDeps,
          status: "pending",
        });
      }
    }
  }

  // Stair — deps: all C3 columns L1+L2 + beams on C3 axis both floors
  const stairDeps: string[] = [];
  for (const fl of [1, 2] as Floor[]) {
    for (let r = 0; r < COL_ROWS; r++) {
      stairDeps.push(colJob(fl, columnKey(r, STAIR_COL)));
    }
    for (let r = 0; r < COL_ROWS; r++) {
      stairDeps.push(`job-${beamKey(fl, columnKey(r, STAIR_COL - 1), columnKey(r, STAIR_COL))}`);
      stairDeps.push(`job-${beamKey(fl, columnKey(r, STAIR_COL), columnKey(r, STAIR_COL + 1))}`);
    }
    for (let r = 0; r < COL_ROWS - 1; r++) {
      stairDeps.push(`job-${beamKey(fl, columnKey(r, STAIR_COL), columnKey(r + 1, STAIR_COL))}`);
    }
  }
  jobs.push({
    id: `job-${stairKey()}`,
    kind: "stair",
    resource: "stair",
    te: p.teStair,
    elementKey: stairKey(),
    deps: stairDeps,
    status: "pending",
  });

  // Refresh te from params
  for (const j of jobs) j.te = teFor(j.kind, p);
  return jobs;
}

function emptyVisual(): DesSnapshot["visual"] {
  const columns: Record<string, ElementStatus> = {};
  const columnFloor: Record<string, 0 | 1 | 2> = {};
  for (let r = 0; r < COL_ROWS; r++) {
    for (let c = 0; c < COL_COLS; c++) {
      const k = columnKey(r, c);
      columns[k] = "empty";
      columnFloor[k] = 0;
    }
  }
  const beams: Record<string, ElementStatus> = {};
  for (const fl of [1, 2] as Floor[]) {
    for (let r = 0; r < COL_ROWS; r++) {
      for (let c = 0; c < COL_COLS - 1; c++) {
        beams[beamKey(fl, columnKey(r, c), columnKey(r, c + 1))] = "empty";
      }
    }
    for (let c = 0; c < COL_COLS; c++) {
      for (let r = 0; r < COL_ROWS - 1; r++) {
        beams[beamKey(fl, columnKey(r, c), columnKey(r + 1, c))] = "empty";
      }
    }
  }
  const panels: Record<string, ElementStatus> = {};
  for (const fl of [1, 2] as Floor[]) {
    for (let z = 1; z <= 8; z++) {
      const n = panelsForZone(z as ZoneId, fl);
      for (let i = 0; i < n; i++) panels[panelKey(fl, z as ZoneId, i)] = "empty";
    }
  }
  return {
    columns,
    columnFloor,
    beams,
    panels,
    stairs: { [stairKey()]: "empty" },
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
  visual: DesSnapshot["visual"];
  /** job release stagger for ca */
  nextReleaseT = 0;

  constructor(params: DesParams = DEFAULT_DES_PARAMS) {
    this.params = { ...params };
    this.rng = mulberry32(params.seed);
    this.jobs = buildJobs(params);
    this.panelBuffer = params.panelBufferInitial;
    this.visual = emptyVisual();
    this.lastMessage = "DES siap. Product & process fixed · putar Capacity / Variability / Inventory.";
    this.eventLog = [
      "Fondasi & sloof siap. DES multi-moda: M kolom · N balok · F panel · M stair.",
      `Seed=${params.seed} · CONWIP=${params.conwip} · L_panel=${params.panelLeadTime}`,
    ];
    // Kick off: try schedule initial work
    this.schedule({ t: 0, type: "CHECK", seq: this.seq++ });
  }

  private pushLog(line: string) {
    this.eventLog = [line, ...this.eventLog].slice(0, 50);
  }

  private schedule(ev: DesEvent) {
    this.heap.push(ev);
    this.heap.sort((a, b) => a.t - b.t || a.seq - b.seq);
  }

  private currentWip(): number {
    return this.jobs.filter((j) => j.status === "running" || j.status === "ready").length;
  }

  private depsDone(job: Job): boolean {
    return job.deps.every((d) => this.jobs.find((j) => j.id === d)?.status === "done");
  }

  private markWip(t: number) {
    const w = this.jobs.filter((j) => j.status === "running").length;
    this.wipArea += w * Math.max(0, t - this.lastWipT);
    this.lastWipT = t;
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

  private tryOrderPanel(job: Job, t: number) {
    if (job.kind !== "panel") return;
    if (this.orderedPanels.has(job.elementKey)) return;
    this.orderedPanels.add(job.elementKey);
    this.panelOrders++;
    const L = sampleInterarrival(this.params.panelLeadTime, this.params.ca * 0.5, this.rng);
    this.panelInTransit++;
    this.schedule({
      t: t + L,
      type: "PANEL_ARRIVE",
      panelKey: job.elementKey,
      seq: this.seq++,
      note: `Panel ${job.elementKey} tiba (L≈${L.toFixed(2)})`,
    });
    // mark queued visually as ordered
    if (this.visual.panels[job.elementKey] === "empty") {
      this.visual.panels[job.elementKey] = "queued";
    }
  }

  private tryStartJobs(t: number) {
    // Order panels for any job whose beams deps are close (deps done or running beams)
    for (const j of this.jobs) {
      if (j.kind === "panel" && j.status === "pending" && this.depsDone(j)) {
        this.tryOrderPanel(j, t);
      }
    }

    // Release stagger for variability ca
    if (t < this.nextReleaseT) return;

    const pending = this.jobs.filter((j) => j.status === "pending" && this.depsDone(j));
    // Priority: columns → beams → panels → stair (process design fixed)
    const order: JobKind[] = ["column", "beam", "panel", "stair"];
    pending.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));

    for (const job of pending) {
      const wip = this.jobs.filter((j) => j.status === "running").length;
      if (wip >= this.params.conwip) {
        // inventory lever: CONWIP blocks start
        break;
      }

      if (job.kind === "panel") {
        this.panelDemandAttempts++;
        if (this.panelBuffer <= 0) {
          this.panelStockouts++;
          this.tryOrderPanel(job, t);
          continue; // inventory lever: no stock
        }
      }

      const m = mFor(job.resource, this.params);
      if (this.busy[job.resource] >= m) continue;

      // Start
      this.busy[job.resource]++;
      job.status = "running";
      job.startT = t;
      if (job.kind === "panel") this.panelBuffer--;

      // Visual
      this.applyStartVisual(job);

      const pt = sampleProcessTime(job.te, this.params.ce, this.rng);
      this.schedule({
        t: t + pt,
        type: "END",
        jobId: job.id,
        seq: this.seq++,
        note: `END ${job.kind} ${job.elementKey}`,
      });

      // ca: small gap before next release attempt
      const gap = sampleInterarrival(0.05 * job.te, this.params.ca, this.rng);
      this.nextReleaseT = t + gap;

      this.lastMessage = `START ${job.kind.toUpperCase()} · ${job.elementKey} · te≈${pt.toFixed(2)} hari`;
      this.pushLog(`t=${t.toFixed(2)} START ${job.kind} ${job.elementKey}`);
      return; // one start per CHECK to keep animation readable
    }
  }

  private applyStartVisual(job: Job) {
    if (job.kind === "column" && job.colKey) {
      this.visual.columns[job.colKey] = "producing";
    } else if (job.kind === "beam") {
      this.visual.beams[job.elementKey] = "producing";
    } else if (job.kind === "panel") {
      this.visual.panels[job.elementKey] = "producing";
    } else if (job.kind === "stair") {
      this.visual.stairs[job.elementKey] = "producing";
    }
  }

  private applyEndVisual(job: Job) {
    if (job.kind === "column" && job.colKey && job.story) {
      this.visual.columns[job.colKey] = "installed";
      const prev = this.visual.columnFloor[job.colKey] ?? 0;
      this.visual.columnFloor[job.colKey] = Math.max(prev, job.story) as 0 | 1 | 2;
    } else if (job.kind === "beam") {
      this.visual.beams[job.elementKey] = "installed";
    } else if (job.kind === "panel") {
      this.visual.panels[job.elementKey] = "installed";
    } else if (job.kind === "stair") {
      this.visual.stairs[job.elementKey] = "installed";
    }
  }

  /** Process one event; returns false if no more events / complete */
  step(): boolean {
    if (this.complete) return false;
    if (this.heap.length === 0) {
      // try one more check
      this.schedule({ t: this.t, type: "CHECK", seq: this.seq++ });
    }
    if (this.heap.length === 0) return false;

    const ev = this.heap.shift()!;
    this.accumulateBusy(ev.t);
    this.markWip(ev.t);
    this.t = ev.t;
    this.eventsProcessed++;

    if (ev.type === "PANEL_ARRIVE" && ev.panelKey) {
      this.panelInTransit = Math.max(0, this.panelInTransit - 1);
      this.panelBuffer++;
      this.panelArrivals++;
      this.lastMessage = `Panel tiba di staging · buffer=${this.panelBuffer}`;
      this.pushLog(`t=${this.t.toFixed(2)} ARRIVE panel · buffer=${this.panelBuffer}`);
      this.schedule({ t: this.t, type: "CHECK", seq: this.seq++ });
      return true;
    }

    if (ev.type === "END" && ev.jobId) {
      const job = this.jobs.find((j) => j.id === ev.jobId);
      if (job && job.status === "running") {
        job.status = "done";
        job.endT = this.t;
        job.ct = (job.endT ?? this.t) - (job.startT ?? this.t);
        this.ctSum += job.ct;
        this.ctCount++;
        this.busy[job.resource] = Math.max(0, this.busy[job.resource] - 1);
        this.applyEndVisual(job);
        this.lastMessage = `END ${job.kind.toUpperCase()} · CT=${job.ct.toFixed(2)} · t=${this.t.toFixed(2)}`;
        this.pushLog(`t=${this.t.toFixed(2)} END ${job.kind} ${job.elementKey} CT=${job.ct.toFixed(2)}`);
      }
      this.schedule({ t: this.t, type: "CHECK", seq: this.seq++ });
      this.checkComplete();
      return true;
    }

    if (ev.type === "CHECK" || ev.type === "RELEASE" || ev.type === "START") {
      this.tryStartJobs(this.t);
      // If still idle work possible later (panel in transit), schedule check at next arrival
      const runnable = this.jobs.some((j) => j.status === "pending" && this.depsDone(j));
      const running = this.jobs.some((j) => j.status === "running");
      if (!running && runnable && this.heap.length === 0) {
        // blocked by CONWIP or stock — nudge time slightly
        if (this.panelInTransit > 0) {
          // wait for arrival already scheduled
        } else if (this.currentWip() >= this.params.conwip) {
          // shouldn't happen if nothing running
        } else {
          // schedule delayed retry (variability / resource)
          this.schedule({
            t: this.t + 0.01,
            type: "CHECK",
            seq: this.seq++,
          });
        }
      }
      // Keep scheduling CHECK after ends; if work remains and heap empty, force progress
      if (!this.complete && this.heap.length === 0) {
        const pending = this.jobs.filter((j) => j.status !== "done");
        if (pending.length === 0) this.checkComplete();
        else {
          // deadlocked? break panel stock by emergency order
          for (const j of pending) {
            if (j.kind === "panel" && this.depsDone(j)) this.tryOrderPanel(j, this.t);
          }
          if (this.heap.length === 0) {
            // try start again with higher time for ca gap
            this.nextReleaseT = this.t;
            this.tryStartJobs(this.t);
          }
          if (this.heap.length === 0 && pending.some((j) => j.status === "running")) {
            // running jobs should have END scheduled — bug
          }
        }
      }
      this.checkComplete();
      return !this.complete || this.eventsProcessed > 0;
    }

    return true;
  }

  /** Run many events (for fast-forward) */
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
