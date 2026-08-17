# Diagram design spec

Status: design authority - v0.2
Companion to `docs/diagram-pipeline.md` (the engineering/how-it-is-built doc).
This doc is the visual authority: how a project figure should LOOK and BEHAVE.
The node/edge content of a specific figure is auto-generated per project (e.g.
`docs/diagrams/yaaa.md`); this spec covers the language those figures share.

## 1. Composition principle

A figure is a **deliberate composition**, not an auto-layout graph. The reader
should grasp the thesis before reading a single label. Yaaa reads as a
**layered map**: a left-to-right authority pipeline banded top and bottom by the
IO and governance boundaries.

> passive/proactive input (L0 left)
>   -> SENSE (L1) -> bind (L2) -> Nested ReAct (L3) -> gated write (L4)
>   -> passive/proactive output (L0 right),
> with the governance foundation (L5) as the reviewed feedback lane along the base.

- **IO boundary (L0)** is a full-width top band with four external-facing
  quadrants: passive/proactive input on the left, passive/proactive output on
  the right. Inputs enter, outputs leave; everything crosses a visible boundary.
- **SENSE (L1)** fans in from source adapters and narrows ambient input to
  operator-owned source records.
- **Binding layer (L2)** is the durable center column: memory SSoT is authority,
  while harness/agent memory are rebuildable projections or staged namespaces.
  CONVERSE is the replaceable session harness (not the IO boundary, an output
  surface owner, or write authority).
- **Nested ReAct (L3)** is the bounded reason -> act -> observe -> reflect loop;
  `act` emits an intent proposal only.
- **Write side (L4)** narrows through a single vertical funnel: side-effect
  intent -> procedure manifest -> policy check -> fail-closed gate -> disposition.
  The one fail-closed gate is the single write boundary.
- **Governance foundation (L5)** is a full-width bottom band that re-expands run
  evidence into reviewable artifacts, records decisions and runbooks, reconciles
  memory namespaces, then feeds reviewed changes back up.

The earlier hourglass / waist composition is retired: the "narrow to one gate"
thesis is now carried by the L4 vertical funnel, not by a visual pinch.

Positions are authored by hand (WYSIWYG on the canvas) and are never produced by
a layout algorithm. Each project has its own composition (see 9).

### 1.1 Layout grid and spacing

Spacing is uniform so the layers read as one system, not assorted boxes.

- **Layer (group) padding:** 30px on left / right / bottom, **40px on top** to
  clear the layer label. Every layer container wraps its nodes with these insets.
- **Vertical stacks** (L1, L2): 40px between stacked nodes.
- **L3 ReAct grid:** 28px row gaps, ~25px column gaps.
- **L4 write funnel:** 20px between the stacked funnel nodes - denser than a
  stack by design (a funnel is a tight column).
- **L5 governance pipeline:** a horizontal flow with uniform 100px node gaps that
  fills the band's full width.
- **Bands (L0, L5)** share the same left edge and width so the top and bottom
  boundaries align; their content spans the full width.

These are the current defaults, not a hard grid: a hand-authored position may
deviate locally when a route needs clearance, but insets stay equal across
layers.

## 2. Shape grammar

Blocks carry two related but separate meanings:

- `type` controls the rendered shape.
- `block` states the architectural role: entity, workflow, action, or control.

| Node `type` | Shape | Meaning |
|---|---|---|
| `store` | hard-edged rect + heavy left bar | durable data / owned ledger / run traces |
| `process` | rounded rect | a transform (sense, normalize, reason, converse) |
| `decision` | diamond / hexagon | a routing or policy decision |
| `gate` | **standard rounded control block + side lock glyph** | the single fail-closed action boundary |
| `container` | dashed rounded rect | a logical layer (also a canvas group) |
| `note` | plain text | caption / reading rule |

The gate uses the same block element as the surrounding workflow nodes. Its
special role is carried by the L4 color, the write funnel that narrows into it,
the `fail-closed gate` label, and side lock glyph; no side effect continues
unless the gate explicitly returns a disposition.

### 2.1 Block semantics

| Node `block` | Visual treatment | Meaning | Examples |
|---|---|---|---|
| `entity` | hard-edged block / left authority rail | addressable data, artifact, ledger, source, proposal, manifest, trace | passive input, proactive input, passive output, source records, memory SSoT, harness memory, agent memory, side-effect intent, procedure manifest, run traces, ADR changelog, runbook updates |
| `workflow` | rounded block | reversible or non-side-effecting transformation / coordination | source adapters, normalize, policy router, converse, ReAct task loop, reason, observe, reflect, extract, distill, memory reconciliation |
| `action` | rounded block + small direction marker | side-effecting operation, active emission, or promotion/deploy step | proactive output, act, approve/refuse/defer, promote, apply |
| `control` | diamond, gate, or control-labeled rounded block | policy, review, admission, authority boundary | policy check, review, governance, fail-closed gate |

The full-system view MUST distinguish these blocks. In particular, nodes such as
`normalize` are workflow/action blocks, not entities; nodes such as `source
records` and `procedure manifest` are entities, not work being performed.

### 2.2 Source-record semantics

The L1 store is labeled `source records`, not `owned records`, because the
diagram should first communicate what the records are: normalized input
artifacts. Their ownership is a property:

- `operator-owned` means the deployment keeps a local, auditable copy or pointer
  under the operator's control, with provenance and source identity preserved.
- It does not mean the agent owns the data.
- It does not mean memory, interpretation, conclusion, or write authority.
- Promotion into durable memory happens later at the L2 binding layer and only
  after policy/governance rules apply.

### 2.3 Memory strata semantics

L2 separates durable memory authority from runtime memory surfaces:

- `memory SSoT` is the git-backed authority: the one durable memory record that
  can accept reviewed changes.
- `harness memory` is a rebuildable serving projection for a conversation
  harness or adapter. It may improve recall, but it is not authority.
- `agent memory` is an agent-level namespace or staged memory surface. It may
  hold local/task-specific or pending deltas, but it cannot silently promote
  itself.
- `memory reconciliation` lives in L5 because alignment is a reviewed governance
  action. It compares SSoT, harness projections, and agent namespaces, then
  writes reviewed alignment back through the authority path.

The diagram must not collapse these into a single "memory ledger": doing so
would hide the anti-lock-in claim and make harness-native memory look
authoritative.

### 2.4 Gated action semantics

L4 converts a proposed side effect into an explicit disposition. ReAct can
propose intent, but only the gate can admit the action path.

- `side-effect intent` is a proposal, not permission.
- `procedure manifest` is the versioned write plan the gate can inspect.
- `policy check` evaluates mode, permission, and procedure constraints.
- `fail-closed gate` defaults to no execution. Missing manifest, ambiguity,
  invalid or expired confirmation, timeout, tool error, unknown gate class, or
  insufficient permission cannot pass by omission.
- `approve / refuse / defer` is the post-gate disposition:
  - `approve` admits the specific versioned action under the checked policy.
  - `refuse` denies the intent and stops the side effect.
  - `defer` keeps the intent safely pending without approval or execution. It
    may ask, queue, hold, or wait for missing information, authority, operator
    confirmation, timing, or a safer runtime condition.

`defer` is intentionally not a soft approval. It preserves a pending intent
while keeping the external side effect unexecuted. Resuming a deferred action
must re-enter the relevant policy or gate path; it must not continue by hidden
background retry.

### 2.5 Defer boundary

`defer` is shared vocabulary across Yaaa and its companion read-side systems,
but it sits at different architectural levels:

- **Yaaa L4 action defer** is a side-effect disposition: a proposed action has
  not been approved or refused, so it is held without external effect.
- **Amanuensis runtime deferred** is a read-side pipeline state: an item is held
  because the safe runtime condition is missing, or because a digest rollup cap
  pushed it to a later window. It remains observable and can resume later.
- **Audience fail-closed** is a routing/privacy boundary: uncertain audience
  classification stays in the narrower audience instead of leaking outward. It
  shares the default-deny philosophy, but it is not the L4 write gate.

Amanuensis `deferred` can instantiate Yaaa's `defer = safe pending, no side
effect yet`, but it must not be drawn as the L4 action gate itself. In the
full-system diagram, runtime deferred states belong to SENSE / REASON / SURFACE
or governance detail diagrams; L4 only shows the action disposition.

### 2.6 Governance artifact semantics

L5 is the meta-loop, not another runtime path. It follows the existing Yaaa
design vocabulary:

`OBSERVE -> EXTRACT -> DISTILL -> REVIEW -> PROMOTE -> RECONCILE -> DEPLOY`.

- `run traces` are raw evidence from conversations, tool calls, procedures, and
  failures.
- `extract` identifies candidate memories, SOP changes, prompt/skill changes,
  and policy signals.
- `distill` turns noisy traces into structured, reviewable artifacts.
- `review` is the human gate before authority changes.
- `promote` lands approved deltas into the relevant source of truth.
- `memory reconciliation` aligns reviewed memory across the SSoT, harness
  projections, and agent namespaces; it is not automatic model memory mutation.
- `ADR changelog` records architecture decisions and rationale when the change
  affects system shape.
- `runbook updates` harden operator procedures, recovery steps, and rollback
  paths.
- `apply` means the reviewed artifact changes future runtime behavior.

## 3. Color semantics

Role-based, not decorative. Each layer owns a color; the project accent tints
figure chrome (title, frame), never the semantic roles.

| Layer / role | Hex | Reads as |
|---|---|---|
| L0 IO boundary | `#2f855a` | human/agent ingress and egress surface |
| L1 SENSE | `#0e7490` | open, high-throughput, non-destructive intake |
| L2 binding / L5 governance | `#334155` | durable, authoritative, audited (onyx neutral) |
| L3 ReAct | `#7c3aed` | bounded cognition, observable exits |
| L4 gated write | `#d97706` | side effects, constrained, needs verification |
| admitted / surface | `#2f855a` | passed output, back to the human |
| project accent (Yaaa) | `#2c4e8a` (`systems`) | figure chrome only |

Base surfaces: paper `#f6f7f5`, ink `#1b1d1f`, muted `#8a8f92`.

This is a **semantic** palette used as strokes / light tints / small chips, not
a rank-cycled categorical fill palette. The `dataviz` validator flags the slate
and cyan as low-chroma and amber contrast at 2.96; those are intentional (slate
= neutral authority) and satisfied by the validator's secondary-encoding escape:
every mark carries a distinct shape, an always-present text label, a layer
container, and a fixed position - identity never rests on color alone. The amber
gate additionally ships the `fail-closed gate` label and a side lock icon.

The IO boundary uses the admitted/surface green. It is not an authority layer:
it names the outside-facing event and surface boundary.

| IO quadrant | Initiated by | Direction | Examples | Route |
|---|---|---|---|---|
| passive input | environment / timer / subscribed source | outside -> agent | RSS feed, docs, calendar events, logs | SENSE / source adapters |
| proactive input | operator | human -> agent | prompt, reply, approval, correction | CONVERSE |
| passive output | agent state made available for pull/check | agent -> human-readable surface | visual inbox, trace view, memory/project view | CONVERSE surface |
| proactive output | agent | agent -> human | push, ask, alert, result notification | CONVERSE or gated action result |

`passive output` is a valid concept only when it means a pull/check surface: the
operator decides when to inspect it. It must not be treated as a notification,
which belongs to `proactive output`. CONVERSE is the replaceable session handler
inside the binding layer; it may render or update surfaces, but it is not a
second IO boundary.

## 4. Edge language

| `edge-kind` | Style | Meaning |
|---|---|---|
| `data` | solid + filled arrow | deterministic data / control transfer |
| `authority` | thick solid | authority transition (durable memory, promotion) |
| `async` | dashed | trace collection / background loop |
| `sync` | double arrow | negotiated / two-way state |
| `funnel` | thicker solid (optionally converging) | side-effect intent constrained before the gate |

Edges are colored by their **source layer**, and each arrowhead is filled to
match its line - never a neutral gray that would read as a separate element.
Arrowheads land on the **box boundary** (a side midpoint or an explicit port
side), never the box center.

### 4.1 Routing

- Default: **orthogonal, minimum bends** - straight when the two boxes share a
  band, a single elbow otherwise. Never a double (Z) elbow. This includes the
  write funnel: side-effect -> manifest -> policy-check -> gate render as a clean
  vertical orthogonal column.
- **Prefer a straight edge by alignment.** When one node feeds another across a
  gap (e.g. `act` -> `side-effect intent`), align their centers on the shared
  axis so the edge is a single straight segment onto the boundary midpoint,
  rather than an elbow that grazes a neighbour.
- **Port hints for stacked targets.** An edge into a node stacked behind others
  (e.g. `Nested ReAct loop` -> `fail-closed gate`, which sits below the rest of
  the L4 funnel) sets explicit `fromSide` / `toSide` on the canvas edge; the
  renderer honours them and routes the riser through a clear gap instead of
  piercing the intervening nodes.
- **Optional convergence.** A `funnelStraight` render flag can draw `funnel`
  edges as converging diagonals into the gate (the retired hourglass reading). It
  is off by default; the shipped compositions keep funnel edges orthogonal.

Full obstacle-avoiding auto-routing is still out of scope; long edges are cleared
by hand-authored positions plus the port hints above. Known residual: authority
feedback edges from L5 back to `memory SSoT` (a top-of-column hub) can graze the
intervening stack; fully resolving it needs per-side port distribution.

## 5. Terminology reference

This terminology is part of the diagram contract. Short labels can appear on the
figure; the reference below carries the precision.

| Term | Meaning | Non-goal / guardrail |
|---|---|---|
| `memory SSoT` | Git-backed durable memory authority. Reviewed memory deltas land here before they can affect future runs. | Not model-native memory, session recall, harness cache, or a UI surface. |
| `harness memory` | Rebuildable serving projection derived from the memory SSoT for a conversation harness, adapter, or local runtime. | Not an independent source of truth; not vendor-owned memory. |
| `agent memory` | Agent-level namespace for task-local state, staged deltas, or run-scoped recall. | Not self-promoting authority; not allowed to silently rewrite the SSoT. |
| `memory reconciliation` | Reviewed governance workflow that compares SSoT, harness projections, and agent namespaces, then emits reviewed alignment. | Not automatic bidirectional sync; not hidden background mutation. |
| `fail-closed gate` | The single write boundary. It defaults to no execution and permits a side effect only when an explicit manifest, policy check, and required grant produce an allowed disposition. | Not a best-effort router; not an exception path; not bypassable by ReAct or a harness. |
| `action disposition` | The post-gate outcome for a proposed side-effect intent: approve, refuse, or defer. | Not the intent itself; not the gate tier; not hidden execution. |
| `defer` | Safe pending: hold an intent or item without executing its side effect until authority, context, timing, or runtime conditions are available. | Not approval; not refusal; not execution; not silent background retry. |
| `runtime deferred` | A read-side or surface pipeline state where an item is preserved for later processing and remains observable. | Not L4 authorization; not dead-letter; not data loss. |
| `audience fail-closed` | A privacy routing rule: uncertain audience classification stays in the narrower audience rather than leaking outward. | Not the action gate; not a permission grant. |
| `mode routing` | Routing by session mode, sensitivity, locality policy, and task risk. It determines which model, tool, and read accessor may be used. | Not just model routing; not an invisible model preference. |
| `reviewed namespace alignment` | Human-reviewed alignment across the memory SSoT, harness-local projections, and agent-level namespaces. | Not automatic sync; not silent model memory mutation; not a second memory of record. |
| `reviewed runtime behavior` | An approved artifact has been applied so future runtime behavior can change. | Not product launch language; not unreviewed live mutation. |
| `authority change` | A durable source-of-truth change: memory SSoT, policy, ADR, procedure manifest, runbook, or skill/prompt delivery. | Not a transient answer, trace, session state, or UI notification. |
| `intent proposal only` | ReAct `act` may formulate a side-effect intent. Execution must leave through L4. | ReAct does not execute external side effects directly. |
| `Nested ReAct` | The ReAct loop is nested inside Yaaa's larger architecture: called by the binding layer, bounded by memory SSoT/projections and the action gate, and observable by governance. | It is not the system owner, memory authority, router authority, or write boundary. |

### 5.1 Layer detail check

The full-system diagram intentionally shows only enough detail for each layer to
avoid authority confusion.

| Layer | Required detail | Current coverage |
|---|---|---|
| L2 Binding | Memory SSoT authority, harness/agent memory projections, explicit mode/model/tool routing, and a replaceable session harness. | `memory SSoT` supplies governed context, `harness memory` serves rebuildable projection, `agent memory` carries staged namespace state, `policy router` supplies mode routing, and `converse` remains a session harness. |
| L3 Nested ReAct | A closed reason -> act -> observe -> reflect loop, with `act` limited to intent proposal. | The detail loop closes back to `reason`; `act` points to L4 `side-effect intent`. |
| L4 Gated Action | Side-effect intent, versioned procedure manifest, policy check, fail-closed gate, and approve/refuse/defer disposition. | The write path narrows through those nodes before any action can run, stop, hold, or resume through policy. |

The diagram still omits implementation-specific dispatcher internals, procedure
enumeration, per-model policy tables, and run-result schemas. Those belong in
drilldown docs or runbooks, not in the concept figure.

## 6. Reading levels (semantic zoom)

- **Level 0 (high-level):** one summary node per layer + cross-layer edges = the
  layered map. This is the static, no-JS baseline.
- **Level 1 (hover/focus):** a node raises its connected flow; unrelated marks
  dim.
- **Level 2 (drill-in):** zooming into / double-clicking a layer reveals that
  layer's internal detail nodes and intra-layer edges; other layers dim. The
  detail is the same data, surfaced by zoom, never a page swap.

Detail is present in the DOM at all levels (for parity + a11y) and hidden at
level 0 by style, so drift verification always sees the full node/edge set.

## 7. Interaction model

- Pointer: scroll / +/- to zoom, drag to pan, double-click a layer to drill in,
  double-click background or `0`/`Esc` to reset.
- **Keyboard:** zoom (+/-), pan (arrows), reset (0) reachable without a mouse;
  layers and nodes are focusable with visible focus rings.
- **No-JS baseline:** the static high-level figure is fully readable; all of the
  above is progressive enhancement layered on the inline SVG.

## 8. Accessibility & motion

- `<svg role="img">` with an `aria-label`; every node group has a `<title>`; add
  a `<desc>` summarizing the thesis.
- Contrast meets WCAG AA for text; color is never the sole carrier of identity
  (shape + label + container + position).
- `prefers-reduced-motion`: flows resolve to their end state, no looping and no
  auto-zoom; zoom remains available on explicit input.

## 9. Per-project composition

Each project keeps the shared grammar and its own accent + shape.

| Project | Accent | Composition |
|---|---|---|
| Yaaa | `systems` | IO band -> SENSE -> bind -> Nested ReAct -> gated write funnel (L1-L4 as left-to-right columns) -> governance band + reconciliation |
| Amanuensis | `systems` | read -> triage -> rank -> deliver pipeline + delivery ledger |
| Beagle | `embodied` | record -> track -> remind cognitive-support loop |
| commonplace | `worlds` | bridge / toy-world co-presence architecture |

## 10. Provenance

The shape grammar, color semantics, and accessibility contract were cross-checked
against an editorial diagram-skill render of the same content. Findings folded
into this spec: the focal-accent discipline, the accessible-SVG contract, and the
optional `funnel` convergence in 4.1.

v0.2 retires the hourglass composition for a left-to-right layered map (1), adds
the uniform spacing grid (1.1), colored arrowheads (4), and port-hinted routing
(4.1). The write funnel now renders as an orthogonal vertical column by default.
