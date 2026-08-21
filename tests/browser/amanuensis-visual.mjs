import { chromium } from 'playwright';

const base = process.env.BASE ?? 'http://127.0.0.1:4321';
const viewports = [
  { name: '1440', width: 1440, height: 1000 },
  { name: '1024', width: 1024, height: 900 },
  { name: '390', width: 390, height: 844 },
];

const browser = await chromium.launch({ args: ['--no-sandbox'] });
let failed = false;

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await page.goto(`${base}/projects/amanuensis/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `/tmp/amanuensis-${viewport.name}.png`, fullPage: true });
  await page.screenshot({
    path: `/tmp/amanuensis-${viewport.name}.jpg`,
    fullPage: true,
    type: 'jpeg',
    quality: 72,
  });

  const metrics = await page.evaluate(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const label = (element) =>
      `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${
        element.className && typeof element.className === 'string'
          ? `.${element.className.trim().replace(/\s+/g, '.')}`
          : ''
      }`;

    const blocks = [...document.querySelectorAll('main h1, main h2, main h3, main p, main dt, main dd, main a')]
      .filter(visible);
    const clipped = blocks
      .filter((element) => {
        const style = getComputedStyle(element);
        const clipsX = style.overflowX === 'hidden' || style.overflowX === 'clip';
        const clipsY = style.overflowY === 'hidden' || style.overflowY === 'clip';
        return (
          (clipsX && element.scrollWidth > element.clientWidth + 1) ||
          (clipsY && element.scrollHeight > element.clientHeight + 1)
        );
      })
      .map((element) => ({
        element: label(element),
        text: element.textContent?.trim().slice(0, 70),
        width: `${element.scrollWidth}/${element.clientWidth}`,
        height: `${element.scrollHeight}/${element.clientHeight}`,
      }));
    const offscreen = blocks
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > document.documentElement.clientWidth + 1;
      })
      .map((element) => ({ element: label(element), text: element.textContent?.trim().slice(0, 70) }));

    const sections = [...document.querySelectorAll('main > section')].map((section) => {
      const rect = section.getBoundingClientRect();
      return { id: section.id || 'close', top: rect.top, bottom: rect.bottom };
    });
    const sectionOrder = sections.map((section) => section.id);
    const expectedSectionOrder = [
      'intro',
      'problem',
      'why',
      'example',
      'how',
      'guarantees',
      'decisions',
      'close',
    ];
    const sectionOverlap = sections.slice(1).flatMap((section, index) => {
      const previous = sections[index];
      return section.top < previous.bottom - 1
        ? [{ previous: previous.id, next: section.id, pixels: +(previous.bottom - section.top).toFixed(1) }]
        : [];
    });

    const pageText = document.body.innerText;
    const pageTextLower = pageText.toLowerCase();
    const narrativeText = [
      ...document.querySelectorAll('main h1, main h2, main h3, main p, main dt, main dd, main li, main a'),
    ]
      .filter((element) => !element.closest('figure'))
      .map((element) => element.textContent?.trim())
      .filter(Boolean)
      .join(' ');
    return {
      status: document.readyState,
      documentWidth: `${document.documentElement.scrollWidth}/${document.documentElement.clientWidth}`,
      horizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      clipped,
      offscreen,
      sectionOverlap,
      narrativeWordCount: narrativeText.split(/\s+/).filter(Boolean).length,
      requiredCopy: {
        attention: pageTextLower.includes('attention is a scarce resource'),
        noiseEquation: pageText.includes('Signal × noise = garbage.'),
        contextClaim: pageText.includes("What's important depends on the context."),
        contextCase: pageText.includes('consumerism trap'),
        ingestKit: pageText.includes('ingest-kit'),
        triageKit: pageText.includes('triage-kit'),
        pushKit: pageText.includes('push-kit'),
        inbound: pageText.includes('Inbound policy gate'),
        outbound: pageText.includes('Outbound audience gate'),
        traceability: pageText.includes('End-to-end traceability'),
      },
      sectionOrder,
      sectionOrderMatches:
        sectionOrder.length === expectedSectionOrder.length &&
        sectionOrder.every((id, index) => id === expectedSectionOrder[index]),
      removedProofStrip:
        !pageText.includes('Live today') &&
        !pageText.includes('Delivery rhythm') &&
        !pageText.includes('Private path') &&
        !pageText.includes('Live now') &&
        !pageText.includes('Where it stands and limits') &&
        !pageText.includes('The load-bearing behavior'),
    };
  });

  const problems =
    metrics.horizontalScroll ||
    metrics.clipped.length > 0 ||
    metrics.offscreen.length > 0 ||
    metrics.sectionOverlap.length > 0 ||
    metrics.narrativeWordCount < 625 ||
    metrics.narrativeWordCount > 900 ||
    Object.values(metrics.requiredCopy).some((present) => !present) ||
    !metrics.sectionOrderMatches ||
    !metrics.removedProofStrip;
  failed ||= problems;
  console.log(JSON.stringify({ viewport, ...metrics }, null, 2));
  await page.close();
}

await browser.close();
process.exitCode = failed ? 1 : 0;
