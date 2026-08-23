export type Practice = 'systems' | 'embodied' | 'worlds';

export interface Project {
  id: string;
  title: string;
  role: string;
  statusCode:
    | 'operational'
    | 'integration'
    | 'prototype'
    | 'research_build'
    | 'concept'
    | 'archive';
  statusLabel: string;
  primary: Practice;
  secondary?: Practice;
  topic: string;
  summary: string;
  existsNow: string;
  why: string;
  unresolved: string;
  evidence: string;
  coverImage: string;
  coverPosition?: string;
  href?: string;
  /**
   * This project has its own hand-designed concept page at
   * `src/pages/projects/<id>.astro`, so the generic `[id]` template must not
   * also generate that route.
   */
  conceptPage?: true;
}

export const practiceLabels: Record<Practice, string> = {
  systems: 'Systems',
  embodied: 'Embodied Life',
  worlds: 'Inhabited Worlds',
};

export const projects: Project[] = [
  {
    id: 'amanuensis',
    title: 'Amanuensis',
    role: 'Systems Case',
    statusCode: 'operational',
    statusLabel: 'In use',
    primary: 'systems',
    secondary: 'worlds',
    topic: 'Attention filtering',
    conceptPage: true,
    summary:
      'A policy-gated information triage layer for personal LLM assistants. It gathers messages, tasks, events, and ambient feeds, then uses context to rank, denoise, and route each signal, so attention goes to what matters, when and where it matters.',
    existsNow: 'Read, reason, and push kits are in use for a digest loop.',
    why: 'It keeps attention from being spent on every incoming signal.',
    unresolved: 'Public release posture and broader adapter shape remain open.',
    evidence: 'Digest loop, triage policy seam, delivery ledger',
    coverImage: '/assets/project-covers/amanuensis-trace.svg',
  },
  {
    id: 'yaaa',
    title: 'Yaaa',
    role: 'Assistant Operating Layer',
    statusCode: 'concept',
    statusLabel: 'Ops architecture',
    primary: 'systems',
    secondary: 'embodied',
    topic: 'Self-owned assistant layer',
    conceptPage: true,
    summary:
      'A self-hostable personal-assistant architecture that keeps memory authority and side-effect control with the user while models, harnesses, and tools remain replaceable.',
    existsNow: 'The architecture defines a federated ops framework for personal assistants.',
    why: 'It asks how an assistant can stay auditable and under human authority.',
    unresolved: 'Concrete deployments must choose and verify subsystem implementations against these boundaries.',
    evidence: 'Architecture map and binding contract',
    coverImage: '/assets/project-covers/yaaa-layer-map.svg',
  },
  {
    id: 'beagle',
    title: 'Beagle',
    role: 'Incubation Study',
    statusCode: 'concept',
    statusLabel: 'Concept study',
    primary: 'embodied',
    secondary: 'systems',
    topic: 'Memory support as care',
    summary:
      'A cognitive-support agent concept for people facing memory or attention barriers: an always-on assistant that logs, tracks, and reminds, so the person can make informed decisions even when being informed is a challenge.',
    existsNow: 'The product shape, roadmap, and feasibility gates are defined.',
    why: 'It treats memory support as care without handing authority to the machine.',
    unresolved: 'Recorder export, local extraction quality, and compute budget still need proof.',
    evidence: 'Nightly walking-skeleton plan',
    coverImage: '/assets/project-covers/beagle-logbook.svg',
    href: '/projects/beagle/',
  },
  {
    id: 'trailwalk',
    conceptPage: true,
    title: 'Trailwalk',
    role: 'Lead Embodied Work',
    statusCode: 'prototype',
    statusLabel: 'Active prototype',
    primary: 'embodied',
    secondary: 'worlds',
    topic: 'Outdoor access through embodied media',
    summary:
      'A working VR prototype built from real 360-degree trail footage and spatial audio, bringing outdoor places into homes and community settings when the trail is hard to reach.',
    existsNow: 'Core playback, spatial audio, speed-source, and media-pipeline questions have working spikes.',
    why: 'It asks what place, motion, and outdoor memory mean when the body cannot easily reach the trail.',
    unresolved: 'Quest playback, audio-rate architecture, and comfort validation remain open.',
    evidence: '360 trail capture, spatial audio, walking-pad speed trace',
    coverImage: '/assets/project-covers/trailwalk-shoreline.webp',
    coverPosition: '50% 46%',
  },
  {
    id: 'commonplace',
    title: 'commonplace',
    role: 'Research World',
    statusCode: 'research_build',
    statusLabel: 'Research build',
    primary: 'worlds',
    secondary: 'systems',
    topic: 'Co-presence beyond task success',
    summary:
      'Research into human-AI relationships in game worlds, curiosity-driven autotelic agency in AI agents, and the philosophy of Otherness as it emerges from how we treat and regard LLM agents.',
    existsNow: 'The bridge contract and deterministic toy world are implemented.',
    why: 'It studies agency, curiosity, and co-presence beyond reward optimization.',
    unresolved: 'The full logbook, drive layer, and orchestration loop are still in progress.',
    evidence: 'SyntheticBridge run and logbook trace',
    coverImage: '/assets/project-covers/commonplace-bridge.svg',
  },
];
