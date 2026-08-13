export type TopicId = 'systems' | 'embodied-life' | 'inhabited-worlds';

export interface TopicPanel {
  id: TopicId;
  title: string;
  lead: string;
  meaning: string;
  projects: string[];
}

export interface HomepageProject {
  id: string;
  name: string;
  topic: TopicId;
  introduction: string;
  asset: string;
  href: string;
}

export interface WorkGroup {
  id: TopicId;
  name: string;
  thesis: [string, string];
  projects: string[];
}

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
  topics: [
    {
      id: 'systems',
      title: 'Systems',
      lead:
        'Engineering foundations and practices to support trackable design, iterations, ownership.',
      meaning:
        'The building blocks underneath the rest of this work: reusable assistant architectures that concrete tools and worlds are built on.',
      projects: ['Amanuensis', 'Yaaa'],
    },
    {
      id: 'embodied-life',
      title: 'Embodied Life',
      lead: 'When memory, attention, or mobility set the terms.',
      meaning:
        'Technology that lowers barriers: support for memory, attention, and mobility that widens what a person can notice, remember, and reach.',
      projects: ['Beagle', 'Trailwalk'],
    },
    {
      id: 'inhabited-worlds',
      title: 'Inhabited Worlds',
      lead: 'How we share and experience, and engage with the world',
      meaning:
        'Studying the relationship and otherness in encounters between humans, AI agents, and other creatures, and what those encounters come to mean for us.',
      projects: ['commonplace'],
    },
  ] satisfies TopicPanel[],
  workGroups: [
    {
      id: 'systems',
      name: 'Systems',
      thesis: [
        'Ownership lives in the architecture.',
        'Personal AI should keep information flow, memory, orchestration, and delivery inspectable and portable, so models, providers, and tools can change without taking control away from the person.',
      ],
      projects: ['amanuensis', 'yaaa'],
    },
    {
      id: 'embodied-life',
      name: 'Embodied Life',
      thesis: [
        'Enablement, not replacement.',
        "Technology should lower the barriers of memory, attention, and mobility, and leave every decision in the person's hands.",
      ],
      projects: ['beagle', 'trailwalk'],
    },
    {
      id: 'inhabited-worlds',
      name: 'Inhabited Worlds',
      thesis: [
        'Worlds are made of relationships.',
        'Relationships among people, AI agents, machines, and other beings shape how a world is shared and experienced, irreducible to any outcome.',
      ],
      projects: ['commonplace'],
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

export const homepageProjects: HomepageProject[] = [
  {
    id: 'amanuensis',
    name: 'Amanuensis',
    topic: 'systems',
    introduction:
      'A base platform for personal LLM assistants, built to offload cognitive load. It aggregates personal information (work email, to-dos, appointments) and ambient information (flyers, newsletters, weather alerts, RSS feeds), then triages, ranks, and denoises the stream, so what matters surfaces where it matters.',
    asset: '/assets/project-covers/amanuensis-trace.svg',
    href: '/projects/amanuensis/',
  },
  {
    id: 'yaaa',
    name: 'Yaaa',
    topic: 'systems',
    introduction:
      'A local-first, federated assistant architecture: self-hostable AI orchestration for auditability and harness-agnostic memory synchronization.',
    asset: '/assets/project-covers/yaaa-layer-map.svg',
    href: '/projects/yaaa/',
  },
  {
    id: 'beagle',
    name: 'Beagle',
    topic: 'embodied-life',
    introduction:
      'A cognitive-support agent concept for people facing memory or attention barriers: an always-on assistant that logs, tracks, and reminds, so the person can make informed decisions even when being informed is a challenge.',
    asset: '/assets/project-covers/beagle-logbook.svg',
    href: '/projects/beagle/',
  },
  {
    id: 'trailwalk',
    name: 'Trailwalk',
    topic: 'embodied-life',
    introduction:
      'A VR walking prototype built from real 360-degree trail video and spatial audio, designed to make outdoor places more accessible from indoor community settings.',
    asset: '/assets/project-covers/trailwalk-shoreline.webp',
    href: '/projects/trailwalk/',
  },
  {
    id: 'commonplace',
    name: 'commonplace',
    topic: 'inhabited-worlds',
    introduction:
      'Research into human-AI relationships in game worlds, curiosity-driven autotelic agency in AI agents, and the philosophy of Otherness as it emerges from how we treat and regard LLM agents.',
    asset: '/assets/project-covers/commonplace-bridge.svg',
    href: '/projects/commonplace/',
  },
];

export const homepageProjectById = Object.fromEntries(
  homepageProjects.map((project) => [project.id, project])
) as Record<string, HomepageProject>;
