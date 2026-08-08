export const site = {
  name: 'J. Kong',
  homeTitle: 'Exploring what cannot be reduced in the age of GenAI',
  description:
    'A portfolio of systems, embodied life, and inhabited worlds that resist being flattened into tasks, data, or generated output.',
  role: 'Research engineer working across AI systems, embodied media, and public-world observation.',
  githubUrl: 'https://github.com/Jarvie8176',
};

const env = (key: string) => process.env[key]?.trim() || undefined;

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
  /** Where readers follow development notes. Omitted from the page when unset. */
  updatesUrl: env('PORTFOLIO_UPDATES_URL'),
  /** Base URL for Trailwalk gallery media. Required; the gallery fails closed. */
  assetBaseUrl: env('TRAILWALK_ASSET_BASE_URL')?.replace(/\/$/, ''),
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
