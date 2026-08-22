export type PracticeId = 'systems' | 'embodied-life' | 'inhabited-worlds';

/** Two-stop vertical gradient standing in for project material imagery. */
export interface Material {
  from: string;
  to: string;
}

export interface PracticePanel {
  id: PracticeId;
  title: string;
  lead: string;
  meaning: string;
  related: string;
}

export interface WorkProject {
  id: string;
  name: string;
  status: string;
  introduction: string;
  href: string;
  material: Material;
}

export interface WorkGroup {
  id: PracticeId;
  label: string;
  thesis: { claim: string; body: string };
  projects: WorkProject[];
}

const materials: Record<string, Material> = {
  amanuensis: { from: '#2d4a70', to: '#1a3050' },
  yaaa: { from: '#4268a0', to: '#2f507a' },
  beagle: { from: '#5a6a4a', to: '#3d4d30' },
  trailwalk: { from: '#738262', to: '#545f42' },
  commonplace: { from: '#7a5040', to: '#4d3020' },
};

export const homepage = {
  hero: {
    h1: 'Exploring what remains irreducible in the age of Generative AI',
    bridge:
      'I build for the agency of individuals, and for the worlds we share with AI agents and other creatures. Underneath both, I build the systems that make them possible.',
    ctas: [
      { label: 'View Work', href: '#work' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  topicsLabel: 'Topics',
  practices: [
    {
      id: 'systems',
      title: 'Systems',
      lead:
        'Engineering foundations and practices to support trackable design, iterations, ownership.',
      meaning:
        'The building blocks underneath the rest of this work: reusable assistant architectures that concrete tools and worlds are built on.',
      related: 'Amanuensis · Yaaa',
    },
    {
      id: 'embodied-life',
      title: 'Embodied Life',
      lead: 'When memory, attention, or mobility set the terms.',
      meaning:
        'Technology that lowers barriers: support for memory, attention, and mobility that widens what a person can notice, remember, and reach.',
      related: 'Beagle · Trailwalk',
    },
    {
      id: 'inhabited-worlds',
      title: 'Inhabited Worlds',
      lead: 'How relationships and encounters shape the worlds we share and experience',
      meaning:
        'Studying the relationship and otherness in encounters between humans, AI agents, and other creatures, and what those encounters come to mean for us.',
      related: 'commonplace',
    },
  ] satisfies PracticePanel[],
  workGroups: [
    {
      id: 'systems',
      label: 'Systems',
      thesis: {
        claim: 'Ownership lives in the architecture.',
        body: 'Personal AI should keep information flow, memory, orchestration, and delivery inspectable and portable, so models, providers, and tools can change without taking control away from the person.',
      },
      projects: [
        {
          id: 'amanuensis',
          name: 'Amanuensis',
          status: 'Active development · private repository · public design and example trace',
          introduction:
            'A policy-gated information triage layer for personal assistants. It compares messages, tasks, events, and feeds against private context, then decides what should interrupt, wait for a digest, or remain quiet.',
          href: '/projects/amanuensis/',
          material: materials.amanuensis,
        },
        {
          id: 'yaaa',
          name: 'Yaaa',
          status: 'Ops architecture · conceptual framework',
          introduction:
            'A self-hostable personal-assistant architecture that keeps memory authority and side-effect control with the user while models, harnesses, and tools remain replaceable.',
          href: '/projects/yaaa/',
          material: materials.yaaa,
        },
      ],
    },
    {
      id: 'embodied-life',
      label: 'Embodied Life',
      thesis: {
        claim: 'Enablement, not replacement.',
        body: "Technology should lower the barriers of memory, attention, and mobility, and leave every decision in the person's hands.",
      },
      projects: [
        {
          id: 'beagle',
          name: 'Beagle',
          status: 'Concept study · feasibility and roadmap defined',
          introduction:
            'A cognitive-support agent concept for people facing memory or attention barriers: an always-on assistant that logs, tracks, and reminds, so the person can make informed decisions even when being informed is a challenge.',
          href: '/projects/beagle/',
          material: materials.beagle,
        },
        {
          id: 'trailwalk',
          name: 'Trailwalk',
          status: 'Concept stage · working VR prototype · field media library',
          introduction:
            'A working VR prototype built from real 360-degree trail footage and spatial audio, bringing outdoor places into homes and community settings when the trail is hard to reach.',
          href: '/projects/trailwalk/',
          material: materials.trailwalk,
        },
      ],
    },
    {
      id: 'inhabited-worlds',
      label: 'Inhabited Worlds',
      thesis: {
        claim: 'Worlds are made of relationships.',
        body: 'Relationships among people, AI agents, machines, and other beings shape how a world is shared and experienced, irreducible to any outcome.',
      },
      projects: [
        {
          id: 'commonplace',
          name: 'commonplace',
          status: 'Research build · bridge and toy world implemented',
          introduction:
            'Research into human-AI relationships in game worlds, curiosity-driven autotelic agency in AI agents, and the philosophy of Otherness as it emerges from how we treat and regard LLM agents.',
          href: '/projects/commonplace/',
          material: materials.commonplace,
        },
      ],
    },
  ] satisfies WorkGroup[],
  contact: {
    invitation:
      "If this overlaps with something you're trying to build, study, or care for, I'd be glad to talk.",
    ctas: [
      { label: 'Contact', href: '/contact/' },
      { label: 'View Work', href: '#work' },
    ],
  },
};
