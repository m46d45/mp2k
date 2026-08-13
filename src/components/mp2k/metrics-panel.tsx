import { useMp2k } from "@/lib/mp2k/store";
import { TOTALS } from "@/lib/mp2k/model";
import { cn } from "@/lib/utils";
import { formatNum, formatPct } from "@/lib/mp2k/ops-science";
import { compareDesToTheory } from "@/lib/mp2k/des/compare";

export function MetricsPanel() {
  const metrics = useMp2k((s) => s.metrics);
  const des = useMp2k((s) => s.desMetrics);
  const desParams = useMp2k((s) => s.desParams);
  const desComplete = useMp2k((s) => s.desComplete);
  const panelBuffer = useMp2k((s) => s.panelBuffer);
  const panelInTransit = useMp2k((s) => s.panelInTransit);
  const simTime = useMp2k((s) => s.simTime);

  const rows = [
    {
      label: "Kolom (story)",
      value: metrics.columnsInstalled,
      total: TOTALS.columns * 2,
    },
    {
      label: "Balok",
      value: metrics.beamsInstalled,
      total: TOTALS.beams,
    },
    {
      label: "Panel",
      value: metrics.panelsInstalled,
      total: TOTALS.panels,
    },
    {
      label: "Zone closed",
      value: metrics.zonesClosed,
      total: TOTALS.zones,
    },
  ];

  const compare =
    des && des.completed > 0 && des.simTime > 0
      ? compareDesToTheory(desParams, des)
      : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {rows.map((r) => {
          const pct = r.total ? Math.round((r.value / r.total) * 100) : 0;
          return (
            <div
              key={r.label}
              className="rounded-[var(--radius-md)] border border-border bg-elevated p-3"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{r.label}</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-fg">
                {r.value}
                <span className="text-sm font-normal text-muted">/{r.total}</span>
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-subtle">
                <div
                  className={cn("h-full rounded-full bg-fg/70 transition-[width] duration-300")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* DES ops-science empirics */}
      <div className="rounded-[var(--radius-md)] border border-border bg-surface p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
          Hasil DES · 3 tuas (empiris)
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Sim time T" value={`${formatNum(simTime)} hari`} />
          <Stat label="TH empiris" value={des ? formatNum(des.th) : "—"} hint="job/hari" />
          <Stat label="CT rata-rata" value={des ? formatNum(des.avgCt) : "—"} hint="hari" />
          <Stat label="WIP rata-rata" value={des ? formatNum(des.avgWip) : "—"} hint="Little" />
          <Stat label="WIP now" value={des ? String(des.wip) : "—"} />
          <Stat
            label="Fill rate panel"
            value={des ? formatPct(des.fillRate) : "—"}
            hint="Inventory"
          />
          <Stat label="u kolom" value={des ? formatPct(des.utilColumn) : "—"} hint="Capacity" />
          <Stat label="u balok" value={des ? formatPct(des.utilBeam) : "—"} />
          <Stat label="u panel" value={des ? formatPct(des.utilPanel) : "—"} />
          <Stat label="Buffer panel" value={String(panelBuffer)} />
          <Stat label="In-transit F" value={String(panelInTransit)} />
          <Stat label="Stockout" value={des ? String(des.panelStockouts) : "—"} />
        </div>
      </div>

      {/* Priority 3: DES vs theory */}
      <div className="rounded-[var(--radius-md)] border border-fg/20 bg-elevated/50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-faint">
            Banding DES ↔ teori
          </p>
          {desComplete ? (
            <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-muted">
              run selesai
            </span>
          ) : (
            <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] text-faint">
              jalankan Run all
            </span>
          )}
        </div>

        {compare ? (
          <>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-faint">
                    <th className="py-1.5 pr-2 font-medium">Hukum</th>
                    <th className="py-1.5 pr-2 font-medium">Metrik</th>
                    <th className="py-1.5 pr-2 font-medium">DES</th>
                    <th className="py-1.5 pr-2 font-medium">Teori</th>
                    <th className="py-1.5 font-medium">Δ</th>
                  </tr>
                </thead>
                <tbody className="font-mono tabular-nums text-fg">
                  {compare.rows.map((r) => (
                    <tr key={r.id} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-2 font-sans text-muted">{r.law}</td>
                      <td className="py-2 pr-2 font-sans">{r.metric}</td>
                      <td className="py-2 pr-2 font-semibold">{r.empiric}</td>
                      <td className="py-2 pr-2">{r.theory}</td>
                      <td className="py-2">{r.delta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-3 space-y-1.5 text-[11px] text-muted leading-relaxed">
              {compare.rows.map((r) => (
                <li key={`${r.id}-note`}>
                  <span className="font-medium text-fg">{r.law}:</span> {r.note}
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-xs text-fg leading-relaxed">
              {compare.summary}
            </p>
            <p className="mt-2 text-[11px] text-faint leading-relaxed">
              Detail kurva & asumsi → langkah <strong className="text-muted">Analitik</strong>. Prediksi
              di sini adalah pendekatan ajar (bottleneck + base-stock), bukan digital twin.
            </p>
          </>
        ) : (
          <p className="mt-3 text-xs text-muted leading-relaxed">
            Setelah <strong className="text-fg">Run all</strong>, tabel ini menampilkan WIP (Little),
            CT bottleneck (Kingman), dan fill rate panel (Inventory) — empiris vs prediksi singkat.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-faint">Tangga L1→L2</p>
          <p className="mt-1 font-mono text-lg font-semibold text-fg">
            {metrics.stairInstalled ? "OK" : metrics.c3Ready ? "C3 siap" : "menunggu C3"}
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border/60 bg-elevated/30 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-faint">
            Indikator visual (bukan OS)
          </p>
          <p className="mt-1 font-mono text-sm tabular-nums text-muted">
            match {metrics.matchScore}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-faint">{label}</p>
      <p className="font-mono text-sm font-semibold tabular-nums text-fg">{value}</p>
      {hint ? <p className="text-[10px] text-faint">{hint}</p> : null}
    </div>
  );
}
