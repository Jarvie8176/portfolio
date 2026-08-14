// Runtime progressive enhancement: attach d3 semantic zoom to the already
// rendered inline SVG. Never re-renders geometry (positions stay the canvas's
// manual coordinates). If this never loads, the static SVG remains usable.
import * as d3 from 'd3';

const SVGNS = 'http://www.w3.org/2000/svg';
const reduce = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// scale threshold: below -> overview (per-layer detail dimmed); above -> detail
const DETAIL_K = 1.35;

export function mountDiagram(fig: HTMLElement): void {
  const svgEl = fig.querySelector<SVGSVGElement>('svg.yd-svg');
  if (!svgEl || svgEl.dataset.mounted) return;
  svgEl.dataset.mounted = 'true';

  // wrap the drawing layers in a single zoom root, leaving <defs> untransformed
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

  const detailNodes = Array.from(svgEl.querySelectorAll<SVGGElement>('.yd-node[data-layer="L3"]'));
  const setLOD = (k: number) => {
    const overview = k < DETAIL_K;
    fig.dataset.lod = overview ? 'overview' : 'detail';
    for (const n of detailNodes) n.style.opacity = overview ? '0.45' : '1';
  };
  setLOD(1);

  const svg = d3.select(svgEl);
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.6, 4])
    .on('zoom', (ev) => {
      root!.setAttribute('transform', ev.transform.toString());
      setLOD(ev.transform.k);
    });
  svg.call(zoom as any);

  const animate = (fn: (sel: any) => void) => {
    if (reduce()) fn(svg);
    else fn(svg.transition().duration(240) as any);
  };
  const reset = () => animate((s) => s.call(zoom.transform as any, d3.zoomIdentity));

  // keyboard: +/- zoom, 0 reset, arrows pan (figure is focusable via the hint region)
  fig.tabIndex = 0;
  fig.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=') { animate((s) => s.call(zoom.scaleBy as any, 1.3)); e.preventDefault(); }
    else if (e.key === '-' || e.key === '_') { animate((s) => s.call(zoom.scaleBy as any, 1 / 1.3)); e.preventDefault(); }
    else if (e.key === '0') { reset(); e.preventDefault(); }
    else if (e.key.startsWith('Arrow')) {
      const d = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[e.key]!;
      animate((s) => s.call(zoom.translateBy as any, d[0], d[1])); e.preventDefault();
    }
  });

  // double-click a layer container zooms to fit it (semantic drill-in)
  svg.selectAll<SVGGElement, unknown>('.yd-layer').on('dblclick', function (ev) {
    ev.stopPropagation();
    const bbox = (this as SVGGElement).getBBox();
    const vb = svgEl.viewBox.baseVal;
    const k = Math.min(4, 0.85 / Math.max(bbox.width / vb.width, bbox.height / vb.height));
    const tx = vb.width / 2 - k * (bbox.x + bbox.width / 2);
    const ty = vb.height / 2 - k * (bbox.y + bbox.height / 2);
    animate((s) => s.call(zoom.transform as any, d3.zoomIdentity.translate(tx, ty).scale(k)));
  });
}
