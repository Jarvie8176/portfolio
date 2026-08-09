// Parameterised over the deployed payload rather than a hand-written list of
// sample names: the previous suite named four samples and silently stopped
// covering the data when a fifth was added.
import { chromium, devices } from "playwright";
const base = process.env.BASE ?? "http://127.0.0.1:4321";
const browser = await chromium.launch({ args: ["--no-sandbox"] });

const discover = async () => {
  const p = await browser.newPage();
  await p.goto(`${base}/projects/trailwalk/`, { waitUntil: "domcontentloaded" });
  const ids = await p.evaluate(() =>
    JSON.parse(document.querySelector("[data-trailwalk-gallery-data]").textContent).map((i) => i.id));
  await p.close();
  return ids;
};

const run = async (ids, label, makeCtx) => {
  let bad = 0;
  console.log(`\n${label}`);
  for (const id of ids) {
    const ctx = await makeCtx();
    const p = ctx.newPage ? await ctx.newPage() : ctx;
    await p.goto(`${base}/projects/trailwalk/`, { waitUntil: "domcontentloaded" });
    await p.waitForSelector("[data-trailwalk-card]");
    await p.click(`[data-trailwalk-id="${id}"]`);
    const ok = await p.waitForFunction(
      () => document.querySelector("[data-trailwalk-viewer-shell]").dataset.viewerReady === "true"
        && !!document.querySelector("[data-trailwalk-viewer] canvas"),
      { timeout: 60000 }).then(() => true).catch(() => false);
    const st = await p.evaluate(() => document.querySelector("[data-trailwalk-status]").textContent.trim());
    if (!ok || st) bad += 1;
    console.log(`  ${ok && !st ? "PASS" : "FAIL"}  ${id}${st ? "  " + st : ""}`);
    await (ctx.close ? ctx.close() : p.close());
  }
  return bad;
};

const ids = await discover();
console.log(`samples discovered from the deployed payload: ${ids.length} — ${ids.join(", ")}`);
let bad = await run(ids, "desktop 1440x900", () => browser.newPage({ viewport: { width: 1440, height: 900 } }));
bad += await run(ids, "iPhone 13 profile", () => browser.newContext({ ...devices["iPhone 13"] }));
console.log(`\ntotal failures: ${bad}`);
await browser.close();
process.exit(bad ? 1 : 0);
