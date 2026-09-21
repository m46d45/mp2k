/**
 * Regression check: DES presets stay within classroom expected ranges.
 * Usage: node scripts/verify-des-presets.mjs
 */
import { createServer } from "vite";

const server = await createServer({
  configFile: "vite.config.ts",
  server: { middlewareMode: true },
  appType: "custom",
});

let failed = 0;
try {
  const { verifyAllPresets } = await server.ssrLoadModule(
    "/src/lib/mp2k/des/expected-ranges.ts",
  );
  const results = verifyAllPresets();
  for (const r of results) {
    if (r.ok) {
      const m = r.metrics;
      console.log(
        `OK  ${r.id.padEnd(14)} TH=${m.th.toFixed(3)} CT=${m.avgCt.toFixed(3)} WIP=${m.avgWip.toFixed(3)} FR=${m.fillRate.toFixed(3)} T=${m.simTime.toFixed(2)}`,
      );
    } else {
      failed++;
      console.error(`FAIL ${r.id}`);
      for (const f of r.failures) console.error(`     ${f}`);
    }
  }
} finally {
  await server.close();
}

if (failed > 0) {
  console.error(`\n${failed} preset(s) outside expected ranges.`);
  process.exit(1);
}
console.log("\nAll presets within expected ranges.");
