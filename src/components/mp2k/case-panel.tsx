import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BuildingView } from "@/components/mp2k/building-view";
import { CaseStrategies } from "@/components/mp2k/case-strategies";
import { cn } from "@/lib/utils";
import type { CaseMode } from "@/lib/mp2k/persist";
import {
  Hammer,
  Factory,
  Truck,
  ArrowRight,
  Layers,
  GitBranch,
  CalendarClock,
  Workflow,
  UserRound,
  HardHat,
} from "lucide-react";

/**
 * Step 1 — Introduce the MP2k case (before sim & analytics).
 * caseMode: ringkas (kelas 15 menit) | lengkap (semua kartu).
 */
export function CasePanel({
  onNext,
  caseMode,
  onCaseModeChange,
}: {
  onNext: () => void;
  caseMode: CaseMode;
  onCaseModeChange: (m: CaseMode) => void;
}) {
  const ringkas = caseMode === "ringkas";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
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
        <div
          className="inline-flex rounded-[var(--radius-sm)] border border-border bg-elevated p-1"
          role="group"
          aria-label="Kepadatan materi kasus"
        >
          {(
            [
              ["ringkas", "Ringkas"],
              ["lengkap", "Lengkap"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onCaseModeChange(id)}
              className={cn(
                "min-h-9 rounded-[calc(var(--radius-sm)-2px)] px-3 text-xs font-medium",
                caseMode === id
                  ? "bg-primary text-primary-fg"
                  : "text-muted hover:text-fg",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {ringkas ? (
        <p className="rounded-[var(--radius-sm)] border border-dashed border-border bg-elevated px-3 py-2 text-xs text-muted leading-relaxed">
          Mode <strong className="text-fg">Ringkas</strong> (~15 menit): framing CPM vs PPM, tiga moda,
          denah, lalu lanjut Simulasi. Detail Owner/Builder, strategi cost–schedule, dan process map
          ada di mode Lengkap.
        </p>
      ) : null}

      {!ringkas ? (
        <>
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
                    Bahasa yang sering diajarkan:{" "}
                    <strong className="text-fg">scope · cost · quality · schedule</strong>. Owner
                    membuat target dan jadwal — &quot;apa&quot; dan &quot;kapan&quot; yang diinginkan
                    dari proyek.
                  </p>
                </div>
                <div className="rounded-[var(--radius-sm)] border border-border bg-surface p-3">
                  <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-fg">
                    <HardHat className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
                    Builder (supply)
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Bahasa produksi:{" "}
                    <strong className="text-fg">
                      product · process · capacity · inventory · variability
                    </strong>
                    . Builder merancang dan mengoperasikan <em>sistem produksi</em> yang harus
                    memenuhi demand owner.
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Selama ini pendidikan dan praktek lebih condong ke sisi owner. MP2K fokus ke sisi
                builder: bagaimana aliran di workface diatur agar TH, CT, WIP, dan fill rate terjaga —
                bukan hanya agar bar chart terlihat hijau.
              </p>
            </CardContent>
          </Card>

          <Card className="border-fg/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Schedule ≠ sistem produksi</CardTitle>
              <CardDescription>Dua hal yang sering disamakan — padahal beda peran</CardDescription>
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
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card className="border-fg/25 bg-elevated/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base leading-snug">
            CPM / bar chart vs PPM (Project Production Management)
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
                Urutan aktivitas, durasi, jalur kritis, dan target tanggal — tidak menjelaskan antrian,
                WIP, atau mengapa satu moda idle sementara moda lain menumpuk.
              </p>
            </div>
            <div className="rounded-[var(--radius-sm)] border border-border bg-surface p-3">
              <div className="mb-1.5 flex items-center gap-2 text-sm font-medium text-fg">
                <Workflow className="size-4 shrink-0 text-muted" strokeWidth={1.75} />
                PPM
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Proyek sebagai <strong className="text-fg">sistem produksi</strong>: TH, CT, WIP,
                utilisasi, dan fill rate. Menjelaskan macet di workface meski jadwal &quot;hijau&quot;.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <ModeCard
          icon={Hammer}
          mode="M"
          title="Manual di lokasi"
          item="Kolom beton"
          detail="Dibentuk dan dicor di lokasi. Variability proses tinggi."
          tone="m"
        />
        <ModeCard
          icon={Factory}
          mode="N"
          title="Near-site"
          item="Balok beton"
          detail="Yard dekat lokasi. Lead time menengah, mutu lebih terkendali."
          tone="n"
        />
        <ModeCard
          icon={Truck}
          mode="F"
          title="Far supply"
          item="Panel lantai"
          detail="Datang dari luar. Lead time panjang — inventory & FR kritis."
          tone="f"
        />
      </div>

      {!ringkas ? <CaseStrategies /> : null}

      {!ringkas ? (
        <Card className="border-fg/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notasi process map</CardTitle>
            <CardDescription>Operasi □ · Antrian △ · Stok ○</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-[var(--radius-sm)] border border-border bg-surface p-3 text-center">
                <p className="font-mono text-2xl text-fg">□</p>
                <p className="mt-1 text-sm font-medium text-fg">Operasi</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-border bg-surface p-3 text-center">
                <p className="font-mono text-2xl text-fg">△</p>
                <p className="mt-1 text-sm font-medium text-fg">Antrian</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-border bg-surface p-3 text-center">
                <p className="font-mono text-2xl text-fg">○</p>
                <p className="mt-1 text-sm font-medium text-fg">Stok</p>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Alur tipikal: <span className="font-mono text-fg">○ → △ → □ → △ → □</span>.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className={cn("grid gap-6", ringkas ? "" : "lg:grid-cols-[1fr_1fr]")}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Geometri & zonasi</CardTitle>
            <CardDescription>Grid 3×5 kolom · 2 lantai · 8 zona per lantai</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted leading-relaxed">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-fg">3 × 5 kolom</strong> → 15 kolom per lantai
              </li>
              <li>Urutan: kolom → balok → panel; tangga Z6 menunggu C3</li>
              <li>
                Gelombang: Z1+Z5 → Z2+Z6 → Z3+Z7 → Z4+Z8 · lalu L2 · lalu tangga
              </li>
            </ul>
          </CardContent>
        </Card>

        {!ringkas ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mengapa multi-moda rumit?</CardTitle>
              <CardDescription>Menyelaraskan tiga ritme di satu workface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted leading-relaxed">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>WIP menumpuk di satu moda, moda lain menganggur</li>
                <li>Utilisasi tinggi di bottleneck → CT meledak (Kingman)</li>
                <li>Panel terlambat → fill rate turun</li>
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Denah dan elevasi</CardTitle>
          <CardDescription>Pratinjau geometri — zona, moda, gelombang</CardDescription>
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
                <span className="text-fg">1–2.</span> Product & Process design{" "}
                <span className="text-faint">(tetap di Kasus)</span>
              </li>
              <li>
                <span className="text-fg">3–5.</span> Capacity · Inventory · Variability{" "}
                <span className="text-faint">(hidup di DES)</span>
              </li>
            </ol>
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
                  <strong className="text-fg">Simulasi</strong> — DES: C · V · I
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="default">3</Badge>
                <span>
                  <strong className="text-fg">Analitik</strong> — kurva + CONWIP
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
  tone,
}: {
  icon: typeof Hammer;
  mode: string;
  title: string;
  item: string;
  detail: string;
  tone: "m" | "n" | "f";
}) {
  const border =
    tone === "m" ? "border-mode-m/40" : tone === "n" ? "border-mode-n/40" : "border-mode-f/40";
  const badge =
    tone === "m" ? "bg-mode-m text-white" : tone === "n" ? "bg-mode-n text-white" : "bg-mode-f text-white";
  return (
    <Card className={cn("border-2", border)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <Icon className="size-5 text-fg" strokeWidth={1.5} />
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", badge)}>
            {mode}
          </span>
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
