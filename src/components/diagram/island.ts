// Runtime interaction layer: attach d3 semantic zoom + per-layer drill-in to
// the already rendered inline SVG. Never re-renders geometry (positions stay
// the canvas's manual coordinates).
import * as d3 from 'd3';

const SVGNS = 'http://www.w3.org/2000/svg';
const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const FIT_PADDING = 0.62;
const reduce = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mountDiagram(fig: HTMLElement): void {
  const svgEl = fig.querySelector<SVGSVGElement>('svg.yd-svg');
  if (!svgEl || svgEl.dataset.mounted) return;
  svgEl.dataset.mounted = 'true';

  // wrap the drawing layers in one zoom root, leaving <defs> untransformed
  let root = svgEl.querySelector<SVGGElement>('g.yd-zoom');
  if (!root) {
    root = document.createElementNS(SVGNS, 'g');
    root.setAttribute('class', 'yd-zoom');
    for (const child of Array.from(svgEl.children)) {
      if (child.tagName.toLowerCase() === 'defs') continue;
      root.appendChild(child);
    }
    svgEl.appendChild(root);
  }

  const detail = Array.from(svgEl.querySelectorAll<SVGGElement>('[data-lod="1"]'));
  const summaries = Array.from(svgEl.querySelectorAll<SVGGElement>('.yd-node[data-lod="0"]'));
  const layerBoxes = Array.from(svgEl.querySelectorAll<SVGGElement>('.yd-layer'));
  const drillButtons = Array.from(fig.querySelectorAll<HTMLButtonElement>('[data-yd-drill-layer]'));
  const showAllButtons = Array.from(fig.querySelectorAll<HTMLButtonElement>('[data-yd-show-all]'));
  const resetButtons = Array.from(fig.querySelectorAll<HTMLButtonElement>('[data-yd-reset]'));
  const zoomButtons = Array.from(fig.querySelectorAll<HTMLButtonElement>('[data-yd-zoom]'));
  const panButtons = Array.from(fig.querySelectorAll<HTMLButtonElement>('[data-yd-pan]'));
  const fitButtons = Array.from(fig.querySelectorAll<HTMLButtonElement>('[data-yd-fit]'));
  const status = fig.querySelector<HTMLElement>('[data-yd-status]');
  const el = (x: Element) => x as unknown as { dataset: DOMStringMap; style: CSSStyleDeclaration };
  const drillableLayerCodes = drillButtons
    .map((button) => button.dataset.ydDrillLayer)
    .filter((layer): layer is string => Boolean(layer));
  const drillableLayers = new Set<string>(drillableLayerCodes);
  const activeLayers = new Set<string>();
  let currentTransform = d3.zoomIdentity;

  const svg = d3.select(svgEl);
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([MIN_ZOOM, MAX_ZOOM])
    .on('zoom', (ev) => {
      currentTransform = ev.transform;
      root!.setAttribute('transform', ev.transform.toString());
      updateControls();
    });
  svg.call(zoom as any);
  svg.on('dblclick.zoom', null);

  const animate = (fn: (sel: any) => void) => (reduce() ? fn(svg) : fn(svg.transition().duration(260) as any));

  function transformIsIdentity() {
    return (
      Math.abs(currentTransform.k - 1) < 0.001
      && Math.abs(currentTransform.x) < 0.5
      && Math.abs(currentTransform.y) < 0.5
    );
  }

  function orderedActiveLayers() {
    return drillableLayerCodes.filter((layer) => activeLayers.has(layer));
  }

  function updateControls() {
    const active = orderedActiveLayers();
    const allActive =
      drillableLayers.size > 0
      && [...drillableLayers].every((layer) => activeLayers.has(layer));
    for (const button of drillButtons) {
      button.setAttribute('aria-pressed', String(activeLayers.has(button.dataset.ydDrillLayer || '')));
    }
    for (const button of showAllButtons) {
      button.setAttribute('aria-pressed', String(allActive));
    }
    for (const button of zoomButtons) {
      if (button.dataset.ydZoom === 'out') button.disabled = currentTransform.k <= MIN_ZOOM + 0.001;
      else if (button.dataset.ydZoom === 'in') button.disabled = currentTransform.k >= MAX_ZOOM - 0.001;
    }
    for (const button of resetButtons) {
      button.disabled = active.length === 0 && transformIsIdentity();
    }
    if (status) {
      if (allActive) status.textContent = 'All layer detail active';
      else if (active.length > 1) status.textContent = `${active.join(', ')} detail active`;
      else if (active.length === 1) status.textContent = `${active[0]} detail active`;
      else status.textContent = transformIsIdentity() ? 'High-level view' : 'Adjusted view';
    }
  }

  function zoomTo(bbox: { x: number; y: number; width: number; height: number } | null) {
    const vb = svgEl!.viewBox.baseVal;
    if (!bbox) { animate((s) => s.call(zoom.transform as any, d3.zoomIdentity)); return; }
    const desiredK = FIT_PADDING / Math.max(bbox.width / vb.width, bbox.height / vb.height);
    if (desiredK <= MIN_ZOOM) {
      animate((s) => s.call(zoom.transform as any, d3.zoomIdentity));
      return;
    }
    const k = Math.min(MAX_ZOOM, desiredK);
    const tx = vb.x + vb.width / 2 - k * (bbox.x + bbox.width / 2);
    const ty = vb.y + vb.height / 2 - k * (bbox.y + bbox.height / 2);
    animate((s) => s.call(zoom.transform as any, d3.zoomIdentity.translate(tx, ty).scale(k)));
  }

  function unionBox(boxes: Array<{ x: number; y: number; width: number; height: number }>) {
    if (!boxes.length) return null;
    const x1 = Math.min(...boxes.map((box) => box.x));
    const y1 = Math.min(...boxes.map((box) => box.y));
    const x2 = Math.max(...boxes.map((box) => box.x + box.width));
    const y2 = Math.max(...boxes.map((box) => box.y + box.height));
    return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }

  function activeLayerBox() {
    return unionBox(
      [...activeLayers]
        .map((layer) => layerBoxes.find((box) => el(box).dataset.layer === layer))
        .filter((box): box is SVGGElement => Boolean(box))
        .map((box) => box.getBBox()),
    );
  }

  function updateLayerVisibility() {
    const matched: SVGGElement[] = [];
    for (const d of detail) {
      const layer = el(d).dataset.layer;
      const detailLayer = el(d).dataset.detailLayer;
      const match =
        Boolean(layer && activeLayers.has(layer))
        || Boolean(detailLayer && activeLayers.has(detailLayer));
      el(d).style.visibility = match ? 'visible' : 'hidden';
      el(d).style.opacity = match ? '1' : '0';
      if (match) d.dataset.layerActive = 'true';
      else delete d.dataset.layerActive;
      if (match) matched.push(d);
    }
    for (const d of matched) d.parentElement?.appendChild(d);
    for (const s of [...summaries, ...layerBoxes]) {
      const l = el(s).dataset.layer;
      el(s).style.opacity = activeLayers.size && l && !activeLayers.has(l) ? '0.2' : '1';
    }
    if (activeLayers.size) fig.dataset.activeLayers = orderedActiveLayers().join(' ');
    else delete fig.dataset.activeLayers;
    updateControls();
  }

  function fitActiveLayers() {
    zoomTo(activeLayerBox());
  }

  function toggleLayer(layer: string) {
    if (!drillableLayers.has(layer)) return;
    if (activeLayers.has(layer)) activeLayers.delete(layer);
    else activeLayers.add(layer);
    updateLayerVisibility();
  }

  function showAllLayers() {
    for (const layer of drillableLayers) activeLayers.add(layer);
    updateLayerVisibility();
    zoomTo(null);
  }

  function reset() {
    activeLayers.clear();
    updateLayerVisibility();
    zoomTo(null);
  }

  for (const button of drillButtons) {
    button.addEventListener('click', () => toggleLayer(button.dataset.ydDrillLayer || ''));
  }
  for (const button of showAllButtons) {
    button.addEventListener('click', () => showAllLayers());
  }
  for (const button of resetButtons) {
    button.addEventListener('click', () => reset());
  }
  for (const button of zoomButtons) {
    button.addEventListener('click', () => {
      const factor = button.dataset.ydZoom === 'in' ? 1.25 : 1 / 1.25;
      animate((s) => s.call(zoom.scaleBy as any, factor));
    });
  }
  const panDelta: Record<string, [number, number]> = {
    left: [48, 0],
    right: [-48, 0],
    up: [0, 48],
    down: [0, -48],
  };
  for (const button of panButtons) {
    button.addEventListener('click', () => {
      const delta = panDelta[button.dataset.ydPan || ''];
      if (delta) animate((s) => s.call(zoom.translateBy as any, delta[0], delta[1]));
    });
  }
  for (const button of fitButtons) {
    button.addEventListener('click', () => fitActiveLayers());
  }
  updateLayerVisibility();

  // Double-click toggles layer detail only; pan/zoom stays explicit in controls.
  svg.selectAll<SVGGElement, unknown>('.yd-layer').on('dblclick', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    toggleLayer(el(this).dataset.layer!);
  });
  svg.selectAll<SVGGElement, unknown>('.yd-node[data-lod="0"]').on('dblclick', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const l = el(this).dataset.layer;
    if (l) toggleLayer(l);
  });

  // keyboard: +/- zoom, 0 reset (zoom + drill), arrows pan
  fig.tabIndex = 0;
  fig.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=') { animate((s) => s.call(zoom.scaleBy as any, 1.3)); e.preventDefault(); }
    else if (e.key === '-' || e.key === '_') { animate((s) => s.call(zoom.scaleBy as any, 1 / 1.3)); e.preventDefault(); }
    else if (e.key === '0' || e.key === 'Escape') { reset(); e.preventDefault(); }
    else if (e.key.startsWith('Arrow')) {
      const d = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[e.key]!;
      animate((s) => s.call(zoom.translateBy as any, d[0], d[1])); e.preventDefault();
    }
  });
}
