import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";

const TOC = [
  { id: "tujuan", label: "1. Tujuan" },
  { id: "alur", label: "2. Alur lab" },
  { id: "pengenalan", label: "3. Pengenalan" },
  { id: "kasus", label: "4. Kasus" },
  { id: "pakai", label: "5. Cara memakai" },
  { id: "notasi", label: "6. Notasi" },
  { id: "latihan", label: "7. Latihan" },
  { id: "batas", label: "8. Batasan" },
] as const;

export function ManualPanel({ onBack, backLabel = "Kembali" }: { onBack: () => void; backLabel?: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-faint">Manual</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Panduan MP2K · PPM multi-moda</h2>
          <p className="mt-2 text-sm text-muted leading-relaxed">
            Pengelolaan produksi proyek konstruksi multi-moda (PPM) dan sains operasi. Dua pintu:
            <strong className="text-fg"> Pengenalan</strong> (teori + if–then), lalu{" "}
            <strong className="text-fg">Penerapan di kasus Gedung</strong> (DES + analitik + CONWIP).
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-sm font-medium text-fg hover:bg-elevated"
        >
          {backLabel}
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
            <CardTitle className="text-base">1. Tujuan</CardTitle>
            <CardDescription>Yang dikerjakan di MP2K</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted leading-relaxed">
              <li>
                Membedakan <strong className="text-fg">CPM / scheduling</strong> vs{" "}
                <strong className="text-fg">PPM / operations science</strong> (aliran, antrian, stok).
              </li>
              <li>
                Meramal arah pada Little, Kingman, <strong className="text-fg">CT vs WIP</strong>,
                Inventory/FR, dan operating curve (if–then dulu, rumus kemudian).
              </li>
              <li>
                Mengenali <strong className="text-fg">Control</strong> (mekanisme arah sistem) vs{" "}
                <em>controls</em> (pengukuran), termasuk <strong className="text-fg">CONWIP</strong>.
              </li>
              <li>
                Mengenali tiga moda produksi: manual (M), near-site (N), far-supply (F).
              </li>
              <li>
                Mengoperasikan tuas PPM — Capacity · Inventory · Variability — lewat DES, dengan
                Product & Process design sudah ditetapkan di Kasus.
              </li>
              <li>
                Menempelkan titik operasi DES pada kurva yang sama, lalu menjelaskan selisih empiris
                vs teori.
              </li>
              <li>
                Membandingkan <strong className="text-fg">strategi produk + proses</strong> (Tradisional ·
                Hibrid · Industri) lewat indeks cost & schedule 1–5 — konseptual, bukan output DES.
              </li>
              <li>
                Melihat efek <strong className="text-fg">Control / CONWIP</strong> pada jejak WIP vs waktu
                (preset WIP bebas vs CONWIP ketat).
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section id="manual-alur" className="scroll-mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Alur lab</CardTitle>
            <CardDescription>Pengenalan dulu, kasus kemudian</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted leading-relaxed">
            <p>
              <strong className="text-fg">Pengenalan</strong> (tiga kurva PPI + Inventory/FR + Control).
              Tanpa denah. Lima modul memakai <strong className="text-fg">satu sistem demo</strong>{" "}
              (angka oranye sama di semua tab): Little → Kingman → CT vs WIP → Inventory/FR → Control & CONWIP.
            </p>
            <p>
              <strong className="text-fg">Penerapan di kasus Gedung.</strong> Tiga langkah:{" "}
              <strong className="text-fg">Kasus</strong> (desain) → <strong className="text-fg">Simulasi</strong>{" "}
              (DES, 3 tuas) → <strong className="text-fg">Analitik</strong> (empat sub-tab kurva +
              marker DES). Manual tetap di header/footer, bukan di bar langkah kasus.
            </p>
            <p className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2 text-xs font-mono text-fg">
              Sistem demo: T0=4 · rb=2 · W0=8 · V=0.5 · Wopt≈14 · Little (WIP=8, TH=2, CT=4)
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="manual-pengenalan" className="scroll-mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. Pengenalan — lima modul</CardTitle>
            <CardDescription>Teori dulu, angka sama, warna oranye menghubungkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted leading-relaxed">
            <div>
              <p className="font-medium text-fg">1 · Little's Law</p>
              <p className="mt-1">WIP = TH × CT. If–then: naiknya WIP atau turunnya TH mengubah CT.</p>
            </div>
            <div>
              <p className="font-medium text-fg">2 · Kingman</p>
              <p className="mt-1">
                CT/te ≈ 1 + V · ū/(1−ū). Perhatikan empat bagian: CT, te, I+V, utilisasi — terutama
                lonjakan di ū tinggi.
              </p>
            </div>
            <div>
              <p className="font-medium text-fg">3 · CT vs WIP</p>
              <p className="mt-1">
                Kurva ketiga PPI. Best-case: CT = T0 jika WIP ≤ W0; CT = WIP/rb jika WIP di atas W0.
                Dengan variabilitas, CT naik lebih cepat. Acuan: W0 (critical) dan Wopt.
              </p>
            </div>
            <div>
              <p className="font-medium text-fg">4 · Inventory & Fill Rate</p>
              <p className="mt-1">
                FR vs stock buffer. Inventory (WIP, buffer stok, time buffer) terkait fill rate
                supply panel.
              </p>
            </div>
            <div>
              <p className="font-medium text-fg">5 · Control & CONWIP</p>
              <p className="mt-1">
                <strong className="text-fg">Control</strong> = mekanisme yang mengarahkan aliran
                (bukan sekadar measurement). CONWIP membatasi total WIP: job baru masuk hanya jika
                ada slot. Operating curve WIP–TH–CT menampilkan W0 (critical), Wopt, dan garis CONWIP.
              </p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2.5 text-xs space-y-1.5">
              <p className="font-medium text-fg">Lima tuas PPM (urutan didaktik)</p>
              <p>
                Product design → Process design → Capacity → Inventory → Variability. Ketiga kurva +
                operating curve membantu menilai dampak tuas. Buffer: capacity (ū di bawah 100%),
                time, dan stock — ketiganya muncul di kurva.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="manual-kasus" className="scroll-mt-6 space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">4. Kasus: frame beton 2 lantai</CardTitle>
            <CardDescription>Product design dan Process design sudah ditetapkan</CardDescription>
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
                    <td className="py-2">Workface di lokasi · kapasitas kru</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-2 pr-3 font-medium text-fg">N · Near-site</td>
                    <td className="py-2 pr-3">Balok beton</td>
                    <td className="py-2">Offsite dekat · lead time dan buffer pendek</td>
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

            <div>
              <p className="font-medium text-fg">Owner vs builder · schedule ≠ sistem produksi</p>
              <p className="mt-1">
                Owner (demand): scope · cost · quality · schedule. Builder (supply): product · process ·
                capacity · inventory · variability. Schedule = <em>should happen</em>; sistem produksi ={" "}
                <em>can / will happen</em>.
              </p>
            </div>

            <div>
              <p className="font-medium text-fg">Strategi produksi · cost & schedule (konseptual)</p>
              <p className="mt-1">
                Tiga paket <strong className="text-fg">produk + proses</strong> diberikan (bukan hasil Run
                DES). Metrik = <strong className="text-fg">indeks 1–5</strong> (bukan hari/rupiah absolut):
              </p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs">
                <li>Durasi: 1 = cepat · 5 = lama</li>
                <li>Biaya: 1 = rendah · 5 = tinggi</li>
                <li>WIP puncak: 1 = rendah · 5 = tinggi</li>
              </ul>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[24rem] text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-faint">
                      <th className="py-1.5 pr-3 font-medium">Strategi</th>
                      <th className="py-1.5 pr-3 font-medium">Durasi</th>
                      <th className="py-1.5 pr-3 font-medium">Biaya</th>
                      <th className="py-1.5 font-medium">WIP puncak</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted">
                    <tr className="border-b border-border/60">
                      <td className="py-1.5 pr-3 font-medium text-fg">Tradisional (M-dominan)</td>
                      <td className="py-1.5 pr-3 font-mono">5</td>
                      <td className="py-1.5 pr-3 font-mono">2</td>
                      <td className="py-1.5 font-mono">5</td>
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="py-1.5 pr-3 font-medium text-fg">Hibrid (M·N·F)</td>
                      <td className="py-1.5 pr-3 font-mono">3</td>
                      <td className="py-1.5 pr-3 font-mono">3</td>
                      <td className="py-1.5 font-mono">3</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 pr-3 font-medium text-fg">Industri (lebih F)</td>
                      <td className="py-1.5 pr-3 font-mono">2</td>
                      <td className="py-1.5 pr-3 font-mono">5</td>
                      <td className="py-1.5 font-mono">2</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs">
                Grafik di Kasus: scatter <strong className="text-fg">Cost vs Schedule</strong> dan bar
                tiga indeks. Hibrid ≈ framing lab Simulasi. Tidak ada satu terbaik — ada trade-off.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="manual-pakai" className="scroll-mt-6 space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">5. Cara memakai</CardTitle>
            <CardDescription>Pengenalan → Kasus → Simulasi → Analitik</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-muted leading-relaxed">
            <div>
              <p className="font-medium text-fg">Pengenalan</p>
              <ol className="mt-1.5 list-decimal space-y-1 pl-5">
                <li>Buka pintu Pengenalan</li>
                <li>Perhatikan chip sistem demo (angka oranye) di header</li>
                <li>Per modul: baca rumus → if–then → amati grafik & titik oranye</li>
                <li>
                  Little → Kingman → <strong className="text-fg">CT vs WIP</strong> → Inventory/FR →
                  Control & CONWIP (W0, Wopt, CONWIP)
                </li>
                <li>Kartu jembatan → Lanjut ke kasus</li>
              </ol>
            </div>
            <div>
              <p className="font-medium text-fg">Langkah 1 — Kasus</p>
              <ol className="mt-1.5 list-decimal space-y-1 pl-5">
                <li>Baca owner vs builder dan schedule ≠ sistem produksi</li>
                <li>Baca kartu CPM vs PPM, moda M/N/F, denah/elevasi, urutan zona</li>
                <li>
                  Bandingkan tiga <strong className="text-fg">strategi produk + proses</strong>{" "}
                  (Tradisional · Hibrid · Industri) lewat indeks 1–5 dan grafik Cost vs Schedule
                </li>
                <li>Tidak ada parameter DES yang diubah di sini — product & process given</li>
              </ol>
            </div>
            <div>
              <p className="font-medium text-fg">Langkah 2 — Simulasi (DES)</p>
              <ol className="mt-1.5 list-decimal space-y-1 pl-5">
                <li>
                  Pilih preset (enam): <strong className="text-fg">Dasar</strong> · Variability tinggi ·
                  Inventory ketat · Capacity longgar ·{" "}
                  <strong className="text-fg">WIP bebas</strong> (CONWIP=40) ·{" "}
                  <strong className="text-fg">CONWIP ketat</strong> (CONWIP=4, di bawah W0=8)
                </li>
                <li>
                  Baca pertanyaan/hint — untuk Control: acuan W0 = rb×T0 = 8 · Wopt ≈ 14
                </li>
                <li>
                  Tekan <strong className="text-fg">Reset</strong> lalu{" "}
                  <strong className="text-fg">Run all</strong>
                </li>
                <li>
                  Amati progress, strip titik operasi (TH, CT, WIP, FR, ū), dan tabel Banding DES ↔
                  teori beserta Δ
                </li>
                <li>
                  Buka <strong className="text-fg">Jejak waktu</strong> di Kendali DES: Utilization
                  (M·N·F) dan WIP over Time. Garis oranye = plafon CONWIP (jika dekat jejak).
                  Bandingkan WIP bebas vs CONWIP ketat.
                </li>
                <li>Buka Glosarium jika istilah belum familiar</li>
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
                  <strong className="text-fg">Mulai perhitungan</strong> → empat sub-tab:
                </li>
              </ol>
              <ul className="mt-1.5 list-disc space-y-1 pl-8 text-xs">
                <li>Little's Law</li>
                <li>Kingman</li>
                <li>Inventory / FR</li>
                <li>
                  <strong className="text-fg">Kurva gabungan & CONWIP</strong> — operating curve
                  WIP–TH–CT, W0, Wopt, garis CONWIP, titik oranye DES empiris
                </li>
              </ul>
              <p className="mt-2">Diskusikan selisih marker vs prediksi teori dan zona CONWIP.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="manual-notasi" className="scroll-mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">6. Notasi singkat</CardTitle>
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
                    ["\u016b", "Utilisasi resource", "0–1"],
                    ["te", "Waktu proses efektif", "hari/job"],
                    ["m", "Resource paralel", "—"],
                    ["ca, ce", "CV kedatangan & proses", "—"],
                    ["V", "(ca² + ce²) / 2", "—"],
                    ["FR", "Fill rate panel", "0–1"],
                    ["L", "Lead time supply panel", "hari"],
                    ["W0", "Critical WIP = rb × T0", "job"],
                    ["Wopt", "≈ W0 (1 + √V)", "job"],
                    ["CONWIP", "Batas WIP sistem (control)", "job"],
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
              <p>CT vs WIP (best): CT = T0 jika WIP ≤ W0; CT = WIP/rb jika WIP di atas W0</p>
              <p>W0 = rb × T0 · Wopt ≈ W0 (1 + √V)</p>
              <p>FR DES ≈ 1 − (stockout / percobaan ambil stok)</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="manual-latihan" className="scroll-mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">7. Saran latihan</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2.5 pl-5 text-sm text-muted leading-relaxed">
              <li>
                <strong className="text-fg">Pengenalan</strong> — if–then tiap modul termasuk CT vs
                WIP (W1 di bawah W0, W2 ≈ Wopt, W3 berlebih) dan Control (C1–C3). Yang dinilai: arah,
                bukan angka.
              </li>
              <li>
                <strong className="text-fg">Strategi (Kasus)</strong> — bandingkan Tradisional · Hibrid ·
                Industri pada indeks 1–5. Manakah trade-off cost vs schedule yang cocok jika owner
                menekan durasi? Jika menekan biaya?
              </li>
              <li>
                <strong className="text-fg">Baseline</strong> — preset Dasar, Run all. Catat TH, CT,
                WIP, FR, ū. Cek Little. Tempel titik oranye di Analitik.
              </li>
              <li>
                <strong className="text-fg">Variability tinggi</strong> — apa yang terjadi pada CT
                dan Δ Kingman?
              </li>
              <li>
                <strong className="text-fg">Inventory ketat</strong> — stockout & FR; longgarkan
                buffer/L atau CONWIP, Run ulang, bandingkan marker.
              </li>
              <li>
                <strong className="text-fg">Control · jejak waktu</strong> — preset WIP bebas lalu
                CONWIP ketat. Reset + Run all masing-masing. Apakah WIP menempel garis CONWIP=4?
                TH/CT berubah ke arah mana?
              </li>
              <li>
                <strong className="text-fg">Capacity</strong> — Capacity longgar vs Dasar. TH naik?
                Bottleneck bergeser?
              </li>
              <li>
                <strong className="text-fg">Kurva gabungan & CONWIP</strong> — Isi dari DES → Mulai
                perhitungan → tab ke-4. Apakah titik DES di zona lapar, seimbang, atau longgar?
                Usulkan CONWIP baru dan uji ulang di Simulasi.
              </li>
              <li>
                <strong className="text-fg">Sinkronisasi</strong> — jelaskan 5–7 kalimat mengapa
                titik oranye tidak selalu menempel prediksi tertutup.
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section id="manual-batas" className="scroll-mt-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">8. Batasan model</CardTitle>
              <Badge variant="default">penting untuk diskusi</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted leading-relaxed">
              <li>Frame 2 lantai, grid tetap, urutan zona & tangga disederhanakan.</li>
              <li>
                Hasil DES dapat diulang dengan seed yang sama; run pendek masih membawa bias fase
                awal.
              </li>
              <li>
                Prediksi teori memakai pendekatan bottleneck tunggal dan model base-stock.
              </li>
              <li>
                Skor match visual <strong className="text-fg">bukan</strong> metrik produksi — fokus
                pada TH, CT, WIP, FR, ū, dan posisi relatif terhadap W0/Wopt/CONWIP.
              </li>
              <li>
                Strategi cost & schedule memakai <strong className="text-fg">indeks 1–5 konseptual</strong>{" "}
                (given), bukan kalibrasi biaya/hari proyek nyata.
              </li>
              <li>
                Jejak waktu = run lab produktivitas, bukan kalender proyek sampai finish owner.
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
          Kembali ke lab
        </button>
      </div>
    </div>
  );
}
