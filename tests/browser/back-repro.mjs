// The gap under test is Back pressed while the viewer's JS chunks are still
// loading — before `new Viewer(...)` exists for `destroyViewer()` to destroy.
// Delaying the panorama fetch tests the wrong window: by then the viewer is
// built and destroy() does cancel it.
import { chromium } from "playwright";
const base = process.env.BASE ?? "http://127.0.0.1:4321";
const browser = await chromium.launch({ args: ["--no-sandbox"] });

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const panoramaRequests = [];
let chunkHeld = false;

page.on("response", (r) => {
  if (/panoramas\//.test(r.url())) panoramaRequests.push(r.url().split("/").pop());
});

// Hold the Photo Sphere Viewer chunk so Back lands inside the import await.
await page.route("**/_astro/core.*.js", async (route) => {
  chunkHeld = true;
  await new Promise((r) => setTimeout(r, 5000));
  route.continue();
});

await page.goto(`${base}/projects/trailwalk/`, { waitUntil: "domcontentloaded" });
await page.waitForSelector("[data-trailwalk-gallery]");
await page.click('[data-trailwalk-id="kauzmann-ridge"]');
await page.waitForFunction(() => true);
// Wait until the chunk request is genuinely in flight, then leave.
const t0 = Date.now();
while (!chunkHeld && Date.now() - t0 < 10000) await page.waitForTimeout(50);
console.log(`viewer chunk in flight: ${chunkHeld}`);
await page.click("[data-trailwalk-back]");
console.log("pressed Back while the chunk was still loading");

await page.waitForTimeout(12000);
const after = await page.evaluate(() => {
  const shell = document.querySelector("[data-trailwalk-viewer-shell]");
  return {
    shellHidden: shell.hidden,
    viewerReady: shell.dataset.viewerReady,
    canvasInHiddenShell: !!document.querySelector("[data-trailwalk-viewer] canvas"),
    status: document.querySelector("[data-trailwalk-status]").textContent.trim(),
  };
});
console.log(`panorama requests after leaving: ${JSON.stringify(panoramaRequests)}`);
console.log(`state 12s after Back: ${JSON.stringify(after)}`);
const leaked = after.viewerReady === "true" || after.canvasInHiddenShell || panoramaRequests.length > 0;
console.log(`\n>> work continued after Back: ${leaked ? "YES" : "no"}`);
await browser.close();
process.exit(leaked ? 1 : 0);
