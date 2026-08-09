// Regression: the cancellation boundary must not break the ordinary path.
import { chromium } from "playwright";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
page.on("pageerror", (e) => errs.push(e.message.slice(0, 120)));
page.on("console", (m) => { if (m.type() === "error") errs.push("console:" + m.text().slice(0, 120)); });

const ready = () => page.waitForFunction(
  () => document.querySelector("[data-trailwalk-viewer-shell]").dataset.viewerReady === "true",
  { timeout: 60000 });
const snap = async (l) => {
  const s = await page.evaluate(() => {
    const shell = document.querySelector("[data-trailwalk-viewer-shell]");
    const hd = document.querySelector("[data-trailwalk-hd-toggle]");
    return {
      hidden: shell.hidden, ready: shell.dataset.viewerReady,
      canvas: !!document.querySelector("[data-trailwalk-viewer] canvas"),
      detailsOpen: !document.querySelector("[data-trailwalk-details-panel]").hidden,
      hdDisabled: hd.disabled, hdPressed: hd.getAttribute("aria-pressed"),
      current: [...document.querySelectorAll('[data-trailwalk-card][aria-current="true"]')].map(c => c.dataset.trailwalkId),
      title: document.querySelector("[data-trailwalk-viewer-title]").textContent,
    };
  });
  console.log(`${l}: ${JSON.stringify(s)}`);
  return s;
};

await page.goto((process.env.BASE ?? base) + "/projects/trailwalk/", { waitUntil: "domcontentloaded" });
await page.waitForSelector("[data-trailwalk-gallery]");

await page.click('[data-trailwalk-id="kauzmann-ridge"]'); await ready();
const a = await snap("1 select kauzmann     ");
await page.click("[data-trailwalk-back]");
const b = await snap("2 back                ");
await page.click('[data-trailwalk-id="tablelands"]'); await ready();
const c = await snap("3 reselect tablelands ");
await page.click("[data-trailwalk-hd-toggle]");
await page.waitForFunction(() => !document.querySelector("[data-trailwalk-hd-toggle]").disabled, { timeout: 120000 });
const d = await snap("4 hd on               ");
await page.click("[data-trailwalk-back]");
const e = await snap("5 back again          ");
await page.click('[data-trailwalk-id="norstead"]'); await ready();
const f = await snap("6 reselect norstead   ");

const checks = {
  "back hides and clears selection": b.hidden && b.ready === "false" && !b.canvas && b.current.length === 0 && b.hdDisabled,
  "reselect after back works": c.ready === "true" && c.canvas && c.current.join() === "tablelands" && c.detailsOpen,
  "hd still works after a back cycle": d.hdPressed === "true" && d.ready === "true",
  "hd preference survives reselect": f.hdPressed === "true" && f.ready === "true" && f.title === "Norstead Trail",
  "no page errors": errs.length === 0,
};
console.log("");
for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? "PASS" : "FAIL"}  ${k}`);
if (errs.length) console.log("errors:", errs);
await browser.close();
