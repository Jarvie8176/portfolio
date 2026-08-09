import { chromium } from "playwright";

const base = process.env.BASE ?? "http://127.0.0.1:4321";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const panoramaRequests = [];
const pageErrors = [];
page.on("request", (r) => {
  if (/\/panoramas\//.test(r.url())) panoramaRequests.push(r.url().split("/").pop());
});
page.on("pageerror", (e) => pageErrors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") pageErrors.push(`console: ${m.text().slice(0, 120)}`);
});

await page.goto(`${base}/projects/trailwalk/`, { waitUntil: "domcontentloaded" });
await page.waitForSelector("[data-trailwalk-gallery]");

const state = async (label) => {
  const s = await page.evaluate(() => {
    const panel = document.querySelector("[data-trailwalk-details-panel]");
    const hd = document.querySelector("[data-trailwalk-hd-toggle]");
    const det = document.querySelector("[data-trailwalk-details-toggle]");
    const shell = document.querySelector("[data-trailwalk-viewer-shell]");
    const status = document.querySelector("[data-trailwalk-status]");
    return {
      detailsHidden: panel.hidden,
      detailsExpanded: det.getAttribute("aria-expanded"),
      hdPressed: hd.getAttribute("aria-pressed"),
      hdDisabled: hd.disabled,
      hdText: hd.textContent.replace(/\s+/g, " ").trim(),
      hdAria: hd.getAttribute("aria-label"),
      viewerReady: shell.dataset.viewerReady,
      status: status.textContent.trim(),
      rows: [...(panel.querySelectorAll("dt") ?? [])].map((dt) => dt.textContent),
      mapLink: panel.querySelector(".trailwalk-viewer__map-link")?.textContent.trim(),
      mapHref: panel.querySelector(".trailwalk-viewer__map-link")?.getAttribute("href"),
    };
  });
  console.log(`\n--- ${label}`);
  for (const [k, v] of Object.entries(s)) console.log(`    ${k}: ${JSON.stringify(v)}`);
  return s;
};

await page.click('[data-trailwalk-id="cartreau-panorama"]');
await state("immediately after selecting cartreau-panorama");

await page
  .waitForFunction(
    () =>
      document.querySelector("[data-trailwalk-viewer-shell]").dataset.viewerReady === "true",
    { timeout: 45000 },
  )
  .catch(() => console.log("\n!! viewer never reported ready"));
await state("after the standard panorama resolved");

console.log(`\npanorama requests so far: ${JSON.stringify(panoramaRequests)}`);

await page.click("[data-trailwalk-hd-toggle]");
await page.waitForTimeout(300);
await state("right after pressing HD");

await page.waitForFunction(
  () => !document.querySelector("[data-trailwalk-hd-toggle]").disabled,
  { timeout: 60000 },
).catch(() => console.log("\n!! HD toggle never re-enabled"));
await state("after the HD swap settled");

console.log(`\npanorama requests total: ${JSON.stringify(panoramaRequests)}`);
console.log(`page errors: ${JSON.stringify(pageErrors, null, 1)}`);

await browser.close();
