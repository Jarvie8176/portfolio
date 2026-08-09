// Positive check for the default-on gyroscope. Headless Chromium has
// DeviceOrientationEvent but no sensor, so the plugin's support probe would
// simply time out and prove nothing. Feeding it one synthetic reading makes the
// supported branch actually run, which is the branch worth checking.
import { chromium } from "playwright";

const base = process.env.BASE ?? "http://127.0.0.1:4321";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const warnings = [];
page.on("console", (m) => {
  if (m.type() === "warning" || m.type() === "error") warnings.push(`${m.type()}: ${m.text().slice(0, 120)}`);
});

// Answer the plugin's support probe as a device with a working sensor would.
await page.addInitScript(() => {
  setInterval(() => {
    window.dispatchEvent(
      new (window.DeviceOrientationEvent ?? Event)("deviceorientation", {
        alpha: 12,
        beta: 4,
        gamma: -3,
      }),
    );
  }, 100);
});

await page.goto(`${base}/projects/trailwalk/`, { waitUntil: "domcontentloaded" });
await page.waitForSelector("[data-trailwalk-gallery]");
await page.click('[data-trailwalk-id="kauzmann-ridge"]');
await page.waitForFunction(
  () => document.querySelector("[data-trailwalk-viewer-shell]").dataset.viewerReady === "true",
  { timeout: 45000 },
);

// The navbar gyroscope button carries the enabled state.
const enabled = await page
  .waitForFunction(
    () => {
      const btn = document.querySelector(".psv-gyroscope-button");
      return btn?.classList.contains("psv-button--active") ? true : null;
    },
    { timeout: 20000 },
  )
  .then(() => true)
  .catch(() => false);

const detail = await page.evaluate(() => {
  const btn = document.querySelector(".psv-gyroscope-button");
  return {
    buttonPresent: !!btn,
    buttonClass: btn?.className ?? null,
    viewerReady: document.querySelector("[data-trailwalk-viewer-shell]").dataset.viewerReady,
    gyro: window.__gyro ?? "hook never ran",
  };
});

console.log("gyroscope active without any user gesture:", enabled);
console.log("detail:", JSON.stringify(detail));
console.log("console warnings/errors:", JSON.stringify(warnings));

await browser.close();
process.exit(enabled ? 0 : 1);
