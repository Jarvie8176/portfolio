// Deterministic JSON Canvas -> annotated, styled inline SVG.
// Shared by the Astro build-time base render and the runtime island (which
// attaches to this SVG; it never re-renders geometry). d3 is NOT used here:
// positions are the canvas's manual coordinates (no auto-layout, ever).
import { parseCanvas } from '../../../scripts/diagram/canvas-model.mjs';

const LAYER_COLOR = { L1: '#0e7490', L2: '#334155', L3: '#7c3aed', L4: '#d97706', L5: '#334155' };
const TINT = { L1: '#e7f8fb', L2: '#eef2f7', L3: '#f4ecff', L4: '#fff4e6', L5: '#eef2f7' };
const INK = '#1b1d1f', SOFT = '#5a5e63', FAINT = '#8a8f92', PAPER = '#f6f7f5';
const EDGE = {
  data: { w: 2, dash: '', end: 1, start: 0 },
  authority: { w: 3.4, dash: '', end: 1, start: 0 },
  async: { w: 2, dash: '8 6', end: 1, start: 0 },
  sync: { w: 2.4, dash: '', end: 1, start: 1 },
  funnel: { w: 2.2, dash: '', end: 1, start: 0 },
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const layerColor = (l) => LAYER_COLOR[l] || SOFT;

function nodeCenter(n) { return { cx: n.x + n.w / 2, cy: n.y + n.h / 2 }; }

function shape(n) {
  const c = layerColor(n.layer);
  const { x, y, w, h } = n;
  if (n.type === 'gate') {
    const k = Math.min(w, h) * 0.29;
    const pts = [[x + k, y], [x + w - k, y], [x + w, y + k], [x + w, y + h - k],
      [x + w - k, y + h], [x + k, y + h], [x, y + h - k], [x, y + k]].map((p) => p.join(',')).join(' ');
    const lx = x + w / 2, ly = y + h / 2;
    return `<polygon points="${pts}" fill="#ffe4c4" stroke="${c}" stroke-width="4"/>`
      + `<rect x="${lx - 9}" y="${ly - 2}" width="18" height="14" rx="3" fill="${c}"/>`
      + `<path d="M ${lx - 5} ${ly - 2} v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="${c}" stroke-width="2.2"/>`;
  }
  if (n.type === 'decision') {
    const pts = [[x + w / 2, y], [x + w, y + h / 2], [x + w / 2, y + h], [x, y + h / 2]].map((p) => p.join(',')).join(' ');
    return `<polygon points="${pts}" fill="#ffffff" stroke="${c}" stroke-width="1.6"/>`;
  }
  if (n.type === 'store') {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#ffffff" stroke="${c}" stroke-width="1.6"/>`
      + `<rect x="${x}" y="${y}" width="6" height="${h}" rx="0" fill="${c}"/>`;
  }
  // process (default)
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#ffffff" stroke="${c}" stroke-width="1.5"/>`;
}

function nodeLabel(n) {
  const { cx } = nodeCenter(n);
  const c = layerColor(n.layer);
  const isGate = n.type === 'gate';
  const ty = n.type === 'gate' ? n.y + n.h + 16 : (n.sub ? n.y + n.h / 2 - 4 : n.y + n.h / 2 + 4);
  let s = `<text x="${cx}" y="${ty}" text-anchor="middle" font-size="13" font-weight="600" fill="${isGate ? c : INK}"`
    + `${isGate ? ' letter-spacing="0.5" style="text-transform:uppercase"' : ''}>${esc(n.title)}</text>`;
  if (n.sub && !isGate) s += `<text x="${cx}" y="${n.y + n.h / 2 + 14}" text-anchor="middle" font-size="11" fill="${FAINT}">${esc(n.sub)}</text>`;
  return s;
}

export function renderSvg(canvasInput, opts = {}) {
  const model = parseCanvas(canvasInput);
  const byId = new Map(model.nodes.map((n) => [n.id, n]));
  const all = [...model.nodes, ...model.groups.map((g) => ({ x: g.x, y: g.y, w: g.w, h: g.h }))];
  const minX = Math.min(...all.map((n) => n.x)) - 40;
  const minY = Math.min(...all.map((n) => n.y)) - 40;
  const maxX = Math.max(...all.map((n) => n.x + n.w)) + 40;
  const maxY = Math.max(...all.map((n) => n.y + n.h)) + 40;
  const W = maxX - minX, H = maxY - minY;

  const kinds = [...new Set(model.edges.map((e) => e.kind))];
  const markers = kinds.map((k) => {
    const color = '#9aa0a6';
    return `<marker id="arw-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker>`;
  }).join('');

  // groups (back, dashed containers) + layer labels
  const groups = model.groups.map((g) => {
    const c = layerColor(g.layer);
    return `<g data-layer="${esc(g.layer)}" class="yd-layer">`
      + `<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="16" fill="${TINT[g.layer] || '#f3f3f2'}" fill-opacity="0.4" stroke="${c}" stroke-width="1.2" stroke-dasharray="7 5"/>`
      + `<text x="${g.x + 14}" y="${g.y + 22}" font-size="11" font-weight="800" letter-spacing="0.8" fill="${c}" style="text-transform:uppercase">${esc(g.label)}</text>`
      + `</g>`;
  }).join('');

  // edges (behind nodes), colored by source layer
  const edges = model.edges.map((e) => {
    const a = byId.get(e.from), b = byId.get(e.to);
    if (!a || !b) return '';
    const p = nodeCenter(a), q = nodeCenter(b);
    const spec = EDGE[e.kind] || EDGE.data;
    const col = layerColor(a.layer);
    const attrs = `stroke="${col}" stroke-width="${spec.w}"${spec.dash ? ` stroke-dasharray="${spec.dash}"` : ''}`
      + ` marker-end="url(#arw-${e.kind})"${spec.start ? ` marker-start="url(#arw-${e.kind})"` : ''}`;
    return `<g data-edge="${esc(e.from)}-&gt;${esc(e.to)}" data-kind="${esc(e.kind)}" class="yd-edge"><line x1="${p.cx}" y1="${p.cy}" x2="${q.cx}" y2="${q.cy}" ${attrs}/></g>`;
  }).join('');

  // nodes (front)
  const nodes = model.nodes.map((n) =>
    `<g data-node="${esc(n.id)}" data-type="${esc(n.type)}" data-layer="${esc(n.layer || '')}" class="yd-node" tabindex="0">`
    + `<title>${esc(n.title)}</title>${shape(n)}${nodeLabel(n)}</g>`).join('');

  const title = opts.title || 'architecture diagram';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${W} ${H}" role="img" aria-label="${esc(title)}" class="yd-svg" font-family="var(--sans, system-ui, sans-serif)">`
    + `<defs>${markers}</defs>`
    + `<g class="yd-groups">${groups}</g><g class="yd-edges">${edges}</g><g class="yd-nodes">${nodes}</g>`
    + `</svg>`;
  return { svg, model, viewBox: [minX, minY, W, H] };
}
