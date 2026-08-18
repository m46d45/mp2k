import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BuildingView } from "@/components/mp2k/building-view";
import { Hammer, Factory, Truck, ArrowRight, Layers, GitBranch, CalendarClock, Workflow, UserRound, HardHat } from "lucide-react";

/**
 * Step 1 — Introduce the MP2k case (before sim & analytics).
 */
export function CasePanel({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-wider text-faint">Langkah 1 · Kasus</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          Proyek frame beton bertulang multi-moda
        </h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Satu bangunan, tiga jenis produksi yang harus{" "}
          <strong className="font-medium text-fg">match</strong> di workface. Fondasi & sloof sudah
          siap — kita fokus ke struktur atas.
        </p>
      </div>

      {/* Owner vs Builder framing (PPI) */}
      <Card className="border-fg/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Dua perspektif yang harus nyambung</CardTitle>
          <CardDescription>
            Owner di sisi demand · Builder di sisi supply — operasi berbeda, tetapi satu proyek
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-sm)] border border-border bg-surface p-3">
              <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-fg">
                <UserRound className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
                Owner (demand)
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Bahasa yang sering diajarkan: <strong className="text-fg">scope · cost · quality · schedule</strong>.
                Owner membuat target dan jadwal — "apa" dan "kapan" yang diinginkan dari proyek.
              </p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-border bg-surface p-3">
              <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-fg">
                <HardHat className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
                Builder (supply)
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Bahasa produksi: <strong className="text-fg">product · process · capacity · inventory · variability</strong>.
                Builder merancang dan mengoperasikan <em>sistem produksi</em> yang harus memenuhi demand owner.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Selama ini pendidikan dan praktek lebih condong ke sisi owner. MP2K fokus ke sisi builder:
            bagaimana aliran di workface diatur agar TH, CT, WIP, dan fill rate terjaga — bukan hanya agar
            bar chart terlihat hijau. Owner membuat jadwal; builder membuat production system.
            (Tier-1 builder menjadi "owner" bagi tier-2 — rantai yang sama berulang.)
          </p>
        </CardContent>
      </Card>

      {/* Schedule ≠ Production system (PPI) */}
      <Card className="border-fg/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Schedule ≠ sistem produksi</CardTitle>
          <CardDescription>
            Dua hal yang sering disamakan — padahal beda peran
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-sm)] border border-border bg-surface p-3">
              <p className="text-sm font-medium text-fg">Schedule</p>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                <strong className="text-fg">Should happen</strong> — target tanggal, urutan, dan
                progress yang diinginkan (sisi demand / owner).
              </p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-border bg-surface p-3">
              <p className="text-sm font-medium text-fg">Sistem produksi</p>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                <strong className="text-fg">Can / will happen</strong> — kapasitas, inventory, dan
                variabilitas yang menentukan TH, CT, WIP di workface (sisi supply / builder).
              </p>
            </div>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Jadwal yang hijau tidak menjamin aliran lancar. Sistem produksi harus diatur agar
            berperilaku sesuai yang diinginkan — bukan hanya agar bar chart terisi.
          </p>
        </CardContent>
      </Card>

      {/* Priority 1: CPM vs PPM + lab objectives */}
      <Card className="border-fg/25 bg-elevated/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base leading-snug">
            Apa bedanya praktek yang selama ini dilakukan dalam manajemen proyek menggunakan
            CPM/BarChart dengan Pengelolaan Produksi atau Project Production Management (PPM)?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-sm)] border border-border bg-surface p-3">
              <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-fg">
                <CalendarClock className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
                CPM / bar chart
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Urutan aktivitas, durasi, jalur kritis, dan target tanggal. Berguna untuk
                perencanaan waktu — tetapi tidak menjelaskan antrian, WIP, atau mengapa satu moda
                idle sementara moda lain menumpuk.
              </p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-border bg-surface p-3">
              <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-fg">
                <Workflow className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
                PPM
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Proyek sebagai <strong className="text-fg">sistem produksi</strong>: throughput (TH),
                cycle time (CT), WIP, utilisasi, dan fill rate. Menjelaskan macet di workface meski
                jadwal sesuai target.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-faint">Yang dibandingkan di sini</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted leading-relaxed">
              <li>
                Membedakan pertanyaan penjadwalan (<strong className="text-fg">kapan</strong>) dari
                pertanyaan produksi (<strong className="text-fg">mengapa aliran macet</strong>)
              </li>
              <li>
                Mengenali tiga moda (M / N / F) yang harus <strong className="text-fg">match</strong> di
                satu workface
              </li>
              <li>
                Menghubungkan tuas <strong className="text-fg">Capacity · Variability · Inventory</strong> ke
                metrik TH, CT, WIP, dan fill rate
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Three production modes */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ModeCard
          icon={Hammer}
          mode="M"
          title="Manual di lokasi"
          item="Kolom beton"
          detail="Dibentuk dan dicor di lokasi. Variability proses tinggi (cuaca, kru, bekisting)."
        />
        <ModeCard
          icon={Factory}
          mode="N"
          title="Near-site (dekat lokasi)"
          item="Balok beton"
          detail="Diproduksi di yard dekat lokasi. Lead time menengah, mutu lebih terkendali."
        />
        <ModeCard
          icon={Truck}
          mode="F"
          title="Far supply (dari luar)"
          item="Panel lantai"
          detail="Datang dari luar, tinggal pasang. Lead time panjang — inventory & FR kritis."
        />
      </div>

      {/* Geometry */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Geometri & zonasi</CardTitle>
            <CardDescription>Grid 3×5 kolom · 2 lantai · 8 zona per lantai</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted leading-relaxed">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-fg">3 kolom ke samping × 5 ke memanjang</strong> → 15 kolom per
                lantai
              </li>
              <li>Balok di atas kolom; minimal 2 kolom dulu baru balok naik</li>
              <li>
                Panel melintang di atas 2 balok: biasanya <strong className="text-fg">3 panel</strong> per
                zona
              </li>
              <li>
                <strong className="text-fg">Z6 L1</strong>: hanya 2 panel + void tangga (tangga manual
                L1→L2, bukan ke atap)
              </li>
              <li>
                <strong className="text-fg">Z6 L2</strong>: 3 panel penuh
              </li>
              <li>
                Tangga dikerjakan <strong className="text-fg">terakhir</strong> setelah kolom+balok C3
                L1–L2 siap
              </li>
            </ul>
            <div className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2 font-mono text-xs text-fg">
              Gelombang: Z1+Z5 → Z2+Z6 → Z3+Z7 → Z4+Z8 · lalu L2 · lalu tangga
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mengapa multi-moda rumit?</CardTitle>
            <CardDescription>Menyelaraskan tiga ritme produksi di satu workface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted leading-relaxed">
            <p>
              Kolom (M), balok (N), dan panel (F) punya <strong className="text-fg">cycle time,
              variability, dan inventory</strong> berbeda. Kalau urutan/zona tidak match:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>WIP menumpuk di satu moda, moda lain menganggur</li>
              <li>Utilisasi tinggi di bottleneck → CT meledak (Kingman)</li>
              <li>Panel terlambat → fill rate turun, zona kosong</li>
            </ul>
            <p className="text-fg font-medium">
              Kasus ini memakai lima tuas PPM dan sains operasi (Project Production Institute).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preview of building */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Denah dan elevasi</CardTitle>
          <CardDescription>Pratinjau geometri kasus — zona, moda, dan urutan gelombang</CardDescription>
        </CardHeader>
        <CardContent>
          <BuildingView />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <GitBranch className="size-4 text-muted" />
              <CardTitle className="text-base">5 tuas PPM</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="space-y-1.5 text-sm text-muted">
              <li>
                <span className="text-fg">1.</span> Product design{" "}
                <span className="text-faint">(sudah ditetapkan di Kasus)</span>
              </li>
              <li>
                <span className="text-fg">2.</span> Process design{" "}
                <span className="text-faint">(sudah ditetapkan di Kasus)</span>
              </li>
              <li>
                <span className="text-fg">3.</span> Capacity{" "}
                <span className="text-faint">(hidup di DES)</span>
              </li>
              <li>
                <span className="text-fg">4.</span> Inventory{" "}
                <span className="text-faint">(hidup di DES)</span>
              </li>
              <li>
                <span className="text-fg">5.</span> Variability{" "}
                <span className="text-faint">(hidup di DES)</span>
              </li>
            </ol>
            <p className="mt-3 text-xs text-muted leading-relaxed">
              Tuas 3–5 diuji lewat simulasi (perilaku) dan analitik (kurva hukum produksi).
            </p>
          </CardContent>
        </Card>

        <Card className="border-fg/20 bg-elevated/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-muted" />
              <CardTitle className="text-base">Alur MP2K</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Badge variant="default">1</Badge>
                <span>
                  <strong className="text-fg">Kasus</strong> — sistem multi-moda
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="default">2</Badge>
                <span>
                  <strong className="text-fg">Simulasi</strong> — DES: Capacity · Variability · Inventory
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="default">3</Badge>
                <span>
                  <strong className="text-fg">Analitik</strong> — Little · Kingman · Inventory/FR
                </span>
              </li>
            </ol>
            <button
              type="button"
              onClick={onNext}
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-medium text-primary-fg"
            >
              Lanjut ke Simulasi
              <ArrowRight className="size-4" />
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ModeCard({
  icon: Icon,
  mode,
  title,
  item,
  detail,
}: {
  icon: typeof Hammer;
  mode: string;
  title: string;
  item: string;
  detail: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <Icon className="size-5 text-fg" strokeWidth={1.5} />
          <Badge variant="default">{mode}</Badge>
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="font-medium text-fg">{item}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted leading-relaxed">{detail}</p>
      </CardContent>
    </Card>
  );
}
