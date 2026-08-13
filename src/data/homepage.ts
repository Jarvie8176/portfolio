export type PracticeId = 'systems' | 'embodied-life' | 'inhabited-worlds';

/** Two-stop vertical gradient standing in for project material imagery. */
export interface Material {
  from: string;
  to: string;
}

export interface GallerySlice {
  project: string;
  tagline: string;
  material: Material;
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
  gallery: [
    {
      project: 'amanuensis',
      tagline: 'A signal filter for dense information streams',
      material: materials.amanuensis,
    },
    {
      project: 'Yaaa',
      tagline: 'Local-first agent federation',
      material: materials.yaaa,
    },
    {
      project: 'Beagle',
      tagline: 'Memory and attention support',
      material: materials.beagle,
    },
    {
      project: 'Trailwalk',
      tagline: 'Immersive walking',
      material: materials.trailwalk,
    },
    {
      project: 'commonplace',
      tagline: 'World exploration with an AI agent',
      material: materials.commonplace,
    },
  ] satisfies GallerySlice[],
  hero: {
    h1: 'Exploring what remains irreducible in the age of Generative AI',
    bridge:
      'I build for the agency of individuals, and for the worlds we share with AI agents and other creatures. Underneath both, I build the systems that make them possible.',
    ctas: [
      { label: 'View Work', href: '#work' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  practicesLabel: 'Three practices',
  practices: [
    {
      id: 'systems',
      title: 'Systems',
      lead: 'When AI needs to answer to the person it serves.',
      meaning:
        'The building blocks underneath the rest of this work: reusable assistant architectures that concrete tools and worlds are built on.',
      related: 'amanuensis · Yaaa',
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
      lead: 'When worlds are shared before they are solved.',
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
        claim: 'Privacy and control start in the architecture.',
        body: 'Systems that act for you should keep your data yours, stay inspectable, and move with you.',
      },
      projects: [
        {
          id: 'amanuensis',
          name: 'amanuensis',
          introduction:
            'A base platform for personal LLM assistants, built to offload cognitive load. It aggregates personal information (work email, to-dos, appointments) and ambient information (flyers, newsletters, weather alerts, RSS feeds), then triages, ranks, and denoises the stream, so what matters surfaces where it matters.',
          href: '/projects/amanuensis/',
          material: materials.amanuensis,
        },
        {
          id: 'yaaa',
          name: 'Yaaa',
          introduction:
            'A local-first, federated assistant architecture: self-hostable AI orchestration for auditability and harness-agnostic memory synchronization.',
          href: '/projects/yaaa/',
          material: materials.yaaa,
        },
      ],
    },
    {
      id: 'embodied-life',
      label: 'Embodied Life',
      thesis: {
        claim: 'Good support leaves you in charge.',
        body: "Technology should lower the barriers of memory, attention, and mobility, and leave every decision in the person's hands.",
      },
      projects: [
        {
          id: 'beagle',
          name: 'Beagle',
          introduction:
            'A cognitive-support agent concept for people facing memory or attention barriers: an always-on assistant that logs, tracks, and reminds, so the person can make informed decisions even when being informed is a challenge.',
          href: '/projects/beagle/',
          material: materials.beagle,
        },
        {
          id: 'trailwalk',
          name: 'Trailwalk',
          introduction:
            'A VR walking prototype built from real 360-degree trail video and spatial audio, designed to make outdoor places more accessible from indoor community settings.',
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
        body: 'Relationships with agents, strangers, and places matter in themselves, irreducible to any outcome.',
      },
      projects: [
        {
          id: 'commonplace',
          name: 'commonplace',
          introduction:
            'Research into human–AI relationships in game worlds, curiosity-driven autotelic agency in AI agents, and the philosophy of Otherness as it emerges from how we treat and regard LLM agents.',
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
