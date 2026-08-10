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
