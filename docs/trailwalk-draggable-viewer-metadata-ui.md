# Trailwalk Draggable Viewer And Metadata UI

Date: 2026-08-07

## Local Implementation Check

Current `trailwalk-detail-page` does not contain a 360 panorama viewer yet.

Observed state:

- `src/pages/projects/trailwalk.astro` is a static Astro page with no gallery or
  viewer component.
- `package.json` has no 360 viewer dependency.
- Existing Trailwalk links use Google Maps search URLs only for two narrative
  origin links.
- Existing client-side JavaScript is intentionally small, so the gallery viewer
  should remain a progressive enhancement loaded after user intent.

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

Recommended dependency:

```sh
npm install @photo-sphere-viewer/core
```

Optional later dependencies:

```sh
npm install @photo-sphere-viewer/markers-plugin
npm install @photo-sphere-viewer/equirectangular-tiles-adapter
```

## Data Contract

```ts
export type TrailwalkGalleryItem = {
  id: string;
  title: string;
  shortPlace: string;
  locationLabel: string;
  terrainTag: string;
  capturedAt: string;
  altitudeMeters?: number;
  locationSource: "jpg_exif" | "original_insp_exif" | "manual_review";
  mapsQuery: string;
  googleMaps?: {
    label: string;
    href: string;
  };
  assets: {
    highlight: string;
    highlight2x?: string;
    panorama: string;
    poster?: string;
  };
  initialView?: {
    yaw?: string;
    pitch?: string;
    zoom?: number;
  };
  notes?: string;
};
```

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
- `Captured`: formatted date.
- `Elevation`: altitude in meters if available.
- `Coordinates`: always `Approximate area only`. This row exists to set the
  visitor's expectation, not to carry a value.

Actions:

- `Open approximate area`, built from the place name in `mapsQuery`.

Secondary rows:

- `Location source`: `JPG EXIF`, `INSP EXIF`, or `Manual review`.
- `Asset`: optional non-public/dev-only note; do not show R2/source key in the
  public UI.

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

This repository is public. Exact trail coordinates are therefore not a
publish-time decision here; they are simply out of scope for this codebase.

An earlier draft of this design used a per-image `publicApproved` flag to gate
exact coordinate display. That was removed. A runtime toggle only helps if the
data it guards is safe to have around, and in a public repository the exact
coordinates would have to be committed in order for the flag to have anything
to switch on. The flag would have been the control, and the committed
coordinates would have been the leak.

The rule is now structural:

- `TrailwalkGalleryItem` has no latitude/longitude field, so no build can emit
  one.
- Location reaches the public surface only as a place name (`mapsQuery`,
  `locationLabel`), which resolves to an approximate area.
- Exact values stay in the private review layer and are never copied into this
  repository, its commit messages, or its pull request text.
- Public image derivatives are EXIF-stripped before upload. Verify this again
  whenever the derivative set is regenerated; it is the other half of the same
  guarantee, and it lives outside this code.

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
