# MP2K — Multi-Moda Produksi Proyek Konstruksi

**Situs live:** [https://mp2k.vercel.app/](https://mp2k.vercel.app/)  
**Model:** didaktik (lab magister, bukan digital twin proyek nyata)

Lab interaktif untuk pengenalan **Project Production Management (PPM)** / Operations Science pada sistem produksi konstruksi multi-moda. Alur belajar mengikuti tiga langkah:

| Langkah | Fokus |
|--------|--------|
| **1. Kasus** | Product & process design (sudah ditetapkan) |
| **2. Simulasi** | DES pada 3 tuas: Capacity · Variability · Inventory |
| **3. Analitik** | Tiga kurva OS + marker titik operasi DES |

Konsep diilhami **Project Production Institute (PPI)** dan Factory Physics (Little, Kingman/VUT, base-stock inventory).

---

## 1. Tujuan pembelajaran

Setelah memakai lab ini, mahasiswa diharapkan mampu:

1. Membedakan **CPM/scheduling** vs **PPM/operations science** (aliran, antrian, stok).
2. Mengenali **tiga moda produksi** dalam satu sistem: manual (M), near-site/offsite dekat (N), far-supply (F).
3. Mengoperasikan **tiga tuas terakhir PPM** (Capacity, Variability, Inventory) lewat DES.
4. Membaca **Little’s Law**, **Kingman (VUT)**, dan **fill rate vs inventory**, serta membandingkan empiris DES dengan prediksi teori.
5. Menjelaskan mengapa angka DES dan teori bisa berbeda (multi-moda, gate urutan, transient, buffer diskrit).

---

## 2. Kasus: frame beton 2 lantai

### Geometri & zonasi

- Grid kolom **3 × 5** (tiga ke samping, lima ke arah memanjang).
- **2 lantai**; fondasi & sloof diasumsikan sudah siap.
- Kerja per **zona** dengan urutan gelombang berpasangan, misalnya Z1+Z5 → Z2+Z6 → …
- **Tangga** hanya di lantai 1 zona Z6 (manual); di L1 Z6 hanya 2 panel (satu slot tangga), di L2 Z6 tiga panel.

### Tiga moda produksi

| Moda | Elemen | Karakter |
|------|--------|----------|
| **M — Manual (onsite)** | Kolom beton bertulang | Dikerjakan di workface; butuh kapasitas crew onsite |
| **N — Near-site / offsite dekat** | Balok beton | Diproduksi dekat lokasi, lalu diangkat; buffer/lead relatif pendek |
| **F — Far-supply** | Panel lantai | Datang dari luar ("sudah tinggal pasang"); lead time L & buffer stok menentukan fill rate |

Urutan workface harus **match**: kolom → balok (bertumpu minimal dua kolom) → panel (bertumpu pada balok). Tangga Z6 menunggu kolom C3 + balok terkait selesai.

### Lima tuas PPM di lab ini

- **Product design** & **Process design** → sudah ditetapkan di langkah Kasus (tidak diubah di DES).
- **Capacity**, **Variability**, **Inventory** → yang disimulasikan dan dianalisis.

---

## 3. Cara memakai situs

### Langkah 1 — Kasus

- Baca kartu **CPM vs PPM** dan tujuan lab.
- Pahami denah/elevasi, moda M/N/F, dan batasan urutan zona.
- Tidak ada parameter yang diubah di sini; ini menetapkan sistem yang akan disimulasikan.

### Langkah 2 — Simulasi (DES)

1. Pilih **preset eksperimen** (atau atur tuas manual):
   - **Dasar** — kondisi referensi seimbang.
   - **Variability tinggi** — ca/ce besar → antrian & CT naik.
   - **Inventory ketat** — buffer/L/CONWIP ketat → risiko stockout panel, FR turun.
   - **Capacity longgar** — m lebih besar / te lebih kecil → utilisasi turun, CT cenderung membaik.
2. Baca **pertanyaan/hint** di bawah preset (panduan diskusi).
3. Tekan **Run all** (jalankan DES sampai selesai atau sesuai kontrol).
4. Amati:
   - Progress instalasi (kolom, balok, panel, zona).
   - **Strip titik operasi DES** (TH, CT, WIP, FR, ū bottleneck).
   - Tabel **Banding DES ↔ teori** (Little WIP, Kingman CT bottleneck, FR panel) beserta **Δ** dan catatan.
5. Buka **Glossarium** jika istilah belum familiar.

**Cara membaca Δ**

- **Little:** Δ kecil → sistem relatif stabil (`WIP ≈ TH × CT`). Δ besar → perpanjang run / abaikan fase transient awal.
- **Kingman:** Δ besar sering **wajar** — DES merata-ratakan semua moda; Kingman fokus resource bottleneck saja.
- **FR:** Δ mengarah ke buffer, lead time L, atau CONWIP; coba longgarkan di Simulasi lalu Run ulang.

### Langkah 3 — Analitik

1. Strip **Titik operasi DES** (varian penuh) menampilkan angka yang sama dengan notasi/warna di kurva.
2. Opsional: **Isi dari DES** — menyalin bottleneck, TH, ca/ce, L, CONWIP dari run ke parameter Analitik.
3. **Mulai perhitungan** → tiga grafik:
   - **Little’s Law (WIP–TH–CT)** — sumbu X = WIP; kiri TH; kanan CT. Titik biru/merah = prediksi parameter; **oranye = DES**.
   - **Kingman multi-V** — CT/te vs ū untuk beberapa tingkat V. Titik hitam = Analitik; **oranye = ū bottleneck & CT/te DES**.
   - **Inventory / Fill rate** — FR vs inventory (base-stock ideal). **Oranye = FR empiris DES**.
4. Diskusikan selisih marker oranye vs prediksi teori (lihat kotak “Mengapa angka DES bisa berbeda dari teori?” di strip).

---

## 4. Notasi singkat

| Simbol | Arti | Satuan tipikal |
|--------|------|----------------|
| **TH** | Throughput | job/hari |
| **CT** | Cycle time | hari |
| **WIP** | Work-in-process | job |
| **ū** | Utilisasi resource | 0–1 (atau %) |
| **te** | Waktu proses efektif | hari/job |
| **m** | Jumlah resource paralel | — |
| **ca, ce** | CV kedatangan & proses | — |
| **V** | $(c_a^2 + c_e^2)/2$ | — |
| **FR** | Fill rate (panel) | 0–1 (atau %) |
| **L** | Lead time supply panel | hari |
| **CONWIP** | Batas WIP sistem | job |

**Little:** $\mathrm{WIP} = \mathrm{TH} \times \mathrm{CT}$ (sistem stabil).  
**Kingman (bentuk ajar):** $\mathrm{CT}/t_e \approx 1 + V \cdot \bar{u}/(1-\bar{u})$.  
**FR:** mendekati $1 -$ (stockout / percobaan ambil stok) di DES; teori = model base-stock.

---

## 5. Saran latihan lab (30–90 menit)

1. **Baseline** — preset Dasar, Run all. Catat TH, CT, WIP, FR, ū. Cek konsistensi Little.
2. **Shock variability** — preset Variability tinggi. Apa yang terjadi pada CT dan Δ Kingman?
3. **Inventory ketat** — preset Inventory ketat. Amati stockout & FR; longgarkan buffer/L sekali, Run ulang, bandingkan marker FR di Analitik.
4. **Capacity** — preset Capacity longgar vs Dasar. Apakah TH naik proporsional? Di mana bottleneck bergeser?
5. **Sinkronisasi** — Isi dari DES → Mulai perhitungan. Jelaskan dalam 5–7 kalimat mengapa titik oranye tidak selalu menempel prediksi tertutup.

---

## 6. Batasan model (penting untuk diskusi)

- Frame 2 lantai, grid tetap, urutan zona & tangga disederhanakan.
- DES seedable; run pendek masih membawa bias transient.
- Prediksi teori = pendekatan ajar (bottleneck tunggal + base-stock), **bukan** digital twin.
- Match score visual di UI **bukan** metrik operations science; fokus pada TH, CT, WIP, FR, ū.

---

## 7. Pengembangan lokal & deploy

### Stack

- React 19 · TypeScript · Vite · TanStack Start/Router
- Tailwind CSS v4 · Zustand · Recharts
- Deploy: **Vercel**

### Development

```bash
npm install
npm run dev      # http://localhost:8080
npm run typecheck
npm run build
```

### Deploy (Vercel)

Hubungkan repo GitHub ke Vercel (Import Project), atau:

```bash
npx vercel --prod
```

Build: `npm run build`.  
Tidak wajib `DATABASE_URL` untuk lab edukasi (PGLite fallback).

---

## Lisensi & sumber konsep

Demo edukasi. Konsep PPM / operations science terinspirasi **Project Production Institute (PPI)** dan literatur Factory Physics (Little, Kingman/VUT, inventory fill rate).
