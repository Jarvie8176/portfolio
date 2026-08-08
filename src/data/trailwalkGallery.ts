export type TrailwalkLocationSource =
    | "jpg_exif"
    | "original_insp_exif"
    | "manual_review";

/**
 * This repository is public, so this type deliberately cannot express an exact
 * latitude/longitude. Exact coordinates stay in the private review layer and
 * are never carried through the build. `mapsQuery` is a human place name, so
 * the only location a visitor can reach is an approximate area.
 *
 * Do not reintroduce a per-image "approved for exact publication" flag here:
 * a runtime toggle over data that must not exist in a public repository is not
 * a control, it is an affordance.
 */
export type TrailwalkGalleryItem = {
    id: string;
    title: string;
    shortPlace: string;
    locationLabel: string;
    terrainTag: string;
    capturedAt: string;
    capturedLabel: string;
    altitudeMeters?: number;
    locationSource: TrailwalkLocationSource;
    mapsQuery: string;
    assets: {
        highlight: string;
        highlight2x?: string;
        panorama: string;
        poster: string;
    };
    initialView?: {
        yaw?: string;
        pitch?: string;
        zoom?: number;
    };
};

const assetVersion = "trailwalk/v1";

const makeAssets = (slug: string): TrailwalkGalleryItem["assets"] => ({
    highlight: `${assetVersion}/highlights/${slug}-1200.webp`,
    highlight2x: `${assetVersion}/highlights/${slug}-2400.webp`,
    panorama: `${assetVersion}/panoramas/${slug}-4096.jpg`,
    poster: `${assetVersion}/posters/${slug}-1600.webp`,
});

export const locationSourceLabels: Record<TrailwalkLocationSource, string> = {
    jpg_exif: "JPG EXIF",
    original_insp_exif: "INSP EXIF",
    manual_review: "Manual review",
};

export const trailwalkGalleryItems: TrailwalkGalleryItem[] = [
    {
        id: "tablelands",
        title: "Tablelands Stream",
        shortPlace: "Tablelands, NL",
        locationLabel: "Tablelands, NL",
        terrainTag: "Open barrens",
        capturedAt: "2026-05-30T11:30:14",
        capturedLabel: "May 30, 2026",
        altitudeMeters: 258,
        locationSource: "jpg_exif",
        mapsQuery: "Gros Morne Tablelands, Newfoundland and Labrador",
        assets: makeAssets("tablelands"),
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
        capturedLabel: "June 1, 2026",
        altitudeMeters: 14,
        locationSource: "original_insp_exif",
        mapsQuery: "Norstead Trail, Newfoundland and Labrador",
        assets: makeAssets("norstead"),
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
        capturedLabel: "June 2, 2026",
        altitudeMeters: 15,
        locationSource: "jpg_exif",
        mapsQuery: "Fishing Point Park Trails, St. Anthony, Newfoundland and Labrador",
        assets: makeAssets("fishing-point"),
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
        capturedLabel: "May 1, 2026",
        locationSource: "manual_review",
        mapsQuery: "Margaret Falls, Tappen, British Columbia",
        assets: makeAssets("margaret-falls"),
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
        capturedLabel: "June 2, 2026",
        altitudeMeters: 120,
        locationSource: "jpg_exif",
        mapsQuery:
            "Cartreau Point Trail, St. Anthony, Newfoundland and Labrador",
        assets: makeAssets("cartreau-panorama"),
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
        capturedLabel: "June 8, 2026",
        altitudeMeters: 388,
        locationSource: "jpg_exif",
        mapsQuery: "Kauzmann Trail, Nova Scotia",
        assets: makeAssets("kauzmann-ridge"),
        initialView: {
            yaw: "8deg",
            pitch: "-6deg",
            zoom: 32,
        },
    },
];

export const getTrailwalkMapsAction = (item: TrailwalkGalleryItem) => ({
    label: "Open approximate area",
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        item.mapsQuery,
    )}`,
});
