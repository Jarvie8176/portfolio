# Diagram design spec

Status: design authority - v1.0
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
>   -> SENSE (L1) -> bind (L2) -> Bounded ReAct (L3) -> gated write (L4)
>   -> passive/proactive output (L0 right),
> with the governance foundation (L5) as the reviewed feedback lane along the base.

- **IO boundary (L0)** is a full-width top band with four external-facing
  quadrants: passive/proactive input on the left, passive/proactive output on
  the right. Inputs enter, outputs leave; everything crosses a visible boundary.
- **SENSE (L1)** fans in from source adapters and aggregates available context
  into a unified source-record format with provenance attached.
- **Binding layer (L2)** is the durable center column: memory SSoT is authority.
  Harness/agent memory remain local surfaces or staged namespaces. The policy
  router chooses mode/model/tool paths, with local routing for sensitive context
  unless a scoped cloud route is explicitly allowed. CONVERSE is the replaceable
  session surface the router points to; it has no memory or write authority.
- **Bounded ReAct (L3)** is the reason -> act -> observe -> reflect loop.
  L2 calls it with memory/routing context; `act` emits an intent proposal only.
- **Write side (L4)** narrows through a single vertical funnel: side-effect
  intent -> procedure manifest -> policy check -> fail-closed gate -> disposition.
  The single boundary keeps outside-world mutation in one auditable path across
  every harness, runner, and model adapter. At the high level, L4 exits to L0
  proactive output for approved asks/results and to L5 governance for traces.
- **Governance foundation (L5)** is a full-width bottom band that re-expands run
  evidence into reviewable artifacts, records decisions and runbooks, reconciles
  memory namespaces, then feeds reviewed changes back up. It is a foundation
  because it is the reviewed layer that changes the rules future runs stand on.

The earlier hourglass / waist composition is retired: the "narrow to one gate"
thesis is now carried by the L4 vertical funnel, not by a visual pinch.
L1-L4 layer containers share the same top y-position in the full-system figure;
their heights may differ, but their labels and top boundaries should read as one
middle runtime band.

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

The concept page may show the four roles as a compact visual key. Avoid turning
that key into an explanatory paragraph; the diagram should carry the reading
order.

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

- An `owned record` means the deployment keeps a local, auditable copy or
  pointer under the operator's control, with provenance and source identity
  preserved.
- The ownership claim applies to the record in the deployment. It does not grant
  the agent ownership over source data, interpretation, conclusion, or write
  authority.
- Promotion into durable memory happens later at the L2 binding layer and only
  after policy/governance rules apply.

### 2.3 Memory surface semantics

L2 separates durable memory authority from runtime memory surfaces:

- `memory SSoT` is the git-backed authority: the one durable memory record that
  can accept reviewed changes.
- `harness memory` is a local recall / serving state surface for a conversation
  harness or adapter. It may grow where the work happens, but it is not
  authority.
- `agent memory` is an agent-level namespace or staged memory surface. It may
  hold local/task-specific or pending deltas, but it cannot silently promote
  itself.
- `memory reconciliation` lives in L5 because alignment is a reviewed governance
  action. It compares the SSoT, harness-local memories, and agent namespaces,
  then writes reviewed alignment back through the authority path.

The diagram must not collapse these into a single "memory ledger": doing so
would hide the anti-lock-in claim and make harness-native memory look
authoritative. "Synchronization" is too broad for this invariant unless it is
qualified as reviewed reconciliation; the intended reading is federated memory
growth with one git-backed conflict ledger, not automatic bidirectional sync.

Concept copy should call these "three memory surfaces" rather than using a
geological metaphor.

### 2.4 Gated action semantics

L4 converts a proposed side effect into an explicit disposition. ReAct can
propose intent, but only the gate can admit the action path.

The one-boundary design is deliberate. A personal assistant can collect many
read paths and many conversation surfaces, but outside-world mutation should
have one place where target, account, permission, confirmation, sensitivity,
procedure version, and failure behavior are checked. A new harness or model
adapter may propose intent; it does not bring custom write authority with it.

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

The concept page should ground this rule with one plain scenario. Example: if
the assistant wants to reschedule an appointment, it may draft the calendar
change and message, but L4 must see a manifest that names the recipient, account,
timing, text, sensitivity, and required confirmation. Ambiguous recipient,
expired approval, missing manifest, or unknown action class resolves to defer or
refuse; no message is sent quietly.

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
  memories, and agent namespaces; it is not automatic model memory mutation.
- `ADR changelog` records architecture decisions and rationale when the change
  affects system shape.
- `runbook updates` harden operator procedures, recovery steps, and rollback
  paths.
- `apply` means the reviewed artifact changes future runtime behavior.

This layer also supplies the "traceable decisions" concept-page invariant:
agents should reason against reviewed decisions, SOPs, runbooks, and procedure
manifests instead of guessing repetitive operational policy from a blank prompt.
Do not surface "MADR protocol" as a primary public-page label; use it as internal
decision discipline behind the broader claim that runtime behavior is grounded in
reviewed artifacts.

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

Concept copy may say passive sources arrive on timers or subscriptions. It
should not claim that the entire read side runs asynchronously on timers; reads
can also be pulled by an interactive task or routed accessor.

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
  (e.g. `ReAct task loop` -> `fail-closed gate`, which sits below the rest of
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
| `harness memory` | Local recall or serving state that may grow inside a conversation harness, adapter, or local runtime. | Not an independent source of truth; not vendor-owned memory; not automatic sync. |
| `agent memory` | Agent-level namespace for task-local state, staged deltas, or run-scoped recall. | Not self-promoting authority; not allowed to silently rewrite the SSoT. |
| `memory reconciliation` | Reviewed governance workflow that compares SSoT, harness memories, and agent namespaces, then emits reviewed alignment. | Not automatic bidirectional sync; not hidden background mutation. |
| `policy router` | L2 workflow that selects mode, model, tool, and read accessor from task risk, sensitivity, locality policy, and explicit permissions. It routes the selected path toward Converse; Converse carries the routed turn into the task loop. | Not memory authority; not a vendor preference switch; not a bypass around local-first policy. |
| `fail-closed gate` | The single write boundary. It defaults to no execution and permits a side effect only when an explicit manifest, policy check, and required grant produce an allowed disposition. | Not a best-effort router; not an exception path; not bypassable by ReAct or a harness. |
| `action disposition` | The post-gate outcome for a proposed side-effect intent: approve, refuse, or defer. | Not the intent itself; not the gate tier; not hidden execution. |
| `defer` | Safe pending: hold an intent or item without executing its side effect until authority, context, timing, or runtime conditions are available. | Not approval; not refusal; not execution; not silent background retry. |
| `runtime deferred` | A read-side or surface pipeline state where an item is preserved for later processing and remains observable. | Not L4 authorization; not dead-letter; not data loss. |
| `audience fail-closed` | A privacy routing rule: uncertain audience classification stays in the narrower audience rather than leaking outward. | Not the action gate; not a permission grant. |
| `mode routing` | Routing by session mode, sensitivity, locality policy, and task risk. It determines which model, tool, and read accessor may be used. | Not just model routing; not an invisible model preference. |
| `reviewed namespace alignment` | Human-reviewed alignment across the memory SSoT, harness-local memories, and agent-level namespaces. | Not automatic sync; not silent model memory mutation; not a second memory of record. |
| `reviewed runtime behavior` | An approved artifact has been applied so future runtime behavior can change. | Not product launch language; not unreviewed live mutation. |
| `authority change` | A durable source-of-truth change: memory SSoT, policy, ADR, procedure manifest, runbook, or skill/prompt delivery. | Not a transient answer, trace, session state, or UI notification. |
| `intent proposal only` | ReAct `act` may formulate a side-effect intent. Execution must leave through L4. | ReAct does not execute external side effects directly. |
| `Bounded ReAct` | The ReAct loop is called by L2 with memory/routing context and returns either observations or a side-effect intent for L4. It is bounded by memory surfaces, the action gate, and governance observation. | It has no memory authority, router authority, or write boundary. |

### 5.1 Concept page hero intro

The hero intro follows the portfolio concept-page hierarchy:

- title: `YAAA`;
- subtitle: `an assistant you actually own`, styled as the green italic line;
- first body sentence: `Yaaa (Yet Another AI Assistant) is a personal assistant
  ops architecture...`.

The expanded name belongs in the first body sentence, not as the main title. The
title should be short enough to read as a project mark while the subtitle carries
the personal-philosophy hook. Do not render the generic hero topic chips
`Systems` or `Embodied Life` on this page; the concept page title block already
carries the project identity.

The Yaaa concept page uses a project-specific nav instead of the global
portfolio header. Do not render `J. Kong / Work / Contact` at the top of this
page. The nav follows the Trailwalk page pattern: `Portfolio` back to the work
index, `YAAA` for the page top, desktop section links, and a mobile sections
menu.

Visible section and card titles should not end with a period. This applies to
concept cards, drill-in headings, FAQ outro headings, and example step headings;
questions may keep their question marks.

Top and mobile navigation are two-level where the section benefits from local
jumps. The first level is `Problem`, `Concept`, `Architecture`, `Layers`,
`Invariants`, and `Limits`. `Problem` and `Limits` stay single-level.
`Architecture` links to the two-loop rationale, system map, and end-to-end
example. `Layers` is a separate first-level item with L0-L5 as its second level.
The right rail uses the portfolio landing-page dot navigation pattern as
first-level wayfinding only: `Intro`, `Problem`, `Concept`, `Architecture`,
`Layers`, `Invariants`, and `Limits`.

### 5.2 Concept page problem block

The `01 Problem` section starts from this thesis: the AI that understands you
best is often the biggest threat to your data privacy. Keep the copy focused on
why personal-assistant context is uniquely sensitive: it crosses mail, notes,
calendar, location, health, camera, conversation, identity, and intent. The
problem is not "AI is risky" in the abstract; the problem is that useful
assistance requires intimate context, and the default cloud/vendor architecture
turns that intimacy into exposure.

The section explains three risks. Each risk card includes a small explanatory
illustration above the text:

- **Aggregated / unrecallable:** multiple personal sources collapse into one
  external processor, then leave without a recall path.
- **Screened / surveilled:** a cloud route inserts vendor screening, monitoring,
  and retention between request and output.
- **Locked / fragmented:** separate harness memories drift and require manual
  reconciliation.

These illustrations are semantic. They should clarify the failure mode; they are
not decorative icons and should not introduce product logos, implementation
status, or private vendor-specific references.

### 5.3 Concept page concept block

The Concept section uses two non-overlapping claims:

| Slot | Job | Required emphasis | Avoid |
|---|---|---|---|
| What it is | Define Yaaa in one concrete sentence. | Self-hostable, opinionated multi-agent architecture for federated subsystems such as mail, notes, calendar, local models, and optional cloud models. | Repeating "federation" without naming the contracts. |
| Boundary | Define what can change and what cannot. | Harnesses, models, tools, and adapters are replaceable; reviewed memory SSoT, local-first routing, L4 write boundary, and L5 governance stay fixed. | Another abstract "one authority contract" headline. |

This section should read as concept and intent, not implementation progress or
product pitch. The page may use "authority contract" only when the contract is
immediately grounded in memory, routing, gated action, and governance.

### 5.4 Concept page How it works intro

The `03 How it works` intro explains the high-level design before the reader
meets the graph:

- broad read: L0/L1 gather context and preserve provenance;
- local-first binding: L2 selects mode/model/tool/read paths and keeps memory
  authority separate from harnesses;
- bounded reasoning: L3 can reason and propose intent;
- one write boundary: L4 decides whether a side effect may run;
- governance loop: L5 studies traces later and promotes reviewed changes.

It must name the two loops:

- **runtime loop**: current-task execution through L0/L1/L2/L3/L4;
- **governance loop**: observe traces, extract, distill, review, promote,
  reconcile, and apply changes for future runs.

The rationale is authority separation: runtime can adapt during a task, while
durable memory, SOP, ADR, runbook, policy, and procedure changes remain
reviewed.

Before the full system map, include a compact L0-L5 layer breakdown. Each layer
gets exactly one plain sentence:

- L0 names outside ingress and egress paths;
- L1 aggregates available context into source records with provenance;
- L2 binds memory authority, routing, model/tool choice, and Converse;
- L3 runs bounded task reasoning and returns observations or intent;
- L4 decides approve/refuse/defer through one write boundary;
- L5 turns traces into reviewed future behavior.

The full architecture map has a visible section subtitle. The subtitle should
name the reading frame: runtime flows through L0-L4 for the current task, while
L5 is the reviewed feedback path for future behavior.

The role legend (`ENTITY`, `FLOW`, `ACTION`, `CTRL`) sits directly under the
`Architecture diagram` subtitle and directly above the diagram. Do not place the
legend above the layer breakdown; the reader should first understand the layer
map, then get the symbol key immediately before the full figure.

Interactive diagrams expose detail through visible layer toggle buttons for
layers that have hidden detail nodes. Multiple layers may be active at once.
Double click may remain as a secondary gesture that toggles the clicked layer and
fits the active set, but the concept page must not rely on double click as the
only way to reveal detail. Active layer buttons reflect the current overlay set.
Reset clears all active layers and returns to the high-level map.

The `Layers` top-level nav item points to a separate `Architecture drill-in`
intro before the per-layer details. This intro should explain that the drill-in
names each layer's ownership, visibility, and authority stop, not merely repeat
the full map. Required thrust:

- use the title `Deep dive into the layers`;
- the full map shows the contract;
- the drill-in is the opinionated guideline;
- L0/L1 gather context, L2 binds memory/routing, L3 proposes, L4 controls side
  effects, and L5 changes the rules future runs stand on.

### 5.5 Concept page invariant cards

The concept page may summarize the architecture after the L0-L5 map with three
invariant cards. These are horizontal expanded cards on desktop: visual cue on
the left, claim and explanation on the right. On mobile they collapse into a
single column. They are not implementation status cards and should not read like
case studies.

| Card | Purpose | Include | Visual cue | Avoid |
|---|---|---|---|---|
| Memory that stays yours | Ownership / anti lock-in | Memories can grow inside each harness; one git-backed SSoT tracks and resolves conflicts through reviewed reconciliation. | Harness/local memory blocks feeding one SSoT, with a reviewed reconciliation loop. | "No harness memory exists"; unqualified "sync"; vendor cache as authority. |
| Traceable decisions | Auditability / less guessing | Agents reason against reviewed decisions, SOPs, runbooks, and procedure manifests before repetitive work changes behavior. | ADR/SOP/runbook artifacts feeding reason, then intent, with trace feedback. | "MADR protocol" as public headline; research progress; status disclosure. |
| Fail-closed actions | Outside-world control | A concrete scenario where the assistant drafts an action but L4 needs manifest, policy, and confirmation before anything is sent or changed. | Draft -> manifest/policy -> locked gate -> approve/refuse/defer. | Prompt-only safety; delivery/audience gate folded into L4; hidden retry. |

These cards are allowed to repeat L2/L4/L5 vocabulary, but only as synthesis:
each card should state the rule and its consequence, not replay the full layer
mechanism.

### 5.6 Concept page challenges and limits

The final section is `Challenges & limits`, not implementation status. It uses a
compact "personal assistant triangle" as the intro illustration:

- **Capability + ecosystem reach:** deep integrations, broad context, and
  cloud-scale tools.
- **Frictionless speed:** instant answers, low-latency automation, and fewer
  confirmations.
- **Owned + auditable control:** local-first routing, reviewed memory, and
  gated side effects.

The triangle is a framing device for tradeoffs. It should not claim to be a
universal law, and it should not become a product pitch. Yaaa is positioned near
owned and auditable control, with the page openly naming the cost: narrower
integration, more review at sensitive boundaries, and unavailable actions when
the system lacks source access or authority.

The triangle SVG should use large, short corner labels only. Do not place the
long explanatory notes inside the triangle; they belong in a separate legend
under the figure so small cards and mobile widths do not create label overlap.

Challenges render as a FAQ-style disclosure list. Each summary states the
question; the expanded body uses natural paragraphs rather than labeled
`Response` / `Limit` columns. The first paragraph should explain the design move
or mitigation. The second paragraph should name the remaining cost, failure
mode, or target-user constraint.

Use this structure:

- `How much friction does safety add?`
- `Where is Yaaa intentionally slow?`
- `Can natural-language memory really be reconciled?`
- `What happens when a data source is closed?`
- `Who is willing to operate this?`

#### 5.6.1 Challenge response language

Use "progressive delegation" or "graduated authority", not "progressive trust".
The system does not gradually trust a model. It grants narrow, revocable,
reviewed authority to a specific procedure under a specific policy profile.

Low-risk, high-frequency work may become automatic only when it still passes
through L4 as an explicit policy disposition:

- the manifest matches a reviewed SOP / runbook / procedure profile;
- the action class is low risk and scoped to a declared target/account;
- the grant has expiry, budget, frequency, and rollback constraints;
- the disposition is recorded as `approve_by_policy`;
- traces still flow to L5 for later audit.

Never describe this as bypassing the gate or as a whitelist that skips review.
The public claim is: Yaaa is fast where the work is read-only or pre-authorized,
and intentionally slower where authority changes, privacy leaves, or the outside
world is touched.

#### 5.6.2 FAQ content guidance

| Question | First paragraph | Second paragraph |
|---|---|---|
| `How much friction does safety add?` | L4 gates side-effect intents, not every turn. Reads, drafts, and local reasoning stay outside the write gate. Stable low-risk procedures can use reviewed policy profiles and `approve_by_policy`. | Sensitive, ambiguous, or high-impact actions still require approval, defer, or refuse. Approval fatigue is a UX risk, so the review queue must be sparse and meaningful. |
| `Where is Yaaa intentionally slow?` | The slow path is the sensitive path: provenance-preserving ingestion, local model routing, side-effect review, and L5 governance. L0-L5 are authority boundaries, not a fully synchronous chain. | Yaaa is a poor fit for millisecond-critical workflows. Local hardware, adapter quality, retention budgets, and review steps impose real speed limits. |
| `Can natural-language memory really be reconciled?` | Use Postgres / vector storage for high-frequency working memory, run state, traces, and retrieval. Use the git-backed SSoT for reviewed core memory, SOPs, ADRs, policies, and manifests. LLM-assisted reconciliation can summarize diffs and propose candidate patches. | The LLM is not the judge. Semantic conflicts still need policy or human review before any candidate becomes authority. Git auto-merge cannot resolve meaning. |
| `What happens when a data source is closed?` | Treat adapters as capability tiers: official API/export first, local files/webhooks/RSS next, manual capture next, and RPA/OCR only as a fragile fallback. Missing sources remain visible in the answer. | Closed ecosystems remain closed. RPA/OCR is slow, brittle, less auditable, and may break when UI or platform policy changes. It can help the system see, but should not become a high-trust source. |
| `Who is willing to operate this?` | Ship opinionated default policy sets and hide SOP/ADR/runbook machinery behind plain-language review queues. L5 should turn traces into simple approval decisions, such as whether a repeated calendar pattern should become a default rule. | This remains a self-hostable architecture for operators and power users first. A zero-admin consumer assistant is a different product boundary. |

#### 5.6.3 Protocol and storage boundaries

MCP can be named as the compatibility substrate for tools, resources, prompts,
and schema exchange. It should replace vague "tool contract" language where the
page discusses integration cost. It does not replace Yaaa's authority contract:
mode routing, sensitivity classification, procedure manifests, L4 gate, audit
traces, and L5 governance still wrap tool access.

Do not say "only tool calls enter L4." The correct boundary is: L4 intercepts
side-effect intents. A read-only tool call may stay on the L1/L2 read path with
mode-aware accessors and leak checks that stop sensitive context before it
reaches a disallowed cloud route, while send/write/delete/spend/publish actions
must become side-effect intents and pass L4. This also covers scheduled agents,
conversation harnesses, MCP servers, RPA fallback, and proactive output paths.

The storage model should separate runtime state from reviewed authority:

- Postgres stores source records, working memory, run state, traces, queues, and
  structured candidate artifacts.
- Vector indexes support semantic retrieval over selected records and reviewed
  artifacts.
- Git-backed SSoT stores durable, reviewed authority: core memory, policies,
  SOPs, ADRs, runbooks, and procedure manifests.
- LLM-assisted reconciliation translates branch conflicts and runtime deltas
  into human-readable conflict summaries and candidate patches.
- L5 review decides which candidate changes become authority.

Resource and retention budgets belong under the intentional-slow-path question
unless they become large enough to need their own section.

The section replaces status copy. It should not expose implementation progress,
private references, or operator-only issue state. Do not add a decorative
`open` chip inside each summary; the section title already provides the status.

After the FAQ list, close with a short positioning outro. The outro should end
the page on what Yaaa is for, not on a list of limitations:

- Yaaa is an opinionated guideline for technically capable individuals with
  unusually high privacy and safety requirements.
- It serves people who want AI help with personal affairs, but refuse to hand
  over data control or program execution authority.
- The goal is to keep personal data ownership with the user and keep control
  over every external operation an AI program may attempt.
- Models, harnesses, cloud tools, and protocols are replaceable; memory
  authority and write authority stay with the owner.

### 5.7 Concept page end-to-end example

The concept page should include one compact example directly under the full
system diagram. It should be split into two sections: a large runtime flowchart
and a separate YAML side-effect intent schema with lightweight syntax
highlighting. Use a scenario that exercises read context and gated write intent,
such as rescheduling an appointment.

Required flow:

`L0 IO -> L1 SENSE -> L2 bind -> L3 ReAct intent -> L4 gate`

From L4, show both exits:

- `L4 gate -> L0 proactive output` for the ask/result/disposition that reaches
  the operator;
- `L4 gate -> L5 governance` for the trace that may later become a reviewed
  memory, SOP, ADR, runbook, manifest, or policy change.

Required schema shape:

- intent type and `proposal_only`;
- operator/request origin;
- target references, such as calendar event, recipient, and account;
- proposed change, such as time and message draft;
- policy context, including mode, local/cloud model route, and confirmation;
- provenance references back to source records.

Under the runtime flowchart, include a step walkthrough that explains what each
layer is doing and names the related schema fields. For the appointment example:

| Layer | Runtime explanation | Schema references |
|---|---|---|
| L0 | Operator asks for the appointment change; context enters through proactive input. | `requested_by`, `target.calendar_event_id`, `target.recipient_ref` |
| L1 | SENSE normalizes calendar and email context into source records. | `provenance` |
| L2 | Binding selects a personal-sensitive mode and local model route; Converse packages the turn. | `policy_context.mode`, `policy_context.model_route` |
| L3 | Bounded ReAct proposes a new time and message draft, with no direct write. | `proposal_only`, `proposed_change.*` |
| L4 | The gate checks target, account, sensitivity, policy, and confirmation before approve/refuse/defer. | `target.account_ref`, `policy_context.required_confirmation` |
| L5 | Governance records the trace as evidence for future reviewed changes. | `intent_type`, `provenance` |

The example exists to make the architecture legible. It should not become a case
study, roadmap item, or implementation status report.

Layer-detail mini captions should explain the layer, not merely decorate the
image. Current caption intent:

- L1: available context aggregated into a unified format;
- L2: Converse packages a web, terminal, or voice turn;
- L3: the task loop runs reason/act/observe/reflect, with act limited to intent;
- L5: traces become reviewed future behavior.

### 5.8 Layer detail check

The full-system diagram intentionally shows only enough detail for each layer to
avoid authority confusion.

| Layer | Required detail | Current coverage |
|---|---|---|
| L2 Binding | Memory SSoT authority, harness/agent memory surfaces, explicit mode/model/tool routing, local vs. cloud choice, and a replaceable session surface. | `memory SSoT` supplies governed context, `harness memory` may grow as local recall / serving state, `agent memory` carries staged namespace state, `policy router` points routed mode/model/tool choice toward `converse`, and `converse` remains the session surface. |
| L3 Bounded ReAct | A closed reason -> act -> observe -> reflect loop, with `act` limited to intent proposal. | The detail loop closes back to `reason`; `act` points to L4 `side-effect intent`. |
| L4 Gated Action | Side-effect intent, versioned procedure manifest, policy check, fail-closed gate, and approve/refuse/defer disposition. | The write path narrows through those nodes before any action can run, stop, hold, or resume through policy. |

The diagram still omits implementation-specific dispatcher internals, procedure
enumeration, per-model policy tables, and run-result schemas. Those belong in
drilldown docs or runbooks, not in the concept figure.

## 6. Reading levels (semantic zoom)

- **Level 0 (high-level):** one summary node per layer + cross-layer edges = the
  layered map. This is the static baseline the island enhances.
- **Level 1 (hover/focus):** a node raises its connected flow; unrelated marks
  dim.
- **Level 2 (detail overlay):** toggling or double-clicking a layer reveals that
  layer's internal detail nodes and intra-layer edges. Multiple layers may remain
  active together; inactive layers dim. The detail is the same data, surfaced by
  zoom and overlay, never a page swap.

Detail is present in the DOM at all levels (for parity + a11y) and hidden at
level 0 by style, so drift verification always sees the full node/edge set.

## 7. Interaction model

- Pointer: scroll to zoom, drag to pan, layer buttons toggle detail overlays,
  pan/zoom buttons provide explicit movement controls, double-click a layer to
  toggle it and fit the active set, and double-click background or `0`/`Esc` to
  reset.
- **Keyboard:** zoom (+/-), pan (arrows), reset (0) reachable without a mouse;
  layer toggles, pan/zoom controls, layers, and nodes are focusable with visible
  focus rings.
- **Base render:** the static high-level figure is readable before the island
  loads; the interactions above are layered on the inline SVG. Zero-JS support
  is not a requirement.

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
| Yaaa | `systems` | IO band -> SENSE -> bind -> Bounded ReAct -> gated write funnel (L1-L4 as left-to-right columns) -> governance band + reconciliation |
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
