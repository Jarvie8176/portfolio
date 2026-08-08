# Trailwalk Gallery Figma Rebase v2

Date: 2026-08-07

## Figma

- File: https://www.figma.com/design/RZyFCUrEODKfNQWK0uL62V
- Active page: `Trailwalk detail-page rebase - gallery v2`
- Superseded page: `Trailwalk Gallery v1 - viewer first`

Related implementation/UI evaluation:

- `docs/trailwalk-draggable-viewer-metadata-ui.md`

## Baseline

This mock is rebased from the current Trailwalk detail page implementation:

- Source page: `src/pages/projects/trailwalk.astro`
- Visual system: warm off-white page background, forest-green accent, restrained borders, sticky top nav, DM Sans body type, Lora editorial headings.
- Placement: insert gallery after `Origin Story` and before `The Experience`.

## Public-Facing Scope

The public page gallery is responsible for selection only.

1. User scans a set of real trail captures.
2. User clicks a gallery card.
3. Page opens a selected 360 view.
4. The 360 view is draggable/pannable.
5. Metadata is optional and hidden behind a `Details` disclosure.

Do not make metadata the primary selected state. The selected state should remain visual and interactive.

## Frame Inventory

- `Read me / rebase note`: handoff context inside the Figma file.
- `A / Desktop Trailwalk page with gallery inserted`: page composition with gallery inserted after Origin.
- `B / Desktop selected 360 viewer section`: selected 360 viewer as the primary interaction state.
- `C / Desktop viewer with optional details and states`: details/metadata disclosure and fallback notes.
- `D / Mobile Trailwalk gallery section`: mobile selection flow.
- `E / Mobile selected viewer and details disclosure`: mobile viewer plus optional metadata.

## Handoff Inputs

Use the six migrated JPG candidates as initial content inputs:

- `IMG_20260530_113007_00_010.jpg`
- `IMG_20260601_103129_00_merged.jpg`
- `IMG_20260602_104126_00_merged.jpg`
- `IMG_20260602_112102_00_041.jpg`
- `IMG_20260602_112102_00_merged.jpg`
- `IMG_20260608_142315_00_020.jpg`

Local source location:

- Held outside this repository.

Planned production storage:

- Public per-image derivatives served from `https://media.fnpg.me`.

## Output Spec For Hi-Fi Mock Agent

Deliver a higher-fidelity Figma page that keeps the v2 frame names or adds clearly versioned copies.

Required outputs:

- Desktop gallery section embedded in the current Trailwalk page rhythm.
- Desktop selected 360 viewer state.
- Desktop optional metadata/details state, including coordinate and Google Maps
  action variants.
- Mobile gallery selection flow.
- Mobile selected 360 viewer with details disclosure.
- Clear annotations for image derivative needs:
  - raw 360 image
  - gallery thumbnail crop
  - selected viewer poster/crop
  - optional metadata payload

Constraints:

- Preserve Trailwalk page tone and typography.
- Use gallery cards as entry points, not as persistent dashboard widgets.
- Keep cards at 8px radius or less.
- Avoid visible instructional copy beyond natural UI labels.
- Keep metadata outside the panorama canvas; use an HTML `Details` disclosure or
  side rail rather than putting place data inside the viewer controls.
- Gate exact coordinate display behind publication approval; otherwise show an
  approximate area or location label only.
- Do not upload real private/location-sensitive photos into Figma unless explicitly authorized.
- Safe placeholders are acceptable for Figma; production will use R2-hosted assets.

## Current QA Notes

The v2 Figma page has been visually checked after rebase and one polish pass:

- Desktop gallery heading spacing fixed.
- Desktop thumbnail rail label overlap fixed.
- Mobile viewer/details layout checked.
- Real photos were not uploaded to Figma; placeholders remain intentional.
