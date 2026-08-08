/** Seeded PRNG (mulberry32) + sampling helpers for DES variability */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box-Muller normal(0,1) */
export function randn(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Sample positive process time with mean te and CV ≈ ce.
 * Uses lognormal when ce > 0.
 */
export function sampleProcessTime(te: number, ce: number, rng: () => number): number {
  const mean = Math.max(te, 1e-6);
  if (ce <= 1e-6) return mean;
  // lognormal: E[X]=exp(μ+σ²/2)=mean, CV≈sqrt(exp(σ²)-1) ≈ ce
  const cv = Math.max(ce, 0);
  const sigma2 = Math.log(1 + cv * cv);
  const sigma = Math.sqrt(sigma2);
  const mu = Math.log(mean) - sigma2 / 2;
  return Math.max(mean * 0.05, Math.exp(mu + sigma * randn(rng)));
}

/** Inter-arrival / release noise with CV ca around mean */
export function sampleInterarrival(mean: number, ca: number, rng: () => number): number {
  return sampleProcessTime(mean, ca, rng);
}
