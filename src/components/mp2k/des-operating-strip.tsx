import { useMp2k } from "@/lib/mp2k/store";
import { buildOperatingPoint, DES_METRIC_COLORS } from "@/lib/mp2k/des/operating-point";
import { formatNum, formatPct } from "@/lib/mp2k/ops-science";
import { cn } from "@/lib/utils";

const BOT_LABEL = { column: "kolom", beam: "balok", panel: "panel" } as const;

/**
 * Shared strip: DES numbers with same notation/colors as Analitik charts.
 * Includes detailed pedagogical explanations of the DES → theory flow.
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
          preset (Dasar / Variability tinggi / Inventory ketat / Capacity longgar) lalu{" "}
          <strong className="text-fg">Run all</strong>. Angka TH, CT, WIP, FR, dan ū akan muncul di
          sini dengan notasi dan warna yang sama di kurva Analitik.
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
        "Throughput empiris = (jumlah job selesai) / T. Di kurva Little, TH adalah sumbu kiri; titik biru = (WIP, TH) dari parameter Analitik. Di Kingman, TH menentukan utilisasi bottleneck: ū = (TH × te) / m. Naikkan capacity (m) atau turunkan te → TH potensial naik, tetapi CONWIP dan variability membatasi realisasi.",
    },
    {
      key: "ct",
      symbol: "CT",
      value: formatNum(op.ct),
      unit: "hari",
      explain:
        "Cycle time rata-rata semua job (kolom + balok + panel + tangga). Little: CT = WIP / TH. Kingman memprediksi hanya CT di resource bottleneck (CT/te = 1 + V·ū/(1−ū)). CT sistem DES sering berbeda dari prediksi Kingman karena merata-ratakan multi-moda M/N/F dan urutan tangga Z6.",
    },
    {
      key: "wip",
      symbol: "WIP",
      value: formatNum(op.wip),
      unit: "job",
      explain:
        "Work-in-process rata-rata = integral WIP(t) dt / T (job yang sudah dirilis tapi belum selesai). Little menguji konsistensi: pada sistem stabil WIP ≈ TH × CT. Titik (WIP, TH) dan (WIP, CT) dipetakan ke kurva WIP–TH–CT. CONWIP membatasi WIP maksimum; jika CONWIP ketat, TH turun sebelum utilisasi saturasi.",
    },
    {
      key: "fr",
      symbol: "FR",
      value: formatPct(op.fillRate),
      unit: "panel",
      explain:
        "Fill rate panel = 1 − (jumlah stockout / percobaan ambil stok). Tuas Inventory: buffer awal, lead time L panel far-supply, dan CONWIP. Di kurva FR vs inventory, titik oranye = FR empiris DES; titik hitam = prediksi base-stock ideal. FR rendah = buffer/L/CONWIP belum cukup untuk variability demand.",
    },
    {
      key: "util",
      symbol: "ū",
      value: formatPct(op.utilBot),
      unit: `bot. ${BOT_LABEL[op.bottleneck]}`,
      explain:
        "Utilisasi resource tersibuk (bottleneck empiris dari DES). Kingman: CT/te naik tajam saat ū → 1, diperparah V = (ca² + ce²)/2. Marker oranye di kurva multi-V = (ū_bot, CT_sistem/te_bot). Bandingkan dengan titik hitam (parameter Analitik) untuk melihat seberapa dekat empiris ke prediksi VUT.",
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
          <p className="text-xs font-medium text-fg">Alur angka: DES → hukum → kurva Analitik</p>
          <ol className="list-decimal space-y-2.5 pl-4 text-xs text-muted leading-relaxed">
            <li>
              <strong className="text-fg">DES (empiris)</strong> menghasilkan TH, CT, WIP, FR, ū dari
              event start/end/arrive pada multi-moda M (kolom manual), N (balok near-site), F (panel
              far-supply) dengan CONWIP, buffer panel, dan urutan tangga di Z6. Angka ini adalah
              hasil run DES — bukan asumsi rumus tertutup.
            </li>
            <li>
              <strong className="text-fg">Little&apos;s Law</strong> mengikat tiga metrik pada sistem
              stabil: <span className="font-mono">WIP = TH × CT</span>. Uji konsistensi: hitung
              TH×CT dari chip di atas; jika jauh dari WIP empiris, horizon run terlalu pendek atau
              masih ada transient awal. Di kurva WIP–TH–CT, titik oranye = (WIP_DES, TH_DES) dan
              (WIP_DES, CT_DES).
            </li>
            <li>
              <strong className="text-fg">Kingman / VUT</strong> memakai ū bottleneck dan V = (ca² +
              ce²)/2 untuk memprediksi CT antrian di resource tersibuk:{" "}
              <span className="font-mono">CT/te ≈ 1 + V·ū/(1−ū)</span>. Marker oranye = (ū_bot,
              CT_sistem/te_bot) dari DES. Titik hitam = parameter yang Anda set di Analitik. CT
              sistem ≠ CT bottleneck murni karena DES merata-ratakan semua moda.
            </li>
            <li>
              <strong className="text-fg">Inventory / Fill rate</strong> membandingkan FR empiris
              panel dengan kurva base-stock ideal (lead time L, CV demand, service level). Stockout
              di DES = gejala buffer atau L terlalu ketat relatif terhadap variability. Titik oranye
              di kurva FR vs inventory = posisi DES; geser buffer/L di Simulasi lalu Run ulang untuk
              melihat pergeseran.
            </li>
          </ol>

          <p className="text-xs font-medium text-fg">Arti tiap notasi (dari run ini)</p>
          <ul className="space-y-2.5 text-xs text-muted leading-relaxed">
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

          <div className="rounded-[var(--radius-sm)] border border-border bg-surface px-3 py-2.5 space-y-2">
            <p className="text-[11px] font-medium text-fg">Mengapa angka DES bisa berbeda dari teori?</p>
            <ul className="list-disc space-y-1.5 pl-4 text-[11px] text-muted leading-relaxed">
              <li>
                <strong className="text-fg">Multi-moda:</strong> Kingman fokus satu bottleneck;
                DES merata-ratakan kolom + balok + panel + tangga.
              </li>
              <li>
                <strong className="text-fg">Urutan tangga Z6:</strong> ketergantungan urutan yang
                tidak ada di rumus VUT sederhana.
              </li>
              <li>
                <strong className="text-fg">Fase awal:</strong> sebelum sistem
                stabil; run pendek membesarkan bias.
              </li>
              <li>
                <strong className="text-fg">CONWIP + buffer diskrit:</strong> batasan stok integer
                dan kebijakan pelepasan yang tidak kontinu seperti model base-stock ideal.
              </li>
            </ul>
            <p className="text-[11px] text-muted leading-relaxed">
              <strong className="text-fg">Catatan:</strong> warna chip sama dengan garis/marker
              di kurva Analitik (biru TH, merah CT, ungu WIP, teal FR, oranye = titik DES). Selisih
              berasal dari multi-moda, urutan tangga, dan fase awal run — bukan kesalahan perhitungan.
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-faint leading-relaxed">
          Warna notasi sama di Analitik. Buka strip lengkap di langkah{" "}
          <strong className="text-muted">Analitik</strong> untuk penjelasan alur DES → Little /
          Kingman / FR dan alasan selisih empiris vs teori.
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
