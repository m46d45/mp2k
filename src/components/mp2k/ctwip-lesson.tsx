import { useMemo, useState } from "react";
import {
  INTRO_CURVES,
  CTWIP_SCENARIOS,
  CTWIP_BASE,
  DEMO_SYSTEM,
  DEMO_COLORS,
  formatNum,
  formatCtwip,
  ctwipChart,
  ctwipBestAt,
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
  ReferenceLine,
  Legend,
} from "recharts";

const GRID = "#e5e7eb";
const MUTED = "#6b7280";
const ORANGE = DEMO_COLORS.operating;

function ctAtWip(
  series: { wip: number; ctBest: number; ctVar: number }[],
  wip: number,
): { ctBest: number; ctVar: number } {
  if (!series.length) return { ctBest: ctwipBestAt(wip), ctVar: ctwipBestAt(wip) };
  let best = series[0];
  let dMin = Math.abs(series[0].wip - wip);
  for (const p of series) {
    const d = Math.abs(p.wip - wip);
    if (d < dMin) {
      dMin = d;
      best = p;
    }
  }
  return { ctBest: best.ctBest, ctVar: best.ctVar };
}

export function CtwipLesson({
  seen,
  onSee,
  onNext,
}: {
  seen: string[];
  onSee: (id: string) => void;
  onNext?: () => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const sc = CTWIP_SCENARIOS.find((s) => s.id === active);
  const wip = sc?.apply.wip ?? CTWIP_BASE.wip;
  const ready = CTWIP_SCENARIOS.every((s) => seen.includes(s.id));

  const chart = useMemo(() => ctwipChart(), []);
  const { series, meta } = chart;
  const at = useMemo(() => ctAtWip(series, wip), [series, wip]);
  const baseAt = useMemo(() => ctAtWip(series, CTWIP_BASE.wip), [series]);

  const showBase = !!sc && Math.abs(wip - CTWIP_BASE.wip) > 0.5;
  const yMax = Math.max(
    12,
    ...series.map((p) => Math.max(p.ctBest, p.ctVar)),
    at.ctVar * 1.1,
  );

  const ctwipMeta = INTRO_CURVES.find((c) => c.id === "ctwip");

  return (
    <LessonShell
      kicker="CT vs WIP · kurva ketiga PPI"
      question={ctwipMeta?.question ?? "Bagaimana CT berubah saat WIP naik?"}
      ready={ready}
      formula={
        <>
          <p className="text-xs text-muted mb-1">Best-case (tanpa variabilitas):</p>
          <p>
            CT = T0 &nbsp;jika WIP ≤ W0
            <br />
            CT = WIP / rb &nbsp;jika WIP &gt; W0
          </p>
          <p className="mt-2 text-xs text-muted">Dengan variabilitas (V &gt; 0):</p>
          <p>CT naik lebih cepat — kurva di atas best-case.</p>
          <p className="text-xs text-muted mt-2">
            Sistem demo: T0={DEMO_SYSTEM.T0} · rb={DEMO_SYSTEM.rb} · W0={DEMO_SYSTEM.W0} ·
            Wopt≈{DEMO_SYSTEM.Wopt} · V={formatNum(DEMO_SYSTEM.V)}
          </p>
        </>
      }
      reverse="Kalau lawannya: turunkan WIP (CONWIP) mendekati Wopt — CT turun, TH tetap dekat rb."
      onNext={onNext}
      nextLabel="Lanjut ke Inventory & Fill Rate"
    >
      <ScenarioButtons
        items={CTWIP_SCENARIOS.map((s) => ({ id: s.id, label: s.label }))}
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
          <span className="font-mono text-fg">{formatCtwip(wip, at.ctVar)}</span>
        </Say>
      ) : (
        <p className="text-sm text-muted">
          Acuan di W0:{" "}
          <span className="font-mono text-fg">
            {formatCtwip(CTWIP_BASE.wip, baseAt.ctVar)}
          </span>
          . Pilih satu if-then.
        </p>
      )}
      <IdentityRow
        items={[
          ["WIP", formatNum(wip)],
          ["CT best", formatNum(at.ctBest)],
          ["CT +var", formatNum(at.ctVar)],
        ]}
      />
      <div className="h-[280px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 12, right: 16, left: 4, bottom: 20 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="wip"
              type="number"
              domain={[0, meta.wipMax]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{
                value: "WIP",
                position: "insideBottom",
                offset: -8,
                fill: MUTED,
                fontSize: 12,
              }}
            />
            <YAxis
              domain={[0, Math.ceil(yMax)]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{
                value: "CT",
                angle: -90,
                position: "insideLeft",
                fill: MUTED,
                fontSize: 11,
              }}
            />
            <Tooltip
              formatter={(v: number, name: string) => [formatNum(v), name]}
              labelFormatter={(w: number) => `WIP ${formatNum(w)}`}
            />
            <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine
              x={meta.W_min}
              stroke={DEMO_COLORS.W0}
              strokeWidth={1.5}
              label={{ value: "W0", position: "top", fill: DEMO_COLORS.W0, fontSize: 11 }}
            />
            <ReferenceLine
              x={meta.W_opt}
              stroke={DEMO_COLORS.Wopt}
              strokeDasharray="4 3"
              label={{ value: "Wopt", position: "insideTopRight", fill: DEMO_COLORS.Wopt, fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey="ctBest"
              name="CT best"
              stroke="#9ca3af"
              strokeDasharray="4 3"
              strokeWidth={1.75}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="ctVar"
              name="CT +var"
              stroke="#2563eb"
              strokeWidth={2.25}
              dot={false}
              isAnimationActive={false}
            />
            {showBase ? (
              <ReferenceDot
                x={CTWIP_BASE.wip}
                y={baseAt.ctVar}
                r={6}
                fill={DEMO_COLORS.baseFill}
                stroke={ORANGE}
                strokeWidth={2}
              />
            ) : null}
            <ReferenceDot
              x={wip}
              y={at.ctVar}
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
        Lingkaran kosong = acuan di W0. Kurva abu-abu putus-putus = best-case; biru = +variabilitas.
      </p>
    </LessonShell>
  );
}
