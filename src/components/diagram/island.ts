// Runtime progressive enhancement: attach d3 semantic zoom + per-layer
// drill-in to the already rendered inline SVG. Never re-renders geometry
// (positions stay the canvas's manual coordinates). If this never loads, the
// static high-level SVG remains fully usable.
import * as d3 from 'd3';

const SVGNS = 'http://www.w3.org/2000/svg';
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
  const el = (x: Element) => x as unknown as { dataset: DOMStringMap; style: CSSStyleDeclaration };

  const svg = d3.select(svgEl);
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.6, 5])
    .on('zoom', (ev) => root!.setAttribute('transform', ev.transform.toString()));
  svg.call(zoom as any);

  const animate = (fn: (sel: any) => void) => (reduce() ? fn(svg) : fn(svg.transition().duration(260) as any));

  function zoomTo(bbox: { x: number; y: number; width: number; height: number } | null) {
    const vb = svgEl!.viewBox.baseVal;
    if (!bbox) { animate((s) => s.call(zoom.transform as any, d3.zoomIdentity)); return; }
    const k = Math.min(5, 0.82 / Math.max(bbox.width / vb.width, bbox.height / vb.height));
    const tx = vb.width / 2 - k * (bbox.x + bbox.width / 2) - vb.x;
    const ty = vb.height / 2 - k * (bbox.y + bbox.height / 2) - vb.y;
    animate((s) => s.call(zoom.transform as any, d3.zoomIdentity.translate(tx, ty).scale(k)));
  }

  function drill(layer: string) {
    fig.dataset.drill = layer;
    for (const d of detail) {
      const match = el(d).dataset.layer === layer || el(d).dataset.detailLayer === layer;
      el(d).style.visibility = match ? 'visible' : 'hidden';
      el(d).style.opacity = match ? '1' : '0';
    }
    for (const s of [...summaries, ...layerBoxes]) {
      const l = el(s).dataset.layer;
      el(s).style.opacity = l && l !== layer ? '0.2' : '1';
    }
    const box = layerBoxes.find((b) => el(b).dataset.layer === layer);
    zoomTo(box ? box.getBBox() : null);
  }

  function reset() {
    delete fig.dataset.drill;
    for (const d of detail) { el(d).style.visibility = 'hidden'; el(d).style.opacity = '0'; }
    for (const s of [...summaries, ...layerBoxes]) el(s).style.opacity = '1';
    zoomTo(null);
  }

  // double-click a layer (or a high-level node) drills in; background resets
  svg.selectAll<SVGGElement, unknown>('.yd-layer').on('dblclick', function (ev) {
    ev.stopPropagation();
    drill(el(this).dataset.layer!);
  });
  svg.selectAll<SVGGElement, unknown>('.yd-node[data-lod="0"]').on('dblclick', function (ev) {
    ev.stopPropagation();
    const l = el(this).dataset.layer;
    if (l) drill(l);
  });
  svgEl.addEventListener('dblclick', () => { if (fig.dataset.drill) reset(); });

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
