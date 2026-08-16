import { useEffect, useState } from "react";
import { fetchStats, type Mp2kStats } from "@/lib/mp2k/stats-client";
import { Users, PlayCircle, RefreshCw, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function kindLabel(kind: string, how: string | null): string {
  if (kind === "visit") return how === "first" ? "Kunjungan pertama" : "Kunjungan";
  if (how === "play") return "Simulasi (jalankan)";
  if (how === "step") return "Simulasi (step)";
  return "Simulasi (run all)";
}

export function StatsTracker() {
  useEffect(() => {
    void trackSafe();
  }, []);
  return null;
}

async function trackSafe() {
  const { trackVisit } = await import("@/lib/mp2k/stats-client");
  await trackVisit();
}

export function StatsPanel() {
  const [stats, setStats] = useState<Mp2kStats | null>(null);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const next = await fetchStats();
    setStats(next);
    setErr(!next);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const maxBar = Math.max(1, ...(stats?.daily ?? []).flatMap((d) => [d.visits, d.sims]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">Statistik</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Pengunjung dan simulasi</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Angka agregat, tanpa nama. Setiap peramban mendapat identitas acak di perangkatnya.
            Kunjungan dihitung ulang setelah 30 menit tidak aktif. Simulasi dihitung saat DES
            selesai (Run all atau jalankan sampai akhir). Pencatatan dimulai ulang — data uji
            sebelumnya sudah dihapus.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-sm font-medium text-fg hover:bg-elevated"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} strokeWidth={1.75} />
          Muat ulang
        </button>
      </div>

      {err ? (
        <p className="rounded-[var(--radius-md)] border border-border bg-elevated px-4 py-3 text-sm text-muted">
          Statistik belum bisa dimuat. Coba muat ulang.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Pengunjung"
          value={stats?.visitors}
          hint={`${stats?.visitorsToday ?? "—"} aktif hari ini`}
        />
        <StatCard
          icon={CalendarDays}
          label="Kunjungan"
          value={stats?.visits}
          hint="sesi (≥ 30 menit)"
        />
        <StatCard
          icon={PlayCircle}
          label="Simulasi"
          value={stats?.simulations}
          hint={`${stats?.simulationsToday ?? "—"} hari ini`}
        />
        <StatCard
          icon={PlayCircle}
          label="Rata-rata / pengunjung"
          value={
            stats && stats.visitors > 0
              ? (stats.simulations / stats.visitors).toFixed(1)
              : "—"
          }
          hint="jumlah simulasi selesai"
        />
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold tracking-tight">14 hari terakhir</h3>
        <p className="mt-1 text-xs text-muted">Batang gelap = kunjungan · batang penuh = simulasi</p>
        <div className="mt-4 grid items-end gap-1.5" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
          {(stats?.daily ?? Array.from({ length: 14 }, () => ({ day: "", visits: 0, sims: 0 }))).map((d, i) => (
            <div key={d.day || i} className="flex flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end justify-center gap-0.5">
                <div
                  className="w-1/2 min-h-0.5 rounded-sm bg-fg/25"
                  style={{ height: `${Math.max(4, (d.visits / maxBar) * 100)}%` }}
                  title={`${d.day} · ${d.visits} kunjungan`}
                />
                <div
                  className="w-1/2 min-h-0.5 rounded-sm bg-fg"
                  style={{ height: `${Math.max(4, (d.sims / maxBar) * 100)}%` }}
                  title={`${d.day} · ${d.sims} simulasi`}
                />
              </div>
              <span className="text-[10px] text-faint">
                {d.day ? d.day.slice(8) : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold tracking-tight">Aktivitas terbaru</h3>
        {!stats?.recent.length ? (
          <p className="mt-3 text-sm text-muted">Belum ada catatan.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {stats.recent.map((e, i) => (
              <li key={`${e.createdAt}-${i}`} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm">
                <span className="text-fg">{kindLabel(e.kind, e.how)}</span>
                <span className="font-mono text-xs text-faint">
                  {e.visitorShort} · {formatWhen(e.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: number | string | undefined;
  hint: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-elevated p-4">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="size-4" strokeWidth={1.75} />
        <p className="text-[11px] font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-fg">
        {value === undefined ? "—" : value}
      </p>
      <p className="mt-1 text-xs text-faint">{hint}</p>
    </div>
  );
}

export function StatsStrip({ onOpen }: { onOpen: () => void }) {
  const [stats, setStats] = useState<Mp2kStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchStats().then((s) => {
      if (!cancelled) setStats(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) {
    return (
      <button type="button" onClick={onOpen} className="text-xs text-faint hover:text-muted">
        Statistik
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-xs text-faint hover:text-muted"
    >
      {stats.visitors} pengunjung · {stats.simulations} simulasi
    </button>
  );
}
