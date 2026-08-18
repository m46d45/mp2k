import { useMemo, useState } from "react";
import {
  INTRO_CURVES,
  KINGMAN_SCENARIOS,
  KINGMAN_BASE,
  KINGMAN_Y_MAX,
  formatNum,
  formatPct,
  formatKingman,
  kingmanFrom,
  DEMO_COLORS,
  type KingmanPoint,
} from "@/lib/mp2k/intro-lessons";
import {
  LessonShell,
  ScenarioButtons,
  IdentityRow,
  Say,
} from "@/components/mp2k/intro-shared";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  Legend,
} from "recharts";

const GRID = "#e5e7eb";
const MUTED = "#6b7280";
const ORANGE = DEMO_COLORS.operating;

export function KingmanLesson({
  seen,
  onSee,
  onNext,
}: {
  seen: string[];
  onSee: (id: string) => void;
  onNext?: () => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const sc = KINGMAN_SCENARIOS.find((s) => s.id === active);
  const point: KingmanPoint = sc?.apply ?? KINGMAN_BASE;
  const derived = kingmanFrom(point);
  const ready = KINGMAN_SCENARIOS.every((s) => seen.includes(s.id));

  const series = useMemo(() => {
    const out: { u: number; r0: number; r05: number; r1: number }[] = [];
    for (let i = 0; i <= 40; i++) {
      const u = 0.3 + (0.65 * i) / 40;
      out.push({
        u,
        r0: 1,
        r05: Math.min(KINGMAN_Y_MAX, kingmanFrom({ u, v: 0.5 }).ratio),
        r1: Math.min(KINGMAN_Y_MAX, kingmanFrom({ u, v: 1 }).ratio),
      });
    }
    return out;
  }, []);

  const showBase = !!sc && (point.u !== KINGMAN_BASE.u || point.v !== KINGMAN_BASE.v);

  return (
    <LessonShell
      kicker="Kingman's Equation"
      question={INTRO_CURVES[1].question}
      ready={ready}
      formula={
        <>
          <p>CT ≈ te × (1 + ((ca²+ce²)/2) × (u/(1−u)))</p>
          <p className="text-xs text-muted mt-1">
            Base ajar ū=0,80 · V=0,5 pada bottleneck rb=2 (sistem demo yang sama).
          </p>
        </>
      }
      reverse="Kalau lawannya: u turun atau V turun — CT/te mendekati 1."
      onNext={onNext}
      nextLabel="Lanjut ke Inventory"
    >
      <ScenarioButtons
        items={KINGMAN_SCENARIOS.map((s) => ({ id: s.id, label: s.label }))}
        active={active}
        seen={seen}
        onPick={(id) => {
          setActive(id);
          onSee(id);
        }}
      />
      {sc ? (
        <Say>
          {sc.say}{" "}
          <span className="font-mono text-fg">{formatKingman(point)}</span>
        </Say>
      ) : (
        <p className="text-sm text-muted">
          Acuan: <span className="font-mono text-fg">{formatKingman(KINGMAN_BASE)}</span>. Pilih satu if-then.
        </p>
      )}
      <IdentityRow
        items={[
          ["ū", formatPct(point.u)],
          ["V", formatNum(point.v)],
          ["CT/te", formatNum(derived.ratio)],
        ]}
      />
      <div className="h-[280px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="u"
              type="number"
              domain={[0.3, 0.95]}
              tick={{ fill: MUTED, fontSize: 11 }}
              tickFormatter={(v) => formatPct(v)}
              label={{ value: "ū", position: "insideBottom", offset: -8, fill: MUTED, fontSize: 12 }}
            />
            <YAxis
              domain={[0, KINGMAN_Y_MAX]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "CT/te", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 11 }}
            />
            <Tooltip
              formatter={(v: number, name: string) => [formatNum(v), name]}
              labelFormatter={(u: number) => `ū ${formatPct(u)}`}
            />
            <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="r0" name="V=0" stroke="#9ca3af" strokeDasharray="4 3" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="r05" name="V=0,5" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="r1" name="V=1" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
            {showBase ? (
              <ReferenceDot
                x={KINGMAN_BASE.u}
                y={Math.min(KINGMAN_Y_MAX, kingmanFrom(KINGMAN_BASE).ratio)}
                r={6}
                fill={DEMO_COLORS.baseFill}
                stroke={ORANGE}
                strokeWidth={2}
              />
            ) : null}
            <ReferenceDot
              x={point.u}
              y={Math.min(KINGMAN_Y_MAX, derived.ratio)}
              r={7}
              fill={ORANGE}
              stroke="#fff"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted">
        Titik <strong style={{ color: ORANGE }}>oranye</strong> = operating point.
      </p>
    </LessonShell>
  );
}
