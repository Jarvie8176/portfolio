# Analytics

Portfolio analytics are optional build-time instrumentation. The source repo
does not hardcode tracker hosts, website ids, deploy origins, contact addresses,
or media origins.

## Runtime Contract

The Umami script is rendered only when both values are present:

```
PORTFOLIO_UMAMI_SCRIPT_URL=<public umami script URL>
PORTFOLIO_UMAMI_WEBSITE_ID=<umami website uuid>
```

Optional values:

```
PORTFOLIO_UMAMI_DOMAINS=<comma-separated tracker domain allowlist>
PORTFOLIO_UMAMI_TAG=<dev/prod tag>
```

The shorter `UMAMI_*` names are accepted as local fallbacks, but deploy-side
configuration should use `PORTFOLIO_UMAMI_*` so injected values have explicit
ownership.

## Disclosure

The footer discloses analytics only when the tracker script is actually
rendered. A build without Umami env values carries no tracker script and no
analytics disclosure.

Trailwalk uses the longer disclosure:

> Privacy-friendly analytics measure page visits and demo interest.

The general portfolio footer uses the shorter disclosure:

> Privacy-friendly analytics

## Event Taxonomy

Page views are left to Umami's default tracker behavior. Custom events are used
only where they answer product questions that page views cannot.

The tracker deliberately does not set Umami's `data-do-not-track` flag. That
flag makes browsers with `navigator.doNotTrack=1` skip the pageview request
entirely, which hides legitimate owner/operator verification visits and makes
the setup look unwired. Query strings and URL hashes are still excluded.

### Trailwalk Navigation

`trailwalk_nav_click`

Fields:

- `section`: `portfolio_home`, `hero`, `problem`, `origin`, `gallery`,
  `experience`, `audience`, `faq`, `contact`, or `request_updates`
- `placement`: `header` or `mobile_menu`

Purpose: understand which sections visitors intentionally jump to.

### Trailwalk CTA

`trailwalk_cta_click`

Fields:

- `cta`: `request_updates`, `get_in_touch`, `founder_links`, `linkedin`, or
  `development_notes`
- `placement`: `hero`, `contact`, or `stay_in_loop`

Purpose: distinguish demo interest from general founder/contact interest.

### Trailwalk FAQ

`trailwalk_faq_toggle`

Fields:

- `question`: `replace_outdoors`, `different_360`, `able_to_walk`, or `try_now`
- `state`: `open` or `close`

Purpose: find which public concerns need clearer page copy.

### Trailwalk Gallery And Viewer

`trailwalk_gallery_select`

Fields:

- `sample_id`: public gallery item id
- `viewer_layout`: `inline` or `below_grid`
- `reduced_motion`: boolean
- `tier`: `standard` or `hd`

`trailwalk_viewer_ready`

Fields:

- `sample_id`: public gallery item id
- `tier`: `standard` or `hd`
- `phase`: `initial_load` or `tier_swap`

`trailwalk_viewer_error`

Fields:

- `sample_id`: public gallery item id
- `tier`: `standard` or `hd`
- `phase`: `initial_load` or `tier_swap`

`trailwalk_hd_toggle`

Fields:

- `sample_id`: public gallery item id
- `next_tier`: `standard` or `hd`

`trailwalk_details_toggle`

Fields:

- `sample_id`: public gallery item id
- `state`: `open` or `close`

`trailwalk_maps_open`

Fields:

- `sample_id`: public gallery item id
- `coordinate_mode`: `approx` or `none`, derived server-side from whether the
  public gallery payload has approximate coordinates

`trailwalk_viewer_back`

Fields:

- `sample_id`: public gallery item id

`trailwalk_gyroscope_start`

Fields:

- `sample_id`: public gallery item id

Purpose: understand whether visitors open real samples, whether the viewer
loads successfully, whether HD is worth its bandwidth cost, and whether metadata
or map links are helpful.

### Yaaa Navigation

`yaaa_nav_click`

Fields:

- `section`: `work_index`, `hero`, or a page section id (`problem-space`,
  `architecture`, `layer-map`, `binding`, `governance`, `challenges-limits`, and
  their subsections)
- `placement`: `header`, `header_subnav`, `mobile_menu`, or `mobile_subnav`

Purpose: understand which parts of the architecture visitors jump to directly.

### Amanuensis Navigation

`amanuensis_nav_click`

Fields:

- `section`: `work_index`, `concept`, `hero`, a concept section id (`problem`,
  `why`, `example`, `system`, `explore`), a technical section id
  (`technical_intro`, `architecture`, `guarantees`, `feedback`, `decisions`), or
  a walkthrough stage id (`w-ingest`, `w-triage`, `w-ladder`, `w-gates`,
  `w-digest`, `w-ledger`)
- `placement`: `header`, `mobile_menu`, `stage_rail`, or `section_close`

Purpose: understand which sections visitors jump to, and whether the walkthrough
is read stage by stage or entered at a specific stage.

### Amanuensis CTA

`amanuensis_cta_click`

Fields:

- `cta`: `technical`, `walkthrough`, or `contact`
- `placement`: `header`, `mobile_menu`, `hero`, `technical_hero`, `system`,
  `section_action`, or `section_close`

Purpose: distinguish interest in technical rationale from interest in the
example evidence trail or general contact, and see which reading path earns the
click.

The concept, technical deep dive, and example walkthrough share one event
namespace; `section` and `placement` carry the page distinction (`stage_rail`
only exists on the walkthrough).

Section dot navigation on the concept page uses the shared
`portfolio_topic_click` event from `SectionDotNav.astro` rather than a page
specific event.

## Data Boundaries

Custom events deliberately do not send:

- exact coordinates
- Google Maps URLs
- location provenance such as EXIF source
- sensor readings
- viewer yaw, pitch, zoom, pan, drag, or other high-frequency motion data
- custom user ids
- contact email values
- tracker host or website id as event data

The only location-related analytics field is `coordinate_mode`, which is either
`approx` or `none`.

## Deployment Notes

If analytics is enabled, the tracker host appears in the built artifact. The
private serving-side content-policy allowlist must include the exact host used
by `PORTFOLIO_UMAMI_SCRIPT_URL`. If Umami is configured with a separate host URL
for collection, that exact host must also be allowlisted.

Do not weaken redline patterns to deploy analytics. Add exact reviewed hosts.

The Umami API token, if needed for operational API calls, belongs in the
private secret store. It is not needed by the public page tracker and must not
be committed to this repository.
