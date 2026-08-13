import { useMp2k } from "@/lib/mp2k/store";
import { buildOperatingPoint, DES_METRIC_COLORS } from "@/lib/mp2k/des/operating-point";
import { formatNum, formatPct } from "@/lib/mp2k/ops-science";
import { cn } from "@/lib/utils";

const BOT_LABEL = { column: "kolom", beam: "balok", panel: "panel" } as const;

/**
 * Shared strip: DES numbers with same notation/colors as Analitik charts.
 * Includes detailed pedagogical explanations of the DES to theory flow.
 */
export function DesOperatingStrip({
  variant = "full",
  className,
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  const des = useMp2k((s) => s.desMetrics);
  const desParams = useMp2k((s) => s.desParams);
  const desComplete = useMp2k((s) => s.desComplete);
  const panelBuffer = useMp2k((s) => s.panelBuffer);
  const op = buildOperatingPoint(desParams, des, desComplete, panelBuffer);

  if (!op.ready) {
    return (
      <div
        className={cn(
          "rounded-[var(--radius-md)] border border-dashed border-border bg-elevated/40 px-4 py-3",
          className,
        )}
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">Titik operasi DES</p>
        <p className="mt-1 text-sm text-muted leading-relaxed">
          Belum ada hasil simulasi. Di langkah <strong className="text-fg">Simulasi</strong>, pilih
          preset lalu <strong className="text-fg">Run all</strong>. Angka TH, CT, WIP, FR, dan ū akan
          muncul di sini dengan notasi yang sama di kurva Analitik.
        </p>
      </div>
    );
  }

  const chips: {
    key: keyof typeof DES_METRIC_COLORS;
    symbol: string;
    value: string;
    unit: string;
    explain: string;
  }[] = [
    {
      key: "th",
      symbol: "TH",
      value: formatNum(op.th),
      unit: "job/hari",
      explain:
        "Throughput empiris = jumlah job selesai dibagi waktu simulasi T. Di kurva Little, TH adalah sumbu kiri. Di Kingman, TH masuk rumus utilisasi: ū = (TH × te) / m.",
    },
    {
      key: "ct",
      symbol: "CT",
      value: formatNum(op.ct),
      unit: "hari",
      explain:
        "Cycle time rata-rata semua job (kolom, balok, panel, stair). Little: CT = WIP / TH. Kingman memprediksi CT di bottleneck saja — CT sistem DES sering berbeda karena merata-ratakan multi-moda.",
    },
    {
      key: "wip",
      symbol: "WIP",
      value: formatNum(op.wip),
      unit: "job",
      explain:
        "Work-in-process rata-rata (integral WIP sepanjang waktu). Little menguji konsistensi: WIP harus mendekati TH × CT. Titik (WIP, TH) dan (WIP, CT) dipetakan ke kurva WIP–TH–CT.",
    },
    {
      key: "fr",
      symbol: "FR",
      value: formatPct(op.fillRate),
      unit: "panel",
      explain:
        "Fill rate panel = 1 − (stockout / percobaan ambil stok). Terkait tuas Inventory: buffer awal, lead time L, dan CONWIP. Di kurva FR vs inventory, FR empiris dibanding model base-stock ideal.",
    },
    {
      key: "util",
      symbol: "ū",
      value: formatPct(op.utilBot),
      unit: `bot. ${BOT_LABEL[op.bottleneck]}`,
      explain:
        "Utilisasi resource tersibuk (bottleneck empiris). Kingman: CT naik tajam saat ū mendekati 1, diperparah V = (ca² + ce²) / 2. Titik operasi di kurva multi-V adalah (ū, CT/te).",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-fg/20 bg-elevated/50 px-4 py-3",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-faint">Titik operasi DES</p>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
          style={{ background: DES_METRIC_COLORS.des }}
        >
          <span className="size-1.5 rounded-full bg-white/90" />
          {op.complete ? "run selesai" : "sebagian"}
        </span>
        <span className="font-mono text-[10px] text-faint">T={formatNum(op.simTime)} hari</span>
        <span className="font-mono text-[10px] text-faint">
          V={formatNum(op.V)} · bot={BOT_LABEL[op.bottleneck]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {chips.map((c) => (
          <div
            key={c.symbol}
            className="rounded-[var(--radius-sm)] border border-border bg-surface px-2.5 py-2"
            style={{ borderTopColor: DES_METRIC_COLORS[c.key], borderTopWidth: 3 }}
          >
            <p
              className="font-mono text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: DES_METRIC_COLORS[c.key] }}
            >
              {c.symbol}
            </p>
            <p className="mt-0.5 font-mono text-base font-semibold tabular-nums text-fg">{c.value}</p>
            <p className="text-[10px] text-faint">{c.unit}</p>
          </div>
        ))}
      </div>

      {variant === "full" ? (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          <p className="text-xs font-medium text-fg">Alur angka: DES → hukum → kurva</p>
          <ol className="list-decimal space-y-2 pl-4 text-xs text-muted leading-relaxed">
            <li>
              <strong className="text-fg">DES</strong> menghasilkan TH, CT, WIP, FR, ū dari event
              (start / end / arrive) pada multi-moda M/N/F dengan CONWIP dan buffer panel.
            </li>
            <li>
              <strong className="text-fg">Little</strong> mengikat tiga metrik: WIP = TH × CT pada
              sistem stabil. Jika selisih besar, cek transient awal atau run belum selesai.
            </li>
            <li>
              <strong className="text-fg">Kingman</strong> memakai ū bottleneck dan V dari ca/ce
              untuk memprediksi CT antrian. Marker oranye di kurva = titik DES, bukan titik parameter
              manual Analitik.
            </li>
            <li>
              <strong className="text-fg">Inventory / FR</strong> membandingkan fill rate empiris
              panel dengan kurva base-stock (L, CV demand, service level). Stockout DES = gejala buffer
              atau lead time ketat.
            </li>
          </ol>

          <p className="text-xs font-medium text-fg">Arti tiap notasi (dari run ini)</p>
          <ul className="space-y-2 text-xs text-muted leading-relaxed">
            {chips.map((c) => (
              <li key={`ex-${c.symbol}`}>
                <span
                  className="font-mono font-semibold"
                  style={{ color: DES_METRIC_COLORS[c.key] }}
                >
                  {c.symbol}
                </span>
                <span className="font-mono text-faint"> = {c.value}</span>
                {" — "}
                {c.explain}
              </li>
            ))}
          </ul>

          <p className="rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2 text-[11px] text-muted leading-relaxed">
            <strong className="text-fg">Catatan ajar:</strong> warna chip di atas sama dengan warna
            garis/marker di kurva Analitik (biru TH, merah CT, ungu WIP, teal FR, oranye = titik DES).
            Selisih DES vs teori wajar: multi-moda, gate tangga, dan fase awal simulasi tidak ada di
            rumus tertutup.
          </p>
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-faint leading-relaxed">
          Warna notasi sama di Analitik. Buka strip lengkap di langkah Analitik untuk penjelasan alur
          DES → Little / Kingman / FR.
        </p>
      )}
    </div>
  );
}

/** Hook-friendly accessor for chart markers */
export function useDesOperatingPoint() {
  const des = useMp2k((s) => s.desMetrics);
  const desParams = useMp2k((s) => s.desParams);
  const desComplete = useMp2k((s) => s.desComplete);
  const panelBuffer = useMp2k((s) => s.panelBuffer);
  return buildOperatingPoint(desParams, des, desComplete, panelBuffer);
}
