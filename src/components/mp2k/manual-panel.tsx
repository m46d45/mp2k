import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";

const TOC = [
  { id: "tujuan", label: "1. Tujuan" },
  { id: "kasus", label: "2. Kasus" },
  { id: "pakai", label: "3. Cara memakai" },
  { id: "notasi", label: "4. Notasi" },
  { id: "latihan", label: "5. Latihan" },
  { id: "batas", label: "6. Batasan" },
] as const;

export function ManualPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">Manual lab</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Panduan MP2K · PPM multi-moda
          </h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Lab interaktif Project Production Management / Operations Science. Model{" "}
            <strong className="text-fg">didaktik</strong> — bukan digital twin proyek nyata. Konsep
            diilhami Project Production Institute (PPI) dan Factory Physics.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-sm font-medium text-fg hover:bg-elevated"
        >
          Kembali ke lab
          <ArrowRight className="size-4" />
        </button>
      </div>

      <nav
        aria-label="Daftar isi manual"
        className="flex flex-wrap gap-1.5 rounded-[var(--radius-md)] border border-border bg-elevated p-2"
      >
        {TOC.map((t) => (
          <a
            key={t.id}
            href={`#manual-${t.id}`}
            className="inline-flex min-h-10 items-center rounded-[var(--radius-sm)] border border-border bg-surface px-3 text-xs font-medium text-muted hover:text-fg"
          >
            {t.label}
          </a>
        ))}
      </nav>

      <section id="manual-tujuan" className="scroll-mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Tujuan pembelajaran</CardTitle>
            <CardDescription>Setelah lab ini, mahasiswa diharapkan mampu</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted leading-relaxed">
              <li>
                Membedakan <strong className="text-fg">CPM / scheduling</strong> vs{" "}
                <strong className="text-fg">PPM / operations science</strong> (aliran, antrian,
                stok).
              </li>
              <li>
                Mengenali tiga moda produksi: manual (M), near-site (N), far-supply (F).
              </li>
              <li>
                Mengoperasikan tiga tuas terakhir PPM —{" "}
                <strong className="text-fg">Capacity · Variability · Inventory</strong> — lewat DES.
              </li>
              <li>
                Membaca Little&apos;s Law, Kingman (VUT), dan fill rate vs inventory, serta
                membandingkan empiris DES dengan prediksi teori.
              </li>
              <li>
                Menjelaskan mengapa angka DES dan teori bisa berbeda (multi-moda, gate urutan,
                transient, buffer diskrit).
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section id="manual-kasus" className="scroll-mt-6 space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Kasus: frame beton 2 lantai</CardTitle>
            <CardDescription>Product & process design sudah ditetapkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted leading-relaxed">
            <div>
              <p className="font-medium text-fg">Geometri & zonasi</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                <li>
                  Grid kolom <strong className="text-fg">3 × 5</strong> · 2 lantai · fondasi & sloof
                  siap
                </li>
                <li>Kerja per zona, gelombang berpasangan: Z1+Z5 → Z2+Z6 → Z3+Z7 → Z4+Z8</li>
                <li>
                  Tangga hanya di L1 zona Z6 (manual). L1 Z6: 2 panel + void tangga. L2 Z6: 3 panel
                </li>
              </ul>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-faint">
                    <th className="py-1.5 pr-3 font-medium">Moda</th>
                    <th className="py-1.5 pr-3 font-medium">Elemen</th>
                    <th className="py-1.5 font-medium">Karakter</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/60">
                    <td className="py-2 pr-3 font-medium text-fg">M · Manual</td>
                    <td className="py-2 pr-3">Kolom beton</td>
                    <td className="py-2">Workface onsite · kapasitas kru</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-2 pr-3 font-medium text-fg">N · Near-site</td>
                    <td className="py-2 pr-3">Balok beton</td>
                    <td className="py-2">Offsite dekat · lead/buffer pendek</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-medium text-fg">F · Far-supply</td>
                    <td className="py-2 pr-3">Panel lantai</td>
                    <td className="py-2">Datang dari luar · L & buffer → FR</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              Urutan workface harus <strong className="text-fg">match</strong>: kolom → balok
              (minimal dua kolom) → panel (bertumpu pada balok). Tangga Z6 menunggu kolom C3 + balok
              terkait selesai.
            </p>
            <p>
              Lima tuas PPM: <strong className="text-fg">Product</strong> &{" "}
              <strong className="text-fg">Process design</strong> fixed di Kasus.{" "}
              <strong className="text-fg">Capacity, Variability, Inventory</strong> disimulasikan.
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="manual-pakai" className="scroll-mt-6 space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. Cara memakai situs</CardTitle>
            <CardDescription>Kasus → Simulasi → Analitik</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-muted leading-relaxed">
            <div>
              <p className="font-medium text-fg">Langkah 1 — Kasus</p>
              <p className="mt-1">
                Baca kartu CPM vs PPM, denah/elevasi, moda M/N/F, dan urutan zona. Tidak ada
                parameter yang diubah di sini.
              </p>
            </div>
            <div>
              <p className="font-medium text-fg">Langkah 2 — Simulasi (DES)</p>
              <ol className="mt-1.5 list-decimal space-y-1 pl-5">
                <li>
                  Pilih preset: <strong className="text-fg">Dasar</strong> · Variability tinggi ·
                  Inventory ketat · Capacity longgar
                </li>
                <li>Baca pertanyaan/hint di bawah preset</li>
                <li>
                  Tekan <strong className="text-fg">Run all</strong>
                </li>
                <li>
                  Amati progress, strip titik operasi (TH, CT, WIP, FR, ū), dan tabel Banding DES ↔
                  teori beserta Δ
                </li>
                <li>Buka Glossarium jika istilah belum familiar</li>
              </ol>
              <div className="mt-3 space-y-1.5 rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2.5 text-xs">
                <p className="font-medium text-fg">Cara membaca Δ</p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    <strong className="text-fg">Little:</strong> Δ kecil → sistem relatif stabil
                    (WIP ≈ TH × CT). Δ besar → perpanjang run / abaikan transient.
                  </li>
                  <li>
                    <strong className="text-fg">Kingman:</strong> Δ besar sering wajar — DES
                    merata-ratakan semua moda; Kingman fokus bottleneck.
                  </li>
                  <li>
                    <strong className="text-fg">FR:</strong> mengarah ke buffer, L, atau CONWIP.
                    Longgarkan di Simulasi lalu Run ulang.
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <p className="font-medium text-fg">Langkah 3 — Analitik</p>
              <ol className="mt-1.5 list-decimal space-y-1 pl-5">
                <li>Strip titik operasi DES memakai notasi & warna yang sama di kurva</li>
                <li>
                  Opsional: <strong className="text-fg">Isi dari DES</strong> menyalin bottleneck,
                  TH, ca/ce, L, CONWIP ke parameter Analitik
                </li>
                <li>
                  <strong className="text-fg">Mulai perhitungan</strong> → Little (WIP–TH–CT),
                  Kingman multi-V, Inventory/FR. Marker oranye = DES
                </li>
                <li>Diskusikan selisih marker vs prediksi teori</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="manual-notasi" className="scroll-mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">4. Notasi singkat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-faint">
                    <th className="py-1.5 pr-3 font-medium">Simbol</th>
                    <th className="py-1.5 pr-3 font-medium">Arti</th>
                    <th className="py-1.5 font-medium">Satuan</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  {[
                    ["TH", "Throughput", "job/hari"],
                    ["CT", "Cycle time", "hari"],
                    ["WIP", "Work-in-process", "job"],
                    ["ū", "Utilisasi resource", "0–1"],
                    ["te", "Waktu proses efektif", "hari/job"],
                    ["m", "Resource paralel", "—"],
                    ["ca, ce", "CV kedatangan & proses", "—"],
                    ["V", "(ca² + ce²) / 2", "—"],
                    ["FR", "Fill rate panel", "0–1"],
                    ["L", "Lead time supply panel", "hari"],
                    ["CONWIP", "Batas WIP sistem", "job"],
                  ].map(([s, a, u]) => (
                    <tr key={s} className="border-b border-border/60 last:border-0">
                      <td className="py-1.5 pr-3 font-mono font-medium text-fg">{s}</td>
                      <td className="py-1.5 pr-3">{a}</td>
                      <td className="py-1.5 font-mono">{u}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-1 rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2.5 font-mono text-xs text-fg">
              <p>Little: WIP = TH × CT (sistem stabil)</p>
              <p>Kingman: CT/te ≈ 1 + V · ū / (1 − ū)</p>
              <p>FR DES ≈ 1 − (stockout / percobaan ambil stok)</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="manual-latihan" className="scroll-mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">5. Saran latihan lab (30–90 menit)</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2.5 pl-5 text-sm text-muted leading-relaxed">
              <li>
                <strong className="text-fg">Baseline</strong> — preset Dasar, Run all. Catat TH, CT,
                WIP, FR, ū. Cek konsistensi Little.
              </li>
              <li>
                <strong className="text-fg">Shock variability</strong> — preset Variability tinggi.
                Apa yang terjadi pada CT dan Δ Kingman?
              </li>
              <li>
                <strong className="text-fg">Inventory ketat</strong> — amati stockout & FR;
                longgarkan buffer/L, Run ulang, bandingkan marker FR.
              </li>
              <li>
                <strong className="text-fg">Capacity</strong> — Capacity longgar vs Dasar. Apakah TH
                naik proporsional? Di mana bottleneck bergeser?
              </li>
              <li>
                <strong className="text-fg">Sinkronisasi</strong> — Isi dari DES → Mulai perhitungan.
                Jelaskan 5–7 kalimat mengapa titik oranye tidak selalu menempel prediksi tertutup.
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section id="manual-batas" className="scroll-mt-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">6. Batasan model</CardTitle>
              <Badge variant="default">penting untuk diskusi</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted leading-relaxed">
              <li>Frame 2 lantai, grid tetap, urutan zona & tangga disederhanakan.</li>
              <li>DES seedable; run pendek masih membawa bias transient.</li>
              <li>
                Prediksi teori = pendekatan ajar (bottleneck tunggal + base-stock),{" "}
                <strong className="text-fg">bukan</strong> digital twin.
              </li>
              <li>
                Match score visual di UI <strong className="text-fg">bukan</strong> metrik operations
                science — fokus pada TH, CT, WIP, FR, ū.
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <div className="flex justify-center pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-5 text-sm font-medium text-primary-fg"
        >
          <BookOpen className="size-4" />
          Mulai dari Kasus
        </button>
      </div>
    </div>
  );
}
