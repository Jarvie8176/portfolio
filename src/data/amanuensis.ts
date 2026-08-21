/**
 * Shared content for the Amanuensis concept, technical deep dive, and example
 * walkthrough pages.
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
  { id: 'example', label: 'In practice' },
  { id: 'system', label: 'The system' },
  { id: 'explore', label: 'Explore' },
];

export const technicalNav: NavItem[] = [
  { id: 'architecture', label: 'Architecture' },
  { id: 'guarantees', label: 'Privacy' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'decisions', label: 'Decisions' },
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

export interface ConceptKit {
  name: string;
  label: string;
  title: string;
  text: string;
  rationale: string;
  /** internal flow, first entry is the input and last entry the output */
  steps: string[];
  details: { term: string; text: string }[];
}

export const conceptKits: ConceptKit[] = [
  {
    name: 'ingest-kit',
    label: 'Gather',
    title: 'Make unlike sources comparable',
    text: 'Adapters turn mail, tasks, feeds, and notes into one record shape, remove repeats, and assign a stable item ID. Collection follows each source\'s shape - polled, pushed, or subscribed - and every record lands in a content-hashed store.',
    rationale: 'Source-specific behavior stays at the edge, so adding an adapter does not force triage or delivery to understand another API.',
    steps: ['source item', 'adapter: poll · push · subscribe', 'normalize · dedupe · ID', 'normalized record'],
    details: [
      {
        term: 'opaque cursor',
        text: 'Each adapter owns a resume cursor the pipeline stores and never interprets, so a new source is an adapter plus config rather than a schema migration.',
      },
      {
        term: 'content hashing',
        text: 'Repeats are dropped on the way in, before anything downstream pays for them.',
      },
      {
        term: 'run audit',
        text: 'Every run carries an ID with an explicit pending-to-terminal lifecycle, so an interrupted run stays diagnosable rather than silently skipped.',
      },
    ],
  },
  {
    name: 'triage-kit',
    label: 'Judge',
    title: 'Turn a record into a decision',
    text: 'Sensitivity is marked at the source before any call is made. One policy-routed model call per item then returns priority, audience, a summary, key entities, and whether action is required, judged against the reader\'s current plan.',
    rationale: 'The decision is structured and stored once. It can be inspected or reconsidered later without asking a model to remember it.',
    steps: ['normalized record + context', 'route by sensitivity', 'one model call', 'structured verdict'],
    details: [
      {
        term: 'sensitivity-gated routes',
        text: 'Ordinary items may take a cloud-capable route; sensitive items only an approved local one.',
      },
      {
        term: 'constrained decoding',
        text: 'The output schema makes an invalid priority impossible to sample, so bad structure cannot enter the store.',
      },
      {
        term: 'versioned verdicts',
        text: 'A verdict records which model actually served it and is stored per route version; a re-triage writes a new row instead of overwriting history.',
      },
    ],
  },
  {
    name: 'push-kit',
    label: 'Deliver',
    title: 'Spend attention deliberately',
    text: 'The assigned priority is one of five tiers - must, should, fyi, ambient, drop - and the tier picks the route: immediate delivery, the next digest window, or a quiet do-not-disturb hold, while drop is suppressed and only recorded. Shared and public destinations must also clear the outbound gate.',
    rationale: 'Delivery is separate from inference, so a model response cannot bypass deterministic audience and sensitivity rules.',
    steps: ['structured verdict', 'priority ladder', 'outbound gate', 'immediate · digest · quiet'],
    details: [
      {
        term: 'the five tiers',
        text: 'must interrupts immediately; should and fyi fold into the next digest window; ambient is held quiet - do not disturb, but browsable; drop is suppressed and kept only as a record.',
      },
      {
        term: 'delivery timing',
        text: 'A deferred item ages upward each window it is skipped, so a low-priority item cannot starve behind louder ones.',
      },
      {
        term: 'idempotent ledger',
        text: 'Every attempt lands in a ledger keyed by source, item, and channel - a retry updates the same row instead of adding a duplicate - with terminal states that distinguish sent from deliberately not sent.',
      },
    ],
  },
];

export const conceptGuarantees = [
  {
    title: 'Inbound policy gate',
    text: 'Source and message sensitivity select the allowed triage path. Sensitive content can only reach an approved local model; if the endpoint reports back a cloud-looking model on that path, the verdict is discarded as a leak rather than recorded as ok.',
  },
  {
    title: 'Outbound audience gate',
    text: 'Before a message leaves a private, personal channel, audience and sensitivity are checked. Public Discord servers, shared Slack bots, and similar destinations require an explicitly allowed route. The gate reads values persisted with the item rather than live configuration, so a later config edit cannot widen what was allowed when the item was judged.',
  },
  {
    title: 'End-to-end traceability',
    text: 'One item ID links receipt, policy checks, model route, ranking, and the final outcome - delivery, quiet hold, or refusal. Every consequential step remains inspectable.',
  },
];

export const conceptFeedbackLoop: { label: string; title: string; text: string }[] = [
  {
    label: 'Capture',
    title: 'Capture the correction',
    text: 'A handoff-only receive path records a reaction or written quality correction, normalizes it into structured data, and passes it on. It never replies, re-judges, or acts.',
  },
  {
    label: 'Condense',
    title: 'Propose a narrow rule',
    text: 'Corrections collect in a feedback ledger. Repeated signals are condensed deterministically into a candidate override; the model does not get to write policy.',
  },
  {
    label: 'Review',
    title: 'Approve the change',
    text: 'A human reviews the candidate as a versioned diff. An accepted rule enters the rule store; a rejected candidate changes nothing.',
  },
  {
    label: 'Apply',
    title: 'Change future matches',
    text: 'Once approved and applied, the rule runs after the model and overrides later matching verdicts. Human judgment outranks the model without retraining it.',
  },
];

export const conceptDesignDecisions: { lead: string; text: string }[] = [
  {
    lead: 'Code replaces prompt constraints',
    text: 'A prompt is a request with limited binding force: a model can misread it, drift from it, or be talked out of it. So none of the core safety rules - route selection, the two gates, the override rules, the fail-closed branches - depend on a model understanding intent; each is an ordinary deterministic branch that runs the same way every time.',
  },
  {
    lead: 'Independent testing and traceability',
    text: 'The stable item ID follows a record across every kit and stage, from receipt to verdict to delivery. Any single link can be pulled out of the chain, fed a known input, and replayed on its own, and any delivery can be walked backwards to the judgment that produced it.',
  },
];

export const conceptTradeoffs: { keep: string; cost: string; text: string }[] = [
  {
    keep: 'Privacy',
    cost: 'capability',
    text: 'Keeping sensitive inference local means running small local models where a frontier cloud model would judge more accurately and write a smoother digest. That cost is accepted: the privacy of the material is worth more than the polish of its summary.',
  },
  {
    keep: 'Attention',
    cost: 'immediacy',
    text: 'Digest-first delivery deliberately delays everything that is not urgent; information that could have arrived now arrives at the next window instead. The delay is the price paid for fewer interruptions.',
  },
  {
    keep: 'Auditability',
    cost: 'overhead',
    text: 'Every send clears explicit gates, and every consequential step writes a durable trace row. Gates add latency, traces add storage, and both add operational work - accepted, because a delivery that cannot be explained is the more expensive failure.',
  },
];

export const conceptLimitations: { lead: string; text: string }[] = [
  {
    lead: 'Advanced capabilities are stripped away on purpose',
    text: 'Conversation, long-term memory, and privileged action are excluded from Amanuensis: each belongs to a different kind of system with its own safety story, and bolting them onto a triage layer would blur the boundary this design depends on.',
  },
  {
    lead: 'A sorting router and a breakwater',
    text: 'Amanuensis delivers the right information at the right granularity to the reader or to an external system, and stops there; complex operations happen on the other side of that boundary, done by whoever received the item.',
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
    fail: 'A missing or invalid priority is never invented: the item is marked degraded and retried, and past the attempt limit it goes to dead-letter. On a local-only route, a served model that looks like a cloud model is treated as a leak and the verdict is discarded rather than recorded as ok. If the local endpoint is unreachable, the item is deferred: no attempt is consumed, and it never falls back to a cloud route.',
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
    lede: 'Two delivery checks sit in front of every send. The audience check requires the channel\'s audience to match the item\'s; the sensitivity check allows a high-sensitivity item only on a non-cloud channel. Both read values persisted with the item rather than live configuration, so a later config edit cannot widen what was allowed when the item was judged.',
    failTitle: 'When it fails',
    fail: 'Unknown values fail closed: an unmarked audience becomes personal, an unmarked sensitivity becomes high, and a normalizing validator maps anything unrecognized onto the safe value. A refusal is not a failure, so no attempt is consumed and the row stays put until an operator forces it.',
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
    lede: 'Should and fyi items wait for the next waking-hours window, then leave together as one rollup message. A waiting item ages upward each window it is skipped, so a low-priority item cannot starve behind louder ones.',
    failTitle: 'When it fails',
    fail: 'If the rollup would exceed the channel\'s payload limit, the packer sends what fits in rank order and carries the remainder to the next window, rather than truncating the message or dropping the overflow.',
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
    lede: 'Every delivery attempt lands in an idempotent ledger keyed by source, item, and channel, so a retry updates the same row instead of adding a duplicate. The state set is explicit, and the terminal states are honest about which of them mean "sent" and which mean "deliberately not sent".',
    failTitle: 'What the ledger will not do',
    fail: 'The read and acked states advance only on an explicit human signal. The delivery path also offers a dry-run that runs full routing and both checks, prints what would be sent, makes zero outbound calls, and writes nothing.',
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
