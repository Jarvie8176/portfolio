import { chromium } from 'playwright';

const base = process.env.BASE ?? 'http://127.0.0.1:4321';
const viewports = [
  { name: '1440', width: 1440, height: 1000 },
  { name: '1024', width: 1024, height: 900 },
  { name: '390', width: 390, height: 844 },
];
const views = [
  {
    name: 'concept',
    path: '/projects/amanuensis/',
    sections: ['intro', 'problem', 'why', 'example', 'system', 'explore', 'close'],
    words: [350, 900],
    requiredCopy: [
      'Attention is scarce; information is overwhelming',
      'Signal buried in noise remains noise.',
      "What's important depends on the context",
      'Three responsibilities, one inspectable trace',
      'Technical deep dive',
      'Example walkthrough',
    ],
    selectors: [
      ['#example .figure', 1],
      ['#system .concept-stages > li', 3],
      ['#explore .reading-path', 2],
    ],
  },
  {
    name: 'technical',
    path: '/projects/amanuensis/technical/',
    sections: ['technical-intro', 'architecture', 'guarantees', 'feedback', 'decisions', 'close'],
    words: [900, 1900],
    requiredCopy: [
      'Boundaries before intelligence',
      'Inbound policy gate',
      'Outbound audience gate',
      'End-to-end traceability',
      'Human-in-the-loop (HITL) review turns corrections into rules',
      'Human judgment remains authoritative over the model.',
      'Decisions, trade-offs, and limits',
    ],
    selectors: [
      ['#architecture .kit-section', 3],
      ['#guarantees .guarantee-card', 3],
      ['#feedback ol.feedback-steps > li', 4],
      ['#feedback .review-actions > li', 4],
      ['#feedback .feedback-return', 1],
    ],
  },
  {
    name: 'walkthrough',
    path: '/projects/amanuensis/walkthrough/',
    sections: ['walk-intro', 'w-ingest', 'w-triage', 'w-ladder', 'w-gates', 'w-digest', 'w-ledger', 'shows', 'walk-close'],
    words: [700, 2200],
    requiredCopy: [
      'Example walkthrough',
      'One item, end to end',
      'what happens when it fails',
      'What this shows',
      'Technical deep dive',
    ],
    selectors: [['main .stage', 6]],
  },
];

const browser = await chromium.launch({ args: ['--no-sandbox'] });
let failed = false;

for (const view of views) {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(`${base}${view.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `/tmp/amanuensis-${view.name}-${viewport.name}.png`, fullPage: true });

    const metrics = await page.evaluate(({ expectedSections, requiredCopy, selectors }) => {
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
        .map((element) => ({ element: label(element), text: element.textContent?.trim().slice(0, 70) }));
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
      const sectionOverlap = sections.slice(1).flatMap((section, index) => {
        const previous = sections[index];
        return section.top < previous.bottom - 1
          ? [{ previous: previous.id, next: section.id, pixels: +(previous.bottom - section.top).toFixed(1) }]
          : [];
      });
      const narrativeText = [
        ...document.querySelectorAll('main h1, main h2, main h3, main p, main dt, main dd, main li, main a'),
      ]
        .filter((element) => !element.closest('figure'))
        .map((element) => element.textContent?.trim())
        .filter(Boolean)
        .join(' ');
      const pageText = document.body.textContent ?? '';
      const unnamedFigures = [...document.querySelectorAll('figure')]
        .filter((figure) =>
          !figure.hasAttribute('aria-label') &&
          !figure.hasAttribute('aria-labelledby') &&
          !figure.querySelector('figcaption'),
        )
        .map(label);
      const smallDotTargets = [...document.querySelectorAll('.dot-nav a')]
        .filter(visible)
        .filter((link) => {
          const rect = link.getBoundingClientRect();
          return rect.width < 24 || rect.height < 24;
        })
        .map(label);

      return {
        documentWidth: `${document.documentElement.scrollWidth}/${document.documentElement.clientWidth}`,
        pageHeight: document.documentElement.scrollHeight,
        horizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        clipped,
        offscreen,
        sectionOverlap,
        unnamedFigures,
        smallDotTargets,
        narrativeWordCount: narrativeText.split(/\s+/).filter(Boolean).length,
        requiredCopy: Object.fromEntries(requiredCopy.map((copy) => [copy, pageText.includes(copy)])),
        selectorCounts: Object.fromEntries(selectors.map(([selector]) => [selector, document.querySelectorAll(selector).length])),
        sectionOrder,
        sectionOrderMatches:
          sectionOrder.length === expectedSections.length &&
          sectionOrder.every((id, index) => id === expectedSections[index]),
        removedCopy:
          !pageText.includes('Live today') &&
          !pageText.includes('Delivery rhythm') &&
          !pageText.includes('Private path') &&
          !pageText.includes('Where it stands and limits') &&
          !pageText.includes('The load-bearing behavior'),
      };
    }, { expectedSections: view.sections, requiredCopy: view.requiredCopy, selectors: view.selectors });

    let mobileMenuCloses = true;
    if (viewport.width <= 1080) {
      const menu = page.locator('.mobile-nav');
      await menu.locator(':scope > summary').click();
      await menu.locator('nav a[href^="#"]').first().click();
      mobileMenuCloses = !(await menu.evaluate((element) => element.open));
    }

    const selectorCountsMatch = view.selectors.every(
      ([selector, expected]) => metrics.selectorCounts[selector] === expected,
    );
    const problems =
      metrics.horizontalScroll ||
      metrics.clipped.length > 0 ||
      metrics.offscreen.length > 0 ||
      metrics.sectionOverlap.length > 0 ||
      metrics.unnamedFigures.length > 0 ||
      metrics.smallDotTargets.length > 0 ||
      metrics.narrativeWordCount < view.words[0] ||
      metrics.narrativeWordCount > view.words[1] ||
      Object.values(metrics.requiredCopy).some((present) => !present) ||
      !selectorCountsMatch ||
      !metrics.sectionOrderMatches ||
      !metrics.removedCopy ||
      !mobileMenuCloses;
    failed ||= problems;
    console.log(JSON.stringify({ view: view.name, viewport, mobileMenuCloses, ...metrics }, null, 2));
    await page.close();
  }
}

await browser.close();
process.exitCode = failed ? 1 : 0;
