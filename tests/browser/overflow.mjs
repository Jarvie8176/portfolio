import { chromium } from "playwright";

const base = process.env.BASE ?? "http://127.0.0.1:4321";
const browser = await chromium.launch({ args: ["--no-sandbox"] });

for (const width of [1440, 1200, 1024, 900, 760, 430, 375]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(`${base}/projects/trailwalk/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-trailwalk-gallery]");
  await page.click('[data-trailwalk-id="fishing-point"]');
  await page.waitForSelector("[data-trailwalk-details-panel] dl", { state: "visible" });

  const out = await page.evaluate(() => {
    const r = (sel) => {
      const el = document.querySelector(sel);
      const b = el.getBoundingClientRect();
      return { w: +b.width.toFixed(1), left: +b.left.toFixed(1), right: +b.right.toFixed(1) };
    };
    const bar = document.querySelector(".trailwalk-viewer__bar");
    const actions = document.querySelector(".trailwalk-viewer__actions");
    const dl = document.querySelector("[data-trailwalk-details-panel] dl");
    const dds = [...dl.querySelectorAll("dd")];
    const dts = [...dl.querySelectorAll("dt")];
    return {
      docScrollW: document.documentElement.scrollWidth,
      docClientW: document.documentElement.clientWidth,
      shell: r("[data-trailwalk-viewer-shell]"),
      stage: r(".trailwalk-viewer__stage"),
      panel: r("[data-trailwalk-details-panel]"),
      actionsOverflow: actions.scrollWidth - actions.clientWidth,
      barWraps: getComputedStyle(bar).flexDirection,
      // a value taller than one line means it wrapped
      wrappedValues: dds.filter((d) => d.getBoundingClientRect().height > 27).map((d) => d.textContent),
      clippedLabels: dts.filter((d) => d.scrollWidth > d.clientWidth + 0.5).map((d) => d.textContent),
    };
  });
  console.log(`\n${width}px  doc ${out.docScrollW}/${out.docClientW}${out.docScrollW > out.docClientW ? "  << HORIZONTAL SCROLL" : ""}`);
  console.log(`   stage ${out.stage.w}  panel ${out.panel.w}  actions overflow ${out.actionsOverflow}  bar ${out.barWraps}`);
  console.log(`   wrapped values: ${JSON.stringify(out.wrappedValues)}`);
  console.log(`   clipped labels: ${JSON.stringify(out.clippedLabels)}`);
  await page.close();
}

await browser.close();
