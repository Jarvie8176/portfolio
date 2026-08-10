import { chromium } from "playwright";

const base = process.env.BASE ?? "http://127.0.0.1:4321";
const widths = (process.env.WIDTHS ?? "1440,1200,1024,900,820,760,600,493")
  .split(",")
  .map(Number);
const itemId = process.env.ITEM ?? "cartreau-panorama";

const browser = await chromium.launch({ args: ["--no-sandbox"] });

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(`${base}/projects/trailwalk/`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);

  await page.click(`[data-trailwalk-id="${itemId}"]`);
  await page.waitForSelector("[data-trailwalk-details-panel]", { state: "attached" });

  // The panel starts hidden; open it so the rows can be measured.
  await page.evaluate(() => {
    const btn = document.querySelector("[data-trailwalk-details-toggle]");
    const panel = document.querySelector("[data-trailwalk-details-panel]");
    if (panel?.hasAttribute("hidden")) btn?.click();
  });
  await page.waitForSelector("[data-trailwalk-details-panel] dl", { state: "visible" });

  const out = await page.evaluate(() => {
    const dl = document.querySelector("[data-trailwalk-details-panel] dl");
    const cs = getComputedStyle(dl);
    const box = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        text: el.textContent.trim().slice(0, 28),
        x: +r.x.toFixed(2),
        y: +r.y.toFixed(2),
        w: +r.width.toFixed(2),
        h: +r.height.toFixed(2),
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        // first-baseline position relative to the element's top border edge
        baseline: null,
      };
    };
    const rows = [];
    const dts = [...dl.querySelectorAll("dt")];
    const dds = [...dl.querySelectorAll("dd")];
    for (let i = 0; i < dts.length; i += 1) rows.push({ dt: box(dts[i]), dd: box(dds[i]) });

    // Measure each element's first text baseline with an inline probe.
    const baselineOf = (el) => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "display:inline-block;width:0;height:0;overflow:hidden;vertical-align:baseline";
      el.insertBefore(probe, el.firstChild);
      const y = probe.getBoundingClientRect().top - el.getBoundingClientRect().top;
      probe.remove();
      return +y.toFixed(2);
    };
    rows.forEach((r, i) => {
      r.dt.baseline = baselineOf(dts[i]);
      r.dd.baseline = baselineOf(dds[i]);
    });

    const panel = document.querySelector("[data-trailwalk-details-panel]");
    return {
      panel: { w: +panel.getBoundingClientRect().width.toFixed(2) },
      dl: {
        w: +dl.getBoundingClientRect().width.toFixed(2),
        h: +dl.getBoundingClientRect().height.toFixed(2),
        cols: cs.gridTemplateColumns,
        rowsTrack: cs.gridTemplateRows,
        gap: `${cs.rowGap} / ${cs.columnGap}`,
        alignItems: cs.alignItems,
        fontFamily: cs.fontFamily.slice(0, 40),
        lineHeight: cs.lineHeight,
      },
      rows,
    };
  });

  console.log(`\n===== viewport ${width}px  panel=${out.panel.w}  dl=${out.dl.w} x ${out.dl.h}`);
  console.log(
    `      cols=${out.dl.cols}  gap=${out.dl.gap}  align-items=${out.dl.alignItems}  lh=${out.dl.lineHeight}`,
  );
  console.log(`      rowsTrack=${out.dl.rowsTrack}`);
  for (const r of out.rows) {
    const delta = (r.dd.baseline + r.dd.y - (r.dt.baseline + r.dt.y)).toFixed(2);
    console.log(
      `      dt "${r.dt.text}" w=${r.dt.w} h=${r.dt.h} lh=${r.dt.lineHeight} base=${r.dt.baseline} y=${r.dt.y}` +
        `\n      dd "${r.dd.text}" w=${r.dd.w} h=${r.dd.h} lh=${r.dd.lineHeight} base=${r.dd.baseline} y=${r.dd.y}` +
        `   >>> baseline delta dd-dt = ${delta}px`,
    );
  }
  await page.close();
}

await browser.close();
