export type TrailwalkLocationSource =
    | "jpg_exif"
    | "original_insp_exif"
    | "original_dng_exif"
    | "manual_review";

/**
 * Latitude and longitude rounded to three decimal places, which is roughly
 * 110 m of latitude.
 *
 * The rounding happens before a value is written into this file, not on the way
 * to the page: this repository is public, so a full-precision number committed
 * here is published whatever the renderer does with it. Three places is also no
 * more than `locationLabel` and `mapsQuery` already give away — those name the
 * trail — so the two disclosures are consistent with each other.
 *
 * Do not add a per-image "approved for exact publication" flag: a runtime toggle
 * over data that must not exist in a public repository is not a control, it is
 * an affordance.
 */
export type TrailwalkApproxCoordinates = {
    /** Decimal degrees, north positive, rounded to 3 places. */
    latitude: number;
    /** Decimal degrees, east positive, rounded to 3 places. */
    longitude: number;
};

/** One `srcset` candidate for the card thumbnail. */
export type TrailwalkHighlight = {
    width: number;
    key: string;
};

/**
 * One panorama tier. The standard tier is a 4096-wide derivative; the HD tier
 * is the stitched original at 11904x5952, stripped of all metadata but
 * otherwise untouched — the same compressed image data, so it is the highest
 * resolution that exists rather than a re-encode of it.
 *
 * The byte count is the size of the object actually served from the asset
 * host, because the reader is shown it before deciding whether to spend it,
 * and at 12-42 MB that decision is a real one. Re-measure with a range request
 * rather than estimating:
 *
 *   curl -sI -r 0-0 "$TRAILWALK_ASSET_BASE_URL/<key>"   # content-range: bytes 0-0/<bytes>
 */
export type TrailwalkPanorama = {
    key: string;
    bytes: number;
};

export type TrailwalkGalleryItem = {
    id: string;
    title: string;
    /** Subtitle on the card and the `Place` row in the details panel. */
    place: string;
    terrainTag: string;
    /**
     * The camera's own clock reading (EXIF DateTimeOriginal), which carries no
     * UTC offset — these files have neither OffsetTimeOriginal nor a GPS
     * timestamp to recover one from. It is therefore local wall-clock time at
     * the place the photo was taken, and it is only ever formatted field by
     * field. See `formatCapturedDateTime`.
     */
    capturedAt: string;
    altitudeMeters?: number;
    /**
     * Absent where no position was recorded: a 0/0 GPS fix or a frame whose
     * source file carries no GPS block at all. Absent is rendered as absent —
     * it is never backfilled from the place name.
     */
    coordinates?: TrailwalkApproxCoordinates;
    /**
     * Provenance of `coordinates`, kept server-side. It is not published: it
     * describes how the number was obtained, which is an audit question, not
     * something a visitor is reading the panel to learn.
     */
    locationSource: TrailwalkLocationSource;
    mapsQuery: string;
    assets: {
        highlights: TrailwalkHighlight[];
        panorama: TrailwalkPanorama;
        panoramaHd: TrailwalkPanorama;
        poster: string;
    };
    initialView?: {
        yaw?: string;
        pitch?: string;
        zoom?: number;
    };
};

/**
 * Published prefixes are immutable. The current export keeps colour-profile,
 * lens, and exposure metadata while removing fields that identify a person or
 * place, including vendor payloads not reported by standard metadata tools.
 */
const assetVersion = "trailwalk/v5";

/**
 * Card thumbnail candidates, ascending. Chosen from the rendered box at every
 * viewport and pixel ratio the layout produces, not from the grid definition.
 *
 *    303-441 px   desktop at 1x, across the whole three-column range
 *    512-734 px   desktop at 2x, and a phone at 2x
 *   972-1077 px   a phone at 3x
 *  1229-1436 px   a tablet at 2x, where the grid drops to one full-width card
 *
 * These candidates limit over-serving in desktop slots while preserving enough
 * density for wide mobile and tablet layouts.
 */
const highlightWidths = [480, 800, 1200, 1600];

const makeAssets = (
    slug: string,
    bytes: { panorama: number; panoramaHd: number },
): TrailwalkGalleryItem["assets"] => ({
    highlights: highlightWidths.map((width) => ({
        width,
        key: `${assetVersion}/highlights/${slug}-${width}.webp`,
    })),
    panorama: {
        key: `${assetVersion}/panoramas/${slug}-4096.jpg`,
        bytes: bytes.panorama,
    },
    panoramaHd: {
        key: `${assetVersion}/panoramas/${slug}-11904.jpg`,
        bytes: bytes.panoramaHd,
    },
    poster: `${assetVersion}/posters/${slug}-1600.webp`,
});

export const trailwalkGalleryItems: TrailwalkGalleryItem[] = [
    {
        id: "shoreline-trail",
        title: "Shoreline Trail",
        place: "Port Moody, BC",
        terrainTag: "Coastal forest",
        capturedAt: "2026-08-08T15:36:16",
        altitudeMeters: 1,
        coordinates: { latitude: 49.282, longitude: -122.838 },
        locationSource: "original_dng_exif",
        mapsQuery: "Shoreline Trail, Port Moody, British Columbia",
        assets: makeAssets("shoreline-trail", {
            panorama: 1624737,
            panoramaHd: 25267730,
        }),
    },
    {
        id: "margaret-falls",
        title: "Margaret Falls",
        place: "Salmon Arm, BC",
        terrainTag: "Waterfall trail",
        capturedAt: "2026-05-01T11:36:45",
        // No coordinates: every frame from this day carries a 0/0 fix, so there
        // is no recorded position to round. The place name is the only location
        // this item has ever had.
        locationSource: "manual_review",
        mapsQuery: "Margaret Falls, Salmon Arm, British Columbia",
        assets: makeAssets("margaret-falls", {
            panorama: 1725153,
            panoramaHd: 21370819,
        }),
        initialView: {
            yaw: "18deg",
            pitch: "-5deg",
            zoom: 34,
        },
    },
    {
        id: "cartreau-panorama",
        title: "Daredevil Trail",
        place: "St. Anthony, NL",
        terrainTag: "Wide coastal view",
        capturedAt: "2026-06-02T11:21:02",
        altitudeMeters: 120,
        coordinates: { latitude: 51.354, longitude: -55.563 },
        locationSource: "original_insp_exif",
        mapsQuery: "Daredevil Trail, St. Anthony, Newfoundland and Labrador",
        assets: makeAssets("cartreau-panorama", {
            panorama: 1015075,
            panoramaHd: 52426060,
        }),
        initialView: {
            yaw: "-34deg",
            pitch: "-4deg",
            zoom: 31,
        },
    },
    {
        id: "tablelands",
        title: "Tablelands Trail",
        place: "Gros Morne National Park, NL",
        terrainTag: "Open barrens",
        capturedAt: "2026-05-30T11:30:14",
        altitudeMeters: 258,
        coordinates: { latitude: 49.462, longitude: -57.959 },
        locationSource: "jpg_exif",
        mapsQuery: "Tablelands Trail, Gros Morne National Park, Newfoundland and Labrador",
        assets: makeAssets("tablelands", {
            panorama: 1320629,
            panoramaHd: 15469535,
        }),
        initialView: {
            yaw: "12deg",
            pitch: "-4deg",
            zoom: 35,
        },
    },
    {
        id: "norstead",
        title: "Norstead Trail",
        place: "L'Anse aux Meadows, NL",
        terrainTag: "Coastal lowland",
        capturedAt: "2026-06-01T10:30:15",
        altitudeMeters: 14,
        coordinates: { latitude: 51.603, longitude: -55.52 },
        locationSource: "original_insp_exif",
        mapsQuery: "Norstead Trail, L'Anse aux Meadows, Newfoundland and Labrador",
        assets: makeAssets("norstead", {
            panorama: 1086525,
            panoramaHd: 62273470,
        }),
        initialView: {
            yaw: "-18deg",
            pitch: "-2deg",
            zoom: 32,
        },
    },
    {
        id: "kauzmann-ridge",
        title: "Kauzmann Trail",
        place: "Cape Breton Island, NS",
        terrainTag: "Highland ridge",
        capturedAt: "2026-06-08T14:23:17",
        altitudeMeters: 388,
        coordinates: { latitude: 46.994, longitude: -60.42 },
        locationSource: "original_dng_exif",
        mapsQuery: "Kauzmann Trail, Cape Breton Island, Nova Scotia",
        assets: makeAssets("kauzmann-ridge", {
            panorama: 777607,
            panoramaHd: 40529353,
        }),
        initialView: {
            yaw: "8deg",
            pitch: "-6deg",
            zoom: 32,
        },
    },
];

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const capturedAtPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;

// TODO(test): no coverage. See tests/TODO.md T8 — the label must be identical
// for every reader regardless of their machine's time zone.
/**
 * Reads the fields out of `capturedAt` without constructing a `Date`.
 *
 * This is the whole point of the function. `new Date("2026-06-02T11:21:07")`
 * resolves the string against the *reader's* time zone, so any later formatting
 * silently reports a Newfoundland morning as whatever o'clock it would have
 * been in Berlin. The string is a wall-clock reading with no offset attached;
 * there is nothing to convert it to, and converting it is the bug.
 */
const readCapturedAt = (capturedAt: string) => {
    const match = capturedAtPattern.exec(capturedAt);

    if (!match) {
        throw new Error(
            `capturedAt must be "YYYY-MM-DDTHH:MM:SS" with no zone offset, got "${capturedAt}".`,
        );
    }

    const [, year, month, day, hour, minute] = match;
    const monthName = monthNames[Number(month) - 1];

    if (!monthName) {
        throw new Error(`capturedAt has month ${month}, which is not a month.`);
    }

    return {
        date: `${monthName} ${Number(day)}, ${year}`,
        time: `${hour}:${minute}`,
    };
};

/**
 * "June 2, 2026 · 11:21 local" — the details label.
 *
 * "local" is doing real work: it says the clock is the one at the place in the
 * photo. Naming a zone instead would be an invention, since none of these files
 * records one.
 */
export const formatCapturedDateTime = (capturedAt: string) => {
    const { date, time } = readCapturedAt(capturedAt);
    return `${date} · ${time} local`;
};

/** "51.354° N, 55.563° W" */
export const formatCoordinates = (coordinates: TrailwalkApproxCoordinates) => {
    const lat = `${Math.abs(coordinates.latitude).toFixed(3)}° ${
        coordinates.latitude < 0 ? "S" : "N"
    }`;
    const lon = `${Math.abs(coordinates.longitude).toFixed(3)}° ${
        coordinates.longitude < 0 ? "W" : "E"
    }`;

    return `${lat}, ${lon}`;
};

// TODO(test): no coverage. See tests/TODO.md T4 — no href may carry a
// coordinate with more than three decimal places, for every item in
// trailwalkGalleryItems.
/**
 * The link resolves to the same position the panel prints, so the two cannot
 * drift apart: both read `item.coordinates`, and where that is absent both fall
 * back to the place name.
 */
export const getTrailwalkMapsAction = (item: TrailwalkGalleryItem) => {
    const query = item.coordinates
        ? `${item.coordinates.latitude.toFixed(3)},${item.coordinates.longitude.toFixed(3)}`
        : item.mapsQuery;

    return {
        label: "See location in Google Maps",
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    };
};

/**
 * "3.8 MB". Base 1000, matching what a browser's own download UI reports, so
 * the hint and the transfer the reader then watches agree.
 */
export const formatBytes = (bytes: number) =>
    `${(bytes / 1_000_000).toFixed(1)} MB`;
