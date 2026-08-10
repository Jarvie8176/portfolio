# Deployment

How builds of this repo reach a running site. The repo itself is only the
source: it contains no deploy credentials, no target hostnames, and no
production domain — those are injected on the serving side.

## Shape

```
push to main
  → CI (this repo): npm ci + astro build, no secrets, build check only
serving side (private host, pull-based):
  poll main for a new commit
  → require the CI check green for that exact sha
  → fetch source and build locally
      dev:  SITE_URL unset  → artifact carries no real domain
      prod: SITE_URL=<origin> injected at build time (manual step)
      optional: PORTFOLIO_UMAMI_* values inject privacy-friendly analytics
  → content-policy gate: pattern grep over the staged build output
      (the pattern list is private; that is why it is not a CI step here)
  → releases/<sha> + atomic symlink swap to `current`
  → static file server; dev preview is private-network only, with
      X-Robots-Tag: noindex added at the reverse proxy
```

## Properties

- **Pull, not push**: nothing in GitHub can reach the serving host; the
  serving host decides what it takes. A compromise of this repo or its CI
  cannot deploy anything by itself — the deploy side re-gates every artifact.
- **Domain decoupling**: the production origin exists only as a build-time
  variable on the serving side (`astro.config.mjs` falls back to a placeholder
  here). Dev artifacts are provably domain-free — the deploy-side gate greps
  for the production domain and refuses the build if it appears.
- **Atomicity**: gates run entirely against the staged build; the live
  `current` symlink moves in a single rename, and rollback is pointing it at
  a previous `releases/<sha>`.
- **Dev vs prod**: dev deploys are automatic on merge (short poll interval);
  production promotion is deliberately a manual invocation of the same
  pipeline and is not wired up yet.

## Cloudflare Pages Candidate

Cloudflare Pages is the preferred production target once `portfolio.fnpg.me` is
ready to move out of the private host pipeline. Use the Pages Git integration
for the first project, not Direct Upload, so GitHub PRs get preview deployments,
deployment checks, and branch-aware production promotion. Cloudflare documents
that Git integration and Direct Upload are one-way project choices, so starting
with Git integration avoids recreating the project later.

Project shape:

```
GitHub repo: Jarvie8176/portfolio
production branch: main
preview branches: dev and pull requests
build command: npm ci && npm run build
build output directory: dist
```

Required Pages environment variables:

```
NODE_VERSION=24
TRAILWALK_ASSET_BASE_URL=https://media.fnpg.me
SITE_URL=https://portfolio.fnpg.me
PORTFOLIO_UMAMI_SCRIPT_URL=<public umami script URL>
PORTFOLIO_UMAMI_WEBSITE_ID=<umami website uuid>
PORTFOLIO_UMAMI_DOMAINS=portfolio.fnpg.me
```

Optional Pages environment variables:

```
PORTFOLIO_CONTACT_EMAIL=<public contact address>
PORTFOLIO_UPDATES_URL=<public updates URL>
PORTFOLIO_UMAMI_TAG=prod
```

Cutover plan:

1. Create the Pages project from GitHub with production branch `main`, preview
   builds enabled for `dev` and PR branches, and output directory `dist`.
2. Add the environment variables above in Pages production and preview
   environments. Preview may keep `SITE_URL` unset if the artifact should remain
   origin-free; production must set it before sitemap/canonical verification.
3. Deploy to the temporary `*.pages.dev` URL and verify the Trailwalk page,
   R2 media loads from `media.fnpg.me`, Umami script renders only when configured,
   and no raw media URLs or unapproved exact coordinates appear in public HTML.
4. Attach `portfolio.fnpg.me` through the Pages Custom domains flow. Do not add
   only a manual CNAME; Cloudflare warns that skipping the Pages association can
   produce a 522.
5. Re-run production smoke checks on `https://portfolio.fnpg.me/` and
   `https://portfolio.fnpg.me/projects/trailwalk/`, then freeze or retire the
   old homelab production route if one exists.

Rollback is Pages deployment rollback to the previous successful deployment.
Keep the current pull-based dev preview until the Pages production route has
served at least one verified release on the custom domain.

Reference docs:

- Cloudflare Pages Git integration:
  <https://developers.cloudflare.com/pages/configuration/git-integration/>
- Cloudflare Pages GitHub integration:
  <https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/>
- Cloudflare Pages Direct Upload:
  <https://developers.cloudflare.com/pages/get-started/direct-upload/>
- Cloudflare Pages custom domains:
  <https://developers.cloudflare.com/pages/configuration/custom-domains/>

## Analytics

See [analytics.md](./analytics.md) for the event taxonomy and privacy boundary.
Umami is optional and injected at build time. The tracker is omitted unless both
the script URL and website id are present:

```
PORTFOLIO_UMAMI_SCRIPT_URL=<public umami script URL>
PORTFOLIO_UMAMI_WEBSITE_ID=<umami website uuid>
PORTFOLIO_UMAMI_DOMAINS=<optional comma-separated domains>
PORTFOLIO_UMAMI_TAG=<optional dev/prod tag>
```

The shorter `UMAMI_*` names are also accepted as fallbacks, but deploy-side
configuration should prefer the `PORTFOLIO_UMAMI_*` names so every injected
value has an explicit portfolio owner.

The public footer discloses analytics only when the tracker is actually
rendered. Trailwalk records low-cardinality product events such as CTA clicks,
FAQ toggles, gallery selections, viewer load/error, HD toggle, details toggle,
maps link opens, and viewer back. It deliberately does not send exact
coordinates, maps URLs, location provenance, sensor readings, or custom user
identifiers.

If the tracker URL or host URL adds a public host to the artifact, the serving
side content-policy allowlist must include that exact host. Do not weaken the
redline pattern for this.
