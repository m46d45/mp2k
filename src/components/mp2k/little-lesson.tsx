import { useMemo, useState } from "react";
import {
  INTRO_CURVES,
  LITTLE_SCENARIOS,
  LITTLE_BASE,
  formatNum,
  formatTriple,
  littleLine,
  DEMO_COLORS,
  type LittlePoint,
} from "@/lib/mp2k/intro-lessons";
import {
  LessonShell,
  ScenarioButtons,
  IdentityRow,
  Say,
  InvalidX,
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
} from "recharts";

const GRID = "#e5e7eb";
const MUTED = "#6b7280";
const POINT = DEMO_COLORS.active;
const ORANGE = DEMO_COLORS.operating;

export function LittleLesson({
  seen,
  onSee,
  onNext,
}: {
  seen: string[];
  onSee: (id: string) => void;
  onNext?: () => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const sc = LITTLE_SCENARIOS.find((s) => s.id === active);
  const point: LittlePoint = sc?.apply ?? LITTLE_BASE;
  const broken = sc ? !sc.valid : false;
  const line = useMemo(() => littleLine(point.th), [point.th]);
  const ready = LITTLE_SCENARIOS.every((s) => seen.includes(s.id));
  const showBaseDot =
    !!sc && !broken && (point.wip !== LITTLE_BASE.wip || point.th !== LITTLE_BASE.th || point.ct !== LITTLE_BASE.ct);

  return (
    <LessonShell
      kicker="Little's Law"
      question={INTRO_CURVES[0].question}
      ready={ready}
      formula={
        <>
          <p>WIP = TH × CT</p>
          <p className="text-muted">TH = WIP / CT · CT = WIP / TH — susunan yang sama.</p>
          <p className="text-xs text-muted mt-1">
            WIP di sistem adalah bentuk <span className="text-fg font-medium">inventory buffer</span>.
            Titik acuan (WIP=8, TH=2, CT=4) = best-case di W0.
          </p>
        </>
      }
      reverse="Kalau lawannya: WIP turun (TH tetap) — CT harus turun."
      onNext={onNext}
      nextLabel="Lanjut ke Kingman"
    >
      <ScenarioButtons
        items={LITTLE_SCENARIOS.map((s) => ({ id: s.id, label: s.label }))}
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
          <span className="font-mono text-fg">{formatTriple(point)}</span>
        </Say>
      ) : (
        <p className="text-sm text-muted">
          Acuan: <span className="font-mono text-fg">{formatTriple(LITTLE_BASE)}</span>. Pilih satu if-then.
        </p>
      )}

      <IdentityRow items={[["WIP", point.wip], ["TH", point.th], ["CT", point.ct]]} />

      <div className="h-[260px] w-full sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={line} margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="wip"
              type="number"
              domain={[0, 20]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "WIP", position: "insideBottom", offset: -8, fill: MUTED, fontSize: 12 }}
            />
            <YAxis
              domain={[0, 12]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "CT", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 11 }}
            />
            <Tooltip
              formatter={(v: number) => [formatNum(v), "CT"]}
              labelFormatter={(w: number) => `WIP ${formatNum(w)}`}
            />
            <Line type="monotone" dataKey="ct" name="CT" stroke="#2563eb" strokeWidth={2.25} dot={false} isAnimationActive={false} />
            {showBaseDot ? (
              <ReferenceDot
                x={LITTLE_BASE.wip}
                y={LITTLE_BASE.ct}
                r={6}
                fill={DEMO_COLORS.baseFill}
                stroke={ORANGE}
                strokeWidth={2}
              />
            ) : null}
            {broken ? (
              <ReferenceDot x={point.wip} y={point.ct} r={8} shape={<InvalidX size={9} />} />
            ) : (
              <ReferenceDot
                x={point.wip}
                y={point.ct}
                r={7}
                fill={ORANGE}
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted">
        Titik <strong style={{ color: ORANGE }}>oranye</strong> = operating point (sama di chip sistem).
        Hollow oranye = acuan sebelum if-then.
      </p>
    </LessonShell>
  );
}
