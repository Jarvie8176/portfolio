# Portfolio Homepage Design v0.4

Date: 2026-08-06
Status: design record for implementation PRs

## Direction

The homepage is not a grid of six products. It is a landing page for one
research and practice body of work.

The page should help a visitor understand, quickly and concretely, that these
projects ask what remains hard to reduce in the age of generative AI: memory,
attention, agency, bodies, care, public life, and shared worlds.

Design tone:

```text
Editorial research publication + field material + technical evidence
```

## Hero Thesis

Primary hero line:

```text
Exploring what cannot be reduced in the age of GenAI
```

Supporting line:

```text
Systems, embodied life, and inhabited worlds that resist being flattened into
tasks, data, or generated output.
```

## Practice Taxonomy

Use three primary practice groups:

```text
Systems
Embodied Life
Inhabited Worlds
```

Do not use `Encounters` as a top-level practice. It can remain a lower-level
word for the photo practice. Do not use `Substrate` as a top-level practice; it
is useful inside technical evidence, especially for commonplace, but it is too
engineering-heavy for the whole portfolio.

Project placement:

| Project | Primary | Secondary |
|---|---|---|
| amanuensis | Systems | Inhabited Worlds |
| Yaaa | Systems | Embodied Life |
| Beagle | Embodied Life | Systems |
| Trailwalk | Embodied Life | Inhabited Worlds |
| commonplace | Inhabited Worlds | Systems |
| Notes of Open World Observations | Inhabited Worlds | Embodied Life |

## Homepage IA

The homepage order follows the practice taxonomy:

```text
[NAV] J. Kong · Work · Contact

[S0] Cover Gallery
     Six diagonal project-material slices + hero thesis

Systems
[S1] amanuensis
[S2] Yaaa

Embodied Life
[S3] Beagle
[S4] Trailwalk

Inhabited Worlds
[S5] commonplace
[S6] Notes of Open World Observations

[FOOTER] Name · GitHub · version
[FIXED] Practice Index
```

Trailwalk can still carry the strongest visual weight inside its own section,
but it should no longer force the homepage order. The order is conceptual:
systems first, then embodied life, then inhabited worlds.

## S0 Cover Gallery

S0 is the page cover and hero. Do not add a separate full-screen thesis section
before it.

The cover is a gallery made of diagonal slices. Each slice represents one
project through real project material or a clearly labeled material placeholder.

Slice order:

```text
amanuensis -> Yaaa -> Beagle -> Trailwalk -> commonplace -> Notes of Open World Observations
```

Rules:

- Use real project material whenever available.
- If using placeholder material, label the actual pending material type.
- Do not create fake product screenshots or decorative AI imagery.
- The diagonal split is structural, not a scroll animation.
- Desktop may use angled slices.
- Mobile should switch to stacked strips or simple panels; do not force narrow
  diagonal slices on small screens.
- Use `min-height`, not fixed `height: 100vh`.

## Section Content Pattern

Each project section should answer, in this order:

1. What this is.
2. What exists now.
3. Why it matters.
4. What remains unresolved.
5. Where to inspect evidence.

Keep homepage copy short. Long argument belongs on project detail pages.

## Status Model

Use these status codes and visible labels:

| `status_code` | Visible label | Definition |
|---|---|---|
| `operational` | In use | Running in a real environment |
| `integration` | Integration in progress | Built parts exist; full loop is not closed |
| `prototype` | Active prototype | Working prototype with important open validation |
| `research_build` | Research build | Research substrate exists; final result is not proven |
| `concept` | Concept study | Problem definition or evaluation design stage |
| `archive` | Ongoing archive | Growing creative archive or practice |

Project status:

| Project | Homepage role | Status |
|---|---|---|
| amanuensis | Systems Case | In use |
| Yaaa | Assistant Operating Layer | Integration in progress |
| Beagle | Incubation Study | Concept study |
| Trailwalk | Lead Embodied Work | Active prototype |
| commonplace | Research World | Research build |
| Notes of Open World Observations | Inhabited Worlds Anchor | Ongoing archive |

## Simple English Copy

Portfolio description:

```text
This portfolio asks what cannot be reduced to tasks, data, or generated output:
attention, memory, agency, care, bodies, and the worlds we share with others.
```

Short paragraph:

```text
These projects explore how AI and software can support a person without
replacing the person. Some build systems for remembering, filtering, deciding,
and acting with care. Some return to the body: walking, disability, memory, and
daily life. Others look at worlds we live in with agents, animals, strangers,
places, and public space.
```

Project lines:

- amanuensis: A system for gathering information, reducing noise, and showing
  what matters.
- Yaaa: A self-owned assistant layer that connects memory, conversation, action,
  surfaces, and safety.
- Beagle: A memory helper that turns daily audio into notes, reminders, and
  traces the user can keep.
- Trailwalk: A VR walking project that brings real outdoor trails to people who
  cannot easily walk outside.
- commonplace: A shared research world where a human and an AI agent live
  alongside each other, exploring co-dwelling, curiosity, and shared agency
  beyond task success.
- Notes of Open World Observations: A photo and caption practice about meeting the
  public world with beauty, doubt, care, and memory.

## Component Naming

Use these names in implementation and docs:

| Component | Meaning |
|---|---|
| `SiteHeader` | Fixed or sticky top navigation |
| `CoverGallery` | S0 diagonal project-material cover |
| `PracticeIndex` | Fixed bottom mode index; not a ruler |
| `StatusBadge` | Current honest project status |
| `ModeTag` | Systems / Embodied Life / Inhabited Worlds labels |
| `RoleBadge` | Section role such as Lead Work or Research Build |
| `EvidenceArtifact` | Real material or explicitly labeled material placeholder |
| `ProjectSection` | Reusable homepage section shell |
| `PracticeMap` | S7 map of overlapping practices |

Use `PracticeIndex`, not `Practice Ruler`. The three practices are overlapping
modes, not a linear axis.

Use `EvidenceArtifact`, not `Artifact Placeholder`. The design should show
evidence and status honestly, not simulate finished products.

## Visual Rules

- Base colors should move from the old warm notebook theme to the v0.3 palette:
  `--paper #F6F7F5`, `--surface #FCFBF7`, `--ink #1B1D1F`,
  `--ink-soft #5A5E63`, `--rule #DCE1DE`.
- Practice colors:
  `--systems #2C4E8A`, `--embodied #657052`,
  `--worlds #985E49`.
- Use accents only for tags, links, status, and small material markers.
- Do not fill whole sections with strong accent colors.
- Avoid pure white and pure black.
- Use CJK-safe font stacks. Noto Sans / Noto Serif / Noto Sans Mono are the
  reference direction.
- Body text should not go below 16px.
- Labels should not go below 11px.
- Use `min-height: calc(100svh - nav)` for major desktop sections, not fixed
  `height: 100vh`.
- Respect `prefers-reduced-motion`; no scroll-jacking, parallax, particles, or
  cursor effects.

## Public-Safety Rules

The homepage and build output must not expose:

- Internal org names that are not intentionally public.
- Internal hostnames or `*.h.fnpg.me` URLs.
- Local filesystem paths.
- Claude session references or private agent traces.
- Bulk internal GitHub issue or PR references.
- Private deployment details.

Avoid overclaiming:

- Yaaa is not a fully shipped assistant.
- amanuensis should not claim a public OSS release posture.
- Beagle is pre-MVP / concept-stage.
- Trailwalk is an active prototype, not a polished consumer or medical product.
- commonplace is a research build; do not claim a complete autonomous loop.
- Notes of Open World Observations is an ongoing practice, not a complete archive.

## Render Audit: 2026-08-07 Landing Screenshot

The current S0 direction is accepted: a first-screen diagonal gallery with one
slice per project. The screenshot still showed three issues to close before
calling the landing page done:

- The thesis text was strong enough to obscure the gallery and slice labels.
- Project sections still behaved like full-screen chapters, creating too much
  vertical air for the reduced landing copy.
- At the captured desktop width, the first project title could be clipped by the
  image/text grid.

Resolution:

- Keep the S0 gallery as the primary cover, but reduce thesis width and scale so
  the project materials remain legible.
- Keep landing project content to image, name, tags, topic, and one sentence.
- Reduce project-section height, column width, tag size, and summary scale.
- Add a footer version tag from the build git short hash for dev-deployment
  verification.

## PR Plan

### PR 1: Homepage IA + Cover Gallery

- Replace the old `field notes` index with the new S0-S7 homepage.
- Add `J. Kong` nav.
- Add S0 diagonal `CoverGallery`.
- Add `PracticeIndex`.
- Separate amanuensis and Yaaa.
- Keep section copy short and status-honest.

### PR 2: Visual System + Evidence Components

- Update tokens and typography.
- Add `StatusBadge`, `ModeTag`, `RoleBadge`, `EvidenceArtifact`,
  `ProjectSection`, and `PracticeMap`.
- Ensure placeholders are explicit evidence placeholders, not fake UI.

### PR 3: Copy Pass + Public-Safety Gate

- Apply simple English copy.
- Add public-safety checks for internal tokens and paths.
- Confirm no project overclaims its current state.

### PR 4: Detail Pages + Real Media

- Add or revise Trailwalk and commonplace detail pages.
- Update existing Beagle page to match the new visual system.
- Replace S0 placeholders with real project material when available.
- Build the photo gallery only after image-level visibility review.
