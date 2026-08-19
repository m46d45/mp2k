import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMp2k } from "@/lib/mp2k/store";
import { formatNum, formatPct } from "@/lib/mp2k/ops-science";

const C_M = "#2563eb";
const C_N = "#f97316";
const C_F = "#0f766e";
const C_WIP = "#7c3aed";
const GRID = "#e5e7eb";
const MUTED = "#6b7280";

/**
 * Fase 2: jejak waktu lab DES di Simulasi (toggle).
 * Data dari store.desTrace — tidak mengubah engine.
 */
export function DesTraceCharts() {
  const [open, setOpen] = useState(false);
  const trace = useMp2k((s) => s.desTrace ?? []);
  const ready = trace.length > 1;

  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-elevated/60"
      >
        <span className="flex flex-wrap items-center gap-2">
          {open ? (
            <ChevronDown className="size-4 text-muted" />
          ) : (
            <ChevronRight className="size-4 text-muted" />
          )}
          <span className="text-sm font-medium text-fg">Jejak waktu</span>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted">
            {ready ? `${trace.length} titik lab` : "setelah Run all"}
          </span>
        </span>
        <span className="text-[10px] text-faint">M · N · F + WIP</span>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
          <p className="rounded-[var(--radius-sm)] border border-dashed border-border bg-elevated px-3 py-2 text-[11px] text-muted leading-relaxed">
            Jejak <strong className="text-fg">run lab</strong> (estimasi produktivitas),{" "}
            <strong className="text-fg">bukan</strong> kalender proyek / deadline owner.
          </p>

          {!ready ? (
            <p className="text-xs text-muted leading-relaxed">
              Jalankan <strong className="text-fg">Run all</strong> dulu agar deret waktu terisi.
            </p>
          ) : (
            <>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
                  Utilization over Time
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  ū instan per moda — kotak sibuk/idle, bukan rata-rata Kingman.
                </p>
                <div className="mt-2 h-[200px] w-full sm:h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trace} margin={{ top: 8, right: 12, left: 0, bottom: 16 }}>
                      <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="t"
                        type="number"
                        tick={{ fill: MUTED, fontSize: 11 }}
                        tickFormatter={(v) => formatNum(v)}
                        label={{
                          value: "t (hari lab)",
                          position: "insideBottom",
                          offset: -6,
                          fill: MUTED,
                          fontSize: 11,
                        }}
                      />
                      <YAxis
                        domain={[0, 1]}
                        tick={{ fill: MUTED, fontSize: 11 }}
                        tickFormatter={(v) => formatPct(v)}
                        width={42}
                      />
                      <Tooltip
                        formatter={(v: number, name: string) => [formatPct(v), name]}
                        labelFormatter={(t: number) => `t ${formatNum(t)} hari`}
                      />
                      <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 11 }} />
                      <Area
                        type="stepAfter"
                        dataKey="utilM"
                        name="M manual"
                        stroke={C_M}
                        fill={C_M}
                        fillOpacity={0.25}
                        strokeWidth={1.5}
                        isAnimationActive={false}
                      />
                      <Area
                        type="stepAfter"
                        dataKey="utilN"
                        name="N near-site"
                        stroke={C_N}
                        fill={C_N}
                        fillOpacity={0.25}
                        strokeWidth={1.5}
                        isAnimationActive={false}
                      />
                      <Area
                        type="stepAfter"
                        dataKey="utilF"
                        name="F far-supply"
                        stroke={C_F}
                        fill={C_F}
                        fillOpacity={0.25}
                        strokeWidth={1.5}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
                  WIP over Time
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Job running di lab — bisa naik lalu stabil; bukan burn-down proyek sampai finish.
                </p>
                <div className="mt-2 h-[180px] w-full sm:h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trace} margin={{ top: 8, right: 12, left: 0, bottom: 16 }}>
                      <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="t"
                        type="number"
                        tick={{ fill: MUTED, fontSize: 11 }}
                        tickFormatter={(v) => formatNum(v)}
                        label={{
                          value: "t (hari lab)",
                          position: "insideBottom",
                          offset: -6,
                          fill: MUTED,
                          fontSize: 11,
                        }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: MUTED, fontSize: 11 }}
                        width={32}
                      />
                      <Tooltip
                        formatter={(v: number) => [formatNum(v), "WIP"]}
                        labelFormatter={(t: number) => `t ${formatNum(t)} hari`}
                      />
                      <Line
                        type="monotone"
                        dataKey="wip"
                        name="WIP"
                        stroke={C_WIP}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <ul className="list-disc space-y-1 pl-4 text-[11px] text-muted leading-relaxed">
                <li>
                  ū rata-rata di Kingman ≠ pola sibuk/idle harian di sini.
                </li>
                <li>
                  WIP lab bisa naik di awal run lalu mendatar — beda dengan sisa pekerjaan proyek yang turun ke nol di tanggal selesai.
                </li>
              </ul>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
