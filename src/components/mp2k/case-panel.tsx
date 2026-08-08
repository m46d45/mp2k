import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BuildingView } from "@/components/mp2k/building-view";
import { Hammer, Factory, Truck, ArrowRight, Layers, GitBranch } from "lucide-react";

/**
 * Step 1 — Introduce the MP2K case (before sim & analytics).
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

      {/* Three production modes */}
      <div className="grid gap-3 sm:grid-cols-3">
        <ModeCard
          icon={Hammer}
          mode="M"
          title="Manual / craft onsite"
          item="Kolom beton"
          detail="Dibentuk & dicor di lokasi. Variability proses tinggi (cuaca, kru, formwork)."
        />
        <ModeCard
          icon={Factory}
          mode="N"
          title="Near-site offsite"
          item="Balok beton"
          detail="Yard di dekat site. Lead time menengah, kualitas lebih terkendali."
        />
        <ModeCard
          icon={Truck}
          mode="F"
          title="Far supply & install"
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
            <CardDescription>Matching tiga ritme produksi di satu workface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted leading-relaxed">
            <p>
              Kolom (M), balok (N), dan panel (F) punya <strong className="text-fg">cycle time,
              variability, dan inventory</strong> berbeda. Kalau urutan/zona tidak match:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>WIP menumpuk di satu moda, moda lain idle</li>
              <li>Utilisasi tinggi di bottleneck → CT meledak (Kingman)</li>
              <li>Panel terlambat → fill rate turun, zona kosong</li>
            </ul>
            <p className="text-fg font-medium">
              MP2K memakai kasus ini untuk belajar Project Production Management (PPI): 5 tuas +
              Operations Science.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preview of building */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pratinjau denah & elevasi</CardTitle>
          <CardDescription>Ilustrasi frame — detail dinamis di langkah Simulasi</CardDescription>
        </CardHeader>
        <CardContent>
          <BuildingView />
        </CardContent>
      </Card>

      {/* 5 levers + link forward */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <GitBranch className="size-4 text-muted" />
              <CardTitle className="text-base">5 tuas PPM</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ol className="space-y-1.5 font-mono text-xs text-muted">
              <li>
                <span className="text-fg">1.</span> Product design
              </li>
              <li>
                <span className="text-fg">2.</span> Process design
              </li>
              <li>
                <span className="text-fg">3.</span> Capacity
              </li>
              <li>
                <span className="text-fg">4.</span> Inventory
              </li>
              <li>
                <span className="text-fg">5.</span> Variability
              </li>
            </ol>
            <p className="mt-3 text-xs text-muted leading-relaxed">
              Tuas diuji lewat simulasi (perilaku) dan analitik (kurva hukum produksi).
            </p>
          </CardContent>
        </Card>

        <Card className="border-fg/20 bg-elevated/40">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-muted" />
              <CardTitle className="text-base">Alur belajar MP2K</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Badge variant="default">1</Badge>
                <span>
                  <strong className="text-fg">Kasus</strong> — pahami sistem multi-moda
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="default">2</Badge>
                <span>
                  <strong className="text-fg">Simulasi</strong> — jalankan / DES (didefinisikan
                  berikutnya)
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
