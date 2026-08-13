import { DesOperatingStrip, useDesOperatingPoint } from "@/components/mp2k/des-operating-strip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OpsPanel() {
  const desPoint = useDesOperatingPoint();
  return (
    <div className="space-y-5">
      <DesOperatingStrip variant="full" />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analitik Operations Science</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted leading-relaxed">
          <p>
            Strip di atas menampilkan <strong className="text-fg">titik operasi empiris DES</strong>{
              " "
            }
            dengan notasi & warna yang sama dengan kurva Little / Kingman / Inventory. Penjelasan
            detail tiap metrik (TH, CT, WIP, FR, ū) dan alur DES → hukum → kurva ada di strip.
          </p>
          <p>
            <strong className="text-fg">Alur ajar:</strong> (1) Run DES di Simulasi → (2) baca strip
            & tabel Banding DES ↔ teori → (3) diskusikan mengapa angka bisa berbeda (multi-moda,
            gate tangga Z6, transient, buffer diskrit vs base-stock ideal).
          </p>
          {desPoint.ready ? (
            <p className="rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2 font-mono text-xs text-fg">
              TH={desPoint.th.toFixed(2)} job/hari · CT={desPoint.ct.toFixed(2)} hari · WIP=
              {desPoint.wip.toFixed(2)} · FR={(desPoint.fillRate * 100).toFixed(0)}% · ū_bot=
              {(desPoint.utilBot * 100).toFixed(0)}% ({desPoint.bottleneck})
            </p>
          ) : (
            <p>Jalankan DES (Run all) di langkah Simulasi terlebih dahulu agar strip terisi.</p>
          )}
          <p className="text-xs text-faint">
            Panel kurva interaktif (Little WIP–TH–CT, Kingman multi-V, FR vs inventory) dengan marker
            oranye sedang dipulihkan. Sementara ini gunakan strip + tabel banding di Simulasi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
