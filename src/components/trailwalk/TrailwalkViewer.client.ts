import type { TrailwalkGalleryItem } from "../../data/trailwalkGallery";

type PublicTrailwalkItem = TrailwalkGalleryItem & {
    assets: TrailwalkGalleryItem["assets"] & {
        fallbackHighlight: string;
    };
    coordinateLabel: string;
    locationSourceLabel: string;
    mapsAction: {
        label: string;
        href: string;
    };
};

type ViewerInstance = {
    destroy: () => void;
};

let viewerCssPromise: Promise<void> | null = null;

const loadViewerCss = () => {
    viewerCssPromise ??= import("@photo-sphere-viewer/core/index.css?url").then(
        ({ default: href }) =>
            new Promise<void>((resolve, reject) => {
                const existing = document.querySelector<HTMLLinkElement>(
                    'link[data-trailwalk-viewer-css="true"]',
                );

                if (existing) {
                    resolve();
                    return;
                }

                const link = document.createElement("link");
                link.dataset.trailwalkViewerCss = "true";
                link.rel = "stylesheet";
                link.href = href;
                link.addEventListener("load", () => resolve(), { once: true });
                link.addEventListener("error", () => reject(), { once: true });
                document.head.append(link);
            }),
    );

    return viewerCssPromise;
};

const row = (label: string, value: string) => `
    <dt>${label}</dt>
    <dd>${value}</dd>
`;

const escapeHtml = (value: string) =>
    value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

const renderDetails = (item: PublicTrailwalkItem) => {
    const elevation =
        typeof item.altitudeMeters === "number"
            ? `${item.altitudeMeters} m`
            : "Not available";

    return `
        <h4>Field details</h4>
        <dl>
            ${row("Place", escapeHtml(item.locationLabel))}
            ${row("Captured", escapeHtml(item.capturedLabel))}
            ${row("Elevation", escapeHtml(elevation))}
            ${row("Coordinates", escapeHtml(item.coordinateLabel))}
            ${row("Location source", escapeHtml(item.locationSourceLabel))}
        </dl>
        <a class="trailwalk-viewer__map-link" href="${escapeHtml(item.mapsAction.href)}" target="_blank" rel="noreferrer">
            ${escapeHtml(item.mapsAction.label)}
        </a>
    `;
};

const nextFrame = () =>
    new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
    });

export const initializeTrailwalkGallery = (
    root: HTMLElement,
    items: PublicTrailwalkItem[],
) => {
    const cards = Array.from(
        root.querySelectorAll<HTMLAnchorElement>("[data-trailwalk-card]"),
    );
    const viewerShell = root.querySelector<HTMLElement>(
        "[data-trailwalk-viewer-shell]",
    );
    const galleryGrid = root.querySelector<HTMLElement>(
        ".trailwalk-gallery__grid",
    );
    const viewerContainer = root.querySelector<HTMLElement>(
        "[data-trailwalk-viewer]",
    );
    const viewerTitle = root.querySelector<HTMLElement>(
        "[data-trailwalk-viewer-title]",
    );
    const poster = root.querySelector<HTMLImageElement>("[data-trailwalk-poster]");
    const status = root.querySelector<HTMLElement>("[data-trailwalk-status]");
    const backButton = root.querySelector<HTMLButtonElement>("[data-trailwalk-back]");
    const detailsToggle = root.querySelector<HTMLButtonElement>(
        "[data-trailwalk-details-toggle]",
    );
    const detailsPanel = root.querySelector<HTMLElement>(
        "[data-trailwalk-details-panel]",
    );

    if (
        !viewerShell ||
        !galleryGrid ||
        !viewerContainer ||
        !viewerTitle ||
        !poster ||
        !status ||
        !backButton ||
        !detailsToggle ||
        !detailsPanel
    ) {
        return;
    }

    const itemsById = new Map(items.map((item) => [item.id, item]));
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;
    const inlineViewer = window.matchMedia("(max-width: 920px)");
    let activeViewer: ViewerInstance | null = null;
    let activeCard: HTMLAnchorElement | null = null;
    let selectedItem: PublicTrailwalkItem | null = null;
    let selectionToken = 0;

    const setStatus = (message: string) => {
        status.textContent = message;
    };

    const setDetailsOpen = (open: boolean) => {
        detailsPanel.hidden = !open;
        detailsToggle.setAttribute("aria-expanded", String(open));
    };

    const destroyViewer = () => {
        if (activeViewer) {
            activeViewer.destroy();
            activeViewer = null;
        }

        viewerContainer.replaceChildren();
        viewerShell.dataset.viewerReady = "false";
    };

    const placeViewer = (trigger: HTMLAnchorElement) => {
        if (inlineViewer.matches) {
            trigger.insertAdjacentElement("afterend", viewerShell);
            return;
        }

        galleryGrid.insertAdjacentElement("afterend", viewerShell);
    };

    const loadViewer = async (
        item: PublicTrailwalkItem,
        currentToken: number,
    ) => {
        const [{ Viewer }, { GyroscopePlugin }] = await Promise.all([
            import("@photo-sphere-viewer/core"),
            import("@photo-sphere-viewer/gyroscope-plugin"),
            loadViewerCss(),
        ]);

        if (currentToken !== selectionToken) {
            return;
        }

        destroyViewer();
        await nextFrame();

        activeViewer = new Viewer({
            container: viewerContainer,
            panorama: item.assets.panorama,
            caption: item.title,
            defaultYaw: item.initialView?.yaw,
            defaultPitch: item.initialView?.pitch,
            defaultZoomLvl: item.initialView?.zoom,
            plugins: [
                GyroscopePlugin.withConfig({
                    moveMode: "smooth",
                    touchmove: true,
                    roll: true,
                }),
            ],
            navbar: ["zoom", "move", "gyroscope", "fullscreen"],
        });

        viewerShell.dataset.viewerReady = "true";
        setStatus("");
    };

    const selectItem = async (
        item: PublicTrailwalkItem,
        trigger: HTMLAnchorElement,
    ) => {
        selectionToken += 1;
        const currentToken = selectionToken;

        activeCard?.removeAttribute("aria-current");
        trigger.setAttribute("aria-current", "true");
        activeCard = trigger;
        selectedItem = item;

        placeViewer(trigger);
        viewerShell.hidden = false;
        viewerShell.dataset.viewerReady = "false";
        viewerTitle.textContent = item.title;
        poster.src = item.assets.poster || item.assets.fallbackHighlight;
        detailsPanel.innerHTML = renderDetails(item);
        setDetailsOpen(false);
        destroyViewer();
        setStatus("Loading 360 view...");

        viewerShell.scrollIntoView({
            block: "start",
            behavior: reducedMotion ? "auto" : "smooth",
        });

        try {
            await loadViewer(item, currentToken);
        } catch {
            if (currentToken === selectionToken) {
                setStatus(
                    "The 360 viewer could not load. The poster image is still available.",
                );
            }
        }
    };

    cards.forEach((card) => {
        card.addEventListener("click", (event) => {
            const id = card.dataset.trailwalkId;
            const item = id ? itemsById.get(id) : undefined;

            if (!item) {
                return;
            }

            event.preventDefault();
            void selectItem(item, card);
        });
    });

    detailsToggle.addEventListener("click", () => {
        if (!selectedItem) {
            return;
        }

        setDetailsOpen(detailsPanel.hidden);
    });

    backButton.addEventListener("click", () => {
        viewerShell.hidden = true;
        destroyViewer();
        setStatus("");
        setDetailsOpen(false);
        galleryGrid.insertAdjacentElement("afterend", viewerShell);
        activeCard?.focus({ preventScroll: true });
    });
};
