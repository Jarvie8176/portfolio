# Trailwalk Draggable Viewer And Metadata UI

## Implementation Status

Implemented.

- `src/components/trailwalk/TrailwalkGallery.astro` renders the gallery and the
  viewer shell.
- `src/components/trailwalk/TrailwalkViewer.client.ts` is loaded only after a
  card is selected.
- `src/data/trailwalkGallery.ts` holds the typed metadata.
- `@photo-sphere-viewer/core` and `@photo-sphere-viewer/gyroscope-plugin` are
  pinned to `5.15.1` in `package.json`.

Gallery cards and metadata are server-rendered. Viewer code and CSS load after
a visitor selects a card.

## Viewer Engine

`Photo Sphere Viewer` renders the draggable public gallery.

Why:

- It supports standard equirectangular panoramas, matching the reviewed JPG
  candidates.
- It works as an npm dependency in the Astro build instead of requiring iframe
  embedding.
- Its core API supports touch, mouse drag, gyroscope, plugins, methods, and
  events, which gives room for future Trailwalk annotations.
- Its adapter model allows a future move from single panorama derivatives to
  tiled panoramas without changing the public data model.
- Its plugin model leaves room for field-note markers or tiled panoramas without
  changing the public data model.

## Implementation Shape

Runtime flow:

1. Render gallery cards with highlight crops and metadata from a typed data file.
2. On card click, dynamically import the viewer component and viewer CSS.
3. Load one optimized panorama derivative from R2.
4. Show a poster/highlight fallback while the viewer initializes.
5. Keep metadata outside the panorama canvas as a normal HTML disclosure.

Implementation files:

- `src/data/trailwalkGallery.ts`
- `src/components/trailwalk/TrailwalkGallery.astro`
- `src/components/trailwalk/TrailwalkViewer.client.ts`
- `src/styles/trailwalk-gallery.css` or page-local CSS if the implementation
  remains narrow.

Installed dependencies, pinned exactly because the gyroscope plugin declares an
exact peer on the core package:

- `@photo-sphere-viewer/core`
- `@photo-sphere-viewer/gyroscope-plugin`

Open extensions, not installed:

- `@photo-sphere-viewer/markers-plugin` for in-panorama field notes.
- `@photo-sphere-viewer/equirectangular-tiles-adapter` if mobile memory ever
  forces tiled panoramas.

## Data Contract

`src/data/trailwalkGallery.ts` is the source of truth:

```ts
export type TrailwalkGalleryItem = {
  id: string;
  title: string;
  place: string;                               // card subtitle and Place row
  terrainTag: string;
  capturedAt: string;                          // wall clock, no zone offset
  altitudeMeters?: number;
  coordinates?: TrailwalkApproxCoordinates;    // already rounded to 3 places
  locationSource: TrailwalkLocationSource;     // provenance, not published
  mapsQuery: string;
  assets: {
    highlights: TrailwalkHighlight[];          // srcset candidates
    panorama: TrailwalkPanorama;               // key + measured byte count
    panoramaHd: TrailwalkPanorama;
    poster: string;
  };
  initialView?: {
    yaw?: string;
    pitch?: string;
    zoom?: number;
  };
};
```

Both labels are derived rather than stored, so neither can drift from the value
it describes: `formatCapturedDateTime(item.capturedAt)` and
`formatCoordinates(item.coordinates)`. `getTrailwalkMapsAction(item)` reads the
same `coordinates`, falling back to `mapsQuery` where none was recorded.

What reaches the browser is `publicPayload` in `TrailwalkGallery.astro`, an
explicit projection of this type rather than this type itself. It carries the
poster and the two panorama tiers; card thumbnails are rendered server-side and
are deliberately not serialized.

## Candidate Metadata Values

Coordinates are published at three decimal places, roughly 110 m. The precision
ceiling is enforced at authoring time — the number written into the repository
is already rounded — because in a public repository the committed value is the
disclosure whatever the renderer does with it. Full-precision values stay in the
private review layer and must never be reproduced in this repository, in commit
messages, or in pull request text.

| field | published |
| --- | --- |
| `id`, `title`, `terrainTag` | yes |
| `place` | yes, human-readable place only |
| `capturedAt` | yes, as date and time of day in capture-local wall clock |
| `altitudeMeters` | yes |
| `coordinates` | yes, at three decimal places and no finer |
| `mapsQuery` | only as the fallback query where no coordinate was recorded |
| `locationSource` | no, provenance is an audit question |
| full-precision latitude / longitude | never, and the type cannot express it |

## Metadata UI Design

### Default Viewer State

Desktop:

- Viewer canvas takes the primary width.
- Top bar contains:
  - sample title
  - `Back to gallery`
  - `Details` toggle
- Metadata opens by default as a quiet right rail. `Details` toggles it when the
  visitor wants the full viewer width.

Mobile:

- Viewer first.
- `Details` appears as a button below the viewer.
- Metadata opens as an inline disclosure sheet below the button, not as an
  overlay that covers the panorama.

### Details Panel Content

Panel title:

- `Field details`

Primary rows:

- `Place`: human-readable location label. The same string is the card
  subtitle, so the two cannot disagree.
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

### Card Thumbnails

The card image is a framed 16:9 view chosen by hand, not a centre crop of the
equirectangular source. A crop of an equirect picks whatever happens to sit at
the centre of the sphere, which is rarely the reason the frame was worth
keeping. The card's `aspect-ratio` is `16 / 9` so the chosen frame is shown
whole rather than shaved.

Widths are `480 / 800 / 1200 / 1600`, picked from the box the card actually
renders at rather than from the grid definition — the page sets
`body { zoom: 1.25 }`, so the element is a quarter larger than the CSS that
describes it, and a `sizes` written from the stylesheet under-serves every
candidate by that much. Measured slots, and what each configuration then draws
for all six cards:

| configuration | slot | needs | picks | six cards |
| --- | --- | --- | --- | --- |
| desktop 1x, 1200-1920px | 303-441 px | same | 480 | 149 KB |
| desktop 2x | 256-367 px | 512-734 px | 800 | 356 KB |
| phone 3x | 324-359 px | 972-1077 px | 1200 | 637 KB |
| tablet 2x, one column | 612-718 px | 1224-1436 px | 1600 | 918 KB |

The ladder keeps the six-card transfer between 149 KB and 918 KB across the
measured configurations while matching each rendered slot more closely.

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
- The UI uses a plain outbound Maps URL. An embedded map would add third-party
  requests, consent questions, and visual weight.

### Privacy And Accuracy Rule

This repository is public, so anything committed here is published whatever the
renderer does with it. The rule is therefore about what may exist in the file,
not about what the UI chooses to draw.

The repository never stores exact coordinates. A runtime display flag is not a
privacy boundary because committed data is already disclosed whether or not the
renderer draws it.

The rule is structural:

- `TrailwalkApproxCoordinates` holds values already rounded to three decimal
  places — roughly 110 m. The rounding happens before the number is written
  into the file, not on the way to the page, so the repository cannot express a
  position more precise than the site publishes.
- Three places discloses no more than `place` and `mapsQuery` already
  do, since those name the trail. The two disclosures are deliberately kept
  consistent with each other; tightening one without the other buys nothing.
- Full-precision values stay in the private review layer and are never copied
  into this repository, its commit messages, or its pull request text.
- Absent is rendered as absent. An item with no recorded fix shows
  `Not recorded`; it is never backfilled by geocoding the place name.
- Public image derivatives are stripped of identifying data before upload. This
  matters most for the HD tier, which is the original file rather than a
  re-encode: the resampling that produces the smaller tiers drops metadata as a
  side effect, whereas here the strip is the only thing standing between the
  source file and the public bucket.
- The HD tier deliberately keeps the colour profile and the lens, exposure and
  capture fields. Those describe the photograph. What is removed is the GPS
  block, the device path in `ImageDescription`, the embedded thumbnail, maker
  notes and any serial or owner tag.
- **The strip is segment-level, not tag-level**, mainly for size: camera-native
  frames carry about 10 MB each of unlabelled vendor payload, on a tier that is
  already 15-62 MB. The pipeline keeps only JPEG segments it can name and stops
  at the primary EOI.
  That payload also holds the camera's own GPS fix in a form no metadata tool
  reports. Worth knowing when reasoning about the ceiling, but not worth
  alarm: this page publishes the trail name, the date, the time to the minute
  and the coordinates at three decimal places, so the full-precision value is
  about 30-45 m from what is already stated, on named public trails.
- Re-check whenever the derivative set is regenerated. This lives outside this
  code; see the media runbook in the ops repo.

## Google Maps URL Pattern

There is one pattern, and its query is whatever the panel is showing, so the
link and the text cannot disagree:

```ts
const query = item.coordinates
  ? `${item.coordinates.latitude.toFixed(3)},${item.coordinates.longitude.toFixed(3)}`
  : item.mapsQuery;
const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
```

`toFixed(3)` is a ceiling, not a rounding step: the stored value is already at
three places, and the call is there so a future stored value that is not cannot
leak through this function.

Use `target="_blank"` and `rel="noreferrer"` on the public link.

## Acceptance Criteria

- No viewer JS/CSS loads before selecting a gallery card.
- Selecting a card opens a draggable 360 viewer with mouse and touch input.
- Full panorama derivative comes from R2 or a configurable asset base URL.
- Poster/highlight image remains visible while the viewer initializes.
- `Back to gallery` returns focus to the selected card.
- `Details` can show place, captured date and time, altitude, coordinates, and
  the Maps action.
- No latitude/longitude value finer than three decimal places appears anywhere
  in the built output, in the panel or in a Maps URL.
- `Back to gallery` cancels any load still in flight rather than letting it
  finish into a hidden shell.
- Reduced-motion users do not get animated camera movement.
- Gallery cards and fallback images are server-rendered before viewer
  hydration.
