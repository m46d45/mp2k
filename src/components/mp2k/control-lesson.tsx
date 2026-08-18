import { useMemo, useState, type ReactNode } from "react";
import {
  INTRO_CURVES,
  CONTROL_SCENARIOS,
  CONTROL_DEMO,
  controlChart,
  formatNum,
} from "@/lib/mp2k/intro-lessons";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
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
const POINT = "#141414";

function LessonShell({
  kicker,
  question,
  children,
  formula,
  reverse,
}: {
  kicker: string;
  question: string;
  children: ReactNode;
  formula: ReactNode;
  reverse: string;
}) {
  return (
    <div className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-faint">{kicker}</p>
        <h3 className="mt-1 text-lg font-semibold tracking-tight">{question}</h3>
      </div>
      <div className="space-y-2 rounded-[var(--radius-sm)] border border-border bg-elevated px-4 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">Rumus</p>
        <div className="font-mono text-sm text-fg leading-relaxed">{formula}</div>
        <p className="text-sm text-muted">{reverse}</p>
      </div>
      {children}
    </div>
  );
}

function ScenarioButtons({
  items,
  active,
  seen,
  onPick,
}: {
  items: { id: string; label: string }[];
  active: string | null;
  seen: string[];
  onPick: (id: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {items.map((s) => {
        const on = active === s.id;
        const was = seen.includes(s.id);
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(s.id)}
            className={cn(
              "flex min-h-12 items-center justify-center rounded-[var(--radius-sm)] border px-3 text-center text-sm font-medium leading-snug",
              on ? "border-fg bg-primary text-primary-fg" : "border-border bg-elevated text-fg hover:bg-subtle",
            )}
          >
            {was && !on ? <Check className="mr-1.5 size-3.5 shrink-0 text-muted" strokeWidth={2} /> : null}
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

function IdentityRow({ items }: { items: [string, number][] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{k}</p>
          <p className="font-mono text-xl font-semibold tabular-nums text-fg">{formatNum(v)}</p>
        </div>
      ))}
    </div>
  );
}

function Say({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2.5 text-sm leading-relaxed text-fg">
      {children}
    </p>
  );
}

export function ControlLesson({ seen, onSee }: { seen: string[]; onSee: (id: string) => void }) {
  const [active, setActive] = useState<string | null>(null);
  const sc = CONTROL_SCENARIOS.find((s) => s.id === active);
  const conwip = sc?.apply.conwip ?? CONTROL_DEMO.conwipBase;

  const chart = useMemo(() => controlChart(conwip), [conwip]);
  const baseChart = useMemo(() => controlChart(CONTROL_DEMO.conwipBase), []);
  const { meta, series } = chart;
  const showBase = !!sc && sc.apply.conwip !== CONTROL_DEMO.conwipBase;

  const thAtCap = conwip <= meta.W_min ? conwip / meta.T0 : meta.TH_max;
  const ctAtCap = conwip <= 1e-9 ? meta.T0 : conwip / Math.max(thAtCap, 1e-9);

  return (
    <LessonShell
      kicker="Control & CONWIP"
      question={INTRO_CURVES[3].question}
      formula={
        <div className="space-y-3">
          <p className="text-xs text-muted leading-relaxed">
            <strong className="text-fg">Control</strong> (tunggal) = pengarahan perilaku sistem ke masa depan —
            bagaimana kerja <em>dirilis</em> dan <em>dibatasi</em>.
            Bukan sekadar <em>controls</em> (laporan masa lalu).
          </p>
          <p className="text-xs text-muted leading-relaxed">
            <strong className="text-fg">Push</strong> merilis menurut jadwal luar (kontrol rate, amati WIP).{" "}
            <strong className="text-fg">Pull</strong> mengotorisasi rilis menurut status sistem (kontrol WIP, amati TH).
            <strong className="text-fg"> CONWIP</strong> = batas total WIP: job baru masuk hanya bila ada slot kosong.
          </p>
          <p className="font-mono text-base">
            <span className="font-semibold">W0</span> = rb x T0
          </p>
          <p className="text-xs text-muted leading-relaxed">
            Critical WIP = WIP terkecil agar TH penuh dan CT minimal <em>tanpa variabilitas</em>.
            Dengan variabilitas: Wopt ≈ W0 (1 + √V). Level <strong className="text-fg">CONWIP</strong> yang
            Anda pilih = mekanisme Control.
          </p>
          <div className="grid gap-2 text-xs sm:grid-cols-3 font-mono">
            <div className="rounded border border-border/60 bg-surface px-2.5 py-1.5 text-center">
              <p className="text-faint text-[11px]">W0</p>
              <p className="font-semibold text-fg text-base">{formatNum(meta.W_min)}</p>
            </div>
            <div className="rounded border border-border/60 bg-surface px-2.5 py-1.5 text-center">
              <p className="text-faint text-[11px]">Wopt</p>
              <p className="font-semibold text-fg text-base">{formatNum(meta.W_opt)}</p>
            </div>
            <div className="rounded border border-border/60 bg-surface px-2.5 py-1.5 text-center">
              <p className="text-faint text-[11px]">T0 · rb</p>
              <p className="font-semibold text-fg text-base">
                {formatNum(meta.T0)} · {formatNum(meta.TH_max)}
              </p>
            </div>
          </div>
        </div>
      }
      reverse="Kalau lawannya: CONWIP terlalu rendah → TH lapar; terlalu tinggi → CT membengkak tanpa TH ekstra."
    >
      <ScenarioButtons
        items={CONTROL_SCENARIOS.map((s) => ({ id: s.id, label: s.label }))}
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
          <span className="font-mono text-fg">
            CONWIP = {formatNum(conwip)} · W0 = {formatNum(meta.W_min)} · Wopt ≈ {formatNum(meta.W_opt)}
          </span>
        </Say>
      ) : (
        <p className="text-sm text-muted">
          Acuan: CONWIP = {formatNum(CONTROL_DEMO.conwipBase)} dekat Wopt. Pilih satu if-then.
        </p>
      )}

      <IdentityRow items={[["CONWIP", conwip], ["TH≈", thAtCap], ["CT≈", ctAtCap]]} />

      <div className="h-[300px] w-full sm:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series} margin={{ top: 12, right: 48, left: 4, bottom: 20 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
            <XAxis
              dataKey="wip"
              type="number"
              domain={[0, Math.ceil(meta.wipMax)]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "WIP", position: "insideBottom", offset: -8, fill: MUTED, fontSize: 12 }}
            />
            <YAxis
              yAxisId="th"
              domain={[0, Math.ceil(meta.TH_max * 1.15 * 10) / 10]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "TH", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 11 }}
            />
            <YAxis
              yAxisId="ct"
              orientation="right"
              domain={[0, "auto"]}
              tick={{ fill: MUTED, fontSize: 11 }}
              label={{ value: "CT", angle: 90, position: "insideRight", fill: MUTED, fontSize: 11 }}
            />
            <Tooltip
              formatter={(v: number, name: string) => [formatNum(v), name]}
              labelFormatter={(w: number) => `WIP ${formatNum(w)}`}
            />
            <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="th" type="monotone" dataKey="thBest" name="TH best" stroke="#9ca3af" strokeDasharray="6 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line yAxisId="th" type="monotone" dataKey="thVar" name="TH +var" stroke="#2563eb" strokeWidth={2.25} dot={false} isAnimationActive={false} />
            <Line yAxisId="ct" type="monotone" dataKey="ctBest" name="CT best" stroke="#d1d5db" strokeDasharray="4 3" strokeWidth={1.25} dot={false} isAnimationActive={false} />
            <Line yAxisId="ct" type="monotone" dataKey="ctVar" name="CT +var" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
            <ReferenceLine yAxisId="th" x={meta.W_min} stroke="#64748b" strokeDasharray="4 3" label={{ value: "W0", position: "top", fill: MUTED, fontSize: 11 }} />
            <ReferenceLine yAxisId="th" x={meta.W_opt} stroke="#94a3b8" strokeDasharray="2 2" label={{ value: "Wopt", position: "insideTopRight", fill: MUTED, fontSize: 10 }} />
            <ReferenceLine yAxisId="th" x={conwip} stroke={POINT} strokeWidth={1.5} label={{ value: "CONWIP", position: "insideTopLeft", fill: POINT, fontSize: 11 }} />
            {showBase ? (
              <ReferenceLine yAxisId="th" x={CONTROL_DEMO.conwipBase} stroke="#a3a3a3" strokeDasharray="5 4" />
            ) : null}
            <ReferenceDot
              yAxisId="th"
              x={Math.min(conwip, meta.wipMax)}
              y={Math.min(thAtCap, meta.TH_max)}
              r={7}
              fill={POINT}
              stroke="#fff"
              strokeWidth={2}
            />
            {showBase ? (
              <ReferenceDot
                yAxisId="th"
                x={CONTROL_DEMO.conwipBase}
                y={Math.min(
                  CONTROL_DEMO.conwipBase <= baseChart.meta.W_min
                    ? CONTROL_DEMO.conwipBase / baseChart.meta.T0
                    : baseChart.meta.TH_max,
                  baseChart.meta.TH_max,
                )}
                r={6}
                fill="#fff"
                stroke={POINT}
                strokeWidth={1.75}
              />
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted leading-relaxed">
        Garis vertikal <strong className="text-fg">W0</strong> = critical WIP; <strong className="text-fg">Wopt</strong> =
        zona praktis dengan variabilitas; <strong className="text-fg">CONWIP</strong> = batas yang Anda tetapkan (Control).
      </p>
    </LessonShell>
  );
}
