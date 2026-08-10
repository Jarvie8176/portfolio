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
  materialLabel: string;
  coverImage: string;
  coverPosition?: string;
  href?: string;
  /**
   * This project has its own hand-designed concept page at
   * `src/pages/projects/<id>.astro`, so the generic `[id]` template must not
   * also generate that route.
   *
   * Trailwalk is the first; the intent is that every project eventually gets a
   * page designed for what it actually is, and `[id].astro` is the interim
   * template for the ones that do not have one yet.
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
    title: 'amanuensis',
    role: 'Systems Case',
    statusCode: 'operational',
    statusLabel: 'In use',
    primary: 'systems',
    secondary: 'worlds',
    topic: 'Attention filtering',
    summary: 'A system for gathering information, reducing noise, and showing what matters.',
    existsNow: 'Read, reason, and push kits are in use for a digest loop.',
    why: 'It keeps attention from being spent on every incoming signal.',
    unresolved: 'Public release posture and broader adapter shape remain open.',
    evidence: 'Digest loop, triage policy seam, delivery ledger',
    materialLabel: 'Read/reason/push trace',
    coverImage: '/assets/project-covers/amanuensis-trace.svg',
  },
  {
    id: 'yaaa',
    title: 'Yaaa',
    role: 'Assistant Operating Layer',
    statusCode: 'integration',
    statusLabel: 'Integration in progress',
    primary: 'systems',
    secondary: 'embodied',
    topic: 'Self-owned assistant layer',
    summary: 'A self-owned assistant layer that connects memory, conversation, action, surfaces, and safety.',
    existsNow: 'Architecture is accepted and several organs exist.',
    why: 'It asks how an assistant can stay auditable and under human authority.',
    unresolved: 'The full assistant loop and high-sensitivity safety path are not closed.',
    evidence: 'Capability map and binding plan',
    materialLabel: 'Assistant layer map',
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
    summary: 'A memory helper that turns daily audio into notes, reminders, and traces the user can keep.',
    existsNow: 'The product shape, roadmap, and feasibility gates are defined.',
    why: 'It treats memory support as care without handing authority to the machine.',
    unresolved: 'Recorder export, local extraction quality, and compute budget still need proof.',
    evidence: 'Nightly walking-skeleton plan',
    materialLabel: 'Daily logbook pipeline',
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
    summary: 'A VR walking project that brings real outdoor trails to people who cannot easily walk outside.',
    existsNow: 'Core playback, spatial audio, speed-source, and media-pipeline questions have working spikes.',
    why: 'It asks what place, motion, and outdoor memory mean when the body cannot easily reach the trail.',
    unresolved: 'Quest playback, audio-rate architecture, and comfort validation remain open.',
    evidence: '360 trail capture, spatial audio, walking-pad speed trace',
    materialLabel: '360 trail capture panel',
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
    summary: 'A shared research world where a human and an AI agent live alongside each other, exploring co-dwelling, curiosity, and shared agency beyond task success.',
    existsNow: 'The bridge contract and deterministic toy world are implemented.',
    why: 'It studies agency, curiosity, and co-presence beyond reward optimization.',
    unresolved: 'The full logbook, drive layer, and orchestration loop are still in progress.',
    evidence: 'SyntheticBridge run and logbook trace',
    materialLabel: 'Bridge trace',
    coverImage: '/assets/project-covers/commonplace-bridge.svg',
  },
  {
    id: 'open-world-notes',
    title: 'Notes of Open World Observations',
    role: 'Inhabited Worlds Anchor',
    statusCode: 'archive',
    statusLabel: 'Ongoing archive',
    primary: 'worlds',
    secondary: 'embodied',
    topic: 'Public-world observation',
    summary: '"I record moments worth remembering." An ongoing instant-photo exchange project exploring public encounters, refusal, the ethics of the gaze, and the small knots left in ordinary days.',
    existsNow: 'A public photo-and-caption practice is ongoing.',
    why: 'It keeps encounters, refusals, animals, objects, and memory gaps visible.',
    unresolved: 'A gallery requires image-level visibility review before publication.',
    evidence: 'Photo captions, collection fragments, visibility notes',
    materialLabel: 'Public-world photo strip',
    coverImage: '/assets/project-covers/open-world-rain.webp',
    coverPosition: '48% 62%',
  },
];
