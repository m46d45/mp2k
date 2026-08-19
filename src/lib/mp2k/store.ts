import { create } from "zustand";
import {
  type ElementStatus,
  type Floor,
  type LeverId,
  type Phase,
  type ZoneId,
  WAVE_PAIRS,
  stairKey,
  TOTALS,
  c3StructureReady,
  panelsForZone,
  hasStairVoid,
} from "./model";
import {
  DesEngine,
  DEFAULT_DES_PARAMS,
  type DesParams,
  type DesMetrics,
  type DesTracePoint,
} from "./des/engine";

export type SimSpeed = "manual" | "slow" | "normal" | "fast";
export type SimPhase = Phase | "idle" | "complete" | "running";

export type ZoneState = {
  id: ZoneId;
  floor: Floor;
  phase: Phase;
  columnsReady: boolean;
  beamsReady: boolean;
  panelsReady: boolean;
  stairReady: boolean;
  closed: boolean;
};

export type Metrics = {
  columnsInstalled: number;
  beamsInstalled: number;
  panelsInstalled: number;
  zonesClosed: number;
  wipYard: number;
  wipStaging: number;
  openZones: number;
  matchScore: number;
  stairInstalled: boolean;
  c3Ready: boolean;
};

type ElementMap = Record<string, ElementStatus>;

type Mp2kState = {
  columns: ElementMap;
  columnFloor: Record<string, 0 | 1 | 2>;
  beams: ElementMap;
  panels: ElementMap;
  stairs: ElementMap;

  floor: Floor;
  waveIndex: number;
  phase: SimPhase;
  zones: ZoneState[];
  log: string[];
  metrics: Metrics;

  /** DES */
  desParams: DesParams;
  desMetrics: DesMetrics | null;
  /** Jejak waktu lab DES (Fase 1 logger; chart di Fase 2) */
  desTrace: DesTracePoint[];
  simTime: number;
  panelBuffer: number;
  panelInTransit: number;
  desComplete: boolean;

  activeLever: LeverId | null;
  leverSettings: {
    productStandard: boolean;
    processPull: boolean;
    capacityBoost: boolean;
    inventoryCap: boolean;
    variabilityControl: boolean;
  };

  playing: boolean;
  speed: SimSpeed;
  stepCount: number;
  lastMessage: string;

  /** engine held outside reactive clones via ref-like slot */
  _engine: DesEngine | null;

  reset: () => void;
  setDesParams: (patch: Partial<DesParams>) => void;
  setActiveLever: (id: LeverId | null) => void;
  toggleLeverSetting: (key: keyof Mp2kState["leverSettings"]) => void;
  setSpeed: (s: SimSpeed) => void;
  setPlaying: (p: boolean) => void;
  step: () => void;
  runAll: () => void;
  getCurrentPair: () => [ZoneId, ZoneId] | null;
};

function countStatus(map: ElementMap, statuses: ElementStatus[]) {
  let n = 0;
  for (const v of Object.values(map)) if (statuses.includes(v)) n++;
  return n;
}

function deriveZones(
  beams: ElementMap,
  panels: ElementMap,
  columnFloor: Record<string, 0 | 1 | 2>,
  stairs: ElementMap,
): ZoneState[] {
  const zones: ZoneState[] = [];
  for (const fl of [1, 2] as Floor[]) {
    for (let z = 1; z <= 8; z++) {
      const zid = z as ZoneId;
      const pkeys = panelsForZone(fl, zid);
      const panelsReady =
        pkeys.length > 0 && pkeys.every((k) => panels[k] === "installed");
      const stairReady = fl === 1 && z === 6 ? stairs[stairKey()] === "installed" : true;
      const closed = panelsReady && stairReady;
      zones.push({
        id: zid,
        floor: fl,
        phase: closed ? ("closed" as Phase) : panelsReady ? ("panels" as Phase) : ("columns" as Phase),
        columnsReady: true,
        beamsReady: true,
        panelsReady,
        stairReady,
        closed,
      });
    }
  }
  return zones;
}

function computeMetrics(
  columnFloor: Record<string, 0 | 1 | 2>,
  beams: ElementMap,
  panels: ElementMap,
  stairs: ElementMap,
  zones: ZoneState[],
  des: DesMetrics | null,
): Metrics {
  const columnsInstalled = Object.values(columnFloor).filter((f) => f >= 1).length;
  const beamsInstalled = countStatus(beams, ["installed"]);
  const panelsInstalled = countStatus(panels, ["installed"]);
  const zonesClosed = zones.filter((z) => z.closed).length;
  const openZones = zones.filter((z) => !z.closed).length;
  const wipYard = countStatus(beams, ["queued", "producing", "ready"]);
  const wipStaging = countStatus(panels, ["queued", "producing", "ready"]);
  const stairInstalled = stairs[stairKey()] === "installed";
  const c3Ready = c3StructureReady(columnFloor, beams);
  const progress =
    (columnsInstalled + beamsInstalled + panelsInstalled) /
    Math.max(1, TOTALS.columns * 2 + TOTALS.beams + TOTALS.panels);
  const wipPenalty = Math.min(0.35, ((des?.avgWip ?? wipYard + wipStaging) * 0.02));
  const matchScore = Math.max(0, Math.min(100, Math.round(progress * 100 - wipPenalty * 50)));
  return {
    columnsInstalled,
    beamsInstalled,
    panelsInstalled,
    zonesClosed,
    wipYard,
    wipStaging,
    openZones,
    matchScore,
    stairInstalled,
    c3Ready,
  };
}

function applyEngine(engine: DesEngine) {
  const snap = engine.snapshot();
  const zones = deriveZones(
    snap.visual.beams,
    snap.visual.panels,
    snap.visual.columnFloor,
    snap.visual.stairs,
  );
  const desMetrics = snap.metrics;
  return {
    columns: snap.visual.columns,
    columnFloor: snap.visual.columnFloor,
    beams: snap.visual.beams,
    panels: snap.visual.panels,
    stairs: snap.visual.stairs,
    zones,
    log: snap.eventLog,
    lastMessage: snap.lastMessage,
    simTime: snap.t,
    panelBuffer: snap.panelBuffer,
    panelInTransit: snap.panelInTransit,
    desComplete: snap.complete,
    desMetrics,
    desTrace: snap.trace ?? [],
    phase: (snap.complete ? "complete" : "running") as SimPhase,
    metrics: computeMetrics(
      snap.visual.columnFloor,
      snap.visual.beams,
      snap.visual.panels,
      snap.visual.stairs,
      zones,
      desMetrics,
    ),
    floor: (Object.values(snap.visual.columnFloor).some((f) => f >= 2) ? 2 : 1) as Floor,
  };
}

function createEngine(params: DesParams) {
  return new DesEngine({ ...params });
}

function createInitial(params: DesParams = DEFAULT_DES_PARAMS) {
  const engine = createEngine(params);
  const applied = applyEngine(engine);
  return {
    ...applied,
    desParams: { ...params },
    _engine: engine,
    floor: 1 as Floor,
    waveIndex: 0,
    activeLever: null as LeverId | null,
    leverSettings: {
      productStandard: true,
      processPull: true,
      capacityBoost: false,
      inventoryCap: true,
      variabilityControl: true,
    },
    playing: false,
    speed: "normal" as SimSpeed,
    stepCount: 0,
    lastMessage: applied.lastMessage,
  };
}

export const useMp2k = create<Mp2kState>((set, get) => ({
  ...createInitial(),

  reset: () => {
    const { desParams } = get();
    set({ ...createInitial(desParams), playing: false });
  },

  setDesParams: (patch) => {
    const desParams = { ...get().desParams, ...patch };
    set({ ...createInitial(desParams), playing: false });
  },

  setActiveLever: (id) => set({ activeLever: id }),

  toggleLeverSetting: (key) =>
    set((s) => ({
      leverSettings: { ...s.leverSettings, [key]: !s.leverSettings[key] },
    })),

  setSpeed: (speed) => set({ speed }),

  setPlaying: (playing) => set({ playing }),

  getCurrentPair: () => {
    const { waveIndex, phase } = get();
    if (phase === "complete") return null;
    return WAVE_PAIRS[Math.min(waveIndex, 3)] ?? null;
  },

  step: () => {
    const s = get();
    if (s.desComplete || s.phase === "complete") {
      set({ lastMessage: "DES selesai. Reset atau ubah parameter tuas untuk run baru." });
      set({ playing: false });
      return;
    }
    let engine = s._engine;
    if (!engine) {
      engine = createEngine(s.desParams);
    }
    const burst = s.speed === "fast" ? 8 : s.speed === "normal" ? 3 : 1;
    for (let i = 0; i < burst; i++) {
      if (!engine.step()) break;
      if (engine.complete) break;
    }
    const applied = applyEngine(engine);
    set({
      ...applied,
      _engine: engine,
      stepCount: s.stepCount + 1,
      playing: engine.complete ? false : s.playing,
    });
  },

  runAll: () => {
    const s = get();
    const engine = s._engine ?? createEngine(s.desParams);
    engine.run(8000);
    const applied = applyEngine(engine);
    set({
      ...applied,
      _engine: engine,
      stepCount: s.stepCount + 1,
      playing: false,
    });
  },
}));
