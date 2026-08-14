export const site = {
  name: 'J. Kong',
  homeTitle: 'Exploring what remains irreducible in the age of Generative AI',
  description:
    'A portfolio of systems, embodied life, and inhabited worlds for agency, shared worlds, and personal AI infrastructure.',
  githubUrl: 'https://github.com/Jarvie8176',
  agentGithubUrl: 'https://github.com/cyber-ayi',
  repoUrl: 'https://github.com/Jarvie8176/portfolio',
};

const env = (key: string) => process.env[key]?.trim() || undefined;

const analyticsScriptUrl =
  env('PORTFOLIO_UMAMI_SCRIPT_URL') ?? env('UMAMI_SCRIPT_URL');
const analyticsWebsiteId =
  env('PORTFOLIO_UMAMI_WEBSITE_ID') ?? env('UMAMI_WEBSITE_ID');

/**
 * Hostnames and addresses are injected at build time, never committed.
 *
 * This repository is public and its build output is gated on carrying no real
 * domain, so a literal here is not a style problem: it is the thing the deploy
 * gate exists to catch. Anything that names where the site lives, how to reach
 * its author, or where its media is served belongs in this object and nowhere
 * else, so there is one place to audit rather than a grep across the tree.
 *
 * Absent values degrade to nothing rather than to a placeholder. A build with
 * no injection is then provably domain-free, which is exactly what the dev
 * artifact is supposed to be.
 */
export const deployment = {
  /** Public contact address. Omitted from the page when unset. */
  contactEmail: env('PORTFOLIO_CONTACT_EMAIL'),
  /** Scheduling link (e.g. Calendly). Omitted from the page when unset. */
  schedulingUrl: env('PORTFOLIO_SCHEDULING_URL'),
  /** LinkedIn profile URL. Omitted from the page when unset. */
  linkedinUrl: env('PORTFOLIO_LINKEDIN_URL'),
  /** Signal contact link (signal.me). Omitted from the page when unset. */
  signalUrl: env('PORTFOLIO_SIGNAL_URL'),
  /** Where readers follow development notes. Omitted from the page when unset. */
  updatesUrl: env('PORTFOLIO_UPDATES_URL'),
  /** Base URL for Trailwalk gallery media. Required; the gallery fails closed. */
  assetBaseUrl: env('TRAILWALK_ASSET_BASE_URL')?.replace(/\/$/, ''),
  analytics: {
    /** Public Umami script URL. Omitted when unset. */
    scriptUrl: analyticsScriptUrl,
    /** Public Umami website id. Omitted when unset. */
    websiteId: analyticsWebsiteId,
    /** Optional comma-separated domain allowlist for the tracker. */
    domains: env('PORTFOLIO_UMAMI_DOMAINS') ?? env('UMAMI_DOMAINS'),
    /** Optional Umami tag for separating dev/prod or campaigns. */
    tag: env('PORTFOLIO_UMAMI_TAG') ?? env('UMAMI_TAG'),
    enabled: Boolean(analyticsScriptUrl && analyticsWebsiteId),
  },
};

/** Host of a deployment URL, for use as link text. */
export const displayHost = (url: string | undefined) => {
  if (!url) return undefined;
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
};
