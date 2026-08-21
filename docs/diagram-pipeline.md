# Portfolio diagram pipeline

Status: spec (interface freeze) - v0.1
Scope: shared, reusable architecture-diagram system for every project concept
page (Yaaa, Amanuensis, Beagle, commonplace, ...). One engine, one canvas per
project.

## Why this exists

Each project concept page needs a bespoke architecture figure that:

- expresses a **deliberate composition** (e.g. Yaaa's four-quadrant IO boundary
  / SENSE / narrow-write funnel), not a generic auto-layout graph;
- uses a **semantic visual language** (shape grammar + color-by-role);
- supports **interactive semantic zoom**: a high-level view that zooms into
  per-layer detail (polished visualization);
- ships **accessible and fast** on a static Astro site: a deterministic
  build-time base render plus client-side d3 for interaction (there is no
  zero-JS constraint anywhere in the portfolio);
- stays **verifiable** against a single source of truth so figures cannot
  silently drift from the intended structure.

No single off-the-shelf tool covers all of this, so the pipeline composes
open pieces around one source of truth.

## Layers (locked decisions)

| Layer | Choice | Role |
|---|---|---|
| **L0 data/logic SoT** | **JSON Canvas** (`.canvas`, one per project) | typed nodes + edges + **deliberate positions**, editable WYSIWYG (Obsidian) |
| **job-A acceptance** | **Mermaid**, derived from the canvas | structural correctness check; renders natively in GitHub for review |
| **L1+L2 render + interaction** | **shared d3 component** (Astro island) | reads canvas JSON -> interactive SVG with semantic zoom |
| **drift gate** | **content-parity check** (CI) | fails closed if the shipped SVG and the SoT disagree on nodes/edges |
| **styling** | CSS + design tokens | tokens, reduced-motion, print styles |

### The one hard guardrail

**d3 renders the canvas's manual coordinates; it never runs auto-layout.**
`d3-force`, `d3-hierarchy`, and any layout algorithm are prohibited for
placement. Positions are authored by hand in the canvas (that is the whole
point of the WYSIWYG choice). d3 is the render + interaction engine only:
zoom, level-of-detail, transitions, styling. Violating this destroys the
deliberate composition.

## L0 - JSON Canvas authoring convention

A project canvas is a standard JSON Canvas 1.0 file. We layer a small tag
convention on top (all optional metadata lives in the node/edge `label` or a
sidecar; see "encoding" below) so the render step can apply the shape grammar.

### Node roles (`type`)

`type` controls the rendered shape. A separate optional `block` marker records
the architectural role so a full-system figure can distinguish static entities
from workflow/action/control blocks without inventing one-off styling.

| `type` | Shape rendered | Meaning |
|---|---|---|
| `store` | hard-edged rect (optional heavy left bar) | durable data / owned ledger / run traces |
| `process` | rounded rect | a transform: sense, normalize, reason, converse |
| `decision` | hexagon | routing / policy decision |
| `gate` | standard rounded control block + side lock glyph | fail-closed action boundary |
| `container` | dashed rounded rect | a logical **layer** (also a Canvas group) |
| `note` | plain text, no box | caption / reading rule |

### Block roles (`block`)

| `block` | Meaning | Examples |
|---|---|---|
| `entity` | addressable source, artifact, ledger, proposal, manifest, trace | passive input, proactive input, passive output, source records, memory SSoT, harness memory, agent memory, procedure manifest, ADR changelog, runbook updates |
| `workflow` | transform or coordination step with no direct side effect | source adapters, normalize, policy router, converse, ReAct reason/observe/reflect, distill, memory reconciliation |
| `action` | side-effecting operation, active emission, or promotion/deploy step | proactive output, act, approve/refuse/defer, promote, apply |
| `control` | policy/review/admission/authority boundary | policy check, review, governance, fail-closed gate |

### Layers = Canvas groups

Each architecture layer (e.g. Yaaa L1..L5) is a **JSON Canvas group node**.
The group is both the visual dashed container AND the semantic-zoom target: the
high-level view shows groups collapsed to a labeled region; zooming into a
group reveals its member nodes (the per-layer detail graph).

### Edge kinds (`edge-kind`)

| `edge-kind` | Style | Meaning |
|---|---|---|
| `data` | solid + filled arrow | deterministic data / control transfer |
| `authority` | thick solid | authority transition (durable memory / promotion) |
| `async` | dashed | trace collection / background loop |
| `sync` | double arrow | negotiated / two-way state |
| `funnel` | constrained write path before a gate | side-effect intent constrained before a write |

### Encoding (how tags ride on stock JSON Canvas)

JSON Canvas has no custom fields, so tags are encoded deterministically and
losslessly:

- **node `type` / `block` / `layer` / `lod`** -> encoded in the node `color` slot is NOT used for this
  (color is reserved for the project accent). Instead the node `text` starts
  with a hidden marker line `<!--type:gate,block:control,layer:L4,lod:0-->` on
  its own line; the render strips it. Rationale: survives round-trip through
  Obsidian, stays visible/diffable in the raw file, needs no sidecar.
- **edge `edge-kind`** -> encoded as a leading token in the edge `label`
  (`authority: candidate -> memory`); render strips the `kind:` prefix.
- **project accent** -> not stored in the canvas; injected by the render step
  from the project's design token (see L1).

A canvas authored with none of these markers still renders (defaults:
`process` node, `data` edge) - the markers are progressive refinement, never a
hard requirement to open the file.

## job-A - Mermaid acceptance view

A build script parses the canvas and emits `<project>.mmd` (a `flowchart`)
capturing **nodes + edges + layer grouping only** - no positions, no styling.
This is the structural contract:

- committed next to the canvas, rendered natively in GitHub for PR review;
- its node/edge set is the reference the drift gate checks the SVG against;
- auto-derived, never hand-edited, so job-A can never silently drift from the
  SoT.

Layout in the mermaid view is auto (that is fine - it is an acceptance graph,
not the presentation).

## L1+L2 - the shared d3 component

One component, used by every concept page.

### Astro contract

```
<ProjectDiagram
  canvas={"yaaa"}          {/* loads src/diagrams/yaaa.canvas          */}
  accent={"systems"}       {/* token name: systems|embodied|worlds     */}
  title={"..."}            {/* accessible figure name                  */}
  interactive={true}       {/* false => static base SVG only, no island */}
/>
```

### Two-phase render (build-time base + runtime d3)

1. **Build time (deterministic renderer, no d3).** During `astro build`, the
   component calls `render.mjs` - a plain, dependency-free renderer - to emit a
   **static inline SVG** of the high-level view from the canvas's manual
   coordinates. This is what ships in the HTML: it is crawlable and paints on first load. It carries the full
   `data-*` annotation set (see below). d3 is deliberately NOT used at build,
   so the build stays d3-free and fast.
2. **Runtime (interaction layer).** On concept pages, a lazily loaded
   island imports d3 and **attaches to the already-present inline SVG**, adding
   `d3-zoom` pan/zoom, semantic-zoom level-of-detail, and flow animation. The
   base SVG doubles as the loading state; zero-JS operation is not a support
   target.

d3 is imported as the full bundle (deliberate: a shared, evolving component
across many projects and diagram types; avoids per-diagram import churn). It is
loaded **only** by the interactive island on concept pages, never on the
landing or other routes, and never blocks first paint.

### Derived static flow figures (canvas subsets)

A page may need a small static figure that shows one slice of a canvas - for
example a per-stage flow strip next to the full architecture diagram. Do NOT
draw a second SVG for this; derive it from the same canvas at build time:

```
import { renderSvg } from '.../diagram/render.mjs';
const doc = JSON.parse(architectureCanvas);
const svg = renderSvg(JSON.stringify({
  nodes: doc.nodes
    .filter((n) => ids.includes(n.id))
    // promote detail nodes to the always-visible level for the excerpt
    .map((n) => ({ ...n, text: n.text?.replace('lod: 1', 'lod: 0') ?? n.text })),
  edges: doc.edges.filter((e) => ids.includes(e.fromNode) && ids.includes(e.toNode)),
}), { title }).svg;
```

The excerpt inherits colors, chips, and routing from the pipeline and cannot
drift from the canvas SoT. Detail-node visibility CSS is scoped to the
interactive figure, so raw `renderSvg` output elsewhere shows its nodes
unconditionally. First shipped on the Amanuensis concept page (stage sections
derive from `amanuensis-architecture.canvas`).

### Semantic zoom / level-of-detail (LOD)

- **Level 0 (default):** high-level view. Layer groups render as labeled dashed
  regions; only cross-layer edges and headline nodes are shown.
- **Level 1 (zoom in on a region):** `d3-zoom` transform crosses a scale
  threshold for a group -> that group's member nodes and intra-layer edges fade
  in; unrelated groups dim. This is the SoT "per-layer detail" (the second,
  detailed graph) surfaced by zoom rather than a page swap.
- **Level 2 (focus a node):** node hover/focus raises its connected flow and
  opens its claim card.

LOD is driven by the zoom scale and the group a node belongs to - all data
already present in the canvas. No network fetch, no re-layout.

### Data-* annotation contract (parity + a11y)

Every rendered SVG (build-time and runtime) MUST annotate:

```
<g data-node="memory-ssot" data-type="store" data-block="entity" data-layer="L2">
  <title>memory SSoT</title> ...
</g>
<g data-edge="governance->memory-ssot" data-kind="authority"> ... </g>
```

- `data-node` / `data-edge` ids are the canvas node ids and `from->to` pairs.
- `data-block` exposes the entity / workflow / action / control distinction for
  styling, filtering, and legends.
- `<title>` (and `aria-label` on the root `<svg role="img">`) give the
  accessible name; these double as the parity anchors.
- IDs are stable and kebab-cased from the canvas.

## Drift gate (job-C verification)

A deterministic CI script asserts **content parity** between the SoT and the
shipped SVG. It checks presence, **not layout** - deliberate geometry is
allowed to diverge; the node/edge *set* is not.

Algorithm:

1. Parse the canvas -> `model = {nodes, edges, layers}` (read dynamically from
   the file; never a hard-coded expected list).
2. Parse the build-time SVG -> `svg = {nodes, edges, layers}` from `data-*`.
3. Diff and **fail** on any of:
   - node in `model` missing from `svg`, or in `svg` not in `model`;
   - edge mismatch (same rule);
   - node whose `data-layer` disagrees with the canvas group;
   - node whose `data-block` is missing or disagrees with the canvas marker.
4. **Fail closed:** an SVG with zero `data-node` annotations is a FAIL
   ("cannot be verified"), never a pass-on-empty.
5. Labels normalized (trim/case) before comparison.

Output lists exact missing/extra ids so the fix is mechanical.

Scope limit (honest): the gate proves the figure carries the same *content* as
the SoT. It does **not** prove the composition's *meaning* is right (an edge
drawn backwards, a funnel narrowing the wrong way). The mermaid acceptance view
rendered in the PR is the human cross-check for meaning.

## Styling, a11y, motion

- Colors come from design tokens; each project passes one **accent** token
  (`systems` `#2c4e8a`, `embodied` `#657052`, `worlds` `#985e49`). Role
  encoding (read/write/gate/...) uses a fixed semantic ramp shared across
  projects; the accent tints the project-specific highlights.
- `role="img"` + `aria-label` on the SVG; every node group has a `<title>`.
- **Keyboard:** zoom and region focus MUST be reachable without a mouse
  (tab to regions, +/- to zoom, 0 to reset). `d3-zoom` is pointer-first, so the
  island adds explicit keyboard handlers and focus rings.
- **Reduced motion:** with `prefers-reduced-motion`, flows resolve to their end
  state, no looping and no auto-zoom; zoom remains available on explicit input.

## Per-project mapping

All four are node/edge flows, so the generic model covers them; each uses its
project accent.

| Project | Accent | Shape of the figure |
|---|---|---|
| Yaaa | `systems` | passive/proactive input -> SENSE / CONVERSE -> bind -> narrow-write funnel -> passive/proactive output + governance foundation |
| Amanuensis | `systems` | read -> triage -> rank -> deliver pipeline + delivery ledger |
| Beagle | `embodied` | record -> track -> remind cognitive-support loop |
| commonplace | `worlds` | bridge / toy-world co-presence architecture |

## Repository layout

```
src/diagrams/<project>.canvas        # L0 SoT (one per project)
src/diagrams/<project>.mmd           # derived acceptance view (generated)
src/components/diagram/
  ProjectDiagram.astro               # Astro contract + build-time SSR base SVG
  render.ts                          # canvas JSON -> annotated SVG (shared)
  island.ts                          # runtime d3 zoom/LOD/anim enhancement
scripts/diagram/
  canvas-to-mermaid.mjs              # job-A derive
  parity-gate.mjs                    # drift gate (CI)
docs/diagram-pipeline.md             # this spec
```

## Build vs adopt

- **Adopt:** JSON Canvas format; canvas->mermaid derivation follows existing
  community exporters (kept as a small in-repo script to avoid an Obsidian
  runtime dependency in CI).
- **Build (thin, in-repo):** the render step (canvas -> annotated styled SVG)
  and the parity gate. No off-the-shelf tool produces the semantic shape
  grammar + `data-*` contract we need, and both are small.
- **Not used as ship path:** Penpot / draw.io / Figma remain optional
  composition scratchpads only - their SVG export is not the annotated,
  CSS-animatable artifact this pipeline requires.

## Design decisions and future work

Status of the questions this pipeline opened with:

1. **Detail graphs - settled (nested).** Per-layer detail is authored as nested
   group members in the one canvas (single file; zoom expands it), not as
   separate detail canvases.
2. **Edge routing - landed; obstacle-avoidance still open.** Edges now route
   orthogonally to box boundaries (`routeIoBoundary` / `routeOrthogonal` /
   `routeSided` in `render.mjs`), with funnel edges kept straight
   boundary-to-boundary to preserve the "narrow to one gate" reading. This
   replaced the v0.1 center-to-center draw. Crossing-minimizing / lane-based
   routing that avoids unrelated boxes is the remaining work, tracked with the
   d3 interaction rewrite. Positions are refined in Obsidian (WYSIWYG), not by
   an auto-layout pass.
3. **d3 chunk loading - open.** Still eager (deferred module, non-blocking);
   revisit deferring with a dynamic `import()` until first interaction (~90 kB
   gz) if the load budget matters.
4. **Parity-gate scope - open.** Runs against the build-time base level only;
   extending it to the runtime-expanded detail level is deferred.
