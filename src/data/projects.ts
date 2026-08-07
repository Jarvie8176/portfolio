/**
 * Public-safe project index for the one-pager.
 * Copy here is deliberately conservative: status wording follows the
 * honest-snapshot convention (no "shipped" claims, no internal refs).
 * Full concept pages land per-project as their public rewrite clears.
 */
export interface Project {
  id: string;
  title: string;
  kicker: string;
  stamp: string;
  stampClass: string;
  dek: string;
  /** set when the concept page exists; sections without it render as "page pending" */
  href?: string;
}

export const projects: Project[] = [
  {
    id: 'beagle',
    title: 'Beagle',
    kicker: 'personal cognitive agent',
    stamp: 'concept',
    stampClass: '',
    dek: 'An always-on memory prosthesis: an agent that listens to your day and keeps the logbook, so a leaky working memory stops taxing the life it belongs to. One ship, one captain — it never takes the wheel.',
    href: '/projects/beagle/',
  },
  {
    id: 'commonplace',
    title: 'Commonplace',
    kicker: 'human + ai dyad research',
    stamp: 'research',
    stampClass: 'stamp--research',
    dek: 'A study in whether a human-and-agent pair can be self-sufficient: an agent that keeps a commonplace book because it is curious, not because it is rewarded.',
  },
  {
    id: 'trailwalk',
    title: 'Trailwalk',
    kicker: 'vr accessibility · nature',
    stamp: 'prototype',
    stampClass: 'stamp--proto',
    dek: 'Natural walking in real terrain for people whose mobility no longer reaches the trail — real places, honest pace, no barriers between a body and the woods.',
  },
  {
    id: 'yaaa',
    title: 'Yaaa',
    kicker: 'ai assistant · operational layer',
    stamp: 'partially live',
    stampClass: 'stamp--live',
    dek: 'An operational layer for a personal AI assistant: accepted architecture, built organs, pending bindings. The dossier is public; the wiring is honest about what runs.',
  },
  {
    id: 'amanuensis',
    title: 'amanuensis',
    kicker: 'reading & reasoning kits',
    stamp: 'partially live',
    stampClass: 'stamp--live',
    dek: 'Three small kits that read so you can think: capture, digest, resurface. The daily digest loop has been running since mid-2026.',
  },
  {
    id: 'field-notes',
    title: '开放世界观察笔记',
    kicker: 'photography · カラスたるもの',
    stamp: 'fieldwork',
    stampClass: 'stamp--fieldwork',
    dek: 'A photographic quest log of co-presence in public space — people, crows, artifacts, and the records that failed. 145 entries and counting; an archive against memory loss.',
  },
];
