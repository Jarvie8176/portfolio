import { chromium } from 'playwright';

const base = process.env.BASE ?? 'http://127.0.0.1:4321';
const viewports = [
  { name: '1440', width: 1440, height: 1000 },
  { name: '390', width: 390, height: 844 },
];
const views = [
  {
    name: 'home',
    path: '/',
    requiredCopy: [
      'How relationships and encounters shape the worlds we share and experience',
      'attention, aggregation, signal extraction',
      'Ops architecture · conceptual framework',
      'working MVP · field media library',
      'Research WIP',
    ],
    removedCopy: ['feasibility and roadmap defined', 'bridge and toy world implemented'],
    expectedWipLabels: 2,
  },
  {
    name: 'yaaa',
    path: '/projects/yaaa/',
    requiredCopy: [
      'personal assistant ops architecture',
      'Amanuensis is one concrete implementation within this framework',
      'The more context a personal assistant needs, the more consequential its ownership boundary becomes.',
      'Provider governed',
    ],
    removedCopy: [
      'biggest threat to your data privacy',
      'Screened · surveilled',
      'watched on terms that are not yours',
    ],
  },
  {
    name: 'trailwalk',
    path: '/projects/trailwalk/',
    requiredCopy: [
      'Working MVP · field media library',
      'Request a demo',
      'Follow updates',
      'Request a demo or share feedback',
    ],
    removedCopy: ['Concept stage · working VR prototype', 'working technical demo', 'Founder links'],
  },
];

const browser = await chromium.launch({ args: ['--no-sandbox'] });
let failed = false;

for (const view of views) {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const response = await page.goto(`${base}${view.path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `/tmp/portfolio-audit-${view.name}-${viewport.name}.png`,
      fullPage: true,
    });
    if (view.name === 'yaaa') {
      await page.locator('#intro').screenshot({ path: `/tmp/portfolio-audit-yaaa-intro-${viewport.name}.png` });
      await page.locator('#problem').screenshot({ path: `/tmp/portfolio-audit-yaaa-problem-${viewport.name}.png` });
    }

    const metrics = await page.evaluate(({ requiredCopy, removedCopy }) => {
      const visible = (element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };
      const label = (element) =>
        `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${
          typeof element.className === 'string' && element.className.trim()
            ? `.${element.className.trim().replace(/\s+/g, '.')}`
            : ''
        }`;
      const blocks = [...document.querySelectorAll('main h1, main h2, main h3, main p, main a, main button')]
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
        .map(label);
      const offscreen = blocks
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.left < -1 || rect.right > document.documentElement.clientWidth + 1;
        })
        .map(label);
      const text = document.body.textContent ?? '';
      const missingFragmentTargets = [...document.querySelectorAll('a[href^="#"]')]
        .map((link) => link.getAttribute('href'))
        .filter((href) => href && href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1))));

      return {
        width: `${document.documentElement.scrollWidth}/${document.documentElement.clientWidth}`,
        horizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        clipped,
        offscreen,
        missingFragmentTargets,
        wipLabels: document.querySelectorAll('.project-status--wip').length,
        requiredCopy: Object.fromEntries(requiredCopy.map((copy) => [copy, text.includes(copy)])),
        removedCopy: Object.fromEntries(removedCopy.map((copy) => [copy, !text.includes(copy)])),
      };
    }, view);

    const hasProblem =
      !response?.ok() ||
      metrics.horizontalScroll ||
      metrics.clipped.length > 0 ||
      metrics.offscreen.length > 0 ||
      metrics.missingFragmentTargets.length > 0 ||
      (view.expectedWipLabels !== undefined && metrics.wipLabels !== view.expectedWipLabels) ||
      pageErrors.length > 0 ||
      Object.values(metrics.requiredCopy).some((present) => !present) ||
      Object.values(metrics.removedCopy).some((removed) => !removed);
    failed ||= hasProblem;
    console.log(JSON.stringify({ view: view.name, viewport, status: response?.status(), pageErrors, ...metrics }, null, 2));
    await page.close();
  }
}

const redirectPage = await browser.newPage();
await redirectPage.goto(`${base}/work/`, { waitUntil: 'networkidle' });
const redirectUrl = new URL(redirectPage.url());
const workRedirectsHome = redirectUrl.pathname === '/' && redirectUrl.hash === '#work';
console.log(JSON.stringify({ workRedirectsHome, redirectUrl: redirectPage.url() }, null, 2));
failed ||= !workRedirectsHome;
await redirectPage.close();

await browser.close();
process.exitCode = failed ? 1 : 0;
