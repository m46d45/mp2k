# MP2K — Multi-Moda Produksi Proyek Konstruksi

Lab edukasi **Project Production Management (PPM)** untuk proyek konstruksi multi-moda:

1. **Kasus** — product & process design (frame beton 3×5, 2 lantai, 3 moda M/N/F)
2. **Simulasi DES** — discrete event simulation pada 3 tuas: **Capacity · Variability · Inventory**
3. **Analitik** — tiga kurva Operations Science: Little's Law (WIP–TH–CT), Kingman multi-V, Inventory/Fill Rate

## Stack

- React 19 · TypeScript · Vite · TanStack Start/Router
- Tailwind CSS v4 · Zustand · Recharts
- Deploy target: **Vercel** (Nitro `vercel` preset)

## Development

```bash
npm install
npm run dev      # http://localhost:8080
npm run typecheck
npm run build
```

## Deploy (Vercel)

Connect this GitHub repo to Vercel (Import Project), or:

```bash
npx vercel --prod
```

Build command: `npm run build`  
No `DATABASE_URL` required for the educational app (PGLite fallback skips remote migrate).

## License

Educational demo · Project Production Management concepts inspired by PPI / Factory Physics.
