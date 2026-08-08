import { useEffect, useState } from "react";
import { useMp2k } from "@/lib/mp2k/store";
import {
  COL_COLS,
  COL_ROWS,
  WAVE_PAIRS,
  zoneBay,
  type ZoneId,
  isStairZone,
  hasStairVoid,
  panelsForZone,
  panelKey,
  columnKey,
  zoneBeamKeys,
  beamKey,
  type Floor,
  stairKey,
  STAIR_COL,
} from "@/lib/mp2k/model";
import { cn } from "@/lib/utils";

const CELL = 56;
const PAD = 28;
const PLAN_H = PAD * 2 + (COL_ROWS - 1) * CELL;
const STORY_H = 44;
const FOUND_H = 12;
const ELEV_TOP = 18;
const ELEV_H = ELEV_TOP + STORY_H * 2 + FOUND_H + 28;
const SVG_W = PAD * 2 + (COL_COLS - 1) * CELL;

function colX(c: number): number {
  return PAD + c * CELL;
}

function rowY(r: number): number {
  return PAD + r * CELL;
}

function statusFill(
  status: string | undefined,
  kind: "col" | "beam" | "panel" | "found",
): string {
  if (kind === "found") return "var(--color-foundation)";
  if (!status || status === "empty") return "var(--color-empty)";
  if (status === "queued") return "#c8c8c6";
  if (status === "producing") return "#9a9a98";
  if (status === "ready") return "#6a6a68";
  if (kind === "col") return "var(--color-column)";
  if (kind === "beam") return "var(--color-beam)";
  return "var(--color-panel)";
}

function colStatus(
  key: string,
  viewFloor: Floor,
  floor: Floor,
  columnFloor: Record<string, 0 | 1 | 2>,
  columns: Record<string, string>,
): string {
  const cf = columnFloor[key] ?? 0;
  if (cf >= viewFloor) return "installed";
  if (columns[key] !== "empty" && floor === viewFloor) return columns[key];
  return "empty";
}

/** Tangga L1→L2: void or steps — never a floor panel; never extends to roof */
function StairGlyph({
  x,
  y,
  w,
  h,
  status,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  status: string | undefined;
}) {
  const st = status ?? "empty";
  if (st === "empty") {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="var(--color-void)"
          stroke="var(--color-border-strong)"
          strokeWidth={1}
          strokeDasharray="3 2"
        />
        <line
          x1={x + 2}
          y1={y + 2}
          x2={x + w - 2}
          y2={y + h - 2}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        <line
          x1={x + w - 2}
          y1={y + 2}
          x2={x + 2}
          y2={y + h - 2}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        <text
          x={x + w / 2}
          y={y + h / 2 + 3}
          textAnchor="middle"
          fill="var(--color-faint)"
          fontSize={7}
          fontWeight={600}
        >
          void
        </text>
      </g>
    );
  }
  const steps = 4;
  const sh = h / steps;
  const opacity = st === "installed" ? 1 : st === "ready" ? 0.85 : 0.55;
  return (
    <g opacity={opacity}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="var(--color-elevated)"
        stroke="var(--color-fg)"
        strokeWidth={1.25}
      />
      {Array.from({ length: steps }).map((_, i) => (
        <rect
          key={i}
          x={x + 2}
          y={y + h - (i + 1) * sh + 1}
          width={Math.max(4, w - 4 - (steps - 1 - i) * 1.2)}
          height={Math.max(2, sh - 2)}
          fill="var(--color-stair)"
          opacity={0.25 + i * 0.14}
        />
      ))}
      <text
        x={x + w / 2}
        y={y + 9}
        textAnchor="middle"
        fill="var(--color-fg)"
        fontSize={6}
        fontWeight={700}
      >
        M
      </text>
    </g>
  );
}

export function BuildingView() {
  const floor = useMp2k((s) => s.floor);
  const waveIndex = useMp2k((s) => s.waveIndex);
  const phase = useMp2k((s) => s.phase);
  const columnFloor = useMp2k((s) => s.columnFloor);
  const columns = useMp2k((s) => s.columns);
  const beams = useMp2k((s) => s.beams);
  const panels = useMp2k((s) => s.panels);
  const stairs = useMp2k((s) => s.stairs);
  const zones = useMp2k((s) => s.zones);
  const metrics = useMp2k((s) => s.metrics);

  // When viewing L2 during stair/complete, show L2 plan (3 panels on Z6)
  const viewFloor: Floor = phase === "complete" || phase === "stair" ? 2 : floor;

  const pair =
    phase === "complete" || phase === "idle" || phase === "stair" ? null : WAVE_PAIRS[waveIndex];
  const activeZones = new Set(pair ?? []);
  const stairSt =
    phase === "complete" || metrics.stairInstalled ? "installed" : stairs[stairKey()];

  const [elevRow, setElevRow] = useState(1);
  const [autoRow, setAutoRow] = useState(true);

  useEffect(() => {
    if (!autoRow) return;
    if (phase === "stair" || phase === "complete") {
      setElevRow(1);
      return;
    }
    if (!pair) return;
    const bay = zoneBay(pair[0]);
    setElevRow(bay.bayRow === 0 ? 0 : 1);
  }, [pair, autoRow, waveIndex, floor, phase]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-faint">
            Denah + elevasi (lokasi selaras)
          </p>
          <p className="text-sm text-muted">
            {phase === "stair" ? (
              <>
                Fase <span className="font-semibold text-fg">tangga L1→L2</span>
                {" · "}
                C3{" "}
                <span className="font-semibold text-fg">{metrics.c3Ready ? "siap" : "belum"}</span>
                {" · "}
                <span className="text-faint">tidak ke atap</span>
              </>
            ) : phase === "complete" ? (
              <span className="font-semibold text-fg">Frame + tangga L1→L2 selesai</span>
            ) : (
              <>
                Lantai <span className="font-semibold text-fg tabular-nums">L{viewFloor}</span>
                {pair && (
                  <>
                    {" · "}Z{pair[0]}+Z{pair[1]}
                    {" · "}
                    <span className="text-fg">{phaseLabel(phase)}</span>
                  </>
                )}
                {viewFloor === 1 && pair && (pair[0] === 6 || pair[1] === 6) && (
                  <span className="text-faint"> · Z6 L1: 2 panel + void</span>
                )}
                {viewFloor === 2 && pair && (pair[0] === 6 || pair[1] === 6) && (
                  <span className="text-faint"> · Z6 L2: 3 panel</span>
                )}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-muted">
          <Legend swatch="var(--color-column)" label="Kolom M" />
          <Legend swatch="var(--color-beam)" label="Balok N" />
          <Legend swatch="var(--color-panel)" label="Panel F" />
          <Legend swatch="var(--color-void)" label="Void L1 only" border />
          <Legend swatch="var(--color-stair)" label="Tangga L1→L2" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-faint">Proyeksi elevasi baris denah:</span>
        <div className="flex rounded-[var(--radius-sm)] border border-border bg-elevated p-1">
          {[0, 1, 2].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setAutoRow(false);
                setElevRow(r);
              }}
              className={cn(
                "min-h-9 rounded-[calc(var(--radius-sm)-2px)] px-2.5 text-xs font-medium",
                elevRow === r ? "bg-primary text-primary-fg" : "text-muted hover:text-fg",
              )}
            >
              Baris {r + 1}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAutoRow(true)}
          className={cn(
            "min-h-9 rounded-[var(--radius-sm)] border px-2.5 text-xs font-medium",
            autoRow ? "border-fg/30 bg-subtle text-fg" : "border-border text-muted hover:text-fg",
          )}
        >
          Ikuti gelombang
        </button>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface p-3">
        <div className="mx-auto w-full max-w-lg">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-faint">
            Denah · L{viewFloor}
            {viewFloor === 2 ? " (penutup / ke atap — Z6 = 3 panel)" : " (Z6 = 2 panel + void tangga)"}
          </p>
          <svg
            viewBox={`0 0 ${SVG_W} ${PLAN_H + 22}`}
            className="h-auto w-full"
            role="img"
            aria-label={`Denah lantai ${viewFloor}`}
          >
            <rect
              x={PAD - 16}
              y={rowY(elevRow) - 14}
              width={(COL_COLS - 1) * CELL + 32}
              height={28}
              rx={6}
              fill="color-mix(in oklab, var(--color-fg) 6%, transparent)"
              stroke="var(--color-fg)"
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.7}
            />

            <line
              x1={colX(STAIR_COL)}
              y1={PAD - 18}
              x2={colX(STAIR_COL)}
              y2={PAD + (COL_ROWS - 1) * CELL + 18}
              stroke="var(--color-fg)"
              strokeWidth={1}
              strokeDasharray="2 3"
              opacity={0.25}
            />
            <text
              x={colX(STAIR_COL)}
              y={PAD - 20}
              textAnchor="middle"
              fill="var(--color-faint)"
              fontSize={8}
              fontFamily="var(--font-mono)"
            >
              C3 · tangga L1→L2
            </text>

            <rect
              x={PAD - 14}
              y={PAD - 14}
              width={(COL_COLS - 1) * CELL + 28}
              height={(COL_ROWS - 1) * CELL + 28}
              fill="none"
              stroke={statusFill("installed", "found")}
              strokeWidth={5}
              rx={4}
              opacity={0.9}
            />

            {Array.from({ length: COL_COLS }).map((_, c) => (
              <text
                key={`ci-${c}`}
                x={colX(c)}
                y={PLAN_H + 12}
                textAnchor="middle"
                fill={c === STAIR_COL ? "var(--color-fg)" : "var(--color-faint)"}
                fontSize={9}
                fontWeight={c === STAIR_COL ? 700 : 400}
                fontFamily="var(--font-mono)"
              >
                C{c + 1}
              </text>
            ))}

            {([1, 2, 3, 4, 5, 6, 7, 8] as ZoneId[]).map((z) => {
              const { bayRow, bayCol } = zoneBay(z);
              const x = PAD + bayCol * CELL;
              const y = PAD + bayRow * CELL;
              const zs = zones.find((q) => q.id === z && q.floor === viewFloor);
              const active = activeZones.has(z) && viewFloor === floor && phase !== "complete";
              const closed = zs?.closed;
              const nPanels = panelsForZone(z, viewFloor);
              const pw = (CELL - 20) / 3;
              const showVoid = hasStairVoid(z, viewFloor);
              return (
                <g key={`zone-${z}`}>
                  <rect
                    x={x + 6}
                    y={y + 6}
                    width={CELL - 12}
                    height={CELL - 12}
                    rx={6}
                    fill={
                      closed
                        ? "color-mix(in oklab, var(--color-fg) 5%, transparent)"
                        : active
                          ? "color-mix(in oklab, var(--color-fg) 8%, transparent)"
                          : "transparent"
                    }
                    stroke={
                      active
                        ? "var(--color-fg)"
                        : closed
                          ? "var(--color-border-strong)"
                          : "var(--color-border)"
                    }
                    strokeWidth={active ? 1.5 : 1}
                    strokeDasharray={closed || active ? undefined : "3 3"}
                  />
                  {Array.from({ length: nPanels }).map((_, i) => {
                    const st = panels[panelKey(viewFloor, z, i)];
                    return (
                      <rect
                        key={i}
                        x={x + 10 + i * (pw + 2)}
                        y={y + 14}
                        width={pw}
                        height={CELL - 28}
                        rx={2}
                        fill={statusFill(st, "panel")}
                        opacity={st === "empty" ? 0.3 : 0.95}
                      />
                    );
                  })}
                  {showVoid && (
                    <StairGlyph
                      x={x + 10 + 2 * (pw + 2)}
                      y={y + 14}
                      w={pw}
                      h={CELL - 28}
                      status={stairSt}
                    />
                  )}
                  <text
                    x={x + CELL / 2}
                    y={y + 12}
                    textAnchor="middle"
                    fill={active ? "var(--color-fg)" : "var(--color-faint)"}
                    fontSize={9}
                    fontWeight={600}
                  >
                    Z{z}
                    {isStairZone(z) ? (viewFloor === 1 ? "*" : "") : ""}
                  </text>
                </g>
              );
            })}

            {([1, 2, 3, 4, 5, 6, 7, 8] as ZoneId[]).flatMap((z) => {
              const keys = zoneBeamKeys(viewFloor, z);
              const { bayRow, bayCol } = zoneBay(z);
              const edges = [
                {
                  key: keys[0],
                  x1: colX(bayCol),
                  y1: rowY(bayRow),
                  x2: colX(bayCol + 1),
                  y2: rowY(bayRow),
                },
                {
                  key: keys[1],
                  x1: colX(bayCol),
                  y1: rowY(bayRow + 1),
                  x2: colX(bayCol + 1),
                  y2: rowY(bayRow + 1),
                },
                {
                  key: keys[2],
                  x1: colX(bayCol),
                  y1: rowY(bayRow),
                  x2: colX(bayCol),
                  y2: rowY(bayRow + 1),
                },
                {
                  key: keys[3],
                  x1: colX(bayCol + 1),
                  y1: rowY(bayRow),
                  x2: colX(bayCol + 1),
                  y2: rowY(bayRow + 1),
                },
              ];
              return edges.map((e, i) => (
                <line
                  key={`${z}-${i}-${e.key}`}
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  stroke={statusFill(beams[e.key], "beam")}
                  strokeWidth={beams[e.key] === "installed" || beams[e.key] === "ready" ? 5 : 3}
                  strokeLinecap="round"
                  opacity={beams[e.key] === "empty" ? 0.25 : 1}
                />
              ));
            })}

            {Array.from({ length: COL_ROWS }).flatMap((_, r) =>
              Array.from({ length: COL_COLS }).map((__, c) => {
                const key = columnKey(r, c);
                const st = colStatus(key, viewFloor, floor, columnFloor, columns);
                const onElev = r === elevRow;
                const isC3 = c === STAIR_COL;
                return (
                  <circle
                    key={key}
                    cx={colX(c)}
                    cy={rowY(r)}
                    r={onElev || isC3 ? 8 : 7}
                    fill={statusFill(st, "col")}
                    stroke={
                      isC3
                        ? "var(--color-fg)"
                        : onElev
                          ? "var(--color-border-strong)"
                          : "var(--color-surface)"
                    }
                    strokeWidth={isC3 ? 2.5 : 2}
                  />
                );
              }),
            )}
          </svg>

          <svg viewBox={`0 0 ${SVG_W} 16`} className="h-4 w-full" aria-hidden>
            {Array.from({ length: COL_COLS }).map((_, c) => (
              <line
                key={c}
                x1={colX(c)}
                y1={0}
                x2={colX(c)}
                y2={16}
                stroke="var(--color-fg)"
                strokeWidth={c === STAIR_COL ? 1.25 : 1}
                strokeDasharray="2 2"
                opacity={c === STAIR_COL ? 0.55 : 0.3}
              />
            ))}
          </svg>

          <p className="mb-1 mt-1 text-[10px] font-medium uppercase tracking-wider text-faint">
            Elevasi · baris {elevRow + 1} · tangga hanya di band L1 (L1→L2), L2 ke atap = panel
          </p>
          <svg
            viewBox={`0 0 ${SVG_W} ${ELEV_H}`}
            className="h-auto w-full"
            role="img"
            aria-label={`Elevasi baris ${elevRow + 1}`}
          >
            <rect
              x={PAD - 14}
              y={ELEV_TOP + STORY_H * 2}
              width={(COL_COLS - 1) * CELL + 28}
              height={FOUND_H}
              rx={3}
              fill={statusFill("installed", "found")}
            />
            <text
              x={PAD - 8}
              y={ELEV_TOP + STORY_H * 2 + FOUND_H + 14}
              fill="var(--color-faint)"
              fontSize={9}
            >
              Fondasi + sloof siap · jejak denah
            </text>

            <line
              x1={PAD - 18}
              y1={ELEV_TOP + STORY_H}
              x2={PAD + (COL_COLS - 1) * CELL + 18}
              y2={ELEV_TOP + STORY_H}
              stroke="var(--color-border)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <text x={4} y={ELEV_TOP + STORY_H / 2 + 3} fill="var(--color-faint)" fontSize={8}>
              L2
            </text>
            <text
              x={4}
              y={ELEV_TOP + STORY_H + STORY_H / 2 + 3}
              fill="var(--color-faint)"
              fontSize={8}
            >
              L1
            </text>
            <text
              x={SVG_W - 8}
              y={ELEV_TOP + 10}
              textAnchor="end"
              fill="var(--color-faint)"
              fontSize={7}
            >
              → atap
            </text>

            {([1, 2] as Floor[]).map((fl) => {
              const yBeam = fl === 2 ? ELEV_TOP + 6 : ELEV_TOP + STORY_H + 6;
              return Array.from({ length: COL_COLS - 1 }).map((_, c) => {
                const bk = beamKey(fl, columnKey(elevRow, c), columnKey(elevRow, c + 1));
                const st = beams[bk];
                return (
                  <line
                    key={bk}
                    x1={colX(c)}
                    y1={yBeam}
                    x2={colX(c + 1)}
                    y2={yBeam}
                    stroke={statusFill(st, "beam")}
                    strokeWidth={st === "installed" || st === "ready" ? 5 : 3}
                    strokeLinecap="round"
                    opacity={st === "empty" ? 0.2 : 1}
                  />
                );
              });
            })}

            {/* Floor panels per level — Z6 L1 has 2; Z6 L2 has 3 */}
            {([1, 2] as Floor[]).map((fl) => {
              const yPanel = fl === 2 ? ELEV_TOP + 10 : ELEV_TOP + STORY_H + 10;
              return ([1, 2, 3, 4, 5, 6, 7, 8] as ZoneId[]).map((z) => {
                const { bayRow, bayCol } = zoneBay(z);
                if (bayRow !== elevRow) return null;
                const n = panelsForZone(z, fl);
                const span = CELL - 8;
                const pw = span / 3;
                const x0 = colX(bayCol) + 4;
                return (
                  <g key={`ep-${fl}-${z}`}>
                    {Array.from({ length: n }).map((_, i) => {
                      const st = panels[panelKey(fl, z, i)];
                      return (
                        <rect
                          key={i}
                          x={x0 + i * pw}
                          y={yPanel}
                          width={pw - 2}
                          height={5}
                          rx={1}
                          fill={statusFill(st, "panel")}
                          opacity={st === "empty" ? 0.2 : 0.9}
                        />
                      );
                    })}
                  </g>
                );
              });
            })}

            {/* Stair only in L1 story band (between L1 slab and L2 slab) — not through L2 to roof */}
            {elevRow === 1 && (
              <g>
                <rect
                  x={colX(STAIR_COL) - 10}
                  y={ELEV_TOP + STORY_H + 4}
                  width={20}
                  height={STORY_H - 8}
                  fill="none"
                  stroke="var(--color-fg)"
                  strokeWidth={1}
                  strokeDasharray={
                    stairSt === "installed" || stairSt === "ready" || stairSt === "producing"
                      ? undefined
                      : "3 2"
                  }
                  opacity={0.45}
                />
                <StairGlyph
                  x={colX(STAIR_COL) - 9}
                  y={ELEV_TOP + STORY_H + 6}
                  w={18}
                  h={STORY_H - 12}
                  status={stairSt}
                />
                <text
                  x={colX(STAIR_COL)}
                  y={ELEV_TOP + STORY_H + STORY_H / 2}
                  textAnchor="middle"
                  fill="var(--color-faint)"
                  fontSize={7}
                  fontFamily="var(--font-mono)"
                  dy={-STORY_H / 2 + 2}
                >
                  L1→L2
                </text>
                {/* L2 at C3: solid floor (3 panels) — no stair shaft above */}
                <text
                  x={colX(STAIR_COL)}
                  y={ELEV_TOP + STORY_H / 2 + 3}
                  textAnchor="middle"
                  fill="var(--color-faint)"
                  fontSize={7}
                >
                  panel
                </text>
              </g>
            )}

            {Array.from({ length: COL_COLS }).map((_, c) => {
              const key = columnKey(elevRow, c);
              const cf = columnFloor[key] ?? 0;
              const baseY = ELEV_TOP + STORY_H * 2;
              const stL1 = cf >= 1 ? "installed" : floor === 1 ? columns[key] : "empty";
              const stL2 =
                cf >= 2
                  ? "installed"
                  : floor === 2 && cf >= 1
                    ? columns[key] !== "empty"
                      ? columns[key]
                      : "empty"
                    : "empty";

              return (
                <g key={`ecol-${c}`}>
                  <rect
                    x={colX(c) - 5}
                    y={ELEV_TOP + STORY_H}
                    width={10}
                    height={STORY_H}
                    rx={2}
                    fill={statusFill(stL1 === "empty" ? "empty" : stL1, "col")}
                    stroke={c === STAIR_COL ? "var(--color-fg)" : "var(--color-border-strong)"}
                    strokeWidth={c === STAIR_COL ? 1.5 : 1}
                    opacity={stL1 === "empty" ? 0.35 : 1}
                  />
                  <rect
                    x={colX(c) - 5}
                    y={ELEV_TOP}
                    width={10}
                    height={STORY_H}
                    rx={2}
                    fill={statusFill(stL2 === "empty" ? "empty" : stL2, "col")}
                    stroke={c === STAIR_COL ? "var(--color-fg)" : "var(--color-border-strong)"}
                    strokeWidth={c === STAIR_COL ? 1.5 : 1}
                    opacity={stL2 === "empty" ? 0.25 : 1}
                  />
                  <rect
                    x={colX(c) - 7}
                    y={baseY - 1}
                    width={14}
                    height={4}
                    rx={1}
                    fill={statusFill("installed", "found")}
                  />
                  <text
                    x={colX(c)}
                    y={ELEV_H - 6}
                    textAnchor="middle"
                    fill={c === STAIR_COL ? "var(--color-fg)" : "var(--color-faint)"}
                    fontSize={9}
                    fontWeight={c === STAIR_COL ? 700 : 400}
                    fontFamily="var(--font-mono)"
                  >
                    C{c + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

function phaseLabel(phase: string): string {
  const map: Record<string, string> = {
    columns: "fase kolom (M)",
    beams: "fase balok (N)",
    panels: "fase panel (F)",
    stair: "fase tangga L1→L2 (M)",
    closed: "zone closed",
    complete: "selesai",
    idle: "siaga",
  };
  return map[phase] ?? phase;
}

function Legend({
  swatch,
  label,
  border,
}: {
  swatch: string;
  label: string;
  border?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="size-2.5 rounded-sm"
        style={{
          background: swatch,
          border: border ? "1px dashed var(--color-border-strong)" : undefined,
        }}
      />
      {label}
    </span>
  );
}
