# MP2K — Multi-Moda Produksi Proyek Konstruksi

**Situs live:** [https://mp2k.vercel.app/](https://mp2k.vercel.app/)

Pengelolaan produksi proyek konstruksi multi-moda (**PPM**) dan sains operasi. Alur: Pengenalan → Kasus → Simulasi DES → Analitik.

| Langkah | Fokus |
|--------|--------|
| **0. Pengenalan** | 4 verbs · 5 levers · buffer · Little · Kingman · CT vs WIP · Inventory/FR · Control |
| **1. Kasus** | Product & process design (sudah ditetapkan) |
| **2. Simulasi** | DES pada 3 tuas: Capacity · Variability · Inventory |
| **3. Analitik** | Kurva + marker DES · Kurva gabungan & CONWIP |

Konsep diilhami **Project Production Institute (PPI)** dan Factory Physics (Little, Kingman/VUT, base-stock inventory).

---

## 1. Tujuan

Di MP2K dikerjakan:

1. Membandingkan **CPM / bar chart** dengan **PPM** (aliran, antrian, stok).
2. Mengenali **tiga moda produksi** dalam satu sistem: manual (M), near-site (N), far-supply (F).
3. Mengoperasikan **tiga tuas** Capacity, Variability, Inventory lewat DES.
4. Membaca **tiga kurva PPI** (CT vs ū / Kingman, TH vs WIP, **CT vs WIP**), **Little’s Law**, **fill rate vs inventory**, dan **Control/CONWIP**, serta membandingkan empiris DES dengan prediksi teori.
5. Menjelaskan mengapa angka DES dan teori bisa berbeda (multi-moda, urutan tangga, fase awal run, buffer diskrit).

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
| **M — Manual di lokasi** | Kolom beton bertulang | Dikerjakan di workface; butuh kapasitas kru |
| **N — Near-site (dekat lokasi)** | Balok beton | Diproduksi dekat lokasi, lalu diangkat; buffer/lead time relatif pendek |
| **F — Far-supply** | Panel lantai | Datang dari luar ("sudah tinggal pasang"); lead time L & buffer stok menentukan fill rate |

Urutan workface harus **match**: kolom → balok (bertumpu minimal dua kolom) → panel (bertumpu pada balok). Tangga Z6 menunggu kolom C3 + balok terkait selesai.

### Lima tuas PPM

- **Product design** & **Process design** → sudah ditetapkan di langkah Kasus (tidak diubah di DES).
- **Capacity**, **Variability**, **Inventory** → yang disimulasikan dan dianalisis.

---

## 3. Cara memakai

### Langkah 0 — Pengenalan

Modul teori interaktif (satu sistem demo: T0=4, rb=2, W0=8, V=0,5, Wopt≈14):

1. **Little's Law** — WIP = TH × CT.
2. **Kingman** — CT vs utilisasi; V memperparah antrian.
3. **CT vs WIP** — kurva ketiga PPI; acuan W0 dan Wopt.
4. **Inventory & Fill Rate** — stock buffer vs layanan.
5. **Control & CONWIP** — kebijakan batas WIP dari kurva operating.

### Langkah 1 — Kasus

- Baca kartu **CPM vs PPM**.
- Lihat denah/elevasi, moda M/N/F, dan urutan zona.
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
5. Buka **Glosarium** jika istilah belum familiar.

**Cara membaca Δ**

- **Little:** Δ kecil → sistem relatif stabil (`WIP ≈ TH × CT`). Δ besar → perpanjang run / abaikan fase transient awal.
- **Kingman:** Δ besar sering **wajar** — DES merata-ratakan semua moda; Kingman fokus resource bottleneck saja.
- **FR:** Δ mengarah ke buffer, lead time L, atau CONWIP; coba longgarkan di Simulasi lalu Run ulang.

### Langkah 3 — Analitik

1. Strip **Titik operasi DES** (varian penuh) menampilkan angka yang sama dengan notasi/warna di kurva.
2. Opsional: **Isi dari DES** — menyalin bottleneck, TH, ca/ce, L, CONWIP dari run ke parameter Analitik.
3. **Mulai perhitungan** → empat grafik:
   - **Little’s Law (WIP–TH–CT)** — sumbu X = WIP; kiri TH; kanan CT. Titik biru/merah = prediksi parameter; **oranye = DES**.
   - **Kingman multi-V** — CT/te vs ū untuk beberapa tingkat V. Titik hitam = Analitik; **oranye = ū bottleneck & CT/te DES**.
   - **Inventory / Fill rate** — FR vs inventory (base-stock ideal). **Oranye = FR empiris DES**.
   - **Kurva gabungan & CONWIP** — TH dan CT vs WIP; W0, Wopt, garis CONWIP; **absolute benchmarking** vs envelope teoritis.
4. Diskusikan selisih marker oranye vs prediksi teori (lihat kotak “Mengapa angka DES bisa berbeda dari teori?” di strip).

### Statistik

Tombol **Statistik** menampilkan jumlah pengunjung unik, kunjungan, dan simulasi DES yang selesai. Identitas acak disimpan di peramban (tanpa nama). Kunjungan dihitung ulang setelah 30 menit tidak aktif.

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
| **W0** | Critical WIP (= rb × T0) | job |
| **Wopt** | WIP praktis ≈ W0(1+√V) | job |

**Little:** $\mathrm{WIP} = \mathrm{TH} \times \mathrm{CT}$ (sistem stabil).  
**Kingman:** $\mathrm{CT}/t_e \approx 1 + V \cdot \bar{u}/(1-\bar{u})$.  
**CT vs WIP (best):** CT = T0 jika WIP ≤ W0; CT = WIP/rb jika WIP > W0.  
**FR:** mendekati $1 -$ (stockout / percobaan ambil stok) di DES; teori = model base-stock.

---

## 5. Saran latihan (30–90 menit)

1. **Dasar** — preset Dasar, Run all. Catat TH, CT, WIP, FR, ū. Cek konsistensi Little.
2. **Variability tinggi** — preset yang sama. Apa yang terjadi pada CT dan Δ Kingman?
3. **Inventory ketat** — preset Inventory ketat. Amati stockout & FR; longgarkan buffer/L sekali, Run ulang, bandingkan marker FR di Analitik.
4. **Capacity** — preset Capacity longgar vs Dasar. Apakah TH naik proporsional? Di mana bottleneck bergeser?
5. **CONWIP** — di Control / Kurva gabungan, tetapkan CONWIP di W0, Wopt, dan di atas Wopt; amati TH vs CT.
6. **Sinkronisasi** — Isi dari DES → Mulai perhitungan. Jelaskan dalam 5–7 kalimat mengapa titik oranye tidak selalu menempel prediksi tertutup.

---

## 6. Batasan model (penting untuk diskusi)

- Frame 2 lantai, grid tetap, urutan zona & tangga disederhanakan.
- Hasil DES dapat diulang dengan seed yang sama; run pendek masih membawa bias fase awal.
- Prediksi teori memakai pendekatan bottleneck tunggal dan model base-stock.
- Skor match visual **bukan** metrik produksi; fokus pada TH, CT, WIP, FR, ū.

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
Tidak wajib `DATABASE_URL` (PGLite fallback).

---

## Lisensi & sumber konsep

Konsep PPM / sains operasi terinspirasi **Project Production Institute (PPI)** dan literatur Factory Physics (Little, Kingman/VUT, inventory fill rate).
