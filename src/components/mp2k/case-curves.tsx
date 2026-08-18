import { useMemo } from "react";
import {
  DEMO_SYSTEM,
  DEMO_COLORS,
  CONTROL_DEMO,
  controlChart,
  formatNum,
} from "@/lib/mp2k/intro-lessons";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  Legend,
} from "recharts";
import { ArrowRight } from "lucide-react";

const GRID = "#e5e7eb";
const MUTED = "#6b7280";
const ORANGE = DEMO_COLORS.operating;

type Props = { onNext: () => void };

/**
 * Kurva gabungan WIP–TH–CT untuk kasus Gedung.
 * Angka sama dengan sistem demo Pengenalan (W0=8, Wopt≈14).
 */
export function CaseCurvesPanel({ onNext }: Props) {
  const chart = useMemo(() => controlChart(CONTROL_DEMO.conwipBase), []);
  const { meta, series } = chart;
  const conwip = CONTROL_DEMO.conwipBase;
  const thAt = conwip <= meta.W_min ? conwip / meta.T0 : meta.TH_max;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">Kurva gabungan</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Operating curve WIP–TH–CT</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Di kasus Gedung, tiga angka aliran digabung satu grafik: sumbu X = WIP, sumbu Y kiri = TH,
            sumbu Y kanan = CT. Garis putus = best-case (tanpa V); garis penuh = dengan variabilitas.
            <strong className="text-fg"> W0={DEMO_SYSTEM.W0}</strong> dan{" "}
            <strong className="text-fg">Wopt≈{DEMO_SYSTEM.Wopt}</strong> sama dengan Pengenalan.
          </p>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-sm font-medium text-fg hover:bg-elevated"
        >
          Lanjut ke CONWIP
          <ArrowRight className="size-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <InfoCard k="W0" v={formatNum(meta.W_min)} note="Critical WIP = rb × T0" />
        <InfoCard k="Wopt" v={formatNum(meta.W_opt)} note="≈ W0 (1 + √V)" />
        <InfoCard k="T0 · rb" v={`${formatNum(meta.T0)} · ${formatNum(meta.TH_max)}`} note="Raw process · bottleneck" />
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <div className="h-[300px] w-full sm:h-[360px]">
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
              <ReferenceLine yAxisId="th" x={meta.W_min} stroke={DEMO_COLORS.W0} strokeDasharray="4 3" label={{ value: "W0", position: "top", fill: DEMO_COLORS.W0, fontSize: 11 }} />
              <ReferenceLine yAxisId="th" x={meta.W_opt} stroke={DEMO_COLORS.Wopt} strokeDasharray="2 2" label={{ value: "Wopt", position: "insideTopRight", fill: DEMO_COLORS.Wopt, fontSize: 10 }} />
              <ReferenceLine yAxisId="th" x={conwip} stroke={ORANGE} strokeWidth={2} label={{ value: "CONWIP≈Wopt", position: "insideTopLeft", fill: ORANGE, fontSize: 11 }} />
              <ReferenceDot yAxisId="th" x={conwip} y={Math.min(thAt, meta.TH_max)} r={7} fill={ORANGE} stroke="#fff" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-muted leading-relaxed">
          Zona kiri W0: sistem lapar (TH naik jika WIP ditambah). Zona sekitar Wopt: seimbang.
          Kanan jauh: TH hampir datar, CT membengkak — inventory berlebih tanpa output ekstra.
        </p>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-medium text-primary-fg sm:w-auto"
      >
        Lanjut: pilih level CONWIP
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

function InfoCard({ k, v, note }: { k: string; v: string; note: string }) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{k}</p>
      <p className="font-mono text-xl font-semibold tabular-nums text-fg">{v}</p>
      <p className="text-xs text-muted">{note}</p>
    </div>
  );
}
