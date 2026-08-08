// Type-only, so the viewer and its plugin are still fetched on demand rather
// than in the page's first bundle. Mirroring their shapes by hand instead would
// buy nothing and would go stale silently on an upgrade.
import type { PluginConstructor, Viewer } from "@photo-sphere-viewer/core";
import type { GyroscopePlugin } from "@photo-sphere-viewer/gyroscope-plugin";

/**
 * Mirrors `publicPayload` in TrailwalkGallery.astro.
 * It is written out rather than derived from TrailwalkGalleryItem so that
 * widening the source type does not silently widen what the browser is assumed
 * to receive. The two sides meet at a JSON.parse, so nothing checks them
 * against each other; keep them in step by hand.
 */
type PublicPanorama = {
    url: string;
    sizeLabel: string;
};

type PublicTrailwalkItem = {
    id: string;
    title: string;
    locationLabel: string;
    capturedLabel: string;
    altitudeMeters?: number;
    assets: {
        highlight: string;
        highlight2x?: string;
        poster: string;
        panorama: PublicPanorama;
        panoramaHd: PublicPanorama;
        fallbackHighlight: string;
    };
    initialView?: {
        yaw?: string;
        pitch?: string;
        zoom?: number;
    };
    coordinateLabel: string;
    mapsAction: {
        label: string;
        href: string;
    };
};

let viewerCssPromise: Promise<void> | null = null;

const loadViewerCss = () => {
    viewerCssPromise ??= import("@photo-sphere-viewer/core/index.css?url")
        .then(
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
        )
        // TODO(test): no coverage. See tests/TODO.md T7 — after a rejected
        // stylesheet load, the next call must retry rather than reuse the
        // rejected promise.
        .catch((error: unknown) => {
            // Clear the cache so a later selection can retry. Leaving a rejected
            // promise memoized would disable the gallery for the rest of the
            // page's life after one transient stylesheet failure.
            viewerCssPromise = null;
            throw error;
        });

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
    const hdToggle = root.querySelector<HTMLButtonElement>(
        "[data-trailwalk-hd-toggle]",
    );
    const hdSize = root.querySelector<HTMLElement>("[data-trailwalk-hd-size]");

    if (
        !viewerShell ||
        !galleryGrid ||
        !viewerContainer ||
        !viewerTitle ||
        !poster ||
        !status ||
        !backButton ||
        !detailsToggle ||
        !detailsPanel ||
        !hdToggle ||
        !hdSize
    ) {
        return;
    }

    const itemsById = new Map(items.map((item) => [item.id, item]));
    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;
    const inlineViewer = window.matchMedia("(max-width: 920px)");
    let activeViewer: Viewer | null = null;
    let activeCard: HTMLAnchorElement | null = null;
    let selectedItem: PublicTrailwalkItem | null = null;
    let selectionToken = 0;
    // Off on arrival: the HD tier is 2.7-5.4 MB, which is not a cost to put on
    // a reader who has not asked for it. Once asked for, it stays asked for —
    // re-consenting on every card would be the annoying half of a default.
    let hdEnabled = false;
    // Set while a texture is in flight, so the HD control cannot start a second
    // load into a viewer that is still resolving the first.
    let busy = false;

    const setStatus = (message: string) => {
        status.textContent = message;
    };

    const panoramaFor = (item: PublicTrailwalkItem) =>
        hdEnabled ? item.assets.panoramaHd : item.assets.panorama;

    const syncHdControl = () => {
        const item = selectedItem;
        hdToggle.setAttribute("aria-pressed", String(hdEnabled));
        hdToggle.disabled = busy || !item;
        // The separator is text, not a margin: the build minifies the
        // whitespace out of the markup, so a purely visual gap would leave the
        // button reading "HD sample5.0 MB" to anything that takes it as text.
        hdSize.textContent = item
            ? ` · ${item.assets.panoramaHd.sizeLabel}`
            : "";
        hdToggle.setAttribute(
            "aria-label",
            !item
                ? "HD sample"
                : hdEnabled
                  ? `HD sample on. Return to the standard panorama, ${item.assets.panorama.sizeLabel}.`
                  : `HD sample, ${item.assets.panoramaHd.sizeLabel}. Loads the high-resolution panorama.`,
        );
    };

    const setBusy = (value: boolean) => {
        busy = value;
        syncHdControl();
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

    /**
     * Turns the gyroscope on where the device can honour it.
     *
     * A device that needs an explicit motion permission (iOS) will refuse this,
     * because the request has to come from a gesture and the panorama finished
     * loading long after the tap that started it. That refusal is the reason
     * this is fire-and-forget: the navbar gyroscope button is still there, and
     * pressing it asks again from inside a real gesture.
     */
    const startGyroscope = async (
        viewer: Viewer,
        plugin: PluginConstructor,
        currentToken: number,
    ) => {
        const gyroscope: GyroscopePlugin | undefined = viewer.getPlugin(plugin);

        // Checked before starting so that desktop, where the plugin waits ten
        // seconds for a sensor reading that never arrives, does not log a
        // failure the reader cannot act on.
        if (!gyroscope || !(await gyroscope.isSupported())) {
            return;
        }

        if (currentToken !== selectionToken) {
            return;
        }

        await gyroscope.start();
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

        if (currentToken !== selectionToken) {
            return;
        }

        // TODO(test): no coverage. See tests/TODO.md T5 and T6 — a rejecting
        // setPanorama must leave the poster visible with the failure status,
        // and data-viewer-ready must not be set before the texture resolves.
        // The panorama is deliberately not passed to the constructor. Photo
        // Sphere Viewer would then start the load itself with no rejection
        // handler, so a 404/CORS/transient failure becomes an unhandled
        // rejection that no caller can fall back from. Loading it here keeps
        // the failure catchable.
        const viewer: Viewer = new Viewer({
            container: viewerContainer,
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

        activeViewer = viewer;

        // Resolves once the texture is loaded, or false if a newer selection
        // aborted it. Marking the viewer ready before this point hides the
        // poster for the whole download.
        const loaded = await viewer.setPanorama(panoramaFor(item).url);

        if (!loaded || currentToken !== selectionToken) {
            return;
        }

        viewerShell.dataset.viewerReady = "true";
        setStatus("");

        void startGyroscope(viewer, GyroscopePlugin, currentToken).catch(
            () => {},
        );
    };

    /**
     * Swaps tiers inside the running viewer instead of rebuilding it, so the
     * reader keeps the part of the sphere they were looking at — which is
     * usually why they reached for HD in the first place.
     */
    const swapPanoramaTier = async () => {
        const item = selectedItem;
        const viewer = activeViewer;

        if (!item || !viewer) {
            return;
        }

        selectionToken += 1;
        const currentToken = selectionToken;
        const tier = panoramaFor(item);

        setBusy(true);
        setStatus(
            hdEnabled
                ? `Loading HD view (${tier.sizeLabel})...`
                : "Loading standard view...",
        );

        try {
            const loaded = await viewer.setPanorama(tier.url, {
                transition: false,
                position: viewer.getPosition(),
                zoom: viewer.getZoomLevel(),
            });

            if (currentToken !== selectionToken) {
                return;
            }

            if (!loaded) {
                throw new Error("panorama load was superseded");
            }

            setStatus("");
        } catch {
            if (currentToken !== selectionToken) {
                return;
            }

            // The control must not claim a tier the viewer is not showing, so
            // the state goes back to whatever survived the failure.
            hdEnabled = !hdEnabled;
            setStatus(
                "That resolution could not be loaded. The previous view is still shown.",
            );
        } finally {
            if (currentToken === selectionToken) {
                setBusy(false);
            }
        }
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
        // Open by default: the panel is the point of the field sample, and a
        // reader who wants the sphere alone can close it once rather than open
        // it every time.
        setDetailsOpen(true);
        destroyViewer();
        setBusy(true);
        setStatus(`Loading 360 view (${panoramaFor(item).sizeLabel})...`);

        viewerShell.scrollIntoView({
            block: "start",
            behavior: reducedMotion ? "auto" : "smooth",
        });

        try {
            await loadViewer(item, currentToken);
        } catch {
            if (currentToken === selectionToken) {
                // Tear the viewer down so its own error overlay stops covering
                // the poster the message points at.
                destroyViewer();
                setStatus(
                    "The 360 viewer could not load. The poster image is still available.",
                );
            }
        } finally {
            if (currentToken === selectionToken) {
                setBusy(false);
            }
        }
    };

    cards.forEach((card) => {
        card.addEventListener("click", (event) => {
            // Leave modified and non-primary clicks to the browser so the card
            // can still be opened in a new tab or window.
            if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }

            const id = card.dataset.trailwalkId;
            const item = id ? itemsById.get(id) : undefined;

            if (!item) {
                return;
            }

            event.preventDefault();
            void selectItem(item, card);
        });
    });

    hdToggle.addEventListener("click", () => {
        if (busy || !selectedItem) {
            return;
        }

        hdEnabled = !hdEnabled;
        syncHdControl();
        void swapPanoramaTier();
    });

    detailsToggle.addEventListener("click", () => {
        if (!selectedItem) {
            return;
        }

        setDetailsOpen(Boolean(detailsPanel.hidden));
    });

    backButton.addEventListener("click", () => {
        viewerShell.hidden = true;
        destroyViewer();
        setStatus("");
        setDetailsOpen(false);
        galleryGrid.insertAdjacentElement("afterend", viewerShell);
        activeCard?.focus({ preventScroll: true });
    });

    syncHdControl();
};
