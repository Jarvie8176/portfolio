# Trailwalk Draggable Viewer And Metadata UI

Date: 2026-08-07

## Implementation Status

Implemented. This document is the design record for what shipped, not a plan.

As built:

- `src/components/trailwalk/TrailwalkGallery.astro` renders the gallery and the
  viewer shell.
- `src/components/trailwalk/TrailwalkViewer.client.ts` is loaded only after a
  card is selected.
- `src/data/trailwalkGallery.ts` holds the typed metadata.
- `@photo-sphere-viewer/core` and `@photo-sphere-viewer/gyroscope-plugin` are
  pinned to `5.15.1` in `package.json`.

The original constraint still holds: the page ships almost no client
JavaScript, so the viewer stays a progressive enhancement loaded after user
intent rather than part of the initial bundle.

## Viewer Recommendation

Use `Photo Sphere Viewer` for the first draggable public gallery implementation.

Why:

- It supports standard equirectangular panoramas, matching the reviewed JPG
  candidates.
- It works as an npm dependency in the Astro build instead of requiring iframe
  embedding.
- Its core API supports touch, mouse drag, gyroscope, plugins, methods, and
  events, which gives room for future Trailwalk annotations.
- Its adapter model allows a future move from single panorama derivatives to
  tiled panoramas without changing the public data model.
- The markers plugin is available if future field notes or points of interest
  need to appear inside the panorama.

Acceptable fallback:

- `Pannellum` is still a good minimal first spike if the goal is only
  still-image inspection. It supports equirectangular panoramas, preview images,
  default draggable mouse/touch behavior, hot spots, CORS configuration, and a
  simple JSON setup.

Defer:

- `Marzipano` is strong for tiled/multiresolution tours, but its setup is heavier
  and better suited after the R2 derivative pipeline proves that mobile memory
  requires tiles.

## Implementation Shape

Keep first load static:

1. Render gallery cards with highlight crops and metadata from a typed data file.
2. On card click, dynamically import the viewer component and viewer CSS.
3. Load one optimized panorama derivative from R2.
4. Show a poster/highlight fallback while the viewer initializes.
5. Keep metadata outside the panorama canvas as a normal HTML disclosure.

Recommended files:

- `src/data/trailwalkGallery.ts`
- `src/components/trailwalk/TrailwalkGallery.astro`
- `src/components/trailwalk/TrailwalkViewer.client.ts`
- `src/styles/trailwalk-gallery.css` or page-local CSS if the implementation
  remains narrow.

Installed dependencies, pinned exactly because the gyroscope plugin declares an
exact peer on the core package:

- `@photo-sphere-viewer/core`
- `@photo-sphere-viewer/gyroscope-plugin`

Candidates for later, not installed:

- `@photo-sphere-viewer/markers-plugin` for in-panorama field notes.
- `@photo-sphere-viewer/equirectangular-tiles-adapter` if mobile memory ever
  forces tiled panoramas.

## Data Contract

`src/data/trailwalkGallery.ts` is the source of truth. As built:

```ts
export type TrailwalkGalleryItem = {
  id: string;
  title: string;
  shortPlace: string;
  locationLabel: string;
  terrainTag: string;
  capturedAt: string;
  capturedLabel: string;
  altitudeMeters?: number;
  locationSource: TrailwalkLocationSource;
  mapsQuery: string;
  assets: {
    highlight: string;
    highlight2x?: string;
    panorama: string;
    poster: string;
  };
  initialView?: {
    yaw?: string;
    pitch?: string;
    zoom?: number;
  };
};
```

The Maps action is derived, not stored: `getTrailwalkMapsAction(item)` builds it
from `mapsQuery`. What reaches the browser is `publicPayload` in
`TrailwalkGallery.astro`, an explicit projection of this type rather than this
type itself.

## Candidate Metadata Values

Exact per-image coordinates, and any maps URL derived from them, live in the
private review layer only. They must never be reproduced in this repository, in
commit messages, or in pull request text.

What a reviewer decides per image is only which of these public fields are
accurate:

| field | published |
| --- | --- |
| `id`, `title`, `terrainTag` | yes |
| `locationLabel`, `shortPlace` | yes, human-readable place only |
| `altitudeMeters` | yes |
| `locationSource` | yes, provenance label only |
| `mapsQuery` | yes, a place name, never a coordinate pair |
| exact latitude / longitude | never, and the type cannot express it |

## Metadata UI Design

### Default Viewer State

Desktop:

- Viewer canvas takes the primary width.
- Top bar contains:
  - sample title
  - `Back to gallery`
  - `Details` toggle
- Metadata is collapsed by default, or shown as a quiet right rail only after
  the user opens `Details`.

Mobile:

- Viewer first.
- `Details` appears as a button below the viewer.
- Metadata opens as an inline disclosure sheet below the button, not as an
  overlay that covers the panorama.

### Details Panel Content

Panel title:

- `Field details`

Primary rows:

- `Place`: human-readable location label.
- `Captured`: date and time of day, e.g. `June 2, 2026 · 11:21 local`. The
  clock is the camera's, which is the wall clock at the place in the photo;
  `local` says so, because none of these files records a zone to name instead.
- `Elevation`: altitude in meters if available.
- `Coordinates`: latitude and longitude to three decimal places, e.g.
  `51.354° N, 55.563° W`, or `Not recorded` where no position was captured.

Actions:

- `See location in Google Maps`, built from the same three-place pair the panel
  prints, so the link and the text cannot disagree. Items with no recorded
  position fall back to the place name in `mapsQuery`.

Not shown:

- Coordinate provenance (`JPG EXIF`, `INSP EXIF`, `Manual review`) is kept in
  the source data as an audit trail, but it answers a question a visitor is not
  asking and is not published.
- R2 or source object keys.

Defaults on selecting a sample:

- The details panel is open. A reader who wants the sphere alone closes it
  once, rather than opening it every time.
- The gyroscope is started where the device supports it. Devices that require
  an explicit motion permission will refuse, because the request no longer has
  a user gesture behind it by the time the panorama has loaded; the navbar
  gyroscope button remains and asks again from inside a real gesture.
- The `HD sample` toggle is off, and carries the size of what pressing it would
  fetch (`HD sample · 42.3 MB`). Toggling swaps the texture inside the running
  viewer so the current heading is kept. If the swap fails, the control returns
  to the tier that is actually on screen.

### Panorama Tiers

- **Standard**: a 4096x2048 derivative, 0.9-1.7 MB. This is what loads on
  selection.
- **HD**: the stitched original, 11904x5952, 12-42 MB. It is the original file
  with its metadata removed, not a re-encode of it: the compressed image data
  is byte-identical to the source, so this is the highest resolution that
  exists rather than the highest that was regenerated.

The HD tier is opt-in and prices itself in the control precisely because it is
this large. Two things follow from the size that are worth knowing before
raising it further:

- On a device whose `MAX_TEXTURE_SIZE` is 8192 — which is most phones — the
  viewer downscales the 11904-wide image before uploading it to the GPU. Those
  devices pay the full transfer and decode for detail they cannot display.
  Desktop GPUs at 16384 do show it.
- Decoding 11904x5952 needs roughly 280 MB of RGBA before the downscale, so the
  toggle is a genuine cost on constrained devices, not only a slow load.

### Visual Treatment

Match the Trailwalk detail page:

- Off-white panel background.
- 1px warm divider.
- 6-8px radius.
- Lora heading, DM Sans rows.
- Forest green action link.
- No map embed on first version. A map embed would add third-party requests,
  consent questions, and visual weight. Use a plain outbound Maps URL instead.

### Privacy And Accuracy Rule

This repository is public, so anything committed here is published whatever the
renderer does with it. The rule is therefore about what may exist in the file,
not about what the UI chooses to draw.

An earlier draft used a per-image `publicApproved` flag to gate exact
coordinate display. That was removed and must not come back. A runtime toggle
only helps if the data it guards is safe to have around, and the exact
coordinates would have to be committed for the flag to have anything to switch
on: the flag would have been the control, and the committed coordinates would
have been the leak.

The rule is structural:

- `TrailwalkApproxCoordinates` holds values already rounded to three decimal
  places — roughly 110 m. The rounding happens before the number is written
  into the file, not on the way to the page, so the repository cannot express a
  position more precise than the site publishes.
- Three places discloses no more than `locationLabel` and `mapsQuery` already
  do, since those name the trail. The two disclosures are deliberately kept
  consistent with each other; tightening one without the other buys nothing.
- Full-precision values stay in the private review layer and are never copied
  into this repository, its commit messages, or its pull request text.
- Absent is rendered as absent. An item with no recorded fix shows
  `Not recorded`; it is never backfilled by geocoding the place name.
- Public image derivatives are EXIF-stripped before upload. This matters most
  for the HD tier, which is the original file rather than a re-encode: the
  resampling that produces the smaller tiers drops metadata as a side effect,
  whereas here the stripping is the only thing standing between the source
  file's GPS block and the public bucket. The stripped originals carry no EXIF,
  no XMP, no maker notes and no embedded thumbnail, and the camera-native ones
  also shed roughly 10 MB of embedded payload each.
- Verify this again whenever the derivative set is regenerated; it is the other
  half of the same guarantee, and it lives outside this code.

## Google Maps URL Pattern

There is one pattern. It takes a place name, never a coordinate pair:

```ts
const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  mapsQuery,
)}`;
```

Use `target="_blank"` and `rel="noreferrer"` on the public link.

## Spike Acceptance Criteria

- No viewer JS/CSS loads before selecting a gallery card.
- Selecting a card opens a draggable 360 viewer with mouse and touch input.
- Full panorama derivative comes from R2 or a configurable asset base URL.
- Poster/highlight image remains visible while the viewer initializes.
- `Back to gallery` returns focus to the selected card.
- `Details` can show place, date, altitude, location source, and the Maps
  action.
- No latitude/longitude value appears anywhere in the built output.
- Reduced-motion users do not get animated camera movement.
- Build still passes with JavaScript disabled, showing gallery cards and
  fallback images.
