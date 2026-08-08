# Test gaps

This repository has no test runner. Nothing here runs; this file is a stub that
records which behaviours are currently unverified and what each one should
assert, so the gaps are visible in review instead of implied.

Every item below was checked by hand once during the Trailwalk gallery review.
A manual check is not a guard: none of these would fail visibly if the code
regressed, and several protect a property that is only observable in production.

Each gap is marked with a `TODO(test)` comment at the site it protects.

## Priority

T1-T4 and T8 encode safety properties: the failure mode is a silently broken,
over-publishing, or quietly wrong build, not a visible error. They are worth a
runner on their own, and T1-T4 and T8 need no DOM. T5-T7 and T9 are behavioural
and need a DOM, so they are cheaper to defer.

## Gaps

### T1 — build fails closed without an asset base

`src/components/trailwalk/TrailwalkGallery.astro`

`npm run build` with no `TRAILWALK_ASSET_BASE_URL` must exit non-zero. Before
the guard existed, the build succeeded and produced a gallery whose every card
opened to a 404, which is exactly the kind of failure a green check should not
be able to coexist with.

Assert: build exits non-zero, and stderr names the variable.

### T2 — embedded JSON cannot break out of its script element

`src/components/trailwalk/TrailwalkGallery.astro`, `serializeGalleryData`

Astro's `set:html` does not escape. A gallery title containing `</script>`
would otherwise close the data element and inject the remainder as markup.

Assert: with a title of `x</script><img src=x onerror=alert(1)>`, the built
page contains no literal `</script>` inside the data element, the payload still
parses as JSON, the title round-trips intact, and no stray `<img>` appears in
the document.

### T3 — the public payload is an allowlist, not a spread

`src/components/trailwalk/TrailwalkGallery.astro`, `publicPayload`

The serialized payload previously spread the whole source item, so any field
added to `TrailwalkGalleryItem` would have been published by default. This is
the regression guard for that direction.

Assert: the set of keys in each serialized item equals the expected allowlist
exactly. A new key must fail the test rather than ship.

### T4 — nothing published carries a coordinate finer than three places

`src/data/trailwalkGallery.ts`, `getTrailwalkMapsAction`, `formatCoordinates`

The gallery now publishes coordinates, rounded to three decimal places. The
property that replaced "no coordinates at all" is a precision ceiling, and it
has to hold at both ends: the number written into the source file and the
number that reaches the page.

Assert: for every item in `trailwalkGalleryItems`, neither the decoded `href`
query nor the rendered coordinate label contains a decimal with more than three
places. Pair with a scan of the built HTML for the same pattern, so a future
change that rounds at render time instead of at authoring time still fails.

Assert also that the label and the link agree: both must resolve to the same
position, and an item with no `coordinates` must render `Not recorded` and fall
back to the place-name query.

### T5 — a failed panorama load leaves the poster visible

`src/components/trailwalk/TrailwalkViewer.client.ts`, `loadViewer`

Needs a DOM and a stubbed viewer whose `setPanorama` rejects.

Assert: `data-viewer-ready` is not `"true"`, the status element carries the
failure message, and the viewer container has been emptied so the library's own
error overlay is not covering the poster the message refers to.

### T6 — the viewer is not marked ready before the texture resolves

`src/components/trailwalk/TrailwalkViewer.client.ts`, `loadViewer`

Same harness as T5, with a `setPanorama` that stays pending.

Assert: while pending, `data-viewer-ready` is not `"true"` and the loading
status is still shown. This is what keeps the poster covering the full
0.9-1.7 MB download.

### T7 — a rejected stylesheet load does not poison later selections

`src/components/trailwalk/TrailwalkViewer.client.ts`, `loadViewerCss`

Assert: after a rejection, the next call retries instead of returning the
cached rejected promise. Without this, one transient failure disables the
gallery for the rest of the page's life.

### T8 — the captured label does not depend on the reader's time zone

`src/data/trailwalkGallery.ts`, `readCapturedAt`

`capturedAt` is a wall-clock reading with no UTC offset. Formatting it through
`Date` would resolve it against the reader's zone, so the same photo would
report a different hour in Berlin than in St. John's — silently, and only for
readers the author is unlikely to be one of.

Assert: with `TZ` set to at least `UTC`, `America/St_Johns` and
`Asia/Shanghai`, `formatCapturedDateTime` returns byte-identical output. Assert
also that a `capturedAt` carrying an offset or a `Z` is rejected rather than
quietly accepted, since accepting it would reintroduce the conversion.

### T9 — a failed HD swap does not leave the control lying

`src/components/trailwalk/TrailwalkViewer.client.ts`, `swapPanoramaTier`

Checked once by hand, in a browser, with the HD request aborted: the control
returned to off, stayed usable, the standard texture stayed on screen, and the
status said so. Nothing keeps that true.

Assert: with a `setPanorama` that rejects for the HD URL only, `aria-pressed`
returns to `"false"`, the button is re-enabled, `data-viewer-ready` stays
`"true"`, and the status names the failure. The point is the invariant that the
control describes the tier actually displayed, not merely that it does not
throw.

## Not covered here

Real-device gyroscope behaviour needs a secure context and a physical sensor.
It stays manual. That now includes the default-on start: whether a device
grants motion access without a gesture cannot be observed from a headless
browser, which reports no sensor at all.
