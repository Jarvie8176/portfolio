// Adversarial: the HD object 404s. The control must not end up claiming a tier
// the viewer is not showing, and the standard view must survive.
import { chromium } from "playwright";

const base = process.env.BASE ?? "http://127.0.0.1:4321";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.slice(0, 120)}`));

await page.route("**/panoramas/*-11904.jpg", (route) => route.abort("failed"));

await page.goto(`${base}/projects/trailwalk/`, { waitUntil: "domcontentloaded" });
await page.waitForSelector("[data-trailwalk-gallery]");
await page.click('[data-trailwalk-id="kauzmann-ridge"]');
await page.waitForFunction(
  () => document.querySelector("[data-trailwalk-viewer-shell]").dataset.viewerReady === "true",
  { timeout: 45000 },
);

const read = () =>
  page.evaluate(() => {
    const hd = document.querySelector("[data-trailwalk-hd-toggle]");
    const shell = document.querySelector("[data-trailwalk-viewer-shell]");
    return {
      hdPressed: hd.getAttribute("aria-pressed"),
      hdDisabled: hd.disabled,
      hdAria: hd.getAttribute("aria-label"),
      viewerReady: shell.dataset.viewerReady,
      status: document.querySelector("[data-trailwalk-status]").textContent.trim(),
      canvas: !!document.querySelector("[data-trailwalk-viewer] canvas"),
    };
  });

console.log("before press:", JSON.stringify(await read()));

await page.click("[data-trailwalk-hd-toggle]");
console.log("immediately after press:", JSON.stringify(await read()));

await page.waitForFunction(
  () => !document.querySelector("[data-trailwalk-hd-toggle]").disabled,
  { timeout: 60000 },
);
const after = await read();
console.log("after failure settled:", JSON.stringify(after));

const checks = {
  "control reverted to off": after.hdPressed === "false",
  "control usable again": after.hdDisabled === false,
  "viewer still ready": after.viewerReady === "true",
  "canvas still present": after.canvas === true,
  "failure explained": after.status.length > 0,
  "no uncaught page errors": errors.length === 0,
};
console.log("\nchecks:");
for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? "PASS" : "FAIL"}  ${k}`);
if (errors.length) console.log("errors:", errors);

await browser.close();
process.exit(Object.values(checks).every(Boolean) ? 0 : 1);
