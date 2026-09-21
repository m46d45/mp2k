# TEACHING.md — Panduan dosen MP2K

Lab virtual **Multi-Moda Produksi Proyek Konstruksi** untuk kelas PPM / sains operasi.
Situs: [https://mp2k.vercel.app/](https://mp2k.vercel.app/)

Mahasiswa **tidak perlu akun**. Semua progres Pengenalan & lembar kerja tersimpan di peramban lokal.

---

## 1. Deep link (bagikan ke kelas)

| Tujuan | Contoh URL |
|--------|------------|
| Pengenalan · Little | `/?door=intro&curve=little` |
| Pengenalan · CONWIP | `/?door=intro&curve=control` |
| Kasus ringkas | `/?door=lab&step=case&case=ringkas` |
| Simulasi · Variability tinggi | `/?door=lab&step=sim&preset=var_tinggi` |
| Simulasi · CONWIP ketat | `/?door=lab&step=sim&preset=conwip_ketat` |
| Analitik | `/?door=lab&step=analytics` |
| Lembar kerja | `/?step=worksheet` |
| Manual | `/?step=manual` |

Preset id: `dasar` · `var_tinggi` · `inv_ketat` · `cap_longgar` · `wip_bebas` · `conwip_ketat`.

---

## 2. Skrip waktu

### 45 menit (demo + 2 preset)

1. **5′** — Framing CPM vs PPM (mode Kasus **Ringkas**).
2. **10′** — Pengenalan: Little + Kingman (satu skenario if–then masing-masing).
3. **15′** — Simulasi: preset **Dasar** lalu **Variability tinggi**; catat TH/CT/WIP/FR.
4. **10′** — Analitik (otomatis terisi); bahas Δ Kingman.
5. **5′** — Kunci: “Δ besar sering wajar — multi-moda ≠ bottleneck murni.”

### 90 menit (latihan penuh)

1. **20′** Pengenalan (semua modul singkat; biarkan progres tersimpan).
2. **15′** Kasus **Lengkap** atau Ringkas + strategi konseptual (ingat: strategi ≠ DES).
3. **35′** Enam preset + lembar kerja (salin teks di akhir).
4. **20′** Analitik + diskusi “mengapa oranye tidak nempel.”

### 180 menit / dua pertemuan

- Pertemuan 1: Pengenalan + Kasus + Dasar/Var/Inv.
- Pertemuan 2: Capacity + WIP bebas vs CONWIP ketat + Analitik + pengumpulan lembar kerja.

---

## 3. Kunci rentang (seed 42, Run all)

Angka di bawah adalah **rentang tipikal** (bukan jawaban tunggal). Engine diuji lewat `npm run verify:des`.

| Preset | TH (job/hari) | CT (hari) | WIP | FR | T (hari) | Catatan fasilitasi |
|--------|---------------|-----------|-----|-----|----------|--------------------|
| **Dasar** | 5.5–8.5 | 0.28–0.48 | 1.8–3.5 | 5–20% | 14–22 | FR panel sering rendah → diskusi Inventory |
| **Variability tinggi** | 6.5–9.5 | 0.28–0.50 | 2.2–4.0 | 8–25% | 12–20 | ū panel naik; Δ Kingman membesar |
| **Inventory ketat** | 4.2–7.0 | 0.28–0.50 | 1.4–3.0 | 10–35% | 17–28 | T naik, TH turun vs Dasar |
| **Capacity longgar** | 12–20 | 0.18–0.35 | 3.0–5.5 | 1–10% | 5–11 | T jauh lebih pendek |
| **WIP bebas** | ≈ Dasar | ≈ Dasar | ≈ Dasar | ≈ Dasar | ≈ Dasar | CONWIP=40 tidak mengikat; mirip Dasar |
| **CONWIP ketat** | 4.5–7.2 | 0.28–0.50 | 1.4–3.0 | 20–55% | 16–28 | TH turun vs WIP bebas; jejak WIP cenderung menempel plafon |

**Yang sering “salah paham”**

1. **WIP bebas ≈ Dasar** — karena CONWIP default (12) sudah di atas WIP aktual (~2–3). Control baru terasa di CONWIP ketat (=4).
2. **Δ Kingman besar** — CT sistem DES merata-ratakan M/N/F/tangga; Kingman fokus resource bottleneck. Itu **wajar**.
3. **FR rendah di Dasar** — kesempatan mengajar buffer / L / CONWIP, bukan bug.
4. **Strategi Tradisional/Hibrid/Industri** di Kasus = indeks konseptual 1–5; **tidak** mengubah DES.

---

## 4. Pengumpulan tugas

1. Mahasiswa buka **Lembar kerja**, isi nama/kelompok + catatan per preset + 5–7 kalimat Δ.
2. **Salin jawaban** → tempel ke LMS / email.
3. Opsional: di Simulasi, **Ekspor CSV/JSON** setelah tiap Run all.

Label cohort di halaman Statistik hanya di perangkat dosen (catatan lokal), tidak mengubah DB.

---

## 5. Statistik & infrastruktur

- Statistik = pengunjung unik + kunjungan + simulasi selesai (anonim, `localStorage` visitor id).
- Deploy Vercel + `DATABASE_URL` (Neon) → statistik persisten.
- Tanpa Neon (PGLite) → statistik hilang saat proses server restart.
- **Tidak perlu login** untuk lab. Scaffold auth template tidak dipakai fitur kelas.
- Regresi numerik: `npm run verify:des` (harus exit 0 sebelum release kelas).

---

## 6. Rubrik singkat (opsional)

| Aspek | Cukup | Baik |
|-------|-------|------|
| Data preset | Mencatat ≥3 metrik | Bandingkan ke Dasar dengan arah yang benar |
| Little | Menyebut WIP≈TH×CT | Menjelaskan bila Δ besar (transient) |
| Kingman | Menyebut ū × V | Menjelaskan multi-moda vs bottleneck |
| Control | Membedakan WIP bebas vs ketat | Menghubungkan ke W0 / Wopt |
| Written Δ | 3–4 kalimat generik | 5–7 kalimat spesifik run mereka |

---

## 7. Checklist 5 menit sebelum kelas

- [ ] Buka situs live / deploy terbaru
- [ ] Proyektor: warna M (amber) / N (biru) / F (teal) terbaca
- [ ] Siapkan 2–3 deep link di slide
- [ ] Ingatkan: Run all sampai selesai; seed 42
- [ ] Tunjukkan Lembar kerja + Salin
