/**
 * Shared content for the two Amanuensis pages: the concept page
 * (`/projects/amanuensis/`) and the end-to-end walkthrough
 * (`/projects/amanuensis/walkthrough/`).
 *
 * Structural content lives here rather than in markup so the two pages can
 * share nav taxonomy and so copy edits do not mean editing layout.
 */

export interface NavItem {
  id: string;
  label: string;
}

export const conceptNav: NavItem[] = [
  { id: 'problem', label: 'Problem' },
  { id: 'why', label: 'Why this' },
  { id: 'how', label: 'How it works' },
  { id: 'drill', label: 'Drill down' },
  { id: 'invariants', label: 'Invariants' },
  { id: 'limits', label: 'Limits' },
];

export const walkthroughNav: NavItem[] = [
  { id: 'w-ingest', label: 'Ingest' },
  { id: 'w-triage', label: 'Triage' },
  { id: 'w-ladder', label: 'Ladder' },
  { id: 'w-gates', label: 'Gates' },
  { id: 'w-digest', label: 'Digest' },
  { id: 'w-ledger', label: 'Ledger' },
];

/* ---------------------------------------------------------------- concept */

export const gapCards = [
  {
    kicker: 'Solved · transport',
    name: 'ntfy · Gotify · Apprise',
    text: 'Delivery is mature but carries zero aggregation intelligence: it delivers whatever it is handed.',
  },
  {
    kicker: 'Solved · summarization',
    name: 'per-item LLM summaries',
    text: 'One item at a time: no cross-source clustering, no record of what was suppressed, no feedback loop.',
  },
  {
    kicker: 'Papers, not products',
    name: 'topic clustering',
    text: 'Exists as libraries and papers. Novu\'s "digest" is time-window batching, not selection.',
  },
];

export const missingChain = [
  'heterogeneous sources',
  'one screening pass: priority + audience',
  'denoise',
  'tiered delivery',
];

export interface Kit {
  name: string;
  lede: string;
  points: { term: string; text: string }[];
}

export const kits: Kit[] = [
  {
    name: 'ingest-kit',
    lede: 'Each adapter owns an opaque cursor token that the core pipeline stores but never inspects, so a new source is an adapter plus config rather than a schema migration.',
    points: [
      {
        term: 'opaque cursor',
        text: 'The pipeline persists what the adapter hands it and asks no questions about the format.',
      },
      {
        term: 'content hashing',
        text: 'Repeats are dropped on the way in, before anything downstream pays for them.',
      },
      {
        term: 'run identity',
        text: 'Every run carries an id that joins items to an audit trail with an explicit pending-to-terminal lifecycle, so an interrupted run stays diagnosable.',
      },
    ],
  },
  {
    name: 'triage-kit',
    lede: 'One model call per item returns priority, audience, a summary, key entities, and whether action is required. Five priority tiers run from must down to drop.',
    points: [
      {
        term: 'sensitivity-gated endpoints',
        text: 'Ordinary items may take a cloud-capable route; sensitive items take a local-only route.',
      },
      {
        term: 'leak guard',
        text: 'On a local-only route, a cloud-looking served model is treated as a leak: the verdict is discarded rather than recorded as ok.',
      },
      {
        term: 'constrained decoding',
        text: 'The output schema makes an invalid priority impossible to sample, so bad structure cannot enter the store.',
      },
    ],
  },
  {
    name: 'push-kit',
    lede: 'Routing is a priority-by-audience table, and both delivery gates sit in front of every send.',
    points: [
      {
        term: 'gates read persisted values',
        text: 'The gates read what the ledger recorded rather than live configuration, so a config edit or a stale row is still caught at delivery time.',
      },
      {
        term: 'digest fold with aging',
        text: 'Anything below the top tier folds into waking-hours windows, and a deferred item ages upward so it cannot starve.',
      },
      {
        term: 'idempotent ledger',
        text: 'Every delivery lands in a ledger keyed by source, item, and channel, with explicit terminal states including dead-letter.',
      },
    ],
  },
];

export const policyLayers = [
  { name: 'engine', note: 'mechanism only' },
  { name: 'bundled defaults', note: 'generic, non-sensitive' },
  { name: 'private policy pack', note: 'outside the engine' },
];

export const gates = [
  {
    kicker: 'Gate 1 · on the way in',
    rule: 'high sensitivity → local model only',
    text: 'If the serving endpoint reports a cloud-looking model, the result is treated as a leak: the verdict is discarded, the item degrades and retries, and it is never recorded as ok.',
  },
  {
    kicker: 'Gate 2 · on the way out',
    rule: 'high sensitivity → self-hosted channel only',
    text: 'A cloud channel refuses the item mechanically. The gates read ledger-persisted values, so a config edit or a stale row is still caught at delivery time.',
  },
];

export const failClosedDefaults = [
  'unknown audience → personal',
  'unknown sensitivity → high',
  'local endpoint down → wait, never cloud',
];

export const tenets = [
  {
    title: 'Provenance that refuses to lie',
    text: 'Every verdict records which model actually served it; a missing report is marked unknown instead of passing the requested name off as served. Rows from before provenance existed stay empty, because backfilling would assert something false about a past verdict.',
  },
  {
    title: 'No fabricated verdicts',
    text: 'An item with a failed priority is degraded and retried, never given a made-up tier. The output schema closes the other side by making an invalid priority impossible to sample.',
  },
  {
    title: 'Rehearsal before side effects',
    text: 'The delivery path has a mandatory dry-run mode that executes the full routing and both gates, prints what would be sent, makes zero outbound calls, and writes nothing.',
  },
  {
    title: 'Adversarial audits as routine',
    text: 'One bug class, model prose forging reference anchors, was chased through six consecutive audit rounds. Safety invariants are deterministic branches, never prompt instructions.',
  },
  {
    title: 'Explicit signals only',
    text: 'An item is marked read or acknowledged only on an explicit human signal, never inferred from silence; a fabricated signal would poison the feedback loop.',
  },
  {
    title: 'Build only the missing piece',
    text: 'The open-source survey came first, and it justified building exactly one leg: the aggregation chain no existing open-source tool covers. Anything mature is adopted, not rebuilt.',
  },
];

export const faq = [
  {
    q: 'Why not just use an existing notification hub?',
    a: 'Notification hubs move messages; they do not decide which messages deserve to move. Amanuensis adds the missing middle: one screening pass that ranks by priority and audience, denoises, and then hands a hub the few things worth delivering.',
  },
  {
    q: 'Why local inference instead of a privacy setting?',
    a: 'A setting can be toggled, forgotten, or overridden by a later default. Routing sensitive material to local inference is a branch in the code, so the guarantee holds regardless of configuration, and an endpoint that answers with a cloud model is treated as a leak rather than a success.',
  },
  {
    q: 'Why digests instead of real-time delivery?',
    a: 'Real time means every source can interrupt you. Digests protect attention by collecting the non-urgent into a few waking-hours windows, while the top tier still goes out immediately and an aging rule keeps a quiet item from waiting forever.',
  },
  {
    q: 'What happens when the local endpoint is down?',
    a: 'A sensitive item waits. An unreachable local endpoint defers the item without consuming an attempt, and it never falls back to a cloud route to make progress, because progress at the cost of the privacy guarantee is not progress.',
  },
  {
    q: 'Why SQLite?',
    a: 'The store is small, single-writer, and lives on owned hardware, which is exactly SQLite\'s shape. The read model is a projection that rebuilds from scratch, and the conditions that would justify a heavier database are written down in advance rather than assumed away.',
  },
  {
    q: 'Is any of this open source?',
    a: 'It is currently developed in a private repository; it will be released when it is ready to be public. The architecture is designed so that opening a kit would be a visibility flip rather than a scrubbing exercise, because the sensitive policy already lives outside the engine.',
  },
];

/* ------------------------------------------------------------ walkthrough */

export interface Stage {
  id: string;
  index: string;
  title: string;
  /** short form for the stage rail; the design keeps the rail to one word */
  railLabel: string;
  lede: string;
  failTitle: string;
  fail: string;
  recordLabel?: string;
  record?: string;
}

export const stages: Stage[] = [
  {
    id: 'w-ingest',
    index: '01',
    title: 'Ingest',
    railLabel: 'Ingest',
    lede: 'A source adapter pulls what is new and normalizes it into one shape. Each adapter owns an opaque cursor that the pipeline stores and never interprets, so the pipeline does not need to know how a source paginates. Content hashing drops anything already seen.',
    failTitle: 'When it fails',
    fail: 'If the run fails before anything is persisted, the cursor does not advance and the next run repeats the same window. If items were committed and the run failed afterwards, the audit row records that explicitly and the cursor still does not advance, so a partial run is visible rather than silently skipped. A run left pending was interrupted mid-flight.',
    recordLabel: 'Normalized item',
    record: `source_id:     newsletter-feed
external_id:   ex_9f2c41...
title:         Regional grid pricing, week in review
received_at:   2026-08-11T07:14:00Z
content_hash:  sha256:4b21c0...
run_id:        6d0e77...
state:         stored`,
  },
  {
    id: 'w-triage',
    index: '02',
    title: 'Triage',
    railLabel: 'Triage',
    lede: 'One model call per item returns priority, audience, a summary, key entities, and whether action is required. The endpoint is chosen by sensitivity: a cloud-capable route for ordinary items, a local-only route for sensitive ones. The verdict records which model actually served it, not the one that was asked for.',
    failTitle: 'When it fails',
    fail: 'A missing or invalid priority is never invented: the item is marked degraded and retried, and past the attempt limit it goes to dead-letter. On a local-only route, a served model that looks like a cloud model is treated as a leak and the verdict is discarded rather than recorded as ok. If the local endpoint is unreachable the item is deferred, which does not consume an attempt and never falls back to a cloud route.',
    recordLabel: 'Triage verdict',
    record: `priority:        fyi
audience:        personal
action_required: 0
summary:         Weekly roundup of regional grid
                 pricing, with three stories on
                 winter capacity auctions.
key_entities:    grid operator - capacity auction -
                 winter tariff - regional utility
served_model:    qwen3.5-9b (local, verified)
state:           ok`,
  },
  {
    id: 'w-ladder',
    index: '03',
    title: 'Priority ladder',
    railLabel: 'Ladder',
    lede: 'The tier decides what happens next. The ladder is the denoising decision: everything below the top tier trades immediacy for a quieter day, and the bottom tier is recorded rather than delivered.',
    failTitle: 'What the tiers are for',
    fail: 'Tiers are assigned per item against a rubric that lives in the bundled defaults, so the ranking rule is inspectable and replaceable without touching the engine.',
  },
  {
    id: 'w-gates',
    index: '04',
    title: 'Delivery gates',
    railLabel: 'Gates',
    lede: 'Two gates sit in front of every send. The audience gate requires the channel\'s audience to match the item\'s. The sensitivity gate allows a high-sensitivity item only on a non-cloud channel. Both read values persisted in the ledger rather than live configuration, so a config edit or a stale row is still caught at delivery time.',
    failTitle: 'When it fails',
    fail: 'Unknown values fail closed: an unmarked audience becomes personal, an unmarked sensitivity becomes high, and a normalizing validator maps anything unrecognized onto the safe value. A refusal is not a failure, so no attempt is consumed and the row stays terminal until an operator forces it.',
    recordLabel: 'Refused delivery',
    record: `channel:     cloud-chat
audience:    personal
sensitivity: high
state:       refused
reason:      sensitivity gate: cloud channel
             not permitted for this item
attempts:    0`,
  },
  {
    id: 'w-digest',
    index: '05',
    title: 'Digest fold',
    railLabel: 'Digest',
    lede: 'Items below the top tier wait in a fold queue until the next waking-hours window, then leave together as one rollup message. A deferred item ages upward each time it is skipped, so a quiet item cannot starve behind louder ones.',
    failTitle: 'When it fails',
    fail: 'If the rollup would exceed the channel\'s payload limit, the packer sends what fits in rank order and defers the remainder to the next window, rather than truncating the message or dropping the overflow.',
    recordLabel: 'Digest line',
    record: `state:  sent    mode: digest
window: personal:fc3532...
- [fyi] Regional grid pricing, week in
  review - three stories on winter
  capacity auctions.`,
  },
  {
    id: 'w-ledger',
    index: '06',
    title: 'Ledger',
    railLabel: 'Ledger',
    lede: 'Every delivery attempt lands in an idempotent ledger keyed by source, item, and channel. The state set is explicit, and the terminal states are honest about which of them mean "sent" and which mean "deliberately not sent".',
    failTitle: 'What the ledger will not do',
    fail: 'Read and acknowledged advance only on an explicit human signal, and an acknowledgment without a matching feedback entry is rejected. The delivery path also has a mandatory dry-run that runs full routing and both gates, prints what would be sent, makes zero outbound calls, and writes nothing.',
    recordLabel: 'Terminal semantics',
    record: `sent       delivered, receipt recorded
dead       attempts exhausted, parked in
           dead-letter for review
refused    a gate blocked it; no attempt
           was consumed
suppressed policy chose not to deliver it`,
  },
];

export const tiers = [
  { name: 'must', note: 'Delivered immediately' },
  { name: 'should', note: 'Folded into the next digest window' },
  { name: 'fyi', note: 'Folded into the next digest window' },
  { name: 'ambient', note: 'Retained and browsable, never pushed' },
  { name: 'drop', note: 'Suppressed, kept only as a record that it was seen' },
];

export const deliveryStates = [
  'sent',
  'pending',
  'deferred',
  'failed',
  'dead',
  'refused',
  'suppressed',
  'read',
  'acked',
];

export const closingPoints = [
  'The chain closes. A source becomes a record, a record becomes a verdict, a verdict becomes a routing decision, and every decision leaves a row that can be read back later.',
  'Provenance travels with the verdict, so the question "which model actually judged this" has an answer rather than an assumption.',
  'The fail-closed branches are ordinary code paths rather than instructions to a model, which is why they can be demonstrated at all: a refusal, a deferral, and a degraded retry are things the system does, not things it promises to do.',
];
