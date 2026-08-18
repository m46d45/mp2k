import { useMemo, useState } from "react";
import {
  DEMO_SYSTEM,
  DEMO_COLORS,
  CONTROL_DEMO,
  CONTROL_SCENARIOS,
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
  ReferenceLine,
  ReferenceDot,
  Legend,
} from "recharts";

const GRID = "#e5e7eb";
const MUTED = "#6b7280";
const ORANGE = DEMO_COLORS.operating;

/**
 * CONWIP pada kasus Gedung — pilih batas WIP dari kurva operating.
 */
export function CaseConwipPanel() {
  const [active, setActive] = useState<string | null>("C2");
  const sc = CONTROL_SCENARIOS.find((s) => s.id === active);
  const conwip = sc?.apply.conwip ?? CONTROL_DEMO.conwipBase;

  const chart = useMemo(() => controlChart(conwip), [conwip]);
  const { meta, series } = chart;
  const thAt = conwip <= meta.W_min ? conwip / meta.T0 : meta.TH_max;
  const ctAt = conwip <= 1e-9 ? meta.T0 : conwip / Math.max(thAt, 1e-9);

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wider text-faint">Control · CONWIP</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Berapa WIP yang boleh hidup di Gedung?</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          <strong className="text-fg">CONWIP</strong> membatasi total pekerjaan dalam sistem: job baru masuk
          hanya bila ada slot kosong. Level yang baik dekat <strong className="text-fg">Wopt≈{DEMO_SYSTEM.Wopt}</strong>{" "}
          (bukan jauh di bawah W0, bukan jauh di atas). Angka ini bisa dipakai sebagai batas inventory di Simulasi.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {CONTROL_SCENARIOS.map((s) => {
          const on = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              className={cn(
                "flex min-h-12 items-center justify-center rounded-[var(--radius-sm)] border px-3 text-center text-sm font-medium leading-snug",
                on ? "border-fg bg-primary text-primary-fg" : "border-border bg-elevated text-fg hover:bg-subtle",
              )}
            >
              {on ? <Check className="mr-1.5 size-3.5 shrink-0" strokeWidth={2} /> : null}
              {s.label}
            </button>
          );
        })}
      </div>

      {sc ? (
        <p className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2.5 text-sm leading-relaxed text-fg">
          {sc.say}{" "}
          <span className="font-mono text-fg">
            CONWIP={formatNum(conwip)} · W0={formatNum(meta.W_min)} · Wopt≈{formatNum(meta.W_opt)}
          </span>
        </p>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        {([
          ["CONWIP", conwip],
          ["TH≈", thAt],
          ["CT≈", ctAt],
        ] as [string, number][]).map(([k, v]) => (
          <div key={k} className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{k}</p>
            <p className="font-mono text-xl font-semibold tabular-nums text-fg">{formatNum(v)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
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
              <ReferenceLine yAxisId="th" x={meta.W_min} stroke={DEMO_COLORS.W0} strokeDasharray="4 3" label={{ value: "W0", position: "top", fill: DEMO_COLORS.W0, fontSize: 11 }} />
              <ReferenceLine yAxisId="th" x={meta.W_opt} stroke={DEMO_COLORS.Wopt} strokeDasharray="2 2" label={{ value: "Wopt", position: "insideTopRight", fill: DEMO_COLORS.Wopt, fontSize: 10 }} />
              <ReferenceLine yAxisId="th" x={conwip} stroke={ORANGE} strokeWidth={2} label={{ value: "CONWIP", position: "insideTopLeft", fill: ORANGE, fontSize: 11 }} />
              <ReferenceDot yAxisId="th" x={Math.min(conwip, meta.wipMax)} y={Math.min(thAt, meta.TH_max)} r={7} fill={ORANGE} stroke="#fff" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-muted leading-relaxed">
          Garis <strong style={{ color: ORANGE }}>oranye</strong> = CONWIP yang Anda pilih.
          Coba C1 (di bawah W0), C2 (≈Wopt), dan C3 (berlebih) — lihat TH dan CT berubah.
        </p>
      </div>
    </div>
  );
}
