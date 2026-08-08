export type TrailwalkLocationSource =
    | "jpg_exif"
    | "original_insp_exif"
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

/**
 * One panorama tier. The byte count is the size of the object actually served
 * from the asset host, because the reader is shown it before deciding whether
 * to spend it. Re-measure with a range request rather than estimating:
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
    shortPlace: string;
    locationLabel: string;
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
        highlight: string;
        highlight2x?: string;
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

const assetVersion = "trailwalk/v1";

const makeAssets = (
    slug: string,
    bytes: { panorama: number; panoramaHd: number },
): TrailwalkGalleryItem["assets"] => ({
    highlight: `${assetVersion}/highlights/${slug}-1200.webp`,
    highlight2x: `${assetVersion}/highlights/${slug}-2400.webp`,
    panorama: {
        key: `${assetVersion}/panoramas/${slug}-4096.jpg`,
        bytes: bytes.panorama,
    },
    panoramaHd: {
        key: `${assetVersion}/panoramas/${slug}-8192.jpg`,
        bytes: bytes.panoramaHd,
    },
    poster: `${assetVersion}/posters/${slug}-1600.webp`,
});

export const trailwalkGalleryItems: TrailwalkGalleryItem[] = [
    {
        id: "tablelands",
        title: "Tablelands Stream",
        shortPlace: "Tablelands, NL",
        locationLabel: "Tablelands, NL",
        terrainTag: "Open barrens",
        capturedAt: "2026-05-30T11:30:14",
        altitudeMeters: 258,
        coordinates: { latitude: 49.462, longitude: -57.959 },
        locationSource: "jpg_exif",
        mapsQuery: "Gros Morne Tablelands, Newfoundland and Labrador",
        assets: makeAssets("tablelands", {
            panorama: 1320629,
            panoramaHd: 3785687,
        }),
        initialView: {
            yaw: "12deg",
            pitch: "-4deg",
            zoom: 35,
        },
    },
    {
        id: "norstead",
        title: "Norstead Lowland",
        shortPlace: "Norstead Trail, NL",
        locationLabel: "Norstead Trail, NL",
        terrainTag: "Coastal lowland",
        capturedAt: "2026-06-01T10:31:33",
        altitudeMeters: 14,
        coordinates: { latitude: 51.603, longitude: -55.52 },
        locationSource: "original_insp_exif",
        mapsQuery: "Norstead Trail, Newfoundland and Labrador",
        assets: makeAssets("norstead", {
            panorama: 1681744,
            panoramaHd: 5431819,
        }),
        initialView: {
            yaw: "-18deg",
            pitch: "-2deg",
            zoom: 32,
        },
    },
    {
        id: "fishing-point",
        title: "Fishing Point Approach",
        shortPlace: "St Anthony, NL",
        locationLabel: "St Anthony, NL",
        terrainTag: "Coastal trail",
        capturedAt: "2026-06-02T10:41:30",
        altitudeMeters: 15,
        coordinates: { latitude: 51.359, longitude: -55.558 },
        locationSource: "jpg_exif",
        mapsQuery: "Fishing Point Park Trails, St. Anthony, Newfoundland and Labrador",
        assets: makeAssets("fishing-point", {
            panorama: 1390333,
            panoramaHd: 4414556,
        }),
        initialView: {
            yaw: "28deg",
            pitch: "-5deg",
            zoom: 34,
        },
    },
    {
        id: "margaret-falls",
        title: "Margaret Falls",
        shortPlace: "Margaret Falls, BC",
        locationLabel: "Margaret Falls, BC",
        terrainTag: "Waterfall trail",
        capturedAt: "2026-05-01T11:36:45",
        // No coordinates: every frame from this day carries a 0/0 fix, so there
        // is no recorded position to round. The place name is the only location
        // this item has ever had.
        locationSource: "manual_review",
        mapsQuery: "Margaret Falls, Tappen, British Columbia",
        assets: makeAssets("margaret-falls", {
            panorama: 1725153,
            panoramaHd: 5284670,
        }),
        initialView: {
            yaw: "18deg",
            pitch: "-5deg",
            zoom: 34,
        },
    },
    {
        id: "cartreau-panorama",
        title: "Cartreau Panorama",
        shortPlace: "St Anthony, NL",
        locationLabel: "St Anthony, NL",
        terrainTag: "Wide coastal view",
        capturedAt: "2026-06-02T11:21:07",
        altitudeMeters: 120,
        coordinates: { latitude: 51.354, longitude: -55.563 },
        locationSource: "jpg_exif",
        mapsQuery:
            "Cartreau Point Trail, St. Anthony, Newfoundland and Labrador",
        assets: makeAssets("cartreau-panorama", {
            panorama: 1589523,
            panoramaHd: 4984185,
        }),
        initialView: {
            yaw: "-34deg",
            pitch: "-4deg",
            zoom: 31,
        },
    },
    {
        id: "kauzmann-ridge",
        title: "Kauzmann Ridge",
        shortPlace: "Kauzmann Trail, NS",
        locationLabel: "Kauzmann Trail, NS",
        terrainTag: "Highland ridge",
        capturedAt: "2026-06-08T14:23:22",
        altitudeMeters: 388,
        coordinates: { latitude: 46.994, longitude: -60.42 },
        locationSource: "jpg_exif",
        mapsQuery: "Kauzmann Trail, Nova Scotia",
        assets: makeAssets("kauzmann-ridge", {
            panorama: 937829,
            panoramaHd: 2743169,
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

/** "June 2, 2026" — the card label, where the hour would be noise. */
export const formatCapturedDate = (capturedAt: string) =>
    readCapturedAt(capturedAt).date;

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
