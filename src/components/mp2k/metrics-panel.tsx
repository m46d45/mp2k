import { useMp2k } from "@/lib/mp2k/store";
import { TOTALS } from "@/lib/mp2k/model";
import { cn } from "@/lib/utils";
import { formatNum, formatPct } from "@/lib/mp2k/ops-science";

export function MetricsPanel() {
  const metrics = useMp2k((s) => s.metrics);
  const des = useMp2k((s) => s.desMetrics);
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
        <p className="mt-3 text-[11px] text-muted leading-relaxed">
          Bandingkan TH/CT/WIP ke kurva Little · utilisasi+CT ke Kingman · FR ke Inventory di langkah{" "}
          <strong className="text-fg">Analitik</strong>.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-faint">Match score</p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-fg">
            {metrics.matchScore}
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-border bg-surface p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-faint">Tangga L1→L2</p>
          <p className="mt-1 font-mono text-lg font-semibold text-fg">
            {metrics.stairInstalled ? "OK" : metrics.c3Ready ? "C3 siap" : "menunggu C3"}
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
