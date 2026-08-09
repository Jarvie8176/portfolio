# Browser checks

Nothing runs these automatically. They are the checks that were used by hand
while building the Trailwalk gallery, kept because each of them found something
that reading the code did not, and because `../TODO.md` describes properties
that only exist in a rendered page.

They are not a substitute for the runner `../TODO.md` asks for. They are the
scripts a runner would wrap.

## Running

Playwright is not a dependency of this project — the build and the deploy path
should not carry it. Install it where you are running the checks:

```sh
npm i --no-save playwright
npx playwright install chromium

# serve a build, or point at a deployed one
npm run build && npx astro preview &
node tests/browser/verify-all.mjs
```

Every script takes its target from `BASE`, defaulting to a local preview:

```sh
BASE=https://example.invalid node tests/browser/verify-all.mjs
```

## What each one asserts

| script | asserts |
| --- | --- |
| `verify-all.mjs` | every sample **discovered from the page's own payload** opens: `data-viewer-ready="true"`, a canvas, an empty status. Desktop and a phone profile. |
| `behaviour.mjs` | selection defaults — details open, HD control labelled with the byte count, four detail rows, the Maps link — then presses HD and checks the tier actually swapped. |
| `measure.mjs` | the details panel's label/value **baseline offset per row**, plus the resolved grid tracks. Reports numbers rather than passing or failing; the panel's alignment bug was a 3.2px offset that no screenshot review had caught. |
| `overflow.mjs` | across seven viewport widths: no horizontal scroll, no clipped label, no wrapped value. |
| `hd-failure.mjs` | with the HD request aborted, the control returns to off, stays usable, the standard texture survives, and the status explains it — i.e. the control never claims a tier that is not displayed. |
| `back-repro.mjs` | pressing Back **while the viewer chunk is still loading** leaves no panorama fetched and no viewer built. |
| `back-reselect.mjs` | the other half of the same boundary: selecting again after Back still works, and the HD preference survives the round trip. |
| `gyro.mjs` | the default-on gyroscope reaches the active state with no user gesture, given a synthetic sensor reading. |

## Two things worth knowing before trusting a result

**`verify-all.mjs` reads the sample list out of the page.** The suite it replaced
named the samples it selected. Every name in it predated the sample that was
added last, so a sample that failed to open on every device passed through a
green suite, a clean build and a full asset check. A list of fixtures stops
covering the data the moment the data grows.

**Check the harness before believing the harness.** Three separate false results
came from the scripts rather than the page: an abort pattern matching an asset
name that no longer existed, a `BASE` that pointed at an unrelated dev server on
a port that happened to be listening, and an assertion pinned to a title that
the copy had since changed. Each looked exactly like a product failure. When a
check goes red, first prove it can go green.

`gyro.mjs` is the standing example of a harness that is right about the code and
wrong about itself: headless Chromium emits its own null-data `deviceorientation`
event, which races the synthetic one, so the check passes about four runs in
five. Both outcomes are correct behaviour — a reading with no `alpha` is the
no-sensor case the start is meant to skip.
